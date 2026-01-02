/**
 * SEO Page Generator
 * 
 * This service identifies books that are commonly recommended by AI
 * and generates "Books Like X" pages for them.
 * 
 * Strategy:
 * 1. Track books that are frequently recommended
 * 2. Generate "Books Like X" pages for high-frequency recommendations
 * 3. Use AI to determine which books people who read Y would like
 */

import { getAllPopularBooks } from '../data/popularBooks';
import { getBooksLike } from './booksLike';

/**
 * Generate "Books Like X" pages for all popular books
 * This creates static SEO pages that search engines can crawl
 */
export async function generateAllBooksLikePages() {
    const popularBooks = getAllPopularBooks();
    const pages = [];
    
    for (const book of popularBooks) {
        try {
            // Get similar books using AI
            const similarBooks = await getBooksLike(book.title, book.author, [book.title]);
            
            if (similarBooks && similarBooks.length > 0) {
                pages.push({
                    book: {
                        title: book.title,
                        author: book.author,
                        category: book.category,
                        seoPriority: book.seoPriority
                    },
                    similarBooks: similarBooks,
                    slug: book.title.toLowerCase()
                        .replace(/[^\w\s-]/g, '')
                        .replace(/\s+/g, '-')
                        .replace(/-+/g, '-')
                });
            }
        } catch (error) {
            console.error(`Error generating page for ${book.title}:`, error);
        }
    }
    
    return pages;
}

/**
 * Get books that are commonly recommended together
 * This helps identify which books should get "Books Like X" pages
 */
export function getCommonlyRecommendedBooks() {
    // Books that are frequently recommended when users input popular books
    // Based on AI recommendation patterns
    return [
        // When users read Colleen Hoover books, these are often recommended:
        { title: "Verity", author: "Colleen Hoover", sourceBooks: ["It Ends with Us", "Ugly Love"] },
        { title: "The Seven Husbands of Evelyn Hugo", author: "Taylor Jenkins Reid", sourceBooks: ["Daisy Jones & The Six", "Malibu Rising"] },
        { title: "The Silent Patient", author: "Alex Michaelides", sourceBooks: ["The Girl on the Train", "The Guest List"] },
        { title: "The Housemaid", author: "Freida McFadden", sourceBooks: ["The Silent Patient", "The Last Thing He Told Me"] },
        { title: "The Guest List", author: "Lucy Foley", sourceBooks: ["The Silent Patient", "The Girl on the Train"] },
        { title: "The Push", author: "Ashley Audrain", sourceBooks: ["The Silent Patient", "The Housemaid"] },
        { title: "Anxious People", author: "Fredrik Backman", sourceBooks: ["The Midnight Library", "Eleanor Oliphant Is Completely Fine"] },
        { title: "Eleanor Oliphant Is Completely Fine", author: "Gail Honeyman", sourceBooks: ["The Midnight Library", "Anxious People"] },
        { title: "The Song of Achilles", author: "Madeline Miller", sourceBooks: ["Circe", "The Invisible Life of Addie LaRue"] },
        { title: "Circe", author: "Madeline Miller", sourceBooks: ["The Song of Achilles", "The Invisible Life of Addie LaRue"] },
        { title: "The Invisible Life of Addie LaRue", author: "V.E. Schwab", sourceBooks: ["The Song of Achilles", "Circe"] },
        { title: "Normal People", author: "Sally Rooney", sourceBooks: ["Conversations with Friends", "Beautiful World, Where Are You"] },
        { title: "The Goldfinch", author: "Donna Tartt", sourceBooks: ["The Secret History", "The Little Friend"] },
        { title: "The Secret History", author: "Donna Tartt", sourceBooks: ["The Goldfinch", "If We Were Villains"] },
        { title: "Big Little Lies", author: "Liane Moriarty", sourceBooks: ["The Husband's Secret", "Nine Perfect Strangers"] },
        { title: "The Nightingale", author: "Kristin Hannah", sourceBooks: ["The Four Winds", "The Great Alone"] },
        { title: "The Four Winds", author: "Kristin Hannah", sourceBooks: ["The Nightingale", "The Great Alone"] },
        { title: "Project Hail Mary", author: "Andy Weir", sourceBooks: ["The Martian", "Artemis"] },
        { title: "The Martian", author: "Andy Weir", sourceBooks: ["Project Hail Mary", "Artemis"] },
        { title: "Dune", author: "Frank Herbert", sourceBooks: ["The Three-Body Problem", "Red Rising"] },
        { title: "The Hunger Games", author: "Suzanne Collins", sourceBooks: ["Divergent", "The Maze Runner"] },
        { title: "The Name of the Wind", author: "Patrick Rothfuss", sourceBooks: ["Mistborn: The Final Empire", "The Way of Kings"] },
        { title: "Mistborn: The Final Empire", author: "Brandon Sanderson", sourceBooks: ["The Name of the Wind", "The Way of Kings"] },
        { title: "Six of Crows", author: "Leigh Bardugo", sourceBooks: ["Shadow and Bone", "Ninth House"] },
        { title: "Shadow and Bone", author: "Leigh Bardugo", sourceBooks: ["Six of Crows", "Crooked Kingdom"] },
    ];
}

/**
 * Get AI-recommended books that should have "Books Like X" pages
 * These are books that the AI frequently recommends when users input popular books
 */
export function getAIRecommendedBooksForSEO() {
    const commonlyRecommended = getCommonlyRecommendedBooks();
    const uniqueBooks = new Map();
    
    // Extract unique books from commonly recommended list
    commonlyRecommended.forEach(item => {
        const key = `${item.title}-${item.author}`;
        if (!uniqueBooks.has(key)) {
            uniqueBooks.set(key, {
                title: item.title,
                author: item.author,
                recommendedWith: item.sourceBooks,
                seoPriority: "high"
            });
        }
    });
    
    return Array.from(uniqueBooks.values());
}
