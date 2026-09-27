# Higgsfield Studio

A browser-based creative studio inspired by [Higgsfield](https://higgsfield.ai/). Create images and video, keep a personal library with full generation recipes—all in one flow. This is an independent project, not an official Higgsfield product.

## What you can do

- **Home** — Overview and shortcuts into the studio.
- **Image** — Write a prompt, adjust options, and generate images.
- **Video** — Create short clips from a prompt with the same generate → library flow.
- **Library** — See everything you created and inspect each recipe.

Several areas from the wider Higgsfield product map (Audio, 3D, Cinema Studio, and others) appear in the navigation as **Coming soon** placeholders.

**Demo mode** works out of the box with no account and no API keys. Choose the demo model on Image or Video to try the full loop locally or on a deployed site.

**Real generations** call the [Higgsfield API](https://docs.higgsfield.ai/docs) (Soul v2 images, Seedance 2.5 video) when you choose those models and paste credentials from [open.higgsfield.ai/api-keys](https://open.higgsfield.ai/api-keys) as `key-id:key-secret` in the sidebar **API key** control or on the Image page. Credentials stay in this browser tab’s session storage only; they are sent to this app’s server routes to call Higgsfield, never written to git.

Your **library** is stored in this browser (`localStorage`) when you are not signed in. **Optional:** sign in (sidebar) to sync up to 48 generations to Supabase Postgres — see [docs/SUPABASE.md](docs/SUPABASE.md). Clearing site data removes the local copy; cloud items remain on your account.

## Requirements

- [Node.js](https://nodejs.org/) 18 or newer
- npm (comes with Node)

## Install and run

Clone the repository, install dependencies, and start the development server:

```bash
git clone https://github.com/moazzimali843/Higgsfield-Clone.git
cd Higgsfield-Clone
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production build (local)

```bash
npm run build
npm start
```

The app listens on [http://localhost:3000](http://localhost:3000) by default.

## Suggested first session

1. Open **Image**, leave the **Demo** model selected, and generate.
2. Open **Library** and open the new item to view its recipe.
3. Try **Video** with the demo model and confirm the clip appears in the library.

That path needs no API keys and matches what you get on a typical public deployment.

## Optional: API keys for local development

If you want the server to use Higgsfield credentials without pasting them in the UI every time, copy `.env.example` to `.env.local` and set:

| Variable | Purpose |
|----------|---------|
| `HF_CREDENTIALS` or `HIGGSFIELD_CREDENTIALS` | Combined `key-id:key-secret` (same as the official SDKs) |
| `HIGGSFIELD_KEY_ID` | Optional split key ID (with `HIGGSFIELD_KEY_SECRET`) |
| `HIGGSFIELD_KEY_SECRET` | Optional split key secret |
| `HIGGSFIELD_CLIENT_POLL_MAX_WAIT_MS` | How long the browser waits on real image jobs before falling back to demo (milliseconds; optional) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (optional; cloud library) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (optional; cloud library) |

Restart `npm run dev` after changing `.env.local`.

On a **public** deployment, prefer visitors’ own keys in the UI. Putting your keys in hosted environment variables can let strangers spend your API quota.

## Deploy your own copy

This app is a standard [Next.js](https://nextjs.org/) project and deploys cleanly on [Vercel](https://vercel.com/) (or any host that supports Next.js):

1. Push the repo to GitHub (or GitLab / Bitbucket).
2. Import the repository in Vercel and accept the **Next.js** preset.
3. Deploy without Higgsfield env vars unless you intentionally fund API usage for all visitors.
4. After deploy, smoke-test while logged out: image demo generate → library → video demo generate.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build |
| `npm start` | Run the production build |
| `npm run lint` | ESLint |
| `npm test` | Unit tests |

## Stack

Next.js, React, TypeScript, and Tailwind CSS.

## Disclaimer

Higgsfield is a trademark of its respective owner. This repository is for learning and demonstration; media and APIs are subject to Higgsfield’s terms when you use their services.
