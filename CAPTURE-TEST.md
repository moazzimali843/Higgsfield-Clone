# Capture gate test

## Tool and model

- **Tool:** Cursor IDE Agent
- **Models observed on canaries:** `composer-2.5` (canary 1), `grok-4.7-high` with `model_id` `grok-4.7` (canary 2). The hook records `model` / `model_id` from the hook payload when present; otherwise it stamps `grok-4.7`.
- **Automatic mechanism:** Project hooks in [`.cursor/hooks.json`](.cursor/hooks.json), script [`.cursor/hooks/capture.py`](.cursor/hooks/capture.py). Events: `sessionStart`, `beforeSubmitPrompt` (prints `{"continue": true}`), `afterAgentResponse`, `stop`. `afterAgentThought` is not logged. `failClosed` is false.

## Log paths (canaries)

| Chat | Session ID | Log file |
|------|------------|----------|
| Canary 1 | `98aa1648-6859-4fcc-ae7e-084a489eac17` | [`.agent-logs/2026-09-23_19-01-49_98aa1648-6859-4fcc-ae7e-084a489eac17.md`](.agent-logs/2026-09-23_19-01-49_98aa1648-6859-4fcc-ae7e-084a489eac17.md) |
| Canary 2 | `b55133c7-ce84-4ba4-ab8b-f0b25981507a` | [`.agent-logs/2026-09-23_19-02-38_b55133c7-ce84-4ba4-ab8b-f0b25981507a.md`](.agent-logs/2026-09-23_19-02-38_b55133c7-ce84-4ba4-ab8b-f0b25981507a.md) |

Author in frontmatter: `chotabhaiazam@gmail.com` (from `user_email` in the hook payload).

## Planning chat (not in automatic log)

The planning conversation that produced the studio phases plan and the initial hook install happened before capture was verified end-to-end in Agent. It is not backfilled into `.agent-logs/`.

## Canary 1 (raw from log)

**PROMPT**

```
CAPTURE TEST — 8x assignment, Moazzim
```

**RESPONSE** (status: completed, model: composer-2.5)

```
**Canary 1 received** — `CAPTURE TEST — 8x assignment, Moazzim`

The capture hook for this session is working on the prompt side. Your message is already in:

`.agent-logs/2026-09-23_19-01-49_98aa1648-6859-4fcc-ae7e-084a489eac17.md`

Session metadata shows `composer-2.5`, `exchange_count: 1`, and your prompt stored verbatim under **Exchange 1**.

**Next step (canary 2):** open a **new** Agent chat and send:

`CAPTURE TEST 2 — 8x assignment, Moazzim`

Wait for that reply, then tell whoever is running the gate that both canaries are done. After this turn finishes, the `stop` hook should append this assistant reply to the same log file.
```

## Canary 2 (raw from log)

**PROMPT**

```
CAPTURE TEST 2 — 8x assignment, Moazzim
```

**RESPONSE** (status: completed, model: grok-4.7-high)

```
**Canary 2 received** — `CAPTURE TEST 2 — 8x assignment, Moazzim`

The capture hook for this session is working on the prompt side. Your message is already in:

`.agent-logs/2026-09-23_19-02-38_b55133c7-ce84-4ba4-ab8b-f0b25981507a.md`

Session metadata shows `grok-4.7-high`, `exchange_count: 1`, and your prompt stored verbatim under **Exchange 1**.

Both canaries are done. Tell whoever is running the gate. After this turn finishes, the `stop` hook should append this assistant reply to the same log file.
```

## Gate checklist

1. Hook installed — yes
2. Canary 1 prompt + response in `.agent-logs/` — yes (separate file)
3. Canary 2 in its own file — yes
4. This document — yes
5. First commit (hooks + logs + `CAPTURE-TEST.md`) — pending until requested

## Failures tried / notes

- Local fixture tests under `/tmp/capture-hook-test*` before live canaries; no live failures.
- `beforeSubmitPrompt` payload includes `model` and `model_id` (not only on `sessionStart`).
- Hook state under `.cursor/hooks/state/` is gitignored; `.agent-logs/` is not.
