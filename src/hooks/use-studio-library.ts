"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { LibraryGeneration } from "@/lib/generation-types";
import {
  appendStudioLibraryGeneration,
  getStudioLibraryStoreServerSnapshot,
  getStudioLibraryStoreSnapshot,
  subscribeStudioLibrary,
} from "@/lib/studio-library-client";

export function useStudioLibrary() {
  const store = useSyncExternalStore(
    subscribeStudioLibrary,
    getStudioLibraryStoreSnapshot,
    getStudioLibraryStoreServerSnapshot,
  );

  const append = useCallback((generation: LibraryGeneration) => {
    return appendStudioLibraryGeneration(generation);
  }, []);

  return {
    items: store.items,
    loading: store.loading,
    error: store.error,
    hydrated: store.hydrated,
    cloudMode: store.cloudMode,
    append,
  };
}
