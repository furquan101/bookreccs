import React, { useState, useEffect, useRef } from 'react';
import { Search, BookOpen, X, Loader2, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { Lightning, BookOpen as PhosphorBookOpen, Clock, Fire, Trophy } from '@phosphor-icons/react';
import { searchBooks } from '../services/googleBooks';
import SubmitButton from './SubmitButton';

const FILTERS = [
    { id: 'fast-paced', label: 'fast-paced', icon: Lightning },
    { id: 'page-turner', label: 'page-turner', icon: PhosphorBookOpen },
    { id: 'timeless-classic', label: 'timeless classic', icon: Clock },
    { id: 'slow-burn', label: 'slow-burn', icon: Fire },
    { id: 'awards', label: 'lots of awards', icon: Trophy },
];

// Popular books to suggest when search is empty
const POPULAR_BOOKS = [
    { title: "The Seven Husbands of Evelyn Hugo", author: "Taylor Jenkins Reid" },
    { title: "It Ends with Us", author: "Colleen Hoover" },
    { title: "The Midnight Library", author: "Matt Haig" },
    { title: "Project Hail Mary", author: "Andy Weir" },
    { title: "The Silent Patient", author: "Alex Michaelides" },
    { title: "Where the Crawdads Sing", author: "Delia Owens" },
    { title: "Educated", author: "Tara Westover" },
    { title: "The Girl on the Train", author: "Paula Hawkins" },
    { title: "The Book Thief", author: "Markus Zusak" },
    { title: "The Kite Runner", author: "Khaled Hosseini" },
    { title: "The Handmaid's Tale", author: "Margaret Atwood" },
    { title: "1984", author: "George Orwell" },
];

export default function BookInput({ selectedBooks, setSelectedBooks, activeFilters, toggleFilter, onSubmit, isLoading: parentLoading }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [popularSuggestions, setPopularSuggestions] = useState([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
    const inputRef = useRef(null);
    const filterMenuRef = useRef(null);

    // Close filter menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
                // Check if click is on the filter button
                const filterButton = event.target.closest('button');
                if (!filterButton || !filterButton.querySelector('svg')) {
                    setIsFilterMenuOpen(false);
                }
            }
        };

        if (isFilterMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isFilterMenuOpen]);

    // Load popular suggestions when input is focused and empty
    useEffect(() => {
        if (isFocused && query.length < 2 && popularSuggestions.length === 0) {
            const loadPopularSuggestions = async () => {
                setLoadingSuggestions(true);
                try {
                    // Fetch details for popular books
                    const promises = POPULAR_BOOKS.slice(0, 6).map(async (book) => {
                        const results = await searchBooks(`${book.title} ${book.author}`);
                        return results.length > 0 ? results[0] : null;
                    });
                    const suggestions = await Promise.all(promises);
                    setPopularSuggestions(suggestions.filter(b => b !== null));
                } catch (error) {
                    console.error("Error loading popular suggestions:", error);
                } finally {
                    setLoadingSuggestions(false);
                }
            };
            loadPopularSuggestions();
        }
    }, [isFocused, query, popularSuggestions.length]);

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
                setShowDropdown(query.length === 0 && isFocused);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query, isFocused]);

    const handleSelectBook = (book) => {
        if (selectedBooks.length >= 5) return;
        if (selectedBooks.some(b => b.id === book.id)) return;

        setSelectedBooks([...selectedBooks, book]);
        setQuery('');
        setResults([]);
        setShowDropdown(false);
        setPopularSuggestions([]); // Clear suggestions after selection
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
                    {showDropdown && (
                        <div className="absolute top-full left-0 w-full mt-2 bg-black border border-white/20 rounded-lg shadow-2xl z-50 overflow-hidden max-h-72 overflow-y-auto">
                            {query.length >= 2 && results.length > 0 ? (
                                // Search results
                                results.map((book) => (
                                    <button
                                        key={book.id}
                                        onClick={() => handleSelectBook(book)}
                                        className="w-full flex items-center gap-3 p-3 hover:bg-white/10 transition-colors text-left border-b border-white/10 last:border-none"
                                    >
                                        {book.cover ? (
                                            <>
                                                <img 
                                                    src={book.cover} 
                                                    alt={book.title} 
                                                    className="w-10 h-14 object-cover rounded shadow-sm"
                                                    loading="eager"
                                                    fetchPriority="high"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        const fallback = e.target.nextElementSibling;
                                                        if (fallback) {
                                                            fallback.style.display = 'flex';
                                                        }
                                                    }}
                                                />
                                                <div className="w-10 h-14 bg-white/10 rounded flex items-center justify-center hidden">
                                                    <BookOpen className="w-4 h-4 text-white/40" />
                                                </div>
                                            </>
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
                                ))
                            ) : query.length === 0 && isFocused ? (
                                // Popular suggestions
                                <>
                                    <div className="px-3 py-2 border-b border-white/10">
                                        <span className="text-xs font-sans text-white/60 uppercase tracking-wide">Popular Books</span>
                                    </div>
                                    {loadingSuggestions ? (
                                        <div className="flex items-center justify-center p-4">
                                            <Loader2 className="w-5 h-5 text-white/60 animate-spin" />
                                        </div>
                                    ) : popularSuggestions.length > 0 ? (
                                        popularSuggestions.map((book) => (
                                            <button
                                                key={book.id}
                                                onClick={() => handleSelectBook(book)}
                                                className="w-full flex items-center gap-3 p-3 hover:bg-white/10 transition-colors text-left border-b border-white/10 last:border-none"
                                            >
                                                {book.cover ? (
                                                    <>
                                                        <img 
                                                            src={book.cover} 
                                                            alt={book.title} 
                                                            className="w-10 h-14 object-cover rounded shadow-sm"
                                                            loading="eager"
                                                            fetchPriority="high"
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                                const fallback = e.target.nextElementSibling;
                                                                if (fallback) {
                                                                    fallback.style.display = 'flex';
                                                                }
                                                            }}
                                                        />
                                                        <div className="w-10 h-14 bg-white/10 rounded flex items-center justify-center hidden">
                                                            <BookOpen className="w-4 h-4 text-white/40" />
                                                        </div>
                                                    </>
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
                                        ))
                                    ) : null}
                                </>
                            ) : null}
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
                <div className="flex items-start justify-between gap-4 pt-2 border-t border-white/10">
                    <div className="flex flex-col gap-3 flex-1">
                        <div className="flex items-center gap-2 text-white/50 shrink-0">
                            <SlidersHorizontal className="w-4 h-4" />
                            <span className="text-sm font-sans whitespace-nowrap">Add filters</span>
                        </div>

                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                            {FILTERS.map((filter) => {
                                const IconComponent = filter.icon;
                                return (
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
                                        <IconComponent className="w-4 h-4" weight={activeFilters.has(filter.id) ? "fill" : "regular"} />
                                        {filter.label}
                                        {activeFilters.has(filter.id) && (
                                            <X className="w-3 h-3 text-purple-200" />
                                        )}
                                    </button>
                                );
                            })}
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
