function readEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}.`);
  }

  return value;
}

export function getSupabasePublicEnv() {
  return {
    url: readEnv("NEXT_PUBLIC_SUPABASE_URL"),
    publishableKey: readEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
  };
}

export function getSupabaseSecretEnv() {
  return {
    url: readEnv("NEXT_PUBLIC_SUPABASE_URL"),
    secretKey: readEnv("SUPABASE_SECRET_KEY"),
  };
}
