const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';

export async function searchBooks(query) {
    if (!query || query.length < 2) return [];

    try {
        const response = await fetch(`${GOOGLE_BOOKS_API_URL}?q=${encodeURIComponent(query)}&maxResults=5&printType=books`);
        if (!response.ok) {
            throw new Error('Failed to fetch books');
        }
        const data = await response.json();

        if (!data.items) return [];

        return data.items.map(item => {
            const volumeInfo = item.volumeInfo;
            return {
                id: item.id,
                title: volumeInfo.title,
                author: volumeInfo.authors ? volumeInfo.authors[0] : 'Unknown Author',
                cover: volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail || null,
                publishedDate: volumeInfo.publishedDate,
                rating: volumeInfo.averageRating || null,
                ratingsCount: volumeInfo.ratingsCount || null
            };
        });
    } catch (error) {
        console.error('Error searching books:', error);
        return [];
    }
}
