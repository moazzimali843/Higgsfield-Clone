# Walkthrough script (you record this)

Target: **under 5 minutes**, **camera on**, one take is fine. Show the **live Vercel URL** and mention the **public GitHub** repo.

## 1. Framing (~30s)

- What this is: a small Higgsfield-inspired studio, not a homepage clone.
- What you cut: accounts, billing, Cinema/Marketing/Supercomputer products, etc.
- What you kept: one compose → generate → library → remix loop, with honest **Coming soon** pages for the rest of their map.

## 2. Demo loop — image (~90s)

- Open **Home** → **Effects** → pick a preset → lands in **Image** with the recipe filled.
- Generate with **Demo** model; point out the **Demo** badge and pending → done states.
- Open **Library** → open recipe (prompt, model, settings, demo vs real).
- **Remix** back into the composer and generate again.

## 3. Video (~45s)

- **Video** tab → same pattern → short demo clip in library.

## 4. Optional real Soul v2 (~60s, skip if no key)

- Switch model to Soul v2, paste **your** Higgsfield API key (say it is not saved).
- Optional: **Estimate cost** before generate.
- Mention references are capped at **4 MB** for Vercel; Soul jobs **poll in the browser** so long renders work on production.
- Show a real render **or** a labeled demo fallback if the job exceeds the wait window.

## 5. Close (~20s)

- Repeat live URL + repo URL.
- Mention `.agent-logs/` in git history (prompt capture assignment).
- One thing you would add next (e.g. client-side poll for long Soul jobs on Vercel).
