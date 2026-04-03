import { LeagueHeader } from "@/components/league-header";
import { SiteFooter } from "@/components/site-footer";
import { SocialBar } from "@/components/social-bar";
import type { SessionMember } from "@/lib/types";

type ContactPageProps = {
  member: SessionMember | null;
};

export function ContactPage({ member }: ContactPageProps) {
  return (
    <>
      <SocialBar />
      <LeagueHeader
        member={member}
        subtitle="Contacto"
        title="Habla con Los Leones del Trail"
        lead="Hemos sacado el formulario de la landing para darle su propio espacio y dejar un acceso mas claro para consultas sobre club, licencias, colaboraciones o altas."
        compact
      />
      <main className="league-main">
        <section className="legal-section">
          <div className="contact-section">
            <div className="contact-copy">
              <p className="eyebrow dark">Contacto directo</p>
              <h2>Cuentanos que necesitas y preparamos el siguiente paso contigo.</h2>
              <p>
                Esta pagina concentra el contacto publico del club para que la portada quede
                mas limpia y la consulta tenga su propio espacio.
              </p>
              <p>
                Puedes usar este formulario para pedir informacion general, resolver dudas
                sobre altas, federarse con el club o plantear colaboraciones.
              </p>
            </div>

            <article className="legal-card">
              <h3>Formulario de contacto</h3>
              <form className="contact-form">
                <label>
                  Nombre
                  <input type="text" placeholder="Tu nombre" />
                </label>
                <label>
                  Correo electronico
                  <input type="email" placeholder="tu@email.com" />
                </label>
                <label>
                  Motivo
                  <select defaultValue="Quiero mas informacion">
                    <option>Quiero mas informacion</option>
                    <option>Quiero unirme al club</option>
                    <option>Quiero federarme</option>
                    <option>Colaboracion o patrocinio</option>
                  </select>
                </label>
                <label>
                  Mensaje
                  <textarea
                    rows={5}
                    placeholder="Cuentanos que te interesa y te responderemos lo antes posible"
                  />
                </label>
                <button className="button button-primary" type="button" disabled>
                  Enviar consulta
                </button>
                <p className="form-note">
                  El formulario publico ya esta separado en su propia pagina y listo para
                  conectarlo al backend definitivo del club.
                </p>
              </form>
            </article>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
