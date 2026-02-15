const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: ".env.local" });

async function check() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log("Checking with key ending in: " + process.env.GEMINI_API_KEY?.slice(-4));

    const modelsToTest = ["gemini-pro", "gemini-1.0-pro", "gemini-1.5-flash", "gemini-pro-vision"];

    for (const modelName of modelsToTest) {
        console.log(`\nTesting model: ${modelName}`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            // We just want to see if it throws 404 immediately or 400 (bad request) which implies model exists
            // Sending empty content usually triggers 400 if model exists, or prompt required
            await model.generateContent("test");
            console.log(`✅ Success (or at least found): ${modelName}`);
        } catch (error) {
            const msg = error.message.split('\n')[0];
            if (msg.includes("404")) {
                console.log(`❌ 404 Not Found: ${modelName}`);
            } else {
                console.log(`⚠️ Error but found (likely): ${modelName} - ${msg}`);
            }
        }
    }
}

check();
