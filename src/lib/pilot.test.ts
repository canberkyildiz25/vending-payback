import { describe, expect, it } from "vitest";
import { analysePilot, guessInstallDate, parseAmount, parseDate, parsePilotCsv } from "./pilot";

const CSV = `date,machine,sales,payment_type
2026-03-01,A,100,cash
2026-03-02,A,100,cash
2026-03-01,B,50,cash
2026-03-02,B,50,cash
2026-03-03,A,60,cash
2026-03-03,A,60,card
2026-03-04,A,55,cash
2026-03-04,A,65,mobile
2026-03-03,B,30,cash
2026-03-03,B,30,card
2026-03-03,C,40,card`;

describe("parsePilotCsv", () => {
  it("reads rows and normalises payment types", () => {
    const r = parsePilotCsv(CSV);
    expect(r.errors).toEqual([]);
    expect(r.skipped).toBe(0);
    expect(r.rows).toHaveLength(11);
    expect(r.rows[5]).toEqual({ date: "2026-03-03", machine: "A", sales: 60, kind: "cashless" });
  });

  it("handles semicolons, European decimals, quoted fields and a BOM", () => {
    const r = parsePilotCsv('﻿Datum;Machine;Amount;Payment type\r\n03-03-2026;"VM 1";"1.234,50";Contactless\r\n');
    expect(r.rows).toEqual([{ date: "2026-03-03", machine: "VM 1", sales: 1234.5, kind: "cashless" }]);
  });

  it("skips unreadable rows and counts them", () => {
    const r = parsePilotCsv("date,machine,sales,payment_type\n2026-02-30,A,10,cash\n2026-03-01,A,abc,cash\n2026-03-01,A,5,voucher\n2026-03-01,A,5,cash");
    expect(r.rows).toHaveLength(1);
    expect(r.skipped).toBe(3);
  });

  it("names the missing columns", () => {
    expect(parsePilotCsv("date,machine,amount\n").errors[0]).toContain("Missing: payment_type");
    expect(parsePilotCsv("").errors[0]).toBe("The file is empty.");
  });
});

describe("analysePilot", () => {
  const { rows } = parsePilotCsv(CSV);

  it("guesses the install date from the first card sale", () => {
    expect(guessInstallDate(rows)).toBe("2026-03-03");
  });

  it("measures card share after install and uplift on comparable machines", () => {
    const a = analysePilot(rows, "2026-03-03")!;
    // after: A 120 + 120, B 60, C 40 = 340; cashless 60 + 65 + 30 + 40 = 195
    expect(a.cardSharePct).toBe(57.4);
    // A and B only (C has no "before"): before 300 / 4 machine-days = 75; after 300 / 3 = 100
    expect(a.upliftPct).toBe(33.3);
    expect(a.comparableMachines).toBe(2);
    expect(a.machines).toBe(3);
    expect(a.daysBefore).toBe(2);
    expect(a.daysAfter).toBe(2);
  });

  it("leaves the uplift as unknown without data from before the install", () => {
    const a = analysePilot(rows, "2026-03-01")!;
    expect(a.upliftPct).toBeNull();
    expect(a.cardSharePct).not.toBeNull();
  });
});

describe("parsers", () => {
  it.each([
    ["1234.5", 1234.5],
    ["1234,5", 1234.5],
    ["1,234.50", 1234.5],
    ["1.234,50", 1234.5],
    ["€ 12", 12],
  ])("parseAmount(%s)", (s, v) => expect(parseAmount(s)).toBe(v));

  it.each([
    ["2026-3-9", "2026-03-09"],
    ["09/03/2026", "2026-03-09"],
    ["9.3.2026", "2026-03-09"],
    ["31-02-2026", null],
    ["March 9", null],
  ])("parseDate(%s)", (s, v) => expect(parseDate(s)).toBe(v));
});

describe("example pilot file offered for download", () => {
  it("parses cleanly and gives plausible figures", async () => {
    const { readFileSync } = await import("node:fs");
    const { rows, skipped } = parsePilotCsv(readFileSync("public/example-pilot-data.csv", "utf8"));
    expect(skipped).toBe(0);
    const install = guessInstallDate(rows)!;
    expect(install).toBe("2026-03-02");
    const a = analysePilot(rows, install)!;
    expect(a).toMatchObject({ machines: 6, comparableMachines: 6, daysBefore: 28, daysAfter: 28, upliftPct: 14.5, cardSharePct: 54.9 });
  });
});
