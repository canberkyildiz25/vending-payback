import { describe, expect, it } from "vitest";
import { breakEvenUplift, costOfDelay } from "./insights";
import { computePayback } from "./payback";
import { DEFAULT_FLEET, DEFAULT_SCENARIOS } from "./scenarios";

describe("breakEvenUplift", () => {
  it("solves the reference case", () => {
    // 60,000 × (0.4 − 0.0125) = 23,250 per unit; (416.67 + 650) ÷ 23,250 = 4.59 %, rounded up
    expect(breakEvenUplift(DEFAULT_FLEET, 50)).toEqual({ kind: "needs", upliftPct: 4.6 });
  });

  it("really does pay back within three years at the returned figure", () => {
    const be = breakEvenUplift(DEFAULT_FLEET, 50);
    if (be.kind !== "needs") throw new Error("expected a figure");
    const at = computePayback(DEFAULT_FLEET, { upliftPct: be.upliftPct, cardSharePct: 50 });
    const below = computePayback(DEFAULT_FLEET, { upliftPct: be.upliftPct - 0.2, cardSharePct: 50 });
    expect(at.paybackMonths).toBeLessThanOrEqual(36);
    expect(below.paybackMonths).toBeGreaterThan(36);
  });

  it("says when no growth is needed", () => {
    expect(breakEvenUplift({ ...DEFAULT_FLEET, handlingSavedPerMachine: 100 }, 50)).toEqual({ kind: "no-growth-needed" });
  });

  it("says when no growth can help", () => {
    expect(breakEvenUplift({ ...DEFAULT_FLEET, marginPct: 1, feePct: 10 }, 50)).toEqual({ kind: "impossible" });
  });
});

describe("costOfDelay", () => {
  it("is the net gain forgone", () => {
    expect(costOfDelay(DEFAULT_FLEET, DEFAULT_SCENARIOS.realistic, 6)).toBeCloseTo(17025, 6);
  });
  it("is zero when the readers lose money", () => {
    expect(costOfDelay(DEFAULT_FLEET, { upliftPct: 0, cardSharePct: 100 }, 6)).toBe(0);
  });
});
