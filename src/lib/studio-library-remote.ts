import type { LibraryGeneration } from "@/lib/generation-types";

export type LibraryFetchResult =
  | { ok: true; items: LibraryGeneration[] }
  | { ok: false; status: number; error: string };

export async function fetchRemoteLibrary(): Promise<LibraryFetchResult> {
  const response = await fetch("/api/library", { credentials: "include" });
  if (!response.ok) {
    let error = "Failed to load cloud library.";
    try {
      const data = (await response.json()) as { error?: string };
      if (data.error) {
        error = data.error;
      }
    } catch {
      // ignore
    }
    return { ok: false, status: response.status, error };
  }
  const data = (await response.json()) as { items: LibraryGeneration[] };
  return { ok: true, items: data.items ?? [] };
}

export async function postRemoteLibraryGeneration(
  generation: LibraryGeneration,
): Promise<{ ok: true; item: LibraryGeneration } | { ok: false; error: string }> {
  const response = await fetch("/api/library", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(generation),
  });
  if (!response.ok) {
    let error = "Failed to save to cloud library.";
    try {
      const data = (await response.json()) as { error?: string };
      if (data.error) {
        error = data.error;
      }
    } catch {
      // ignore
    }
    return { ok: false, error };
  }
  const data = (await response.json()) as { item: LibraryGeneration };
  return { ok: true, item: data.item };
}

export async function fetchRemoteLibraryGenerationById(
  id: string,
): Promise<LibraryGeneration | null> {
  const response = await fetch(`/api/library/${encodeURIComponent(id)}`, {
    credentials: "include",
  });
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    return null;
  }
  const data = (await response.json()) as { item: LibraryGeneration };
  return data.item ?? null;
}

export async function importRemoteLibrary(
  items: LibraryGeneration[],
): Promise<{ imported: number; skipped: number } | null> {
  const response = await fetch("/api/library/import", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
  if (!response.ok) {
    return null;
  }
  return (await response.json()) as { imported: number; skipped: number };
}
