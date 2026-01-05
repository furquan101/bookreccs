/**
 * Service for fetching books for SEO topic pages
 * Uses Gemini AI to generate relevant book recommendations for specific SEO queries
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { searchBooks } from './googleBooks';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

/**
 * Get books for a specific SEO topic using AI
 * @param {string} topic - The SEO topic (e.g., "top 10 nonfiction books of all time")
 * @param {number} count - Number of books to return (default: 12)
 * @returns {Promise<Array>} Array of book objects with title, author, and reason
 */
export async function getBooksForSEOTopic(topic, count = 12) {
    if (!API_KEY) {
        console.warn("Gemini API key not found - SEO topic books will not be available");
        return [];
    }

    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
You are an expert book recommendation engine specializing in curating lists for specific reading topics.

For the topic: "${topic}"

Recommend exactly ${count} books that are:
- Highly relevant to this specific topic
- Well-known, critically acclaimed, or best-selling books
- Actually published and available
- Diverse in authors and perspectives when appropriate

For nonfiction topics, focus on:
- Bestselling and critically acclaimed nonfiction
- Books that have stood the test of time
- Books that are widely recognized as essential reads
- Mix of classic and contemporary nonfiction

For "becoming a better woman" or "how to be a better woman" topics, focus on:
- Books about personal growth, empowerment, and self-improvement
- Books by women authors about women's experiences
- Inspirational and motivational nonfiction
- Books that help with confidence, leadership, and personal development

Respond with ONLY valid JSON in this format:
[
  { "title": "Book Title", "author": "Author Name", "reason": "Brief reason why this book fits the topic" },
  { "title": "Book Title", "author": "Author Name", "reason": "Brief reason why this book fits the topic" },
  ...
]

Return exactly ${count} books. Do not include markdown formatting or backticks.
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const books = JSON.parse(jsonString);
        
        // Ensure we have the requested number of books
        return Array.isArray(books) ? books.slice(0, count) : [];
    } catch (error) {
        console.error(`Error getting books for SEO topic "${topic}":`, error);
        
        // If quota exceeded, return empty array
        if (error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('Quota exceeded')) {
            console.warn("Gemini API quota exceeded - SEO topic books not available");
        }
        
        return [];
    }
}

/**
 * Fetch book details from Google Books API for SEO topic books
 * @param {Array} books - Array of books with title and author
 * @returns {Promise<Array>} Array of books with full details from Google Books
 */
export async function enrichSEOTopicBooks(books) {
    try {
        const detailsPromises = books.map(async (book) => {
            try {
                const results = await searchBooks(`${book.title} ${book.author}`);
                if (results.length > 0) {
                    return {
                        ...book,
                        ...results[0],
                        reason: book.reason
                    };
                }
                return book;
            } catch (error) {
                console.error(`Error fetching details for ${book.title}:`, error);
                return book;
            }
        });

        const details = await Promise.all(detailsPromises);
        return details;
    } catch (error) {
        console.error("Error enriching SEO topic books:", error);
        return books;
    }
}
