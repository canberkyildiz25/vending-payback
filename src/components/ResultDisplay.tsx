"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { money, paybackLabel, signedMoney } from "@/lib/format";
import { VERDICT_TEXT, verdictFor, type PaybackResult } from "@/lib/payback";
import { SCENARIO_IDS, SCENARIO_LABEL, type ScenarioId } from "@/lib/scenarios";
import type { CalcState } from "@/lib/state";
import { CopySummary } from "./CopySummary";
import { PaybackChart } from "./PaybackChart";

type Props = {
  state: CalcState;
  results: Record<ScenarioId, PaybackResult>;
  onSelect: (id: ScenarioId) => void;
  proposalHref: string;
};

const tone = (v: number) => (v >= 0 ? "text-display-pos" : "text-display-neg");

function Kpi({ value, label, className = "" }: { value: string; label: string; className?: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5 border-t border-display-grid pt-2.5">
      <span className={`num text-xl font-semibold [overflow-wrap:anywhere] ${className}`}>{value}</span>
      <span className="text-xs text-display-dim">{label}</span>
    </div>
  );
}

function Line({ label, value, total }: { label: string; value: ReactNode; total?: boolean }) {
  return (
    <tr className={total ? "font-semibold" : undefined}>
      <td className={`border-t py-1.5 ${total ? "border-display-dim" : "border-display-grid"}`}>{label}</td>
      <td className={`num border-t py-1.5 pl-3 text-right whitespace-nowrap ${total ? "border-display-dim" : "border-display-grid"}`}>{value}</td>
    </tr>
  );
}

export function ResultDisplay({ state, results, onSelect, proposalHref }: Props) {
  const sym = state.currency;
  const r = results[state.selected];
  const pb = paybackLabel(r.paybackMonths);

  return (
    <section
      className="display flex min-w-0 flex-col gap-5 rounded-[10px] bg-display p-5 text-display-ink sm:p-[22px] lg:sticky lg:top-4"
      aria-labelledby="pb-label"
    >
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2" role="group" aria-label="Choose the scenario to show in detail">
        {SCENARIO_IDS.map((id) => {
          const p = paybackLabel(results[id].paybackMonths);
          const on = id === state.selected;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={on}
              onClick={() => onSelect(id)}
              className={`flex min-w-0 cursor-pointer flex-col items-start gap-1 rounded-md border-t-[3px] bg-white/[.03] px-2 sm:px-2.5 pt-2 pb-2.5 text-left transition-colors duration-150 hover:bg-white/[.07] active:bg-white/[.1] ${
                on ? "border-display-coin" : "border-display-grid"
              }`}
            >
              <span className={`label-caps max-w-full text-[10px] tracking-[.04em] [font-stretch:68%] sm:text-[11px] sm:tracking-[.1em] sm:[font-stretch:90%] ${on ? "text-display-ink" : "text-display-dim"}`}>{SCENARIO_LABEL[id]}</span>
              <span className={`num text-lg leading-none font-semibold ${on ? "text-display-coin" : "text-display-ink"}`}>
                {p.value}
                {p.unit && <span className="ml-1 font-sans text-xs font-normal text-display-dim">mo</span>}
              </span>
            </button>
          );
        })}
      </div>

      <div aria-live="polite">
        <div className="label-caps text-display-dim" id="pb-label">
          Payback period · {SCENARIO_LABEL[state.selected]}
        </div>
        <div className="flex flex-wrap items-baseline gap-2.5">
          <span className="num text-[clamp(44px,7vw,64px)] leading-none font-semibold text-display-coin">{pb.value}</span>
          {pb.unit && <span className="font-display text-xl font-bold [font-stretch:85%]">{pb.unit}</span>}
        </div>
        <p className="m-0 mt-1 text-sm text-display-dim">{VERDICT_TEXT[verdictFor(r.paybackMonths)]}</p>
      </div>

      <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-3">
        <Kpi value={money(r.netMonthly, sym)} label="Net gain per month" className={tone(r.netMonthly)} />
        <Kpi value={money(r.upfront, sym)} label="Upfront investment" />
        <Kpi value={money(r.net3Years, sym)} label="Net gain after 3 years" className={tone(r.net3Years)} />
      </div>

      <div className="min-w-0">
        <div className="label-caps mb-1.5 text-display-dim">Cumulative net position, 36 months</div>
        <PaybackChart results={results} selected={state.selected} sym={sym} />
      </div>

      <table className="w-full border-collapse text-[13.5px]" aria-label={`Monthly breakdown, ${SCENARIO_LABEL[state.selected]}`}>
        <tbody>
          <Line label="Extra gross profit from higher sales" value={signedMoney(r.extraGrossProfit, sym)} />
          <Line label="Cash handling saved" value={signedMoney(r.cashHandlingSaved, sym)} />
          <Line label="Card processing fees" value={money(-r.processingFees, sym)} />
          <Line label="Reader service fees" value={money(-r.serviceFees, sym)} />
          <Line label="Net gain per month" value={money(r.netMonthly, sym)} total />
        </tbody>
      </table>

      <div className="flex flex-wrap items-center gap-2.5">
        <Link
          href={proposalHref}
          className="rounded-md bg-display-coin px-3.5 py-2.5 text-sm font-semibold whitespace-nowrap text-[#1b1404] no-underline transition-[filter] duration-150 hover:brightness-110 active:brightness-95"
        >
          Turn this into a client proposal
        </Link>
        <CopySummary state={state} />
      </div>
    </section>
  );
}
