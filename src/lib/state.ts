// The calculator's whole state, and its round trip through the URL so a
// worked-out case can be shared or opened as a client proposal.
import type { FleetInputs } from "./payback";
import { PRESETS, PRESET_IDS, type PresetId } from "./presets";
import { CURRENCIES, EXAMPLE_SCALE, SCENARIO_IDS, scaleMoney, type Currency, type ScenarioId, type Scenarios } from "./scenarios";

export type CalcState = {
  preset: PresetId;
  currency: Currency;
  fleet: FleetInputs;
  scenarios: Scenarios;
  selected: ScenarioId;
  /** Figures measured from uploaded pilot data, when the user applied them. */
  pilot: PilotFigures | null;
};

export type PilotFigures = {
  upliftPct: number | null;
  cardSharePct: number | null;
  machines: number;
  daysBefore: number;
  daysAfter: number;
  /** The realistic estimates the pilot figures replaced, so they can be put back. */
  replaced: { upliftPct: number; cardSharePct: number };
};

/** Pilot value as it goes into a scenario: a measured fall in sales counts as no increase. */
export const pilotValue = (v: number) => Math.max(0, v);

/** True while the realistic field still holds the measured figure (editing it makes it an estimate again). */
export function isMeasured(s: CalcState, k: "upliftPct" | "cardSharePct"): boolean {
  const v = s.pilot?.[k];
  return v != null && s.scenarios.realistic[k] === pilotValue(v);
}

/** The preset's example fleet, in the given currency. */
export const presetFleet = (preset: PresetId, currency: Currency): FleetInputs =>
  scaleMoney(PRESETS[preset].fleet, EXAMPLE_SCALE[currency]);

export function stateFromPreset(preset: PresetId, currency: Currency = "EUR"): CalcState {
  const p = PRESETS[preset];
  return {
    preset,
    currency,
    fleet: presetFleet(preset, currency),
    scenarios: {
      conservative: { ...p.scenarios.conservative },
      realistic: { ...p.scenarios.realistic },
      optimistic: { ...p.scenarios.optimistic },
    },
    selected: "realistic",
    pilot: null,
  };
}

export const DEFAULT_STATE = stateFromPreset("custom");

const FLEET_KEYS: Record<keyof FleetInputs, string> = {
  machines: "m",
  dailySalesPerMachine: "ds",
  sellingDays: "sd",
  marginPct: "mg",
  handlingSavedPerMachine: "ch",
  readerPrice: "rp",
  monthlyServiceFee: "sf",
  feePct: "pf",
};
const SCENARIO_KEY: Record<ScenarioId, string> = { conservative: "c", realistic: "r", optimistic: "o" };

export function toSearchParams(s: CalcState): URLSearchParams {
  const q = new URLSearchParams();
  q.set("loc", s.preset);
  q.set("cur", s.currency);
  for (const k of Object.keys(FLEET_KEYS) as (keyof FleetInputs)[]) q.set(FLEET_KEYS[k], String(s.fleet[k]));
  for (const id of SCENARIO_IDS) {
    q.set(SCENARIO_KEY[id] + "u", String(s.scenarios[id].upliftPct));
    q.set(SCENARIO_KEY[id] + "s", String(s.scenarios[id].cardSharePct));
  }
  q.set("sel", s.selected);
  if (s.pilot) {
    if (s.pilot.upliftPct != null) q.set("plu", String(s.pilot.upliftPct));
    if (s.pilot.cardSharePct != null) q.set("pls", String(s.pilot.cardSharePct));
    q.set("plm", String(s.pilot.machines));
    q.set("plb", String(s.pilot.daysBefore));
    q.set("pla", String(s.pilot.daysAfter));
    q.set("pru", String(s.pilot.replaced.upliftPct));
    q.set("prs", String(s.pilot.replaced.cardSharePct));
  }
  return q;
}

type Readable = { get(name: string): string | null };

/** Next.js page searchParams object → the same reader URLSearchParams offers. */
export type Search = Record<string, string | string[] | undefined>;
export const readSearch = (sp: Search): Readable => ({
  get: (k) => {
    const v = sp[k];
    return typeof v === "string" ? v : null;
  },
});

/** Unknown or broken values fall back to the preset's example values. */
export function fromSearchParams(q: Readable): CalcState {
  const loc = q.get("loc");
  const preset: PresetId = (PRESET_IDS as readonly string[]).includes(loc ?? "") ? (loc as PresetId) : "custom";
  const rawCur = q.get("cur");
  const cur: Currency = (CURRENCIES as readonly string[]).includes(rawCur ?? "") ? (rawCur as Currency) : "EUR";
  const s = stateFromPreset(preset, cur);
  const read = (key: string, fallback: number) => {
    const raw = q.get(key);
    if (raw === null || raw.trim() === "") return fallback;
    const v = Number(raw);
    return Number.isFinite(v) && v >= 0 ? v : fallback;
  };
  for (const k of Object.keys(FLEET_KEYS) as (keyof FleetInputs)[]) s.fleet[k] = read(FLEET_KEYS[k], s.fleet[k]);
  for (const id of SCENARIO_IDS) {
    s.scenarios[id].upliftPct = read(SCENARIO_KEY[id] + "u", s.scenarios[id].upliftPct);
    s.scenarios[id].cardSharePct = read(SCENARIO_KEY[id] + "s", s.scenarios[id].cardSharePct);
  }
  const sel = q.get("sel");
  if ((SCENARIO_IDS as readonly string[]).includes(sel ?? "")) s.selected = sel as ScenarioId;
  if (q.get("pla") !== null) {
    const opt = (k: string) => {
      const raw = q.get(k);
      const v = raw === null ? NaN : Number(raw);
      return Number.isFinite(v) ? v : null;
    };
    s.pilot = {
      upliftPct: opt("plu"),
      cardSharePct: opt("pls"),
      machines: read("plm", 0),
      daysBefore: read("plb", 0),
      daysAfter: read("pla", 0),
      replaced: { upliftPct: read("pru", s.scenarios.realistic.upliftPct), cardSharePct: read("prs", s.scenarios.realistic.cardSharePct) },
    };
  }
  return s;
}

/**
 * Switches currency. Money fields still holding the preset's example value are
 * converted to the example in the new currency; figures the user typed stay as typed.
 */
export function changeCurrency(s: CalcState, next: Currency): CalcState {
  const before = presetFleet(s.preset, s.currency);
  const after = presetFleet(s.preset, next);
  const fleet = { ...s.fleet };
  for (const k of Object.keys(fleet) as (keyof FleetInputs)[]) if (fleet[k] === before[k]) fleet[k] = after[k];
  return { ...s, currency: next, fleet };
}
