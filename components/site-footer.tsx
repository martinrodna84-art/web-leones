import Image from "next/image";
import Link from "next/link";

import { FooterNewsletterForm } from "@/components/footer-newsletter-form";
import { SocialIcon } from "@/components/social-icon";
import {
  footerColumns,
  footerLegalLinks,
  footerPrimaryLinks,
  footerSocialLinks,
} from "@/lib/site-content";

function FooterSocialItem({
  href,
  label,
  small = false,
}: {
  href: string;
  label: string;
  small?: boolean;
}) {
  const className = `footer-social-item ${small ? "is-small" : ""} ${href ? "" : "is-placeholder"}`.trim();
  const icon = <SocialIcon label={label} className={small ? "footer-social-icon is-small" : "footer-social-icon"} />;

  if (!href) {
    return (
      <span className={className} aria-label={`${label} proximamente`} title={`${label} proximamente`}>
        {icon}
      </span>
    );
  }

  return (
    <a className={className} href={href} target="_blank" rel="noreferrer" aria-label={label} title={label}>
      {icon}
    </a>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <section className="footer-follow-strip">
        <div className="footer-section-inner footer-follow-content">
          <h2>¡Síguenos!</h2>
          <div className="footer-social-row" aria-label="Redes sociales del club">
            {footerSocialLinks.map((link) => (
              <FooterSocialItem key={link.label} href={link.href} label={link.label} />
            ))}
          </div>
        </div>
      </section>

      <div className="footer-main-shell">
        <section className="footer-newsletter-strip">
            <div className="footer-section-inner footer-newsletter-grid">
              <div className="footer-newsletter-copy">
                <h3>Únete a nuestro boletín de noticias</h3>
              </div>
              <FooterNewsletterForm />
            </div>
        </section>

        <section className="footer-brand-strip">
          <div className="footer-section-inner footer-brand-grid">
            <div className="footer-brand-mark footer-brand-mark--club">
              <Image
                src="/assets/logos/footer-logo.svg"
                alt="Logo de Los Leones del Trail"
                width={480}
                height={296}
                className="footer-brand-mark-image footer-brand-mark-image--club"
              />
            </div>

            <div className="footer-brand-mark footer-brand-mark--league">
              <Image
                src="/assets/logos/footer-liga-felina.svg"
                alt="Logo de Liga Felina"
                width={360}
                height={140}
                className="footer-brand-mark-image footer-brand-mark-image--league"
              />
            </div>
          </div>
        </section>

        <section className="footer-link-strip">
          <div className="footer-section-inner footer-link-cloud">
            {footerPrimaryLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="footer-columns-strip">
          <div className="footer-section-inner footer-columns-grid">
            {footerColumns.map((column) => (
              <div key={column.title} className="footer-column">
                <h4>{column.title}</h4>
                <div className="footer-column-links">
                  {column.links.map((link) => (
                    <Link key={link.href} href={link.href}>
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="footer-legal-strip">
          <div className="footer-section-inner footer-legal-grid">
            <div className="footer-legal-links">
              {footerLegalLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="footer-social-row is-small" aria-label="Redes sociales secundarias del club">
              {footerSocialLinks.map((link) => (
                <FooterSocialItem key={`${link.label}-small`} href={link.href} label={link.label} small />
              ))}
            </div>
          </div>
        </section>
      </div>

      <section className="footer-bottom-bar">
        <div className="footer-section-inner footer-bottom-content">
          <p className="social-copy footer-bottom-primary">powered by canal3networks.com</p>
          <p className="social-copy footer-bottom-secondary">
                Copyright {"\u00A9"} 2026. Los Leones del Trail. Todos los derechos reservados.
          </p>
        </div>
      </section>
    </footer>
  );
}
