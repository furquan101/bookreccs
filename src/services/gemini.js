import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export async function getRecommendation(selectedBooks, filters = [], excludeBooks = []) {
    if (!API_KEY) {
        console.error("Missing Gemini API Key - Check .env file has VITE_GEMINI_API_KEY set");
        throw new Error("API Key missing - Please check your .env file");
    }

    // Validate API key format (Gemini keys typically start with AIza)
    if (!API_KEY.startsWith('AIza')) {
        console.warn("API Key format may be incorrect - Gemini keys typically start with 'AIza'");
    }

    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const booksList = selectedBooks.map(b => `"${b.title}" by ${b.author}`).join(", ");
        const filterText = filters.length > 0 ? `Focus on these vibes: ${filters.join(", ")}.` : "";
        const excludeText = excludeBooks.length > 0 ? `Do NOT recommend these books: ${excludeBooks.join(", ")}.` : "";

        const prompt = `
      You are an expert book recommendation engine.
      Based on these books: [${booksList}].
      ${filterText}
      ${excludeText}
      Recommend ONE book matching their pacing, excitement, and vibes. Focus on tempo and feel.
      Respond with ONLY valid JSON in this format:
      {
        "title": "Book Title",
        "author": "Author Name",
        "reasoning": "A short, punchy explanation of why this book fits (max 2 sentences)."
      }
      Do not include markdown formatting or backticks.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up potential markdown code blocks if Gemini adds them despite instructions
        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error getting recommendation:", error);
        
        // Provide more helpful error messages
        if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('401')) {
            throw new Error("Invalid API key. Please check your VITE_GEMINI_API_KEY in .env file");
        } else if (error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('Quota exceeded')) {
            throw new Error("API quota exceeded. You've reached the free tier limit. Please wait a few minutes or check your billing plan at https://ai.dev/usage");
        } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
            throw new Error("Network error. Please check your internet connection.");
        }
        
        throw error;
    }
}

export async function getTrendingBooks() {
    if (!API_KEY) {
        console.warn("Gemini API key not found - trending books will use fallback");
        return [];
    }

    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
      List 6 currently trending or highly popular fiction books (bestsellers, viral hits, or critically acclaimed) from the last 1-2 years.
      Respond with ONLY valid JSON in this format:
      [
        { "title": "Book Title", "author": "Author Name" },
        ...
      ]
      Do not include markdown formatting or backticks.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error getting trending books:", error);
        
        // If quota exceeded, return empty array (fallback will be used)
        if (error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('Quota exceeded')) {
            console.warn("Gemini API quota exceeded - using fallback trending books");
        }
        
        return [];
    }
}

export async function getSimilarBooks(bookTitle, bookAuthor, excludeBooks = []) {
    if (!API_KEY) {
        console.warn("Gemini API key not found - similar books will not be available");
        return [];
    }

    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const excludeText = excludeBooks.length > 0 ? `Do NOT recommend these books: ${excludeBooks.join(", ")}.` : "";

        const prompt = `
      You are an expert book recommendation engine.
      Based on the book "${bookTitle}" by ${bookAuthor}, recommend 3 similar books that share similar themes, writing style, genre, or reading experience.
      ${excludeText}
      Respond with ONLY valid JSON in this format:
      [
        { "title": "Book Title", "author": "Author Name" },
        { "title": "Book Title", "author": "Author Name" },
        { "title": "Book Title", "author": "Author Name" }
      ]
      Do not include markdown formatting or backticks.
      Make sure the books are genuinely similar in style, themes, or genre to "${bookTitle}".
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error getting similar books:", error);
        
        // If quota exceeded, return empty array
        if (error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('Quota exceeded')) {
            console.warn("Gemini API quota exceeded - similar books not available");
        }
        
        return [];
    }
}
