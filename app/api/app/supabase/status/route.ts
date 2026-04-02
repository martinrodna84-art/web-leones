import { failure, ok } from "@/lib/api";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const admin = getSupabaseAdminClient();

    const [
      { data: claimsData, error: claimsError },
      { data: usersData, error: usersError },
      { data: leagueProfiles, error: leagueProfilesError },
    ] = await Promise.all([
      supabase.auth.getClaims(),
      admin.auth.admin.listUsers({
        page: 1,
        perPage: 1,
      }),
      supabase.rpc("list_member_profiles_for_league"),
    ]);

    if (claimsError) {
      throw claimsError;
    }

    if (usersError) {
      throw usersError;
    }

    if (leagueProfilesError) {
      throw leagueProfilesError;
    }

    return ok({
      serverClientReady: true,
      adminClientReady: true,
      leagueRpcReady: true,
      hasSessionClaims: Boolean(claimsData?.claims),
      usersSampleCount: usersData.users.length,
      profilesSampleCount: leagueProfiles?.length ?? 0,
    });
  } catch (error) {
    return failure(error, 500);
  }
}
