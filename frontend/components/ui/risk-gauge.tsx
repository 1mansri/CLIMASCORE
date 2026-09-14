import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { RISK_BAND_TONE } from "@/lib/formatting";
import type { RiskBand } from "@/types/domain";

const TONE_BAR: Record<"red" | "amber" | "green", string> = {
  red: "bg-risk-red",
  amber: "bg-amber",
  green: "bg-green",
};

const TONE_TEXT: Record<"red" | "amber" | "green", string> = {
  red: "text-red-ink",
  amber: "text-amber-ink",
  green: "text-green-ink",
};

export interface RiskGaugeProps {
  score: number;
  band: RiskBand;
  label?: string;
  size?: "default" | "large";
  className?: string;
  /** Set to show a "How is this calculated?" link to the methodology page beneath the gauge. */
  showMethodologyLink?: boolean;
}

/** Plain, finance-grade risk score display — a labelled bar, not a decorative dial. */
export function RiskGauge({
  score,
  band,
  label = "Climate Risk Score",
  size = "default",
  className,
  showMethodologyLink,
}: RiskGaugeProps) {
  const tone = RISK_BAND_TONE[band];
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-text-muted">{label}</span>
        <span className={cn("text-xs font-semibold uppercase tracking-wide", TONE_TEXT[tone])}>{band}</span>
      </div>
      <div className="flex items-end gap-3">
        <span className={cn("font-serif tabular-nums text-navy", size === "large" ? "text-6xl" : "text-4xl")}>
          {score}
        </span>
        <span className="pb-1 text-sm text-text-muted">/ 100</span>
      </div>
      <div className="h-1.5 w-full bg-neutral" role="img" aria-label={`${score} out of 100, ${band} risk`}>
        <div className={cn("h-full", TONE_BAR[tone])} style={{ width: `${Math.min(100, Math.max(0, score))}%` }} />
      </div>
      {showMethodologyLink && (
        <Link href="/methodology" className="text-xs font-medium text-blue hover:text-blue-dark">
          How is this calculated? →
        </Link>
      )}
    </div>
  );
}
