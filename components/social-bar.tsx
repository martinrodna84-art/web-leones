import Link from "next/link";

import { socialLinks } from "@/lib/site-content";

export function SocialBar() {
  return (
    <div className="social-bar">
      <p className="social-copy">Unete a Los Leones del Trail y transforma tu pasion en un rugido.</p>
      <div className="social-links" aria-label="Redes del club">
        {socialLinks.map((link) => (
          <a key={link.href} href={link.href} target="_blank" rel="noreferrer" aria-label={link.label} title={link.label}>
            <span className="social-icon">{link.symbol}</span>
          </a>
        ))}
      </div>
      <Link className="social-cta" href="/liga-felina/registro">
        AQUi
      </Link>
    </div>
  );
}
