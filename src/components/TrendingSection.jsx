import React, { useEffect, useState, useRef } from 'react';
import { getTrendingBooksFromMultipleSources } from '../services/trendingBooks';
import { BookOpen, Star } from 'lucide-react';
import { CaretRight } from '@phosphor-icons/react';

export default function TrendingSection({ onBookClick }) {
    const [books, setBooks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const scrollContainerRef = useRef(null);

    useEffect(() => {
        const fetchTrendingBooks = async () => {
            try {
                // Use multi-source aggregator that combines:
                // - AI recommendations (with regional diversity)
                // - Verified book availability
                // - Scoring system for accuracy
                // - Regional diversity enforcement
                const books = await getTrendingBooksFromMultipleSources();
                setBooks(books);
            } catch (error) {
                console.error("Error fetching trending books:", error);
                // Component will show empty state if no books
                setBooks([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTrendingBooks();
    }, []);

    if (isLoading) {
        return (
            <div className="w-full flex flex-col gap-6 mt-8 animate-pulse">
                <div className="h-10 w-64 bg-gray-800 rounded"></div>
                <div className="flex gap-6 overflow-hidden">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="shrink-0 w-[180px] md:w-[220px] aspect-[2/3] bg-gray-800 rounded-lg"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div id="trending" className="w-full flex flex-col gap-6 mt-8">
            <div className="flex flex-col gap-2">
                <h2 className="text-2xl md:text-3xl font-serif text-white">
                    Trending right now
                </h2>
                <p className="text-white/60 font-sans text-sm">
                    Popular recommendations based on reading trends and discussions.
                </p>
            </div>

            <div className="relative w-full">
                <button
                    onClick={() => {
                        if (scrollContainerRef.current) {
                            scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
                        }
                    }}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-[#0f0f0f] border border-gray-800 rounded-full p-3 hover:bg-[#181818] hover:border-gray-700 transition-all duration-300 opacity-80 hover:opacity-100 min-w-[44px] min-h-[44px] flex items-center justify-center"
                    aria-label="Scroll right"
                >
                    <CaretRight className="w-5 h-5 text-white" weight="fill" />
                </button>
                <div ref={scrollContainerRef} className="w-full overflow-x-auto no-scrollbar pb-8 mask-linear-fade scroll-smooth">
                    <div className="flex gap-6 px-1">
                    {books.map((book) => (
                        <div
                            key={book.id}
                            onClick={() => onBookClick?.(book)}
                            className="relative shrink-0 w-[180px] md:w-[220px] aspect-[2/3] rounded-lg overflow-hidden group cursor-pointer transition-transform duration-300 hover:-translate-y-2 shadow-lg"
                        >
                            {book.cover ? (
                                <>
                                    <img
                                        src={book.cover}
                                        alt={book.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        loading="eager"
                                        fetchPriority="high"
                                        onError={(e) => {
                                            // Hide image and show fallback if it fails to load
                                            console.warn('Image failed to load:', book.cover, 'for book:', book.title);
                                            e.target.style.display = 'none';
                                            const fallback = e.target.nextElementSibling;
                                            if (fallback) {
                                                fallback.style.display = 'flex';
                                            }
                                        }}
                                        onLoad={() => {
                                            // Debug: Log successful image loads
                                            console.debug('Image loaded successfully:', book.title);
                                        }}
                                    />
                                    <div className="w-full h-full bg-gray-800 flex items-center justify-center hidden">
                                        <BookOpen className="w-12 h-12 text-gray-600" />
                                    </div>
                                </>
                            ) : (
                                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                    <BookOpen className="w-12 h-12 text-gray-600" />
                                </div>
                            )}

                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                <p className="text-white font-sans text-lg font-semibold leading-tight line-clamp-2">{book.title}</p>
                                <p className="text-gray-300 font-sans text-sm font-normal mt-1 mb-2">{book.author}</p>

                                {/* Rating */}
                                {book.rating && (
                                    <div className="flex items-center gap-1">
                                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                        <span className="text-xs text-gray-200 font-body">
                                            {book.rating} <span className="text-gray-500">({book.ratingsCount})</span>
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
