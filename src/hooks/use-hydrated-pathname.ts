"use client";

import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";

function subscribeNoop() {
  return () => {};
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

/**
 * Pathname for nav active states — only after hydration so SSR HTML matches the client.
 */
export function useHydratedPathname(): string | null {
  const pathname = usePathname();
  const hydrated = useSyncExternalStore(
    subscribeNoop,
    getClientSnapshot,
    getServerSnapshot,
  );

  return hydrated ? pathname : null;
}
