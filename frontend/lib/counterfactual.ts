import type { AdaptationMeasure, ClimateEvent, CounterfactualRun, Msme } from "@/types/domain";
import { computeCounterfactualScenarios } from "./loss-model";

/** Adaptations that are "active" by default for a borrower (used when no ?adaptations= param is present). */
export function defaultActiveAdaptationIds(adaptations: AdaptationMeasure[], msmeId: string): string[] {
  return adaptations.filter((a) => a.msmeId === msmeId && a.status === "active").map((a) => a.id);
}

/** Resolve a comma-separated list of adaptation `type` slugs (the shareable deep-link format) to ids. */
export function resolveAdaptationIdsFromTypes(
  adaptations: AdaptationMeasure[],
  msmeId: string,
  types: string[],
): string[] {
  const wanted = new Set(types);
  return adaptations.filter((a) => a.msmeId === msmeId && wanted.has(a.type)).map((a) => a.id);
}

export function adaptationTypesForIds(adaptations: AdaptationMeasure[], ids: string[]): string[] {
  const idSet = new Set(ids);
  return adaptations.filter((a) => idSet.has(a.id)).map((a) => a.type);
}

export function runCounterfactual(
  msme: Msme,
  event: ClimateEvent,
  allAdaptations: AdaptationMeasure[],
  selectedAdaptationIds: string[],
  evidenceConfidence = 82,
): CounterfactualRun {
  const { without, with: withAdaptation } = computeCounterfactualScenarios(
    msme,
    event,
    allAdaptations,
    selectedAdaptationIds,
  );

  const avoidedLossInr = without.estimatedLossInr - withAdaptation.estimatedLossInr;
  const lossReductionPct = without.estimatedLossInr === 0 ? 0 : (avoidedLossInr / without.estimatedLossInr) * 100;
  const downtimeAvoidedHours = without.downtimeHours - withAdaptation.downtimeHours;

  return {
    id: `CF-${msme.id}-${event.id}`,
    msmeId: msme.id,
    eventId: event.id,
    adaptationIds: selectedAdaptationIds,
    without,
    with: withAdaptation,
    avoidedLossInr,
    lossReductionPct,
    downtimeAvoidedHours,
    evidenceConfidence,
    provenance: "modelled",
  };
}
