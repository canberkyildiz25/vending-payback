import type { Format } from "./format";
import type { Messages } from "./i18n";
import { breakEvenUplift, costOfDelay } from "./insights";
import { computePayback } from "./payback";
import { SCENARIO_IDS } from "./scenarios";
import { isMeasured, type CalcState } from "./state";

/** Plain-text business case for pasting into a client email. */
export function emailSummary(s: CalcState, t: Messages, fmt: Format): string {
  const e = t.email;
  const base = computePayback(s.fleet, s.scenarios.realistic);
  const lines = [e.subject, "", e.basedOn(s.fleet.machines, fmt.money(base.monthlySalesToday)), ""];
  for (const id of SCENARIO_IDS) {
    const sc = s.scenarios[id];
    const r = computePayback(s.fleet, sc);
    lines.push(
      e.caseLine(t.scenario[id], fmt.pct(sc.upliftPct), fmt.pct(sc.cardSharePct)),
      `• ${e.net}: ${fmt.money(r.netMonthly)}`,
      `• ${e.payback}: ${fmt.paybackText(r.paybackMonths)}`,
      `• ${e.net3y}: ${fmt.money(r.net3Years)}`,
      "",
    );
  }
  const be = breakEvenUplift(s.fleet, s.scenarios.realistic.cardSharePct);
  const delay = costOfDelay(s.fleet, s.scenarios.realistic, 6);
  lines.push(
    ...(be.kind === "needs" ? [t.sales.email.breakEven(fmt.pct(be.upliftPct))] : be.kind === "no-growth-needed" ? [t.sales.email.noGrowth] : []),
    ...(delay > 0 ? [t.sales.email.delay(fmt.money(delay))] : []),
    "",
    e.upfront(fmt.money(base.upfront), s.fleet.machines),
    e.shared(fmt.pct(s.fleet.marginPct), fmt.pct(s.fleet.feePct), fmt.money(s.fleet.monthlyServiceFee, 2), fmt.money(s.fleet.handlingSavedPerMachine)),
    e.marginOnly,
    ...(s.pilot && (isMeasured(s, "upliftPct") || isMeasured(s, "cardSharePct")) ? [e.pilot(s.pilot.machines)] : []),
    "",
    e.closing,
  );
  return lines.join("\n");
}
