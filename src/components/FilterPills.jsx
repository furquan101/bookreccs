import React, { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Lightning, BookOpen, Clock, Fire, Trophy } from '@phosphor-icons/react';

const FILTERS = [
    { id: 'fast-paced', label: 'fast-paced', icon: Lightning },
    { id: 'page-turner', label: 'page-turner', icon: BookOpen },
    { id: 'timeless-classic', label: 'timeless classic', icon: Clock },
    { id: 'slow-burn', label: 'slow-burn', icon: Fire },
    { id: 'awards', label: 'lots of awards', icon: Trophy },
];

export default function FilterPills({ activeFilters, toggleFilter }) {
    return (
        <div className="w-full flex flex-col gap-3 py-2">
            <div className="flex items-center gap-2 text-gray-400 shrink-0">
                <SlidersHorizontal className="w-4 h-4" />
                <span className="text-sm font-body whitespace-nowrap">Add filters</span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mask-linear-fade">
                {FILTERS.map((filter) => {
                    const IconComponent = filter.icon;
                    return (
                        <button
                            key={filter.id}
                            onClick={() => toggleFilter(filter.id)}
                            className={`
              px-4 py-1.5 rounded-full border text-sm font-body whitespace-nowrap transition-all duration-200 flex items-center gap-2
              ${activeFilters.has(filter.id)
                                    ? 'bg-white text-black border-white'
                                    : 'bg-transparent text-gray-400 border-gray-700 hover:border-gray-500'}
            `}
                        >
                            <IconComponent className="w-4 h-4" weight={activeFilters.has(filter.id) ? "fill" : "regular"} />
                            {filter.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
