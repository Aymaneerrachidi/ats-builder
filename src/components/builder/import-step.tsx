"use client";

import { useState } from "react";
import { FileText, Link2, PenLine, Sparkles, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ResumeContent } from "@/lib/schema/resume";
import { isLikelyLinkedInUrl, LINKEDIN_URL_NOTICE } from "@/lib/validation/linkedin";

type ImportMethod = "linkedin_url" | "linkedin_pdf" | "resume_pdf" | "resume_docx" | "paste" | "manual";

const METHODS: { id: ImportMethod; label: string; description: string; icon: typeof Upload }[] = [
  {
    id: "linkedin_url",
    label: "LinkedIn URL",
    description: "Paste a profile link",
    icon: Link2,
  },
  {
    id: "linkedin_pdf",
    label: "LinkedIn PDF",
    description: "Upload your LinkedIn export",
    icon: FileText,
  },
  {
    id: "resume_pdf",
    label: "Resume PDF",
    description: "Upload an existing resume",
    icon: Upload,
  },
  {
    id: "resume_docx",
    label: "Resume DOCX",
    description: "Upload a Word document",
    icon: Upload,
  },
  {
    id: "paste",
    label: "Paste text",
    description: "Paste raw profile content",
    icon: PenLine,
  },
  {
    id: "manual",
    label: "Manual entry",
    description: "Start from a blank resume",
    icon: Sparkles,
  },
];

interface ImportStepProps {
  onExtracted: (content: ResumeContent) => void;
  onManual: () => void;
}

export function ImportStep({ onExtracted, onManual }: ImportStepProps) {
  const [method, setMethod] = useState<ImportMethod | null>(null);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [pastedText, setPastedText] = useState("");
  const [busy, setBusy] = useState(false);

  async function extractFromText(text: string) {
    setBusy(true);
    try {
      const res = await fetch("/api/ai/extract", {
        method: "POST",
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onExtracted(data.content);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not extract resume data.");
    } finally {
      setBusy(false);
    }
  }

  async function handleFile(file: File) {
    setBusy(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error);
      await extractFromText(uploadData.text);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not read this file.");
      setBusy(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl">Import your background</h1>
      <p className="mt-1 text-muted-foreground">
        Choose how you&apos;d like to start. You&apos;ll be able to edit every field afterward.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {METHODS.map((m) => (
          <button
            key={m.id}
            onClick={() => setMethod(m.id)}
            className={`rounded-sm border p-4 text-left transition-colors ${
              method === m.id
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/40"
            }`}
          >
            <m.icon className="size-5 text-primary" strokeWidth={1.75} />
            <p className="mt-3 font-medium">{m.label}</p>
            <p className="text-sm text-muted-foreground">{m.description}</p>
          </button>
        ))}
      </div>

      {method === "linkedin_url" && (
        <div className="mt-6 max-w-lg space-y-3 rounded-sm border border-border bg-card p-5">
          <Input
            placeholder="https://www.linkedin.com/in/your-name"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
          />
          <Button
            onClick={() => {
              if (isLikelyLinkedInUrl(linkedinUrl) || linkedinUrl.includes("linkedin.com")) {
                toast.info(LINKEDIN_URL_NOTICE, { duration: 10000 });
              } else {
                toast.error("That doesn't look like a LinkedIn profile URL.");
              }
            }}
          >
            Continue
          </Button>
        </div>
      )}

      {(method === "linkedin_pdf" || method === "resume_pdf" || method === "resume_docx") && (
        <div className="mt-6 max-w-lg space-y-3 rounded-sm border border-dashed border-border bg-card p-8 text-center">
          <Upload className="mx-auto size-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {method === "resume_docx" ? "Upload a .docx file" : "Upload a .pdf file"} (max 10 MB)
          </p>
          <Input
            type="file"
            accept={method === "resume_docx" ? ".docx" : ".pdf"}
            disabled={busy}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          {busy && <p className="text-sm text-primary">Reading and extracting…</p>}
        </div>
      )}

      {method === "paste" && (
        <div className="mt-6 max-w-2xl space-y-3 rounded-sm border border-border bg-card p-5">
          <Textarea
            className="min-h-48"
            placeholder="Paste your resume or profile text here…"
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
          />
          <Button disabled={busy || !pastedText.trim()} onClick={() => extractFromText(pastedText)}>
            {busy ? "Extracting…" : "Extract with AI"}
          </Button>
        </div>
      )}

      {method === "manual" && (
        <div className="mt-6 max-w-lg rounded-sm border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Start with a blank resume and fill in every field yourself.
          </p>
          <Button className="mt-4" onClick={onManual}>
            Start manually
          </Button>
        </div>
      )}
    </div>
  );
}
