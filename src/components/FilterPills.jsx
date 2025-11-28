import React, { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';

const FILTERS = [
    { id: 'fast-paced', label: 'fast-paced' },
    { id: 'page-turner', label: 'page-turner' },
    { id: 'timeless-classic', label: 'timeless classic' },
    { id: 'slow-burn', label: 'slow-burn' },
    { id: 'awards', label: 'lots of awards' },
];

export default function FilterPills({ activeFilters, toggleFilter }) {
    return (
        <div className="w-full flex items-center gap-4 overflow-x-auto no-scrollbar py-2 mask-linear-fade">
            <div className="flex items-center gap-2 text-gray-400 shrink-0">
                <SlidersHorizontal className="w-4 h-4" />
                <span className="text-sm font-body whitespace-nowrap">Add filters</span>
            </div>

            <div className="flex items-center gap-2">
                {FILTERS.map((filter) => (
                    <button
                        key={filter.id}
                        onClick={() => toggleFilter(filter.id)}
                        className={`
              px-4 py-1.5 rounded-full border text-sm font-body whitespace-nowrap transition-all duration-200
              ${activeFilters.has(filter.id)
                                ? 'bg-white text-black border-white'
                                : 'bg-transparent text-gray-400 border-gray-700 hover:border-gray-500'}
            `}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
