/** True when both public Supabase env vars are set (build-safe: no throw). */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && url.length > 0 && key && key.length > 0);
}

export function getSupabasePublicConfig(): {
  url: string;
  anonKey: string;
} | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  };
}
