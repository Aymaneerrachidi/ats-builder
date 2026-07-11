import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { UnauthorizedError } from "@/lib/errors";

export { UnauthorizedError };

/** Resolves the current Better Auth session in a Server Component, Server
 * Action, or Route Handler. Throws UnauthorizedError if there is none. */
export async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new UnauthorizedError();
  }
  return session;
}
