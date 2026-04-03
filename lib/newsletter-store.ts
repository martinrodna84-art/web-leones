type NewsletterSubscription = {
  email: string;
  source: string;
  createdAt: string;
};

const newsletterSubscriptions = new Map<string, NewsletterSubscription>();

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function saveNewsletterSubscription(email: string, source = "unknown") {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new Error("Debes indicar un correo electronico valido.");
  }

  const existing = newsletterSubscriptions.get(normalizedEmail);
  if (existing) {
    return {
      created: false,
      subscription: existing,
    };
  }

  const subscription: NewsletterSubscription = {
    email: normalizedEmail,
    source,
    createdAt: new Date().toISOString(),
  };

  newsletterSubscriptions.set(normalizedEmail, subscription);

  return {
    created: true,
    subscription,
  };
}
