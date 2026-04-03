import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ProfileEditPage } from "@/components/profile-edit-page";
import { getSessionMember } from "@/lib/server-session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Editar Perfil Liga Felina | Los Leones del Trail",
  description: "Edicion de datos de socio, foto de perfil y conexion con Strava.",
};

export default async function Page() {
  const member = await getSessionMember();
  if (!member) {
    redirect("/liga-felina/acceso?next=%2Fliga-felina%2Fperfil%2Feditar");
  }

  return <ProfileEditPage member={member} />;
}
