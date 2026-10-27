import { describe, expect, it } from "vitest";
import { DEFAULT_STATE, fromSearchParams, stateFromPreset, toSearchParams } from "./state";
import { emailSummary } from "./summary";

describe("URL state", () => {
  it("round-trips a full state", () => {
    const s = stateFromPreset("gym", "£");
    s.fleet.machines = 12;
    s.fleet.feePct = 1.9;
    s.scenarios.optimistic.upliftPct = 33;
    s.selected = "optimistic";
    expect(fromSearchParams(toSearchParams(s))).toEqual(s);
  });

  it("falls back to example values for missing or broken params", () => {
    expect(fromSearchParams(new URLSearchParams())).toEqual(DEFAULT_STATE);
    const s = fromSearchParams(new URLSearchParams("loc=nope&m=-4&ds=abc&cur=XYZ&sel=wild&ru="));
    expect(s).toEqual(DEFAULT_STATE);
  });

  it("starts from the preset when only the location is given", () => {
    expect(fromSearchParams(new URLSearchParams("loc=office"))).toEqual(stateFromPreset("office"));
  });
});

describe("emailSummary", () => {
  it("lists all three scenarios with the v1 realistic figures", () => {
    const text = emailSummary(DEFAULT_STATE);
    expect(text).toContain("Conservative (5% more sales, 30% paid by card or phone)");
    expect(text).toContain("• Net gain per month: €2,838");
    expect(text).toContain("• Payback period: 5.3 months");
    expect(text).toContain("• Net gain after 3 years: €87,150");
    expect(text).toContain("Upfront investment: €15,000 for 50 card readers.");
  });
});
