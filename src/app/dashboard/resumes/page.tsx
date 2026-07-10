"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Copy, FileStack, MoreVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { ResumeTemplateId } from "@/lib/schema/resume";

interface ResumeSummary {
  id: string;
  title: string;
  template: ResumeTemplateId;
  createdAt: string;
  updatedAt: string;
}

export default function MyResumesPage() {
  const router = useRouter();
  const [resumes, setResumes] = useState<ResumeSummary[] | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [creating, setCreating] = useState(false);

  async function load() {
    const res = await fetch("/api/resumes");
    const data = await res.json();
    setResumes(data.resumes);
  }

  useEffect(() => {
    load();
  }, []);

  async function createResume() {
    setCreating(true);
    try {
      const res = await fetch("/api/resumes", { method: "POST", body: JSON.stringify({}) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/dashboard/builder/${data.resume.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create resume.");
      setCreating(false);
    }
  }

  async function duplicate(id: string) {
    const res = await fetch(`/api/resumes/${id}/duplicate`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error);
      return;
    }
    toast.success("Resume duplicated.");
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this resume? This cannot be undone.")) return;
    const res = await fetch(`/api/resumes/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      toast.error(data.error);
      return;
    }
    toast.success("Resume deleted.");
    setResumes((prev) => prev?.filter((r) => r.id !== id) ?? null);
  }

  async function submitRename(id: string) {
    const title = renameValue.trim();
    setRenamingId(null);
    if (!title) return;
    const res = await fetch(`/api/resumes/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ title }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error);
      return;
    }
    setResumes((prev) => prev?.map((r) => (r.id === id ? { ...r, title } : r)) ?? null);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">My Resumes</h1>
        <Button onClick={createResume} disabled={creating}>
          <Plus className="size-4" />
          New resume
        </Button>
      </div>

      {resumes === null ? (
        <div className="mt-6 space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : resumes.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-sm border border-dashed border-border py-16 text-center">
          <FileStack className="size-8 text-muted-foreground" strokeWidth={1.5} />
          <p className="text-muted-foreground">No resumes yet.</p>
          <Button onClick={createResume} disabled={creating}>
            Create your first resume
          </Button>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-border rounded-sm border border-border">
          {resumes.map((resume) => (
            <li key={resume.id} className="flex items-center justify-between gap-4 px-5 py-4">
              <div className="min-w-0 flex-1">
                {renamingId === resume.id ? (
                  <Input
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={() => submitRename(resume.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") submitRename(resume.id);
                      if (e.key === "Escape") setRenamingId(null);
                    }}
                    className="h-8 max-w-xs"
                  />
                ) : (
                  <Link
                    href={`/dashboard/builder/${resume.id}`}
                    className="truncate font-medium hover:underline"
                  >
                    {resume.title}
                  </Link>
                )}
                <p className="font-accent mt-0.5 text-xs uppercase tracking-wider text-muted-foreground">
                  {resume.template} · updated {new Date(resume.updatedAt).toLocaleDateString()}
                </p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<Button variant="ghost" size="icon" aria-label="Resume actions" />}
                >
                  <MoreVertical className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      setRenamingId(resume.id);
                      setRenameValue(resume.title);
                    }}
                  >
                    <Pencil className="size-4" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => duplicate(resume.id)}>
                    <Copy className="size-4" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem variant="destructive" onClick={() => remove(resume.id)}>
                    <Trash2 className="size-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
