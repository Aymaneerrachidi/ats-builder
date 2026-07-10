"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { ResumeTemplateId } from "@/lib/schema/resume";

const TEMPLATES: {
  id: ResumeTemplateId;
  name: string;
  description: string;
  font: string;
  accent: string;
}[] = [
  {
    id: "classic",
    name: "Classic",
    description: "Small-caps section rules, serif body — timeless and dependable.",
    font: "font-display",
    accent: "border-foreground",
  },
  {
    id: "modern",
    name: "Modern",
    description: "Sans-serif with a confident color rule under each section.",
    font: "font-sans font-semibold",
    accent: "border-primary",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "No rules, no color — just dense, efficient information.",
    font: "font-sans",
    accent: "border-transparent",
  },
  {
    id: "tech",
    name: "Tech",
    description: "Monospace skill tags, built for engineering roles.",
    font: "font-sans font-semibold",
    accent: "border-[oklch(0.55_0.15_150)]",
  },
  {
    id: "academic",
    name: "Academic",
    description: "Education-first ordering for research and academic CVs.",
    font: "font-display",
    accent: "border-foreground",
  },
  {
    id: "executive",
    name: "Executive",
    description: "Centered header, generous whitespace, refined double rule.",
    font: "font-display italic",
    accent: "border-foreground",
  },
];

export default function TemplatesPage() {
  const router = useRouter();
  const [creatingId, setCreatingId] = useState<ResumeTemplateId | null>(null);

  async function selectTemplate(template: ResumeTemplateId) {
    setCreatingId(template);
    try {
      const res = await fetch("/api/resumes", {
        method: "POST",
        body: JSON.stringify({ template }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/dashboard/builder/${data.resume.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create resume.");
      setCreatingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-3xl">Templates</h1>
      <p className="mt-1 text-muted-foreground">
        Single-column, ATS-safe layouts. Pick one to start a new resume.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {TEMPLATES.map((template) => (
          <div
            key={template.id}
            className="flex flex-col rounded-sm border border-border bg-card p-6"
          >
            <div className={`border-b-2 pb-2 ${template.accent}`}>
              <div className={`h-3 w-2/3 rounded-sm bg-foreground/80 ${template.font}`} />
            </div>
            <div className="mt-3 space-y-1.5">
              <div className="h-1.5 w-full rounded-sm bg-muted-foreground/25" />
              <div className="h-1.5 w-5/6 rounded-sm bg-muted-foreground/25" />
              <div className="h-1.5 w-4/6 rounded-sm bg-muted-foreground/25" />
            </div>
            <h3 className="mt-5 font-display text-lg">{template.name}</h3>
            <p className="mt-1 flex-1 text-sm text-muted-foreground">{template.description}</p>
            <Button
              className="mt-5"
              variant="outline"
              onClick={() => selectTemplate(template.id)}
              disabled={creatingId !== null}
            >
              {creatingId === template.id ? "Creating…" : "Use this template"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
