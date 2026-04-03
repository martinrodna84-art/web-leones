import type { Metadata } from "next";

import { LegalPage } from "@/components/legal-page";
import { cookiesPolicyContent } from "@/lib/legal-content";
import { getSessionMember } from "@/lib/server-session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Politica de cookies | Los Leones del Trail",
  description: "Politica de cookies y almacenamiento tecnico del sitio de Los Leones del Trail.",
};

export default async function Page() {
  const member = await getSessionMember();
  return <LegalPage member={member} {...cookiesPolicyContent} />;
}
