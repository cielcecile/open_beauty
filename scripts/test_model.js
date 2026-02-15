const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: ".env.local" });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent("Hello");
        console.log("Model gemini-2.5-flash is working:", result.response.text());
    } catch (err) {
        console.error("Error with gemini-2.5-flash:", err);

        try {
            console.log("Trying gemini-1.5-flash...");
            const model2 = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result2 = await model2.generateContent("Hello");
            console.log("Model gemini-1.5-flash is working:", result2.response.text());
        } catch (err2) {
            console.error("Error with gemini-1.5-flash:", err2);
        }
    }
}

listModels();
