"use client";

import { useState, useTransition, type FormEvent } from "react";

type NewsletterState = {
  tone: "idle" | "success" | "error";
  message: string;
};

const INITIAL_STATE: NewsletterState = {
  tone: "idle",
  message: "Prometemos solo avisos utiles: club, rutas, retos y aperturas de inscripcion.",
};

export function FooterNewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<NewsletterState>(INITIAL_STATE);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      try {
        const response = await fetch("/api/app/newsletter", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            source: "site-footer",
          }),
        });

        const payload = (await response.json().catch(() => null)) as
          | { message?: string }
          | null;

        if (!response.ok) {
          setState({
            tone: "error",
            message: payload?.message || "No hemos podido registrar ese correo todavia.",
          });
          return;
        }

        setState({
          tone: "success",
          message: payload?.message || "Perfecto. Te avisaremos cuando haya novedades de la manada.",
        });
        setEmail("");
      } catch {
        setState({
          tone: "error",
          message: "Ahora mismo no hemos podido guardar tu solicitud. Prueba otra vez en un momento.",
        });
      }
    });
  }

  return (
    <form className="footer-newsletter-form" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor="footer-newsletter-email">
        Correo electronico
      </label>
      <input
        id="footer-newsletter-email"
        name="email"
        type="email"
        autoComplete="email"
        required
        placeholder="Correo electronico"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <button type="submit" disabled={isPending}>
        {isPending ? "Enviando" : "Enviar"}
      </button>
      <p className={`footer-newsletter-note is-${state.tone}`}>{state.message}</p>
    </form>
  );
}
