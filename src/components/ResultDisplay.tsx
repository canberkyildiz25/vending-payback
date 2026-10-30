"use client";

import Link from "next/link";
import { HORIZON_MONTHS, verdictFor, type PaybackResult } from "@/lib/payback";
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
const KEY: Record<ScenarioId, string> = { conservative: "A", realistic: "B", optimistic: "C" };

function Kpi({ value, label, className = "" }: { value: string; label: string; className?: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className={`num text-xl font-semibold [overflow-wrap:anywhere] ${className}`}>{value}</span>
      <span className="text-xs text-display-dim">{label}</span>
    </div>
  );
}

/**
 * The machine itself: selection keys and a lit display in a metal bezel, a
 * slot, and the monthly breakdown coming out of the slot as a till receipt.
 */
export function ResultDisplay({ state, results, onSelect, proposalHref }: Props) {
  const { t, fmt } = useI18n(state.currency);
  const d = t.display;
  const r = results[state.selected];
  const pb = fmt.paybackLabel(r.paybackMonths);
  const label = t.scenario[state.selected];
  const paidBack = r.paybackMonths <= HORIZON_MONTHS;

  const rows: [string, string][] = [
    [d.extraProfit, fmt.signedMoney(r.extraGrossProfit)],
    [d.cashSaved, fmt.signedMoney(r.cashHandlingSaved)],
    [d.procFees, fmt.money(-r.processingFees)],
    [d.svcFees, fmt.money(-r.serviceFees)],
  ];

  return (
    <div className="flex min-w-0 flex-col">
      <section className="display flex min-w-0 flex-col gap-5 bg-display p-4 text-display-ink sm:p-5" aria-labelledby="pb-label">
        <div aria-live="polite" className="min-w-0">
          <div className="label-caps text-display-dim" id="pb-label">
            {d.paybackPeriod} · {label}
          </div>
          <div className="flex flex-wrap items-baseline gap-2.5">
            <span key={pb.value} className="num lcd lcd-tick text-[clamp(64px,10vw,104px)] leading-none font-semibold tracking-[-.03em]">{pb.value}</span>
            {pb.unit && <span className="sign text-[28px]">{pb.unit}</span>}
          </div>
          <div className="mt-3 flex flex-col gap-1.5">
            <progress
              className={`gel ${paidBack ? "" : "gel-bad"}`}
              max={HORIZON_MONTHS}
              value={paidBack ? r.paybackMonths : HORIZON_MONTHS}
              aria-label={d.paybackPeriod}
              aria-valuetext={paidBack ? t.sales.insight.meterPayback(fmt.num(r.paybackMonths)) : t.sales.insight.meterNever}
            />
            <span className="num text-xs text-display-dim">{paidBack ? t.sales.insight.meterPayback(fmt.num(r.paybackMonths)) : t.sales.insight.meterNever}</span>
          </div>
          <p className="m-0 mt-2 text-sm text-display-dim">{d.verdict[verdictFor(r.paybackMonths)]}</p>
        </div>

        <div className="grid grid-cols-3 gap-1.5" role="group" aria-label={d.choose}>
          {SCENARIO_IDS.map((id) => {
            const p = fmt.paybackLabel(results[id].paybackMonths);
            const on = id === state.selected;
            return (
              <button key={id} type="button" aria-pressed={on} onClick={() => onSelect(id)} className="key-metal flex min-h-16 min-w-0 flex-col items-start gap-1 px-2 py-2 text-left sm:px-2.5">
                <span className="flex max-w-full items-center gap-1.5">
                  <span className={`num shrink-0 px-1 text-[11px] font-semibold ${on ? "bg-display-coin text-[#1f1c14]" : "bg-[#f0eee2] text-[#1f1c14]"}`}>{KEY[id]}</span>
                  <span className="label-caps min-w-0 truncate text-[10px] tracking-[.03em] text-display-dim [font-stretch:68%] sm:text-[11px]">{t.scenario[id]}</span>
                </span>
                <span className={`num text-lg leading-none font-semibold ${on ? "text-display-coin" : ""}`}>
                  {p.value}
                  {p.unit && <span className="ml-1 hidden font-sans text-xs font-normal text-display-dim min-[360px]:inline">{d.monthShort}</span>}
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-3">
          <Kpi value={fmt.money(r.netMonthly)} label={d.netMonth} className={tone(r.netMonthly)} />
          <Kpi value={fmt.money(r.upfront)} label={d.upfront} />
          <Kpi value={fmt.money(r.net3Years)} label={d.net3y} className={tone(r.net3Years)} />
        </div>

        <Insights state={state} t={t} fmt={fmt} />

        <div className="min-w-0 border-t border-display-grid pt-4">
          <div className="label-caps mb-1.5 text-display-dim">{d.chartTitle}</div>
          <PaybackChart results={results} selected={state.selected} t={t} fmt={fmt} />
        </div>
      </section>

      <div className="dispense relative z-10 -mt-1" aria-hidden="true" />
      <div className="receipt-feed mx-3 -mt-1.5 sm:mx-8">
      <div key={state.selected} className="receipt pt-6">
        <table className="w-full border-collapse" aria-label={d.breakdown(label)}>
          <tbody>
            {rows.map(([name, value]) => (
              <tr key={name}>
                <td className="border-b border-dashed border-line py-1.5 pr-3">{name}</td>
                <td className="border-b border-dashed border-line py-1.5 text-right whitespace-nowrap">{value}</td>
              </tr>
            ))}
            <tr className="text-[15px] font-semibold">
              <td className="pt-2.5 pr-3">{d.netMonth}</td>
              <td className="pt-2.5 text-right whitespace-nowrap">{fmt.money(r.netMonthly)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      </div>

      <div className="on-cabinet mt-5 flex flex-wrap items-center gap-x-3 gap-y-3">
        <Link href={proposalHref} className="key-brass">
          {d.toProposal}
        </Link>
        <CopySummary state={state} />
        <Link href={proposalHref.replace("/proposal", "/meeting")} className="basis-full text-sm font-semibold text-coin underline underline-offset-4">
          {t.sales.cta.meeting}
        </Link>
      </div>
    </div>
  );
}
