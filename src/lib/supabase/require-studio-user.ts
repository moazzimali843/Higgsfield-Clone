import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type StudioUserOk = {
  ok: true;
  required: boolean;
};

type StudioUserDenied = {
  ok: false;
  response: NextResponse;
};

/** Allows unauthenticated access only when Supabase is not configured (local demo). */
export async function requireStudioUserForGeneration(): Promise<
  StudioUserOk | StudioUserDenied
> {
  if (!isSupabaseConfigured()) {
    return { ok: true, required: false };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Supabase is not configured." },
        { status: 503 },
      ),
    };
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Sign in required to generate." },
        { status: 401 },
      ),
    };
  }

  return { ok: true, required: true };
}
