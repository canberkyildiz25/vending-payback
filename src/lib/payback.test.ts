import { describe, expect, it } from "vitest";
import { computePayback, cumulativeSeries, verdictFor } from "./payback";
import { DEFAULT_FLEET, DEFAULT_SCENARIOS } from "./scenarios";
import { PRESETS, PRESET_IDS } from "./presets";

describe("computePayback", () => {
  it("matches the v1 reference case", () => {
    const r = computePayback(
      {
        machines: 50,
        dailySalesPerMachine: 40,
        sellingDays: 30,
        marginPct: 40,
        handlingSavedPerMachine: 10,
        readerPrice: 300,
        monthlyServiceFee: 8,
        feePct: 2.5,
      },
      { upliftPct: 15, cardSharePct: 50 },
    );
    expect(r.monthlySalesToday).toBe(60000);
    expect(r.extraGrossProfit).toBeCloseTo(3600, 6);
    expect(r.cashHandlingSaved).toBe(500);
    expect(r.processingFees).toBeCloseTo(862.5, 6);
    expect(r.serviceFees).toBe(400);
    expect(r.netMonthly).toBeCloseTo(2837.5, 6);
    expect(r.upfront).toBe(15000);
    expect(r.paybackMonths.toFixed(2)).toBe("5.29");
    expect(r.net3Years).toBeCloseTo(87150, 6);
  });

  it("keeps the realistic default scenario equal to v1", () => {
    expect(computePayback(DEFAULT_FLEET, DEFAULT_SCENARIOS.realistic).netMonthly).toBeCloseTo(2837.5, 6);
  });

  it("counts only the margin on extra sales as gain", () => {
    const r = computePayback(
      { ...DEFAULT_FLEET, handlingSavedPerMachine: 0, monthlyServiceFee: 0, feePct: 0, marginPct: 30 },
      { upliftPct: 10, cardSharePct: 50 },
    );
    expect(r.netMonthly).toBeCloseTo(60000 * 0.1 * 0.3, 6);
  });

  it("returns Infinity payback when the net gain is zero or negative", () => {
    const r = computePayback(DEFAULT_FLEET, { upliftPct: 0, cardSharePct: 100 });
    expect(r.netMonthly).toBeLessThan(0);
    expect(r.paybackMonths).toBe(Infinity);
    expect(verdictFor(r.paybackMonths)).toBe("never");

    const zero = computePayback({ ...DEFAULT_FLEET, machines: 0 }, DEFAULT_SCENARIOS.realistic);
    expect(zero.netMonthly).toBe(0);
    expect(zero.paybackMonths).toBe(Infinity);
  });

  it("treats empty and negative inputs as zero", () => {
    const r = computePayback({ ...DEFAULT_FLEET, readerPrice: NaN, monthlyServiceFee: -5 }, DEFAULT_SCENARIOS.realistic);
    expect(r.upfront).toBe(0);
    expect(r.serviceFees).toBe(0);
  });

  it("builds a 36-month cumulative series that crosses zero at payback", () => {
    const r = computePayback(DEFAULT_FLEET, DEFAULT_SCENARIOS.realistic);
    const s = cumulativeSeries(r);
    expect(s).toHaveLength(37);
    expect(s[0]).toBe(-15000);
    expect(s[36]).toBeCloseTo(87150, 6);
    expect(s[5]).toBeLessThan(0);
    expect(s[6]).toBeGreaterThan(0);
  });
});

describe("verdictFor", () => {
  it.each([
    [0.5, "first-month"],
    [12, "first-year"],
    [12.1, "three-years"],
    [36, "three-years"],
    [36.1, "beyond"],
  ] as const)("%s months → %s", (m, v) => expect(verdictFor(m)).toBe(v));
});

describe("presets", () => {
  it("order the scenarios conservative ≤ realistic ≤ optimistic", () => {
    for (const id of PRESET_IDS) {
      const { conservative: c, realistic: r, optimistic: o } = PRESETS[id].scenarios;
      expect(c.upliftPct).toBeLessThanOrEqual(r.upliftPct);
      expect(r.upliftPct).toBeLessThanOrEqual(o.upliftPct);
    }
  });
});
