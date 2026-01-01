import React, { useState, useEffect, useRef } from 'react';
import { Menu, X } from 'lucide-react';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };

        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen]);

    // Close menu when clicking a link
    const handleLinkClick = (callback) => {
        setIsMenuOpen(false);
        callback();
    };

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const scrollToBookInput = () => {
        const bookInput = document.querySelector('[data-book-input]') || document.querySelector('main');
        if (bookInput) {
            bookInput.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <>
            {/* Top Navigation Bar */}
            <nav className="fixed top-0 right-0 z-50 pt-6 pr-6 sm:pr-8" ref={menuRef}>
                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-2 bg-black/50 backdrop-blur-sm px-2 pt-2 pb-2 rounded-[7px] border border-white/10 whitespace-nowrap">
                    <a 
                        href="#trending"
                        onClick={(e) => {
                            e.preventDefault();
                            scrollToSection('trending');
                        }}
                        className="text-white/80 font-sans text-xs transition-colors uppercase hover:bg-white/10 px-2 py-0.5 rounded"
                    >
                        trending
                    </a>
                    <a 
                        href="#about"
                        onClick={(e) => {
                            e.preventDefault();
                            scrollToSection('about');
                        }}
                        className="text-white/80 font-sans text-xs transition-colors uppercase hover:bg-white/10 px-2 py-0.5 rounded"
                    >
                        about
                    </a>
                    <button
                        onClick={scrollToBookInput}
                        className="px-2 py-0.5 text-white/80 rounded-lg font-sans text-xs hover:bg-white/10 transition-colors uppercase whitespace-nowrap"
                    >
                        Get book picks
                    </button>
                </div>

                {/* Mobile Hamburger Menu */}
                <div className="md:hidden">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="bg-black/50 backdrop-blur-sm p-2 rounded-[7px] border border-white/10 text-white/80 hover:bg-white/10 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                        aria-label="Toggle menu"
                        aria-expanded={isMenuOpen}
                    >
                        {isMenuOpen ? (
                            <X className="w-5 h-5" />
                        ) : (
                            <Menu className="w-5 h-5" />
                        )}
                    </button>

                    {/* Mobile Menu Dropdown */}
                    {isMenuOpen && (
                        <div className="absolute right-0 mt-2 bg-black/90 backdrop-blur-sm rounded-lg border border-white/10 shadow-xl min-w-[180px] overflow-hidden">
                            <a 
                                href="#trending"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleLinkClick(() => scrollToSection('trending'));
                                }}
                                className="block text-white/80 font-sans text-xs uppercase hover:bg-white/10 px-4 py-3 transition-colors"
                            >
                                trending
                            </a>
                            <a 
                                href="#about"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleLinkClick(() => scrollToSection('about'));
                                }}
                                className="block text-white/80 font-sans text-xs uppercase hover:bg-white/10 px-4 py-3 transition-colors border-t border-white/10"
                            >
                                about
                            </a>
                            <button
                                onClick={() => handleLinkClick(scrollToBookInput)}
                                className="block w-full text-left text-white/80 font-sans text-xs uppercase hover:bg-white/10 px-4 py-3 transition-colors border-t border-white/10"
                            >
                                Get book picks
                            </button>
                        </div>
                    )}
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
