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
      You are a book recommendation expert. List 8 currently trending or highly popular fiction books from the last 1-2 years that meet these criteria:

      REGIONAL DIVERSITY (REQUIRED):
      - Include at least 1-2 books from each region: Middle East, Pakistan, Malaysia, Japan, Korea
      - Authors should be from these regions or write about these regions
      - Ensure geographic and cultural diversity

      LANGUAGE REQUIREMENT:
      - All books MUST be available in English (original or translated)
      - Prioritize English translations of originally non-English works
      - Only include books that are actually published and available

      QUALITY CRITERIA:
      - Bestsellers, critically acclaimed, or viral hits
      - Books that have gained international recognition
      - Mix of genres: literary fiction, contemporary, historical fiction, magical realism
      - Recent publications (2023-2025) or recent translations

      EXCLUSIONS (DO NOT INCLUDE):
      - Scientific or academic textbooks
      - Academic research books
      - Sexuality education books
      - Educational textbooks
      - Technical manuals
      - Only include general fiction, literary fiction, and popular non-fiction (memoirs, biographies, general interest)

      Respond with ONLY valid JSON in this format:
      [
        { "title": "Book Title", "author": "Author Name", "region": "Region Name" },
        ...
      ]

      Ensure diversity across regions and include books that are actually trending in 2024-2025.
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
      Based on the book "${bookTitle}" by ${bookAuthor}, recommend 4-5 similar books that share similar themes, writing style, genre, or reading experience.
      ${excludeText}
      Respond with ONLY valid JSON in this format:
      [
        { "title": "Book Title", "author": "Author Name" },
        { "title": "Book Title", "author": "Author Name" },
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

/**
 * Summarize book description into 2-3 plain English sentences
 * Content principles: Clear, simple language that anyone can understand
 */
export async function summarizeBookDescription(description, bookTitle, bookAuthor) {
    if (!API_KEY || !description) {
        // Fallback: return first 2-3 sentences of cleaned description
        const cleanDesc = description
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .trim();
        
        const sentences = cleanDesc.split(/[.!?]+/).filter(s => s.trim().length > 10);
        return sentences.slice(0, 3).join('. ').trim() + (sentences.length > 3 ? '...' : '');
    }

    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
      Summarize this book description for "${bookTitle}" by ${bookAuthor} into exactly 2-3 sentences in plain English.
      
      Content principles:
      - Use simple, clear language that anyone can understand
      - Avoid jargon, complex terms, or literary criticism language
      - Focus on what the book is about, not reviews or awards
      - Write as if explaining to a friend
      - Keep it concise: 2-3 sentences maximum
      
      Book description:
      ${description.substring(0, 1000)}
      
      Respond with ONLY the summary text, no quotes, no markdown, no formatting. Just 2-3 plain English sentences.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();
        
        // Clean up any markdown or quotes that might be added
        return text.replace(/^["']|["']$/g, '').replace(/```/g, '').trim();
    } catch (error) {
        console.error("Error summarizing book description:", error);
        
        // Fallback: return first 2-3 sentences
        const cleanDesc = description
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .trim();
        
        const sentences = cleanDesc.split(/[.!?]+/).filter(s => s.trim().length > 10);
        return sentences.slice(0, 3).join('. ').trim() + (sentences.length > 3 ? '...' : '');
    }
}
