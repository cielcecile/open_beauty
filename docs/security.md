# Security Notes

## Admin Access
- `/admin/*` is guarded by middleware (auth cookie presence) and client-side admin email check.
- `/api/admin/*` supports optional `x-admin-api-key` protection via `ADMIN_API_KEY`.
- `POST /api/admin/ingest` requires a valid Supabase bearer token and an admin email match.

## Admin Email Source
- `ADMIN_EMAILS` and `NEXT_PUBLIC_ADMIN_EMAILS` are comma-separated allowlists.
- Keep both values aligned.

## RLS
- `chat_logs` policies now restrict read/write to authenticated users for their own rows.
- Recommendation/treatment anonymous insert policies are removed; writes should happen from server routes using service-role keys.

## API Abuse Mitigation
- `POST /api/chat` and `POST /api/analyze` include in-memory rate limiting.
- For production-grade rate limiting, replace with Redis/Upstash or edge KV.

## Operational Safety
- Supabase client initialization is fail-fast when required env vars are missing.
- `vision` and `booking` APIs return mock responses only in development mode.
