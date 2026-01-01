import React from 'react';

const MobileNavOverlay = ({ isOpen, closeMenu, links }) => {
    return (
        <div
            className={`fixed inset-0 z-40 bg-zinc-950/98 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col items-center justify-center space-y-8
      ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
            <nav className="flex flex-col items-center space-y-6">
                {links.map((link) => (
                    <a
                        key={link.name}
                        href={link.href}
                        onClick={closeMenu}
                        className="text-2xl font-light text-white/90 hover:text-white hover:scale-105 transition-all duration-200"
                    >
                        {link.name}
                    </a>
                ))}
            </nav>

            {/* Decorative separator */}
            <div className="w-12 h-px bg-white/20"></div>

            <div className="flex flex-col items-center space-y-4">
                <p className="text-white/40 text-sm">Book Reccs</p>
            </div>
        </div>
    );
};

export default MobileNavOverlay;
