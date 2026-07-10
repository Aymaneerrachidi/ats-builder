"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  FileStack,
  Home,
  LayoutTemplate,
  Settings,
  ShieldCheck,
  Target,
  User,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: Home, exact: true },
  { href: "/dashboard/resumes", label: "My Resumes", icon: FileStack },
  { href: "/dashboard/templates", label: "Templates", icon: LayoutTemplate },
  { href: "/dashboard/ats-score", label: "ATS Score", icon: ShieldCheck },
  { href: "/dashboard/job-tailoring", label: "Job Tailoring", icon: Target },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5 p-3">
      {NAV_ITEMS.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`group relative flex items-center gap-3 rounded-sm px-3 py-2 text-sm transition-colors duration-200 ${
              active
                ? "font-medium text-primary"
                : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
            }`}
          >
            {active && (
              <motion.span
                layoutId="sidebar-active"
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
                className="absolute inset-0 rounded-sm border border-primary/25 bg-primary/10"
              />
            )}
            {/* Ink tick on the active entry, like a margin annotation. */}
            {active && (
              <motion.span
                layoutId="sidebar-tick"
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
                className="absolute -left-3 h-5 w-[3px] rounded-r-full bg-primary"
              />
            )}
            <item.icon
              className="relative size-4 transition-transform duration-200 group-hover:scale-110"
              strokeWidth={1.75}
            />
            <span className="relative">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
