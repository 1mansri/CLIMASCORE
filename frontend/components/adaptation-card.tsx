"use client";

import { Badge, Button, ProvenanceBadge } from "@/components/ui";
import { formatDate, formatPercent } from "@/lib/formatting";
import type { AdaptationMeasure } from "@/types/domain";

const STATUS_VARIANT: Record<AdaptationMeasure["status"], "green" | "neutral" | "amber"> = {
  active: "green",
  inactive: "neutral",
  proposed: "amber",
};

const STATUS_LABEL: Record<AdaptationMeasure["status"], string> = {
  active: "Active",
  inactive: "Inactive",
  proposed: "Proposed",
};

export interface AdaptationCardProps {
  measure: AdaptationMeasure;
  onToggle: (measure: AdaptationMeasure) => void;
  onEdit: (measure: AdaptationMeasure) => void;
  busy?: boolean;
}

export function AdaptationCard({ measure, onToggle, onEdit, busy }: AdaptationCardProps) {
  return (
    <article className="flex flex-col gap-4 border border-border bg-white p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted">{measure.hazard} adaptation</p>
          <h3 className="font-serif text-lg text-navy">{measure.name}</h3>
        </div>
        <Badge variant={STATUS_VARIANT[measure.status]}>{STATUS_LABEL[measure.status]}</Badge>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <div>
          <dt className="text-xs uppercase tracking-wide text-text-muted">Estimated model effect</dt>
          <dd className="text-text">{formatPercent(measure.estimatedVulnerabilityReduction * 100)} vulnerability reduction</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-text-muted">Recorded</dt>
          <dd className="text-text">{formatDate(measure.date)}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-xs uppercase tracking-wide text-text-muted">Evidence</dt>
          <dd className="text-text">{measure.evidence}</dd>
        </div>
      </dl>

      <ProvenanceBadge kind={measure.provenance} showDescription />

      <div className="flex flex-wrap gap-2 border-t border-border pt-4">
        <Button size="sm" variant="secondary" onClick={() => onEdit(measure)} disabled={busy}>
          Edit
        </Button>
        {measure.status === "active" ? (
          <Button size="sm" variant="secondary" onClick={() => onToggle(measure)} disabled={busy}>
            Deactivate
          </Button>
        ) : (
          <Button size="sm" variant="primary" onClick={() => onToggle(measure)} disabled={busy}>
            Activate
          </Button>
        )}
      </div>
    </article>
  );
}
