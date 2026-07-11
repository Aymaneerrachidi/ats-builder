import { z } from "zod";

/**
 * Mirrors src/lib/schema/resume.ts in the main app (kept in sync by hand —
 * this service only needs the shape for rendering, not the full app).
 */

export const linkSchema = z.object({
  label: z.string().trim().max(60),
  url: z.string().trim().max(300),
});

export const experienceSchema = z.object({
  company: z.string().trim().max(150),
  position: z.string().trim().max(150),
  location: z.string().trim().max(150),
  startDate: z.string().trim().max(40),
  endDate: z.string().trim().max(40),
  current: z.boolean(),
  bullets: z.array(z.string().trim().max(400)).max(15),
});

export const educationSchema = z.object({
  institution: z.string().trim().max(150),
  degree: z.string().trim().max(150),
  field: z.string().trim().max(150),
  location: z.string().trim().max(150),
  startDate: z.string().trim().max(40),
  endDate: z.string().trim().max(40),
  gpa: z.string().trim().max(20),
  bullets: z.array(z.string().trim().max(400)).max(10),
});

export const projectSchema = z.object({
  name: z.string().trim().max(150),
  description: z.string().trim().max(400),
  technologies: z.array(z.string().trim().max(60)).max(20),
  url: z.string().trim().max(300),
  bullets: z.array(z.string().trim().max(400)).max(10),
});

export const certificationSchema = z.object({
  name: z.string().trim().max(200),
  issuer: z.string().trim().max(150),
  date: z.string().trim().max(40),
  url: z.string().trim().max(300),
});

export const languageSchema = z.object({
  name: z.string().trim().max(60),
  proficiency: z.string().trim().max(60),
});

export const resumeContentSchema = z.object({
  name: z.string().trim().max(150),
  title: z.string().trim().max(150),
  email: z.string().trim().max(150),
  phone: z.string().trim().max(60),
  location: z.string().trim().max(150),
  summary: z.string().trim().max(1200),
  experience: z.array(experienceSchema).max(30),
  education: z.array(educationSchema).max(15),
  projects: z.array(projectSchema).max(20),
  skills: z.array(z.string().trim().max(60)).max(60),
  languages: z.array(languageSchema).max(15),
  certifications: z.array(certificationSchema).max(20),
  links: z.array(linkSchema).max(10),
});

export type ResumeContent = z.infer<typeof resumeContentSchema>;

export const RESUME_TEMPLATES = [
  "classic",
  "modern",
  "minimal",
  "tech",
  "academic",
  "executive",
] as const;

export type ResumeTemplateId = (typeof RESUME_TEMPLATES)[number];

export const resumeTemplateSchema = z.enum(RESUME_TEMPLATES);

export const compileRequestSchema = z.object({
  content: resumeContentSchema,
  templateId: resumeTemplateSchema,
  onePage: z.boolean(),
});
