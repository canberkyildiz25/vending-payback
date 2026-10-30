import { describe, expect, it } from "vitest";
import { createFormat } from "./format";
import { MESSAGES, pickLang } from "./i18n";
import { DEFAULT_STATE } from "./state";
import { emailSummary } from "./summary";

describe("pickLang", () => {
  it("prefers the visitor's own choice", () => {
    expect(pickLang({ cookie: "nl", country: "TR" })).toBe("nl");
  });
  it("falls back to the country from the IP", () => {
    expect(pickLang({ country: "TR" })).toBe("tr");
    expect(pickLang({ country: "nl" })).toBe("nl");
    expect(pickLang({ country: "BE" })).toBe("nl");
    expect(pickLang({ country: "DE" })).toBe("en");
  });
  it("then the browser language, then English", () => {
    expect(pickLang({ acceptLanguage: "tr-TR,tr;q=0.9,en;q=0.8" })).toBe("tr");
    expect(pickLang({ cookie: "xx", acceptLanguage: "fr-FR" })).toBe("en");
    expect(pickLang({})).toBe("en");
  });
});

describe("messages", () => {
  const shape = (o: unknown): unknown =>
    o && typeof o === "object" && !Array.isArray(o)
      ? Object.fromEntries(Object.entries(o).map(([k, v]) => [k, shape(v)]))
      : Array.isArray(o)
        ? o.length
        : typeof o;
  it("has the same keys in every language", () => {
    expect(shape(MESSAGES.tr)).toEqual(shape(MESSAGES.en));
    expect(shape(MESSAGES.nl)).toEqual(shape(MESSAGES.en));
  });
});

describe("formatting per language", () => {
  it("formats money, percentages and payback the local way", () => {
    const tr = createFormat("tr", "TRY");
    expect(tr.money(2837.5)).toBe("₺2.838");
    expect(tr.pct(15)).toBe("%15");
    expect(tr.paybackText(5.286)).toBe("5,3 ay");
    expect(tr.symbol).toBe("₺");
    const nl = createFormat("nl", "EUR");
    expect(nl.money(-15000)).toBe("−€ 15.000"); // Intl puts a no-break space after €
    expect(nl.pct(2.5)).toBe("2,5%");
    const en = createFormat("en", "EUR");
    expect(en.money(87150)).toBe("€87,150");
    expect(en.paybackLabel(Infinity).value).toBe("Never");
  });

  it("writes the email summary in Turkish and Dutch", () => {
    expect(emailSummary(DEFAULT_STATE, MESSAGES.tr, createFormat("tr", "EUR"))).toContain("• Geri dönüş süresi: 5,3 ay");
    expect(emailSummary(DEFAULT_STATE, MESSAGES.nl, createFormat("nl", "EUR"))).toContain("• Terugverdientijd: 5,3 maanden");
  });
});
