import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function SubmitButton({ disabled, onClick }) {
    return (
        <div className="relative group">
            <button
                onClick={onClick}
                disabled={disabled}
                className={`
          relative flex items-center justify-center
          w-11 h-11 rounded-full
          transition-all duration-300
          ${disabled
                    ? 'bg-[#D9D9D9] text-gray-600 cursor-not-allowed'
                    : 'bg-[#D9D9D9] text-black hover:scale-110 hover:shadow-[0_0_20px_rgba(217,217,217,0.3)]'}
        `}
                aria-label={disabled ? 'Pick 2 books to continue' : 'Get Recommendations'}
            >
                <ArrowRight className={`w-5 h-5 transition-transform duration-300 ${!disabled && 'group-hover:translate-x-1'}`} />
            </button>
            {disabled && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 border border-gray-700">
                    Must enter at least 2 books
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                        <div className="border-4 border-transparent border-t-gray-900"></div>
                    </div>
                </div>
            )}
        </div>
    );
}
