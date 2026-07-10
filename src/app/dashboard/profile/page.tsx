"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateUser, useSession } from "@/lib/auth-client";

function initials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?"
  );
}

export default function ProfilePage() {
  const { data: session, isPending, refetch } = useSession();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (session?.user.name) setName(session.user.name);
  }, [session?.user.name]);

  async function save() {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Name can't be empty.");
      return;
    }
    setSaving(true);
    const { error } = await updateUser({ name: trimmed });
    setSaving(false);
    if (error) {
      toast.error(error.message || "Could not update your profile.");
      return;
    }
    toast.success("Profile updated.");
    refetch();
  }

  if (isPending || !session) {
    return <div className="mx-auto max-w-2xl text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl">Profile</h1>
      <p className="mt-1 text-muted-foreground">Manage your account details.</p>

      <div className="mt-8 flex items-center gap-4">
        <Avatar className="size-16">
          <AvatarFallback className="text-lg">{initials(session.user.name)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{session.user.name}</p>
          <p className="text-sm text-muted-foreground">{session.user.email}</p>
        </div>
      </div>

      <div className="mt-8 max-w-sm space-y-4 rounded-sm border border-border bg-card p-6">
        <div className="space-y-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={session.user.email} disabled />
          <p className="text-xs text-muted-foreground">
            Contact support to change your email address.
          </p>
        </div>
        <Button onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
