const https = require('https');
require("dotenv").config({ path: ".env.local" });

const key = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const dataJson = JSON.parse(data);
            if (dataJson.models) {
                console.log("\n--- MATCHING MODELS ---");
                const flash = dataJson.models.filter(m => m.name.includes("flash"));
                const pro = dataJson.models.filter(m => m.name.includes("pro") && !m.name.includes("flash")); // pro but not flash (if any)

                console.log("FLASH MODELS:");
                flash.forEach(m => console.log(m.name));

                console.log("\nPRO MODELS:");
                pro.forEach(m => console.log(m.name));
            }
        } catch (e) {
            console.log("Error parsing JSON");
        }
    });
}).on("error", (err) => console.log("Error: " + err.message));
