"use client";

import { motion } from "framer-motion";

import { Reveal, RevealItem } from "@/components/landing/reveal";

interface MiniTemplate {
  id: string;
  name: string;
  description: string;
  header: "left" | "center";
  serif: boolean;
  rule: string; // tailwind bg-* class for the section rule
  chips?: boolean; // tech-style skill chips
}

const TEMPLATES: MiniTemplate[] = [
  {
    id: "classic",
    name: "Classic",
    description: "Small-caps rules, serif body — timeless and dependable.",
    header: "center",
    serif: true,
    rule: "bg-foreground/70",
  },
  {
    id: "modern",
    name: "Modern",
    description: "Sans-serif with a confident color rule under each section.",
    header: "left",
    serif: false,
    rule: "bg-primary",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "No rules, no color — just dense, efficient information.",
    header: "left",
    serif: false,
    rule: "bg-transparent",
  },
  {
    id: "tech",
    name: "Tech",
    description: "Monospace skill tags for engineering and technical roles.",
    header: "left",
    serif: false,
    rule: "bg-[oklch(0.55_0.15_150)]",
    chips: true,
  },
  {
    id: "academic",
    name: "Academic",
    description: "Education-first ordering for research and academic CVs.",
    header: "center",
    serif: true,
    rule: "bg-foreground/70",
  },
  {
    id: "executive",
    name: "Executive",
    description: "Centered header, generous whitespace, refined double rule.",
    header: "center",
    serif: true,
    rule: "bg-foreground/70",
  },
];

function MiniPage({ template }: { template: MiniTemplate }) {
  const align = template.header === "center" ? "mx-auto" : "";
  return (
    <div className="rounded-[2px] border border-border bg-background p-4 transition-shadow duration-300 group-hover:shadow-[0_14px_28px_-12px_rgba(0,0,0,0.35)]">
      {/* Header */}
      <div className={`h-2.5 w-1/2 rounded-[1px] bg-foreground/85 ${align} ${template.serif ? "" : ""}`} />
      <div className={`mt-1 h-1.5 w-1/3 rounded-[1px] bg-muted-foreground/40 ${align}`} />
      {/* Section 1 */}
      <div className={`mt-3 h-[2px] w-full ${template.rule}`} />
      <div className="mt-1.5 h-1.5 w-1/4 rounded-[1px] bg-foreground/60" />
      <div className="mt-1 space-y-1">
        <div className="h-1 w-full rounded-[1px] bg-muted-foreground/25" />
        <div className="h-1 w-11/12 rounded-[1px] bg-muted-foreground/25" />
        <div className="h-1 w-4/5 rounded-[1px] bg-muted-foreground/25" />
      </div>
      {/* Section 2 */}
      <div className={`mt-2.5 h-[2px] w-full ${template.rule}`} />
      <div className="mt-1.5 h-1.5 w-1/3 rounded-[1px] bg-foreground/60" />
      {template.chips ? (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {[10, 14, 8, 12, 9].map((w, i) => (
            <span
              key={i}
              style={{ width: `${w * 4}px` }}
              className="h-2 rounded-[1px] border border-muted-foreground/30 bg-muted"
            />
          ))}
        </div>
      ) : (
        <div className="mt-1 space-y-1">
          <div className="h-1 w-10/12 rounded-[1px] bg-muted-foreground/25" />
          <div className="h-1 w-3/5 rounded-[1px] bg-muted-foreground/25" />
        </div>
      )}
    </div>
  );
}

export function TemplatesPreview() {
  return (
    <section id="templates" className="border-t border-border/60 bg-card/40 py-28">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <RevealItem>
            <span className="font-accent text-xs uppercase tracking-[0.2em] text-primary">
              — § Templates
            </span>
          </RevealItem>
          <RevealItem>
            <h2 className="mt-4 max-w-xl font-display text-4xl tracking-tight md:text-5xl">
              Six layouts. Zero <em className="font-wonk text-primary">parsing traps</em>.
            </h2>
          </RevealItem>
          <RevealItem>
            <p className="mt-4 max-w-lg text-muted-foreground">
              Single-column, no tables, no icons, no text boxes — every template is engineered to be
              read correctly by both humans and applicant tracking systems.
            </p>
          </RevealItem>
        </Reveal>

        <Reveal className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((template, i) => (
            <RevealItem key={template.id}>
              <motion.div
                whileHover={{ y: -8, rotate: i % 2 === 0 ? -1 : 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="group rounded-sm border border-border bg-card p-5"
              >
                <MiniPage template={template} />
                <div className="mt-4 flex items-baseline justify-between">
                  <h3 className="font-display text-lg">{template.name}</h3>
                  <span className="font-accent text-[10px] uppercase tracking-widest text-muted-foreground">
                    .tex
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{template.description}</p>
              </motion.div>
            </RevealItem>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
