"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BadgeCheck } from "lucide-react";

import { Button } from "@/components/ui/button";

/* ————————————————————————————————————————————————
   Headline: word-by-word rise, "typeset" in wonky italic accent.
   ———————————————————————————————————————————————— */

const headlineWords: { text: string; accent?: boolean; break_?: boolean }[] = [
  { text: "Your" },
  { text: "career," },
  { text: "typeset", accent: true, break_: true },
  { text: "to" },
  { text: "perfection." },
];

const wordVariants: Variants = {
  hidden: { opacity: 0, y: "0.6em", rotate: 1.5 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    rotate: 0,
    transition: { delay: 0.12 + i * 0.09, duration: 0.6, ease: [0.2, 0.65, 0.3, 1] },
  }),
};

/* ————————————————————————————————————————————————
   The .tex source card — lines "type on" with a blinking caret.
   ———————————————————————————————————————————————— */

const TEX_LINES = [
  { text: "\\documentclass{resume}", tone: "text-muted-foreground" },
  { text: "\\name{Jane Doe}", tone: "" },
  { text: "\\role{Staff Engineer}", tone: "" },
  { text: "\\section{Experience}", tone: "text-primary" },
  { text: "\\bullet{Led team of 5…}", tone: "" },
  { text: "\\compile ✓", tone: "text-primary" },
];

function TexSourceCard() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -24, rotate: -1 }}
      animate={{ opacity: 1, x: 0, rotate: -3 }}
      transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
      className="shadow-press absolute -bottom-8 -left-4 z-20 w-56 rounded-sm border-2 border-foreground bg-background p-4 sm:-left-10"
    >
      <div className="mb-3 flex items-center justify-between border-b border-dashed border-border pb-2">
        <span className="font-accent text-[10px] font-semibold uppercase tracking-widest">
          resume.tex
        </span>
        <span className="flex gap-1">
          <span className="size-1.5 rounded-full bg-primary" />
          <span className="size-1.5 rounded-full bg-muted-foreground/40" />
          <span className="size-1.5 rounded-full bg-muted-foreground/40" />
        </span>
      </div>
      <div className="space-y-1.5">
        {TEX_LINES.map((line, i) => (
          <div key={i} className="flex overflow-hidden">
            <motion.span
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 1.0 + i * 0.35, duration: 0.3, ease: "linear" }}
              className={`font-accent whitespace-nowrap text-[10px] leading-relaxed ${line.tone}`}
            >
              {line.text}
            </motion.span>
          </div>
        ))}
        <span className="font-accent animate-caret text-[10px] text-primary">▌</span>
      </div>
    </motion.div>
  );
}

/* ————————————————————————————————————————————————
   The typeset page — lines draw in as if being printed.
   ———————————————————————————————————————————————— */

const PAGE_LINES = [
  { w: "55%", h: "h-3.5", tone: "bg-foreground/85", center: true },
  { w: "36%", h: "h-2", tone: "bg-muted-foreground/50", center: true },
  { w: "100%", h: "h-px", tone: "bg-foreground/60" },
  { w: "30%", h: "h-2.5", tone: "bg-foreground/70" },
  { w: "92%", h: "h-1.5", tone: "bg-muted-foreground/30" },
  { w: "86%", h: "h-1.5", tone: "bg-muted-foreground/30" },
  { w: "72%", h: "h-1.5", tone: "bg-muted-foreground/30" },
  { w: "26%", h: "h-2.5", tone: "bg-foreground/70" },
  { w: "88%", h: "h-1.5", tone: "bg-muted-foreground/30" },
  { w: "64%", h: "h-1.5", tone: "bg-muted-foreground/30" },
];

function TypesetPage() {
  return (
    <div className="relative rounded-sm border border-border bg-card p-8 pb-12 shadow-[0_24px_48px_-16px_rgba(0,0,0,0.3)]">
      <div className="space-y-2.5">
        {PAGE_LINES.map((line, i) => (
          <motion.div
            key={i}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.2 + i * 0.14, duration: 0.4, ease: "easeOut" }}
            style={{ width: line.w, originX: line.center ? 0.5 : 0 }}
            className={`${line.h} rounded-[1px] ${line.tone} ${line.center ? "mx-auto" : ""}`}
          />
        ))}
      </div>

      {/* ATS score stamp — slams down after the page settles. */}
      <motion.div
        initial={{ opacity: 0, scale: 2.2, rotate: 18 }}
        animate={{ opacity: 1, scale: 1, rotate: 9 }}
        transition={{ delay: 2.9, duration: 0.35, ease: [0.2, 1.4, 0.4, 1] }}
        className="absolute -right-5 -top-5 flex size-24 flex-col items-center justify-center rounded-full border-[2.5px] border-primary bg-background/85 text-primary backdrop-blur-sm"
      >
        <BadgeCheck className="size-5" strokeWidth={2} />
        <span className="font-accent text-xl font-bold leading-none">94</span>
        <span className="font-accent text-[8px] font-semibold uppercase tracking-[0.18em]">
          ATS Score
        </span>
      </motion.div>
    </div>
  );
}

/* ————————————————————————————————————————————————
   Rotating circular seal — SVG text on a path.
   ———————————————————————————————————————————————— */

function RotatingSeal() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.9, duration: 0.5, ease: "backOut" }}
      className="absolute -top-10 left-2 z-10 hidden md:block"
      aria-hidden
    >
      <svg viewBox="0 0 120 120" className="animate-spin-slow size-28 text-foreground/70">
        <defs>
          <path id="seal-circle" d="M 60,60 m -44,0 a 44,44 0 1,1 88,0 a 44,44 0 1,1 -88,0" />
        </defs>
        <text className="fill-current font-accent text-[10.5px] uppercase" letterSpacing="2.5">
          <textPath href="#seal-circle">
            Typeset with LaTeX · ATS-Safe · Est. 2026 ·
          </textPath>
        </text>
        <circle cx="60" cy="60" r="30" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
        <text x="60" y="66" textAnchor="middle" className="fill-current font-display text-lg italic">
          A/R
        </text>
      </svg>
    </motion.div>
  );
}

/* ————————————————————————————————————————————————
   Drifting LaTeX glyphs in the backdrop.
   ———————————————————————————————————————————————— */

const GLYPHS = [
  { char: "§", top: "8%", left: "4%", size: "text-4xl", delay: "0s" },
  { char: "\\", top: "70%", left: "2%", size: "text-5xl", delay: "-4s" },
  { char: "{", top: "18%", left: "92%", size: "text-6xl", delay: "-8s" },
  { char: "¶", top: "82%", left: "88%", size: "text-4xl", delay: "-2s" },
  { char: "}", top: "48%", left: "96%", size: "text-3xl", delay: "-6s" },
];

export function Hero() {
  const reducedMotion = useReducedMotion();

  return (
    <section className="bg-grain relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[-14rem] -z-10 h-[36rem] bg-[radial-gradient(ellipse_at_top,color-mix(in_oklch,var(--primary)_16%,transparent),transparent_70%)]"
      />

      {/* Drifting glyphs */}
      {!reducedMotion &&
        GLYPHS.map((g, i) => (
          <span
            key={i}
            aria-hidden
            style={{ top: g.top, left: g.left, animationDelay: g.delay }}
            className={`animate-drift font-display pointer-events-none absolute -z-10 select-none italic text-foreground/[0.07] ${g.size}`}
          >
            {g.char}
          </span>
        ))}

      <div className="mx-auto grid max-w-6xl gap-20 px-6 py-24 md:grid-cols-[1.1fr_1fr] md:items-center md:py-32">
        <div>
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-accent inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3.5 py-1.5 text-[11px] uppercase tracking-widest text-muted-foreground"
          >
            <span className="size-1.5 animate-pulse rounded-full bg-primary" />
            LaTeX-typeset · AI-structured · ATS-safe
          </motion.span>

          <h1 className="mt-7 font-display text-[3.4rem] leading-[1.02] tracking-tight sm:text-6xl md:text-7xl">
            {headlineWords.map((word, i) => (
              <span key={i} className="inline-block overflow-hidden pb-1 align-bottom">
                <motion.span
                  custom={i}
                  variants={wordVariants}
                  initial="hidden"
                  animate="visible"
                  className={`inline-block ${
                    word.accent ? "font-wonk italic text-primary" : ""
                  } ${i < headlineWords.length - 1 ? "mr-[0.24em]" : ""}`}
                >
                  {word.text}
                </motion.span>
                {word.break_ && <br />}
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.55 }}
            className="mt-7 max-w-md text-lg leading-relaxed text-muted-foreground"
          >
            Paste your LinkedIn export or an old resume. Our AI restructures the content — a real
            LaTeX engine typesets it into a document that sails through applicant tracking systems.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.55 }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <Button
              size="lg"
              render={<Link href="/sign-up" />}
              nativeButton={false}
              className="group h-11 rounded-sm border-2 border-foreground bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-press transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
              Build my resume
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              render={<Link href="#how" />}
              nativeButton={false}
              className="h-11 rounded-sm border-2 border-foreground bg-background px-6 text-sm font-semibold shadow-press-sm transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
              See how it works
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            className="font-accent mt-10 text-[11px] uppercase tracking-[0.16em] text-muted-foreground"
          >
            No scraping · No fabricated experience · Real .tex source included
          </motion.p>
        </div>

        {/* Typesetting scene */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.7, ease: "easeOut" }}
          className="relative mx-auto w-full max-w-sm pt-10"
        >
          <RotatingSeal />
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 1.5 }}
            transition={{ delay: 0.35, duration: 0.7 }}
          >
            <TypesetPage />
          </motion.div>
          <TexSourceCard />
        </motion.div>
      </div>
    </section>
  );
}
