import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import BookCoverImg from './BookCoverImg';
import { getCategoryBySlug } from '../data/categoryBooks';
import { searchBooks } from '../services/googleBooks';
import { titleToSlug } from '../utils/slugUtils';
import SEOHead from './SEOHead';
import Header from './Header';

export default function CategoryBooksPage() {
    const { category } = useParams();
    const navigate = useNavigate();
    const [categoryData, setCategoryData] = useState(null);
    const [booksWithDetails, setBooksWithDetails] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!category) return;

        const data = getCategoryBySlug(category);
        if (!data) {
            setIsLoading(false);
            return;
        }

        setCategoryData(data);

        // Fetch book details for all books in the category
        const fetchBookDetails = async () => {
            setIsLoading(true);
            try {
                const detailsPromises = data.books.map(async (book) => {
                    try {
                        const results = await searchBooks(`${book.title} ${book.author}`);
                        if (results.length > 0) {
                            return {
                                ...book,
                                ...results[0],
                                reason: book.reason
                            };
                        }
                        return book;
                    } catch (error) {
                        console.error(`Error fetching details for ${book.title}:`, error);
                        return book;
                    }
                });

                const details = await Promise.all(detailsPromises);
                setBooksWithDetails(details);
            } catch (error) {
                console.error("Error fetching book details:", error);
                setBooksWithDetails(data.books);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBookDetails();
    }, [category]);

    if (isLoading) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-background text-white">
                <div className="animate-pulse text-center">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-400">Loading books...</p>
                </div>
            </div>
        );
    }

    if (!categoryData) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-background text-white">
                <div className="text-center">
                    <h1 className="text-3xl font-serif mb-4">Category Not Found</h1>
                    <p className="text-gray-400 mb-8">The category you're looking for doesn't exist.</p>
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-sans">Back to Home</span>
                    </Link>
                </div>
            </div>
        );
    }

    const pageUrl = `https://bookreccs.netlify.app/best-books-for/${category}`;
    const keywords = categoryData.title 
        ? `${categoryData.title.toLowerCase()}, book recommendations, best books, ${category.replace(/-/g, ' ')} reading list`
        : 'book recommendations, best books, reading list';

    return (
        <>
            <SEOHead
                title={`${categoryData.title} | Book Reccs`}
                description={categoryData.description}
                keywords={keywords}
                url={pageUrl}
                image="https://bookreccs.netlify.app/book-reccs-cover.png"
                type="website"
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

                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white mb-4">
                        {categoryData.title}
                    </h1>
                    <p className="text-lg md:text-xl text-gray-400 font-sans max-w-3xl mx-auto">
                        {categoryData.description}
                    </p>
                </div>

                {/* Books Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-6">
                    {booksWithDetails.map((book, index) => (
                        <div
                            key={index}
                            className="group bg-[#181818] rounded-lg border border-[#3C3C3C] hover:border-[#3C3C3C] transition-all duration-300 overflow-hidden flex flex-col h-full"
                        >
                            <Link
                                to={`/book/${encodeURIComponent(book.title)}/${encodeURIComponent(book.author)}`}
                                className="flex flex-col h-full"
                            >
                            {/* Book Cover */}
                            <div className="relative w-full aspect-[5/6] bg-[#0f0f0f] overflow-hidden">
                                <BookCoverImg
                                    src={book.cover}
                                    fallbackSrc={book.coverFallback}
                                    alt={book.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    loading="lazy"
                                />
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

                                {/* Reason */}
                                {book.reason && (
                                    <p className="text-sm text-gray-300 font-sans leading-relaxed mt-auto pt-3 border-t border-[#3C3C3C]">
                                        {book.reason}
                                    </p>
                                )}
                            </div>
                            </Link>
                            
                            {/* Link to Books Like page */}
                            <Link
                                to={`/books-like/${titleToSlug(book.title)}`}
                                className="px-4 pb-4 text-xs text-gray-400 hover:text-white font-sans transition-colors"
                            >
                                Find books like this →
                            </Link>
                        </div>
                    ))}
                </div>
                </div>
            </div>
        </>
    );
}
