import type { FleetInputs, ScenarioInputs } from "./payback";

export const SCENARIO_IDS = ["conservative", "realistic", "optimistic"] as const;
export type ScenarioId = (typeof SCENARIO_IDS)[number];

export const SCENARIO_LABEL: Record<ScenarioId, string> = {
  conservative: "Conservative",
  realistic: "Realistic",
  optimistic: "Optimistic",
};

export type Scenarios = Record<ScenarioId, ScenarioInputs>;

export const CURRENCIES = [
  { symbol: "€", label: "€ EUR" },
  { symbol: "$", label: "$ USD" },
  { symbol: "£", label: "£ GBP" },
] as const;
export type Currency = (typeof CURRENCIES)[number]["symbol"];

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
