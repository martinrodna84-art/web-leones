import type { Metadata } from "next";

import { LegalPage } from "@/components/legal-page";
import { privacyPolicyContent } from "@/lib/legal-content";
import { getSessionMember } from "@/lib/server-session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Politica de privacidad | Los Leones del Trail",
  description: "Politica basica de privacidad y tratamiento de datos del sitio de Los Leones del Trail.",
};

export default async function Page() {
  const member = await getSessionMember();
  return <LegalPage member={member} {...privacyPolicyContent} />;
}
