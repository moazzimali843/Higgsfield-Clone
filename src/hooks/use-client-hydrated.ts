"use client";

import { useSyncExternalStore } from "react";

function subscribeNoop() {
  return () => {};
}

/**
 * False during SSR and the hydration pass; true once the client store can read
 * browser-only data (e.g. localStorage) without mismatching server HTML.
 */
export function useClientHydrated(): boolean {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
}
