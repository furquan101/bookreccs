import React, { useState, useEffect, useRef } from 'react';
import { Search, BookOpen, X, Loader2, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { 
    Lightning, 
    BookOpen as PhosphorBookOpen, 
    Clock, 
    Fire, 
    Trophy,
    Smiley,
    Brain,
    Moon,
    Hourglass,
    Calendar,
    Book,
    Globe
} from '@phosphor-icons/react';
import { searchBooks } from '../services/googleBooks';
import SubmitButton from './SubmitButton';

const FILTERS = [
    // Pacing & Engagement
    { id: 'fast-paced', label: 'fast-paced', icon: Lightning, category: 'Pacing' },
    { id: 'page-turner', label: 'page-turner', icon: PhosphorBookOpen, category: 'Pacing' },
    { id: 'slow-burn', label: 'slow-burn', icon: Fire, category: 'Pacing' },
    
    // Mood & Tone
    { id: 'uplifting', label: 'uplifting', icon: Smiley, category: 'Mood' },
    { id: 'thought-provoking', label: 'thought-provoking', icon: Brain, category: 'Mood' },
    { id: 'dark', label: 'dark themes', icon: Moon, category: 'Mood' },
    
    // Length
    { id: 'short-read', label: 'short read', icon: Hourglass, category: 'Length' },
    { id: 'long-read', label: 'long read', icon: Book, category: 'Length' },
    
    // Publication Era
    { id: 'new-release', label: 'new release', icon: Calendar, category: 'Era' },
    { id: 'timeless-classic', label: 'timeless classic', icon: Clock, category: 'Era' },
    
    // Setting
    { id: 'contemporary', label: 'contemporary setting', icon: Globe, category: 'Setting' },
    
    // Recognition
    { id: 'awards', label: 'lots of awards', icon: Trophy, category: 'Recognition' },
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

export default function BookInput({ selectedBooks, setSelectedBooks, activeFilters, toggleFilter, onSubmit, isLoading: parentLoading, onBookView }) {
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
        if (!isFilterMenuOpen) return;

        const handleClickOutside = (event) => {
            try {
                if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
                    // Check if click is on the "Add filters" button
                    const addFiltersButton = event.target.closest('button');
                    const isAddFiltersButton = addFiltersButton && 
                        (addFiltersButton.textContent?.includes('Add filters') || 
                         addFiltersButton.querySelector('[class*="SlidersHorizontal"]'));
                    
                    if (!isAddFiltersButton) {
                        setIsFilterMenuOpen(false);
                    }
                }
            } catch (error) {
                console.error("Error in handleClickOutside:", error);
                // Close menu on error to prevent stuck state
                setIsFilterMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isFilterMenuOpen]);

    // Load popular suggestions when input is focused and empty
    useEffect(() => {
        if (isFocused && query.length < 2 && popularSuggestions.length === 0 && !loadingSuggestions) {
            const loadPopularSuggestions = async () => {
                setLoadingSuggestions(true);
                try {
                    // Fetch details for popular books
                    const promises = POPULAR_BOOKS.slice(0, 6).map(async (book) => {
                        try {
                            const results = await searchBooks(`${book.title} ${book.author}`);
                            return results.length > 0 ? results[0] : null;
                        } catch (error) {
                            console.error(`Error fetching book ${book.title}:`, error);
                            return null;
                        }
                    });
                    const suggestions = await Promise.all(promises);
                    setPopularSuggestions(suggestions.filter(b => b !== null));
                } catch (error) {
                    console.error("Error loading popular suggestions:", error);
                    setPopularSuggestions([]); // Set empty array on error to prevent retry loop
                } finally {
                    setLoadingSuggestions(false);
                }
            };
            loadPopularSuggestions();
        }
    }, [isFocused, query]); // Removed popularSuggestions.length to prevent infinite loops

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length >= 2) {
                setIsLoading(true);
                try {
                    const books = await searchBooks(query);
                    setResults(books || []);
                    setShowDropdown(true);
                } catch (error) {
                    console.error("Error searching books:", error);
                    setResults([]);
                    setShowDropdown(false);
                } finally {
                    setIsLoading(false);
                }
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

    const hasActiveFilters = activeFilters.size > 0;
    
    return (
        <div className={`
      relative w-full rounded-xl border transition-all duration-300
      ${isFocused ? 'border-white/30' : 'border-white/10'}
      bg-black
      ${hasActiveFilters ? 'p-4 sm:p-6 md:p-8 pb-8' : 'px-4 sm:px-6 md:px-8 pt-4 sm:pt-6 md:pt-8 pb-4'}
    `}>
            <div className="flex flex-col gap-8">
                {/* Header instruction */}
                <div className="flex items-center gap-3 text-white/80 text-left">
                    <BookOpen className="w-5 h-5 shrink-0 text-white/60" />
                    <p className="font-sans text-base leading-relaxed">
                        Tell us 2–5 books you've enjoyed, and we'll create your personalized reading taste page.
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
                        <div className="absolute top-full left-0 w-full mt-2 bg-black border border-white/20 rounded-lg shadow-2xl z-50 overflow-hidden max-h-[60vh] overflow-y-auto">
                            {query.length >= 2 && results.length > 0 ? (
                                // Search results
                                results.map((book) => (
                                    <div
                                        key={book.id}
                                        className="w-full flex items-center gap-3 p-3 hover:bg-white/10 transition-colors border-b border-white/10 last:border-none group"
                                    >
                                        <button
                                            onClick={() => handleSelectBook(book)}
                                            className="flex-1 flex items-center gap-3 text-left"
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
                                        {onBookView && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onBookView(book);
                                                }}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-sans text-white/60 hover:text-white px-2 py-1"
                                                title="View book details"
                                            >
                                                View
                                            </button>
                                        )}
                                    </div>
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
                                            <div
                                                key={book.id}
                                                className="w-full flex items-center gap-3 p-3 hover:bg-white/10 transition-colors border-b border-white/10 last:border-none group"
                                            >
                                                <button
                                                    onClick={() => handleSelectBook(book)}
                                                    className="flex-1 flex items-center gap-3 text-left"
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
                                                {onBookView && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onBookView(book);
                                                        }}
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-sans text-white/60 hover:text-white px-2 py-1"
                                                        title="View book details"
                                                    >
                                                        View
                                                    </button>
                                                )}
                                            </div>
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
                            <div key={book.id} className="flex items-center gap-2 border border-white/20 text-white rounded-full px-3 py-1.5 animate-in fade-in zoom-in duration-200 hover:border-white/40 hover:bg-white/5 transition-all">
                                <span className="text-sm font-sans truncate max-w-[150px]">{book.title}</span>
                                <button
                                    onClick={() => setSelectedBooks(prev => prev.filter(b => b.id !== book.id))}
                                    className="text-white/60 hover:text-white transition-colors p-2 -mr-2 -my-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                                    aria-label={`Remove ${book.title}`}
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Bottom Row: Filters and Submit Button */}
                <div className={`flex items-start justify-between gap-4 pt-4 border-t border-white/10 ${hasActiveFilters ? 'pb-2' : ''}`}>
                    <div className="flex flex-col gap-3 relative">
                        <div className="flex-shrink-0">
                            <button
                                onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-sans whitespace-nowrap transition-all duration-200 text-white/60 border-white/20 hover:text-white/80 hover:border-white/40 bg-transparent w-fit min-h-[44px]"
                            >
                                <SlidersHorizontal className="w-4 h-4" />
                                <span>Add filters</span>
                            </button>
                        </div>

                        {isFilterMenuOpen && (
                            <div 
                                ref={filterMenuRef}
                                className="absolute top-10 left-0 bg-[#0f0f0f] border border-white/20 rounded-lg shadow-2xl z-50 p-2 min-w-[240px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-200px)] overflow-y-auto"
                            >
                                <div className="flex flex-col gap-1">
                                    {Object.entries(
                                        FILTERS.reduce((acc, filter) => {
                                            const category = filter.category || 'Other';
                                            if (!acc[category]) acc[category] = [];
                                            acc[category].push(filter);
                                            return acc;
                                        }, {})
                                    ).map(([category, filters]) => (
                                        <div key={category} className="flex flex-col">
                                            <div className="text-xs font-sans text-white/40 uppercase tracking-wider px-2 py-1">
                                                {category}
                                            </div>
                                            {filters.map((filter) => {
                                                const IconComponent = filter.icon;
                                                return (
                                                    <button
                                                        key={filter.id}
                                                        onClick={() => toggleFilter(filter.id)}
                                                        className={`
                                                            w-full px-3 py-1.5 rounded-lg text-sm font-sans text-left transition-all duration-200 flex items-center gap-2 min-h-[44px]
                                                            ${activeFilters.has(filter.id)
                                                                ? 'text-purple-200'
                                                                : 'text-white/60 hover:text-white/80'}
                                                        `}
                                                    >
                                                        <IconComponent className="w-4 h-4 shrink-0" weight={activeFilters.has(filter.id) ? "fill" : "regular"} />
                                                        <span className="flex-1">{filter.label}</span>
                                                        {activeFilters.has(filter.id) && (
                                                            <X className="w-3 h-3 text-purple-200 shrink-0" />
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Show active filters as pills below the menu */}
                        {Array.from(activeFilters).length > 0 && (
                            <div className="flex items-center gap-2 flex-wrap mt-2 w-full">
                                {FILTERS.filter(filter => activeFilters.has(filter.id)).map((filter) => {
                                    const IconComponent = filter.icon;
                                    return (
                                        <button
                                            key={filter.id}
                                            onClick={() => toggleFilter(filter.id)}
                                            className="px-3 py-1.5 rounded-full border border-white/20 text-sm font-sans whitespace-nowrap transition-all duration-200 flex items-center gap-2 text-white hover:border-white/40 hover:bg-white/5 min-h-[44px]"
                                        >
                                            <IconComponent className="w-4 h-4" weight="fill" />
                                            {filter.label}
                                            <X className="w-3 h-3" />
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="shrink-0">
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
