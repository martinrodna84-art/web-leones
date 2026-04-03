import { MemberAccessExperience } from "@/components/league/member-access-experience";
import { LeagueHeader } from "@/components/league-header";
import { SiteFooter } from "@/components/site-footer";
import { SocialBar } from "@/components/social-bar";
import type { SessionMember } from "@/lib/types";

export function AccessPage({ member }: { member: SessionMember | null }) {
  return (
    <>
      <SocialBar />
      <LeagueHeader
        member={member}
        subtitle="Acceso de socios"
        title="Entra en tu zona de socio"
        lead="Inicio de sesion y recuperacion de contrasena en una pantalla separada para que el acceso sea directo y el perfil tenga su propio espacio de gestion."
        compact
      />
      <MemberAccessExperience member={member} />
      <SiteFooter />
    </>
  );
}
