import * as React from "react";
import { BadgeCheck, FlaskConical, TestTube2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PROVENANCE_COPY } from "@/lib/formatting";
import type { ProvenanceKind } from "@/types/domain";

/**
 * ProvenanceBadge — the single mandated way to label a data point's origin
 * (spec §25 / §36 rule 4 & 13). Exactly three variants:
 *
 *   observed  — "Observed"              sourced from a named public reference
 *   modelled  — "Modelled (Illustrative)" illustrative model output, not observed data
 *   synthetic — "Synthetic"              illustrative / synthetic borrower or figure
 *
 * Every screen that shows a number or claim must reach for this component
 * (or the ProvenanceNote variant below for a longer inline caption) rather
 * than inventing ad hoc labels — copy is centralized in lib/formatting.ts.
 */

const ICONS: Record<ProvenanceKind, React.ComponentType<{ className?: string }>> = {
  observed: BadgeCheck,
  modelled: FlaskConical,
  synthetic: TestTube2,
};

const TONE: Record<ProvenanceKind, string> = {
  observed: "border-green/30 bg-green-bg text-green-ink",
  modelled: "border-blue/30 bg-light-blue text-blue-dark",
  synthetic: "border-amber/30 bg-amber-bg text-amber-ink",
};

export interface ProvenanceBadgeProps {
  kind: ProvenanceKind;
  /** Overrides the default copy, e.g. a specific source name for "observed" data. */
  source?: string;
  sourceUrl?: string;
  className?: string;
  /** Renders the longer description beneath the pill instead of only exposing it via title. */
  showDescription?: boolean;
}

export function ProvenanceBadge({ kind, source, sourceUrl, className, showDescription }: ProvenanceBadgeProps) {
  const copy = PROVENANCE_COPY[kind];
  const Icon = ICONS[kind];
  const description = kind === "observed" && source ? `Source: ${source}` : copy.description;

  return (
    <span className={cn("inline-flex flex-col gap-1", className)}>
      <span
        className={cn(
          "inline-flex w-fit items-center gap-1.5 border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
          TONE[kind],
        )}
        title={description}
      >
        <Icon className="h-3 w-3" aria-hidden="true" />
        {copy.label}
      </span>
      {showDescription && (
        <span className="text-xs text-text-muted">
          {description}
          {kind === "observed" && sourceUrl && (
            <>
              {" "}
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue underline underline-offset-2 hover:text-blue-dark"
              >
                View source
              </a>
            </>
          )}
        </span>
      )}
    </span>
  );
}

/** Compact inline citation line, e.g. "Source: WRI India, Jun 2026" (spec §25). */
export function SourceLine({ source, sourceUrl }: { source: string; sourceUrl?: string }) {
  return (
    <p className="text-xs text-text-muted">
      Source:{" "}
      {sourceUrl ? (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue underline underline-offset-2 hover:text-blue-dark"
        >
          {source}
        </a>
      ) : (
        source
      )}
    </p>
  );
}
