"use client";

import type { LibraryGeneration } from "@/lib/generation-types";
import {
  LIBRARY_STORAGE_KEY,
  prependGeneration,
  readLibraryFromStorage,
  serializeLibrary,
  writeLibraryToStorage,
} from "@/lib/studio-library";

const listeners = new Set<() => void>();

/** Stable empty reference for useSyncExternalStore when the library is empty. */
const EMPTY_SNAPSHOT: LibraryGeneration[] = [];

let cachedRaw: string | null | undefined;
let cachedSnapshot: LibraryGeneration[] = EMPTY_SNAPSHOT;

function notifyLibraryListeners() {
  listeners.forEach((listener) => listener());
}

function syncCacheFromStorage(): LibraryGeneration[] {
  const raw = window.localStorage.getItem(LIBRARY_STORAGE_KEY);
  if (raw === cachedRaw) {
    return cachedSnapshot;
  }
  cachedRaw = raw;
  const items = readLibraryFromStorage(window.localStorage);
  cachedSnapshot = items.length === 0 ? EMPTY_SNAPSHOT : items;
  return cachedSnapshot;
}

function commitLibrarySnapshot(next: LibraryGeneration[]): boolean {
  try {
    const serialized = serializeLibrary(next);
    writeLibraryToStorage(window.localStorage, next);
    cachedRaw = serialized;
    cachedSnapshot = next.length === 0 ? EMPTY_SNAPSHOT : next;
    return true;
  } catch {
    return false;
  }
}

export function subscribeStudioLibrary(onChange: () => void): () => void {
  listeners.add(onChange);
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === LIBRARY_STORAGE_KEY) {
      cachedRaw = undefined;
      onChange();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function getStudioLibrarySnapshot(): LibraryGeneration[] {
  return syncCacheFromStorage();
}

export function getStudioLibraryServerSnapshot(): LibraryGeneration[] {
  return EMPTY_SNAPSHOT;
}

export function appendStudioLibraryGeneration(
  generation: LibraryGeneration,
): boolean {
  const current = syncCacheFromStorage();
  const next = prependGeneration(current, generation);
  const saved = commitLibrarySnapshot(next);
  if (saved) {
    notifyLibraryListeners();
  }
  return saved;
}
