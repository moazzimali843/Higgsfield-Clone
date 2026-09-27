"use client";

import type { LibraryGeneration } from "@/lib/generation-types";
import {
  LIBRARY_STORAGE_KEY,
  prependGeneration,
  readLibraryFromStorage,
  serializeLibrary,
  writeLibraryToStorage,
} from "@/lib/studio-library";
import {
  fetchRemoteLibrary,
  postRemoteLibraryGeneration,
} from "@/lib/studio-library-remote";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const listeners = new Set<() => void>();

/** Stable empty reference for useSyncExternalStore when the library is empty. */
const EMPTY_SNAPSHOT: LibraryGeneration[] = [];

let cachedRaw: string | null | undefined;
let cachedSnapshot: LibraryGeneration[] = EMPTY_SNAPSHOT;

let authedMode = false;
let authedSnapshot: LibraryGeneration[] = EMPTY_SNAPSHOT;
let authedHydrated = false;
let authedLoading = false;
let authedError: string | null = null;

export type StudioLibraryStoreSnapshot = {
  items: LibraryGeneration[];
  loading: boolean;
  error: string | null;
  hydrated: boolean;
  cloudMode: boolean;
};

const INITIAL_STORE: StudioLibraryStoreSnapshot = {
  items: EMPTY_SNAPSHOT,
  loading: false,
  error: null,
  hydrated: true,
  cloudMode: false,
};

let storeSnapshot: StudioLibraryStoreSnapshot = INITIAL_STORE;

function guestSavedItems(): LibraryGeneration[] {
  if (isSupabaseConfigured()) {
    return EMPTY_SNAPSHOT;
  }
  return syncCacheFromStorage();
}

function recomputeStoreSnapshot(): StudioLibraryStoreSnapshot {
  const items = authedMode ? authedSnapshot : guestSavedItems();
  const next: StudioLibraryStoreSnapshot = {
    items,
    loading: authedMode && authedLoading,
    error: authedMode ? authedError : null,
    hydrated: !authedMode || authedHydrated,
    cloudMode: authedMode,
  };
  if (
    storeSnapshot.items === next.items &&
    storeSnapshot.loading === next.loading &&
    storeSnapshot.error === next.error &&
    storeSnapshot.hydrated === next.hydrated &&
    storeSnapshot.cloudMode === next.cloudMode
  ) {
    return storeSnapshot;
  }
  storeSnapshot = next;
  return storeSnapshot;
}

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
    if (!authedMode && (event.key === null || event.key === LIBRARY_STORAGE_KEY)) {
      cachedRaw = undefined;
      onChange();
    }
  };
  const onVisibility = () => {
    if (authedMode && document.visibilityState === "visible") {
      void refreshAuthedStudioLibrary();
    }
  };
  window.addEventListener("storage", onStorage);
  document.addEventListener("visibilitychange", onVisibility);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
    document.removeEventListener("visibilitychange", onVisibility);
  };
}

export function getStudioLibraryStoreSnapshot(): StudioLibraryStoreSnapshot {
  return recomputeStoreSnapshot();
}

export function getStudioLibraryStoreServerSnapshot(): StudioLibraryStoreSnapshot {
  return INITIAL_STORE;
}

export function getStudioLibrarySnapshot(): LibraryGeneration[] {
  return getStudioLibraryStoreSnapshot().items;
}

export function getStudioLibraryServerSnapshot(): LibraryGeneration[] {
  return EMPTY_SNAPSHOT;
}

export function isStudioLibraryAuthedMode(): boolean {
  return authedMode;
}

export function isStudioLibraryAuthedHydrated(): boolean {
  return authedHydrated;
}

export function getStudioLibraryAuthedError(): string | null {
  return authedError;
}

export function isStudioLibraryAuthedLoading(): boolean {
  return authedLoading;
}

export function setStudioLibraryAuthedMode(enabled: boolean): void {
  if (authedMode === enabled) {
    return;
  }
  authedMode = enabled;
  if (enabled) {
    authedSnapshot = EMPTY_SNAPSHOT;
    authedHydrated = false;
    authedLoading = false;
    authedError = null;
  } else {
    authedSnapshot = EMPTY_SNAPSHOT;
    authedHydrated = false;
    authedLoading = false;
    authedError = null;
  }
  notifyLibraryListeners();
}

export async function refreshAuthedStudioLibrary(): Promise<boolean> {
  if (!authedMode) {
    return false;
  }
  authedLoading = true;
  authedError = null;
  notifyLibraryListeners();

  const result = await fetchRemoteLibrary();
  authedLoading = false;

  if (!result.ok) {
    authedError = result.error;
    authedHydrated = true;
    notifyLibraryListeners();
    return false;
  }

  authedSnapshot =
    result.items.length === 0 ? EMPTY_SNAPSHOT : result.items;
  authedHydrated = true;
  authedError = null;
  notifyLibraryListeners();
  return true;
}

export async function appendStudioLibraryGeneration(
  generation: LibraryGeneration,
): Promise<boolean> {
  if (authedMode) {
    return appendAuthedStudioLibraryGeneration(generation);
  }

  if (isSupabaseConfigured()) {
    return false;
  }

  const current = syncCacheFromStorage();
  const next = prependGeneration(current, generation);
  const saved = commitLibrarySnapshot(next);
  if (saved) {
    notifyLibraryListeners();
  }
  return saved;
}

async function appendAuthedStudioLibraryGeneration(
  generation: LibraryGeneration,
): Promise<boolean> {
  const optimistic = prependGeneration(
    authedSnapshot === EMPTY_SNAPSHOT ? [] : [...authedSnapshot],
    generation,
  );
  authedSnapshot =
    optimistic.length === 0 ? EMPTY_SNAPSHOT : optimistic;
  notifyLibraryListeners();

  const result = await postRemoteLibraryGeneration(generation);
  if (!result.ok) {
    authedError = result.error;
    await refreshAuthedStudioLibrary();
    return false;
  }

  const merged = prependGeneration(
    authedSnapshot === EMPTY_SNAPSHOT ? [] : [...authedSnapshot],
    result.item,
  );
  authedSnapshot = merged.length === 0 ? EMPTY_SNAPSHOT : merged;
  authedError = null;
  notifyLibraryListeners();
  return true;
}

export function readGuestLibraryForImport(): LibraryGeneration[] {
  return readLibraryFromStorage(window.localStorage);
}

export function clearGuestLibraryStorage(): void {
  try {
    window.localStorage.removeItem(LIBRARY_STORAGE_KEY);
    cachedRaw = undefined;
    cachedSnapshot = EMPTY_SNAPSHOT;
  } catch {
    // ignore
  }
}
