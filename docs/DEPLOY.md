# Deploy on Vercel (Phase 8)

## What reviewers need

Strangers should complete the **demo loop** without logging in:

Home → Effects or Image → generate (Demo model) → Library → recipe → remix.

That path uses `/api/demo/image` and `/api/demo/video` only (~2.2s per job).

## Steps (you run these in the browser)

1. Push `feature/phase8` (or `dev` after merge) to GitHub.
2. In [Vercel](https://vercel.com/new), import the **Higgsfield-Clone** repository ([deploying from Git](https://vercel.com/docs/deployments)).
3. Framework preset: **Next.js** (defaults are fine).
4. **Do not** add `HIGGSFIELD_KEY_ID` / `HIGGSFIELD_KEY_SECRET` on the public production project unless you intend to fund strangers' Soul v2 jobs.
5. Deploy. Smoke-test the production URL logged out:
   - Image → Demo model → Generate
   - Library shows the result with a Demo badge
   - Remix opens the composer with the recipe

## Soul v2 on production

- Visitors paste **their own** key in the composer (per job; not stored).
- **Submit** (`POST /api/higgsfield/image`) uploads an optional reference (max **4 MB** — under Vercel's [4.5 MB function body limit](https://vercel.com/docs/functions/limitations)), then starts the Higgsfield job.
- **Poll** happens in the **browser**: repeated `POST /api/higgsfield/image/poll` calls with 2s–10s backoff (up to **120s** by default). Each poll is a short serverless invocation, so you are not blocked by a single long function run.
- Optional env `HIGGSFIELD_CLIENT_POLL_MAX_WAIT_MS` (or legacy `HIGGSFIELD_POLL_MAX_WAIT_MS`) adjusts the client wait before a labeled demo fallback.
- Submit route sets `maxDuration = 60` for reference upload + Higgsfield submit; poll route uses `maxDuration = 30` per status check.

## Env reference

See [`.env.example`](../.env.example).

## Hand-in links

After deploy, keep two labeled URLs for submission:

- **Live app** — `https://<your-project>.vercel.app`
- **GitHub** — `https://github.com/moazzimali843/Higgsfield-Clone`

Walkthrough outline: [`WALKTHROUGH.md`](./WALKTHROUGH.md).
