import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function SubmitButton({ disabled, onClick }) {
    return (
        <div className="w-full flex justify-end">
            <button
                onClick={onClick}
                disabled={disabled}
                className={`
          group relative flex items-center justify-center gap-2 
          w-full md:w-auto md:min-w-[160px] h-12 md:h-14 px-8 rounded-full 
          transition-all duration-300
          ${disabled
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        : 'bg-white text-black hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]'}
        `}
            >
                <span className="font-body font-medium text-lg">
                    {disabled ? 'Pick 2 books' : 'Get Recommendations'}
                </span>
                <ArrowRight className={`w-5 h-5 transition-transform duration-300 ${!disabled && 'group-hover:translate-x-1'}`} />
            </button>
        </div >
    );
}
