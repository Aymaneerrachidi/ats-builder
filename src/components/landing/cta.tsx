"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Reveal, RevealItem } from "@/components/landing/reveal";
import { Button } from "@/components/ui/button";

export function Cta() {
  return (
    <section className="bg-grain relative overflow-hidden border-t-2 border-foreground py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-[-16rem] -z-10 h-[30rem] bg-[radial-gradient(ellipse_at_bottom,color-mix(in_oklch,var(--primary)_18%,transparent),transparent_70%)]"
      />

      {/* Oversize ghost glyph */}
      <span
        aria-hidden
        className="font-display pointer-events-none absolute -right-10 top-1/2 -z-10 -translate-y-1/2 select-none text-[22rem] italic leading-none text-foreground/[0.05]"
      >
        ¶
      </span>

      <div className="mx-auto max-w-3xl px-6 text-center">
        <Reveal>
          <RevealItem>
            <motion.span
              initial={{ rotate: -8, scale: 0.8, opacity: 0 }}
              whileInView={{ rotate: -6, scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, ease: "backOut" }}
              className="font-accent inline-block rounded-[2px] border-2 border-primary px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-primary"
            >
              Final proof · Approved
            </motion.span>
          </RevealItem>

          <RevealItem>
            <h2 className="mt-8 font-display text-5xl leading-[1.05] tracking-tight md:text-6xl">
              Stop fighting <em className="font-wonk text-primary">margins</em>.
              <br />
              Start typesetting your career.
            </h2>
          </RevealItem>

          <RevealItem>
            <p className="mx-auto mt-6 max-w-md text-muted-foreground">
              Free to try. No credit card. Your first resume compiles in under a minute.
            </p>
          </RevealItem>

          <RevealItem>
            <Button
              size="lg"
              render={<Link href="/sign-up" />}
              nativeButton={false}
              className="group mt-10 h-12 rounded-sm border-2 border-foreground bg-primary px-8 text-base font-semibold text-primary-foreground shadow-press transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
              Build my resume
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </RevealItem>
        </Reveal>
      </div>
    </section>
  );
}
