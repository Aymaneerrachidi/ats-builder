import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-grain relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[-10rem] -z-10 h-[26rem] bg-[radial-gradient(ellipse_at_top,color-mix(in_oklch,var(--primary)_14%,transparent),transparent_70%)]"
      />
      {/* Ghost glyphs */}
      <span
        aria-hidden
        className="font-display pointer-events-none absolute -left-6 top-16 -z-10 select-none text-[10rem] italic leading-none text-foreground/[0.05]"
      >
        §
      </span>
      <span
        aria-hidden
        className="font-display pointer-events-none absolute -right-4 bottom-10 -z-10 select-none text-[9rem] italic leading-none text-foreground/[0.05]"
      >
        ¶
      </span>

      <Link href="/" className="group mb-9 flex items-center gap-2.5">
        <span className="flex size-9 rotate-[-4deg] items-center justify-center rounded-[2px] border-2 border-foreground bg-card font-accent text-[11px] font-bold leading-none transition-transform duration-300 group-hover:rotate-[4deg] group-hover:bg-primary group-hover:text-primary-foreground">
          A/R
        </span>
        <span className="font-display text-xl italic">
          ATS Resume <span className="font-wonk not-italic text-primary">AI</span>
        </span>
      </Link>

      <div className="shadow-press w-full max-w-sm rounded-sm border-2 border-foreground bg-card p-8">
        {children}
      </div>

      <p className="font-accent mt-8 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        Typeset with LaTeX <span className="text-primary">✳</span> ATS-safe by construction
      </p>
    </div>
  );
}
