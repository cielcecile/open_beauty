
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const modelsToTest = [
    "gemini-flash-latest",
    "gemini-pro-latest",
    "gemini-2.0-flash-lite-preview-02-05", // From models.json
    "gemini-1.5-flash-latest",
    "gemini-1.5-pro-latest"
];

async function testAvailability() {
    let log = "--- Model Availability Test ---\n";
    console.log("Starting Model Availability Test...");

    for (const modelName of modelsToTest) {
        console.log(`Testing ${modelName}...`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello, are you there?");
            const response = await result.response;
            const text = response.text();

            console.log(`✅ ${modelName}: CUSTOMER VALID (Response: ${text.substring(0, 20)}...)`);
            log += `✅ ${modelName}: OK\n`;
        } catch (e) {
            console.error(`❌ ${modelName}: FAILED (${e.status || 'NoStatus'}) - ${e.message.substring(0, 100)}`);
            log += `❌ ${modelName}: FAILED (${e.status || e.message})\n`;
        }
        // Small delay to avoid self-inflicted rate limits
        await new Promise(r => setTimeout(r, 1000));
    }

    fs.writeFileSync('availability_results.txt', log);
    console.log("Test Complete. Results saved to availability_results.txt");
}

testAvailability();
