import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight } from 'lucide-react';
import { getAllPopularBooks, getHighPriorityBooks } from '../data/popularBooks';
import { titleToSlug } from '../utils/slugUtils';
import SEOHead from './SEOHead';

/**
 * Index page listing all "Books Like X" pages
 * This helps search engines discover all our SEO pages
 */
export default function BooksLikeIndexPage() {
    const allBooks = getAllPopularBooks();
    const highPriorityBooks = getHighPriorityBooks();
    
    // Group books by category
    const booksByCategory = allBooks.reduce((acc, book) => {
        if (!acc[book.category]) {
            acc[book.category] = [];
        }
        acc[book.category].push(book);
        return acc;
    }, {});

    const pageUrl = 'https://bookreccs.netlify.app/books-like';
    const categories = Object.keys(booksByCategory).sort();

    return (
        <>
            <SEOHead
                title="Books Like X - Find Similar Books Based on Reading Taste | Book Reccs"
                description="Discover books similar to your favorites. Browse our collection of 'Books Like X' pages featuring recommendations based on reading taste, themes, and writing style—not just genre."
                keywords="books like, similar books, book recommendations, reading taste, books similar to, find books like"
                url={pageUrl}
                image="https://bookreccs.netlify.app/book-reccs-cover.png"
                type="website"
            />
            <div className="min-h-screen w-full bg-background text-white">
                <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white mb-4">
                            Books Like Your Favorites
                        </h1>
                        <p className="text-lg md:text-xl text-gray-400 font-sans max-w-3xl mx-auto">
                            Discover books similar to popular titles. Our recommendations are based on reading taste, themes, and writing style—not just genre.
                        </p>
                    </div>

                    {/* High Priority Books Section */}
                    <div className="mb-16">
                        <h2 className="text-2xl md:text-3xl font-serif text-white mb-6">
                            Most Popular
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {highPriorityBooks.map((book) => (
                                <Link
                                    key={`${book.title}-${book.author}`}
                                    to={`/books-like/${titleToSlug(book.title)}`}
                                    className="group bg-[#181818] rounded-lg border border-[#3C3C3C] hover:border-[#3C3C3C] transition-all duration-300 p-4 flex items-center gap-4"
                                >
                                    <BookOpen className="w-8 h-8 text-gray-400 group-hover:text-white transition-colors shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base font-serif text-white group-hover:text-gray-200 transition-colors line-clamp-1">
                                            Books Like {book.title}
                                        </h3>
                                        <p className="text-sm text-gray-400 font-sans line-clamp-1">
                                            by {book.author}
                                        </p>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors shrink-0" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Books by Category */}
                    {categories.map((category) => (
                        <div key={category} className="mb-12">
                            <h2 className="text-2xl md:text-3xl font-serif text-white mb-6 capitalize">
                                {category.replace(/-/g, ' ')}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {booksByCategory[category].map((book) => (
                                    <Link
                                        key={`${book.title}-${book.author}`}
                                        to={`/books-like/${titleToSlug(book.title)}`}
                                        className="group bg-[#181818] rounded-lg border border-[#3C3C3C] hover:border-[#3C3C3C] transition-all duration-300 p-4 flex items-center gap-4"
                                    >
                                        <BookOpen className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-serif text-white group-hover:text-gray-200 transition-colors line-clamp-1">
                                                Books Like {book.title}
                                            </h3>
                                            <p className="text-xs text-gray-400 font-sans line-clamp-1">
                                                by {book.author}
                                            </p>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors shrink-0" />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Info Section */}
                    <div className="mt-16 p-6 bg-[#181818] rounded-lg border border-[#3C3C3C]">
                        <h3 className="text-xl font-serif text-white mb-3">
                            How We Recommend Books
                        </h3>
                        <p className="text-gray-300 font-sans leading-relaxed">
                            Our "Books Like X" pages don't just match genres—they find books with similar reading taste, 
                            themes, writing style, and emotional impact. Each page features 12 carefully selected recommendations 
                            that feel like natural next reads for anyone who loved the original book.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
