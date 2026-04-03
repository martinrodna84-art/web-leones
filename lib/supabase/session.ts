const RECOVERABLE_SESSION_ERROR_FRAGMENTS = [
  "Auth session missing",
  "Invalid Refresh Token",
  "Refresh Token Not Found",
  "User from sub claim in JWT does not exist",
  "Session from session_id claim in JWT does not exist",
  "JWT expired",
];

type SupabaseLikeClient = {
  auth: {
    signOut: () => Promise<unknown>;
  };
};

export function isRecoverableSupabaseSessionError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  if (error.name === "AuthSessionMissingError") {
    return true;
  }

  return RECOVERABLE_SESSION_ERROR_FRAGMENTS.some((fragment) =>
    error.message.includes(fragment),
  );
}

export async function clearSupabaseSessionSilently(
  supabase: SupabaseLikeClient,
): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch {
    // Session cleanup is best-effort; auth errors should not take down the request.
  }
}
