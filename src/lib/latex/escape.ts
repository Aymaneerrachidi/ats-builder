/**
 * Escapes LaTeX special characters in a single pass so replacement text
 * (e.g. "\textbackslash{}") is never re-scanned for further matches —
 * sequential regex replacement would double-escape the braces it just
 * inserted. Never interpolate raw user/AI text into a .tex file without
 * passing it through this first.
 */
const ESCAPE_MAP: Record<string, string> = {
  "\\": "\\textbackslash{}",
  "{": "\\{",
  "}": "\\}",
  $: "\\$",
  "&": "\\&",
  "%": "\\%",
  "#": "\\#",
  _: "\\_",
  "^": "\\textasciicircum{}",
  "~": "\\textasciitilde{}",
};

const ESCAPE_REGEX = /[\\{}$&%#_^~]/g;

export function escapeLatex(input: string | null | undefined): string {
  if (!input) return "";
  return input
    .replace(ESCAPE_REGEX, (ch) => ESCAPE_MAP[ch] ?? ch)
    .replace(/\r\n|\r/g, "\n")
    .replace(/\n{2,}/g, "\\par ")
    .replace(/\n/g, " \\\\ ");
}

/** Escapes characters that remain special inside a hyperref \href URL
 * argument even though hyperref changes catcodes for most of it. */
export function escapeLatexUrl(input: string | null | undefined): string {
  if (!input) return "";
  return input.replace(/[#%]/g, (ch) => (ch === "#" ? "\\#" : "\\%"));
}

// Arabic (U+0600–06FF) + Arabic Supplement (U+0750–077F) +
// Arabic Extended-A (U+08A0–08FF) + Presentation Forms A/B (U+FB50–FDFF, U+FE70–FEFF).
const ARABIC_CHAR_CLASS = "؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿";
const ARABIC_CHAR_REGEX = new RegExp(`[${ARABIC_CHAR_CLASS}]`);
// A maximal run that starts and ends with an Arabic-script character,
// allowing internal whitespace (so a multi-word Arabic phrase stays one run
// rather than being split — and split rendering direction — word by word).
const ARABIC_RUN_REGEX = new RegExp(
  `([${ARABIC_CHAR_CLASS}](?:[${ARABIC_CHAR_CLASS}\\s]*[${ARABIC_CHAR_CLASS}])?)`,
  "g"
);

export function containsArabic(input: string | null | undefined): boolean {
  return Boolean(input) && ARABIC_CHAR_REGEX.test(input as string);
}

/**
 * Like `escapeLatex`, but for text that may mix Latin and Arabic script.
 * Every contiguous Arabic-script run is wrapped in `\textarabic{...}`
 * (a polyglossia command switching to the bundled Arabic font + RTL
 * direction for just that run) so mixed-language fields — an Arabic name
 * next to an English job title, for instance — render correctly. Templates
 * only need this wrapping available when `hasArabic` is true in the render
 * context; see templates/README.md.
 */
export function escapeLatexBidi(input: string | null | undefined): string {
  if (!input) return "";
  return input
    .split(ARABIC_RUN_REGEX)
    .map((part, index) => {
      if (!part) return "";
      const escaped = escapeLatex(part);
      // `String.split` with a capturing regex alternates [gap, match, gap, match, ...];
      // odd indices are the captured Arabic runs.
      return index % 2 === 1 ? `\\textarabic{${escaped}}` : escaped;
    })
    .join("");
}
