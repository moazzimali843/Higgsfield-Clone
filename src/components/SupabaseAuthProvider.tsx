"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { importRemoteLibrary } from "@/lib/studio-library-remote";
import {
  clearGuestLibraryStorage,
  readGuestLibraryForImport,
  refreshAuthedStudioLibrary,
  setStudioLibraryAuthedMode,
} from "@/lib/studio-library-client";

type AuthContextValue = {
  configured: boolean;
  loading: boolean;
  user: User | null;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  configured: false,
  loading: true,
  user: null,
  signOut: async () => {},
});

export function useSupabaseAuth(): AuthContextValue {
  return useContext(AuthContext);
}

async function importGuestLibraryIfNeeded(): Promise<void> {
  const guestItems = readGuestLibraryForImport();
  if (guestItems.length === 0) {
    return;
  }
  const result = await importRemoteLibrary(guestItems);
  if (result && result.skipped === 0) {
    clearGuestLibraryStorage();
  }
}

export function SupabaseAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const configured = isSupabaseConfigured();
  const [loading, setLoading] = useState(configured);
  const [user, setUser] = useState<User | null>(null);
  const signedInWorkRef = useRef<Promise<void> | null>(null);

  const handleSignedIn = useCallback(async () => {
    if (signedInWorkRef.current) {
      return signedInWorkRef.current;
    }
    const work = (async () => {
      setStudioLibraryAuthedMode(true);
      await importGuestLibraryIfNeeded();
      await refreshAuthedStudioLibrary();
    })();
    signedInWorkRef.current = work;
    try {
      await work;
    } finally {
      if (signedInWorkRef.current === work) {
        signedInWorkRef.current = null;
      }
    }
  }, []);

  const handleSignedOut = useCallback(() => {
    setStudioLibraryAuthedMode(false);
    setUser(null);
  }, []);

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      setStudioLibraryAuthedMode(false);
      return;
    }

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    let active = true;

    void supabase.auth.getUser().then(({ data }) => {
      if (!active) {
        return;
      }
      const currentUser = data.user ?? null;
      if (currentUser) {
        setStudioLibraryAuthedMode(true);
        void handleSignedIn();
      } else {
        setStudioLibraryAuthedMode(false);
      }
      setUser(currentUser);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      if (nextUser) {
        setStudioLibraryAuthedMode(true);
        queueMicrotask(() => {
          if (!active) {
            return;
          }
          setUser(nextUser);
          void handleSignedIn();
        });
      } else {
        setUser(null);
        handleSignedOut();
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [configured, handleSignedIn, handleSignedOut]);

  const signOut = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      return;
    }
    await supabase.auth.signOut();
    handleSignedOut();
  }, [handleSignedOut]);

  const value = useMemo(
    () => ({
      configured,
      loading,
      user,
      signOut,
    }),
    [configured, loading, user, signOut],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}
