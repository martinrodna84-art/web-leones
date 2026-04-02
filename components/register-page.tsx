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
        lead="Registro, acceso y gestion de perfil con Supabase Auth, cookies SSR y una base de datos preparada para conectar Strava sin depender del navegador como fuente principal de verdad."
        compact
      />
      <RegisterExperience snapshot={snapshot} />
      <SiteFooter />
    </>
  );
}
