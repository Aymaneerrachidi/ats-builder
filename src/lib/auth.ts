import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { prisma } from "@/lib/prisma";

/** Strips accidental trailing slashes/whitespace and returns just the
 * origin (protocol + host) — Better Auth's origin check does an exact
 * string match against this, so a stray trailing slash or newline pasted
 * into an env var value is enough to make every sign-in fail as
 * "Invalid origin". */
function toOrigin(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try {
    return new URL(url.trim()).origin;
  } catch {
    return undefined;
  }
}

// Vercel provides these automatically per-deployment (no manual setup
// needed, as long as "Automatically expose System Environment Variables"
// is enabled on the project) — included so preview deployments and the
// production domain both work even if BETTER_AUTH_URL only covers one.
const vercelOrigins = [
  process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`,
  process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`,
];

const trustedOrigins = [
  toOrigin(process.env.BETTER_AUTH_URL),
  toOrigin(process.env.NEXT_PUBLIC_APP_URL),
  ...vercelOrigins,
].filter((origin): origin is string => Boolean(origin));

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: toOrigin(process.env.BETTER_AUTH_URL),
  trustedOrigins,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // refresh once a day
  },
});

export type Session = typeof auth.$Infer.Session;
