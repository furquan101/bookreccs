import React, { useState, useEffect, useRef } from 'react';
import { Search, BookOpen, X, Loader2, SlidersHorizontal } from 'lucide-react';
import { searchBooks } from '../services/googleBooks';
import SubmitButton from './SubmitButton';

const FILTERS = [
    { id: 'fast-paced', label: 'fast-paced' },
    { id: 'page-turner', label: 'page-turner' },
    { id: 'timeless-classic', label: 'timeless classic' },
    { id: 'slow-burn', label: 'slow-burn' },
    { id: 'awards', label: 'lots of awards' },
];

export default function BookInput({ selectedBooks, setSelectedBooks, activeFilters, toggleFilter, onSubmit, isLoading: parentLoading }) {
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
      relative w-full p-8 rounded-xl border transition-all duration-300
      ${isFocused ? 'border-white/30' : 'border-white/10'}
      bg-black
    `}>
            <div className="flex flex-col gap-8">
                {/* Header instruction */}
                <div className="flex items-start gap-3 text-white/80 text-left">
                    <BookOpen className="w-5 h-5 mt-0.5 shrink-0 text-white/60" />
                    <p className="font-sans text-base leading-relaxed">
                        Tell us 2–5 books you've enjoyed, we'll recommend new ones you'll love.
                    </p>
                </div>

                {/* Search Input Field */}
                <div className="relative">
                    <div className="relative flex items-center">
                        <Search className="absolute left-3 w-5 h-5 text-white/40" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                            placeholder="Search for a book..."
                            className="w-full bg-white/5 border border-white/20 focus:border-white/40 rounded-lg py-3 pl-10 pr-10 text-base font-sans text-white placeholder-white/40 focus:outline-none transition-all"
                            aria-label="Search for books to add to your list"
                        />
                        {isLoading && (
                            <Loader2 className="absolute right-3 w-5 h-5 text-white/60 animate-spin" />
                        )}
                    </div>

                    {/* Dropdown Results */}
                    {showDropdown && results.length > 0 && (
                        <div className="absolute top-full left-0 w-full mt-2 bg-black border border-white/20 rounded-lg shadow-2xl z-50 overflow-hidden max-h-72 overflow-y-auto">
                            {results.map((book) => (
                                <button
                                    key={book.id}
                                    onClick={() => handleSelectBook(book)}
                                    className="w-full flex items-center gap-3 p-3 hover:bg-white/10 transition-colors text-left border-b border-white/10 last:border-none"
                                >
                                    {book.cover ? (
                                        <img src={book.cover} alt={book.title} className="w-10 h-14 object-cover rounded shadow-sm" />
                                    ) : (
                                        <div className="w-10 h-14 bg-white/10 rounded flex items-center justify-center">
                                            <BookOpen className="w-4 h-4 text-white/40" />
                                        </div>
                                    )}
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="text-sm font-sans text-white truncate">{book.title}</span>
                                        <span className="text-xs font-sans text-white/60 truncate">{book.author}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Selected Books Chips */}
                {selectedBooks.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {selectedBooks.map((book) => (
                            <div key={book.id} className="flex items-center gap-2 bg-white text-black rounded-full px-3 py-1.5 animate-in fade-in zoom-in duration-200">
                                <span className="text-sm font-sans truncate max-w-[150px]">{book.title}</span>
                                <button
                                    onClick={() => setSelectedBooks(prev => prev.filter(b => b.id !== book.id))}
                                    className="text-black/60 hover:text-black transition-colors p-1.5 -mr-1.5 -my-1.5"
                                    aria-label={`Remove ${book.title}`}
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Bottom Row: Filters and Submit Button */}
                <div className="flex items-center justify-between gap-4 pt-2 border-t border-white/10">
                    <div className="flex items-center gap-3 overflow-x-auto no-scrollbar flex-1">
                        <div className="flex items-center gap-2 text-white/50 shrink-0">
                            <SlidersHorizontal className="w-4 h-4" />
                            <span className="text-sm font-sans whitespace-nowrap">Add filters</span>
                        </div>

                        <div className="flex items-center gap-2">
                            {FILTERS.map((filter) => (
                                <button
                                    key={filter.id}
                                    onClick={() => toggleFilter(filter.id)}
                                    className={`
                                    px-3 py-1 rounded-full text-sm font-sans whitespace-nowrap transition-all duration-200 flex items-center gap-2
                                    ${activeFilters.has(filter.id)
                                            ? 'bg-purple-500/20 text-purple-200 border border-white/80'
                                            : 'bg-[#272727] text-white/60 border border-[#181816] hover:border-white/40 hover:text-purple-200'}
                                `}
                                >
                                    {filter.label}
                                    {activeFilters.has(filter.id) && (
                                        <X className="w-3 h-3 text-purple-200" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="shrink-0 ml-4">
                        <SubmitButton
                            disabled={selectedBooks.length < 2 || parentLoading}
                            onClick={onSubmit}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
