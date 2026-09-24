"use client";

import { useSyncExternalStore } from "react";

function getColumnCount(width: number): number {
  if (width >= 1024) return 3;
  if (width >= 640) return 2;
  return 1;
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
}

function getSnapshot(): number {
  return getColumnCount(window.innerWidth);
}

function getServerSnapshot(): number {
  return 1;
}

export function useMasonryColumnCount(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
