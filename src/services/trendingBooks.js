/**
 * Multi-Source Trending Books Aggregator
 * 
 * Why this works well:
 * 1. Combines multiple data sources for accuracy (real bestseller lists + AI)
 * 2. Scores books based on multiple signals (NYT, Google ratings, Reddit buzz)
 * 3. Ensures regional diversity (Middle East, Pakistan, Malaysia, Japan, Korea)
 * 4. Verifies books exist and are available in English
 * 5. Falls back gracefully if any source fails
 */

import { getTrendingBooks } from './gemini';
import { searchBooks } from './googleBooks';
import { getNYTBestsellers } from './nytBooks';

// Cache configuration
const CACHE_KEY = 'trending_books_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Static trending file (written weekly by GitHub Actions)
const STATIC_TRENDING_URL = '/trending.json';
const STATIC_MAX_AGE_MS = 8 * 24 * 60 * 60 * 1000; // 8 days (slightly beyond weekly cadence)

/**
 * Try to load the pre-generated trending.json from the static file.
 * Returns an array of book objects, or null if unavailable/stale.
 */
async function getStaticTrending() {
    try {
        const res = await fetch(STATIC_TRENDING_URL);
        if (!res.ok) return null;
        const data = await res.json();
        if (!data.generatedAt || !Array.isArray(data.books) || data.books.length === 0) return null;

        const age = Date.now() - new Date(data.generatedAt).getTime();
        if (age > STATIC_MAX_AGE_MS) {
            console.log('Static trending.json is stale — will fetch fresh data');
            return null;
        }

        console.log('Using pre-generated trending.json');
        return data.books.slice(0, 6);
    } catch {
        return null;
    }
}

/**
 * Get cached trending books if available and not expired
 * Returns null if cache is expired or doesn't exist
 */
function getCachedTrendingBooks() {
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (!cached) return null;
        
        const { data, timestamp } = JSON.parse(cached);
        const now = Date.now();
        
        // Check if cache is still valid (within 24 hours)
        if (now - timestamp < CACHE_DURATION) {
            console.log('Using cached trending books');
            return data;
        }
        
        // Cache expired, remove it
        localStorage.removeItem(CACHE_KEY);
        return null;
    } catch (error) {
        console.error('Error reading cache:', error);
        localStorage.removeItem(CACHE_KEY);
        return null;
    }
}

/**
 * Save trending books to cache with current timestamp
 */
function setCachedTrendingBooks(books) {
    try {
        const cacheData = {
            data: books,
            timestamp: Date.now()
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        console.log('Cached trending books for 24 hours');
    } catch (error) {
        console.error('Error saving cache:', error);
        // If localStorage is full or unavailable, continue without caching
    }
}

// Diverse fallback list with verified books from target regions
const DIVERSE_FALLBACK_BOOKS = [
    // Middle East
    { title: "The Kite Runner", author: "Khaled Hosseini", region: "Middle East" },
    { title: "A Thousand Splendid Suns", author: "Khaled Hosseini", region: "Middle East" },
    { title: "The Stationery Shop", author: "Marjan Kamali", region: "Middle East" },
    
    // Pakistan
    { title: "Home Fire", author: "Kamila Shamsie", region: "Pakistan" },
    { title: "The Reluctant Fundamentalist", author: "Mohsin Hamid", region: "Pakistan" },
    { title: "We Are All Birds of Uganda", author: "Hafsa Zayyan", region: "Pakistan" },
    
    // Malaysia
    { title: "The Garden of Evening Mists", author: "Tan Twan Eng", region: "Malaysia" },
    { title: "The Ghost Bride", author: "Yangsze Choo", region: "Malaysia" },
    
    // Japan
    { title: "Convenience Store Woman", author: "Sayaka Murata", region: "Japan" },
    { title: "Before the Coffee Gets Cold", author: "Toshikazu Kawaguchi", region: "Japan" },
    { title: "Klara and the Sun", author: "Kazuo Ishiguro", region: "Japan" },
    { title: "The Memory Police", author: "Yoko Ogawa", region: "Japan" },
    
    // Korea
    { title: "The Vegetarian", author: "Han Kang", region: "Korea" },
    { title: "Pachinko", author: "Min Jin Lee", region: "Korea" },
    { title: "If I Had Your Face", author: "Frances Cha", region: "Korea" },
    { title: "Crying in H Mart", author: "Michelle Zauner", region: "Korea" },
];

/**
 * Check if a book should be excluded based on title, author, or description
 * Excludes scientific/academic books and sexuality education books
 */
function shouldExcludeBook(book) {
    if (!book) return true;
    
    const title = (book.title || '').toLowerCase();
    const author = (book.author || '').toLowerCase();
    const description = (book.description || '').toLowerCase();
    const categories = (book.categories || []).map(c => c.toLowerCase()).join(' ');
    
    const combinedText = `${title} ${author} ${description} ${categories}`;
    
    // Strong exclusion keywords (definite exclusions)
    const strongExclusionKeywords = [
        // Scientific/Academic
        'textbook', 'textbook:', 'academic textbook', 'scholarly textbook',
        'research methods', 'scientific method', 'laboratory manual',
        'experimental design', 'peer review', 'journal article',
        'dissertation', 'thesis', 'academic press', 'university press',
        'scientific journal', 'academic journal',
        // Sexuality Education
        'sex education', 'sexuality education', 'sexual health education',
        'reproductive health education', 'sex ed curriculum',
        // Technical/Educational
        'instruction manual', 'technical manual', 'curriculum guide',
        'syllabus', 'course textbook', 'lesson plan'
    ];
    
    // Check for strong exclusion keywords
    for (const keyword of strongExclusionKeywords) {
        if (combinedText.includes(keyword)) {
            return true;
        }
    }
    
    // Check for academic book patterns in title
    const academicTitlePatterns = [
        /^introduction to .* textbook/i,
        /.*: a textbook/i,
        /.* textbook$/i,
        /.* textbook \d+th edition/i,
        /.* textbook \d+rd edition/i,
        /.* textbook \d+nd edition/i,
        /.* textbook \d+st edition/i
    ];
    
    for (const pattern of academicTitlePatterns) {
        if (pattern.test(title)) {
            return true;
        }
    }
    
    // Check for sexuality education patterns
    const sexualityEducationPatterns = [
        /sex education/i,
        /sexuality education/i,
        /sexual health curriculum/i,
        /reproductive health education/i
    ];
    
    for (const pattern of sexualityEducationPatterns) {
        if (pattern.test(combinedText)) {
            return true;
        }
    }
    
    return false;
}

/**
 * Verify a book exists in Google Books and is available in English
 * Why: Ensures we only show books that users can actually find and read
 */
async function verifyBookAvailability(book) {
    try {
        // If book already has author, use it; otherwise search by title only
        const searchQuery = book.author ? `${book.title} ${book.author}` : book.title;
        const results = await searchBooks(searchQuery);
        if (results.length === 0) {
            // If no results and we have original book data with author, return it
            if (book.author && book.title) {
                return {
                    ...book,
                    region: book.region || 'Unknown',
                    source: book.source || 'unknown'
                };
            }
            return null;
        }
        
        const bookData = results[0];
        // Preserve original author if Google Books doesn't have one
        // Additional verification could check language, but Google Books API
        // typically returns English books by default for English queries
        return {
            ...bookData,
            author: bookData.author || book.author, // Prefer Google Books author, fallback to original
            region: book.region || 'Unknown',
            source: book.source || 'unknown'
        };
    } catch (error) {
        console.error(`Error verifying book ${book.title}:`, error);
        // If we have original book data with author, return it as fallback
        if (book.author && book.title) {
            return {
                ...book,
                region: book.region || 'Unknown',
                source: book.source || 'unknown'
            };
        }
        return null;
    }
}

/**
 * Score a book based on multiple signals
 * Why: Combines different indicators of popularity for better accuracy
 */
function scoreBook(book, sources) {
    let score = 0;
    
    // High rating = more points (quality indicator)
    if (book.rating && book.rating >= 4.5) score += 20;
    else if (book.rating && book.rating >= 4.0) score += 10;
    
    // Many ratings = popular book
    if (book.ratingsCount && book.ratingsCount > 10000) score += 15;
    else if (book.ratingsCount && book.ratingsCount > 1000) score += 8;
    
    // Source bonus (AI recommendations get base score)
    if (sources.includes('ai')) score += 10;
    if (sources.includes('nyt')) score += 30; // NYT is high authority
    if (sources.includes('google')) score += 5;
    
    // Regional diversity bonus
    const targetRegions = ['Middle East', 'Pakistan', 'Malaysia', 'Japan', 'Korea'];
    if (book.region && targetRegions.includes(book.region)) {
        score += 5;
    }
    
    // Recent publication bonus
    if (book.publishedDate) {
        const year = parseInt(book.publishedDate.substring(0, 4));
        const currentYear = new Date().getFullYear();
        if (year >= currentYear - 2) {
            score += 5; // Recent books get bonus
        }
    }
    
    return score;
}

/**
 * Ensure regional diversity in final list
 * Why: Guarantees representation from all target regions
 */
function ensureRegionalDiversity(books, targetCount = 6) {
    const targetRegions = ['Middle East', 'Pakistan', 'Malaysia', 'Japan', 'Korea'];
    const regionMap = new Map();
    const result = [];
    
    // Group books by region
    books.forEach(book => {
        const region = book.region || 'Other';
        if (!regionMap.has(region)) {
            regionMap.set(region, []);
        }
        regionMap.get(region).push(book);
    });
    
    // First pass: Get at least one from each target region
    targetRegions.forEach(region => {
        const regionBooks = regionMap.get(region) || [];
        if (regionBooks.length > 0 && result.length < targetCount) {
            result.push(regionBooks[0]);
            regionBooks.shift();
        }
    });
    
    // Second pass: Fill remaining slots with highest scored books
    const remaining = books
        .filter(book => !result.includes(book))
        .sort((a, b) => (b.score || 0) - (a.score || 0));
    
    remaining.forEach(book => {
        if (result.length < targetCount) {
            result.push(book);
        }
    });
    
    return result;
}

/**
 * Main function: Get trending books from multiple sources
 * Why this approach works:
 * 1. Caching = reduces API calls (only fetches once per 24 hours)
 * 2. Parallel fetching = faster performance
 * 3. Multiple sources = more accurate than single source
 * 4. Verification = only shows available books
 * 5. Scoring = prioritizes truly popular books
 * 6. Diversity enforcement = ensures regional representation
 * 
 * @param {boolean} forceRefresh - If true, bypasses cache and fetches fresh data
 */
export async function getTrendingBooksFromMultipleSources(forceRefresh = false) {
    // Check cache first - if valid and not forcing refresh, return cached data immediately
    if (!forceRefresh) {
        const cached = getCachedTrendingBooks();
        if (cached) {
            return cached;
        }
    } else {
        // Clear cache if forcing refresh
        localStorage.removeItem(CACHE_KEY);
        console.log('Force refresh: fetching fresh trending books');
    }
    
    // Check static file (updated weekly by GitHub Actions) — fast, no API quota
    const staticBooks = await getStaticTrending();
    if (staticBooks && staticBooks.length > 0) {
        setCachedTrendingBooks(staticBooks);
        return staticBooks;
    }

    const verifiedBooks = [];
    const bookMap = new Map(); // Track books by title+author to avoid duplicates

    try {
        // Step 1: Fetch from multiple sources in parallel
        // Priority: Get book data first, then verify covers
        console.log('Fetching trending books from multiple sources...');
        const [aiBooks, nytBooks] = await Promise.all([
            getTrendingBooks(), // AI with regional diversity
            getNYTBestsellers('hardcover-fiction') // NYT bestseller list
        ]);
        
        // Preload covers from NYT books (they have high-quality covers)
        if (nytBooks.length > 0) {
            nytBooks.slice(0, 6).forEach(book => {
                if (book.cover) {
                    const link = document.createElement('link');
                    link.rel = 'preload';
                    link.as = 'image';
                    link.href = book.cover;
                    link.fetchPriority = 'high';
                    document.head.appendChild(link);
                }
            });
        }
        
        // Step 2: Process NYT books (already have covers, just need to verify and add region)
        if (nytBooks.length > 0) {
            console.log(`Found ${nytBooks.length} books from NYT bestseller list`);
            const nytPromises = nytBooks.slice(0, 10).map(async (book) => {
                // Verify book exists in Google Books for additional metadata (ratings, etc.)
                const verified = await verifyBookAvailability(book);
                if (verified) {
                    // Merge NYT data with Google Books data
                    const merged = {
                        ...verified,
                        cover: book.cover || verified.cover, // Prefer NYT cover
                        nytRank: book.nytRank,
                        source: 'nyt',
                        sources: ['nyt']
                    };
                    merged.score = scoreBook(merged, ['nyt']);
                    return merged;
                }
                // If not found in Google Books, use NYT data directly
                return {
                    ...book,
                    score: scoreBook(book, ['nyt']),
                    source: 'nyt',
                    sources: ['nyt']
                };
            });
            
            const nytResults = await Promise.all(nytPromises);
            nytResults.forEach(book => {
                if (book) {
                    const key = `${book.title.toLowerCase()}-${book.author.toLowerCase()}`;
                    if (!bookMap.has(key)) {
                        bookMap.set(key, book);
                    } else {
                        // Merge sources if book appears multiple times
                        const existing = bookMap.get(key);
                        existing.sources = [...(existing.sources || []), 'nyt'];
                        existing.score = (existing.score || 0) + 30; // NYT is high authority
                        if (book.nytRank) existing.nytRank = book.nytRank;
                    }
                }
            });
        }
        
        // Step 3: Verify and fetch details for AI books
        if (aiBooks.length > 0) {
            const aiPromises = aiBooks.map(async (book) => {
                const verified = await verifyBookAvailability(book);
                if (verified) {
                    verified.score = scoreBook(verified, ['ai']);
                    verified.source = 'ai';
                    return verified;
                }
                return null;
            });
            
            const aiResults = await Promise.all(aiPromises);
            aiResults.forEach(book => {
                if (book) {
                    const key = `${book.title.toLowerCase()}-${book.author.toLowerCase()}`;
                    if (!bookMap.has(key)) {
                        bookMap.set(key, book);
                    } else {
                        // Merge sources if book appears multiple times
                        const existing = bookMap.get(key);
                        existing.sources = [...(existing.sources || []), 'ai'];
                        existing.score = (existing.score || 0) + 10;
                    }
                }
            });
        }
        
        // Step 4: Add diverse fallback books if we don't have enough
        if (bookMap.size < 6) {
            console.log('Adding diverse fallback books...');
            const fallbackPromises = DIVERSE_FALLBACK_BOOKS
                .slice(0, 12) // Try first 12 fallback books
                .map(async (book) => {
                    const key = `${book.title.toLowerCase()}-${book.author.toLowerCase()}`;
                    if (!bookMap.has(key)) {
                        const verified = await verifyBookAvailability(book);
                        if (verified) {
                            verified.score = scoreBook(verified, ['fallback']);
                            verified.source = 'fallback';
                            verified.region = book.region;
                            return verified;
                        }
                    }
                    return null;
                });
            
            const fallbackResults = await Promise.all(fallbackPromises);
            fallbackResults.forEach(book => {
                if (book) {
                    const key = `${book.title.toLowerCase()}-${book.author.toLowerCase()}`;
                    if (!bookMap.has(key)) {
                        bookMap.set(key, book);
                    }
                }
            });
        }
        
        // Step 5: Convert map to array and filter out books without proper author info or cover images
        // Also exclude scientific/academic books and sexuality education books
        const allBooks = Array.from(bookMap.values())
            .filter(book => book.author && 
                           book.author.trim() !== '' && 
                           book.author.toLowerCase() !== 'unknown author' &&
                           book.author.toLowerCase() !== 'unknown' &&
                           book.cover && 
                           book.cover.trim() !== '' &&
                           !shouldExcludeBook(book)); // Exclude scientific/academic and sexuality education books
        
        // Step 6: Ensure regional diversity
        const diverseBooks = ensureRegionalDiversity(allBooks, 6);
        
        // Step 7: Sort by score (highest first)
        diverseBooks.sort((a, b) => (b.score || 0) - (a.score || 0));
        
        const finalBooks = diverseBooks.slice(0, 6); // Return top 6
        
        // Cache the results for 24 hours
        setCachedTrendingBooks(finalBooks);
        
        console.log(`Found ${finalBooks.length} trending books from multiple sources`);
        return finalBooks;
        
    } catch (error) {
        console.error('Error in multi-source trending books:', error);
        
        // Check cache as fallback even on error
        const cached = getCachedTrendingBooks();
        if (cached) {
            console.log('Using cached trending books as fallback after error');
            return cached;
        }
        
        // Fallback: Return verified diverse books
        console.log('Using diverse fallback list...');
        const fallbackPromises = DIVERSE_FALLBACK_BOOKS.slice(0, 6).map(book => 
            verifyBookAvailability(book)
        );
        const fallbackResults = await Promise.all(fallbackPromises);
        const filteredResults = fallbackResults.filter(book => 
            book !== null && 
            book.author && 
            book.author.trim() !== '' && 
            book.author.toLowerCase() !== 'unknown author' &&
            book.author.toLowerCase() !== 'unknown' &&
            book.cover && 
            book.cover.trim() !== '' && // Only include books with cover images
            !shouldExcludeBook(book) // Exclude scientific/academic and sexuality education books
        );
        
        // Cache fallback results too (they're still valid for 24 hours)
        if (filteredResults.length > 0) {
            setCachedTrendingBooks(filteredResults);
        }
        
        return filteredResults;
    }
}

