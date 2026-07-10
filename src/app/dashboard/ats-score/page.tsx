"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Lightbulb } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { AtsScoreResult } from "@/lib/ai/schemas";
import type { ResumeContent } from "@/lib/schema/resume";

interface ResumeSummary {
  id: string;
  title: string;
}

function scoreColor(score: number): string {
  if (score >= 80) return "text-[oklch(0.6_0.15_150)]";
  if (score >= 60) return "text-primary";
  return "text-destructive";
}

export default function AtsScorePage() {
  const [resumes, setResumes] = useState<ResumeSummary[] | null>(null);
  const [selectedId, setSelectedId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AtsScoreResult | null>(null);

  useEffect(() => {
    fetch("/api/resumes")
      .then((res) => res.json())
      .then((data) => setResumes(data.resumes));
  }, []);

  async function runScore() {
    if (!selectedId) {
      toast.error("Pick a resume first.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const resumeRes = await fetch(`/api/resumes/${selectedId}`);
      const resumeData = await resumeRes.json();
      if (!resumeRes.ok) throw new Error(resumeData.error);

      const content: ResumeContent = resumeData.resume.content;
      const scoreRes = await fetch("/api/ai/ats-score", {
        method: "POST",
        body: JSON.stringify({ content }),
      });
      const scoreData = await scoreRes.json();
      if (!scoreRes.ok) throw new Error(scoreData.error);
      setResult(scoreData.result);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not score this resume.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl">ATS Score</h1>
      <p className="mt-1 text-muted-foreground">
        Audit a resume for action verbs, passive voice, keyword density, and formatting risks.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {resumes === null ? (
          <Skeleton className="h-9 w-64" />
        ) : (
          <Select value={selectedId} onValueChange={(value) => setSelectedId(value ?? "")}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Choose a resume" />
            </SelectTrigger>
            <SelectContent>
              {resumes.map((resume) => (
                <SelectItem key={resume.id} value={resume.id}>
                  {resume.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Button onClick={runScore} disabled={loading || !selectedId}>
          {loading ? "Analyzing…" : "Run ATS Score"}
        </Button>
      </div>

      {result && (
        <div className="mt-10 space-y-8">
          <div className="flex items-center gap-6 rounded-sm border border-border bg-card p-8">
            <span className={`font-display text-6xl ${scoreColor(result.overallScore)}`}>
              {result.overallScore}
            </span>
            <div>
              <p className="font-accent text-xs uppercase tracking-wider text-muted-foreground">
                Overall ATS score
              </p>
              <p className="text-sm text-muted-foreground">Out of 100</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {result.categories.map((category) => (
              <div key={category.name} className="rounded-sm border border-border p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{category.name}</p>
                  <span className={`font-accent text-sm ${scoreColor(category.score)}`}>
                    {category.score}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{category.comment}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <h3 className="flex items-center gap-2 font-display text-lg">
                <CheckCircle2 className="size-4 text-[oklch(0.6_0.15_150)]" />
                Strengths
              </h3>
              <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                {result.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="flex items-center gap-2 font-display text-lg">
                <AlertTriangle className="size-4 text-destructive" />
                Warnings
              </h3>
              <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                {result.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="flex items-center gap-2 font-display text-lg">
                <Lightbulb className="size-4 text-primary" />
                Suggestions
              </h3>
              <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                {result.suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
