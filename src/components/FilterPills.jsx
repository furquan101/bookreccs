import React, { useState, useEffect, useRef } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { 
    Lightning, 
    BookOpen, 
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

const FILTERS = [
    // Pacing & Engagement
    { id: 'fast-paced', label: 'fast-paced', icon: Lightning, category: 'Pacing' },
    { id: 'page-turner', label: 'page-turner', icon: BookOpen, category: 'Pacing' },
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

export default function FilterPills({ activeFilters, toggleFilter }) {
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
    const filterMenuRef = useRef(null);

    // Close filter menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
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
        };

        if (isFilterMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isFilterMenuOpen]);

    return (
        <div className="w-full flex flex-col gap-3 py-2 relative">
            <button
                onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                className="flex items-center gap-2 text-gray-400 shrink-0 hover:text-gray-300 transition-colors cursor-pointer w-fit"
            >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="text-sm font-body whitespace-nowrap">Add filters</span>
            </button>

            {isFilterMenuOpen && (
                <div 
                    ref={filterMenuRef}
                    className="absolute top-8 left-0 bg-[#0f0f0f] border border-white/20 rounded-lg shadow-2xl z-50 p-2 min-w-[240px] max-h-[500px] overflow-y-auto"
                >
                    <div className="flex flex-col gap-2">
                        {Object.entries(
                            FILTERS.reduce((acc, filter) => {
                                const category = filter.category || 'Other';
                                if (!acc[category]) acc[category] = [];
                                acc[category].push(filter);
                                return acc;
                            }, {})
                        ).map(([category, filters]) => (
                            <div key={category} className="flex flex-col gap-1">
                                <div className="text-xs font-body text-white/40 uppercase tracking-wider px-2 py-1">
                                    {category}
                                </div>
                                {filters.map((filter) => {
                                    const IconComponent = filter.icon;
                                    return (
                                        <button
                                            key={filter.id}
                                            onClick={() => toggleFilter(filter.id)}
                                            className={`
                                                w-full px-2 py-1 rounded-lg text-sm font-body text-left transition-all duration-200 flex items-center gap-2
                                                ${activeFilters.has(filter.id)
                                                    ? 'text-white'
                                                    : 'text-gray-400 hover:text-gray-300'}
                                            `}
                                        >
                                            <IconComponent className="w-4 h-4 shrink-0" weight={activeFilters.has(filter.id) ? "fill" : "regular"} />
                                            <span className="flex-1">{filter.label}</span>
                                            {activeFilters.has(filter.id) && (
                                                <X className="w-3 h-3 shrink-0" />
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
                <div className="flex items-center gap-2 flex-wrap mt-2">
                    {FILTERS.filter(filter => activeFilters.has(filter.id)).map((filter) => {
                        const IconComponent = filter.icon;
                        return (
                            <button
                                key={filter.id}
                                onClick={() => toggleFilter(filter.id)}
                                className="px-4 py-1 rounded-full border border-white/20 text-sm font-sans whitespace-nowrap transition-all duration-200 flex items-center gap-2 text-white hover:border-white/40 hover:bg-white/5"
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
    );
}
