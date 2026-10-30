// Location-type starting points. Every number here is an example for a
// conversation with a buyer, not a statistic. The UI labels them that way.
// Names and hints per language live in i18n.ts. Money values are in euros;
// see exampleScale for other currencies.
import type { FleetInputs } from "./payback";
import { DEFAULT_FLEET, DEFAULT_SCENARIOS, type Scenarios } from "./scenarios";

export const PRESET_IDS = ["custom", "factory", "gym", "campus", "hospital", "office"] as const;
export type PresetId = (typeof PRESET_IDS)[number];

export type Preset = {
  fleet: FleetInputs;
  scenarios: Scenarios;
};

const readers = { readerPrice: 300, monthlyServiceFee: 8, feePct: 2.5 };

export const PRESETS: Record<PresetId, Preset> = {
  custom: {
    fleet: DEFAULT_FLEET,
    scenarios: DEFAULT_SCENARIOS,
  },
  factory: {
    fleet: { machines: 40, dailySalesPerMachine: 55, sellingDays: 26, marginPct: 40, handlingSavedPerMachine: 12, ...readers },
    scenarios: {
      conservative: { upliftPct: 5, cardSharePct: 30 },
      realistic: { upliftPct: 12, cardSharePct: 45 },
      optimistic: { upliftPct: 20, cardSharePct: 60 },
    },
  },
  gym: {
    fleet: { machines: 25, dailySalesPerMachine: 35, sellingDays: 30, marginPct: 45, handlingSavedPerMachine: 10, ...readers },
    scenarios: {
      conservative: { upliftPct: 10, cardSharePct: 50 },
      realistic: { upliftPct: 18, cardSharePct: 65 },
      optimistic: { upliftPct: 28, cardSharePct: 80 },
    },
  },
  campus: {
    fleet: { machines: 60, dailySalesPerMachine: 45, sellingDays: 24, marginPct: 40, handlingSavedPerMachine: 10, ...readers },
    scenarios: {
      conservative: { upliftPct: 8, cardSharePct: 55 },
      realistic: { upliftPct: 15, cardSharePct: 70 },
      optimistic: { upliftPct: 25, cardSharePct: 85 },
    },
  },
  hospital: {
    fleet: { machines: 30, dailySalesPerMachine: 60, sellingDays: 30, marginPct: 38, handlingSavedPerMachine: 12, ...readers },
    scenarios: {
      conservative: { upliftPct: 5, cardSharePct: 40 },
      realistic: { upliftPct: 12, cardSharePct: 55 },
      optimistic: { upliftPct: 20, cardSharePct: 70 },
    },
  },
  office: {
    fleet: { machines: 20, dailySalesPerMachine: 30, sellingDays: 21, marginPct: 42, handlingSavedPerMachine: 8, ...readers },
    scenarios: {
      conservative: { upliftPct: 5, cardSharePct: 50 },
      realistic: { upliftPct: 12, cardSharePct: 65 },
      optimistic: { upliftPct: 20, cardSharePct: 80 },
    },
  },
};
