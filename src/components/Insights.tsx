"use client";

import { useState } from "react";
import type { Format } from "@/lib/format";
import type { Messages } from "@/lib/i18n";
import { breakEvenUplift, costOfDelay } from "@/lib/insights";
import type { CalcState } from "@/lib/state";

const DELAYS = [3, 6, 12];

/** Answers "I don't believe that increase" and "let's wait" for the scenario on show, on the dark display. */
export function Insights({ state, t, fmt }: { state: CalcState; t: Messages; fmt: Format }) {
  const [months, setMonths] = useState(6);
  const I = t.sales.insight;
  const sc = state.scenarios[state.selected];
  const be = breakEvenUplift(state.fleet, sc.cardSharePct);
  const delay = costOfDelay(state.fleet, sc, months);
  // How much of the buyer's own estimate the case actually needs.
  const used = be.kind === "needs" && sc.upliftPct > 0 ? (be.upliftPct / sc.upliftPct) * 100 : null;

  return (
    <div className="grid gap-x-5 gap-y-4 border-t border-display-grid pt-4 sm:grid-cols-2">
      <div className="flex min-w-0 flex-col gap-1">
        <h3 className="label-caps m-0 text-display-dim">{I.breakEvenTitle}</h3>
        {be.kind === "needs" && <p key={be.upliftPct} className="num lcd-tick m-0 text-[28px] leading-tight font-semibold text-display-coin">{fmt.pct(be.upliftPct)}</p>}
        <p className="m-0 text-[13.5px]">{be.kind === "needs" ? I.needs(fmt.pct(be.upliftPct)) : be.kind === "no-growth-needed" ? I.noGrowth : I.impossible}</p>
        {used !== null && (
          <div className="mt-1 flex flex-col gap-1.5">
            <progress className={`gel ${used > 100 ? "gel-bad" : ""}`} max={100} value={Math.min(used, 100)} aria-label={I.breakEvenTitle} />
            <span className="num text-xs text-display-dim">{used > 100 ? I.meterOver : I.meterEstimate(fmt.pct(Math.round(used)))}</span>
          </div>
        )}
        <p className="m-0 text-xs text-display-dim">{I.versus(t.scenario[state.selected], fmt.pct(sc.upliftPct))}</p>
      </div>
      <div className="flex min-w-0 flex-col gap-1">
        <h3 className="label-caps m-0 text-display-dim">{I.delayTitle}</h3>
        {delay > 0 && <p key={delay} className="num lcd-tick m-0 text-[28px] leading-tight font-semibold text-display-neg">{fmt.money(-delay)}</p>}
        <p className="m-0 text-[13.5px]" aria-live="polite">
          {delay > 0 ? I.delayBody(fmt.money(delay), months) : I.delayNone}
        </p>
        <div className="mt-1 grid grid-cols-3 gap-1" role="group" aria-label={I.delayChoose}>
          {DELAYS.map((n) => (
            <button
              key={n}
              type="button"
              aria-pressed={n === months}
              onClick={() => setMonths(n)}
              className={`min-h-9 cursor-pointer border px-1 text-[11px] font-semibold whitespace-nowrap transition-colors duration-150 ${
                n === months ? "border-display-coin text-display-coin" : "border-display-grid text-display-dim hover:border-display-dim"
              }`}
            >
              {I.months(n)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
