// Number, money and date formatting for one language and currency.
import { LOCALE, MESSAGES, type Lang } from "./i18n";
import type { Currency } from "./scenarios";

const MINUS = "−";

export type Format = ReturnType<typeof createFormat>;

export function createFormat(lang: Lang, currency: Currency) {
  const locale = LOCALE[lang];
  const d = MESSAGES[lang].display;
  const p = MESSAGES[lang].proposal.paybackText;
  const cache = new Map<string, Intl.NumberFormat>();
  const nf = (key: string, opts: Intl.NumberFormatOptions) => {
    let f = cache.get(key);
    if (!f) cache.set(key, (f = new Intl.NumberFormat(locale, opts)));
    return f;
  };
  const sign = (v: number, s: string) => (v < 0 ? MINUS : "") + s;

  const money = (v: number, digits = 0) =>
    sign(v, nf(`m${digits}`, { style: "currency", currency, minimumFractionDigits: digits, maximumFractionDigits: digits }).format(Math.abs(v)));

  return {
    lang,
    locale,
    currency,
    /** The currency sign alone, for input prefixes: €, $, £, ₺. */
    symbol: nf("sym", { style: "currency", currency, currencyDisplay: "narrowSymbol" })
      .formatToParts(0)
      .find((x) => x.type === "currency")!.value,
    money,
    signedMoney: (v: number) => (v > 0 ? "+" : "") + money(v),
    /** Compact axis label: €15K, −₺1,2 Mn. */
    shortMoney: (v: number) => {
      const digits = Math.abs(v) >= 1e4 ? 0 : 1;
      return sign(v, nf(`s${digits}`, { style: "currency", currency, notation: "compact", maximumFractionDigits: digits }).format(Math.abs(v)));
    },
    pct: (v: number) => nf("pct", { style: "percent", maximumFractionDigits: 2 }).format(v / 100),
    num: (v: number, digits = 1) => nf(`n${digits}`, { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(v),
    paybackLabel(months: number): { value: string; unit: string } {
      if (!Number.isFinite(months)) return { value: d.never, unit: "" };
      if (months < 1) return { value: d.lessThanOne, unit: d.month };
      return { value: this.num(months), unit: d.months };
    },
    paybackText(months: number): string {
      if (!Number.isFinite(months)) return p.never;
      if (months < 1) return p.underOne;
      return p.months(this.num(months));
    },
    date: (iso: string, month: "short" | "long" = "short") =>
      new Date(iso.length === 10 ? `${iso}T00:00:00Z` : iso).toLocaleDateString(locale, {
        day: "numeric",
        month,
        year: "numeric",
        timeZone: iso.length === 10 ? "UTC" : undefined,
      }),
  };
}
