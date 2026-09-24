# Higgsfield studio (assignment)

A small creative studio inspired by [Higgsfield](https://higgsfield.ai/): one compose → generate → library → remix flow, with the wider product map visible and unfinished areas marked **Coming soon**. Not a pixel copy of their marketing site.

## Status

| Phase | State |
|-------|--------|
| 0 — Prompt capture hooks | Done (`CAPTURE-TEST.md`, `.cursor/hooks.json`) |
| 1 — Recon + product/decisions docs | Done (`recon/`, `recon/PRODUCT.md`, `docs/DECISIONS.md`) |
| 2 — App shell (nav, Coming soon, Home) | Done |
| 3 — Effects presets + composer handoff | Done |
| 4 — Image demo job + library | Done |
| 5 — Recipe + remix | Done |
| 6 — Video demo loop | Done |
| 7 — Optional Soul v2 + API key | Done |
| 8 — Vercel deploy + hand-in | In progress on `feature/phase8` — see [`docs/DEPLOY.md`](docs/DEPLOY.md) |

## What is in / out

**In (planned):** Home, Effects presets, Image composer, browser Library, Video (demo), optional real Soul v2 image via server-side API key per job.

**Out:** Accounts, payments, Cinema/Marketing Studio, Supercomputer, MCP console, 3D, contests, community, Genjutsu motion pipelines, full Explore clone.

Details: [`recon/PRODUCT.md`](recon/PRODUCT.md). Architecture: [`docs/DECISIONS.md`](docs/DECISIONS.md).

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Production:** deploy on Vercel — [`docs/DEPLOY.md`](docs/DEPLOY.md). Walkthrough outline: [`docs/WALKTHROUGH.md`](docs/WALKTHROUGH.md).

## Environment variables (Phase 7+, optional)

For **local** testing of real Higgsfield calls only — not for strangers on the public deploy:

| Variable | Purpose |
|----------|---------|
| `HIGGSFIELD_KEY_ID` | Server-side test key id (optional) |
| `HIGGSFIELD_KEY_SECRET` | Server-side test secret (optional) |
| `HIGGSFIELD_CLIENT_POLL_MAX_WAIT_MS` | Browser Soul poll budget before demo fallback (optional; see `docs/DEPLOY.md`) |
| `HIGGSFIELD_POLL_MAX_WAIT_MS` | Legacy alias for the client poll budget |

Copy [`.env.example`](.env.example) to `.env.local` for local overrides.

Visitors on the live site use an optional per-request key in the UI; it is not persisted. Avoid putting your own Higgsfield keys in Vercel env on a public deploy.

## Prompt capture

Automatic logs: `.agent-logs/` (see [`CAPTURE-TEST.md`](CAPTURE-TEST.md)). Project hooks in [`.cursor/hooks.json`](.cursor/hooks.json).

## Recon

Screenshots and notes: [`recon/`](recon/). Post-login composer/Effects shots are still to be added before deep UI work — see `recon/PRODUCT.md`.

## License

Assignment / portfolio use unless otherwise specified.
