import type { Metadata } from "next";

import { HomePage } from "@/components/home-page";
import { getSessionMember } from "@/lib/server-session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Los Leones del Trail | Club Deportivo",
  description:
    "Club Deportivo Los Leones del Trail. Entrenamientos, retos, comunidad, rutas y acceso a la Liga Felina.",
};

export default async function Page() {
  const member = await getSessionMember();
  return <HomePage member={member} />;
}
