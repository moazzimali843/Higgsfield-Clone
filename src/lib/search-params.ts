/** Next.js may pass duplicate query keys as string[]. */

export function firstQueryValue(
  value: string | string[] | undefined,
): string | undefined {
  if (value === undefined) return undefined;
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === undefined) return undefined;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
