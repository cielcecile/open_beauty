
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing credentials. Please check .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verify() {
    const { count, error } = await supabase
        .from('hospital_knowledge')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error("Error connecting to DB:", error.message);
    } else {
        console.log(`Current knowledge chunks in DB: ${count}`);
        if (count > 0) {
            console.log("Health Check: SUCCESS - Data exists.");
        } else {
            console.log("Health Check: WARNING - Table is empty.");
        }
    }
}

verify();
