"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  clearHiggsfieldApiKeySession,
  readHiggsfieldApiKeySession,
  writeHiggsfieldApiKeySession,
} from "@/lib/higgsfield-api-key-session";

type HiggsfieldApiKeyContextValue = {
  apiKeyId: string;
  apiKeySecret: string;
  setApiKeyId: (value: string) => void;
  setApiKeySecret: (value: string) => void;
  saveToSession: () => boolean;
  clearSession: () => boolean;
  sessionError: string | null;
  isConnected: boolean;
  hydrated: boolean;
};

const HiggsfieldApiKeyContext = createContext<HiggsfieldApiKeyContextValue | null>(
  null,
);

export function HiggsfieldApiKeyProvider({ children }: { children: ReactNode }) {
  const [apiKeyId, setApiKeyId] = useState("");
  const [apiKeySecret, setApiKeySecret] = useState("");
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const loaded = readHiggsfieldApiKeySession();
    if (!loaded.ok) {
      setSessionError(loaded.error);
    } else if (loaded.value) {
      setApiKeyId(loaded.value.keyId);
      setApiKeySecret(loaded.value.keySecret);
    }
    setHydrated(true);
  }, []);

  const saveToSession = useCallback(() => {
    const keyId = apiKeyId.trim();
    const keySecret = apiKeySecret.trim();
    if (!keyId || !keySecret) {
      setSessionError("Enter both key ID and secret before saving.");
      return false;
    }
    const saved = writeHiggsfieldApiKeySession({ keyId, keySecret });
    if (!saved.ok) {
      setSessionError(saved.error);
      return false;
    }
    setSessionError(null);
    return true;
  }, [apiKeyId, apiKeySecret]);

  const clearSession = useCallback(() => {
    const cleared = clearHiggsfieldApiKeySession();
    if (!cleared.ok) {
      setSessionError(cleared.error);
      return false;
    }
    setApiKeyId("");
    setApiKeySecret("");
    setSessionError(null);
    return true;
  }, []);

  const value = useMemo(
    (): HiggsfieldApiKeyContextValue => ({
      apiKeyId,
      apiKeySecret,
      setApiKeyId,
      setApiKeySecret,
      saveToSession,
      clearSession,
      sessionError,
      isConnected: Boolean(apiKeyId.trim() && apiKeySecret.trim()),
      hydrated,
    }),
    [
      apiKeyId,
      apiKeySecret,
      saveToSession,
      clearSession,
      sessionError,
      hydrated,
    ],
  );

  return (
    <HiggsfieldApiKeyContext.Provider value={value}>
      {children}
    </HiggsfieldApiKeyContext.Provider>
  );
}

export function useHiggsfieldApiKey(): HiggsfieldApiKeyContextValue {
  const ctx = useContext(HiggsfieldApiKeyContext);
  if (!ctx) {
    throw new Error("useHiggsfieldApiKey must be used within HiggsfieldApiKeyProvider");
  }
  return ctx;
}
