"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal, RevealItem } from "@/components/landing/reveal";

const FAQS = [
  {
    question: "Can I import directly from a LinkedIn URL?",
    answer:
      "Not automatically — LinkedIn restricts automated access to public profiles, and we don't scrape it. Paste a LinkedIn URL and we'll show you how to export your profile as a PDF or paste the profile text instead; both are parsed the same way a resume upload is.",
  },
  {
    question: "Will the AI invent experience I don't have?",
    answer:
      "No. The AI only restructures and rephrases content you provide — it never fabricates employers, titles, dates, or skills, and job tailoring only rewrites bullets that are already true about your background.",
  },
  {
    question: "Why LaTeX instead of a normal PDF export?",
    answer:
      "LaTeX produces genuinely clean, single-column, table-free documents that parse reliably in ATS software — the same reason academic papers use it. You can download the .tex source too.",
  },
  {
    question: "What does the one-page lock do?",
    answer:
      "It progressively tightens typography — font size, margins, spacing — and recompiles until your resume fits a single page. If even the tightest layout overflows, it tells you honestly and suggests the AI Shorten action instead of silently cutting content.",
  },
  {
    question: "What happens if a PDF fails to compile?",
    answer:
      "The compiler automatically retries and surfaces a plain-English explanation of what went wrong instead of raw LaTeX errors, so you always know what to fix.",
  },
  {
    question: "Can I keep older versions of a resume?",
    answer:
      "Yes — every save is recoverable from your resume's version history, and duplicating a resume gives you a completely independent copy to experiment with.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="border-t border-border/60 py-28">
      <div className="mx-auto max-w-3xl px-6">
        <Reveal>
          <RevealItem>
            <span className="font-accent text-xs uppercase tracking-[0.2em] text-primary">
              — § FAQ
            </span>
          </RevealItem>
          <RevealItem>
            <h2 className="mt-4 font-display text-4xl tracking-tight md:text-5xl">
              Questions, <em className="font-wonk text-primary">answered</em>.
            </h2>
          </RevealItem>

          <RevealItem>
            <Accordion className="mt-12">
              {FAQS.map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="group">
                  <AccordionTrigger className="font-display gap-4 py-5 text-left text-lg transition-colors hover:text-primary">
                    <span className="flex items-baseline gap-4">
                      <span className="font-accent text-xs text-muted-foreground transition-colors group-hover:text-primary">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {faq.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pl-9 leading-relaxed text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </RevealItem>
        </Reveal>
      </div>
    </section>
  );
}
