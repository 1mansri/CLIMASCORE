import type { ProvenanceKind, RiskBand, Severity } from "@/types/domain";

/** 1 lakh = 100,000 INR. Central place for the lakh formatting used across every screen. */
const LAKH = 100_000;

export function formatInrLakhs(valueInr: number, fractionDigits = 1): string {
  const lakhs = valueInr / LAKH;
  return `₹${lakhs.toFixed(fractionDigits)}L`;
}

export function formatInr(valueInr: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(valueInr);
}

export function formatHours(hours: number): string {
  return `${Math.round(hours)}h`;
}

export function formatPercent(value: number, fractionDigits = 0): string {
  return `${value.toFixed(fractionDigits)}%`;
}

/** Risk-band thresholds, consistent with the 0-100 risk engine in spec §9. */
export function riskBandForScore(score: number): RiskBand {
  if (score >= 65) return "High";
  if (score >= 30) return "Moderate";
  return "Low";
}

export const RISK_BAND_COPY: Record<RiskBand, string> = {
  Low: "Low",
  Moderate: "Moderate",
  High: "High",
  Severe: "Severe",
};

export const RISK_BAND_TONE: Record<RiskBand, "red" | "amber" | "green"> = {
  Severe: "red",
  High: "red",
  Moderate: "amber",
  Low: "green",
};

export const SEVERITY_TONE: Record<Severity, "red" | "amber" | "green"> = {
  Severe: "red",
  High: "red",
  Moderate: "amber",
  Low: "green",
};

/**
 * Centralized provenance copy per spec §25 — every screen must reuse these strings
 * (via the ProvenanceBadge component) rather than inventing ad hoc labels.
 */
export const PROVENANCE_COPY: Record<ProvenanceKind, { label: string; description: string }> = {
  observed: {
    label: "Observed",
    description: "Sourced from a named public reference; see the citation for the exact claim.",
  },
  modelled: {
    label: "Modelled (Illustrative)",
    description: "Illustrative model output — not observed borrower data.",
  },
  synthetic: {
    label: "Synthetic",
    description: "Illustrative / synthetic borrower — created for prototype demonstration.",
  },
};

/** Estimated ± range shown alongside a point estimate when the backend hasn't supplied one yet. */
export function fallbackRange(point: number, spread = 0.15): [number, number] {
  return [point * (1 - spread), point * (1 + spread)];
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
}
