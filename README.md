# Higgsfield Studio

A browser-based creative studio inspired by [Higgsfield](https://higgsfield.ai/). Compose images and video, browse effect presets, keep a personal library with full generation recipes, and remix past work—all in one flow. This is an independent project, not an official Higgsfield product.

## What you can do

- **Home** — Overview and shortcuts into the studio.
- **Effects** — Pick a preset look and open the image composer with prompt and settings already filled in.
- **Image** — Write a prompt, adjust options, and generate images.
- **Video** — Same compose → generate flow for short clips.
- **Library** — See everything you created, inspect the recipe, and remix into the composer again.

Several areas from the wider Higgsfield product map (Audio, 3D, Cinema Studio, and others) appear in the navigation as **Coming soon** placeholders.

**Demo mode** works out of the box with no account and no API keys. Choose the demo model in the composers to try the full loop locally or on a deployed site.

**Real generations** use your own [Higgsfield API credentials](https://higgsfield.ai/) via the **API key** control in the header (stored only in this browser tab) or optional fields on the image/video composers. Keys are never saved to the server or written to disk by the app.

Your **library** is stored in this browser only (`localStorage`). Clearing site data or using another device starts a fresh library.

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

1. Open **Effects**, choose a preset, and continue to the image composer.
2. Leave the **Demo** model selected and generate.
3. Open **Library**, open the new item, and use **Remix** to send the recipe back to the composer.
4. Try **Video** with the demo model and confirm the clip appears in the library.

That path needs no API keys and matches what you get on a typical public deployment.

## Optional: API keys for local development

If you want the server to use Higgsfield credentials without pasting them in the UI every time, copy `.env.example` to `.env.local` and set:

| Variable | Purpose |
|----------|---------|
| `HIGGSFIELD_KEY_ID` | Higgsfield API key ID |
| `HIGGSFIELD_KEY_SECRET` | Higgsfield API secret |
| `HIGGSFIELD_CLIENT_POLL_MAX_WAIT_MS` | How long the browser waits on real image jobs before falling back to demo (milliseconds; optional) |

Restart `npm run dev` after changing `.env.local`.

On a **public** deployment, prefer visitors’ own keys in the UI. Putting your keys in hosted environment variables can let strangers spend your API quota.

## Deploy your own copy

This app is a standard [Next.js](https://nextjs.org/) project and deploys cleanly on [Vercel](https://vercel.com/) (or any host that supports Next.js):

1. Push the repo to GitHub (or GitLab / Bitbucket).
2. Import the repository in Vercel and accept the **Next.js** preset.
3. Deploy without Higgsfield env vars unless you intentionally fund API usage for all visitors.
4. After deploy, smoke-test while logged out: image demo generate → library → remix → video demo generate.

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
