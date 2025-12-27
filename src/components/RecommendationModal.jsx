import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { X, RefreshCw, RotateCcw, BookOpen, ExternalLink } from 'lucide-react';
import { searchBooks } from '../services/googleBooks';
import { searchBookVideos } from '../services/youtube';
import { getSimilarBooks } from '../services/gemini';
import VideoCarousel from './VideoCarousel';

export default function RecommendationModal({ recommendation, onClose, onReset, onRetry }) {
    const [bookDetails, setBookDetails] = React.useState(null);
    const [videos, setVideos] = React.useState([]);
    const [videosLoading, setVideosLoading] = React.useState(true);
    const [similarBooks, setSimilarBooks] = React.useState([]);
    const [similarBooksLoading, setSimilarBooksLoading] = React.useState(true);
    const [similarBooksDetails, setSimilarBooksDetails] = React.useState([]);

    useEffect(() => {
        if (!recommendation) return;

        // Handle escape key to close modal
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);

        // Trigger confetti only if NOT trending
        if (!recommendation.isTrending) {
            const duration = 3000;
            const end = Date.now() + duration;

            const frame = () => {
                confetti({
                    particleCount: 2,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#ffffff', '#a8a8a8', '#555555']
                });
                confetti({
                    particleCount: 2,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#ffffff', '#a8a8a8', '#555555']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            };
            frame();
        }

        // Fetch cover and rating for the recommended book
        const fetchDetails = async () => {
            if (recommendation?.title) {
                const results = await searchBooks(`${recommendation.title} ${recommendation.author}`);
                if (results.length > 0) {
                    setBookDetails(results[0]);
                }
            }
        };
        fetchDetails();

        // Fetch YouTube videos about the book
        const fetchVideos = async () => {
            if (recommendation?.title && recommendation?.author) {
                setVideosLoading(true);
                const videoResults = await searchBookVideos(
                    recommendation.title,
                    recommendation.author,
                    6
                );
                setVideos(videoResults);
                setVideosLoading(false);
            }
        };
        fetchVideos();

        // Fetch similar books
        const fetchSimilarBooks = async () => {
            if (recommendation?.title && recommendation?.author) {
                setSimilarBooksLoading(true);
                try {
                    const similar = await getSimilarBooks(
                        recommendation.title,
                        recommendation.author,
                        [recommendation.title]
                    );
                    setSimilarBooks(similar);
                    
                    // Fetch book details for similar books
                    if (similar.length > 0) {
                        const detailsPromises = similar.map(async (book) => {
                            const results = await searchBooks(`${book.title} ${book.author}`);
                            return results.length > 0 ? { ...book, ...results[0] } : book;
                        });
                        const details = await Promise.all(detailsPromises);
                        setSimilarBooksDetails(details);
                    }
                } catch (error) {
                    console.error("Error fetching similar books:", error);
                } finally {
                    setSimilarBooksLoading(false);
                }
            }
        };
        fetchSimilarBooks();

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [recommendation, onClose]);

    if (!recommendation) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div 
                className="relative w-full max-w-4xl bg-surface border border-gray-700 rounded-2xl p-6 md:p-8 shadow-2xl flex flex-col items-center text-center gap-4 max-h-[90vh] overflow-y-auto"
                role="dialog"
                aria-modal="true"
                aria-labelledby="recommendation-title"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10 p-2 -mt-2 -mr-2"
                    aria-label="Close recommendation modal"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="w-32 h-48 md:w-40 md:h-60 bg-gray-800 rounded-lg shadow-lg overflow-hidden shrink-0 relative group">
                    {bookDetails?.cover ? (
                        <img src={bookDetails.cover} alt={recommendation.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                            <BookOpen className="w-12 h-12" />
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-2 items-center">
                    <h2 id="recommendation-title" className="text-3xl md:text-4xl font-serif text-white leading-tight">
                        {recommendation.title}
                    </h2>
                    <p className="text-lg md:text-xl text-gray-400 font-body">
                        by {recommendation.author}
                    </p>

                    {/* Rating Display */}
                    {bookDetails?.rating && (
                        <div className="flex items-center gap-2 mt-2 bg-gray-800/50 px-3 py-1 rounded-full border border-gray-700">
                            <div className="flex text-yellow-500">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} className={`w-4 h-4 ${i < Math.round(bookDetails.rating) ? 'fill-current' : 'text-gray-600 fill-current'}`} viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                            <span className="text-sm text-gray-300 font-body">
                                {bookDetails.rating}/5 <span className="text-gray-500">({bookDetails.ratingsCount || 0})</span>
                            </span>
                        </div>
                    )}
                </div>

                <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
                    <p className="text-gray-300 font-body italic leading-relaxed">
                        "{recommendation.reasoning}"
                    </p>
                </div>

                {/* External Link */}
                <a
                    href={`https://www.goodreads.com/search?q=${encodeURIComponent(recommendation.title + ' ' + recommendation.author)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-400 hover:text-blue-300 hover:underline font-body flex items-center gap-1 transition-colors"
                >
                    View on Goodreads <ExternalLink className="w-3 h-3" />
                </a>

                {/* YouTube Video Carousel */}
                <VideoCarousel videos={videos} isLoading={videosLoading} />

                {/* Similar Reads Section */}
                {similarBooksLoading ? (
                    <div className="w-full">
                        <h3 className="text-xl font-serif text-white mb-4 text-left">
                            Similar reads
                        </h3>
                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex-shrink-0 w-[160px] animate-pulse">
                                    <div className="bg-gray-800 rounded-lg overflow-hidden">
                                        <div className="w-[160px] h-[240px] bg-gray-700" />
                                        <div className="p-2 space-y-2">
                                            <div className="h-3 bg-gray-700 rounded w-full" />
                                            <div className="h-3 bg-gray-700 rounded w-3/4" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : similarBooksDetails.length > 0 ? (
                    <div className="w-full">
                        <h3 className="text-xl font-serif text-white mb-4 text-left">
                            Similar reads
                        </h3>
                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide scroll-smooth">
                            {similarBooksDetails.map((book) => (
                                <a
                                    key={`${book.title}-${book.author}`}
                                    href={`https://www.goodreads.com/search?q=${encodeURIComponent(book.title + ' ' + book.author)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-shrink-0 w-[160px] group"
                                >
                                    <div className="bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700 hover:border-gray-500 transition-all duration-300 hover:shadow-lg hover:shadow-white/5 h-full flex flex-col">
                                        <div className="relative w-[160px] h-[240px] bg-gray-900 overflow-hidden flex-shrink-0">
                                            {book.cover ? (
                                                <img
                                                    src={book.cover}
                                                    alt={book.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <BookOpen className="w-8 h-8 text-gray-600" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-2 flex flex-col flex-1">
                                            <h4 className="text-xs font-body text-white line-clamp-2 leading-tight group-hover:text-gray-200 mb-1">
                                                {book.title}
                                            </h4>
                                            <p className="text-xs text-gray-400 font-body line-clamp-1">
                                                {book.author}
                                            </p>
                                            {book.rating && (
                                                <div className="flex items-center gap-1 mt-1">
                                                    <div className="flex text-yellow-500">
                                                        <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                    </div>
                                                    <span className="text-xs text-gray-400 font-body">
                                                        {book.rating}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                ) : null}

                {!recommendation.isTrending && (
                    <div className="flex flex-col sm:flex-row gap-3 w-full mt-4">
                        <button
                            onClick={onRetry}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white text-black rounded-full font-body font-medium hover:bg-gray-200 transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Get Another
                        </button>
                        <button
                            onClick={onReset}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-transparent border border-gray-600 text-white rounded-full font-body font-medium hover:bg-gray-800 transition-colors"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Start Over
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
