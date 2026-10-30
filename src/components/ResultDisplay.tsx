"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { verdictFor, type PaybackResult } from "@/lib/payback";
import { SCENARIO_IDS, type ScenarioId } from "@/lib/scenarios";
import type { CalcState } from "@/lib/state";
import { CopySummary } from "./CopySummary";
import { useI18n } from "./I18n";
import { Insights } from "./Insights";
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

/**
 * The result panel reads like the display on a vending machine: a dark,
 * slightly recessed screen, selection buttons along the top, figures in mono.
 */
export function ResultDisplay({ state, results, onSelect, proposalHref }: Props) {
  const { t, fmt } = useI18n(state.currency);
  const d = t.display;
  const r = results[state.selected];
  const pb = fmt.paybackLabel(r.paybackMonths);
  const label = t.scenario[state.selected];

  return (
    <section
      className="display flex min-w-0 flex-col gap-5 rounded-[12px] bg-display p-5 text-display-ink shadow-[inset_0_0_0_1px_rgb(255_255_255/.06),inset_0_2px_14px_rgb(0_0_0/.45)] sm:p-6 lg:sticky lg:top-4"
      aria-labelledby="pb-label"
    >
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2" role="group" aria-label={d.choose}>
        {SCENARIO_IDS.map((id) => {
          const p = fmt.paybackLabel(results[id].paybackMonths);
          const on = id === state.selected;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={on}
              onClick={() => onSelect(id)}
              className={`flex min-h-14 min-w-0 cursor-pointer flex-col items-start gap-1 rounded-md border-t-[3px] bg-white/[.04] px-2 pt-2 pb-2.5 text-left transition-colors duration-150 hover:bg-white/[.08] active:bg-white/[.12] sm:px-2.5 ${
                on ? "border-display-coin bg-white/[.08]" : "border-display-grid"
              }`}
            >
              <span
                className={`label-caps max-w-full truncate text-[10px] tracking-[.04em] [font-stretch:68%] sm:text-[11px] sm:tracking-[.1em] sm:[font-stretch:90%] ${on ? "text-display-ink" : "text-display-dim"}`}
              >
                {t.scenario[id]}
              </span>
              <span className={`num text-lg leading-none font-semibold ${on ? "text-display-coin" : "text-display-ink"}`}>
                {p.value}
                {p.unit && <span className="ml-1 font-sans text-xs font-normal text-display-dim">{d.monthShort}</span>}
              </span>
            </button>
          );
        })}
      </div>

      <div aria-live="polite">
        <div className="label-caps text-display-dim" id="pb-label">
          {d.paybackPeriod} · {label}
        </div>
        <div className="flex flex-wrap items-baseline gap-2.5">
          <span className="num text-[clamp(48px,7.5vw,72px)] leading-none font-semibold text-display-coin [text-shadow:0_0_24px_rgb(242_181_68/.25)]">{pb.value}</span>
          {pb.unit && <span className="font-display text-xl font-bold [font-stretch:85%]">{pb.unit}</span>}
        </div>
        <p className="m-0 mt-1.5 text-sm text-display-dim">{d.verdict[verdictFor(r.paybackMonths)]}</p>
      </div>

      <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-3">
        <Kpi value={fmt.money(r.netMonthly)} label={d.netMonth} className={tone(r.netMonthly)} />
        <Kpi value={fmt.money(r.upfront)} label={d.upfront} />
        <Kpi value={fmt.money(r.net3Years)} label={d.net3y} className={tone(r.net3Years)} />
      </div>

      <Insights state={state} t={t} fmt={fmt} />

      <div className="min-w-0">
        <div className="label-caps mb-1.5 text-display-dim">{d.chartTitle}</div>
        <PaybackChart results={results} selected={state.selected} t={t} fmt={fmt} />
      </div>

      <table className="w-full border-collapse text-[13.5px]" aria-label={d.breakdown(label)}>
        <tbody>
          <Line label={d.extraProfit} value={fmt.signedMoney(r.extraGrossProfit)} />
          <Line label={d.cashSaved} value={fmt.signedMoney(r.cashHandlingSaved)} />
          <Line label={d.procFees} value={fmt.money(-r.processingFees)} />
          <Line label={d.svcFees} value={fmt.money(-r.serviceFees)} />
          <Line label={d.netMonth} value={fmt.money(r.netMonthly)} total />
        </tbody>
      </table>

      <div className="flex flex-wrap items-center gap-2.5">
        <Link
          href={proposalHref}
          className="inline-flex min-h-11 items-center rounded-md bg-display-coin px-4 text-sm font-semibold whitespace-nowrap text-[#1b1404] no-underline transition-[filter] duration-150 hover:brightness-110 active:brightness-95"
        >
          {d.toProposal}
        </Link>
        <CopySummary state={state} />
        <Link href={proposalHref.replace("/proposal", "/meeting")} className="basis-full text-sm font-semibold text-display-coin underline-offset-4 hover:underline">
          {t.sales.cta.meeting}
        </Link>
      </div>
    </section>
  );
}
