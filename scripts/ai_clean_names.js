const { GoogleGenerativeAI } = require("@google/generative-ai");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function cleanNames() {
    try {
        console.log("Fetching treatments (id, name only)...");
        const { data: treatments, error } = await supabase
            .from("treatments")
            .select("id, name");

        if (error) {
            console.error("Error fetching treatments:", error);
            return;
        }

        console.log(`Found ${treatments.length} treatments. Processing with AI (gemini-2.5-flash)...`);

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
        You are a medical data expert. Given a list of cosmetic treatment names in Japanese, separate them into:
        1. Clean Japanese name (Remove all English words/characters and brackets, e.g., "サーマージ (Thermage)" -> "サーマージ")
        2. English name (Standard English term, e.g., "Thermage")
        
        Rules:
        - If the name is only in Japanese, provide the best English translation.
        - If the name is already clean (no English), keep it as is for 'ja'.
        - Ensure names are professional and standard in the aesthetic industry.
        
        Return ONLY a JSON array of objects like this:
        [
          { "id": "id1", "ja": "サーマージ", "en": "Thermage" },
          ...
        ]
        
        Data to process:
        ${JSON.stringify(treatments)}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Clean up markdown if any
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();

        const cleanedData = JSON.parse(text);

        console.log("AI Processing complete. Generating SQL...");

        let sql = `-- SQL Migration to clean names\n`;
        sql += `ALTER TABLE public.treatments ADD COLUMN IF NOT EXISTS name_en TEXT;\n\n`;

        for (const item of cleanedData) {
            sql += `UPDATE public.treatments SET name = '${item.ja.replace(/'/g, "''")}', name_en = '${item.en.replace(/'/g, "''")}' WHERE id = '${item.id}';\n`;
        }

        const fs = require("fs");
        fs.writeFileSync("scripts/clean_names_update.sql", sql);
        console.log("------------------------------------------");
        console.log("SQL script saved to: scripts/clean_names_update.sql");
        console.log("------------------------------------------");
        console.log("Processed List Sample:");
        console.log(cleanedData.slice(0, 5));

    } catch (err) {
        console.error("Error in cleaning names:", err);
    }
}

cleanNames();
