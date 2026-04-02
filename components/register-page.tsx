import { LeagueHeader } from "@/components/league-header";
import { RegisterExperience } from "@/components/league/register-experience";
import { SiteFooter } from "@/components/site-footer";
import { SocialBar } from "@/components/social-bar";
import type { LeagueSnapshot } from "@/lib/types";

export function RegisterPage({ snapshot }: { snapshot: LeagueSnapshot }) {
  return (
    <>
      <SocialBar />
      <LeagueHeader
        member={snapshot.activeMember}
        subtitle="Registro de socios"
        title="Registro e inicio de sesion"
        lead="Esta version deja listo el flujo de socio para luego conectarlo con Supabase Auth y Strava sin depender del navegador como fuente principal de datos."
        compact
      />
      <RegisterExperience snapshot={snapshot} />
      <SiteFooter />
    </>
  );
}
