import type { ResumeTemplateId } from "@/lib/schema/resume";

/**
 * 0 = template's normal layout. 1/2 = progressively tighter layout (smaller
 * font, narrower margins, tighter list/section spacing) used when a resume
 * is locked to one page — see src/lib/latex/page-fit.ts, which recompiles
 * at increasing levels until the content fits on a single page.
 */
export const COMPRESSION_LEVELS = [0, 1, 2] as const;
export type CompressionLevel = (typeof COMPRESSION_LEVELS)[number];

interface LayoutBase {
  fontSize: number;
  marginIn: number;
}

// Each template's own normal (level-0) font size / margin, taken from its
// .tex file — compression scales down from these, not from a shared default.
const LAYOUT_BASE: Record<ResumeTemplateId, LayoutBase> = {
  classic: { fontSize: 10.5, marginIn: 0.85 },
  modern: { fontSize: 10.5, marginIn: 0.8 },
  minimal: { fontSize: 10, marginIn: 0.9 },
  tech: { fontSize: 10.5, marginIn: 0.75 },
  academic: { fontSize: 11, marginIn: 1.0 },
  executive: { fontSize: 11, marginIn: 1.0 },
};

interface SpacingPreset {
  itemSep: number;
  topSep: number;
  sectionBefore: number;
  sectionAfter: number;
  fontSizeDelta: number;
  marginDelta: number;
}

const SPACING_PRESETS: Record<Exclude<CompressionLevel, 0>, SpacingPreset> = {
  1: { itemSep: 0, topSep: 1, sectionBefore: 7, sectionAfter: 4, fontSizeDelta: 0.75, marginDelta: 0.15 },
  2: { itemSep: 0, topSep: 0, sectionBefore: 5, sectionAfter: 2, fontSizeDelta: 1.25, marginDelta: 0.3 },
};

const MIN_MARGIN_IN = 0.45;

/**
 * Builds the entire compression override — as one self-contained LaTeX
 * snippet — for a given template and level. Every template drops this in
 * verbatim behind `{{#if isCompressed}}` right before `\begin{document}`.
 * Keeping it as a single precomputed string (rather than several
 * Handlebars-interpolated dimensions) avoids the classic "{{{ }}}
 * triple-mustache colliding with a literal LaTeX brace" hazard entirely —
 * see templates/README.md.
 */
export function buildCompressionPreamble(templateId: ResumeTemplateId, level: CompressionLevel): string {
  if (level === 0) return "";

  const base = LAYOUT_BASE[templateId];
  const preset = SPACING_PRESETS[level];
  const fontSize = base.fontSize - preset.fontSizeDelta;
  const lineSkip = Math.round(fontSize * 1.15 * 4) / 4;
  const marginIn = Math.max(base.marginIn - preset.marginDelta, MIN_MARGIN_IN);

  return [
    `\\geometry{margin=${marginIn}in}`,
    `\\AtBeginDocument{\\fontsize{${fontSize}}{${lineSkip}}\\selectfont}`,
    `\\setlist[itemize]{itemsep=${preset.itemSep}pt, topsep=${preset.topSep}pt, parsep=0pt}`,
    `\\titlespacing{\\section}{0pt}{${preset.sectionBefore}pt}{${preset.sectionAfter}pt}`,
  ].join("\n");
}
