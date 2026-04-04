import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import BookCoverImg from './BookCoverImg';
import { CaretRight } from '@phosphor-icons/react';
import { searchBooks } from '../services/googleBooks';
import { searchBookVideos } from '../services/youtube';
import { getSimilarBooks, summarizeBookDescription } from '../services/gemini';
import { titleToSlug } from '../utils/slugUtils';
import SEOHead from './SEOHead';
import VideoCarousel from './VideoCarousel';
import Header from './Header';

export default function BookDetailPage() {
    const { title, author } = useParams();
    const navigate = useNavigate();
    const [bookDetails, setBookDetails] = React.useState(null);
    const [videos, setVideos] = React.useState([]);
    const [videosLoading, setVideosLoading] = React.useState(true);
    const [similarBooks, setSimilarBooks] = React.useState([]);
    const [similarBooksLoading, setSimilarBooksLoading] = React.useState(true);
    const [similarBooksDetails, setSimilarBooksDetails] = React.useState([]);
    const [bookSummary, setBookSummary] = React.useState(null);
    const [summaryLoading, setSummaryLoading] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);
    const similarBooksScrollRef = useRef(null);
    const isMountedRef = useRef(true);

    const decodedTitle = title ? decodeURIComponent(title) : '';
    const decodedAuthor = author ? decodeURIComponent(author) : '';

    useEffect(() => {
        if (!decodedTitle || !decodedAuthor) {
            navigate('/');
            return;
        }

        isMountedRef.current = true;
        setIsLoading(true);
        setVideosLoading(true);
        setSimilarBooksLoading(true);
        setBookDetails(null);
        setVideos([]);
        setSimilarBooks([]);
        setSimilarBooksDetails([]);
        setBookSummary(null);

        // Fetch cover and rating for the book
        const fetchDetails = async () => {
            if (!decodedTitle || !isMountedRef.current) return;
            
            try {
                const results = await searchBooks(`${decodedTitle} ${decodedAuthor}`);
                if (!isMountedRef.current) return;
                
                if (results.length > 0) {
                    const details = results[0];
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
                    
                    // Summarize description if available
                    if (details.description && isMountedRef.current) {
                        setSummaryLoading(true);
                        try {
                            const summary = await summarizeBookDescription(
                                details.description,
                                decodedTitle,
                                decodedAuthor
                            );
                            if (isMountedRef.current && summary) {
                                setBookSummary(summary);
                            } else if (isMountedRef.current) {
                                setBookSummary(null);
                            }
                        } catch (error) {
                            console.error("Error summarizing description:", error);
                            if (isMountedRef.current) {
                                setBookSummary(null);
                            }
                        } finally {
                            if (isMountedRef.current) {
                                setSummaryLoading(false);
                            }
                        }
                    } else if (isMountedRef.current) {
                        setBookSummary(null);
                        setSummaryLoading(false);
                    }
                }
            } catch (error) {
                console.error("Error fetching book details:", error);
                if (isMountedRef.current) {
                    setBookDetails(null);
                }
            } finally {
                if (isMountedRef.current) {
                    setIsLoading(false);
                }
            }
        };
        fetchDetails();

        // Fetch YouTube videos about the book
        const fetchVideos = async () => {
            if (!decodedTitle || !decodedAuthor || !isMountedRef.current) return;
            
            try {
                setVideosLoading(true);
                const videoResults = await searchBookVideos(
                    decodedTitle,
                    decodedAuthor,
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
            if (!decodedTitle || !decodedAuthor || !isMountedRef.current) return;
            
            setSimilarBooksLoading(true);
            try {
                const similar = await getSimilarBooks(
                    decodedTitle,
                    decodedAuthor,
                    [decodedTitle]
                );
                
                if (!isMountedRef.current) return;
                
                setSimilarBooks(similar || []);
                
                // Fetch book details for similar books
                if (similar && similar.length > 0 && isMountedRef.current) {
                    const detailsPromises = similar.map(async (book) => {
                        try {
                            const results = await searchBooks(`${book.title} ${book.author}`);
                            return results.length > 0 ? { ...book, ...results[0] } : book;
                        } catch (error) {
                            console.error(`Error fetching details for ${book.title}:`, error);
                            return book;
                        }
                    });
                    const details = await Promise.all(detailsPromises);
                    if (isMountedRef.current) {
                        setSimilarBooksDetails(details);
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
        };
    }, [decodedTitle, decodedAuthor, navigate]);

    // Show skeleton loaders instead of full-page loading

    const pageUrl = `https://bookreccs.ink/book/${encodeURIComponent(decodedTitle)}/${encodeURIComponent(decodedAuthor)}`;
    const bookTitle = bookDetails?.title || decodedTitle;
    const bookAuthor = bookDetails?.author || decodedAuthor;
    const bookDescription = bookSummary || bookDetails?.description?.replace(/<[^>]*>/g, '').substring(0, 160) || `Discover ${bookTitle} by ${bookAuthor} - book recommendations, reviews, and similar reads.`;
    const bookImage = bookDetails?.cover || 'https://bookreccs.ink/book-reccs-cover.png';

    return (
        <>
            <SEOHead
                title={`${bookTitle} by ${bookAuthor} | Book Reccs`}
                description={bookDescription}
                keywords={`${bookTitle}, ${bookAuthor}, book review, book recommendations, similar books, ${bookTitle} review`}
                url={pageUrl}
                image={bookImage}
                type="article"
            />
            <div className="min-h-screen w-full bg-background text-white">
                <Header showTitle={false} />
                {/* Back Arrow */}
                <div className="fixed top-6 left-6 z-50">
                    <button
                        onClick={() => navigate('/')}
                        className="bg-black/50 backdrop-blur-sm p-2 rounded-[7px] border border-white/10 text-white/80 hover:bg-white/10 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                        aria-label="Go back"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                </div>
                <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12 pt-24">

                {/* Main Content */}
                <div className="flex flex-col items-center text-center gap-6">
                    {/* Book Cover */}
                    <div className="w-32 h-48 md:w-40 md:h-60 bg-[#181818] rounded-lg shadow-lg overflow-hidden shrink-0 relative group">
                        {isLoading ? (
                            <div className="w-full h-full bg-[#0f0f0f] animate-pulse"></div>
                        ) : (
                            <BookCoverImg
                                src={bookDetails?.cover}
                                fallbackSrc={bookDetails?.coverFallback}
                                alt={decodedTitle}
                                className="w-full h-full object-cover"
                                iconClassName="w-full h-full text-gray-600"
                                loading="eager"
                                fetchPriority="high"
                            />
                        )}
                    </div>

                    {/* Title and Author */}
                    <div className="flex flex-col gap-3 items-center w-full">
                        {isLoading ? (
                            <div className="w-full space-y-3 animate-pulse">
                                <div className="h-10 bg-gray-800 rounded w-3/4 mx-auto"></div>
                                <div className="h-6 bg-gray-800 rounded w-1/2 mx-auto"></div>
                            </div>
                        ) : (
                            <>
                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-white leading-tight px-4 text-center">
                                    {bookDetails?.title || decodedTitle}
                                </h1>
                                <p className="text-lg md:text-xl text-gray-400 font-sans text-center">
                                    by {bookDetails?.author || decodedAuthor}
                                </p>
                            </>
                        )}

                        {/* Rating Display */}
                        {isLoading ? (
                            <div className="h-8 bg-gray-800 rounded-full w-32 mx-auto animate-pulse"></div>
                        ) : bookDetails?.rating && (
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
                                    <p className="text-white/80 font-sans text-base leading-relaxed text-center">
                                        {bookDetails.description.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim()}
                                    </p>
                                </div>
                            </div>
                        ) : null}
                    </div>

                    {/* Action Links */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full px-6">
                        <a
                            href={`https://www.goodreads.com/search?q=${encodeURIComponent(decodedTitle + ' ' + decodedAuthor)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-white/80 hover:text-white font-sans flex items-center justify-center gap-2 transition-all bg-[#181818] border border-[#3C3C3C] hover:border-white/40 hover:bg-white/5 rounded-full px-4 py-3 min-h-[44px] w-full"
                        >
                            View on Goodreads <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>

                    {/* YouTube Video Carousel */}
                    <VideoCarousel videos={videos} isLoading={videosLoading} />

                    {/* Similar Reads Section */}
                    {similarBooksLoading ? (
                        <div className="w-full mt-8">
                            <h3 className="text-2xl md:text-3xl font-sans text-white mb-4 text-center">
                                Similar reads
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
                                Similar reads
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
                                    <Link
                                        key={`${book.title}-${book.author}`}
                                        to={`/book/${encodeURIComponent(book.title)}/${encodeURIComponent(book.author)}`}
                                        className="flex-shrink-0 w-[200px] group"
                                    >
                                        <div className="bg-[#181818] rounded-lg overflow-hidden border border-[#3C3C3C] hover:border-[#3C3C3C] transition-all duration-300 h-full flex flex-col">
                                            <div className="relative w-[200px] h-[300px] bg-[#0f0f0f] overflow-hidden flex-shrink-0">
                                                <BookCoverImg
                                                    src={book.cover}
                                                    fallbackSrc={book.coverFallback}
                                                    alt={book.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    loading="lazy"
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
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
        </>
    );
}
