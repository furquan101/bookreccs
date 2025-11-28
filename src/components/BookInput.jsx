import React, { useState, useEffect, useRef } from 'react';
import { Search, BookOpen, X, Loader2 } from 'lucide-react';
import { searchBooks } from '../services/googleBooks';

export default function BookInput({ selectedBooks, setSelectedBooks }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const inputRef = useRef(null);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length >= 2) {
                setIsLoading(true);
                const books = await searchBooks(query);
                setResults(books);
                setIsLoading(false);
                setShowDropdown(true);
            } else {
                setResults([]);
                setShowDropdown(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const handleSelectBook = (book) => {
        if (selectedBooks.length >= 5) return;
        if (selectedBooks.some(b => b.id === book.id)) return;

        setSelectedBooks([...selectedBooks, book]);
        setQuery('');
        setResults([]);
        setShowDropdown(false);
    };

    return (
        <div className={`
      relative w-full p-6 rounded-lg border transition-all duration-300
      ${isFocused ? 'border-white shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'border-gray-700'}
      bg-surface/50 backdrop-blur-sm
    `}>
            <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3 text-gray-400 mb-2">
                    <BookOpen className="w-5 h-5 mt-1 shrink-0" />
                    <p className="font-body text-sm md:text-base leading-relaxed">
                        Tell us 2–5 books you’ve enjoyed, we’ll recommend new ones you’ll love.
                    </p>
                </div>

                {/* Selected Books Chips */}
                {selectedBooks.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                        {selectedBooks.map((book) => (
                            <div key={book.id} className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-full px-3 py-1.5 animate-in fade-in zoom-in duration-200">
                                <span className="text-sm text-gray-200 font-body truncate max-w-[150px]">{book.title}</span>
                                <button
                                    onClick={() => setSelectedBooks(prev => prev.filter(b => b.id !== book.id))}
                                    className="hover:text-white transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Input Field */}
                <div className="relative">
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setTimeout(() => setIsFocused(false), 200)} // Delay to allow click
                        placeholder="Search for a book..."
                        className="w-full bg-transparent border-b border-gray-700 focus:border-white py-2 pl-0 pr-8 text-lg font-body text-white placeholder-gray-600 focus:outline-none transition-colors"
                    />
                    {isLoading ? (
                        <Loader2 className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 animate-spin" />
                    ) : (
                        <Search className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    )}

                    {/* Dropdown Results */}
                    {showDropdown && results.length > 0 && (
                        <div className="absolute top-full left-0 w-full mt-2 bg-surface border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
                            {results.map((book) => (
                                <button
                                    key={book.id}
                                    onClick={() => handleSelectBook(book)}
                                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-800 transition-colors text-left border-b border-gray-800 last:border-none"
                                >
                                    {book.cover ? (
                                        <img src={book.cover} alt={book.title} className="w-10 h-14 object-cover rounded shadow-sm" />
                                    ) : (
                                        <div className="w-10 h-14 bg-gray-700 rounded flex items-center justify-center">
                                            <BookOpen className="w-4 h-4 text-gray-500" />
                                        </div>
                                    )}
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="text-sm font-serif text-white truncate">{book.title}</span>
                                        <span className="text-xs font-body text-gray-400 truncate">{book.author}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
