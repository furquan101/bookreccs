import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { searchBooks } from '../services/googleBooks';
import { getBooksLike } from '../services/booksLike';
import { slugToTitle } from '../utils/slugUtils';
import SEOHead from './SEOHead';
import Header from './Header';

export default function BooksLikePage() {
    const { bookSlug } = useParams();
    const navigate = useNavigate();
    const [bookTitle, setBookTitle] = useState('');
    const [bookAuthor, setBookAuthor] = useState('');
    const [bookDetails, setBookDetails] = useState(null);
    const [similarBooks, setSimilarBooks] = useState([]);
    const [similarBooksDetails, setSimilarBooksDetails] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!bookSlug) return;

        const fetchBookAndSimilar = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // Convert slug to title
                const title = slugToTitle(bookSlug);
                setBookTitle(title);

                // Search for the book to get full details
                const searchResults = await searchBooks(title);
                
                if (searchResults.length === 0) {
                    setError(`Book "${title}" not found`);
                    setIsLoading(false);
                    return;
                }

                const book = searchResults[0];
                setBookDetails(book);
                setBookTitle(book.title);
                setBookAuthor(book.author || '');

                // Get similar books using Gemini (12 books for SEO pages)
                const similar = await getBooksLike(
                    book.title,
                    book.author || '',
                    [book.title]
                );

                if (!similar || similar.length === 0) {
                    setSimilarBooks([]);
                    setSimilarBooksDetails([]);
                    setIsLoading(false);
                    return;
                }

                setSimilarBooks(similar);

                // Fetch book details for similar books
                const detailsPromises = similar.map(async (similarBook) => {
                    try {
                        const results = await searchBooks(`${similarBook.title} ${similarBook.author}`);
                        return results.length > 0 
                            ? { ...similarBook, ...results[0] }
                            : similarBook;
                    } catch (error) {
                        console.error(`Error fetching details for ${similarBook.title}:`, error);
                        return similarBook;
                    }
                });

                const details = await Promise.all(detailsPromises);
                setSimilarBooksDetails(details);
            } catch (err) {
                console.error("Error fetching book and similar books:", err);
                setError("Failed to load books. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchBookAndSimilar();
    }, [bookSlug]);

    const pageUrl = `https://bookreccs.netlify.app/books-like/${bookSlug}`;
    const seoTitle = `${similarBooksDetails.length || 12} Books Like ${bookTitle} (Based on Reading Taste, Not Genre) | Book Reccs`;
    const seoDescription = `Discover ${similarBooksDetails.length || 12} books like ${bookTitle}${bookAuthor ? ` by ${bookAuthor}` : ''}. These recommendations are based on reading taste and themes, not just genre. Find your next favorite read!`;
    const keywords = `books like ${bookTitle}, similar books to ${bookTitle}, ${bookTitle} recommendations, books similar to ${bookTitle}, reading recommendations`;

    return (
        <>
            <SEOHead
                title={seoTitle}
                description={seoDescription}
                keywords={keywords}
                url={pageUrl}
                image={bookDetails?.cover || 'https://bookreccs.netlify.app/book-reccs-cover.png'}
                type="article"
            />
            <div className="min-h-screen w-full bg-background text-white">
                <Header showTitle={false} />
                {/* Back Arrow */}
                <div className="fixed top-6 left-6 z-50">
                    <button
                        onClick={() => navigate('/')}
                        className="bg-black/50 backdrop-blur-sm p-2 rounded-[7px] border border-white/10 text-white/80 hover:bg-white/10 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                        aria-label="Go back"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                </div>
                <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12 pt-24">

                    {error ? (
                        <div className="text-center py-12">
                            <h1 className="text-3xl font-serif mb-4">Book Not Found</h1>
                            <p className="text-gray-400 mb-8">{error}</p>
                            <Link
                                to="/"
                                className="inline-block text-white hover:text-gray-200 transition-colors"
                            >
                                Go back to home
                            </Link>
                        </div>
                    ) : (
                        <>
                            {/* Header */}
                            <div className="text-center mb-12">
                                {isLoading ? (
                                    <div className="animate-pulse space-y-4">
                                        <div className="h-12 bg-gray-800 rounded w-3/4 mx-auto"></div>
                                        <div className="h-6 bg-gray-800 rounded w-2/3 mx-auto"></div>
                                    </div>
                                ) : (
                                    <>
                                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white mb-4">
                                            If You Loved <span className="italic">{bookTitle}</span>, You'll Probably Love These Books
                                        </h1>
                                        {bookAuthor && (
                                            <p className="text-lg md:text-xl text-gray-400 font-sans mb-4">
                                                by {bookAuthor}
                                            </p>
                                        )}
                                        <p className="text-base md:text-lg text-gray-300 font-sans max-w-3xl mx-auto">
                                            These recommendations are based on reading taste, themes, and writing style—not just genre. 
                                            Discover books that share the same energy and appeal as {bookTitle}.
                                        </p>
                                    </>
                                )}
                            </div>

                            {/* Original Book Card */}
                            {bookDetails && !isLoading && (
                                <div className="mb-12 flex justify-center">
                                    <Link
                                        to={`/book/${encodeURIComponent(bookTitle)}/${encodeURIComponent(bookAuthor)}`}
                                        className="group bg-[#181818] rounded-lg border border-[#3C3C3C] hover:border-[#3C3C3C] transition-all duration-300 overflow-hidden flex flex-col max-w-xs"
                                    >
                                        <div className="relative w-full aspect-[2/3] bg-[#0f0f0f] overflow-hidden">
                                            {bookDetails.cover ? (
                                                <>
                                                    <img
                                                        src={bookDetails.cover}
                                                        alt={bookTitle}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        loading="lazy"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            const fallback = e.target.nextElementSibling;
                                                            if (fallback) {
                                                                fallback.style.display = 'flex';
                                                            }
                                                        }}
                                                    />
                                                    <div className="w-full h-full flex items-center justify-center hidden">
                                                        <BookOpen className="w-16 h-16 text-gray-600" />
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <BookOpen className="w-16 h-16 text-gray-600" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4 flex flex-col flex-1">
                                            <h3 className="text-lg font-serif text-white mb-2 group-hover:text-gray-200 transition-colors">
                                                {bookTitle}
                                            </h3>
                                            {bookAuthor && (
                                                <p className="text-sm text-gray-400 font-sans">
                                                    by {bookAuthor}
                                                </p>
                                            )}
                                        </div>
                                    </Link>
                                </div>
                            )}

                            {/* Similar Books Grid */}
                            {isLoading ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-6">
                                    {[...Array(9)].map((_, index) => (
                                        <div key={index} className="bg-[#181818] rounded-lg border border-[#3C3C3C] overflow-hidden flex flex-col animate-pulse">
                                            <div className="relative w-full aspect-[5/6] bg-[#0f0f0f]"></div>
                                            <div className="p-2 space-y-1.5">
                                                <div className="h-3 bg-gray-700 rounded w-full"></div>
                                                <div className="h-2 bg-gray-700 rounded w-3/4"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : similarBooksDetails.length > 0 ? (
                                <>
                                    <h2 className="text-2xl md:text-3xl font-serif text-white mb-6 text-center">
                                        {similarBooksDetails.length} Books Like {bookTitle}
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-6">
                                        {similarBooksDetails.map((book, index) => (
                                            <Link
                                                key={index}
                                                to={`/book/${encodeURIComponent(book.title)}/${encodeURIComponent(book.author)}`}
                                                className="group bg-[#181818] rounded-lg border border-[#3C3C3C] hover:border-[#3C3C3C] transition-all duration-300 overflow-hidden flex flex-col h-full"
                                            >
                                                {/* Book Cover */}
                                                <div className="relative w-full aspect-[5/6] bg-[#0f0f0f] overflow-hidden">
                                                    {book.cover ? (
                                                        <>
                                                            <img
                                                                src={book.cover}
                                                                alt={book.title}
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                                loading="lazy"
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                    const fallback = e.target.nextElementSibling;
                                                                    if (fallback) {
                                                                        fallback.style.display = 'flex';
                                                                    }
                                                                }}
                                                            />
                                                            <div className="w-full h-full flex items-center justify-center hidden">
                                                                <BookOpen className="w-16 h-16 text-gray-600" />
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <BookOpen className="w-16 h-16 text-gray-600" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Book Info */}
                                                <div className="p-4 flex flex-col flex-1">
                                                    <h3 className="text-base font-sans text-white mb-2 group-hover:text-gray-200 transition-colors line-clamp-2 leading-tight">
                                                        {book.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-400 font-sans line-clamp-1 mb-2">
                                                        by {book.author}
                                                    </p>

                                                    {/* Rating */}
                                                    {book.rating && (
                                                        <div className="flex items-center gap-1">
                                                            <svg className="w-3.5 h-3.5 text-yellow-500 fill-current" viewBox="0 0 20 20">
                                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                            </svg>
                                                            <span className="text-sm text-gray-400 font-sans">
                                                                {book.rating}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-gray-400">No similar books found. Try a different book.</p>
                                    <Link
                                        to="/"
                                        className="inline-block mt-4 text-white hover:text-gray-200 transition-colors"
                                    >
                                        Go back to home
                                    </Link>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
