import React from 'react';

const HamburgerMenu = ({ isOpen, toggleMenu }) => {
    return (
        <button
            onClick={toggleMenu}
            className={`relative w-8 h-8 flex flex-col justify-center items-center group z-50 md:hidden focus:outline-none`}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
        >
            <span
                className={`block h-0.5 w-6 bg-white rounded-full transition-all duration-300 ease-out 
        ${isOpen ? 'rotate-45 translate-y-1.5' : '-translate-y-1'}`}
            />
            <span
                className={`block h-0.5 w-6 bg-white rounded-full transition-all duration-300 ease-out 
        ${isOpen ? 'opacity-0' : 'opacity-100'}`}
            />
            <span
                className={`block h-0.5 w-6 bg-white rounded-full transition-all duration-300 ease-out 
        ${isOpen ? '-rotate-45 -translate-y-1.5' : 'translate-y-1'}`}
            />
        </button>
    );
};

export default HamburgerMenu;
