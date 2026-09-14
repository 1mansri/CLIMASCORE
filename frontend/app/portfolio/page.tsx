"use client";

import * as React from "react";
import { MsmeCard } from "@/components/msme-card";
import { MsmeMap } from "@/components/msme-map";
import { RiskDistributionChart } from "@/components/risk-distribution-chart";
import { fetchAdaptations, fetchEvents, fetchMsmes, fetchPortfolioSummary } from "@/lib/api";
import { formatInrLakhs, formatPercent } from "@/lib/formatting";
import type { AdaptationMeasure, ClimateEvent, Msme, PortfolioSummary, RiskBand } from "@/types/domain";

export default function PortfolioPage() {
  const [msmes, setMsmes] = React.useState<Msme[]>([]);
  const [events, setEvents] = React.useState<ClimateEvent[]>([]);
  const [adaptations, setAdaptations] = React.useState<Record<string, AdaptationMeasure[]>>({});
  const [summary, setSummary] = React.useState<PortfolioSummary | null>(null);

  const [city, setCity] = React.useState("all");
  const [sector, setSector] = React.useState("all");
  const [hazard, setHazard] = React.useState("all");
  const [riskBand, setRiskBand] = React.useState<RiskBand | "all">("all");
  const [adaptationStatus, setAdaptationStatus] = React.useState<"all" | "with" | "without">("all");

  React.useEffect(() => {
    fetchMsmes().then(async (list) => {
      setMsmes(list);
      const entries = await Promise.all(list.map(async (m) => [m.id, await fetchAdaptations(m.id)] as const));
      setAdaptations(Object.fromEntries(entries));
    });
    fetchEvents().then(setEvents);
    fetchPortfolioSummary().then(setSummary);
  }, []);

  const cities = React.useMemo(() => Array.from(new Set(msmes.map((m) => m.city))), [msmes]);
  const sectors = React.useMemo(() => Array.from(new Set(msmes.map((m) => m.sector))), [msmes]);
  const hazards = React.useMemo(() => Array.from(new Set(events.map((e) => e.type))), [events]);

  const filtered = msmes.filter((m) => {
    if (city !== "all" && m.city !== city) return false;
    if (sector !== "all" && m.sector !== sector) return false;
    if (riskBand !== "all" && m.riskBand !== riskBand) return false;
    if (hazard !== "all") {
      const exposedToHazard = events.some((e) => e.type === hazard && e.affectedMsmeIds.includes(m.id));
      if (!exposedToHazard) return false;
    }
    if (adaptationStatus !== "all") {
      const hasActive = (adaptations[m.id] ?? []).some((a) => a.status === "active");
      if (adaptationStatus === "with" && !hasActive) return false;
      if (adaptationStatus === "without" && hasActive) return false;
    }
    return true;
  });

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-dark">Portfolio</p>
        <h1 className="font-serif text-4xl text-navy">Portfolio climate-risk monitoring</h1>
      </header>

      {summary && (
        <section aria-label="Portfolio totals" className="grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-5">
          <Tile label="Total borrowers" value={String(summary.totalBorrowers)} />
          <Tile label="High-risk borrowers" value={String(summary.highRiskBorrowers)} tone="red" />
          <Tile label="Event exposure" value={String(summary.activeEventExposure)} />
          <Tile label="Adaptation coverage" value={formatPercent(summary.adaptationCoveragePct)} tone="green" />
          <Tile label="Estimated exposure" value={formatInrLakhs(summary.estimatedExposureInr)} />
        </section>
      )}

      <section aria-label="Filters" className="flex flex-wrap gap-4 border border-border bg-white p-5">
        <Filter label="City" value={city} onChange={setCity} options={["all", ...cities]} />
        <Filter label="Sector" value={sector} onChange={setSector} options={["all", ...sectors]} />
        <Filter label="Hazard" value={hazard} onChange={setHazard} options={["all", ...hazards]} />
        <Filter
          label="Risk band"
          value={riskBand}
          onChange={(v) => setRiskBand(v as RiskBand | "all")}
          options={["all", "High", "Moderate", "Low", "Severe"]}
        />
        <Filter
          label="Adaptation status"
          value={adaptationStatus}
          onChange={(v) => setAdaptationStatus(v as "all" | "with" | "without")}
          options={["all", "with", "without"]}
          labels={{ all: "All", with: "Has active adaptation", without: "No active adaptation" }}
        />
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <section aria-label="Portfolio map" className="lg:col-span-2">
          <MsmeMap msmes={filtered} zoom={10} />
        </section>
        <section aria-label="Risk band distribution" className="border border-border bg-white p-5">
          <h2 className="mb-3 font-serif text-lg text-navy">Risk band distribution</h2>
          <RiskDistributionChart msmes={filtered} />
        </section>
      </div>

      <section aria-label="Filtered borrowers">
        <p className="mb-3 text-sm text-text-muted">{filtered.length} of {msmes.length} borrowers shown</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => (
            <MsmeCard key={m.id} msme={m} />
          ))}
        </div>
      </section>
    </div>
  );
}

function Tile({ label, value, tone }: { label: string; value: string; tone?: "red" | "green" }) {
  return (
    <div className="flex flex-col gap-1 bg-white p-5">
      <span className="text-xs font-medium uppercase tracking-wide text-text-muted">{label}</span>
      <span className={`font-serif text-2xl ${tone === "red" ? "text-red-ink" : tone === "green" ? "text-green-ink" : "text-navy"}`}>
        {value}
      </span>
    </div>
  );
}

function Filter({
  label,
  value,
  onChange,
  options,
  labels,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  labels?: Record<string, string>;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-xs font-medium uppercase tracking-wide text-text-muted">{label}</span>
      <select
        className="border border-border bg-white px-3 py-1.5 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {labels?.[o] ?? (o === "all" ? "All" : o)}
          </option>
        ))}
      </select>
    </label>
  );
}
