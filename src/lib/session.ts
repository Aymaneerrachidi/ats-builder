import { headers } from "next/headers";

import { auth } from "@/lib/auth";

export class UnauthorizedError extends Error {
  constructor() {
    super("You must be signed in to do this.");
    this.name = "UnauthorizedError";
  }
}

/** Resolves the current Better Auth session in a Server Component, Server
 * Action, or Route Handler. Throws UnauthorizedError if there is none. */
export async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new UnauthorizedError();
  }
  return session;
}
