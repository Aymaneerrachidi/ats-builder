import Link from "next/link";

const COLUMNS = [
  {
    heading: "Product",
    links: [
      { label: "How it works", href: "#how" },
      { label: "Templates", href: "#templates" },
      { label: "Pricing", href: "#pricing" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    heading: "Account",
    links: [
      { label: "Sign in", href: "/sign-in" },
      { label: "Sign up", href: "/sign-up" },
      { label: "Dashboard", href: "/dashboard" },
    ],
  },
];

/** Colophon-style footer — set like the back page of a printed journal. */
export function SiteFooter() {
  return (
    <footer className="border-t-2 border-foreground bg-card/50">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 rotate-[-4deg] items-center justify-center rounded-[2px] border-2 border-foreground bg-background font-accent text-[11px] font-bold leading-none">
              A/R
            </span>
            <span className="font-display text-lg italic">
              ATS Resume <span className="font-wonk not-italic text-primary">AI</span>
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            AI-structured, LaTeX-typeset resumes that clear applicant tracking systems. Built for
            job seekers, not scrapers.
          </p>
        </div>

        {COLUMNS.map((column) => (
          <div key={column.heading}>
            <h3 className="font-accent text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {column.heading}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group relative text-sm text-foreground/80 transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Colophon line */}
      <div className="border-t border-dashed border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-5 text-center sm:flex-row sm:text-left">
          <p className="font-accent text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            © {new Date().getFullYear()} ATS Resume AI
          </p>
          <p className="font-accent text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Set in Fraunces & Plus Jakarta Sans · Compiled with XeLaTeX <span className="text-primary">✳</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
