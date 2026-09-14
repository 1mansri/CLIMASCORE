"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { PRIMARY_EVENT_ID, PRIMARY_MSME_ID } from "@/lib/seed-data";
import { DemoModeButton } from "@/components/demo-mode-button";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/" },
  { label: "Risk Analysis", href: `/risk-analysis/${PRIMARY_MSME_ID}/${PRIMARY_EVENT_ID}` },
  { label: "MSME Profiles", href: `/msmes/${PRIMARY_MSME_ID}` },
  { label: "Events", href: "/events" },
  { label: "Adaptation", href: `/msmes/${PRIMARY_MSME_ID}/adaptation` },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Reports", href: `/reports/${PRIMARY_MSME_ID}` },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="no-print sticky top-0 z-40 border-b border-border bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-serif text-xl text-navy">CLIMASCORE</span>
          <span className="hidden text-[11px] uppercase tracking-[0.14em] text-text-muted sm:inline">
            Climate-risk intelligence for lenders
          </span>
        </Link>
        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href.split("/").slice(0, 2).join("/"));
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "block px-3 py-2 text-sm font-medium transition-colors",
                      active ? "text-navy underline decoration-blue decoration-2 underline-offset-8" : "text-text-muted hover:text-navy",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <DemoModeButton />
      </div>
      <nav aria-label="Primary" className="border-t border-border px-4 py-2 lg:hidden">
        <ul className="flex flex-wrap gap-x-3 gap-y-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.label}>
              <Link href={item.href} className="text-xs font-medium text-text-muted hover:text-navy">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
