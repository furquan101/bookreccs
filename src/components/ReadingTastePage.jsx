import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { searchBooks } from '../services/googleBooks';
import { getRecommendationsForTasteProfile, getTasteProfileMetadata } from '../services/readingTaste';
import SEOHead from './SEOHead';
import Header from './Header';

export default function ReadingTastePage() {
    const { profile } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [books, setBooks] = useState([]);
    const [booksWithDetails, setBooksWithDetails] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [metadata, setMetadata] = useState({
        title: "Your Reading Recommendations",
        description: "Personalized book recommendations based on your reading taste."
    });

    // Get selected books from location state (passed from recommendation flow)
    const selectedBooks = location.state?.selectedBooks || [];

    useEffect(() => {
        if (!profile) return;

        const fetchRecommendations = async () => {
            setIsLoading(true);
            try {
                // Get metadata (title and description)
                const meta = await getTasteProfileMetadata(profile, selectedBooks);
                setMetadata(meta);

                // Get book recommendations
                const recommendations = await getRecommendationsForTasteProfile(selectedBooks, profile);
                setBooks(recommendations);

                // Fetch book details from Google Books
                const detailsPromises = recommendations.map(async (book) => {
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
                console.error("Error fetching recommendations:", error);
                setBooks([]);
                setBooksWithDetails([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecommendations();
    }, [profile, selectedBooks]);

    const pageUrl = `https://bookreccs.netlify.app/reading-taste/${profile}`;
    const keywords = metadata.title 
        ? `${metadata.title.toLowerCase()}, book recommendations, reading taste, ${profile.replace(/-/g, ' ')} books, personalized reading list`
        : 'book recommendations, reading taste, personalized reading list';

    return (
        <>
            <SEOHead
                title={metadata.title ? `${metadata.title} | Book Reccs` : "Your Reading Recommendations | Book Reccs"}
                description={metadata.description || "Personalized book recommendations based on your reading taste."}
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
                        onClick={() => {
                            // Check if we came from the modal (via state) or directly
                            if (location.state?.fromModal) {
                                navigate(-1);
                            } else {
                                navigate('/');
                            }
                        }}
                        className="bg-black/50 backdrop-blur-sm p-2 rounded-[7px] border border-white/10 text-white/80 hover:bg-white/10 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                        aria-label="Go back"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                </div>
                <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12 pt-24">

                {/* Header - SEO Optimized */}
                <div className="text-center mb-8">
                    {isLoading ? (
                        <div className="animate-pulse space-y-4">
                            <div className="h-12 bg-gray-800 rounded w-3/4 mx-auto"></div>
                            <div className="h-6 bg-gray-800 rounded w-2/3 mx-auto"></div>
                        </div>
                    ) : (
                        <>
                            <h1 className="text-3xl md:text-4xl font-serif text-white mb-3">
                                {metadata.title || "Your Reading Recommendations"}
                            </h1>
                            <p className="text-sm md:text-base text-gray-400 font-sans max-w-3xl mx-auto mb-6">
                                {metadata.description || "Personalized book recommendations based on your reading taste."}
                            </p>
                            {/* SEO Content - Hidden visually but readable by search engines */}
                            <div className="hidden">
                                <p>Discover {booksWithDetails.length || 10} carefully curated book recommendations based on reading taste, themes, and writing style. These books share similar emotional depth, narrative style, and reader appeal. Find your next favorite read from this personalized selection.</p>
                            </div>
                        </>
                    )}
                </div>

                {/* Books Grid - Compact for SEO */}
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-6">
                        {[...Array(12)].map((_, index) => (
                            <div key={index} className="bg-[#181818] rounded-lg border border-[#3C3C3C] overflow-hidden flex flex-col animate-pulse">
                                <div className="relative w-full aspect-[5/6] bg-[#0f0f0f]"></div>
                                <div className="p-2 space-y-1.5">
                                    <div className="h-3 bg-gray-700 rounded w-full"></div>
                                    <div className="h-2 bg-gray-700 rounded w-3/4"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : booksWithDetails.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-6">
                        {booksWithDetails.map((book, index) => (
                            <Link
                                key={index}
                                to={`/book/${encodeURIComponent(book.title)}/${encodeURIComponent(book.author)}`}
                                className="group bg-[#181818] rounded-lg border border-[#3C3C3C] hover:border-[#3C3C3C] transition-all duration-300 overflow-hidden flex flex-col"
                            >
                                {/* Book Cover - Shorter */}
                                <div className="relative w-full aspect-[5/6] bg-[#0f0f0f] overflow-hidden">
                                    {book.cover ? (
                                        <>
                                            <img
                                                src={book.cover}
                                                alt={`${book.title} by ${book.author}`}
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
                                                <BookOpen className="w-6 h-6 text-gray-600" />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <BookOpen className="w-6 h-6 text-gray-600" />
                                        </div>
                                    )}
                                </div>

                                {/* Book Info - Compact */}
                                <div className="p-4 flex flex-col">
                                    <h3 className="text-base font-sans text-white mb-2 group-hover:text-gray-200 transition-colors line-clamp-2 leading-tight">
                                        {book.title}
                                    </h3>
                                    <p className="text-sm text-gray-400 font-sans line-clamp-1 mb-2">
                                        by {book.author}
                                    </p>
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
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-400">No recommendations found. Try selecting different books.</p>
                        <Link
                            to="/"
                            className="inline-block mt-4 text-white hover:text-gray-200 transition-colors"
                        >
                            Go back and try again
                        </Link>
                    </div>
                )}
                </div>
            </div>
        </>
    );
}
