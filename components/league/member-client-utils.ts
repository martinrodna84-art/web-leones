"use client";

export async function requestJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  const payload = (await response.json()) as { data?: T; error?: string };

  if (!response.ok) {
    throw new Error(payload.error || "La operacion no se pudo completar.");
  }

  if (payload.data === undefined) {
    throw new Error("La respuesta del servidor no es valida.");
  }

  return payload.data;
}

export async function fileToDataUrl(file: File | null): Promise<string | undefined> {
  if (!file) {
    return undefined;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("No hemos podido leer la imagen seleccionada."));
    reader.readAsDataURL(file);
  });
}

export function formatLastSync(value: string | null | undefined): string {
  if (!value) {
    return "Pendiente de sincronizar";
  }

  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function normalizeInternalHref(value: string | null | undefined, fallback: string): string {
  if (!value || !value.startsWith("/")) {
    return fallback;
  }

  return value;
}
