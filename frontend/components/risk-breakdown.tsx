import type { RiskBreakdown } from "@/types/domain";

const ROWS: { key: keyof Omit<RiskBreakdown, "overall" | "band">; label: string; weight: string }[] = [
  { key: "hazard", label: "Hazard", weight: "35%" },
  { key: "exposure", label: "Exposure", weight: "30%" },
  { key: "vulnerability", label: "Vulnerability", weight: "20%" },
  { key: "businessCriticality", label: "Business Criticality", weight: "15%" },
];

/** Risk-component bars for the MSME profile (spec §17 Screen 2 / §9 risk engine). */
export function RiskBreakdownList({ breakdown }: { breakdown: RiskBreakdown }) {
  return (
    <div className="flex flex-col gap-4">
      {ROWS.map((row) => (
        <div key={row.key} className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between text-sm">
            <span className="font-medium text-navy">
              {row.label} <span className="font-normal text-text-muted">(weight {row.weight})</span>
            </span>
            <span className="tabular-nums text-navy">{breakdown[row.key]}</span>
          </div>
          <div className="h-1.5 w-full bg-neutral">
            <div className="h-full bg-blue" style={{ width: `${breakdown[row.key]}%` }} />
          </div>
        </div>
      ))}
      <p className="pt-1 text-xs text-text-muted">
        Risk Score = 0.35 × Hazard + 0.30 × Exposure + 0.20 × Vulnerability + 0.15 × Business
        Criticality. A transparent, deterministic 0–100 scale — not a trained ML prediction.
      </p>
    </div>
  );
}
