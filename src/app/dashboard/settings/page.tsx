"use client";

import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { signOut, useSession } from "@/lib/auth-client";

const THEME_OPTIONS = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
] as const;

export default function SettingsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  async function handleSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-display text-3xl">Settings</h1>
        <p className="mt-1 text-muted-foreground">Preferences for this account.</p>
      </div>

      <section className="rounded-sm border border-border bg-card p-6">
        <h2 className="font-display text-lg">Appearance</h2>
        <p className="mt-1 text-sm text-muted-foreground">Choose how ATS Resume AI looks.</p>
        <div className="mt-4 flex gap-2">
          {THEME_OPTIONS.map((option) => (
            <Button
              key={option.value}
              variant={mounted && theme === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => setTheme(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </section>

      <section className="rounded-sm border border-border bg-card p-6">
        <h2 className="font-display text-lg">Account</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Signed in as <span className="text-foreground">{session?.user.email}</span>
        </p>
        <Button variant="outline" className="mt-4" onClick={handleSignOut}>
          Sign out
        </Button>
      </section>
    </div>
  );
}
