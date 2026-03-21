import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { X, ExternalLink, ArrowRight } from 'lucide-react';
import BookCoverImg from './BookCoverImg';
import { CaretRight } from '@phosphor-icons/react';
import { searchBooks } from '../services/googleBooks';
import { searchBookVideos } from '../services/youtube';
import { getSimilarBooks, summarizeBookDescription } from '../services/gemini';
import { generateReadingTasteProfile } from '../services/readingTaste';
import { titleToSlug } from '../utils/slugUtils';
import VideoCarousel from './VideoCarousel';

export default function RecommendationModal({ recommendation, onClose, onReset, onRetry, selectedBooks }) {
    const navigate = useNavigate();
    const [tasteProfile, setTasteProfile] = useState(null);
    const [bookDetails, setBookDetails] = React.useState(null);
    const [videos, setVideos] = React.useState([]);
    const [videosLoading, setVideosLoading] = React.useState(true);
    const [similarBooks, setSimilarBooks] = React.useState([]);
    const [similarBooksLoading, setSimilarBooksLoading] = React.useState(true);
    const [similarBooksDetails, setSimilarBooksDetails] = React.useState([]);
    const [bookSummary, setBookSummary] = React.useState(null);
    const [summaryLoading, setSummaryLoading] = React.useState(false);
    const similarBooksScrollRef = useRef(null);
    const isMountedRef = useRef(true);

    useEffect(() => {
        if (!recommendation) return;
        
        // Reset loading states when new recommendation comes in
        setVideosLoading(true);
        setSimilarBooksLoading(true);
        setBookDetails(null);
        setVideos([]);
        setSimilarBooks([]);
        setSimilarBooksDetails([]);
        setBookSummary(null);
        setTasteProfile(null);
        isMountedRef.current = true;

        // Generate reading taste profile in the background (for "Learn More" link)
        if (selectedBooks && selectedBooks.length >= 2) {
            generateReadingTasteProfile(selectedBooks)
                .then(profile => {
                    if (isMountedRef.current) {
                        setTasteProfile(profile);
                    }
                })
                .catch(error => {
                    console.error("Error generating taste profile:", error);
                });
        }

        // Handle escape key to close modal
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        
        // Store reference for cleanup
        const escapeHandler = handleEscape;

        // Trigger confetti only if NOT trending and NOT from View button
        if (!recommendation.isTrending && !recommendation.skipConfetti) {
            const duration = 3000;
            const end = Date.now() + duration;

            const frame = () => {
                confetti({
                    particleCount: 2,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#ffffff', '#a8a8a8', '#555555']
                });
                confetti({
                    particleCount: 2,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#ffffff', '#a8a8a8', '#555555']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            };
            frame();
        }

        // Fetch cover and rating for the recommended book (prioritize cover)
        const fetchDetails = async () => {
            if (!recommendation?.title || !isMountedRef.current) return;
            
            try {
                const results = await searchBooks(`${recommendation.title} ${recommendation.author}`);
                if (!isMountedRef.current) return;
                
                if (results.length > 0) {
                    const details = results[0];
                    
                    // Debug: Log if description is missing
                    if (!details.description) {
                        console.debug(`No description found for: ${details.title} by ${details.author}`);
                    }
                    
                    // Set book details immediately to load cover ASAP
                    setBookDetails(details);
                    
                    // Preload cover image if available
                    if (details.cover) {
                        const link = document.createElement('link');
                        link.rel = 'preload';
                        link.as = 'image';
                        link.href = details.cover;
                        link.fetchPriority = 'high';
                        document.head.appendChild(link);
                    }
                    
                    // Summarize description if available (do this after cover is set)
                    if (details.description && isMountedRef.current) {
                        setSummaryLoading(true);
                        try {
                            const summary = await summarizeBookDescription(
                                details.description,
                                recommendation.title,
                                recommendation.author
                            );
                            if (isMountedRef.current && summary) {
                                setBookSummary(summary);
                            } else if (isMountedRef.current) {
                                // If summary is empty/null, fallback to original description
                                // bookDetails.description will be used as fallback in render
                                setBookSummary(null);
                            }
                        } catch (error) {
                            console.error("Error summarizing description:", error);
                            // Fallback to original description - bookDetails.description will be used
                            if (isMountedRef.current) {
                                setBookSummary(null);
                            }
                        } finally {
                            if (isMountedRef.current) {
                                setSummaryLoading(false);
                            }
                        }
                    } else if (isMountedRef.current) {
                        // No description available from Google Books
                        setBookSummary(null);
                        setSummaryLoading(false);
                    }
                }
            } catch (error) {
                console.error("Error fetching book details:", error);
                if (isMountedRef.current) {
                    setBookDetails(null);
                }
            }
        };
        fetchDetails();

        // Fetch YouTube videos about the book
        const fetchVideos = async () => {
            if (!recommendation?.title || !recommendation?.author || !isMountedRef.current) return;
            
            try {
                setVideosLoading(true);
                const videoResults = await searchBookVideos(
                    recommendation.title,
                    recommendation.author,
                    6
                );
                if (isMountedRef.current) {
                    setVideos(videoResults || []);
                    setVideosLoading(false);
                }
            } catch (error) {
                console.error("Error fetching videos:", error);
                if (isMountedRef.current) {
                    setVideos([]);
                    setVideosLoading(false);
                }
            }
        };
        fetchVideos();

        // Fetch similar books
        const fetchSimilarBooks = async () => {
            if (!recommendation?.title || !recommendation?.author || !isMountedRef.current) return;

            setSimilarBooksLoading(true);
            try {
                const similar = await getSimilarBooks(
                    recommendation.title,
                    recommendation.author,
                    [recommendation.title]
                );

                if (!isMountedRef.current) return;

                setSimilarBooks(similar || []);

                if (similar && similar.length > 0 && isMountedRef.current) {
                    // Fetch book details (covers, ratings) for each Gemini-recommended similar book
                    const detailsPromises = similar.map(async (book) => {
                        try {
                            const results = await searchBooks(`${book.title} ${book.author}`);
                            return results.length > 0 ? { ...book, ...results[0] } : book;
                        } catch (error) {
                            console.error(`Error fetching details for ${book.title}:`, error);
                            return book; // Return book without details on error
                        }
                    });
                    const details = await Promise.all(detailsPromises);
                    if (isMountedRef.current) {
                        setSimilarBooksDetails(details);
                    }
                } else if (isMountedRef.current) {
                    // Gemini unavailable — fall back to other books by the same author
                    try {
                        const authorBooks = await searchBooks(recommendation.author);
                        const filtered = authorBooks
                            .filter(b => b.title?.toLowerCase() !== recommendation.title?.toLowerCase())
                            .slice(0, 4);
                        if (isMountedRef.current && filtered.length > 0) {
                            setSimilarBooksDetails(filtered);
                        }
                    } catch {
                        // No fallback available — section stays hidden
                    }
                }
            } catch (error) {
                console.error("Error fetching similar books:", error);
                if (isMountedRef.current) {
                    setSimilarBooks([]);
                    setSimilarBooksDetails([]);
                }
            } finally {
                if (isMountedRef.current) {
                    setSimilarBooksLoading(false);
                }
            }
        };
        fetchSimilarBooks();

        return () => {
            isMountedRef.current = false;
            document.removeEventListener('keydown', escapeHandler);
        };
    }, [recommendation, onClose]); // Keep onClose but it should be stable

    if (!recommendation) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
            <div 
                className="relative w-full max-w-2xl md:max-w-3xl lg:max-w-4xl bg-[#0f0f0f] rounded-lg p-6 md:p-8 shadow-2xl flex flex-col items-center text-center gap-6 max-h-[80vh] overflow-y-auto scrollbar-hide mx-auto"
                role="dialog"
                aria-modal="true"
                aria-labelledby="recommendation-title"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10 p-3 -mt-2 -mr-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                    aria-label="Close recommendation modal"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="w-32 h-48 md:w-40 md:h-60 bg-[#181818] rounded-lg shadow-lg overflow-hidden shrink-0 relative group">
                    <BookCoverImg
                        src={bookDetails?.cover || recommendation.cover}
                        fallbackSrc={bookDetails?.coverFallback || recommendation.coverFallback}
                        alt={recommendation.title}
                        className="w-full h-full object-cover"
                        iconClassName="w-full h-full text-gray-600"
                        loading="eager"
                        fetchPriority="high"
                    />
                </div>

                <div className="flex flex-col gap-3 items-center w-full">
                    <h2 id="recommendation-title" className="text-3xl md:text-4xl font-serif text-white leading-tight px-4 text-center">
                        {bookDetails?.title || recommendation.title}
                    </h2>
                    <p className="text-lg md:text-xl text-gray-400 font-sans text-center">
                        by {bookDetails?.author || recommendation.author}
                    </p>

                    {/* Rating Display */}
                    {bookDetails?.rating && (
                        <div className="flex items-center justify-center gap-2 mt-2 bg-gray-800/50 px-4 py-2 rounded-full border border-[#3C3C3C]">
                            <div className="flex text-yellow-500">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} className={`w-4 h-4 ${i < Math.round(bookDetails.rating) ? 'fill-current' : 'text-gray-600 fill-current'}`} viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                            <span className="text-sm text-gray-300 font-sans">
                                {bookDetails.rating}/5 <span className="text-gray-500">({bookDetails.ratingsCount || 0})</span>
                            </span>
                        </div>
                    )}

                    {/* Book Description */}
                    {summaryLoading ? (
                        <div className="w-full px-6">
                            <div className="bg-[#181818] rounded-lg border border-[#3C3C3C] p-4">
                                <div className="animate-pulse space-y-2">
                                    <div className="h-4 bg-gray-700 rounded w-3/4 mx-auto"></div>
                                    <div className="h-4 bg-gray-700 rounded w-full"></div>
                                    <div className="h-4 bg-gray-700 rounded w-5/6 mx-auto"></div>
                                </div>
                            </div>
                        </div>
                    ) : bookSummary ? (
                        <div className="w-full px-6">
                            <div className="bg-[#181818] rounded-lg border border-[#3C3C3C] p-4 hover:border-[#3C3C3C] transition-all duration-300">
                                <p className="text-white/80 font-sans text-base leading-relaxed text-center">
                                    {bookSummary}
                                </p>
                            </div>
                        </div>
                    ) : (bookDetails?.description && bookDetails.description.trim().length > 0) ? (
                        <div className="w-full px-6">
                            <div className="bg-[#181818] rounded-lg border border-[#3C3C3C] p-4 hover:border-[#3C3C3C] transition-all duration-300">
                                <p className="text-white/80 font-sans text-base leading-relaxed text-center line-clamp-4">
                                    {bookDetails.description.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim().substring(0, 300)}
                                    {bookDetails.description.replace(/<[^>]*>/g, '').trim().length > 300 ? '...' : ''}
                                </p>
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 w-full px-6">
                    <a
                        href={`https://www.goodreads.com/search?q=${encodeURIComponent(recommendation.title + ' ' + recommendation.author)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-white/80 hover:text-white font-sans flex items-center justify-center gap-2 transition-all bg-[#181818] border border-[#3C3C3C] hover:border-white/40 hover:bg-white/5 rounded-full px-4 py-3 min-h-[44px] flex-1"
                    >
                        View on Goodreads <ExternalLink className="w-3 h-3" />
                    </a>
                    
                    {/* Show "See all similar books" for reading taste pages (with selectedBooks) */}
                    {tasteProfile && selectedBooks && selectedBooks.length >= 2 && (
                        <button
                            onClick={() => {
                                navigate(`/reading-taste/${tasteProfile}`, {
                                    state: { 
                                        selectedBooks,
                                        fromModal: true
                                    }
                                });
                                onClose();
                            }}
                            className="text-sm text-white/80 hover:text-white font-sans flex items-center justify-center gap-2 transition-all bg-[#181818] border border-[#3C3C3C] hover:border-white/40 hover:bg-white/5 rounded-full px-4 py-3 min-h-[44px] flex-1"
                        >
                            See all similar books
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    )}
                    
                    {/* Show "See all similar books" for trending books (links to Books Like X page) */}
                    {recommendation.isTrending && (
                        <button
                            onClick={() => {
                                const bookSlug = titleToSlug(recommendation.title);
                                navigate(`/books-like/${bookSlug}`);
                                onClose();
                            }}
                            className="text-sm text-white/80 hover:text-white font-sans flex items-center justify-center gap-2 transition-all bg-[#181818] border border-[#3C3C3C] hover:border-white/40 hover:bg-white/5 rounded-full px-4 py-3 min-h-[44px] flex-1"
                        >
                            See all similar books
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* YouTube Video Carousel */}
                <VideoCarousel videos={videos} isLoading={videosLoading} />

                {/* Similar Reads Section */}
                {similarBooksLoading ? (
                    <div className="w-full mt-8">
                        <h3 className="text-2xl md:text-3xl font-sans text-white mb-4 text-center">
                            A few similar books
                        </h3>
                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex-shrink-0 w-[200px] animate-pulse">
                                    <div className="bg-[#181818] rounded-lg overflow-hidden border border-[#3C3C3C]">
                                        <div className="w-[200px] h-[300px] bg-[#0f0f0f]" />
                                        <div className="pt-2 px-2 pb-1 space-y-2">
                                            <div className="h-3 bg-[#0f0f0f] rounded w-full" />
                                            <div className="h-3 bg-[#0f0f0f] rounded w-3/4" />
                                        </div>
                                    </div>
                                </div>
                                ))}
                            </div>
                        </div>
                ) : similarBooksDetails.length > 0 ? (
                    <div className="w-full mt-8 relative">
                        <h3 className="text-2xl md:text-3xl font-sans text-white mb-4 text-center">
                            A few similar books
                        </h3>
                        <button
                            onClick={() => {
                                if (similarBooksScrollRef.current) {
                                    similarBooksScrollRef.current.scrollBy({ left: 250, behavior: 'smooth' });
                                }
                            }}
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-[#0f0f0f] border border-[#3C3C3C] rounded-full p-2 hover:bg-[#181818] hover:border-[#3C3C3C] transition-all duration-300 opacity-80 hover:opacity-100"
                            aria-label="Scroll right"
                        >
                            <CaretRight className="w-5 h-5 text-white" weight="fill" />
                        </button>
                        <div ref={similarBooksScrollRef} className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide scroll-smooth">
                            {similarBooksDetails.map((book) => (
                                <a
                                    key={`${book.title}-${book.author}`}
                                    href={`https://www.goodreads.com/search?q=${encodeURIComponent(book.title + ' ' + book.author)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-shrink-0 w-[200px] group"
                                >
                                    <div className="bg-[#181818] rounded-lg overflow-hidden border border-[#3C3C3C] hover:border-[#3C3C3C] transition-all duration-300 h-full flex flex-col">
                                        <div className="relative w-[200px] h-[300px] bg-[#0f0f0f] overflow-hidden flex-shrink-0">
                                            <BookCoverImg
                                                src={book.cover}
                                                fallbackSrc={book.coverFallback}
                                                alt={book.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                loading="eager"
                                                fetchPriority="high"
                                            />
                                        </div>
                                        <div className="pt-2 px-2 pb-1 flex flex-col flex-1">
                                            <h4 className="text-xs font-sans text-white line-clamp-2 leading-tight group-hover:text-gray-200 mb-1 font-medium">
                                                {book.title}
                                            </h4>
                                            <p className="text-xs text-gray-400 font-sans line-clamp-1">
                                                {book.author}
                                            </p>
                                            {book.rating && (
                                                <div className="flex items-center gap-1 mt-1">
                                                    <div className="flex text-yellow-500">
                                                        <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                    </div>
                                                    <span className="text-xs text-gray-400 font-sans">
                                                        {book.rating}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
