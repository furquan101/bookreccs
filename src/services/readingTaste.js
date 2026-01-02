/**
 * Reading Taste Profile Generator
 * Analyzes user's book selections to generate a personalized reading taste profile
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

/**
 * Generate a reading taste profile slug from selected books
 * Returns a URL-friendly slug like "productivity-growth-thinking"
 */
export async function generateReadingTasteProfile(selectedBooks) {
    if (!API_KEY) {
        console.warn("Gemini API key not found - using fallback profile");
        return "general-reading";
    }

    if (!selectedBooks || selectedBooks.length === 0) {
        return "general-reading";
    }

    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const bookList = selectedBooks.map(b => `- "${b.title}" by ${b.author}`).join('\n');

        const prompt = `
You are a reading taste analyzer. Based on the following books the user has enjoyed, generate a concise reading taste profile.

Books the user enjoyed:
${bookList}

Analyze the common themes, genres, writing styles, and reading preferences across these books.

Generate a URL-friendly reading taste profile slug (2-4 words, lowercase, hyphenated) that captures their reading taste.

Examples:
- "productivity-growth-thinking" (for books like Atomic Habits, The 7 Habits, Sapiens)
- "literary-fiction-classics" (for books like The Great Gatsby, To Kill a Mockingbird)
- "sci-fi-adventure-thriller" (for books like Dune, The Martian, Project Hail Mary)
- "philosophy-spirituality-mindfulness" (for books like The Power of Now, Meditations)
- "contemporary-romance-drama" (for books like The Seven Husbands of Evelyn Hugo)
- "historical-fiction-literary" (for books like The Book Thief, All the Light We Cannot See)

Respond with ONLY the slug, no explanation, no markdown, just the hyphenated words.
Example format: "productivity-growth-thinking"
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();

        // Clean up the response - remove markdown, quotes, etc.
        const slug = text
            .replace(/```/g, '')
            .replace(/"/g, '')
            .replace(/'/g, '')
            .toLowerCase()
            .trim();

        // Validate slug format (only lowercase letters, numbers, and hyphens)
        const validSlug = slug.replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

        return validSlug || "general-reading";
    } catch (error) {
        console.error("Error generating reading taste profile:", error);
        return "general-reading";
    }
}

/**
 * Get book recommendations based on reading taste profile
 */
export async function getRecommendationsForTasteProfile(selectedBooks, tasteProfile) {
    if (!API_KEY) {
        console.warn("Gemini API key not found - recommendations unavailable");
        return [];
    }

    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const bookList = selectedBooks.map(b => `"${b.title}" by ${b.author}`).join(', ');

        const prompt = `
Based on the user's reading taste profile "${tasteProfile}" and the books they've enjoyed (${bookList}), recommend 8-10 books that match their reading preferences.

Requirements:
- Books should align with the taste profile themes
- Mix of well-known and hidden gems
- Include diverse authors when possible
- Books should be available in English
- Prioritize books that are critically acclaimed or highly rated

Respond with ONLY valid JSON in this format:
[
  { "title": "Book Title", "author": "Author Name", "reason": "Why this matches their taste" },
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
        console.error("Error getting recommendations for taste profile:", error);
        return [];
    }
}

/**
 * Generate a human-readable title and description for a taste profile
 */
export async function getTasteProfileMetadata(tasteProfile, selectedBooks) {
    if (!API_KEY) {
        return {
            title: "Your Reading Recommendations",
            description: "Personalized book recommendations based on your reading taste."
        };
    }

    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const bookList = selectedBooks.map(b => `"${b.title}" by ${b.author}`).join(', ');

        const prompt = `
Based on the reading taste profile "${tasteProfile}" and the books the user enjoyed (${bookList}), generate:

1. A compelling page title (2-6 words, title case)
2. A brief description (1-2 sentences) explaining what kind of books they'll find here

Respond with ONLY valid JSON in this format:
{
  "title": "Page Title Here",
  "description": "Description explaining the reading taste and what books they'll find."
}

Do not include markdown formatting or backticks.
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error generating taste profile metadata:", error);
        return {
            title: "Your Reading Recommendations",
            description: "Personalized book recommendations based on your reading taste."
        };
    }
}
