import * as React from "react";
import { cn } from "@/lib/utils";

export interface ComparisonPanelProps {
  /** Accessible name for this region, e.g. "Without adaptation scenario". */
  ariaLabel: string;
  title: string;
  tone: "red" | "green";
  children: React.ReactNode;
  className?: string;
}

/**
 * One half of the WITHOUT vs WITH ADAPTATION hero comparison (spec §17
 * Screen 6). Marked up as a labelled landmark region so assistive tech
 * announces the two scenarios distinctly — this is the accessibility
 * requirement called out explicitly for this screen.
 */
export function ComparisonPanel({ ariaLabel, title, tone, children, className }: ComparisonPanelProps) {
  return (
    <section
      role="region"
      aria-label={ariaLabel}
      className={cn(
        "flex flex-col gap-5 border-t-4 bg-white p-6 sm:p-8",
        tone === "red" ? "border-t-risk-red" : "border-t-green",
        className,
      )}
    >
      <h3 className={cn("text-xs font-semibold uppercase tracking-[0.12em]", tone === "red" ? "text-red-ink" : "text-green-ink")}>
        {title}
      </h3>
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  );
}
