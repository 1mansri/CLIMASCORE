"use client";

import * as React from "react";
import { use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { AdaptationCard } from "@/components/adaptation-card";
import { AdaptationFormDialog } from "@/components/adaptation-form-dialog";
import { fetchAdaptations, saveAdaptation, setAdaptationStatus } from "@/lib/api";
import type { AdaptationMeasure } from "@/types/domain";

export default function AdaptationPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: msmeId } = use(params);
  const [measures, setMeasures] = React.useState<AdaptationMeasure[] | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<AdaptationMeasure | undefined>(undefined);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    fetchAdaptations(msmeId).then(setMeasures);
  }, [msmeId]);

  React.useEffect(() => {
    load();
  }, [load]);

  async function handleToggle(measure: AdaptationMeasure) {
    setBusyId(measure.id);
    const nextStatus = measure.status === "active" ? "inactive" : "active";
    await setAdaptationStatus(measure.id, nextStatus);
    load();
    setBusyId(null);
  }

  async function handleSubmit(measure: AdaptationMeasure) {
    await saveAdaptation(measure);
    load();
  }

  const activeCount = measures?.filter((m) => m.status === "active").length ?? 0;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-dark">Adaptation plan</p>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-serif text-3xl text-navy">Financed adaptation measures</h1>
          <Button
            onClick={() => {
              setEditing(undefined);
              setDialogOpen(true);
            }}
          >
            Add measure
          </Button>
        </div>
        <p className="text-text-muted">
          {activeCount} measure{activeCount === 1 ? "" : "s"} currently active. Estimated model effects are
          illustrative assumptions in this prototype, not empirically validated outcomes (spec-mandated labelling).
        </p>
        <Link
          href={`/risk-analysis/${msmeId}/EVENT-SURAT-FLOOD-2026`}
          className="w-fit text-sm font-medium text-blue hover:text-blue-dark"
        >
          See how these measures change the modelled flood impact →
        </Link>
      </header>

      {measures === null ? (
        <p className="text-text-muted">Loading adaptation plan…</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {measures.map((measure) => (
            <AdaptationCard
              key={measure.id}
              measure={measure}
              busy={busyId === measure.id}
              onToggle={handleToggle}
              onEdit={(m) => {
                setEditing(m);
                setDialogOpen(true);
              }}
            />
          ))}
        </div>
      )}

      <AdaptationFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        msmeId={msmeId}
        initial={editing}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
