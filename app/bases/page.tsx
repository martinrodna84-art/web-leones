import type { Metadata } from "next";

import { BasesPage } from "@/components/bases-page";
import { getSessionMember } from "@/lib/server-session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bases Liga Felina | Los Leones del Trail",
  description: "Bases, scoring y reglas de validacion de la Liga Felina de Los Leones del Trail.",
};

export default async function Page() {
  const member = await getSessionMember();
  return <BasesPage member={member} />;
}
