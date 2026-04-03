import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { getSupabasePublicEnv } from "@/lib/supabase/env";
import {
  clearSupabaseSessionSilently,
  isRecoverableSupabaseSessionError,
} from "@/lib/supabase/session";
import type { Database } from "@/lib/supabase/types";

function hasSupabaseAuthCookies(request: NextRequest): boolean {
  return request.cookies
    .getAll()
    .some(({ name }) => name.startsWith("sb-") && name.includes("auth-token"));
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const { url, publishableKey } = getSupabasePublicEnv();

  const supabase = createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));

        response = NextResponse.next({
          request,
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    if (isRecoverableSupabaseSessionError(error)) {
      await clearSupabaseSessionSilently(supabase);
      return response;
    }

    throw error;
  }

  if (!user && hasSupabaseAuthCookies(request)) {
    await clearSupabaseSessionSilently(supabase);
  }

  return response;
}
