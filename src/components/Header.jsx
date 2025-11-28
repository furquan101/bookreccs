import React from 'react';

export default function Header() {
    return (
        <header className="flex flex-col gap-2 text-left w-full">
            <h1 className="text-5xl md:text-7xl font-serif text-white tracking-tight">
                Book Reccs
            </h1>
            <p className="text-lg md:text-xl text-gray-400 font-body">
                Find your next favourite read
            </p>
        </header>
    );
}
