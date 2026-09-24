"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { LibraryGeneration } from "@/lib/generation-types";
import {
  appendStudioLibraryGeneration,
  getStudioLibraryServerSnapshot,
  getStudioLibrarySnapshot,
  subscribeStudioLibrary,
} from "@/lib/studio-library-client";

export function useStudioLibrary() {
  const items = useSyncExternalStore(
    subscribeStudioLibrary,
    getStudioLibrarySnapshot,
    getStudioLibraryServerSnapshot,
  );

  const append = useCallback((generation: LibraryGeneration) => {
    return appendStudioLibraryGeneration(generation);
  }, []);

  return { items, append };
}
