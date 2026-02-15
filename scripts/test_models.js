
const https = require('https');
require('dotenv').config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("No API Key found.");
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

const fs = require('fs');

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        fs.writeFileSync('models.json', data);
        console.log("Saved to models.json");
    });
}).on('error', (e) => {
    console.error("Request Error:", e);
});
