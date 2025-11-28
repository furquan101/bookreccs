import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export async function getRecommendation(selectedBooks, filters = [], excludeBooks = []) {
    if (!API_KEY) {
        console.error("Missing Gemini API Key");
        throw new Error("API Key missing");
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
        throw error;
    }
}

export async function getTrendingBooks() {
    if (!API_KEY) return [];

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
        return [];
    }
}
