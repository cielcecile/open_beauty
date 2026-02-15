const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function clearTreatments() {
    console.log('Clearing treatments table...');
    // Delete all rows where id is not empty string (effectively all rows)
    const { error, count } = await supabase
        .from('treatments')
        .delete({ count: 'exact' })
        .neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) {
        console.error('Error clearing treatments:', error);
    } else {
        console.log(`Successfully deleted ${count} treatments.`);
    }
}

clearTreatments();
