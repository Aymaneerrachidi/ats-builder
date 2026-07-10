const ITEMS = [
  "LaTeX Typeset",
  "ATS-Safe",
  "Six Templates",
  "One-Page Lock",
  "Job Tailoring",
  "AI Restructuring",
  "Arabic & RTL",
  ".tex Source Included",
  "Version History",
  "No Scraping",
];

/** Infinite ticker between hero and features — pure CSS animation, list
 * duplicated so the -50% translate loops seamlessly. Pauses on hover. */
export function Marquee() {
  return (
    <div className="relative overflow-hidden border-y-2 border-foreground bg-foreground py-3 text-background">
      <div className="animate-marquee flex w-max">
        {[0, 1].map((copy) => (
          <div key={copy} aria-hidden={copy === 1} className="flex shrink-0">
            {ITEMS.map((item) => (
              <span
                key={`${copy}-${item}`}
                className="font-accent flex items-center gap-6 pr-6 text-xs font-medium uppercase tracking-[0.2em]"
              >
                {item}
                <span className="font-display text-base italic text-primary">✳</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
