const https = require('https');
require("dotenv").config({ path: ".env.local" });

const key = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

console.log(`Testing key: ${key?.substring(0, 10)}...`);

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log(`Status Code: ${res.statusCode}`);
        if (res.statusCode !== 200) {
            console.log("Error Response:", data);
            return;
        }
        try {
            const dataJson = JSON.parse(data);
            if (dataJson.models) {
                console.log("\n--- AVAILABLE MODELS ---");
                dataJson.models.forEach(m => {
                    // Filter for models that likely support image analysis (generateContent)
                    if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                        console.log(`Name: ${m.name}`); // e.g., models/gemini-1.5-flash
                        console.log(`Methods: ${m.supportedGenerationMethods.join(", ")}`);
                        console.log("-------------------------");
                    }
                });
            } else {
                console.log("No models field in response:", data);
            }
        } catch (e) {
            console.log("Error parsing JSON:", e);
        }
    });
}).on("error", (err) => {
    console.log("Error: " + err.message);
});
