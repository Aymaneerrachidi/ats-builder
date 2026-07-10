import Link from "next/link";
import { ArrowUpRight, FileStack, Plus, ShieldCheck, Target } from "lucide-react";

import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

const QUICK_ACTIONS = [
  {
    href: "/dashboard/resumes",
    icon: Plus,
    title: "New resume",
    description: "Start from import or manual entry.",
  },
  {
    href: "/dashboard/ats-score",
    icon: ShieldCheck,
    title: "Check ATS score",
    description: "Audit an existing resume.",
  },
  {
    href: "/dashboard/job-tailoring",
    icon: Target,
    title: "Tailor to a job",
    description: "Match keywords from a JD.",
  },
];

export default async function DashboardHomePage() {
  const session = await requireSession();

  const [resumeCount, recentResumes] = await Promise.all([
    prisma.resume.count({ where: { userId: session.user.id } }),
    prisma.resume.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, title: true, template: true, updatedAt: true },
    }),
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-12">
      <div>
        <span className="font-accent text-[11px] uppercase tracking-[0.18em] text-primary">
          — § The desk
        </span>
        <h1 className="mt-2 font-display text-4xl tracking-tight">
          Welcome back, <em className="font-wonk text-primary">{session.user.name.split(" ")[0]}</em>.
        </h1>
        <p className="mt-2 text-muted-foreground">
          {resumeCount === 0
            ? "Let's set your first resume in type."
            : `You have ${resumeCount} resume${resumeCount === 1 ? "" : "s"} in the case.`}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {QUICK_ACTIONS.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group relative rounded-sm border-2 border-border bg-card p-5 transition-all duration-200 hover:-translate-y-1 hover:border-foreground hover:shadow-press-sm"
          >
            <span className="flex size-10 items-center justify-center rounded-sm border border-border bg-background text-primary transition-colors duration-200 group-hover:border-primary group-hover:bg-primary/10">
              <action.icon className="size-5" strokeWidth={1.75} />
            </span>
            <h3 className="mt-4 flex items-center gap-1.5 font-display text-lg">
              {action.title}
              <ArrowUpRight className="size-4 text-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100" />
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">{action.description}</p>
          </Link>
        ))}
      </div>

      <div>
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-2xl">Recent resumes</h2>
          <Link
            href="/dashboard/resumes"
            className="font-accent text-[11px] uppercase tracking-[0.14em] text-primary hover:underline"
          >
            View all →
          </Link>
        </div>

        {recentResumes.length === 0 ? (
          <div className="border-perforated mt-5 flex flex-col items-center gap-4 rounded-sm border-border py-16 text-center">
            <span className="flex size-14 rotate-[-4deg] items-center justify-center rounded-sm border-2 border-border bg-card">
              <FileStack className="size-6 text-muted-foreground" strokeWidth={1.5} />
            </span>
            <div>
              <p className="font-display text-lg">The tray is empty.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Import a LinkedIn export or start from scratch.
              </p>
            </div>
            <Button
              render={<Link href="/dashboard/resumes" />}
              nativeButton={false}
              className="rounded-sm border-2 border-foreground font-semibold shadow-press-sm transition-all hover:translate-x-[1.5px] hover:translate-y-[1.5px] hover:shadow-none"
            >
              Create your first resume
            </Button>
          </div>
        ) : (
          <ul className="mt-5 divide-y divide-border overflow-hidden rounded-sm border-2 border-border">
            {recentResumes.map((resume) => (
              <li key={resume.id}>
                <Link
                  href={`/dashboard/builder/${resume.id}`}
                  className="group flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-card"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <span className="hidden h-10 w-8 shrink-0 flex-col justify-center gap-[3px] rounded-[2px] border border-border bg-background px-1.5 transition-colors group-hover:border-primary/50 sm:flex">
                      <span className="h-[2.5px] w-full rounded-full bg-foreground/60" />
                      <span className="h-[2px] w-4/5 rounded-full bg-muted-foreground/40" />
                      <span className="h-[2px] w-full rounded-full bg-muted-foreground/25" />
                      <span className="h-[2px] w-3/5 rounded-full bg-muted-foreground/25" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium transition-colors group-hover:text-primary">
                        {resume.title}
                      </p>
                      <p className="font-accent text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {resume.template}
                      </p>
                    </div>
                  </div>
                  <span className="font-accent shrink-0 text-[11px] text-muted-foreground">
                    {resume.updatedAt.toLocaleDateString()}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
