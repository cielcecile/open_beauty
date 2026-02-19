require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function verify(modelName) {
    const apiKey = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });
    try {
        console.log(`Testing ${modelName}...`);
        const result = await model.generateContent('Hi');
        console.log(`Success ${modelName}:`, result.response.text());
    } catch (e) {
        console.error(`Failed ${modelName}:`, e.message);
    }
}

async function main() {
    await verify('gemini-2.0-flash');
    await verify('gemini-flash-latest');
    await verify('gemini-2.5-flash');
}

main();
