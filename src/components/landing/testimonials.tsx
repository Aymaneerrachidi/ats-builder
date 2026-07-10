"use client";

import { Reveal, RevealItem } from "@/components/landing/reveal";

const TESTIMONIALS = [
  {
    quote:
      "Rewrote my entire resume from a messy LinkedIn PDF in about two minutes. The ATS score caught passive voice I'd never have noticed.",
    name: "Placeholder Name",
    role: "Placeholder Role, Company",
  },
  {
    quote:
      "The job-tailoring feature told me exactly which keywords I was missing instead of just inventing skills for me. Felt honest.",
    name: "Placeholder Name",
    role: "Placeholder Role, Company",
  },
  {
    quote:
      "It's the first resume builder where the PDF actually looks like it was typeset, not exported from a template editor.",
    name: "Placeholder Name",
    role: "Placeholder Role, Company",
  },
];

export function Testimonials() {
  return (
    <section className="border-t border-border/60 bg-card/40 py-28">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <RevealItem>
            <span className="font-accent text-xs uppercase tracking-[0.2em] text-primary">
              — § Letters to the editor
            </span>
          </RevealItem>
          <RevealItem>
            <p className="font-accent mt-2 text-[11px] uppercase tracking-wider text-muted-foreground">
              (Placeholder testimonials — swap in real quotes before launch.)
            </p>
          </RevealItem>
        </Reveal>

        <Reveal className="mt-12 grid gap-8 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <RevealItem key={i} className="h-full">
              <figure className="relative flex h-full flex-col rounded-sm border border-border bg-background p-8 pt-12">
                <span
                  aria-hidden
                  className="font-display absolute -top-2 left-6 text-7xl italic leading-none text-primary/25"
                >
                  “
                </span>
                <blockquote className="flex-1 font-display text-lg leading-snug italic">
                  {t.quote}
                </blockquote>
                <figcaption className="mt-6 border-t border-dashed border-border pt-4 text-sm">
                  <span className="font-medium">{t.name}</span>
                  <span className="font-accent mt-0.5 block text-[11px] uppercase tracking-wider text-muted-foreground">
                    {t.role}
                  </span>
                </figcaption>
              </figure>
            </RevealItem>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
