/**
 * NYT Books API Service
 * 
 * Fetches bestseller lists from The New York Times
 * Why this is valuable: Official, authoritative bestseller data
 */

const NYT_API_KEY = import.meta.env.VITE_NYT_API_KEY;
const NYT_API_BASE = 'https://api.nytimes.com/svc/books/v3';

/**
 * Get NYT Bestseller list
 * @param {string} listName - Name of the bestseller list (e.g., 'hardcover-fiction')
 * @returns {Promise<Array>} Array of book objects
 */
export async function getNYTBestsellers(listName = 'hardcover-fiction') {
    if (!NYT_API_KEY) {
        console.warn('NYT API key not found - NYT bestsellers will not be available');
        return [];
    }

    try {
        const response = await fetch(
            `${NYT_API_BASE}/lists/current/${listName}.json?api-key=${NYT_API_KEY}`
        );
        
        if (!response.ok) {
            if (response.status === 429) {
                console.warn('NYT API rate limit exceeded');
                return [];
            }
            throw new Error(`NYT API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.results?.books || data.status !== 'OK') {
            return [];
        }
        
        // Transform NYT format to our book format
        return data.results.books.map(book => ({
            title: book.title,
            author: book.author,
            isbn: book.isbn13,
            cover: book.book_image,
            description: book.description,
            rank: book.rank,
            source: 'nyt',
            nytRank: book.rank,
            amazonUrl: book.amazon_product_url
        }));
    } catch (error) {
        console.error('Error fetching NYT bestsellers:', error);
        return [];
    }
}

/**
 * Get multiple NYT bestseller lists and combine them
 * Useful for getting diverse books from different categories
 */
export async function getMultipleNYTLists(listNames = [
    'hardcover-fiction',
    'hardcover-nonfiction',
    'trade-fiction-paperback'
]) {
    try {
        const promises = listNames.map(listName => getNYTBestsellers(listName));
        const results = await Promise.all(promises);
        
        // Flatten and deduplicate by title+author
        const bookMap = new Map();
        results.flat().forEach(book => {
            const key = `${book.title.toLowerCase()}-${book.author.toLowerCase()}`;
            if (!bookMap.has(key)) {
                bookMap.set(key, book);
            }
        });
        
        return Array.from(bookMap.values());
    } catch (error) {
        console.error('Error fetching multiple NYT lists:', error);
        return [];
    }
}

