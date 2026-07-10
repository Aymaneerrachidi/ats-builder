"use client";

import { motion } from "framer-motion";
import { FileInput, Printer, WandSparkles } from "lucide-react";

import { Reveal, RevealItem } from "@/components/landing/reveal";

const STEPS = [
  {
    numeral: "01",
    icon: FileInput,
    title: "Import anything",
    description:
      "LinkedIn PDF export, an old resume, or raw pasted text. The AI extracts every job, date, and skill into clean structured fields — nothing invented, nothing lost.",
  },
  {
    numeral: "02",
    icon: WandSparkles,
    title: "Refine with AI",
    description:
      "Ten one-click enhancements: sharpen the summary, rewrite bullets with action verbs, add metric placeholders, shift tone. Every change stays fully editable.",
  },
  {
    numeral: "03",
    icon: Printer,
    title: "Typeset & ship",
    description:
      "A real LaTeX engine compiles your resume — the same typesetting system behind academic journals. Download the PDF, the .tex source, or the raw JSON.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="bg-ruled relative border-b border-border/60 py-28">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <RevealItem>
            <span className="font-accent text-xs uppercase tracking-[0.2em] text-primary">
              — § How it works
            </span>
          </RevealItem>
          <RevealItem>
            <h2 className="mt-4 max-w-xl font-display text-4xl tracking-tight md:text-5xl">
              From messy paste to <em className="font-wonk text-primary">printed page</em> in three
              moves.
            </h2>
          </RevealItem>
        </Reveal>

        <Reveal className="mt-16 grid gap-6 md:grid-cols-3">
          {STEPS.map((step) => (
            <RevealItem key={step.numeral}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 350, damping: 22 }}
                className="shadow-press group relative h-full rounded-sm border-2 border-foreground bg-card p-7"
              >
                <span className="font-display absolute -top-5 right-5 bg-card px-2 text-4xl italic text-foreground/15 transition-colors group-hover:text-primary/60">
                  {step.numeral}
                </span>
                <span className="inline-flex size-11 items-center justify-center rounded-sm border-2 border-foreground bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <step.icon className="size-5" strokeWidth={1.75} />
                </span>
                <h3 className="mt-5 font-display text-2xl">{step.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </motion.div>
            </RevealItem>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
