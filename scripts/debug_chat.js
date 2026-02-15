
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
const embeddingModel = genAI.getGenerativeModel({ model: "models/gemini-embedding-001" });

async function debugChat() {
    console.log("Starting Debug (Simulating /api/chat)...");
    const message = "아울름 클리닉에서 올리지오 가격 얼마야?";

    // 1. Embedding
    try {
        console.log("1. Generating Embedding...");
        await embeddingModel.embedContent(message);
        console.log("✅ Embedding Success");
    } catch (e) {
        console.error("❌ Embedding Failed:", e.message);
    }

    // 2. Chat with Fallback
    const promptWithContext = `Test Prompt: ${message}`;

    try {
        console.log("2. Testing Primary Model (gemini-2.0-flash)...");
        const result = await model.generateContent(promptWithContext);
        const response = await result.response;
        console.log("✅ Primary Model Success:", response.text());
    } catch (primaryError) {
        console.warn("⚠️ Primary Model Failed:", primaryError.message);
        console.warn("Status:", primaryError.status); // Check status

        if (primaryError.message.includes('429') || primaryError.status === 429) {
            console.log("3. Testing Fallback Model (gemini-flash-latest)...");
            try {
                const fallbackModel = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
                const fallbackResult = await fallbackModel.generateContent(promptWithContext);
                const fallbackResponse = await fallbackResult.response;
                console.log("✅ Fallback Model Success:", fallbackResponse.text());
            } catch (fallbackError) {
                console.error("❌ Fallback Model Failed:", fallbackError.message);
                console.error("Full Error:", JSON.stringify(fallbackError, null, 2));
            }
        }
    }
}

debugChat();
