/**
 * Domain types shared across the CLIMASCORE frontend.
 * Mirrors the data model in spec §20 and the API contract in spec §21
 * (mounted under /api/v1 rather than bare /api — see lib/api.ts).
 */

/** How a data point was produced — drives which ProvenanceBadge variant to show (spec §25). */
export type ProvenanceKind = "observed" | "modelled" | "synthetic";

export type RiskBand = "Low" | "Moderate" | "High" | "Severe";

export interface HazardScores {
  flood: number;
  heat: number;
  cyclone: number;
  drought: number;
}

export interface RiskBreakdown {
  hazard: number;
  exposure: number;
  vulnerability: number;
  businessCriticality: number;
  overall: number;
  band: RiskBand;
}

export interface Msme {
  id: string;
  name: string;
  type: string; // e.g. "Illustrative MSME"
  sector: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  annualRevenueInr: number;
  inventoryValueInr: number;
  equipmentValueInr: number;
  facilityAreaSqft: number;
  employees: number;
  baselineRiskScore: number;
  riskBand: RiskBand;
  riskBreakdown: RiskBreakdown;
  hazardExposure: HazardScores;
  operationalSensitivity: string;
  provenance: ProvenanceKind; // "synthetic" for the seed borrower
}

export type AdaptationHazard = "Flood" | "Extreme Heat" | "General";

export type AdaptationStatus = "active" | "inactive" | "proposed";

export interface AdaptationMeasure {
  id: string;
  msmeId: string;
  name: string;
  type:
    | "raised_equipment"
    | "flood_barrier"
    | "improved_drainage"
    | "cooling_protection"
    | "backup_power"
    | "protected_inventory";
  hazard: AdaptationHazard;
  status: AdaptationStatus;
  estimatedVulnerabilityReduction: number; // 0-1
  evidence: string;
  date: string;
  costInr?: number;
  provenance: ProvenanceKind;
}

export type EventType = "Flood" | "Extreme Heat";
export type Severity = "Low" | "Moderate" | "High" | "Severe";

export interface ClimateEvent {
  id: string;
  type: EventType;
  location: string;
  date: string;
  endDate?: string;
  severity: Severity;
  sourceType: string;
  source: string;
  sourceUrl: string;
  description: string;
  affectedMsmeIds: string[];
  provenance: ProvenanceKind; // "observed" — reported external event evidence
}

export interface CounterfactualScenario {
  riskScore: number;
  estimatedLossInr: number;
  estimatedLossRangeInr: [number, number];
  downtimeHours: number;
  downtimeRangeHours: [number, number];
}

export interface CounterfactualRun {
  id: string;
  msmeId: string;
  eventId: string;
  adaptationIds: string[];
  without: CounterfactualScenario;
  with: CounterfactualScenario;
  avoidedLossInr: number;
  lossReductionPct: number;
  downtimeAvoidedHours: number;
  evidenceConfidence: number;
  provenance: ProvenanceKind; // "modelled"
}

export type EvidenceQuality = "verified" | "reported" | "modelled" | "missing";

export interface EvidenceItem {
  id: string;
  msmeId: string;
  eventId?: string;
  stage:
    | "Climate Event"
    | "Hazard Data"
    | "Borrower Location"
    | "Asset / Operations"
    | "Adaptation Record"
    | "Modelled Impact";
  label: string;
  source: string;
  sourceUrl?: string;
  timestamp: string;
  dataType: string;
  quality: EvidenceQuality;
  description: string;
  provenance: ProvenanceKind;
}

export interface PortfolioSummary {
  totalBorrowers: number;
  highRiskBorrowers: number;
  activeEventExposure: number;
  adaptationCoveragePct: number;
  estimatedExposureInr: number;
}

export interface LenderAction {
  id: string;
  label: string;
  detail: string;
}
