import React, { useEffect, useState } from 'react';
import { searchBooks } from '../services/googleBooks';
import { getTrendingBooks } from '../services/gemini';
import { BookOpen, Star } from 'lucide-react';

export default function TrendingSection({ onBookClick }) {
    const [books, setBooks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTrendingBooks = async () => {
            try {
                // 1. Get trending list from Gemini
                const trendingList = await getTrendingBooks();

                // Fallback if Gemini fails or returns empty
                const booksToFetch = trendingList.length > 0 ? trendingList : [
                    { title: "Pachinko", author: "Min Jin Lee" },
                    { title: "Yellowface", author: "R.F. Kuang" },
                    { title: "Tomorrow, and Tomorrow, and Tomorrow", author: "Gabrielle Zevin" },
                    { title: "Lessons in Chemistry", author: "Bonnie Garmus" },
                    { title: "Fourth Wing", author: "Rebecca Yarros" }
                ];

                // 2. Fetch metadata for each book from Google Books
                const promises = booksToFetch.map(async (book) => {
                    const results = await searchBooks(`${book.title} ${book.author}`);
                    return results.length > 0 ? results[0] : null;
                });

                const results = await Promise.all(promises);
                setBooks(results.filter(b => b !== null));
            } catch (error) {
                console.error("Error fetching trending books:", error);
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
                        <div key={i} className="shrink-0 w-[160px] md:w-[200px] aspect-[2/3] bg-gray-800 rounded-lg"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div id="trending" className="w-full flex flex-col gap-6 mt-8">
            <div className="flex flex-col gap-1">
                <h2 className="text-3xl md:text-4xl font-serif text-white">
                    Trending right now
                </h2>
                <p className="text-white/60 font-sans text-sm">
                    Popular recommendations based on reading trends and discussions.
                </p>
            </div>

            <div className="w-full overflow-x-auto no-scrollbar pb-8 mask-linear-fade">
                <div className="flex gap-6 px-1">
                    {books.map((book) => (
                        <div
                            key={book.id}
                            onClick={() => onBookClick?.(book)}
                            className="relative shrink-0 w-[160px] md:w-[200px] aspect-[2/3] rounded-lg overflow-hidden group cursor-pointer transition-transform duration-300 hover:-translate-y-2 shadow-lg"
                        >
                            {book.cover ? (
                                <img
                                    src={book.cover}
                                    alt={book.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                    <BookOpen className="w-12 h-12 text-gray-600" />
                                </div>
                            )}

                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                <p className="text-white font-serif text-lg leading-tight line-clamp-2">{book.title}</p>
                                <p className="text-gray-300 font-body text-sm mt-1 mb-2">{book.author}</p>

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
    );
}
