import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * MetricWithRange — an uncertainty-band-aware stat display for the
 * counterfactual hero screen: a point estimate plus a range, e.g.
 * "₹6.7L (range ₹5.4L–₹8.1L)". If the backend hasn't supplied a range yet,
 * callers pass a ±15% fallback (see lib/formatting.ts#fallbackRange) so the
 * UI stays demoable standalone.
 */
export interface MetricWithRangeProps {
  label: string;
  value: string;
  rangeLabel?: string;
  tone?: "navy" | "red" | "green" | "blue";
  size?: "default" | "large";
  className?: string;
}

const TONE_TEXT: Record<NonNullable<MetricWithRangeProps["tone"]>, string> = {
  navy: "text-navy",
  red: "text-red-ink",
  green: "text-green-ink",
  blue: "text-blue-dark",
};

export function MetricWithRange({ label, value, rangeLabel, tone = "navy", size = "default", className }: MetricWithRangeProps) {
  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      <span className="text-xs font-medium uppercase tracking-wide text-text-muted">{label}</span>
      <span className={cn("font-serif tabular-nums", size === "large" ? "text-4xl" : "text-2xl", TONE_TEXT[tone])}>
        {value}
      </span>
      {rangeLabel && <span className="text-xs text-text-muted">range {rangeLabel}</span>}
    </div>
  );
}
