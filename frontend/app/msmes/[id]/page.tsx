import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, ProvenanceBadge } from "@/components/ui";
import { RiskGauge } from "@/components/ui/risk-gauge";
import { RiskBreakdownList } from "@/components/risk-breakdown";
import { fetchEvents, fetchMsme } from "@/lib/api";
import { formatInr, formatInrLakhs } from "@/lib/formatting";

export const dynamic = "force-dynamic";

export default async function MsmeProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [msme, events] = await Promise.all([fetchMsme(id), fetchEvents()]);
  if (!msme) notFound();

  const relevantEvents = events.filter((e) => e.affectedMsmeIds.includes(msme.id));

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-3 border-b border-border pb-8">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="outline">{msme.type}</Badge>
          <ProvenanceBadge kind={msme.provenance} />
        </div>
        <h1 className="font-serif text-4xl text-navy">{msme.name}</h1>
        <p className="text-text-muted">
          {msme.city}, {msme.state}, {msme.country} · {msme.sector}
        </p>
        <nav aria-label="MSME sections" className="flex flex-wrap gap-4 pt-2 text-sm font-medium">
          <Link href={`/msmes/${msme.id}/exposure`} className="text-blue hover:text-blue-dark">
            Climate exposure map →
          </Link>
          <Link href={`/msmes/${msme.id}/adaptation`} className="text-blue hover:text-blue-dark">
            Adaptation plan →
          </Link>
          <Link href={`/decision/${msme.id}`} className="text-blue hover:text-blue-dark">
            Lender action →
          </Link>
          <Link href={`/reports/${msme.id}`} className="text-blue hover:text-blue-dark">
            Full report →
          </Link>
        </nav>
      </header>

      <section aria-label="Overall climate risk" className="grid grid-cols-1 gap-8 border border-border bg-white p-8 lg:grid-cols-2">
        <RiskGauge score={msme.baselineRiskScore} band={msme.riskBand} size="large" showMethodologyLink />
        <RiskBreakdownList breakdown={msme.riskBreakdown} />
      </section>

      <section aria-label="Hazard exposure" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Flood exposure" value={`${msme.hazardExposure.flood} / 100`} />
        <StatCard label="Heat exposure" value={`${msme.hazardExposure.heat} / 100`} />
      </section>

      <section aria-label="Assets and operations" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Equipment value" value={formatInrLakhs(msme.equipmentValueInr)} detail={formatInr(msme.equipmentValueInr)} />
        <StatCard label="Inventory value" value={formatInrLakhs(msme.inventoryValueInr)} detail={formatInr(msme.inventoryValueInr)} />
        <StatCard label="Annual revenue" value={formatInrLakhs(msme.annualRevenueInr)} detail={formatInr(msme.annualRevenueInr)} />
        <StatCard label="Facility area" value={`${msme.facilityAreaSqft.toLocaleString("en-IN")} sq ft`} />
        <StatCard label="Employees" value={String(msme.employees)} />
        <ProvenanceBadge kind={msme.provenance} showDescription className="col-span-1 sm:col-span-1" />
      </section>

      <section aria-label="Operational sensitivity" className="border border-border bg-light-blue p-6">
        <h2 className="mb-2 font-serif text-lg text-navy">Operational sensitivity</h2>
        <p className="text-sm text-text">{msme.operationalSensitivity}</p>
      </section>

      {relevantEvents.length > 0 && (
        <section aria-label="Related climate events">
          <h2 className="mb-3 font-serif text-lg text-navy">Related climate events</h2>
          <ul className="flex flex-col gap-2">
            {relevantEvents.map((event) => (
              <li key={event.id}>
                <Link
                  href={`/risk-analysis/${msme.id}/${event.id}`}
                  className="flex items-center justify-between border border-border bg-white p-4 text-sm hover:border-blue"
                >
                  <span>
                    {event.location.split(",")[0]} {event.type} — {event.date}
                  </span>
                  <span className="font-medium text-blue">Run counterfactual →</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function StatCard({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="border border-border bg-white p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-text-muted">{label}</p>
      <p className="font-serif text-2xl text-navy">{value}</p>
      {detail && <p className="text-xs text-text-muted">{detail}</p>}
    </div>
  );
}
