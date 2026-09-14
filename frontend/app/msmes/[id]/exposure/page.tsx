import { notFound } from "next/navigation";
import { ProvenanceBadge } from "@/components/ui";
import { MsmeMap } from "@/components/msme-map";
import { fetchMsme, fetchMsmes } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function ExposureMapPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [msme, allMsmes] = await Promise.all([fetchMsme(id), fetchMsmes()]);
  if (!msme) notFound();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-dark">Climate exposure map</p>
        <h1 className="font-serif text-3xl text-navy">{msme.name}</h1>
        <p className="text-text-muted">
          {msme.city}, {msme.state} — flood exposure, heat exposure and industrial cluster layers.
        </p>
        <ProvenanceBadge kind="synthetic" showDescription className="mt-1" />
      </header>

      <MsmeMap msmes={allMsmes} highlightId={msme.id} zoom={13} showHazardLayers heightClassName="h-[32rem]" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <LayerCard color="bg-blue" label="MSME location" description="Registered facility coordinates (illustrative)." />
        <LayerCard color="bg-risk-red" label="Flood / heat exposure" description="Illustrative hazard-exposure radius around the facility." />
        <LayerCard color="bg-navy" label="Industrial cluster" description="Illustrative surrounding manufacturing cluster extent." />
      </div>

      <p className="text-xs text-text-muted">
        No API key is required to view this map in demo mode. Tiles are served from OpenStreetMap by default;
        set NEXT_PUBLIC_MAPBOX_TOKEN to use Mapbox tiles instead — Mapbox is optional and never required.
      </p>
    </div>
  );
}

function LayerCard({ color, label, description }: { color: string; label: string; description: string }) {
  return (
    <div className="flex items-start gap-3 border border-border bg-white p-4">
      <span className={`mt-1 h-3 w-3 shrink-0 rounded-full ${color}`} aria-hidden="true" />
      <div>
        <p className="text-sm font-medium text-navy">{label}</p>
        <p className="text-xs text-text-muted">{description}</p>
      </div>
    </div>
  );
}
