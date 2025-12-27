import React from 'react';

export default function Header() {
    return (
        <>
            {/* Top Navigation Bar */}
            <nav className="fixed top-0 right-0 z-50 pt-6 pr-6 sm:pr-8">
                <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm px-2 pt-2 pb-2 rounded-[7px] border border-white/10 whitespace-nowrap">
                    <a 
                        href="#trending"
                        onClick={(e) => {
                            e.preventDefault();
                            const element = document.getElementById('trending');
                            if (element) {
                                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                        }}
                        className="text-white/80 font-sans text-xs transition-colors uppercase hover:bg-white/10 px-2 py-0.5 rounded"
                    >
                        trending
                    </a>
                    <a 
                        href="#about"
                        onClick={(e) => {
                            e.preventDefault();
                            const element = document.getElementById('about');
                            if (element) {
                                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                        }}
                        className="text-white/80 font-sans text-xs transition-colors uppercase hover:bg-white/10 px-2 py-0.5 rounded"
                    >
                        about
                    </a>
                    <button
                        onClick={() => {
                            const bookInput = document.querySelector('[data-book-input]') || document.querySelector('main');
                            if (bookInput) {
                                bookInput.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                        }}
                        className="px-2 py-0.5 text-white/80 rounded-lg font-sans text-xs hover:bg-white/10 transition-colors uppercase whitespace-nowrap"
                    >
                        Get book picks
                    </button>
                </div>
            </nav>

            {/* Main Header */}
            <header className="flex flex-col gap-2 text-center items-center w-full">
                <h1 className="text-5xl md:text-7xl font-serif text-white tracking-tight">
                    Book Reccs
                </h1>
                <p className="text-lg md:text-xl text-gray-400 font-body">
                    Find your next favourite read
                </p>
            </header>
        </>
    );
}
