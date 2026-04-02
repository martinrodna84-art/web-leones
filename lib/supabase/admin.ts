import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseSecretEnv } from "@/lib/supabase/env";
import type { Database } from "@/lib/supabase/types";

declare global {
  var __leonesSupabaseAdmin__: SupabaseClient<Database> | undefined;
}

export function getSupabaseAdminClient(): SupabaseClient<Database> {
  if (!globalThis.__leonesSupabaseAdmin__) {
    const { url, secretKey } = getSupabaseSecretEnv();

    globalThis.__leonesSupabaseAdmin__ = createClient<Database>(url, secretKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return globalThis.__leonesSupabaseAdmin__;
}
