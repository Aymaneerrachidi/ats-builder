"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { EnhancePanel } from "@/components/builder/enhance-panel";
import { ImportStep } from "@/components/builder/import-step";
import { LivePreview } from "@/components/builder/live-preview";
import { ResumeForm } from "@/components/builder/resume-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  emptyResumeContent,
  resumeContentSchema,
  type ResumeContent,
  type ResumeTemplateId,
} from "@/lib/schema/resume";

type Step = "import" | "edit" | "enhance";

interface BuilderClientProps {
  resumeId: string;
  initialTitle: string;
  initialTemplate: ResumeTemplateId;
  initialContent: ResumeContent;
  initialOnePage: boolean;
}

function hasImportedContent(content: ResumeContent): boolean {
  return Boolean(content.name || content.summary || content.experience.length > 0);
}

export function BuilderClient({
  resumeId,
  initialTitle,
  initialTemplate,
  initialContent,
  initialOnePage,
}: BuilderClientProps) {
  const [step, setStep] = useState<Step>(hasImportedContent(initialContent) ? "edit" : "import");
  const [title, setTitle] = useState(initialTitle);
  const [template, setTemplate] = useState<ResumeTemplateId>(initialTemplate);
  const [onePage, setOnePage] = useState(initialOnePage);
  const [previewVersion, setPreviewVersion] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ResumeContent>({
    resolver: zodResolver(resumeContentSchema),
    defaultValues: initialContent,
  });

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextAutosave = useRef(true);

  async function persist(
    content: ResumeContent,
    templateOverride?: ResumeTemplateId,
    onePageOverride?: boolean
  ) {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/resumes/${resumeId}`, {
        method: "PATCH",
        body: JSON.stringify({
          content,
          template: templateOverride ?? template,
          onePage: onePageOverride ?? onePage,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      setPreviewVersion((v) => v + 1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save changes.");
    } finally {
      setIsSaving(false);
    }
  }

  // Debounced autosave — regenerates LaTeX + recompiles + refreshes the
  // embedded preview automatically as the user edits, no page refresh.
  useEffect(() => {
    const subscription = form.watch((values) => {
      if (skipNextAutosave.current) {
        skipNextAutosave.current = false;
        return;
      }
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        persist(values as ResumeContent);
      }, 900);
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch]);

  async function handleExtracted(content: ResumeContent) {
    form.reset(content);
    skipNextAutosave.current = true;
    setStep("edit");
    await persist(content);
  }

  async function handleManual() {
    setStep("edit");
    await persist(emptyResumeContent);
  }

  async function handleTitleBlur() {
    if (!title.trim() || title === initialTitle) return;
    await fetch(`/api/resumes/${resumeId}`, {
      method: "PATCH",
      body: JSON.stringify({ title: title.trim() }),
    });
  }

  async function handleTemplateChange(next: ResumeTemplateId) {
    setTemplate(next);
    await persist(form.getValues(), next);
  }

  async function handleOnePageChange(next: boolean) {
    setOnePage(next);
    await persist(form.getValues(), undefined, next);
  }

  if (step === "import") {
    return (
      <div className="mx-auto max-w-4xl">
        <ImportStep onExtracted={handleExtracted} onManual={handleManual} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          className="h-9 max-w-xs font-display text-lg"
        />
        <div className="flex items-center gap-2">
          {step === "edit" ? (
            <Button onClick={() => setStep("enhance")}>
              AI Enhancement
              <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setStep("edit")}>
              <ArrowLeft className="size-4" />
              Back to editing
            </Button>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_420px]">
        <div className="space-y-6">
          {step === "enhance" && <EnhancePanel form={form} />}
          <ResumeForm form={form} />
        </div>

        <div className="lg:sticky lg:top-20 lg:h-[calc(100svh-6rem)]">
          <LivePreview
            resumeId={resumeId}
            template={template}
            onTemplateChange={handleTemplateChange}
            onePage={onePage}
            onOnePageChange={handleOnePageChange}
            previewVersion={previewVersion}
            isSaving={isSaving}
          />
        </div>
      </div>
    </div>
  );
}
