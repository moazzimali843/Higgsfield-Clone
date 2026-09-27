import { isSupabaseConfigured } from "@/lib/supabase/config";

/** When true, image/video generation and personal library require a signed-in user. */
export function isStudioSignInRequired(): boolean {
  return isSupabaseConfigured();
}

/** Relative in-app paths only (blocks open redirects). */
export function isSafeStudioReturnPath(path: string): boolean {
  if (!path.startsWith("/") || path.startsWith("//")) {
    return false;
  }
  if (path === "/login/reset-password") {
    return true;
  }
  if (path.startsWith("/login")) {
    return false;
  }
  return true;
}

export function normalizeStudioReturnPath(path: string | undefined): string {
  if (path && isSafeStudioReturnPath(path)) {
    return path;
  }
  return "/library";
}

export function loginHrefForReturnTo(returnTo: string): string {
  const safe = normalizeStudioReturnPath(returnTo);
  const params = new URLSearchParams({ redirect: safe });
  return `/login?${params.toString()}`;
}

/** API keys are only meaningful once generation is allowed (signed-in when Supabase is on). */
export function shouldShowStudioApiKeyPanel(input: {
  signInRequired: boolean;
  user: unknown;
  authLoading: boolean;
}): boolean {
  if (!input.signInRequired) {
    return true;
  }
  if (input.user) {
    return true;
  }
  return false;
}

export function shouldShowStudioApiKeyPanelLoading(input: {
  signInRequired: boolean;
  user: unknown;
  authLoading: boolean;
}): boolean {
  return (
    input.signInRequired && input.authLoading && !input.user
  );
}
