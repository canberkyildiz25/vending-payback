import type { FleetInputs, ScenarioInputs } from "./payback";

export const SCENARIO_IDS = ["conservative", "realistic", "optimistic"] as const;
export type ScenarioId = (typeof SCENARIO_IDS)[number];

export type Scenarios = Record<ScenarioId, ScenarioInputs>;

export const CURRENCIES = ["EUR", "USD", "GBP", "TRY"] as const;
export type Currency = (typeof CURRENCIES)[number];

/**
 * Example money values are written in euros. A rough, rounded multiplier keeps
 * them believable in lira (a €300 reader is not a ₺300 reader). Payback and
 * percentages do not depend on it: every money input scales together.
 */
export const EXAMPLE_SCALE: Record<Currency, number> = { EUR: 1, USD: 1, GBP: 1, TRY: 40 };

const MONEY_FIELDS = ["dailySalesPerMachine", "handlingSavedPerMachine", "readerPrice", "monthlyServiceFee"] as const;

export function scaleMoney(fleet: FleetInputs, factor: number): FleetInputs {
  const out = { ...fleet };
  for (const k of MONEY_FIELDS) out[k] = Math.round(fleet[k] * factor * 100) / 100;
  return out;
}

/** Example values from v1. Not market data. */
export const DEFAULT_FLEET: FleetInputs = {
  machines: 50,
  dailySalesPerMachine: 40,
  sellingDays: 30,
  marginPct: 40,
  handlingSavedPerMachine: 10,
  readerPrice: 300,
  monthlyServiceFee: 8,
  feePct: 2.5,
};

/** Example estimates. The realistic case matches v1. */
export const DEFAULT_SCENARIOS: Scenarios = {
  conservative: { upliftPct: 5, cardSharePct: 30 },
  realistic: { upliftPct: 15, cardSharePct: 50 },
  optimistic: { upliftPct: 25, cardSharePct: 65 },
};
