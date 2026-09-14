import Link from "next/link";
import { Badge, ProvenanceBadge } from "@/components/ui";
import { RISK_BAND_TONE, formatInrLakhs } from "@/lib/formatting";
import type { Msme } from "@/types/domain";

const BADGE_VARIANT: Record<"red" | "amber" | "green", "red" | "amber" | "green"> = {
  red: "red",
  amber: "amber",
  green: "green",
};

export function MsmeCard({ msme }: { msme: Msme }) {
  const tone = RISK_BAND_TONE[msme.riskBand];
  return (
    <Link
      href={`/msmes/${msme.id}`}
      className="flex flex-col gap-3 border border-border bg-white p-5 transition-colors hover:border-blue"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-serif text-lg text-navy">{msme.name}</h3>
          <p className="text-sm text-text-muted">
            {msme.sector} · {msme.city}, {msme.state}
          </p>
        </div>
        <Badge variant={BADGE_VARIANT[tone]}>{msme.riskBand}</Badge>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-serif text-3xl text-navy">{msme.baselineRiskScore}</span>
        <span className="text-sm text-text-muted">/ 100 climate risk score</span>
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-text-muted">
        <div>
          <dt className="inline">Equipment: </dt>
          <dd className="inline text-text">{formatInrLakhs(msme.equipmentValueInr)}</dd>
        </div>
        <div>
          <dt className="inline">Inventory: </dt>
          <dd className="inline text-text">{formatInrLakhs(msme.inventoryValueInr)}</dd>
        </div>
      </dl>
      <ProvenanceBadge kind={msme.provenance} />
    </Link>
  );
}
