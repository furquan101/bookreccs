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

export async function searchBooks(query) {
    if (!query || query.length < 2) return [];

    try {
        const response = await fetch(`${GOOGLE_BOOKS_API_URL}?q=${encodeURIComponent(query)}&maxResults=5&printType=books`);
        if (!response.ok) {
            throw new Error('Failed to fetch books');
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
        return [];
    }
}
