import { ProvenanceBadge } from "@/components/ui";
import { formatDate } from "@/lib/formatting";
import type { EvidenceItem } from "@/types/domain";

const STAGE_ORDER: EvidenceItem["stage"][] = [
  "Climate Event",
  "Hazard Data",
  "Borrower Location",
  "Asset / Operations",
  "Adaptation Record",
  "Modelled Impact",
];

const QUALITY_LABEL: Record<EvidenceItem["quality"], string> = {
  verified: "Verified",
  reported: "Reported",
  modelled: "Modelled",
  missing: "Not yet collected",
};

/** Evidence chain (spec §17 Screen 7): Climate Event -> Hazard Data -> Location -> Assets -> Adaptation -> Modelled Impact. */
export function EvidenceChain({ items, msmeName }: { items: EvidenceItem[]; msmeName?: string }) {
  const byStage = new Map(items.map((i) => [i.stage, i]));

  return (
    <ol className="flex flex-col">
      {STAGE_ORDER.map((stage, idx) => {
        const item = byStage.get(stage);
        return (
          <li key={stage} className="relative flex gap-4 pb-8 last:pb-0">
            {idx < STAGE_ORDER.length - 1 && (
              <span aria-hidden="true" className="absolute left-[7px] top-5 h-full w-px bg-border" />
            )}
            <span
              aria-hidden="true"
              className={`relative z-10 mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2 ${
                item ? "border-blue bg-blue" : "border-border bg-white"
              }`}
            />
            <div className="flex flex-1 flex-col gap-2 border border-border bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-navy">{stage}</h3>
                <span className="text-xs font-medium text-text-muted">
                  {item ? QUALITY_LABEL[item.quality] : QUALITY_LABEL.missing}
                </span>
              </div>
              {item ? (
                <>
                  <p className="text-sm text-text">{item.label}</p>
                  <p className="text-sm text-text-muted">{item.description}</p>
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <ProvenanceBadge kind={item.provenance} source={item.source} sourceUrl={item.sourceUrl} />
                    <span className="text-xs text-text-muted">
                      {item.dataType} · {formatDate(item.timestamp)}
                    </span>
                  </div>
                  {item.sourceUrl && (
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-fit text-xs text-blue underline underline-offset-2 hover:text-blue-dark"
                    >
                      {item.sourceUrl}
                    </a>
                  )}
                </>
              ) : (
                <p className="text-sm text-text-muted">
                  No {stage.toLowerCase()} evidence collected yet{msmeName ? ` for ${msmeName}` : ""}.
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
