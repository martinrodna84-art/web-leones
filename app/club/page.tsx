import type { Metadata } from "next";

import { ClubPage } from "@/components/club-page";
import { getSessionMember } from "@/lib/server-session";

export const metadata: Metadata = {
  title: "El Club | Los Leones del Trail",
  description:
    "Informacion, altas, tablon y entrenamientos de Los Leones del Trail en una sola pagina.",
};

export default async function Page() {
  const member = await getSessionMember();
  return <ClubPage member={member} />;
}
