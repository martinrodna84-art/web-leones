import type { Metadata } from "next";

import { AccessPage } from "@/components/access-page";
import { getSessionMember } from "@/lib/server-session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Acceso Liga Felina | Los Leones del Trail",
  description: "Inicio de sesion y recuperacion de contrasena para socios de la Liga Felina.",
};

export default async function Page() {
  const member = await getSessionMember();
  return <AccessPage member={member} />;
}
