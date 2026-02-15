-- Create table for caching AI recommendations based on analysis patterns
CREATE TABLE IF NOT EXISTS public.cached_recommendations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    face_type TEXT NOT NULL,
    concerns TEXT[] NOT NULL, -- Sorted array of concerns
    recommendations JSONB NOT NULL, -- List of recommended treatments with details
    advice TEXT, -- General advice message
    created_at TIMESTAMPTZ DEFAULT NOW(),
    -- Create a unique constraint to ensure we can look up by (face_type, concerns)
    -- We'll just assume specific ordering when inserting/querying
    UNIQUE(face_type, concerns)
);

-- Enable RLS
ALTER TABLE public.cached_recommendations ENABLE ROW LEVEL SECURITY;

-- Allow public read/insert for now (required for API route using Anon key)
DROP POLICY IF EXISTS "Allow public read cached recommendations" ON public.cached_recommendations;
DROP POLICY IF EXISTS "Allow authenticated insert cached recommendations" ON public.cached_recommendations;
DROP POLICY IF EXISTS "Allow anon insert cached recommendations" ON public.cached_recommendations;

CREATE POLICY "Allow public read cached recommendations" ON public.cached_recommendations FOR SELECT USING (true);
CREATE POLICY "Allow anon insert cached recommendations" ON public.cached_recommendations FOR INSERT WITH CHECK (true);

-- Ensure treatments table exists and has policies
-- We assume table exists from supabase-treatments.sql
-- Allow Insert for API
DROP POLICY IF EXISTS "Allow anon insert treatments" ON public.treatments;
CREATE POLICY "Allow anon insert treatments" ON public.treatments FOR INSERT WITH CHECK (true);

-- Ensure categories column exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'treatments' AND column_name = 'category') THEN
        ALTER TABLE public.treatments ADD COLUMN category TEXT;
    END IF;
END $$;
