"use client";

import {
  FileText,
  History,
  LayoutTemplate,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";

import { Reveal, RevealItem } from "@/components/landing/reveal";

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI restructuring",
    description:
      "Paste raw profile text, upload a PDF, or type manually — the AI restructures everything into clean, structured fields. Never raw LaTeX, never guesswork.",
  },
  {
    icon: FileText,
    title: "Real LaTeX typesetting",
    description:
      "Every resume compiles through an actual XeLaTeX engine on the server — the typesetting system behind academic papers, not a CSS-to-PDF hack.",
  },
  {
    icon: ShieldCheck,
    title: "ATS score & audit",
    description:
      "A 0–100 score with concrete fixes: weak verbs, passive voice, keyword density, formatting risks, and contact-info gaps.",
  },
  {
    icon: Target,
    title: "Job tailoring",
    description:
      "Paste a job description and see exactly which keywords you're missing — with existing bullets rewritten to surface real, already-true experience.",
  },
  {
    icon: LayoutTemplate,
    title: "Six ATS-safe templates",
    description:
      "Classic, Modern, Minimal, Tech, Academic, Executive — single-column, no tables, no icons, no parsing traps.",
  },
  {
    icon: History,
    title: "Version history",
    description:
      "Every save is recoverable. Duplicate, rename, and roll back to any previous version of a resume without losing work.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-28">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <RevealItem>
            <span className="font-accent text-xs uppercase tracking-[0.2em] text-primary">
              — § What you get
            </span>
          </RevealItem>
          <RevealItem>
            <h2 className="mt-4 max-w-2xl font-display text-4xl tracking-tight md:text-5xl">
              Built like a <em className="font-wonk text-primary">printing press</em>, not a website
              builder.
            </h2>
          </RevealItem>
        </Reveal>

        <Reveal className="shadow-press mt-16 grid gap-px overflow-hidden rounded-sm border-2 border-foreground bg-border sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <RevealItem key={feature.title} className="h-full">
              <div className="group relative h-full overflow-hidden bg-background p-8 transition-colors duration-300 hover:bg-card">
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-primary transition-transform duration-300 ease-out group-hover:scale-x-100"
                />
                <span className="inline-flex size-10 items-center justify-center rounded-sm border border-border bg-card text-primary transition-all duration-300 group-hover:rotate-[-6deg] group-hover:border-primary group-hover:bg-primary/10">
                  <feature.icon className="size-5" strokeWidth={1.75} />
                </span>
                <h3 className="mt-5 font-display text-xl">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </RevealItem>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
