const fs = require('fs');

const filePath = 'src/components/Footer.tsx';

try {
    // Read file as buffer
    const buffer = fs.readFileSync(filePath);

    // Convert to string using utf-8, replacing invalid chars
    const content = buffer.toString('utf-8');

    console.log("Read success. Length:", content.length);

    // Write back to clean it up
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log("File sanitized and saved.");

} catch (err) {
    console.error("Error processing file:", err);
}
