import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { X, RefreshCw, RotateCcw, BookOpen, ExternalLink } from 'lucide-react';
import { searchBooks } from '../services/googleBooks';

export default function RecommendationModal({ recommendation, onClose, onReset, onRetry }) {
    const [bookDetails, setBookDetails] = React.useState(null);

    useEffect(() => {
        if (!recommendation) return;

        // Trigger confetti
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
    }, [recommendation]);

    if (!recommendation) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="relative w-full max-w-lg bg-surface border border-gray-700 rounded-2xl p-6 md:p-10 shadow-2xl flex flex-col items-center text-center gap-6">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
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
                    <h2 className="text-3xl md:text-4xl font-serif text-white leading-tight">
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
            </div>
        </div>
    );
}
