import Link from "next/link";
import { Badge, Button } from "@/components/ui";
import { MsmeCard } from "@/components/msme-card";
import { MsmeMap } from "@/components/msme-map";
import { fetchAdaptations, fetchEvents, fetchMsmes, fetchPortfolioSummary } from "@/lib/api";
import { formatInrLakhs, formatPercent } from "@/lib/formatting";
import { PRIMARY_MSME_ID } from "@/lib/seed-data";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [msmes, events, summary, adaptations] = await Promise.all([
    fetchMsmes(),
    fetchEvents(),
    fetchPortfolioSummary(),
    fetchAdaptations(PRIMARY_MSME_ID),
  ]);

  const highRisk = msmes.filter((m) => m.riskBand === "High" || m.riskBand === "Severe");
  const activeAdaptations = adaptations.filter((a) => a.status === "active");

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-10 sm:px-6">
      <section className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-dark">Lender dashboard</p>
        <h1 className="font-serif text-4xl text-navy">Portfolio climate-risk overview</h1>
        <p className="max-w-2xl text-text-muted">
          Borrower-level climate exposure, financed adaptation and event-driven resilience signals for the Surat
          textile cluster demo portfolio.
        </p>
      </section>

      <section aria-label="Portfolio summary" className="grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-4">
        <SummaryTile label="Monitored MSMEs" value={String(summary.totalBorrowers)} />
        <SummaryTile label="High-risk MSMEs" value={String(summary.highRiskBorrowers)} tone="red" />
        <SummaryTile label="Active climate events" value={String(summary.activeEventExposure)} />
        <SummaryTile label="Adaptation coverage" value={formatPercent(summary.adaptationCoveragePct)} tone="green" />
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-serif text-xl text-navy">Portfolio exposure map</h2>
            <span className="text-xs text-text-muted">Surat Textile Works highlighted</span>
          </div>
          <MsmeMap msmes={msmes} highlightId={PRIMARY_MSME_ID} zoom={11} />
          <p className="mt-3 text-xs text-text-muted">
            Estimated portfolio exposure (equipment + inventory value across monitored borrowers):{" "}
            <span className="font-medium text-navy">{formatInrLakhs(summary.estimatedExposureInr)}</span> —
            illustrative model output, not observed borrower data.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-serif text-xl text-navy">Active climate events</h2>
          <div className="flex flex-col gap-3">
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/risk-analysis/${PRIMARY_MSME_ID}/${event.id}`}
                className="block border border-border bg-white p-4 transition-colors hover:border-blue"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-navy">
                    {event.location.split(",")[0]} {event.type}
                  </span>
                  <Badge variant="red">{event.severity}</Badge>
                </div>
                <p className="mt-1 text-xs text-text-muted">{event.source}</p>
              </Link>
            ))}
          </div>

          <h2 className="mb-3 mt-8 font-serif text-xl text-navy">Adaptation interventions</h2>
          <div className="border border-border bg-white p-4">
            <p className="font-serif text-3xl text-navy">{activeAdaptations.length}</p>
            <p className="text-sm text-text-muted">active measures financed for Surat Textile Works</p>
            <Button asChild variant="link" size="sm" className="mt-2 h-auto p-0">
              <Link href={`/msmes/${PRIMARY_MSME_ID}/adaptation`}>View adaptation plan →</Link>
            </Button>
          </div>
        </section>
      </div>

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-serif text-xl text-navy">High-risk MSMEs</h2>
          <Link href="/portfolio" className="text-sm font-medium text-blue hover:text-blue-dark">
            View full portfolio →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {highRisk.map((m) => (
            <MsmeCard key={m.id} msme={m} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-serif text-xl text-navy">All monitored MSMEs</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {msmes
            .filter((m) => !highRisk.includes(m))
            .map((m) => (
              <MsmeCard key={m.id} msme={m} />
            ))}
        </div>
      </section>
    </div>
  );
}

function SummaryTile({ label, value, tone }: { label: string; value: string; tone?: "red" | "green" }) {
  return (
    <div className="flex flex-col gap-1 bg-white p-5">
      <span className="text-xs font-medium uppercase tracking-wide text-text-muted">{label}</span>
      <span
        className={`font-serif text-3xl ${tone === "red" ? "text-red-ink" : tone === "green" ? "text-green-ink" : "text-navy"}`}
      >
        {value}
      </span>
    </div>
  );
}
