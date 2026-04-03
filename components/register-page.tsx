import { LeagueHeader } from "@/components/league-header";
import { RegisterSignupExperience } from "@/components/league/register-signup-experience";
import { SiteFooter } from "@/components/site-footer";
import { SocialBar } from "@/components/social-bar";
import type { SessionMember } from "@/lib/types";

export function RegisterPage({ member }: { member: SessionMember | null }) {
  return (
    <>
      <SocialBar />
      <LeagueHeader
        member={member}
        subtitle="Registro de socios"
        title="Crea tu perfil dentro de la manada"
        lead="El alta de socios queda ahora separada del acceso y de la edicion del perfil para que registrarse sea rapido, claro y centrado solo en crear la cuenta."
        compact
      />
      <RegisterSignupExperience />
      <SiteFooter />
    </>
  );
}
