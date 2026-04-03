import Image from "next/image";
import Link from "next/link";

import { getDisplayName, resolvePhoto } from "@/lib/members";
import type { Member } from "@/lib/types";

type SessionBadgeProps = {
  member: Member | null;
  guestSubtitle: string;
  memberSubtitle: string;
};

export function SessionBadge({
  member,
  guestSubtitle,
  memberSubtitle,
}: SessionBadgeProps) {
  const avatar = member ? resolvePhoto(member) : "";
  const displayName = member ? getDisplayName(member) : "Invitado";
  const href = member ? "/liga-felina/perfil" : "/liga-felina/acceso";

  return (
    <Link className="header-session" href={href}>
      <div className="header-session-avatar">
        {member ? (
          <Image src={avatar} alt={`Foto de ${displayName}`} width={48} height={48} unoptimized />
        ) : (
          "L"
        )}
      </div>
      <div className="header-session-copy">
        <strong>{displayName}</strong>
        <span>{member ? memberSubtitle : guestSubtitle}</span>
      </div>
    </Link>
  );
}
