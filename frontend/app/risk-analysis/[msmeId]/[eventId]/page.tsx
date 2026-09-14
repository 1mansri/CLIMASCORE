"use client";

import * as React from "react";
import { Suspense, use } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge, ComparisonPanel, MetricWithRange, ProvenanceBadge } from "@/components/ui";
import { fetchAdaptations, fetchEvent, fetchMsme, postCounterfactualRun } from "@/lib/api";
import { adaptationTypesForIds, defaultActiveAdaptationIds } from "@/lib/counterfactual";
import { formatHours, formatInrLakhs, formatPercent } from "@/lib/formatting";
import type { AdaptationMeasure, ClimateEvent, CounterfactualRun, Msme } from "@/types/domain";

export default function CounterfactualAnalysisPage({
  params,
}: {
  params: Promise<{ msmeId: string; eventId: string }>;
}) {
  return (
    <Suspense
      fallback={<div className="mx-auto max-w-5xl px-4 py-16 text-text-muted sm:px-6">Loading counterfactual analysis…</div>}
    >
      <CounterfactualAnalysisContent params={params} />
    </Suspense>
  );
}

function CounterfactualAnalysisContent({
  params,
}: {
  params: Promise<{ msmeId: string; eventId: string }>;
}) {
  const { msmeId, eventId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [msme, setMsme] = React.useState<Msme | undefined>(undefined);
  const [event, setEvent] = React.useState<ClimateEvent | undefined>(undefined);
  const [adaptations, setAdaptations] = React.useState<AdaptationMeasure[]>([]);
  const [run, setRun] = React.useState<CounterfactualRun | null>(null);

  const queryTypes = searchParams.get("adaptations");
  const selectedTypes = React.useMemo(
    () => (queryTypes ? queryTypes.split(",").filter(Boolean) : null),
    [queryTypes],
  );

  React.useEffect(() => {
    let cancelled = false;
    Promise.all([fetchMsme(msmeId), fetchEvent(eventId), fetchAdaptations(msmeId)]).then(
      ([m, e, a]) => {
        if (cancelled) return;
        setMsme(m);
        setEvent(e);
        setAdaptations(a);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [msmeId, eventId]);

  const effectiveTypes = React.useMemo(() => {
    if (selectedTypes) return selectedTypes;
    if (adaptations.length === 0) return [];
    return adaptationTypesForIds(adaptations, defaultActiveAdaptationIds(adaptations, msmeId));
  }, [selectedTypes, adaptations, msmeId]);

  React.useEffect(() => {
    if (!msme || !event || adaptations.length === 0) return;
    let cancelled = false;
    postCounterfactualRun(msmeId, eventId, effectiveTypes).then(({ run }) => {
      if (cancelled) return;
      setRun(run);
    });
    return () => {
      cancelled = true;
    };
  }, [msme, event, adaptations, effectiveTypes, msmeId, eventId]);

  const loading = run === null;

  function toggleType(type: string) {
    const current = new Set(effectiveTypes);
    if (current.has(type)) current.delete(type);
    else current.add(type);
    const params = new URLSearchParams(searchParams.toString());
    params.set("adaptations", Array.from(current).join(","));
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  if (!msme || !event) {
    return <div className="mx-auto max-w-5xl px-4 py-16 text-text-muted sm:px-6">Loading counterfactual analysis…</div>;
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-3 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-dark">Counterfactual analysis</p>
        <h1 className="font-serif text-4xl text-navy sm:text-5xl">What changed because of adaptation?</h1>
        <p className="mx-auto max-w-2xl text-text-muted">
          {msme.name} · {event.location.split(",")[0]} {event.type} — {event.date}
        </p>
      </header>

      <fieldset className="border border-border bg-white p-5">
        <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-text-muted">
          Adaptation measures included in the &ldquo;with adaptation&rdquo; scenario
        </legend>
        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
          {adaptations.map((a) => (
            <label key={a.id} className="flex items-center gap-2 text-sm text-text">
              <input
                type="checkbox"
                checked={effectiveTypes.includes(a.type)}
                onChange={() => toggleType(a.type)}
                className="h-4 w-4 accent-blue"
              />
              {a.name}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="relative grid grid-cols-1 gap-px border border-border bg-border lg:grid-cols-2">
        <ComparisonPanel ariaLabel="Without adaptation scenario" title="Without adaptation" tone="red">
          <MetricWithRange label="Risk score" value={`${run?.without.riskScore ?? "–"} / 100`} tone="red" size="large" />
          <MetricWithRange
            label="Estimated loss"
            value={run ? formatInrLakhs(run.without.estimatedLossInr) : "–"}
            rangeLabel={run ? `${formatInrLakhs(run.without.estimatedLossRangeInr[0])}–${formatInrLakhs(run.without.estimatedLossRangeInr[1])}` : undefined}
            tone="red"
          />
          <MetricWithRange
            label="Downtime"
            value={run ? formatHours(run.without.downtimeHours) : "–"}
            rangeLabel={run ? `${formatHours(run.without.downtimeRangeHours[0])}–${formatHours(run.without.downtimeRangeHours[1])}` : undefined}
            tone="red"
          />
        </ComparisonPanel>

        <ComparisonPanel ariaLabel="With adaptation scenario" title="With adaptation" tone="green">
          <MetricWithRange label="Risk score" value={`${run?.with.riskScore ?? "–"} / 100`} tone="green" size="large" />
          <MetricWithRange
            label="Estimated loss"
            value={run ? formatInrLakhs(run.with.estimatedLossInr) : "–"}
            rangeLabel={run ? `${formatInrLakhs(run.with.estimatedLossRangeInr[0])}–${formatInrLakhs(run.with.estimatedLossRangeInr[1])}` : undefined}
            tone="green"
          />
          <MetricWithRange
            label="Downtime"
            value={run ? formatHours(run.with.downtimeHours) : "–"}
            rangeLabel={run ? `${formatHours(run.with.downtimeRangeHours[0])}–${formatHours(run.with.downtimeRangeHours[1])}` : undefined}
            tone="green"
          />
        </ComparisonPanel>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:block"
        >
          <span className="border border-border bg-navy px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white">
            Same climate event
          </span>
        </div>
      </div>
      <p className="-mt-6 text-center text-xs font-semibold uppercase tracking-[0.12em] text-text-muted lg:hidden">
        Same climate event
      </p>

      <section aria-label="Resilience delta" className="border border-border bg-light-blue p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-serif text-2xl text-navy">Resilience delta</h2>
          <div className="flex items-center gap-3">
            <Link href="/methodology" className="text-xs font-medium text-blue hover:text-blue-dark">
              How is this calculated? →
            </Link>
            <Badge variant="blue">Illustrative model output</Badge>
          </div>
        </div>
        {loading || !run ? (
          <p className="text-text-muted">Computing modelled resilience delta…</p>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <MetricWithRange
              label="Estimated avoided loss"
              value={formatInrLakhs(run.avoidedLossInr)}
              tone="blue"
              size="large"
            />
            <MetricWithRange
              label="Illustrative loss reduction"
              value={formatPercent(run.lossReductionPct)}
              tone="blue"
              size="large"
            />
            <MetricWithRange
              label="Downtime avoided"
              value={formatHours(run.downtimeAvoidedHours)}
              tone="blue"
              size="large"
            />
          </div>
        )}
        <p className="mt-6 text-sm text-text-muted">
          This is a transparent modelled comparison, not verified savings and not proof of causal impact. Estimated
          avoided loss — never &ldquo;verified savings&rdquo;.
        </p>
        <ProvenanceBadge kind="modelled" className="mt-3" />
      </section>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
        <Link
          href={`/risk-analysis/${msmeId}/${eventId}/evidence`}
          className="font-medium text-blue hover:text-blue-dark"
        >
          Inspect the supporting evidence →
        </Link>
        <Link
          href={`/decision/${msmeId}`}
          className="border border-navy bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-blue-dark"
        >
          See lender action →
        </Link>
      </div>
    </div>
  );
}
