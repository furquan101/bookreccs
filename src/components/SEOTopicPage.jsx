import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { getSEOTopicBySlug } from '../data/seoTopics';
import { getBooksForSEOTopic, enrichSEOTopicBooks } from '../services/seoTopicBooks';
import { titleToSlug } from '../utils/slugUtils';
import SEOHead from './SEOHead';
import Header from './Header';

export default function SEOTopicPage() {
    const { topicSlug } = useParams();
    const navigate = useNavigate();
    const [topicData, setTopicData] = useState(null);
    const [booksWithDetails, setBooksWithDetails] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!topicSlug) return;

        const data = getSEOTopicBySlug(topicSlug);
        if (!data) {
            setIsLoading(false);
            return;
        }

        setTopicData(data);

        // Fetch books for this SEO topic
        const fetchBooks = async () => {
            setIsLoading(true);
            try {
                // Get books from AI based on the topic title
                const books = await getBooksForSEOTopic(data.title, 12);
                
                if (books.length > 0) {
                    // Enrich books with details from Google Books
                    const enrichedBooks = await enrichSEOTopicBooks(books);
                    setBooksWithDetails(enrichedBooks);
                } else {
                    setBooksWithDetails([]);
                }
            } catch (error) {
                console.error("Error fetching SEO topic books:", error);
                setBooksWithDetails([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBooks();
    }, [topicSlug]);

    if (isLoading) {
        return (
            <>
                <SEOHead
                    title={topicData?.seoTitle || 'Loading... | Book Reccs'}
                    description={topicData?.description || 'Loading book recommendations...'}
                    keywords={topicData?.keywords || 'book recommendations'}
                    url={`https://bookreccs.netlify.app/seo-topic/${topicSlug}`}
                    image="https://bookreccs.netlify.app/book-reccs-cover.png"
                    type="website"
                />
                <div className="min-h-screen w-full flex items-center justify-center bg-background text-white">
                    <div className="animate-pulse text-center">
                        <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                        <p className="text-gray-400">Loading books...</p>
                    </div>
                </div>
            </>
        );
    }

    if (!topicData) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-background text-white">
                <div className="text-center">
                    <h1 className="text-3xl font-serif mb-4">Topic Not Found</h1>
                    <p className="text-gray-400 mb-8">The topic you're looking for doesn't exist.</p>
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

    const pageUrl = `https://bookreccs.netlify.app/seo-topic/${topicSlug}`;

    return (
        <>
            <SEOHead
                title={topicData.seoTitle}
                description={topicData.description}
                keywords={topicData.keywords}
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
                        {topicData.title}
                    </h1>
                    <p className="text-lg md:text-xl text-gray-400 font-sans max-w-3xl mx-auto">
                        {topicData.description}
                    </p>
                </div>

                {/* Books Grid */}
                {booksWithDetails.length > 0 ? (
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
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-400 font-sans">No books found for this topic.</p>
                    </div>
                )}
                </div>
            </div>
        </>
    );
}
