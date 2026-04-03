import { LeagueHeader } from "@/components/league-header";
import { SiteFooter } from "@/components/site-footer";
import { SocialBar } from "@/components/social-bar";
import type { SessionMember } from "@/lib/types";

type LegalSection = {
  title: string;
  body: string[];
};

type LegalPageProps = {
  member: SessionMember | null;
  subtitle: string;
  title: string;
  lead: string;
  sections: LegalSection[];
};

export function LegalPage({ member, subtitle, title, lead, sections }: LegalPageProps) {
  return (
    <>
      <SocialBar />
      <LeagueHeader member={member} subtitle={subtitle} title={title} lead={lead} compact />
      <main className="league-main">
        <section className="legal-section">
          <div className="section-heading">
            <p className="eyebrow dark">{subtitle}</p>
            <h2>{title}</h2>
            <p>{lead}</p>
          </div>

          <div className="legal-grid">
            {sections.map((section) => (
              <article key={section.title} className="legal-card">
                <h3>{section.title}</h3>
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </article>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
