// Pilot data: a CSV of sales from machines that already have card readers.
// Turns two estimates into measured figures:
//   card share     = card and phone sales ÷ all sales, after the readers went in
//   sales increase = average sales per machine per day after ÷ before − 1,
//                    on machines that have data on both sides of the install date

export type PaymentKind = "cash" | "cashless";

export type PilotRow = { date: string; machine: string; sales: number; kind: PaymentKind };

/** Errors are codes; the interface turns them into text in the page language. */
export type PilotError = { code: "empty" } | { code: "missing"; columns: string[] } | { code: "no-rows" };

export type ParseResult = { rows: PilotRow[]; skipped: number; errors: PilotError[] };

export type PilotAnalysis = {
  installDate: string;
  machines: number;
  firstDate: string;
  lastDate: string;
  daysBefore: number;
  daysAfter: number;
  /** Machines with data before and after the install date. */
  comparableMachines: number;
  /** null when there is no data from before the readers went in. */
  upliftPct: number | null;
  /** null when there is no data from after the readers went in. */
  cardSharePct: number | null;
};

const CASH = new Set(["cash", "coin", "coins", "notes", "banknote"]);
const CASHLESS = new Set(["card", "cards", "debit", "credit", "contactless", "mobile", "phone", "app", "wallet", "nfc", "cashless", "qr"]);

const HEADERS = {
  date: ["date", "day", "datum"],
  machine: ["machine", "machine_id", "machineid", "machine id", "vm", "device", "terminal"],
  sales: ["sales", "amount", "revenue", "value", "total"],
  kind: ["payment_type", "payment type", "paymenttype", "payment", "type", "method", "payment_method"],
} as const;

function splitLine(line: string, sep: string): string[] {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cur += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === sep) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

/** Accepts 1234.5, 1234,5, 1,234.50 and 1.234,50. */
export function parseAmount(raw: string): number {
  let s = raw.replace(/[^\d.,-]/g, "");
  const lastDot = s.lastIndexOf(".");
  const lastComma = s.lastIndexOf(",");
  if (lastDot > -1 && lastComma > -1) {
    s = lastComma > lastDot ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "");
  } else if (lastComma > -1) {
    s = s.replace(",", ".");
  }
  return s === "" ? NaN : Number(s);
}

/** ISO date (YYYY-MM-DD) from ISO, D-M-YYYY or D/M/YYYY. Day first, as in Europe. */
export function parseDate(raw: string): string | null {
  const s = raw.trim();
  let m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(s);
  let y: number, mo: number, d: number;
  if (m) [y, mo, d] = [+m[1], +m[2], +m[3]];
  else if ((m = /^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/.exec(s))) [d, mo, y] = [+m[1], +m[2], +m[3]];
  else return null;
  const dt = new Date(Date.UTC(y, mo - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) return null;
  return dt.toISOString().slice(0, 10);
}

export function parsePilotCsv(text: string): ParseResult {
  const lines = text.replace(/^﻿/, "").split(/\r?\n/).filter((l) => l.trim() !== "");
  if (lines.length === 0) return { rows: [], skipped: 0, errors: [{ code: "empty" }] };

  const first = lines[0];
  const sep = [";", "\t", ","].find((c) => first.includes(c)) ?? ",";
  const head = splitLine(first, sep).map((h) => h.toLowerCase());
  const col = (names: readonly string[]) => head.findIndex((h) => names.includes(h));
  const idx = { date: col(HEADERS.date), machine: col(HEADERS.machine), sales: col(HEADERS.sales), kind: col(HEADERS.kind) };
  const missing = (Object.keys(idx) as (keyof typeof idx)[]).filter((k) => idx[k] < 0);
  if (missing.length) {
    const names = { date: "date", machine: "machine", sales: "sales", kind: "payment_type" };
    return {
      rows: [],
      skipped: 0,
      errors: [{ code: "missing", columns: missing.map((k) => names[k]) }],
    };
  }

  const rows: PilotRow[] = [];
  let skipped = 0;
  for (const line of lines.slice(1)) {
    const c = splitLine(line, sep);
    const date = parseDate(c[idx.date] ?? "");
    const machine = (c[idx.machine] ?? "").trim();
    const sales = parseAmount(c[idx.sales] ?? "");
    const t = (c[idx.kind] ?? "").trim().toLowerCase();
    const kind: PaymentKind | null = CASH.has(t) ? "cash" : CASHLESS.has(t) ? "cashless" : null;
    if (!date || !machine || !Number.isFinite(sales) || sales < 0 || !kind) {
      skipped++;
      continue;
    }
    rows.push({ date, machine, sales, kind });
  }
  const errors: PilotError[] = rows.length === 0 ? [{ code: "no-rows" }] : [];
  return { rows, skipped, errors };
}

/** Best guess for when the readers went in: the first day with a card or phone sale. */
export function guessInstallDate(rows: PilotRow[]): string | null {
  const dates = rows.filter((r) => r.kind === "cashless").map((r) => r.date).sort();
  return dates[0] ?? null;
}

const round1 = (v: number) => Math.round(v * 10) / 10;

export function analysePilot(rows: PilotRow[], installDate: string): PilotAnalysis | null {
  if (rows.length === 0) return null;
  const dates = rows.map((r) => r.date).sort();
  const before = rows.filter((r) => r.date < installDate);
  const after = rows.filter((r) => r.date >= installDate);

  const sum = (rs: PilotRow[]) => rs.reduce((a, r) => a + r.sales, 0);
  const machinesOf = (rs: PilotRow[]) => new Set(rs.map((r) => r.machine));
  const daysOf = (rs: PilotRow[]) => new Set(rs.map((r) => r.date)).size;

  const afterTotal = sum(after);
  const cardSharePct = afterTotal > 0 ? round1((sum(after.filter((r) => r.kind === "cashless")) / afterTotal) * 100) : null;

  // Like for like: only machines seen on both sides of the install date.
  const bm = machinesOf(before);
  const both = [...machinesOf(after)].filter((m) => bm.has(m));
  const perMachineDay = (rs: PilotRow[]) => {
    const pick = rs.filter((r) => both.includes(r.machine));
    const machineDays = new Set(pick.map((r) => `${r.machine}|${r.date}`)).size;
    return machineDays ? sum(pick) / machineDays : 0;
  };
  const avgBefore = perMachineDay(before);
  const upliftPct = both.length > 0 && avgBefore > 0 ? round1((perMachineDay(after) / avgBefore - 1) * 100) : null;

  return {
    installDate,
    machines: machinesOf(rows).size,
    firstDate: dates[0],
    lastDate: dates[dates.length - 1],
    daysBefore: daysOf(before),
    daysAfter: daysOf(after),
    comparableMachines: both.length,
    upliftPct,
    cardSharePct,
  };
}
