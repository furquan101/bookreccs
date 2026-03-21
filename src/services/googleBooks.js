const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';

/**
 * Enhance Google Books image URL to get the highest quality version.
 * Google Books thumbnails use zoom=1 (~128px). Setting zoom=0 gives the
 * full-resolution front cover. Also removes the page-curl effect and
 * upgrades to HTTPS.
 */
function enhanceImageQuality(imageUrl) {
    if (!imageUrl) return null;

    let url = imageUrl
        .replace(/^http:\/\//, 'https://')  // Upgrade to HTTPS
        .replace(/&edge=curl/g, '')          // Remove page-curl effect
        .replace(/&zoom=\d+/g, '&zoom=0');  // Full-resolution image

    return url;
}

/**
 * Build an Open Library large cover URL from an ISBN.
 * Open Library is free with no API key. Returns null if no ISBN available.
 * URL format: https://covers.openlibrary.org/b/isbn/{ISBN}-L.jpg
 * Open Library returns a 1x1 placeholder if the cover doesn't exist,
 * so we use this as a candidate and let the img onError handler fall back.
 */
function openLibraryCoverUrl(isbn) {
    if (!isbn) return null;
    return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
}

/**
 * Extract the best ISBN from Google Books industry identifiers.
 * Prefers ISBN_13 over ISBN_10.
 */
function extractIsbn(industryIdentifiers) {
    if (!industryIdentifiers) return null;
    const isbn13 = industryIdentifiers.find(id => id.type === 'ISBN_13');
    const isbn10 = industryIdentifiers.find(id => id.type === 'ISBN_10');
    return (isbn13 || isbn10)?.identifier || null;
}

/**
 * Search Open Library as a fallback when Google Books quota is exhausted.
 * Free, no API key required. Returns the same shape as searchBooks.
 * Open Library Search: https://openlibrary.org/search.json?q=...
 */
async function searchBooksOpenLibrary(query) {
    try {
        const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=5`;
        const response = await fetch(url);
        if (!response.ok) return [];
        const data = await response.json();
        if (!data.docs || data.docs.length === 0) return [];

        return data.docs
            .map(doc => {
                if (!doc.author_name || doc.author_name.length === 0) return null;

                const isbn = doc.isbn?.[0] || null;
                const coverId = doc.cover_i || null;

                // Prefer ISBN-based cover (highest quality); fall back to cover ID
                const cover = openLibraryCoverUrl(isbn)
                    || (coverId ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg` : null);
                const coverFallback = coverId
                    ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
                    : null;

                return {
                    id: doc.key,
                    title: doc.title,
                    author: doc.author_name[0],
                    cover,
                    coverFallback,
                    isbn,
                    description: null,   // Open Library search doesn't return descriptions
                    publishedDate: doc.first_publish_year?.toString() || null,
                    rating: null,
                    ratingsCount: null,
                };
            })
            .filter(book => book !== null);
    } catch (err) {
        console.error('Open Library search error:', err);
        return [];
    }
}

export async function searchBooks(query) {
    if (!query || query.length < 2) return [];

    try {
        const response = await fetch(`${GOOGLE_BOOKS_API_URL}?q=${encodeURIComponent(query)}&maxResults=5&printType=books`);
        if (!response.ok) {
            // Google Books quota hit or server error — fall back to Open Library
            console.warn(`Google Books returned ${response.status} — falling back to Open Library`);
            return await searchBooksOpenLibrary(query);
        }
        const data = await response.json();

        if (!data.items) return [];

        return data.items
            .map(item => {
                const volumeInfo = item.volumeInfo;

                // Skip books without authors to avoid showing "Unknown Author"
                if (!volumeInfo.authors || volumeInfo.authors.length === 0) {
                    return null;
                }

                const isbn = extractIsbn(volumeInfo.industryIdentifiers);

                // Prioritize higher quality images: large > medium > small > thumbnail > smallThumbnail
                const rawCoverUrl = volumeInfo.imageLinks?.large ||
                                volumeInfo.imageLinks?.medium ||
                                volumeInfo.imageLinks?.small ||
                                volumeInfo.imageLinks?.thumbnail ||
                                volumeInfo.imageLinks?.smallThumbnail ||
                                null;

                // Use Open Library as primary (large cover) with enhanced Google Books as fallback
                const cover = openLibraryCoverUrl(isbn) || enhanceImageQuality(rawCoverUrl);

                if (!cover) {
                    console.debug(`No cover image for: ${volumeInfo.title}`);
                }

                return {
                    id: item.id,
                    title: volumeInfo.title,
                    author: volumeInfo.authors[0],
                    cover: cover,
                    coverFallback: enhanceImageQuality(rawCoverUrl), // Google Books fallback
                    isbn: isbn,
                    description: volumeInfo.description || null,
                    publishedDate: volumeInfo.publishedDate,
                    rating: volumeInfo.averageRating || null,
                    ratingsCount: volumeInfo.ratingsCount || null
                };
            })
            .filter(book => book !== null); // Remove null entries
    } catch (error) {
        console.error('Error searching books:', error);
        // Last resort: try Open Library
        return await searchBooksOpenLibrary(query);
    }
}
