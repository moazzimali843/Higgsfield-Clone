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
import {
  formatHiggsfieldCredentialsString,
  parseHiggsfieldCredentialsString,
} from "@/lib/higgsfield-client";

type HiggsfieldApiKeyContextValue = {
  /** Full `key-id:key-secret` string from Higgsfield Console */
  credentials: string;
  setCredentials: (value: string) => void;
  apiKeyId: string;
  apiKeySecret: string;
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
  const [credentials, setCredentials] = useState("");
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const parsed = useMemo(
    () => parseHiggsfieldCredentialsString(credentials),
    [credentials],
  );
  const apiKeyId = parsed?.keyId ?? "";
  const apiKeySecret = parsed?.keySecret ?? "";

  useEffect(() => {
    const loaded = readHiggsfieldApiKeySession();
    if (!loaded.ok) {
      setSessionError(loaded.error);
    } else if (loaded.value) {
      setCredentials(formatHiggsfieldCredentialsString(loaded.value));
    }
    setHydrated(true);
  }, []);

  const saveToSession = useCallback(() => {
    const creds = parseHiggsfieldCredentialsString(credentials);
    if (!creds) {
      setSessionError(
        "Paste credentials as key-id:key-secret (from open.higgsfield.ai/api-keys).",
      );
      return false;
    }
    const saved = writeHiggsfieldApiKeySession(creds);
    if (!saved.ok) {
      setSessionError(saved.error);
      return false;
    }
    setSessionError(null);
    return true;
  }, [credentials]);

  const clearSession = useCallback(() => {
    const cleared = clearHiggsfieldApiKeySession();
    if (!cleared.ok) {
      setSessionError(cleared.error);
      return false;
    }
    setCredentials("");
    setSessionError(null);
    return true;
  }, []);

  const value = useMemo(
    (): HiggsfieldApiKeyContextValue => ({
      credentials,
      setCredentials,
      apiKeyId,
      apiKeySecret,
      saveToSession,
      clearSession,
      sessionError,
      isConnected: Boolean(parsed),
      hydrated,
    }),
    [
      credentials,
      apiKeyId,
      apiKeySecret,
      saveToSession,
      clearSession,
      sessionError,
      parsed,
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
