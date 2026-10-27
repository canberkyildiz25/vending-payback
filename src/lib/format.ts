const MINUS = "−";

export function money(v: number, sym: string, digits = 0): string {
  const s = Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
  return (v < 0 ? MINUS : "") + sym + s;
}

export function signedMoney(v: number, sym: string): string {
  return (v > 0 ? "+" : "") + money(v, sym);
}

/** Compact axis label: €1.2k, −€15k, €1.4M. */
export function shortMoney(v: number, sym: string): string {
  const a = Math.abs(v);
  const t =
    a >= 1e6 ? (a / 1e6).toFixed(a >= 1e7 ? 0 : 1) + "M" : a >= 1e3 ? (a / 1e3).toFixed(a >= 1e4 ? 0 : 1) + "k" : a.toFixed(0);
  return (v < 0 ? MINUS : "") + sym + t;
}

export function paybackLabel(months: number): { value: string; unit: string } {
  if (!Number.isFinite(months)) return { value: "Never", unit: "" };
  if (months < 1) return { value: "< 1", unit: "month" };
  return { value: months.toFixed(1), unit: "months" };
}

export function paybackText(months: number): string {
  if (!Number.isFinite(months)) return "not reached with these figures";
  if (months < 1) return "under 1 month";
  return months.toFixed(1) + " months";
}

export const pct = (v: number) => `${+v.toFixed(2)}%`;
