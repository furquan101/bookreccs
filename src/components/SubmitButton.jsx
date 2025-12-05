import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function SubmitButton({ disabled, onClick }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
          group relative flex items-center justify-center
          w-10 h-10 rounded-full
          transition-all duration-300
          ${disabled
                    ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                    : 'bg-white text-black hover:scale-110 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]'}
        `}
            aria-label={disabled ? 'Pick 2 books to continue' : 'Get Recommendations'}
        >
            <ArrowRight className={`w-5 h-5 transition-transform duration-300 ${!disabled && 'group-hover:translate-x-1'}`} />
        </button>
    );
}
