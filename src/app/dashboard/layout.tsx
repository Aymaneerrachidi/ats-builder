import Link from "next/link";

import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { UserMenu } from "@/components/dashboard/user-menu";
import { ThemeToggle } from "@/components/theme-toggle";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-svh md:grid-cols-[240px_1fr]">
      <aside className="hidden border-r border-border md:flex md:flex-col">
        <Link href="/dashboard" className="flex items-center gap-2.5 px-5 py-5">
          <span className="flex size-7 rotate-[-4deg] items-center justify-center rounded-sm border-2 border-foreground font-accent text-[10px] font-semibold leading-none">
            A/R
          </span>
          <span className="font-display italic">
            ATS Resume <span className="not-italic text-primary">AI</span>
          </span>
        </Link>
        <SidebarNav />
      </aside>

      <div className="flex flex-col">
        <header className="flex h-14 items-center justify-between border-b border-border px-5">
          <Link href="/dashboard" className="font-display italic md:hidden">
            ATS Resume <span className="not-italic text-primary">AI</span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <UserMenu />
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
