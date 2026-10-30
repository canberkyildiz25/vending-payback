// The two figures that answer the hardest sales questions. Pure, like payback.ts.
import { HORIZON_MONTHS, clean, computePayback, type FleetInputs, type ScenarioInputs } from "./payback";

export type BreakEven =
  /** No sales increase can pay the readers back: fees take more than the margin. */
  | { kind: "impossible" }
  /** The readers pay back within the horizon even with flat sales. */
  | { kind: "no-growth-needed" }
  | { kind: "needs"; upliftPct: number };

/**
 * The smallest sales increase that pays the readers back within the horizon.
 * Net gain is linear in the increase u:
 *   net(u) = u × sales × (margin − share × fee) + handling − service − sales × share × fee
 * so solve net(u) = upfront ÷ horizon for u.
 */
export function breakEvenUplift(fleet: FleetInputs, cardSharePct: number, months = HORIZON_MONTHS): BreakEven {
  const flat = computePayback(fleet, { upliftPct: 0, cardSharePct });
  const target = flat.upfront / months;
  if (flat.netMonthly >= target && flat.netMonthly > 0) return { kind: "no-growth-needed" };
  const perUnit = flat.monthlySalesToday * (clean(fleet.marginPct) / 100 - (clean(cardSharePct) / 100) * (clean(fleet.feePct) / 100));
  if (perUnit <= 0) return { kind: "impossible" };
  return { kind: "needs", upliftPct: Math.ceil(((target - flat.netMonthly) / perUnit) * 1000) / 10 };
}

/** Net gain forgone by deciding later. Zero when the readers do not earn anything yet. */
export function costOfDelay(fleet: FleetInputs, scenario: ScenarioInputs, months: number): number {
  return Math.max(0, computePayback(fleet, scenario).netMonthly) * Math.max(0, months);
}
