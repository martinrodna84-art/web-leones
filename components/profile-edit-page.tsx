import { ProfileExperience } from "@/components/league/profile-experience";
import { LeagueHeader } from "@/components/league-header";
import { SiteFooter } from "@/components/site-footer";
import { SocialBar } from "@/components/social-bar";
import type { SessionMember } from "@/lib/types";

export function ProfileEditPage({ member }: { member: SessionMember }) {
  return (
    <>
      <SocialBar />
      <LeagueHeader
        member={member}
        subtitle="Editar perfil"
        title="Tus datos, tu foto y tu Strava"
        lead="Desde aqui puedes editar tus datos de socio, elegir la fuente de tu foto de perfil y gestionar la conexion con Strava."
        compact
      />
      <ProfileExperience member={member} />
      <SiteFooter />
    </>
  );
}
