# Open Beauty

Open Beauty is a Next.js 16 app for AI skin analysis, clinic discovery, and hospital chat support.

## Stack
- Next.js (App Router) + React 19 + TypeScript
- Supabase (Auth, Postgres, Storage, RPC)
- Gemini API (analysis/chat/embedding)

## Local Run
1. Install dependencies:
   - `npm install`
2. Configure environment variables:
   - copy `.env.example` to `.env.local`
3. Run dev server:
   - `npm run dev`
4. Open:
   - `http://localhost:3000`

## Required Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`
- `ADMIN_EMAILS` (comma-separated)
- `NEXT_PUBLIC_ADMIN_EMAILS` (comma-separated, same values as ADMIN_EMAILS)

Optional:
- `ADMIN_API_KEY`
- `N8N_VISION_WEBHOOK`
- `N8N_BOOKING_WEBHOOK`
- `NEXT_PUBLIC_SITE_URL`

## Supabase SQL Order
1. Base tables/schema (`supabase-seed.sql`, `supabase-treatments.sql`, other core SQL)
2. RAG setup:
   - `supabase/rag_setup.sql`
   - `supabase/rag_fix_dimensions.sql`
3. Chat logs security:
   - `supabase/chat_logs_setup.sql`
4. Recommendation cache policy:
   - `supabase-recommendations.sql`

## Security Notes
See `docs/security.md` for admin access control, RLS assumptions, and API hardening notes.

## Quality Check
- `npm run lint`

## Deployment
- Ensure all required env vars are set in the deployment environment.
- Do not run production with mock webhooks disabled variables unless intentionally returning 500 for those integrations.
