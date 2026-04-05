import { LeagueExperience } from "@/components/league/league-experience";
import { LeagueHeader } from "@/components/league-header";
import { SiteFooter } from "@/components/site-footer";
import { SocialBar } from "@/components/social-bar";
import type { LeagueSnapshot } from "@/lib/types";

export function LeaguePage({ snapshot }: { snapshot: LeagueSnapshot }) {
  return (
    <>
      <SocialBar />
      <LeagueHeader
        member={snapshot.activeMember}
        subtitle="Liga Felina 2026"
        title="LA CLASIFICACION DONDE CADA SALIDA DEJA HUELLA."
        titleLines={["LA CLASIFICACION", "DONDE CADA SALIDA", "DEJA HUELLA."]}
        lead="Clasificacion anual, mensual y semanal en una sola tabla, alimentada desde Strava y enriquecida con DevoraCarreras."
        hideSidecard
        landingAligned
        poweredByStrava
      />
      <LeagueExperience snapshot={snapshot} />
      <SiteFooter />
    </>
  );
}
