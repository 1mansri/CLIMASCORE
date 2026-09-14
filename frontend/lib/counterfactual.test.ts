import { describe, expect, it } from "vitest";
import { runCounterfactual } from "./counterfactual";
import { SEED_ADAPTATIONS, SEED_EVENTS, SEED_MSMES } from "./seed-data";

const msme = SEED_MSMES.find((m) => m.id === "MSME-SURAT-001")!;
const event = SEED_EVENTS.find((e) => e.id === "EVENT-SURAT-FLOOD-2026")!;
const defaultAdaptationIds = SEED_ADAPTATIONS.filter(
  (a) => a.msmeId === msme.id && a.status === "active",
).map((a) => a.id);

/**
 * Canonical demo scenario reproduces the illustrative figures published in
 * spec §14 / tested in spec §27: risk 78 -> 31, loss ₹9.8L -> ₹3.1L,
 * downtime 39h -> 11h, avoided loss ₹6.7L, ~68% reduction, 28h avoided.
 */
describe("runCounterfactual — canonical Surat Textile Works flood scenario", () => {
  const run = runCounterfactual(msme, event, SEED_ADAPTATIONS, defaultAdaptationIds);

  it("matches the without-adaptation baseline", () => {
    expect(run.without.riskScore).toBe(78);
    expect(run.without.estimatedLossInr).toBe(980_000);
    expect(run.without.downtimeHours).toBe(39);
  });

  it("matches the with-adaptation scenario", () => {
    expect(run.with.riskScore).toBe(31);
    expect(run.with.estimatedLossInr).toBe(310_000);
    expect(run.with.downtimeHours).toBe(11);
  });

  it("derives the resilience delta exactly as in spec §15/§27", () => {
    expect(run.avoidedLossInr).toBe(670_000);
    expect(Math.round(run.lossReductionPct)).toBe(68);
    expect(run.downtimeAvoidedHours).toBe(28);
  });

  it("keeps the climate event identical across both scenarios (counterfactual integrity, spec §27)", () => {
    const noAdaptationRun = runCounterfactual(msme, event, SEED_ADAPTATIONS, []);
    expect(noAdaptationRun.without.riskScore).toBe(run.without.riskScore);
    expect(noAdaptationRun.without.estimatedLossInr).toBe(run.without.estimatedLossInr);
  });

  it("reduces modelled loss as more adaptation measures are selected", () => {
    const oneMeasure = runCounterfactual(msme, event, SEED_ADAPTATIONS, [defaultAdaptationIds[0]]);
    expect(oneMeasure.with.estimatedLossInr).toBeGreaterThan(run.with.estimatedLossInr);
    expect(oneMeasure.with.estimatedLossInr).toBeLessThan(run.without.estimatedLossInr);
  });
});
