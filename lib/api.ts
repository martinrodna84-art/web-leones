import { NextResponse } from "next/server";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data }, init);
}

export function failure(error: unknown, status = 400) {
  const message = error instanceof Error ? error.message : "Ha ocurrido un error.";
  return NextResponse.json({ error: message }, { status });
}
