import fs from "node:fs/promises";
import path from "node:path";

import Handlebars from "handlebars";

import { buildCompressionPreamble, type CompressionLevel } from "./compression";
import { containsArabic, escapeLatexBidi, escapeLatexUrl } from "./escape";
import { LatexTemplateError } from "./errors";
import type { ResumeContent, ResumeTemplateId } from "./schema";

/** Mirrors src/lib/latex/render.ts in the main app verbatim (see
 * templates/README.md in the main repo for the Handlebars/LaTeX brace
 * hazards this file works around). */

const TEMPLATES_DIR = path.join(process.cwd(), "templates");
const FONTS_DIR = `${path.join(process.cwd(), "fonts").replace(/\\/g, "/")}/`;
const templateCache = new Map<string, HandlebarsTemplateDelegate>();

const escapeLatex = escapeLatexBidi;

function formatDateRange(startDate: string, endDate: string, current?: boolean): string {
  const start = escapeLatex(startDate);
  if (current) return `${start} -- Present`;
  const end = escapeLatex(endDate);
  if (!end) return start;
  return `${start} -- ${end}`;
}

const SAFE_URL_SCHEMES = new Set(["http:", "https:", "mailto:"]);

function isSafeUrl(rawUrl: string): boolean {
  try {
    return SAFE_URL_SCHEMES.has(new URL(rawUrl).protocol);
  } catch {
    return false;
  }
}

function buildHref(rawUrl: string, rawLabel: string): string {
  if (!rawUrl || !isSafeUrl(rawUrl)) return "";
  return `\\href{${escapeLatexUrl(rawUrl)}}{${escapeLatex(rawLabel || rawUrl)}}`;
}

function resumeHasArabic(content: ResumeContent): boolean {
  return containsArabic(JSON.stringify(content));
}

function toLatexContext(
  content: ResumeContent,
  templateId: ResumeTemplateId,
  compressionLevel: CompressionLevel
) {
  return {
    hasArabic: resumeHasArabic(content),
    fontsDir: FONTS_DIR,
    isCompressed: compressionLevel > 0,
    compressionPreamble: buildCompressionPreamble(templateId, compressionLevel),
    name: escapeLatex(content.name),
    title: escapeLatex(content.title),
    email: escapeLatex(content.email),
    emailHref: buildHref(content.email ? `mailto:${content.email}` : "", content.email),
    phone: escapeLatex(content.phone),
    location: escapeLatex(content.location),
    summary: escapeLatex(content.summary),
    hasSummary: Boolean(content.summary),

    hasExperience: content.experience.length > 0,
    experience: content.experience.map((e) => ({
      company: escapeLatex(e.company),
      position: escapeLatex(e.position),
      location: escapeLatex(e.location),
      hasLocation: Boolean(e.location),
      dates: formatDateRange(e.startDate, e.endDate, e.current),
      bullets: e.bullets.map(escapeLatex),
      hasBullets: e.bullets.length > 0,
    })),

    hasEducation: content.education.length > 0,
    education: content.education.map((ed) => ({
      institution: escapeLatex(ed.institution),
      degree: escapeLatex(ed.degree),
      field: escapeLatex(ed.field),
      hasField: Boolean(ed.field),
      location: escapeLatex(ed.location),
      hasLocation: Boolean(ed.location),
      dates: formatDateRange(ed.startDate ?? "", ed.endDate ?? ""),
      gpa: escapeLatex(ed.gpa),
      hasGpa: Boolean(ed.gpa),
      bullets: ed.bullets.map(escapeLatex),
      hasBullets: ed.bullets.length > 0,
    })),

    hasProjects: content.projects.length > 0,
    projects: content.projects.map((p) => {
      const href = buildHref(p.url, p.name);
      return {
        name: escapeLatex(p.name),
        href,
        hasUrl: Boolean(href),
        description: escapeLatex(p.description),
        hasDescription: Boolean(p.description),
        technologies: p.technologies.map(escapeLatex).join(", "),
        hasTechnologies: p.technologies.length > 0,
        bullets: p.bullets.map(escapeLatex),
        hasBullets: p.bullets.length > 0,
      };
    }),

    hasSkills: content.skills.length > 0,
    skills: content.skills.map(escapeLatex),

    hasLanguages: content.languages.length > 0,
    languages: content.languages.map((l) => ({
      name: escapeLatex(l.name),
      proficiency: escapeLatex(l.proficiency),
      hasProficiency: Boolean(l.proficiency),
    })),

    hasCertifications: content.certifications.length > 0,
    certifications: content.certifications.map((c) => {
      const href = buildHref(c.url, c.name);
      return {
        name: escapeLatex(c.name),
        href,
        hasUrl: Boolean(href),
        issuer: escapeLatex(c.issuer),
        hasIssuer: Boolean(c.issuer),
        date: escapeLatex(c.date),
        hasDate: Boolean(c.date),
      };
    }),

    hasLinks: content.links.some((l) => isSafeUrl(l.url)),
    links: content.links
      .map((l) => ({ href: buildHref(l.url, l.label) }))
      .filter((l) => l.href),
  };
}

async function loadTemplate(templateId: ResumeTemplateId): Promise<HandlebarsTemplateDelegate> {
  const cached = templateCache.get(templateId);
  if (cached) return cached;

  const filePath = path.join(TEMPLATES_DIR, `${templateId}.tex`);
  let source: string;
  try {
    source = await fs.readFile(filePath, "utf-8");
  } catch {
    throw new LatexTemplateError(`Unknown or missing resume template: "${templateId}"`);
  }

  const compiled = Handlebars.compile(source, { noEscape: true, strict: false });
  templateCache.set(templateId, compiled);
  return compiled;
}

export async function renderResumeToLatex(
  content: ResumeContent,
  templateId: ResumeTemplateId,
  compressionLevel: CompressionLevel = 0
): Promise<string> {
  const template = await loadTemplate(templateId);
  const context = toLatexContext(content, templateId, compressionLevel);
  return template(context);
}
