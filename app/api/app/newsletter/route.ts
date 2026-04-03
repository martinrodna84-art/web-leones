import { saveNewsletterSubscription } from "@/lib/newsletter-store";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as
      | { email?: string; source?: string }
      | null;

    const email = body?.email?.trim() ?? "";
    const source = body?.source?.trim() || "site-footer";

    const result = saveNewsletterSubscription(email, source);

    return Response.json(
      {
        ok: true,
        created: result.created,
        message: result.created
          ? "Alta registrada. Te avisaremos de las proximas novedades."
          : "Ese correo ya estaba dentro del boletin del club.",
      },
      { status: result.created ? 201 : 200 },
    );
  } catch (error) {
    return Response.json(
      {
        ok: false,
        message:
          error instanceof Error ? error.message : "No hemos podido registrar el correo.",
      },
      { status: 400 },
    );
  }
}
