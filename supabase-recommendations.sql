-- Create table for caching AI recommendations based on analysis patterns
create table if not exists public.cached_recommendations (
    id uuid default gen_random_uuid() primary key,
    face_type text not null,
    concerns text[] not null,
    recommendations jsonb not null,
    advice text,
    created_at timestamptz default now(),
    unique(face_type, concerns)
);

alter table public.cached_recommendations enable row level security;

drop policy if exists "Allow public read cached recommendations" on public.cached_recommendations;
drop policy if exists "Allow authenticated insert cached recommendations" on public.cached_recommendations;
drop policy if exists "Allow anon insert cached recommendations" on public.cached_recommendations;

-- Read is public for client rendering, writes are server-only via service-role.
create policy "Allow public read cached recommendations"
on public.cached_recommendations
for select
using (true);

-- Ensure treatments table exists and does not allow anon inserts.
drop policy if exists "Allow anon insert treatments" on public.treatments;
drop policy if exists "Allow authenticated insert treatments" on public.treatments;

-- Ensure categories column exists.
do $$
begin
    if not exists (
        select 1
        from information_schema.columns
        where table_name = 'treatments'
          and column_name = 'category'
    ) then
        alter table public.treatments add column category text;
    end if;
end $$;
