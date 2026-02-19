const https = require('https');
require('dotenv').config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error('No GEMINI_API_KEY found in .env.local');
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

console.log('Fetching available models from:', url.replace(apiKey, 'HIDDEN_KEY'));

const fs = require('fs');

https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        if (res.statusCode !== 200) {
            console.error(`API Request Failed: ${res.statusCode}`);
            console.log('Response:', data);
            return;
        }

        try {
            const json = JSON.parse(data);
            const output = [];
            if (json.models) {
                json.models.forEach(m => {
                    if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')) {
                        output.push(`${m.name}`); // Just the name which includes 'models/' usually
                    }
                });
            }
            fs.writeFileSync('models_output.txt', output.join('\n'));
            console.log('Saved models to models_output.txt');
        } catch (e) {
            console.error(e);
        }
    });
}).on('error', (err) => { console.error(err); });
