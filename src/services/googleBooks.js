const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';

/**
 * Enhance Google Books image URL to get higher quality
 * Google Books images can be resized by modifying the URL parameters
 * This function safely enhances URLs without breaking them
 */
function enhanceImageQuality(imageUrl) {
    if (!imageUrl) return null;
    
    // Return original URL - Google Books URLs work reliably as-is
    // If enhancement is needed in the future, it can be added here safely
    return imageUrl;
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
                
                // Prioritize higher quality images: large > medium > small > thumbnail > smallThumbnail
                const coverUrl = volumeInfo.imageLinks?.large || 
                                volumeInfo.imageLinks?.medium || 
                                volumeInfo.imageLinks?.small || 
                                volumeInfo.imageLinks?.thumbnail || 
                                volumeInfo.imageLinks?.smallThumbnail || 
                                null;
                
                // Use the cover URL directly - Google Books URLs are reliable
                const cover = coverUrl || null;
                
                // Debug: Log if no cover found
                if (!cover) {
                    console.debug(`No cover image for: ${volumeInfo.title}`);
                }
                
                return {
                    id: item.id,
                    title: volumeInfo.title,
                    author: volumeInfo.authors[0],
                    cover: cover,
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
