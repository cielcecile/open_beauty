
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const modelsToTest = [
    "gemini-flash-latest",
    "gemini-pro-latest",
    "gemini-2.0-flash-lite-preview-02-05"
];

const fs = require('fs');

async function test() {
    let log = "";
    for (const modelName of modelsToTest) {
        try {
            console.log(`Testing ${modelName}...`);
            log += `Testing ${modelName}...\n`;
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello");
            const response = await result.response;
            console.log(`✅ Success`);
            log += `✅ Success: ${response.text().substring(0, 50)}\n`;
        } catch (e) {
            console.error(`❌ Failed`);
            log += `❌ Failed: ${e.message}\n`;
        }
    }
    fs.writeFileSync('test_results.txt', log);
}
test();
