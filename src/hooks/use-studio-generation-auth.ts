"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { useSupabaseAuth } from "@/components/SupabaseAuthProvider";
import {
  isStudioSignInRequired,
  loginHrefForReturnTo,
} from "@/lib/studio-auth-gate";

export function useStudioGenerationAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, loading } = useSupabaseAuth();

  const signInRequired = isStudioSignInRequired();

  const returnPath =
    pathname +
    (searchParams.toString() ? `?${searchParams.toString()}` : "");

  const redirectToSignIn = useCallback(
    (overrideReturnTo?: string) => {
      router.push(loginHrefForReturnTo(overrideReturnTo ?? returnPath));
    },
    [returnPath, router],
  );

  const ensureSignedInForGeneration = useCallback(
    (overrideReturnTo?: string): boolean => {
      if (!signInRequired) {
        return true;
      }
      if (loading) {
        return false;
      }
      if (user) {
        return true;
      }
      redirectToSignIn(overrideReturnTo);
      return false;
    },
    [loading, redirectToSignIn, signInRequired, user],
  );

  return {
    signInRequired,
    ensureSignedInForGeneration,
    redirectToSignIn,
    authLoading: loading,
    user,
  };
}
