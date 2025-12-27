import { ArrowRight } from 'lucide-react';

export default function FeatureSection() {
    return (
        <section id="about" className="w-screen -mx-6 sm:-mx-8 grid grid-cols-1 md:grid-cols-2 min-h-[600px] rounded-lg overflow-hidden">
            <div className="flex flex-col justify-center px-8 md:px-24 py-16 md:py-24 bg-black order-2 md:order-1">
                <div className="max-w-xl">
                    <h2 className="text-3xl md:text-5xl font-serif text-white leading-tight mb-6">
                        Books you'll actually finish.
                    </h2>
                    <div className="flex flex-col gap-4 text-gray-400 font-sans text-base md:text-lg leading-relaxed mb-8">
                        <p>
                            We analyse ratings, reviews, trends, and hidden gems across the internet to deliver book recommendations you'll actually love.
                        </p>
                        <p>
                            Join 100s of readers discovering smarter reading lists every week.
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            const bookInput = document.querySelector('[data-book-input]') || document.querySelector('main');
                            if (bookInput) {
                                bookInput.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                        }}
                        className="group w-fit px-8 py-3 bg-transparent border border-white text-white rounded-[2px] font-sans font-medium text-base md:text-lg hover:bg-white hover:text-black transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0_8px_rgba(255,255,255,0.2)] flex items-center gap-2"
                    >
                        Discover your next read
                        <ArrowRight className="w-5 h-5 text-white group-hover:text-black transition-all duration-300 group-hover:translate-x-1" />
                    </button>
                </div>
            </div>

            <div className="relative w-full h-full min-h-[400px] order-1 md:order-2 overflow-hidden">
                <img
                    src={`${import.meta.env.BASE_URL}book-reccs-cover.png`}
                    alt="Book Reccs Cover"
                    className="w-full h-full object-cover"
                />
            </div>
        </section>
    );
}
