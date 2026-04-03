import type { Metadata } from "next";

import { ContactPage } from "@/components/contact-page";
import { getSessionMember } from "@/lib/server-session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contacto | Los Leones del Trail",
  description:
    "Pagina de contacto del Club Deportivo Los Leones del Trail para informacion general, altas, federarse y colaboraciones.",
};

export default async function Page() {
  const member = await getSessionMember();
  return <ContactPage member={member} />;
}
