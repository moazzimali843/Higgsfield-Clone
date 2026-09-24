# Product scope

## What Higgsfield is (recon summary)

[higgsfield.ai](https://higgsfield.ai/) is a large **AI-native creative suite**: Explore marketing home, top-level **Image**, **Video**, **Audio**, **Effects**, **Genjutsu**, **Cinema Studio**, **Marketing Studio**, **Supercomputer**, **MCP/API**, **Contests**, **Community**, **Canvas**, and dozens of model-specific landing blocks (Seedance, Soul, Nano Banana, and similar). The logged-out Explore page scrolls through promo cards, model grids, community galleries, and a full footer sitemap (`recon/landing-page-shot13-before-login.png`).

Sign-up and onboarding ask personal vs team use, role, and goals (`recon/signup.png`, `recon/onboarding-screen*.png`). We are **not** rebuilding that funnel.

Recon assets so far live in `recon/` (landing scroll, signup, onboarding). **Still to capture after onboarding:** Image composer, Effects gallery, a result view, and Library/Assets — see [Recon gaps](#recon-gaps).

## One user

A **creator** who wants a **finished image or short clip** without navigating a mall of separate tools, model pages, and studios. They care about the prompt and the outcome, not which backend SKU they picked.

## One reviewer journey

A **stranger** (no account on our site):

1. Opens the **public deployed link**.
2. Goes to **Image** (or picks an **Effect** preset).
3. Writes a prompt and **generates** — gets a **demo** result, clearly labeled.
4. Opens the **recipe** (prompt, model, settings, demo vs real).
5. **Remixes** into the composer and generates again.
6. Later phases: same loop for **video**; optional **real Soul v2** render if they paste a Higgsfield API key for that job only.

They never need our login, our database, or our Higgsfield credentials.

## What we are building

A **small studio with one create flow**: pick an effect or start blank → compose → job (pending → done) → **library** in the browser → recipe → remix. Navigation shows the **wider Higgsfield map** on day one; unfinished areas are honest **Coming soon** pages.

### In scope (by phase)

| Area | MVP behavior |
|------|----------------|
| **Home** | What the studio does; entry to Effects and Image; Coming soon cards for the rest |
| **Effects** | Local preset gallery (name, still, prompt, settings) — recipe cards, not Genjutsu motion pipelines |
| **Image** | Composer (prompt, aspect, small model list, optional reference); demo job; results in library |
| **Library** | Browser-stored generations; empty state; recipe + remix |
| **Video** | Same composer and job pattern with demo clip (after image loop works) |
| **Real render (optional)** | Soul v2 standard via server-side API + visitor-supplied key; estimate before spend; demo fallback on failure |

### Coming soon (shown in nav, real pages)

Audio, 3D, Edit, Cinema Studio, Marketing Studio, Supercomputer, Contests, Community, Canvas, MCP — and anything else on their map we do not implement.

### Will not build in this assignment

Accounts, payments, billing UI, Cinema Studio, Marketing Studio, Supercomputer agent, MCP product surface, 3D, RAG, model marketplace, Genjutsu motion transfer (needs verified model path + uploads + source video), full Explore/marketing clone, contests, or community feeds.

## Better than cloning the homepage

- **One composer** for image and video instead of a different product per model.
- Every result keeps a **recipe** and can be **remixed**.
- **Demo** outputs are labeled; real API is optional and never required for review.
- Unfinished nav items say **Coming soon** in plain language.

## Recon gaps

Before UI work on Effects/Image (Phases 2–3), add a short post-login set under `recon/`:

- Image create / composer
- Effects (or Visual Effects) picker
- One generation result (settings visible if possible)
- Assets / library list
- Video entry (for copy only until Phase 6)

## Screenshot index (current)

| File | Notes |
|------|--------|
| `landing-page-shot1-before-login.png` … `shot13` | Explore scroll: promos, Visual Effects, Seedance, Supercomputer, Soul 2.0, footer sitemap |
| `signup.png` | Auth modal (out of scope for our product) |
| `onboarding-screen1.png` … `screen7` | Post-signup questionnaire (out of scope) |
