import { describe, expect, it } from "vitest";
import { createFormat } from "./format";
import { MESSAGES } from "./i18n";
import { DEFAULT_STATE, changeCurrency, fromSearchParams, stateFromPreset, toSearchParams } from "./state";
import { emailSummary } from "./summary";

describe("URL state", () => {
  it("round-trips a full state", () => {
    const s = stateFromPreset("gym", "GBP");
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
    const text = emailSummary(DEFAULT_STATE, MESSAGES.en, createFormat("en", "EUR"));
    expect(text).toContain("Conservative (5% more sales, 30% paid by card or phone)");
    expect(text).toContain("• Net gain per month: €2,838");
    expect(text).toContain("• Payback period: 5.3 months");
    expect(text).toContain("• Net gain after 3 years: €87,150");
    expect(text).toContain("Upfront investment: €15,000 for 50 card readers.");
  });
});

describe("currency", () => {
  it("reads old saved links that stored the currency as a code", () => {
    expect(fromSearchParams(new URLSearchParams("cur=TRY")).currency).toBe("TRY");
    expect(fromSearchParams(new URLSearchParams("cur=XYZ")).currency).toBe("EUR");
  });

  it("converts untouched example money values and keeps typed ones", () => {
    const s = stateFromPreset("custom", "EUR");
    s.fleet.readerPrice = 250; // typed by the user
    const tr = changeCurrency(s, "TRY");
    expect(tr.fleet.dailySalesPerMachine).toBe(1600);
    expect(tr.fleet.monthlyServiceFee).toBe(320);
    expect(tr.fleet.readerPrice).toBe(250);
    expect(tr.fleet.machines).toBe(50);
    expect(changeCurrency(tr, "EUR").fleet.dailySalesPerMachine).toBe(40);
  });

  it("leaves the payback period unchanged when the examples are converted", () => {
    const eur = emailSummary(DEFAULT_STATE, MESSAGES.en, createFormat("en", "EUR"));
    const tr = changeCurrency(DEFAULT_STATE, "TRY");
    const text = emailSummary(tr, MESSAGES.en, createFormat("en", "TRY"));
    expect(text).toContain("• Payback period: 5.3 months");
    expect(eur).toContain("• Payback period: 5.3 months");
  });
});
