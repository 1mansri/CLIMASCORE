import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { Badge, ProvenanceBadge } from "@/components/ui";
import { RiskGauge } from "@/components/ui/risk-gauge";
import { RiskBreakdownList } from "@/components/risk-breakdown";
import { EvidenceChain } from "@/components/evidence-chain";
import { PrintButton } from "@/components/print-button";
import { fetchAdaptations, fetchEvent, fetchEvidence, fetchMsme, postCounterfactualRun } from "@/lib/api";
import { formatDate, formatHours, formatInr, formatInrLakhs, formatPercent } from "@/lib/formatting";
import { PRIMARY_EVENT_ID } from "@/lib/seed-data";

export const dynamic = "force-dynamic";

const SUGGESTED_ACTIONS = [
  "Continue monitoring",
  "Consider adaptation-linked financing",
  "Review collateral exposure",
  "Reassess after major climate events",
];

export default async function BorrowerReportPage({ params }: { params: Promise<{ msmeId: string }> }) {
  const { msmeId } = await params;
  const msme = await fetchMsme(msmeId);
  if (!msme) notFound();

  const [event, adaptations, evidence] = await Promise.all([
    fetchEvent(PRIMARY_EVENT_ID),
    fetchAdaptations(msmeId),
    fetchEvidence(msmeId, PRIMARY_EVENT_ID),
  ]);
  const activeAdaptations = adaptations.filter((a) => a.status === "active");
  const { run } = await postCounterfactualRun(
    msmeId,
    PRIMARY_EVENT_ID,
    activeAdaptations.map((a) => a.type),
  );

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10 px-4 py-10 sm:px-6 print:max-w-none print:px-0">
      <div className="flex items-center justify-between print:hidden">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-dark">Borrower report</p>
        <PrintButton />
      </div>

      <header className="flex flex-col gap-2 border-b border-border pb-6">
        <span className="font-serif text-2xl text-navy">CLIMASCORE — Borrower Climate-Risk Report</span>
        <h1 className="font-serif text-4xl text-navy">{msme.name}</h1>
        <p className="text-text-muted">
          {msme.city}, {msme.state}, {msme.country} · {msme.sector}
        </p>
        <ProvenanceBadge kind={msme.provenance} showDescription />
      </header>

      <ReportSection index={1} title="Borrower profile">
        <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          <Field label="Annual revenue" value={formatInr(msme.annualRevenueInr)} />
          <Field label="Equipment value" value={formatInr(msme.equipmentValueInr)} />
          <Field label="Inventory value" value={formatInr(msme.inventoryValueInr)} />
          <Field label="Facility area" value={`${msme.facilityAreaSqft.toLocaleString("en-IN")} sq ft`} />
          <Field label="Employees" value={String(msme.employees)} />
          <Field label="Type" value={msme.type} />
        </dl>
      </ReportSection>

      <ReportSection index={2} title="Climate exposure">
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <Field label="Flood exposure" value={`${msme.hazardExposure.flood} / 100`} />
          <Field label="Heat exposure" value={`${msme.hazardExposure.heat} / 100`} />
        </dl>
        <p className="mt-3 text-sm text-text">{msme.operationalSensitivity}</p>
      </ReportSection>

      <ReportSection index={3} title="Baseline risk">
        <RiskGauge score={msme.baselineRiskScore} band={msme.riskBand} />
        <div className="mt-5">
          <RiskBreakdownList breakdown={msme.riskBreakdown} />
        </div>
      </ReportSection>

      <ReportSection index={4} title="Adaptation measures">
        <ul className="flex flex-col gap-2 text-sm">
          {adaptations.map((a) => (
            <li key={a.id} className="flex items-center justify-between border-b border-border pb-2">
              <span>
                {a.name} <span className="text-text-muted">({a.hazard})</span>
              </span>
              <Badge variant={a.status === "active" ? "green" : a.status === "proposed" ? "amber" : "neutral"}>
                {a.status}
              </Badge>
            </li>
          ))}
        </ul>
      </ReportSection>

      {event && (
        <ReportSection index={5} title="Climate event">
          <p className="text-sm font-medium text-navy">
            {event.location.split(",")[0]} {event.type} — {formatDate(event.date)}
          </p>
          <p className="mt-1 text-sm text-text">{event.description}</p>
          <ProvenanceBadge kind={event.provenance} source={event.source} sourceUrl={event.sourceUrl} className="mt-2" />
        </ReportSection>
      )}

      <ReportSection index={6} title="Counterfactual analysis">
        <div className="grid grid-cols-2 gap-6 text-sm">
          <div>
            <p className="font-medium text-red-ink">Without adaptation</p>
            <p>Risk: {run.without.riskScore} / 100</p>
            <p>Loss: {formatInrLakhs(run.without.estimatedLossInr)}</p>
            <p>Downtime: {formatHours(run.without.downtimeHours)}</p>
          </div>
          <div>
            <p className="font-medium text-green-ink">With adaptation</p>
            <p>Risk: {run.with.riskScore} / 100</p>
            <p>Loss: {formatInrLakhs(run.with.estimatedLossInr)}</p>
            <p>Downtime: {formatHours(run.with.downtimeHours)}</p>
          </div>
        </div>
        <ProvenanceBadge kind="modelled" showDescription className="mt-3" />
      </ReportSection>

      <ReportSection index={7} title="Estimated avoided loss">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="border border-border p-4">
            <p className="font-serif text-2xl text-navy">{formatInrLakhs(run.avoidedLossInr)}</p>
            <p className="text-xs text-text-muted">estimated avoided loss</p>
          </div>
          <div className="border border-border p-4">
            <p className="font-serif text-2xl text-navy">{formatPercent(run.lossReductionPct)}</p>
            <p className="text-xs text-text-muted">illustrative loss reduction</p>
          </div>
          <div className="border border-border p-4">
            <p className="font-serif text-2xl text-navy">{formatHours(run.downtimeAvoidedHours)}</p>
            <p className="text-xs text-text-muted">downtime avoided</p>
          </div>
        </div>
      </ReportSection>

      <ReportSection index={8} title="Evidence confidence">
        <div className="mb-4 flex items-center gap-3">
          <Badge variant="outline">Evidence confidence: {run.evidenceConfidence} / 100</Badge>
          <Badge variant="amber">Illustrative evidence score</Badge>
        </div>
        <EvidenceChain items={evidence} msmeName={msme.name} />
      </ReportSection>

      <ReportSection index={9} title="Recommended lender actions">
        <ol className="flex flex-col gap-2 text-sm">
          {SUGGESTED_ACTIONS.map((a, i) => (
            <li key={a}>
              {i + 1}. {a}
            </li>
          ))}
        </ol>
        <p className="mt-4 border-t border-border pt-4 text-sm font-medium text-navy">
          Decision support, not autonomous credit approval.
        </p>
      </ReportSection>

      <footer className="border-t border-border pt-6 text-xs text-text-muted">
        CLIMASCORE — Team DASK, IIT Kharagpur — SANKALP by Satin Finserv, Climate Tech 2026. This report
        contains illustrative and modelled figures for prototype demonstration; it does not constitute a credit
        decision or a verified loss assessment.
      </footer>
    </div>
  );
}

function ReportSection({ index, title, children }: { index: number; title: string; children: ReactNode }) {
  return (
    <section className="break-inside-avoid border border-border bg-white p-6">
      <h2 className="mb-4 font-serif text-xl text-navy">
        {index}. {title}
      </h2>
      {children}
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-text-muted">{label}</dt>
      <dd className="text-text">{value}</dd>
    </div>
  );
}
