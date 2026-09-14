import Link from "next/link";
import { Badge, ProvenanceBadge, SourceLine } from "@/components/ui";
import { SEVERITY_TONE, formatDate } from "@/lib/formatting";
import { PRIMARY_MSME_ID } from "@/lib/seed-data";
import type { ClimateEvent } from "@/types/domain";

const BADGE_VARIANT: Record<"red" | "amber" | "green", "red" | "amber" | "green"> = {
  red: "red",
  amber: "amber",
  green: "green",
};

export function EventCard({ event, affectedCount }: { event: ClimateEvent; affectedCount: number }) {
  const tone = SEVERITY_TONE[event.severity];
  return (
    <article className="flex flex-col gap-4 border border-border bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted">{event.type}</p>
          <h3 className="font-serif text-xl text-navy">
            {event.location.split(",")[0]} {event.type === "Flood" ? "Flood" : "Extreme Heat"}
          </h3>
          <p className="text-sm text-text-muted">{formatDate(event.date)}</p>
        </div>
        <Badge variant={BADGE_VARIANT[tone]}>Severity: {event.severity}</Badge>
      </div>
      <p className="text-sm leading-relaxed text-text">{event.description}</p>
      <div className="flex flex-wrap items-center gap-3">
        <ProvenanceBadge kind={event.provenance} source={event.source} sourceUrl={event.sourceUrl} />
        <SourceLine source={event.source} sourceUrl={event.sourceUrl} />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-sm">
        <span className="text-text-muted">{affectedCount} MSMEs affected in demo dataset</span>
        <Link href={`/risk-analysis/${PRIMARY_MSME_ID}/${event.id}`} className="font-medium text-blue hover:text-blue-dark">
          Run counterfactual analysis →
        </Link>
      </div>
    </article>
  );
}
