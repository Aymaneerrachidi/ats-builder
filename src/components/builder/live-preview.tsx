"use client";

import { useEffect, useRef, useState } from "react";
import { Download, FileJson, FileCode } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { RESUME_TEMPLATES, type ResumeTemplateId } from "@/lib/schema/resume";

interface LivePreviewProps {
  resumeId: string;
  template: ResumeTemplateId;
  onTemplateChange: (template: ResumeTemplateId) => void;
  onePage: boolean;
  onOnePageChange: (onePage: boolean) => void;
  previewVersion: number;
  isSaving: boolean;
}

export function LivePreview({
  resumeId,
  template,
  onTemplateChange,
  onePage,
  onOnePageChange,
  previewVersion,
  isSaving,
}: LivePreviewProps) {
  const previewUrl = `/api/resumes/${resumeId}/export/pdf?v=${previewVersion}`;
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [pageInfo, setPageInfo] = useState<{ pageCount: number; fitsOnePage: boolean } | null>(
    null
  );
  const previousBlobUrl = useRef<string | null>(null);

  // Fetch (rather than a plain <iframe src>) so the one-page fit headers
  // are readable — an iframe load gives no access to its response headers.
  useEffect(() => {
    let cancelled = false;

    fetch(previewUrl)
      .then(async (res) => {
        if (!res.ok || cancelled) return;
        const pageCount = Number(res.headers.get("x-page-count") ?? "0");
        const fitsOnePage = res.headers.get("x-fits-one-page") !== "false";
        const blob = await res.blob();
        if (cancelled) return;

        const url = URL.createObjectURL(blob);
        if (previousBlobUrl.current) URL.revokeObjectURL(previousBlobUrl.current);
        previousBlobUrl.current = url;
        setBlobUrl(url);
        setPageInfo({ pageCount, fitsOnePage });

        if (onePage && !fitsOnePage) {
          toast.warning(
            "This resume doesn't fit on one page even at the tightest layout. Try the \"Shorten\" AI action or trim some content.",
            { duration: 8000 }
          );
        }
      })
      .catch(() => {
        if (!cancelled) toast.error("Could not generate the preview.");
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      if (previousBlobUrl.current) URL.revokeObjectURL(previousBlobUrl.current);
    };
  }, []);

  return (
    <div className="flex h-full flex-col rounded-sm border border-border bg-card">
      <div className="flex items-center justify-between gap-2 border-b border-border p-3">
        <Select value={template} onValueChange={(v) => onTemplateChange(v as ResumeTemplateId)}>
          <SelectTrigger className="h-8 w-36 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RESUME_TEMPLATES.map((t) => (
              <SelectItem key={t} value={t} className="capitalize">
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1">
          <span className="font-accent text-[10px] uppercase tracking-wider text-muted-foreground">
            {isSaving ? "Saving…" : "Saved"}
          </span>
          <Button
            variant="ghost"
            size="icon"
            title="Download PDF"
            render={<a href={`${previewUrl}&download=1`} download />}
            nativeButton={false}
          >
            <Download className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Download .tex"
            render={<a href={`/api/resumes/${resumeId}/export/tex`} download />}
            nativeButton={false}
          >
            <FileCode className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Download JSON"
            render={<a href={`/api/resumes/${resumeId}/export/json`} download />}
            nativeButton={false}
          >
            <FileJson className="size-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
        <div className="flex items-center gap-2">
          <Switch checked={onePage} onCheckedChange={onOnePageChange} id="one-page-toggle" />
          <label htmlFor="one-page-toggle" className="text-xs text-muted-foreground">
            Lock to 1 page
          </label>
        </div>
        {pageInfo && (
          <span
            className={`font-accent text-[10px] uppercase tracking-wider ${
              onePage && !pageInfo.fitsOnePage ? "text-destructive" : "text-muted-foreground"
            }`}
          >
            {pageInfo.pageCount} page{pageInfo.pageCount === 1 ? "" : "s"}
            {onePage && !pageInfo.fitsOnePage ? " · doesn't fit" : ""}
          </span>
        )}
      </div>

      <div className="min-h-[600px] flex-1 bg-muted">
        {blobUrl && <iframe src={blobUrl} title="Resume preview" className="h-full min-h-[600px] w-full" />}
      </div>
    </div>
  );
}
