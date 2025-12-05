import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';

// Read API Key from .env
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const apiKeyMatch = envContent.match(/VITE_GEMINI_API_KEY=(.*)/);
const API_KEY = apiKeyMatch ? apiKeyMatch[1].trim() : null;

if (!API_KEY) {
    console.error("API Key not found in .env");
    process.exit(1);
}

async function getRecommendation(selectedBooks, filters = [], excludeBooks = []) {
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

        console.log("Sending prompt...");
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log("Raw response:", text);

        // Clean up potential markdown code blocks if Gemini adds them despite instructions
        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const parsed = JSON.parse(jsonString);
        console.log("Parsed JSON:", parsed);
        return parsed;
    } catch (error) {
        console.error("Error getting recommendation:", error);
        throw error;
    }
}

// Test data
const selectedBooks = [
    { title: "The Hunger Games", author: "Suzanne Collins" },
    { title: "Project Hail Mary", author: "Andy Weir" }
];

getRecommendation(selectedBooks);
