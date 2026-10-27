// The calculator's whole state, and its round trip through the URL so a
// worked-out case can be shared or opened as a client proposal.
import type { FleetInputs } from "./payback";
import { PRESETS, PRESET_IDS, type PresetId } from "./presets";
import { CURRENCIES, SCENARIO_IDS, type Currency, type ScenarioId, type Scenarios } from "./scenarios";

export type CalcState = {
  preset: PresetId;
  currency: Currency;
  fleet: FleetInputs;
  scenarios: Scenarios;
  selected: ScenarioId;
};

export function stateFromPreset(preset: PresetId, currency: Currency = "€"): CalcState {
  const p = PRESETS[preset];
  return {
    preset,
    currency,
    fleet: { ...p.fleet },
    scenarios: {
      conservative: { ...p.scenarios.conservative },
      realistic: { ...p.scenarios.realistic },
      optimistic: { ...p.scenarios.optimistic },
    },
    selected: "realistic",
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
const CURRENCY_KEY: Record<Currency, string> = { "€": "EUR", $: "USD", "£": "GBP" };

export function toSearchParams(s: CalcState): URLSearchParams {
  const q = new URLSearchParams();
  q.set("loc", s.preset);
  q.set("cur", CURRENCY_KEY[s.currency]);
  for (const k of Object.keys(FLEET_KEYS) as (keyof FleetInputs)[]) q.set(FLEET_KEYS[k], String(s.fleet[k]));
  for (const id of SCENARIO_IDS) {
    q.set(SCENARIO_KEY[id] + "u", String(s.scenarios[id].upliftPct));
    q.set(SCENARIO_KEY[id] + "s", String(s.scenarios[id].cardSharePct));
  }
  q.set("sel", s.selected);
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
  const cur = CURRENCIES.find((c) => CURRENCY_KEY[c.symbol] === q.get("cur"))?.symbol ?? "€";
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
  return s;
}
