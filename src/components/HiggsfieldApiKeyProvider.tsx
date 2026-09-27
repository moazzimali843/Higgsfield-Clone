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
import { useSupabaseAuth } from "@/components/SupabaseAuthProvider";
import { isStudioSignInRequired } from "@/lib/studio-auth-gate";
import {
  clearHiggsfieldApiKeySession,
  readHiggsfieldApiKeySession,
  writeHiggsfieldApiKeySession,
} from "@/lib/higgsfield-api-key-session";
import {
  formatHiggsfieldCredentialsString,
  parseHiggsfieldCredentialsString,
} from "@/lib/higgsfield-client";
import {
  deleteRemoteHiggsfieldCredentials,
  fetchRemoteHiggsfieldCredentials,
  saveRemoteHiggsfieldCredentials,
} from "@/lib/studio-higgsfield-credentials-client";

type HiggsfieldApiKeyContextValue = {
  /** Full `key-id:key-secret` string from Higgsfield Console */
  credentials: string;
  setCredentials: (value: string) => void;
  apiKeyId: string;
  apiKeySecret: string;
  saveCredentials: () => Promise<boolean>;
  deleteCredentials: () => Promise<boolean>;
  persistError: string | null;
  isConnected: boolean;
  hydrated: boolean;
  saving: boolean;
  deleting: boolean;
};

const HiggsfieldApiKeyContext = createContext<HiggsfieldApiKeyContextValue | null>(
  null,
);

export function HiggsfieldApiKeyProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useSupabaseAuth();
  const cloudMode = isStudioSignInRequired();
  const [credentials, setCredentials] = useState("");
  const [hasPersistedKey, setHasPersistedKey] = useState(false);
  const [persistError, setPersistError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const parsed = useMemo(
    () => parseHiggsfieldCredentialsString(credentials),
    [credentials],
  );
  const apiKeyId = parsed?.keyId ?? "";
  const apiKeySecret = parsed?.keySecret ?? "";

  const loadGuestSession = useCallback(() => {
    const loaded = readHiggsfieldApiKeySession();
    if (!loaded.ok) {
      setPersistError(loaded.error);
      setHasPersistedKey(false);
      setCredentials("");
      return;
    }
    if (loaded.value) {
      setCredentials(formatHiggsfieldCredentialsString(loaded.value));
      setHasPersistedKey(true);
    } else {
      setCredentials("");
      setHasPersistedKey(false);
    }
    setPersistError(null);
  }, []);

  const loadCloudCredentials = useCallback(async () => {
    const result = await fetchRemoteHiggsfieldCredentials();
    if (!result.ok) {
      setPersistError(result.error);
      setCredentials("");
      setHasPersistedKey(false);
      return;
    }
    if (result.credentials) {
      setCredentials(result.credentials);
      setHasPersistedKey(true);
    } else {
      setCredentials("");
      setHasPersistedKey(false);
    }
    setPersistError(null);
  }, []);

  useEffect(() => {
    if (cloudMode) {
      if (authLoading) {
        return;
      }
      if (!user) {
        setCredentials("");
        setHasPersistedKey(false);
        setPersistError(null);
        setHydrated(true);
        return;
      }
      let active = true;
      setHydrated(false);
      void loadCloudCredentials().finally(() => {
        if (active) {
          setHydrated(true);
        }
      });
      return () => {
        active = false;
      };
    }

    loadGuestSession();
    setHydrated(true);
  }, [authLoading, cloudMode, loadCloudCredentials, loadGuestSession, user]);

  const saveCredentials = useCallback(async (): Promise<boolean> => {
    const creds = parseHiggsfieldCredentialsString(credentials);
    if (!creds) {
      setPersistError(
        "Paste credentials as key-id:key-secret (from open.higgsfield.ai/api-keys).",
      );
      return false;
    }

    setSaving(true);
    setPersistError(null);
    try {
      if (cloudMode) {
        const saved = await saveRemoteHiggsfieldCredentials(credentials);
        if (!saved.ok) {
          setPersistError(saved.error);
          return false;
        }
        setCredentials(saved.credentials);
        setHasPersistedKey(true);
        return true;
      }

      const written = writeHiggsfieldApiKeySession(creds);
      if (!written.ok) {
        setPersistError(written.error);
        return false;
      }
      setHasPersistedKey(true);
      return true;
    } finally {
      setSaving(false);
    }
  }, [cloudMode, credentials]);

  const deleteCredentials = useCallback(async (): Promise<boolean> => {
    setDeleting(true);
    setPersistError(null);
    try {
      if (cloudMode) {
        const removed = await deleteRemoteHiggsfieldCredentials();
        if (!removed.ok) {
          setPersistError(removed.error);
          return false;
        }
      } else {
        const cleared = clearHiggsfieldApiKeySession();
        if (!cleared.ok) {
          setPersistError(cleared.error);
          return false;
        }
      }
      setCredentials("");
      setHasPersistedKey(false);
      return true;
    } finally {
      setDeleting(false);
    }
  }, [cloudMode]);

  const value = useMemo(
    (): HiggsfieldApiKeyContextValue => ({
      credentials,
      setCredentials,
      apiKeyId,
      apiKeySecret,
      saveCredentials,
      deleteCredentials,
      persistError,
      isConnected: hasPersistedKey && Boolean(parsed),
      hydrated,
      saving,
      deleting,
    }),
    [
      credentials,
      apiKeyId,
      apiKeySecret,
      saveCredentials,
      deleteCredentials,
      persistError,
      hasPersistedKey,
      parsed,
      hydrated,
      saving,
      deleting,
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
