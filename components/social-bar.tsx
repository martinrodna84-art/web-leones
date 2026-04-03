import Link from "next/link";

import { SocialIcon } from "@/components/social-icon";
import { socialBarLinks } from "@/lib/site-content";

export function SocialBar() {
  return (
    <div className="social-bar">
      <div className="social-message">
        <p className="social-copy">Unete a Los Leones del Trail y transforma tu pasion en un rugido.</p>
        <Link className="social-inline-link" href="/liga-felina/registro">
          <span className="social-inline-label">{"AQU\u00cd"}</span>
        </Link>
      </div>
      <div className="social-links" aria-label="Redes del club">
        {socialBarLinks.map((link) =>
          link.href ? (
            <a key={link.label} href={link.href} target="_blank" rel="noreferrer" aria-label={link.label} title={link.label}>
              <SocialIcon label={link.label} />
            </a>
          ) : (
            <span key={link.label} aria-label={`${link.label} proximamente`} title={`${link.label} proximamente`}>
              <SocialIcon label={link.label} />
            </span>
          ),
        )}
      </div>
    </div>
  );
}
