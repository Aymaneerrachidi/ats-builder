import { createAuthClient } from "better-auth/react";

// The frontend and the Better Auth API are the same deployment, so the
// client should always talk to whatever origin it's actually being served
// from (window.location.origin) rather than a build-time env var. Baking
// NEXT_PUBLIC_APP_URL into the client bundle is fragile — if it's wrong or
// unset when Vercel builds, every deployment silently points at whatever
// value happened to be set at that build, e.g. a leftover "localhost:3000"
// default. The env var is kept only as a non-browser fallback (SSR/tests).
export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL,
});

export const { signIn, signUp, signOut, useSession, updateUser } = authClient;
