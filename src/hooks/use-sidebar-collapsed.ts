"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "studio-sidebar-collapsed";

export function useSidebarCollapsed() {
  const [collapsed, setCollapsedState] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "1") setCollapsedState(true);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const setCollapsed = useCallback((value: boolean) => {
    setCollapsedState(value);
    try {
      window.localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed(!collapsed);
  }, [collapsed, setCollapsed]);

  return { collapsed, setCollapsed, toggleCollapsed, ready };
}
