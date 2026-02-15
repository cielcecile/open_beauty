-- 1. Create a public bucket named 'analysis-images'
-- This will fail if the bucket already exists, so we wrap it or handle it manually.
-- In Supabase SQL Editor, you can just run this line:
insert into storage.buckets (id, name, public)
values ('analysis-images', 'analysis-images', true);

-- 2. Create Policy: Allow public access to view images (SELECT)
-- This allows anyone with the URL to see the image, which is needed for getPublicUrl
create policy "Public Access Analysis Images"
on storage.objects for select
using ( bucket_id = 'analysis-images' );

-- 3. Create Policy: Allow authenticated users to upload images (INSERT)
-- This allows logged-in users to upload their own files
create policy "Authenticated Users Upload Analysis Images"
on storage.objects for insert
with check ( bucket_id = 'analysis-images' and auth.role() = 'authenticated' );

-- 4. (Optional) Allow users to delete their own images
create policy "Users Delete Own Analysis Images"
on storage.objects for delete
using ( bucket_id = 'analysis-images' and auth.uid()::text = (storage.foldername(name))[1] );
