"use client";

import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { EnhancementAction } from "@/lib/ai/schemas";
import type { ResumeContent } from "@/lib/schema/resume";

const ACTIONS: { id: EnhancementAction; label: string }[] = [
  { id: "improve_summary", label: "Improve Summary" },
  { id: "improve_experience", label: "Improve Experience" },
  { id: "rewrite_bullets", label: "Rewrite Bullet Points" },
  { id: "make_ats_friendly", label: "Make ATS Friendly" },
  { id: "add_metrics", label: "Add Metrics" },
  { id: "shorten", label: "Shorten" },
  { id: "expand", label: "Expand" },
  { id: "professional_tone", label: "Professional Tone" },
  { id: "technical_tone", label: "Technical Tone" },
  { id: "leadership_tone", label: "Leadership Tone" },
];

interface EnhancePanelProps {
  form: UseFormReturn<ResumeContent>;
}

export function EnhancePanel({ form }: EnhancePanelProps) {
  const [pending, setPending] = useState<EnhancementAction | null>(null);

  async function applyEnhancement(action: EnhancementAction) {
    setPending(action);
    try {
      const res = await fetch("/api/ai/enhance", {
        method: "POST",
        body: JSON.stringify({ content: form.getValues(), action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      form.reset(data.content);
      toast.success("Applied — review the changes below.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Enhancement failed.");
    } finally {
      setPending(null);
    }
  }

  return (
    <section className="rounded-sm border border-border bg-card p-6">
      <h2 className="font-display text-lg">AI enhancement</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Applies to the resume as a whole. Everything stays editable afterward.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {ACTIONS.map((action) => (
          <Button
            key={action.id}
            type="button"
            variant="outline"
            size="sm"
            disabled={pending !== null}
            onClick={() => applyEnhancement(action.id)}
          >
            {pending === action.id ? "Working…" : action.label}
          </Button>
        ))}
      </div>
    </section>
  );
}
