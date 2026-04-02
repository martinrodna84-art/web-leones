import type { Metadata } from "next";

import { RegisterPage } from "@/components/register-page";
import { getLeagueSnapshotForRequest } from "@/lib/server-session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Registro Liga Felina | Los Leones del Trail",
  description: "Registro, acceso y gestion de perfiles de socios para la Liga Felina.",
};

export default async function Page() {
  const snapshot = await getLeagueSnapshotForRequest();
  return <RegisterPage snapshot={snapshot} />;
}
