"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Check } from "lucide-react";

import { Reveal, RevealItem } from "@/components/landing/reveal";
import { Button } from "@/components/ui/button";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Try the full pipeline on one resume.",
    features: [
      "1 active resume",
      "All 6 templates",
      "AI extraction & enhancement",
      "ATS score reports",
      "PDF & TEX export",
    ],
    cta: "Start free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$12",
    period: "/ month",
    description: "For an active job search.",
    features: [
      "Unlimited resumes",
      "Unlimited AI enhancements",
      "Job tailoring & keyword match",
      "Version history & restore",
      "One-page lock & priority compile",
    ],
    cta: "Get Pro",
    highlighted: true,
  },
  {
    name: "Teams",
    price: "$39",
    period: "/ month",
    description: "For career coaches & bootcamps.",
    features: [
      "Everything in Pro",
      "5 seats included",
      "Shared template library",
      "Usage analytics per seat",
      "Priority support",
    ],
    cta: "Talk to us",
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="border-t border-border/60 py-28">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <RevealItem>
            <span className="font-accent text-xs uppercase tracking-[0.2em] text-primary">
              — § Pricing
            </span>
          </RevealItem>
          <RevealItem>
            <h2 className="mt-4 max-w-xl font-display text-4xl tracking-tight md:text-5xl">
              Honest pricing, <em className="font-wonk text-primary">no dark patterns</em>.
            </h2>
          </RevealItem>
        </Reveal>

        <Reveal className="mt-16 grid items-stretch gap-6 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <RevealItem key={plan.name} className="h-full">
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 320, damping: 22 }}
                className={`relative flex h-full flex-col rounded-sm p-8 ${
                  plan.highlighted
                    ? "shadow-press-primary border-2 border-foreground bg-card"
                    : "border-2 border-border bg-card"
                }`}
              >
                {plan.highlighted && (
                  <span className="font-accent absolute -top-3.5 left-7 rotate-[-2deg] rounded-[2px] border border-foreground bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-primary-foreground">
                    Most popular
                  </span>
                )}
                <h3 className="font-display text-2xl">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                <div className="mt-7 flex items-baseline gap-1.5">
                  <span className="font-display text-5xl tracking-tight">{plan.price}</span>
                  <span className="font-accent text-xs uppercase tracking-wider text-muted-foreground">
                    {plan.period}
                  </span>
                </div>

                <ul className="mt-7 flex-1 space-y-3 border-t border-dashed border-border pt-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={2.5} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  render={<Link href="/sign-up" />}
                  nativeButton={false}
                  variant={plan.highlighted ? "default" : "outline"}
                  className={`mt-8 h-10 w-full rounded-sm font-semibold ${
                    plan.highlighted
                      ? "border-2 border-foreground shadow-press-sm transition-all hover:translate-x-[1.5px] hover:translate-y-[1.5px] hover:shadow-none"
                      : "border-2"
                  }`}
                >
                  {plan.cta}
                </Button>
              </motion.div>
            </RevealItem>
          ))}
        </Reveal>

        <Reveal className="mt-8">
          <RevealItem>
            <p className="font-accent text-center text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              Cancel anytime · Your data exports with you · No credit card for Free
            </p>
          </RevealItem>
        </Reveal>
      </div>
    </section>
  );
}
