/** Mirrors src/lib/latex/escape.ts in the main app verbatim. */

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

export function escapeLatexUrl(input: string | null | undefined): string {
  if (!input) return "";
  return input.replace(/[#%]/g, (ch) => (ch === "#" ? "\\#" : "\\%"));
}

const ARABIC_CHAR_CLASS = "؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿";
const ARABIC_CHAR_REGEX = new RegExp(`[${ARABIC_CHAR_CLASS}]`);
const ARABIC_RUN_REGEX = new RegExp(
  `([${ARABIC_CHAR_CLASS}](?:[${ARABIC_CHAR_CLASS}\\s]*[${ARABIC_CHAR_CLASS}])?)`,
  "g"
);

export function containsArabic(input: string | null | undefined): boolean {
  return Boolean(input) && ARABIC_CHAR_REGEX.test(input as string);
}

export function escapeLatexBidi(input: string | null | undefined): string {
  if (!input) return "";
  return input
    .split(ARABIC_RUN_REGEX)
    .map((part, index) => {
      if (!part) return "";
      const escaped = escapeLatex(part);
      return index % 2 === 1 ? `\\textarabic{${escaped}}` : escaped;
    })
    .join("");
}
