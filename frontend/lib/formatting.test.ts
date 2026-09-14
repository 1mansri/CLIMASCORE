import { describe, expect, it } from "vitest";
import { fallbackRange, formatInrLakhs, formatPercent, riskBandForScore } from "./formatting";

describe("formatInrLakhs", () => {
  it("formats whole-lakh values", () => {
    expect(formatInrLakhs(980_000)).toBe("₹9.8L");
    expect(formatInrLakhs(310_000)).toBe("₹3.1L");
  });

  it("formats the derived avoided-loss figure from spec §14", () => {
    expect(formatInrLakhs(670_000)).toBe("₹6.7L");
  });

  it("respects a custom fraction-digit count", () => {
    expect(formatInrLakhs(1_500_000, 0)).toBe("₹15L");
  });
});

describe("riskBandForScore", () => {
  it("bands the seed baseline (78) as High", () => {
    expect(riskBandForScore(78)).toBe("High");
  });

  it("bands the seed adapted score (31) as Moderate", () => {
    expect(riskBandForScore(31)).toBe("Moderate");
  });

  it("bands low scores as Low", () => {
    expect(riskBandForScore(10)).toBe("Low");
  });
});

describe("formatPercent", () => {
  it("rounds the spec's illustrative loss-reduction example to 68%", () => {
    // 6.7L / 9.8L ≈ 68.37% → display 68% (spec §27).
    expect(formatPercent((670_000 / 980_000) * 100)).toBe("68%");
  });
});

describe("fallbackRange", () => {
  it("produces a symmetric ±15% band by default", () => {
    const [low, high] = fallbackRange(1000);
    expect(low).toBeCloseTo(850);
    expect(high).toBeCloseTo(1150);
  });
});
