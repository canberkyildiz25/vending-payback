// Pure payback maths. Same formulas as v1: only the margin on extra sales
// counts as gain, never the full extra revenue.

export type FleetInputs = {
  machines: number;
  dailySalesPerMachine: number;
  sellingDays: number;
  marginPct: number; // 0–100
  handlingSavedPerMachine: number;
  readerPrice: number;
  monthlyServiceFee: number;
  feePct: number; // 0–100
};

export type ScenarioInputs = {
  upliftPct: number; // 0–100+
  cardSharePct: number; // 0–100
};

export type PaybackResult = {
  monthlySalesToday: number;
  extraGrossProfit: number;
  cashHandlingSaved: number;
  processingFees: number;
  serviceFees: number;
  netMonthly: number;
  upfront: number;
  /** Infinity when netMonthly ≤ 0 ("Never"). */
  paybackMonths: number;
  net3Years: number;
};

export const HORIZON_MONTHS = 36;

/** Negative, NaN or missing inputs count as zero, as in v1. */
export const clean = (v: number) => (Number.isFinite(v) && v > 0 ? v : 0);

export function computePayback(fleet: FleetInputs, scenario: ScenarioInputs): PaybackResult {
  const machines = clean(fleet.machines);
  const margin = clean(fleet.marginPct) / 100;
  const uplift = clean(scenario.upliftPct) / 100;
  const share = clean(scenario.cardSharePct) / 100;
  const fee = clean(fleet.feePct) / 100;

  const monthlySalesToday = machines * clean(fleet.dailySalesPerMachine) * clean(fleet.sellingDays);
  const extraGrossProfit = monthlySalesToday * uplift * margin;
  const processingFees = monthlySalesToday * (1 + uplift) * share * fee;
  const serviceFees = machines * clean(fleet.monthlyServiceFee);
  const cashHandlingSaved = machines * clean(fleet.handlingSavedPerMachine);
  const netMonthly = extraGrossProfit + cashHandlingSaved - processingFees - serviceFees;
  const upfront = machines * clean(fleet.readerPrice);
  const paybackMonths = netMonthly > 0 ? upfront / netMonthly : Infinity;
  const net3Years = netMonthly * HORIZON_MONTHS - upfront;

  return {
    monthlySalesToday,
    extraGrossProfit,
    cashHandlingSaved,
    processingFees,
    serviceFees,
    netMonthly,
    upfront,
    paybackMonths,
    net3Years,
  };
}

/** Cumulative net position at month 0…HORIZON_MONTHS. */
export function cumulativeSeries(r: PaybackResult, months = HORIZON_MONTHS): number[] {
  return Array.from({ length: months + 1 }, (_, m) => r.netMonthly * m - r.upfront);
}

export type Verdict = "never" | "first-month" | "first-year" | "three-years" | "beyond";

export function verdictFor(paybackMonths: number): Verdict {
  if (!Number.isFinite(paybackMonths)) return "never";
  if (paybackMonths < 1) return "first-month";
  if (paybackMonths <= 12) return "first-year";
  if (paybackMonths <= HORIZON_MONTHS) return "three-years";
  return "beyond";
}

export const VERDICT_TEXT: Record<Verdict, string> = {
  never:
    "With these figures the readers cost more each month than they bring in. Check the sales increase and the fees.",
  "first-month": "The readers pay for themselves within the first month.",
  "first-year": "The readers pay for themselves within the first year.",
  "three-years": "The readers pay for themselves within three years.",
  beyond: "Payback takes longer than three years with these figures.",
};
