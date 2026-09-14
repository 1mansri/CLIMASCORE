import type { AdaptationMeasure, ClimateEvent, CounterfactualScenario, Msme } from "@/types/domain";
import { fallbackRange } from "./formatting";

/**
 * Transparent, deterministic illustrative loss model (spec §13).
 * All coefficients live here, in one place, rather than scattered through UI code.
 *
 * Total Estimated Loss = Asset Damage + Inventory Damage + Downtime Loss + Recovery Cost
 *   Asset Damage      = Equipment Value x Damage Rate
 *   Inventory Damage  = Inventory Value x Damage Rate
 *   Downtime Loss     = Daily Revenue x Downtime Days x Operational Loss Factor
 *   Recovery Cost     = Recovery Cost % x (Asset Damage + Inventory Damage)
 *
 * This is a deterministic transparent function, not a trained ML model (spec §19).
 * The rate constants are calibrated against the canonical demo scenario (Surat
 * Textile Works / Surat Flood 2026, with raised equipment + flood barrier +
 * improved drainage active) so it reproduces the illustrative figures published
 * in spec §14: without adaptation ₹9.8L / 39h, with adaptation ₹3.1L / 11h.
 */
export const LOSS_MODEL_CONFIG = {
  /** Damage rate at full (unmitigated) vulnerability and hazard intensity. */
  maxAssetDamageRate: 0.2394,
  maxInventoryDamageRate: 0.1764,
  /** Recovery cost as a percentage of combined physical (asset + inventory) damage. */
  recoveryCostPct: 0.22,
  /** Operational loss factor applied to daily revenue during downtime. */
  operationalLossFactor: 0.7812,
  /** Baseline downtime in hours at full vulnerability, for a High-severity event. */
  maxDowntimeHours: 39,
  /** Curve exponents translating "% vulnerability reduced" into "% outcome reduced". */
  lossReductionExponent: 1.1,
  downtimeReductionExponent: 1.22,
  riskReductionExponent: 0.88,
  /** Cap on combined adaptation effectiveness so the model never implies zero risk. */
  maxVulnerabilityReduction: 0.85,
  /**
   * hazardFraction x vulnerabilityFraction of the canonical calibration scenario
   * (flood 0.84 x vulnerability 0.80). Downtime is normalized against this product
   * so maxDowntimeHours is reproduced exactly for that scenario at zero reduction.
   */
  calibrationHazardVulnerabilityProduct: 0.672,
  /** Loss figures are rounded to the nearest ₹10,000 (0.1 lakh) — an illustrative
   * model should not imply single-rupee precision, and this keeps the displayed
   * avoided-loss and percentage figures internally consistent with the two
   * scenario totals shown on screen. */
  lossRoundingInr: 10_000,
} as const;

export function totalVulnerabilityReduction(adaptations: AdaptationMeasure[]): number {
  const sum = adaptations
    .filter((a) => a.status === "active")
    .reduce((acc, a) => acc + a.estimatedVulnerabilityReduction, 0);
  return Math.min(sum, LOSS_MODEL_CONFIG.maxVulnerabilityReduction);
}

function hazardFractionForEvent(msme: Msme, event: ClimateEvent): number {
  return event.type === "Extreme Heat" ? msme.hazardExposure.heat / 100 : msme.hazardExposure.flood / 100;
}

interface ScenarioInputs {
  msme: Msme;
  event: ClimateEvent;
  /** 0 for "without adaptation"; the sum of active adaptation effects for "with adaptation". */
  vulnerabilityReduction: number;
}

function computeScenario({ msme, event, vulnerabilityReduction }: ScenarioInputs): CounterfactualScenario {
  const {
    maxAssetDamageRate,
    maxInventoryDamageRate,
    recoveryCostPct,
    operationalLossFactor,
    maxDowntimeHours,
    lossReductionExponent,
    downtimeReductionExponent,
    riskReductionExponent,
    calibrationHazardVulnerabilityProduct,
    lossRoundingInr,
  } = LOSS_MODEL_CONFIG;

  const hazardFraction = hazardFractionForEvent(msme, event);
  const vulnerabilityFraction = msme.riskBreakdown.vulnerability / 100;
  const hazardVulnerabilityProduct = hazardFraction * vulnerabilityFraction;

  const lossMultiplier = Math.pow(1 - vulnerabilityReduction, lossReductionExponent);
  const downtimeMultiplier = Math.pow(1 - vulnerabilityReduction, downtimeReductionExponent);
  const riskMultiplier = Math.pow(1 - vulnerabilityReduction, riskReductionExponent);

  const damageRateAsset = maxAssetDamageRate * hazardVulnerabilityProduct * lossMultiplier;
  const damageRateInventory = maxInventoryDamageRate * hazardVulnerabilityProduct * lossMultiplier;

  const assetDamage = msme.equipmentValueInr * damageRateAsset;
  const inventoryDamage = msme.inventoryValueInr * damageRateInventory;

  const downtimeHours =
    (maxDowntimeHours * hazardVulnerabilityProduct * downtimeMultiplier) / calibrationHazardVulnerabilityProduct;
  const downtimeDays = downtimeHours / 24;
  const dailyRevenue = msme.annualRevenueInr / 365;
  const downtimeLoss = dailyRevenue * downtimeDays * operationalLossFactor;

  const recoveryCost = recoveryCostPct * (assetDamage + inventoryDamage);

  const rawTotalLoss = assetDamage + inventoryDamage + downtimeLoss + recoveryCost;
  const totalLoss = Math.round(rawTotalLoss / lossRoundingInr) * lossRoundingInr;
  const roundedDowntimeHours = Math.round(downtimeHours);
  const riskScore = Math.round(msme.baselineRiskScore * riskMultiplier);

  return {
    riskScore,
    estimatedLossInr: totalLoss,
    estimatedLossRangeInr: fallbackRange(totalLoss).map(Math.round) as [number, number],
    downtimeHours: roundedDowntimeHours,
    downtimeRangeHours: fallbackRange(roundedDowntimeHours).map((v) => Math.round(v)) as [number, number],
  };
}

export function computeCounterfactualScenarios(
  msme: Msme,
  event: ClimateEvent,
  allAdaptations: AdaptationMeasure[],
  selectedAdaptationIds: string[],
): { without: CounterfactualScenario; with: CounterfactualScenario } {
  const selected = allAdaptations.filter((a) => selectedAdaptationIds.includes(a.id) && a.msmeId === msme.id);
  const reduction = totalVulnerabilityReduction(selected.map((a) => ({ ...a, status: "active" as const })));

  const without = computeScenario({ msme, event, vulnerabilityReduction: 0 });
  const withAdaptation = computeScenario({ msme, event, vulnerabilityReduction: reduction });

  return { without, with: withAdaptation };
}
