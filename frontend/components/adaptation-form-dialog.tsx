"use client";

import * as React from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";
import type { AdaptationHazard, AdaptationMeasure } from "@/types/domain";

const TYPE_OPTIONS: { value: AdaptationMeasure["type"]; label: string; hazard: AdaptationHazard }[] = [
  { value: "raised_equipment", label: "Raised Equipment", hazard: "Flood" },
  { value: "flood_barrier", label: "Flood Barrier", hazard: "Flood" },
  { value: "improved_drainage", label: "Improved Drainage", hazard: "Flood" },
  { value: "cooling_protection", label: "Cooling / Heat Protection", hazard: "Extreme Heat" },
  { value: "backup_power", label: "Backup Power", hazard: "General" },
  { value: "protected_inventory", label: "Protected Inventory Storage", hazard: "Flood" },
];

export interface AdaptationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  msmeId: string;
  initial?: AdaptationMeasure;
  onSubmit: (measure: AdaptationMeasure) => void;
}

/** Add/edit dialog for adaptation measures (spec §17 Screen 4 — "allow add/edit/activate/deactivate"). */
export function AdaptationFormDialog({ open, onOpenChange, msmeId, initial, onSubmit }: AdaptationFormDialogProps) {
  const [type, setType] = React.useState<AdaptationMeasure["type"]>(initial?.type ?? "raised_equipment");
  const [evidence, setEvidence] = React.useState(initial?.evidence ?? "");
  const [reduction, setReduction] = React.useState(String(Math.round((initial?.estimatedVulnerabilityReduction ?? 0.15) * 100)));

  // Re-seed the form fields when the dialog transitions to open, per React's
  // "adjusting state when a prop changes" pattern (setting state during render,
  // guarded by comparing against a tracked previous value) rather than an
  // effect — this avoids the cascading-render an effect-based reset causes.
  const [prevOpen, setPrevOpen] = React.useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setType(initial?.type ?? "raised_equipment");
      setEvidence(initial?.evidence ?? "");
      setReduction(String(Math.round((initial?.estimatedVulnerabilityReduction ?? 0.15) * 100)));
    }
  }

  const selectedOption = TYPE_OPTIONS.find((o) => o.value === type) ?? TYPE_OPTIONS[0];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const measure: AdaptationMeasure = {
      id: initial?.id ?? `ADAPT-${msmeId}-${type}-${Date.now()}`,
      msmeId,
      name: selectedOption.label,
      type,
      hazard: selectedOption.hazard,
      status: initial?.status ?? "proposed",
      estimatedVulnerabilityReduction: Math.min(Math.max(Number(reduction) / 100, 0), 0.6),
      evidence: evidence || "Evidence to be attached.",
      date: initial?.date ?? new Date().toISOString().slice(0, 10),
      provenance: "synthetic",
    };
    onSubmit(measure);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? "Edit adaptation measure" : "Add adaptation measure"}</DialogTitle>
          <DialogDescription>
            Model assumptions in this prototype — estimated effects are illustrative, not empirically validated.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-navy">Measure</span>
            <select
              className="border border-border bg-white px-3 py-2 text-sm"
              value={type}
              onChange={(e) => setType(e.target.value as AdaptationMeasure["type"])}
            >
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-navy">Estimated vulnerability reduction (%)</span>
            <input
              type="number"
              min={0}
              max={60}
              className="border border-border bg-white px-3 py-2 text-sm"
              value={reduction}
              onChange={(e) => setReduction(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-navy">Evidence</span>
            <textarea
              className="border border-border bg-white px-3 py-2 text-sm"
              rows={2}
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              placeholder="e.g. Site photos and vendor invoice on file"
            />
          </label>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{initial ? "Save changes" : "Add measure"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
