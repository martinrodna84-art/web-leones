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
        title="LA CLASIFICACIÓN DONDE CADA SALIDA DEJA HUELLA."
        titleLines={["LA CLASIFICACIÓN", "DONDE CADA SALIDA", "DEJA HUELLA."]}
        lead="Registro de socios, acceso personal y tablas de clasificacion por puntos, kilometros y desnivel. La pagina queda preparada para conectar cada perfil con Strava y alimentar la liga de forma mas automatica."
        hideSidecard
        landingAligned
      />
      <LeagueExperience snapshot={snapshot} />
      <SiteFooter />
    </>
  );
}
