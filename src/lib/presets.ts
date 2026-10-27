// Location-type starting points. Every number here is an example for a
// conversation with a buyer, not a statistic. The UI labels them that way.
import type { FleetInputs } from "./payback";
import { DEFAULT_FLEET, DEFAULT_SCENARIOS, type Scenarios } from "./scenarios";

export const PRESET_IDS = ["custom", "factory", "gym", "campus", "hospital", "office"] as const;
export type PresetId = (typeof PRESET_IDS)[number];

export type Preset = {
  label: string;
  /** Finishes the sentence "Example values for …". */
  phrase: string;
  /** Why the example looks the way it does. Shown under the picker. */
  hint: string;
  fleet: FleetInputs;
  scenarios: Scenarios;
};

const readers = { readerPrice: 300, monthlyServiceFee: 8, feePct: 2.5 };

export const PRESETS: Record<PresetId, Preset> = {
  custom: {
    label: "Any fleet",
    phrase: "a mixed fleet",
    hint: "A neutral starting point.",
    fleet: DEFAULT_FLEET,
    scenarios: DEFAULT_SCENARIOS,
  },
  factory: {
    label: "Factory",
    phrase: "a factory site",
    hint: "Shift work six days a week, so 26 selling days and a modest card share.",
    fleet: { machines: 40, dailySalesPerMachine: 55, sellingDays: 26, marginPct: 40, handlingSavedPerMachine: 12, ...readers },
    scenarios: {
      conservative: { upliftPct: 5, cardSharePct: 30 },
      realistic: { upliftPct: 12, cardSharePct: 45 },
      optimistic: { upliftPct: 20, cardSharePct: 60 },
    },
  },
  gym: {
    label: "Gym chain",
    phrase: "a gym chain",
    hint: "Open daily. Members often train without a wallet, so a higher card share.",
    fleet: { machines: 25, dailySalesPerMachine: 35, sellingDays: 30, marginPct: 45, handlingSavedPerMachine: 10, ...readers },
    scenarios: {
      conservative: { upliftPct: 10, cardSharePct: 50 },
      realistic: { upliftPct: 18, cardSharePct: 65 },
      optimistic: { upliftPct: 28, cardSharePct: 80 },
    },
  },
  campus: {
    label: "Campus",
    phrase: "a campus",
    hint: "Busy in term time, quiet outside it, so fewer selling days.",
    fleet: { machines: 60, dailySalesPerMachine: 45, sellingDays: 24, marginPct: 40, handlingSavedPerMachine: 10, ...readers },
    scenarios: {
      conservative: { upliftPct: 8, cardSharePct: 55 },
      realistic: { upliftPct: 15, cardSharePct: 70 },
      optimistic: { upliftPct: 25, cardSharePct: 85 },
    },
  },
  hospital: {
    label: "Hospital",
    phrase: "a hospital",
    hint: "Open every day, with visitors and staff buying around the clock.",
    fleet: { machines: 30, dailySalesPerMachine: 60, sellingDays: 30, marginPct: 38, handlingSavedPerMachine: 12, ...readers },
    scenarios: {
      conservative: { upliftPct: 5, cardSharePct: 40 },
      realistic: { upliftPct: 12, cardSharePct: 55 },
      optimistic: { upliftPct: 20, cardSharePct: 70 },
    },
  },
  office: {
    label: "Office",
    phrase: "an office building",
    hint: "Weekdays only, so 21 selling days and a smaller fleet.",
    fleet: { machines: 20, dailySalesPerMachine: 30, sellingDays: 21, marginPct: 42, handlingSavedPerMachine: 8, ...readers },
    scenarios: {
      conservative: { upliftPct: 5, cardSharePct: 50 },
      realistic: { upliftPct: 12, cardSharePct: 65 },
      optimistic: { upliftPct: 20, cardSharePct: 80 },
    },
  },
};
