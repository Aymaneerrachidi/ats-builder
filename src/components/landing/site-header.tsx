"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV_LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "#templates", label: "Templates" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b-2 border-foreground bg-background/90 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="flex size-8 rotate-[-4deg] items-center justify-center rounded-[2px] border-2 border-foreground bg-card font-accent text-[11px] font-bold leading-none transition-transform duration-300 group-hover:rotate-[4deg] group-hover:bg-primary group-hover:text-primary-foreground">
            A/R
          </span>
          <span className="font-display text-lg font-medium italic">
            ATS Resume <span className="font-wonk not-italic text-primary">AI</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-accent group relative text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 h-[2px] w-full origin-left scale-x-0 bg-primary transition-transform duration-300 ease-out group-hover:scale-x-100" />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            render={<Link href="/sign-in" />}
            nativeButton={false}
            className="hidden rounded-sm text-sm sm:inline-flex"
          >
            Sign in
          </Button>
          <Button
            render={<Link href="/sign-up" />}
            nativeButton={false}
            className="h-9 rounded-sm border-2 border-foreground bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-press-sm transition-all hover:translate-x-[1.5px] hover:translate-y-[1.5px] hover:shadow-none"
          >
            Get started
          </Button>
        </div>
      </div>
    </header>
  );
}
