# Supabase (cloud library + auth)

Without Supabase env vars, the app runs in **local demo mode** (browser `localStorage` library, no sign-in). With Supabase configured, **generation requires sign-in**; guests only see the public showcase in Library.

## One-time project setup

1. Create a [Supabase](https://supabase.com/) project.
2. In the SQL Editor, run the migration files (in order):
   - `supabase/migrations/20260327120000_initial_studio_schema.sql`
   - `supabase/migrations/20260327140000_higgsfield_credentials.sql`
3. **Authentication → Providers → Email**: enable Email, turn on **Confirm email**.
4. **Authentication → URL configuration**:
   - **Site URL**: `http://localhost:3000` (and your Vercel URL in production)
   - **Redirect URLs**: add  
     `http://localhost:3000/auth/callback`  
     `https://<your-vercel-domain>/auth/callback`

## Local env

Copy `.env.example` to `.env.local` and set:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon (publishable) key — RLS applies |

Restart `npm run dev` after changes.

## Behavior

| Mode | Library | Generate |
|------|---------|----------|
| Supabase **not** configured | `localStorage` (`higgsfield-studio-library-v1`) | Allowed (demo APIs) |
| Logged out (Supabase on) | Public showcase only (`showcase-*` tiles) | Redirect to `/login` |
| Signed in | Your rows in `generations` via `/api/library*` (RLS) | Allowed |

Signed-in users save their Higgsfield API key to `profiles` via `/api/higgsfield/credentials` (RLS: only your row). It persists across sessions until you delete it from the sidebar.

On first sign-in, valid `localStorage` items import into Postgres (deduped by `output_url`), then the local key is cleared.

Showcase example tiles (`showcase-*` ids) are never written to the database.

## Vercel

Add the same two `NEXT_PUBLIC_*` variables in the project settings. CI/build succeeds even when they are unset; only cloud sign-in/library need them.
