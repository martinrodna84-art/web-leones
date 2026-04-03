import { MemberZoneExperience } from "@/components/league/member-zone-experience";
import { LeagueHeader } from "@/components/league-header";
import { SiteFooter } from "@/components/site-footer";
import { SocialBar } from "@/components/social-bar";
import type { SessionMember } from "@/lib/types";

export function ProfilePage({ member }: { member: SessionMember }) {
  return (
    <>
      <SocialBar />
      <LeagueHeader
        member={member}
        subtitle="Zona de socio"
        title="Panel personal de control"
        lead="Consulta tu estado dentro de la Liga Felina, revisa tus metricas del ano y entra desde aqui a la edicion completa de tus datos."
        compact
      />
      <MemberZoneExperience member={member} />
      <SiteFooter />
    </>
  );
}
