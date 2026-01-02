/**
 * Service for "Books Like X" pages
 * Returns more books (12) for dedicated SEO pages
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

/**
 * Get 12 similar books for "Books Like X" pages
 * More books than regular similar books for better SEO content
 */
export async function getBooksLike(bookTitle, bookAuthor, excludeBooks = []) {
    if (!API_KEY) {
        console.warn("Gemini API key not found - books like will not be available");
        return [];
    }

    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const excludeText = excludeBooks.length > 0 ? `Do NOT recommend these books: ${excludeBooks.join(", ")}.` : "";

        const prompt = `
You are an expert book recommendation engine specializing in finding books with similar reading taste, themes, and appeal.

Based on the book "${bookTitle}" by ${bookAuthor}, recommend 12 similar books that share:
- Similar themes and subject matter
- Comparable writing style or tone
- Similar reading experience or emotional impact
- Books that readers of "${bookTitle}" would genuinely enjoy

${excludeText}

Focus on books that match the reading taste and appeal, not just genre. These recommendations should feel like natural next reads for someone who loved "${bookTitle}".

Respond with ONLY valid JSON in this format:
[
  { "title": "Book Title", "author": "Author Name" },
  { "title": "Book Title", "author": "Author Name" },
  ...
]

Return exactly 12 books. Do not include markdown formatting or backticks.
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const books = JSON.parse(jsonString);
        
        // Ensure we have 12 books (or as many as possible)
        return Array.isArray(books) ? books.slice(0, 12) : [];
    } catch (error) {
        console.error("Error getting books like:", error);
        
        if (error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('Quota exceeded')) {
            console.warn("Gemini API quota exceeded - books like not available");
        }
        
        return [];
    }
}
