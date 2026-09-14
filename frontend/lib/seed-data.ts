import type { AdaptationMeasure, ClimateEvent, EvidenceItem, Msme, PortfolioSummary } from "@/types/domain";
import msmesJson from "./seed/msmes.json";
import eventsJson from "./seed/events.json";
import adaptationsJson from "./seed/adaptations.json";
import evidenceJson from "./seed/evidence.json";

/**
 * Bundled seed data mirroring the backend's data/seed/*.json shape (spec §23).
 * This is the offline fallback used by lib/api.ts whenever the FastAPI backend
 * is unreachable, and is also what "Load Demo Scenario" resets local state to
 * (spec §22). All figures are synthetic/illustrative — see ProvenanceBadge.
 */
export const SEED_MSMES = msmesJson as Msme[];
export const SEED_EVENTS = eventsJson as ClimateEvent[];
export const SEED_ADAPTATIONS = adaptationsJson as AdaptationMeasure[];
export const SEED_EVIDENCE = evidenceJson as EvidenceItem[];

export const PRIMARY_MSME_ID = "MSME-SURAT-001";
export const PRIMARY_EVENT_ID = "EVENT-SURAT-FLOOD-2026";

export function findMsme(id: string): Msme | undefined {
  return SEED_MSMES.find((m) => m.id === id);
}

export function findEvent(id: string): ClimateEvent | undefined {
  return SEED_EVENTS.find((e) => e.id === id);
}

export function adaptationsForMsme(msmeId: string): AdaptationMeasure[] {
  return SEED_ADAPTATIONS.filter((a) => a.msmeId === msmeId);
}

export function evidenceFor(msmeId: string, eventId?: string): EvidenceItem[] {
  return SEED_EVIDENCE.filter((e) => e.msmeId === msmeId && (!eventId || e.eventId === eventId));
}

export function eventsForMsme(msmeId: string): ClimateEvent[] {
  return SEED_EVENTS.filter((e) => e.affectedMsmeIds.includes(msmeId));
}

export function computePortfolioSummary(): PortfolioSummary {
  const totalBorrowers = SEED_MSMES.length;
  const highRiskBorrowers = SEED_MSMES.filter((m) => m.riskBand === "High" || m.riskBand === "Severe").length;
  const activeEventExposure = SEED_EVENTS.length;
  const withActiveAdaptation = new Set(
    SEED_ADAPTATIONS.filter((a) => a.status === "active").map((a) => a.msmeId),
  ).size;
  const adaptationCoveragePct = Math.round((withActiveAdaptation / totalBorrowers) * 100);
  const estimatedExposureInr = SEED_MSMES.reduce(
    (acc, m) => acc + m.equipmentValueInr + m.inventoryValueInr,
    0,
  );

  return {
    totalBorrowers,
    highRiskBorrowers,
    activeEventExposure,
    adaptationCoveragePct,
    estimatedExposureInr,
  };
}
