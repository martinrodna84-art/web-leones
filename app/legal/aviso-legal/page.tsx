import type { Metadata } from "next";

import { LegalPage } from "@/components/legal-page";
import { avisoLegalContent } from "@/lib/legal-content";
import { getSessionMember } from "@/lib/server-session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Aviso legal | Los Leones del Trail",
  description: "Aviso legal y condiciones generales de uso del sitio de Los Leones del Trail.",
};

export default async function Page() {
  const member = await getSessionMember();
  return <LegalPage member={member} {...avisoLegalContent} />;
}
