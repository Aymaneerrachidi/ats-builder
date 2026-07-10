"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import type { JobTailoringResult } from "@/lib/ai/schemas";
import type { ResumeContent } from "@/lib/schema/resume";

interface ResumeSummary {
  id: string;
  title: string;
}

export default function JobTailoringPage() {
  const [resumes, setResumes] = useState<ResumeSummary[] | null>(null);
  const [selectedId, setSelectedId] = useState<string>("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<JobTailoringResult | null>(null);

  useEffect(() => {
    fetch("/api/resumes")
      .then((res) => res.json())
      .then((data) => setResumes(data.resumes));
  }, []);

  async function runTailoring() {
    if (!selectedId) {
      toast.error("Pick a resume first.");
      return;
    }
    if (!jobDescription.trim()) {
      toast.error("Paste a job description first.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const resumeRes = await fetch(`/api/resumes/${selectedId}`);
      const resumeData = await resumeRes.json();
      if (!resumeRes.ok) throw new Error(resumeData.error);

      const content: ResumeContent = resumeData.resume.content;
      const tailorRes = await fetch("/api/ai/job-tailor", {
        method: "POST",
        body: JSON.stringify({ content, jobDescription }),
      });
      const tailorData = await tailorRes.json();
      if (!tailorRes.ok) throw new Error(tailorData.error);
      setResult(tailorData.result);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not tailor this resume.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl">Job Tailoring</h1>
      <p className="mt-1 text-muted-foreground">
        Paste a job description to see keyword matches and gaps — we never invent skills or
        experience you don&apos;t have.
      </p>

      <div className="mt-6 space-y-4">
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

        <Textarea
          placeholder="Paste the job description here…"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          className="min-h-40"
        />

        <Button onClick={runTailoring} disabled={loading}>
          {loading ? "Analyzing…" : "Analyze match"}
        </Button>
      </div>

      {result && (
        <div className="mt-10 space-y-8">
          <div className="flex items-center gap-6 rounded-sm border border-border bg-card p-8">
            <span className="font-display text-6xl text-primary">{result.matchScore}</span>
            <div>
              <p className="font-accent text-xs uppercase tracking-wider text-muted-foreground">
                Keyword match score
              </p>
              <p className="text-sm text-muted-foreground">Out of 100</p>
            </div>
          </div>

          <div>
            <h3 className="font-display text-lg">Matched keywords</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {result.matchedKeywords.length === 0 && (
                <p className="text-sm text-muted-foreground">None found.</p>
              )}
              {result.matchedKeywords.map((kw) => (
                <Badge key={kw} variant="secondary">
                  {kw}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-display text-lg">Missing keywords</h3>
            <p className="text-sm text-muted-foreground">
              Present in the job description but not evidenced in your resume.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {result.missingKeywords.length === 0 && (
                <p className="text-sm text-muted-foreground">None — great coverage.</p>
              )}
              {result.missingKeywords.map((kw) => (
                <Badge key={kw} variant="outline" className="border-destructive/50 text-destructive">
                  {kw}
                </Badge>
              ))}
            </div>
          </div>

          {result.rewrittenBullets.length > 0 && (
            <div>
              <h3 className="font-display text-lg">Suggested bullet rewrites</h3>
              <div className="mt-3 space-y-4">
                {result.rewrittenBullets.map((bullet, i) => (
                  <div key={i} className="rounded-sm border border-border p-4">
                    <p className="text-sm text-muted-foreground line-through">{bullet.original}</p>
                    <p className="mt-1.5 text-sm">{bullet.revised}</p>
                    <p className="font-accent mt-2 text-xs uppercase tracking-wider text-primary">
                      {bullet.reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.suggestions.length > 0 && (
            <div>
              <h3 className="font-display text-lg">Other suggestions</h3>
              <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                {result.suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
