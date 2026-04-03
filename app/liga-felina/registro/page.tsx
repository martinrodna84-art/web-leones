import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { RegisterPage } from "@/components/register-page";
import { getSessionMember } from "@/lib/server-session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Registro Liga Felina | Los Leones del Trail",
  description: "Registro de nuevos socios para la Liga Felina.",
};

export default async function Page() {
  const member = await getSessionMember();

  if (member) {
    redirect("/liga-felina/perfil");
  }

  return <RegisterPage member={member} />;
}
