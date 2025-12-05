export default function FeatureSection() {
    return (
        <section className="w-full grid grid-cols-1 md:grid-cols-2 min-h-[500px]">
            <div className="flex flex-col justify-center px-8 md:px-24 py-16 md:py-24 bg-black order-2 md:order-1">
                <div className="max-w-xl">
                    <h2 className="text-3xl md:text-5xl font-serif text-white leading-tight mb-6">
                        Books you'll actually finish.
                    </h2>
                    <div className="flex flex-col gap-4 text-gray-400 font-sans text-base md:text-lg leading-relaxed">
                        <p>
                            We analyse ratings, reviews, trends, and hidden gems across the internet to deliver book recommendations you'll actually love.
                        </p>
                        <p>
                            Join 100s of readers discovering smarter reading lists every week.
                        </p>
                    </div>
                </div>
            </div>

            <div className="relative w-full h-full min-h-[400px] bg-[#A7A4FF] flex items-center justify-center order-1 md:order-2 p-12">
                <img
                    src="/bookreccs/book-reccs-cover.png"
                    alt="Book Reccs Cover"
                    className="w-full max-w-xs h-auto object-contain shadow-2xl transform rotate-[-5deg] hover:rotate-0 transition-transform duration-500"
                />
            </div>
        </section>
    );
}
