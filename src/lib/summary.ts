import { money, paybackText, pct } from "./format";
import { computePayback } from "./payback";
import { SCENARIO_IDS, SCENARIO_LABEL } from "./scenarios";
import { isMeasured, type CalcState } from "./state";

/** Plain-text business case for pasting into a client email. */
export function emailSummary(s: CalcState): string {
  const sym = s.currency;
  const base = computePayback(s.fleet, s.scenarios.realistic);
  const lines = [
    "Business case: card and phone payments for your vending fleet",
    "",
    `Based on ${s.fleet.machines} machines and current sales of ${money(base.monthlySalesToday, sym)} per month:`,
    "",
  ];
  for (const id of SCENARIO_IDS) {
    const sc = s.scenarios[id];
    const r = computePayback(s.fleet, sc);
    lines.push(
      `${SCENARIO_LABEL[id]} (${pct(sc.upliftPct)} more sales, ${pct(sc.cardSharePct)} paid by card or phone)`,
      `• Net gain per month: ${money(r.netMonthly, sym)}`,
      `• Payback period: ${paybackText(r.paybackMonths)}`,
      `• Net gain after 3 years: ${money(r.net3Years, sym)}`,
      "",
    );
  }
  lines.push(
    `Upfront investment: ${money(base.upfront, sym)} for ${s.fleet.machines} card readers.`,
    `Shared assumptions: ${pct(s.fleet.marginPct)} gross margin, ${pct(s.fleet.feePct)} processing fee, ` +
      `${money(s.fleet.monthlyServiceFee, sym, 2)} service fee per reader per month, ` +
      `${money(s.fleet.handlingSavedPerMachine, sym)} cash handling saved per machine per month.`,
    "Only the margin on extra sales is counted as gain, not the extra revenue.",
    ...(s.pilot && (isMeasured(s, "upliftPct") || isMeasured(s, "cardSharePct"))
      ? [`The realistic case uses figures measured on a pilot of ${s.pilot.machines} machines; the other cases are estimates.`]
      : []),
    "",
    "Happy to walk through these figures with your own data from a pilot.",
  );
  return lines.join("\n");
}
