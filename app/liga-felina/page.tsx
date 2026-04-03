import type { Metadata } from "next";

import { LeaguePage } from "@/components/league-page";
import { getLeagueSnapshotForRequest } from "@/lib/server-session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Liga Felina | Los Leones del Trail",
  description:
    "Liga Felina de Los Leones del Trail. Ranking general, DevoraKm, Devora+ y DevoraCarreras con validacion Strava.",
};

export default async function Page() {
  const snapshot = await getLeagueSnapshotForRequest();
  return <LeaguePage snapshot={snapshot} />;
}
