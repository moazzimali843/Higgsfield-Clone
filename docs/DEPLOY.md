# Deploy on Vercel

## What reviewers need

Strangers should complete the **demo loop** without logging in:

Home → Effects or Image → generate (Demo model) → Library → recipe → remix.

That path uses `/api/demo/image` and `/api/demo/video` only (~2.2s per job).

For **local QA** when the preview URL requires Vercel login, use `npm run dev` or redeploy with deployment protection disabled for reviewers (see your Vercel project settings).

## Steps (you run these in the browser)

1. Push your feature branch to GitHub.
2. In [Vercel](https://vercel.com/new), import the repository ([deploying from Git](https://vercel.com/docs/deployments)).
3. Framework preset: **Next.js** (defaults are fine).
4. **Do not** add `HIGGSFIELD_KEY_ID` / `HIGGSFIELD_KEY_SECRET` on the public production project unless you intend to fund strangers' API jobs.
5. Deploy. Smoke-test the production URL logged out:
   - Image → Demo model → Generate
   - Library shows the result with a Demo badge
   - Remix opens the composer with the recipe
   - Video → Demo model → Generate

## API keys in the UI

- The header **API key** panel stores credentials in **session storage** (this tab only) for Soul v2 and Seedance 2.5.
- Composers also accept keys per request; empty UI fields still allow server env vars in local dev (`.env.local`).

## Soul v2 on production

- Visitors paste **their own** key in the header panel or composer.
- **Submit** (`POST /api/higgsfield/image`) uploads an optional reference (max **4 MB**, under Vercel's [4.5 MB function body limit](https://vercel.com/docs/functions/limitations)), then starts the Higgsfield job.
- **Poll** happens in the **browser**: repeated `POST /api/higgsfield/image/poll` calls with 2s–10s backoff (up to **120s** by default). Each poll is a short serverless invocation.
- Optional env `HIGGSFIELD_CLIENT_POLL_MAX_WAIT_MS` (or legacy `HIGGSFIELD_POLL_MAX_WAIT_MS`) adjusts the client wait before a labeled demo fallback.
- Submit route sets `maxDuration = 60` for reference upload + Higgsfield submit; poll route uses `maxDuration = 30` per status check.

## Seedance 2.5 video

- **Submit** (`POST /api/higgsfield/video`) starts text-to-video (`bytedance/seedance-2.5/text-to-video`, `generate_audio: false` by default).
- **Poll** uses `POST /api/higgsfield/video/poll` from the browser with the same backoff budget as Soul.
- Status URLs may use `api.higgsfield.ai` or `platform.higgsfield.ai`; both hosts are allowlisted for SSRF safety.
- Video jobs can run longer than Soul; increase `HIGGSFIELD_CLIENT_POLL_MAX_WAIT_MS` locally if needed before accepting demo fallback.

## Env reference

See [`.env.example`](../.env.example).

## Hand-in links

After deploy, keep two labeled URLs for submission:

- **Live app** — `https://<your-project>.vercel.app`
- **GitHub** — your repository URL

Walkthrough outline: [`WALKTHROUGH.md`](./WALKTHROUGH.md).
