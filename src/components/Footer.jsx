import React from 'react';

export default function Footer() {
  return (
    <footer className="w-screen -mx-6 sm:-mx-8 border-t-[1px] border-white/10 pt-4 pb-1 mt-[100px]">
      <div className="text-center px-6 sm:px-8">
        <a
          href="https://www.furquan101.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/80 hover:text-white font-sans text-sm md:text-base transition-colors"
        >
          Created by Furquan Ahmad
        </a>
      </div>
    </footer>
  );
}

