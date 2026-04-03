import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ProfilePage } from "@/components/profile-page";
import { getSessionMember } from "@/lib/server-session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mi Perfil Liga Felina | Los Leones del Trail",
  description: "Zona de socio con resumen personal, metricas y acceso a la edicion del perfil.",
};

export default async function Page() {
  const member = await getSessionMember();
  if (!member) {
    redirect("/liga-felina/acceso?next=%2Fliga-felina%2Fperfil");
  }

  return <ProfilePage member={member} />;
}
