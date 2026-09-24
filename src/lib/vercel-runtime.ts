/**
 * How long the browser polls Soul v2 before asking the server for demo fallback.
 */
export function higgsfieldClientPollMaxWaitMs(
  env: Record<string, string | undefined> = process.env,
): number {
  const override =
    env.HIGGSFIELD_CLIENT_POLL_MAX_WAIT_MS?.trim() ||
    env.HIGGSFIELD_POLL_MAX_WAIT_MS?.trim();
  if (override) {
    const parsed = Number.parseInt(override, 10);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return 120_000;
}

/** Backoff bounds for client-side status polling (matches Higgsfield docs). */
export const HIGGSFIELD_POLL_INITIAL_DELAY_MS = 2_000;
export const HIGGSFIELD_POLL_MAX_DELAY_MS = 10_000;
