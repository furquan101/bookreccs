// Quick test script to verify Gemini API key
import { GoogleGenerativeAI } from "@google/generative-ai";
import { readFileSync } from 'fs';

// Read API key from .env
const envContent = readFileSync('.env', 'utf-8');
const apiKeyMatch = envContent.match(/VITE_GEMINI_API_KEY=(.*)/);
const API_KEY = apiKeyMatch ? apiKeyMatch[1].trim() : null;

if (!API_KEY) {
    console.error("❌ API Key not found in .env file");
    console.error("Make sure you have: VITE_GEMINI_API_KEY=your_key_here");
    process.exit(1);
}

console.log("✅ API Key found in .env");
console.log(`   Key length: ${API_KEY.length} characters`);
console.log(`   Key starts with: ${API_KEY.substring(0, 4)}...`);

// Test the API key
async function testAPIKey() {
    try {
        console.log("\n🔄 Testing API key with Gemini...");
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        
        const result = await model.generateContent("Say 'API key is working' if you can read this.");
        const response = await result.response;
        const text = response.text();
        
        console.log("✅ API Key is VALID and working!");
        console.log(`   Response: ${text.substring(0, 100)}...`);
    } catch (error) {
        console.error("\n❌ API Key test FAILED");
        console.error("   Error:", error.message);
        
        if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('401')) {
            console.error("\n💡 Solution: Your API key is invalid or expired.");
            console.error("   1. Get a new API key from: https://makersuite.google.com/app/apikey");
            console.error("   2. Update VITE_GEMINI_API_KEY in your .env file");
            console.error("   3. Restart the dev server (npm run dev)");
        } else if (error.message?.includes('429')) {
            console.error("\n💡 Solution: Rate limit exceeded. Wait a few minutes and try again.");
        } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
            console.error("\n💡 Solution: Network error. Check your internet connection.");
        } else {
            console.error("\n💡 Full error details:", error);
        }
        process.exit(1);
    }
}

testAPIKey();

