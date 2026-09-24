# Architecture decisions

Short record of choices for this repo so we do not relitigate them mid-build. Aligned with `recon/PRODUCT.md` and the [Higgsfield API docs](https://docs.higgsfield.ai/docs).

## App shape

| Decision | Choice | Why |
|----------|--------|-----|
| Framework | **Next.js + TypeScript** | One deployable app, App Router, API routes on the same origin |
| Topology | **Monolith**, not microservices | One person, one public URL, minimal ops |
| Styling | **Dark studio UI**, own typography and accent | Assignment is a usable studio, not a lime marketing clone |
| Auth | **None** for visitors | Strangers must complete the demo loop without signing up |
| Data store | **No database** | Library and recipes live in the **browser** (e.g. `localStorage` / IndexedDB) |
| Server role | **Thin BFF** only | Hide Higgsfield `KEY_ID:KEY_SECRET`, submit jobs, poll `status_url`, optional file upload to presigned URLs |
| Client → Higgsfield | **Never** | Browser never holds the secret or calls `api.higgsfield.ai` directly |
| Public API | **REST under `/api`**, no GraphQL, no versioned external API | Internal routes for our UI only |
| Environments | **Local + Vercel production** | No staging stack or Terraform for this assignment |

## Generation

| Decision | Choice | Why |
|----------|--------|-----|
| Default path | **Demo provider** | Reviewer always gets a labeled demo image/clip without a key |
| Real path | **Optional per-job API key** (Phase 7) | Posted to our route for that job only; not stored in git, logs, disk, or `localStorage` |
| First real model | **Soul v2 standard** — `POST /higgsfield-ai/soul/v2/standard` with `{ "prompt" }` | Documented quickstart; no guessed Seedance/Genjutsu paths |
| Async lifecycle | Submit → `request_id` + `status_url` → poll 2s–10s backoff | Matches Higgsfield requests/polling docs |
| Failure handling | **Labeled fallback** to demo or clear error | Missing key, `401`, `404`/`423`/`503`, `failed`, `nsfw` — never pretend demo is a paid render |
| Estimate | `POST /estimate/<model-path>` before real submit | Show `credits` and `usd` |
| Retention | Show **7-day URL retention** note on real outputs | Per billing/retention docs |

## Product boundaries

| Decision | Choice | Why |
|----------|--------|-----|
| Effects | **Static preset JSON** in repo | Recipe handoff to composer; not motion-tracking Genjutsu |
| Video | **Same job loop as image** | One mental model for the user |
| Coming soon routes | **Real pages**, not dead links | Honest map of their suite without building every product |
| Capture | **Cursor project hooks** → `.agent-logs/` | Assignment requirement; commits interleave logs with features |

## Explicitly out of scope

SQL/NoSQL, GDPR program, LLM/embeddings layer, prompt-versioning system, CI/CD design doc, OWASP program, multi-cloud cost model, reusable client template repo.

## Open items (resolve during build)

- Exact demo asset URLs and job timing (Phase 4+).
- Reference image upload for real Soul path (Phase 7.3) via `POST /files/generate-upload-url` — server-side only.
- Real video model endpoint — only after its doc page is confirmed; demo video does not need it.
