"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { breakEvenUplift, costOfDelay } from "@/lib/insights";
import type { FleetInputs } from "@/lib/payback";
import { SCENARIO_IDS } from "@/lib/scenarios";
import type { CalcState } from "@/lib/state";
import { useI18n } from "./I18n";
import { Insights } from "./Insights";
import { NumberInput } from "./NumberInput";
import { useCalcState } from "./useCalcState";
import { EstimatesGrid, PresetTiles, Row } from "./Worksheet";

const STEPS = ["site", "sales", "cash", "estimates", "costs", "close"] as const;
type Step = (typeof STEPS)[number];

/** The sales conversation as a guided flow: a question to ask, why it matters, and the fields it fills in. */
export function Meeting({ initial }: { initial: CalcState }) {
  const { state, results, query, onPreset, onFleet, onScenario, onSelect } = useCalcState(initial);
  const { t, fmt } = useI18n(state.currency);
  const M = t.sales.meeting;
  const [index, setIndex] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);

  const step: Step = STEPS[index];
  const copy = M.steps[step];
  const sym = fmt.symbol;
  const f = (k: keyof FleetInputs) => ({ value: state.fleet[k], onChange: (v: number) => onFleet(k, v) });

  const go = (i: number) => {
    setIndex(i);
    // The question changed: take keyboard and screen-reader users to it.
    requestAnimationFrame(() => heading.current?.focus({ preventScroll: true }));
  };

  const shown = results[state.selected];
  const pb = fmt.paybackLabel(shown.paybackMonths);
  const r = results.realistic;
  const be = breakEvenUplift(state.fleet, state.scenarios.realistic.cardSharePct);
  const needed = fmt.pct(be.kind === "needs" ? be.upliftPct : 0);
  const O = M.objections;
  const objections = [
    { q: O.uplift.q, a: O.uplift.a(needed, fmt.pct(state.scenarios.realistic.upliftPct)) },
    { q: O.upfront.q, a: O.upfront.a(fmt.money(r.upfront), fmt.paybackText(r.paybackMonths)) },
    { q: O.fees.q, a: O.fees.a(fmt.money(r.processingFees), fmt.money(r.extraGrossProfit)) },
    { q: O.cash.q, a: O.cash.a(fmt.pct(state.scenarios.conservative.cardSharePct), fmt.money(results.conservative.netMonthly)) },
    { q: O.later.q, a: O.later.a(fmt.money(costOfDelay(state.fleet, state.scenarios.realistic, 6))) },
  ];

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
      <section className="flex min-w-0 flex-col gap-6 bg-panel p-5 sm:p-7" aria-labelledby="meeting-q">
        <nav aria-label={M.stepsAria}>
          <ol className="m-0 grid list-none grid-cols-6 gap-1 p-0">
            {STEPS.map((id, i) => (
              <li key={id} className="min-w-0">
                <button
                  type="button"
                  onClick={() => go(i)}
                  aria-current={i === index ? "step" : undefined}
                  aria-label={M.steps[id].name}
                  className={`flex min-h-11 w-full cursor-pointer flex-col items-start gap-0.5 border-0 border-t-[3px] bg-transparent px-0 pt-1.5 text-left transition-colors duration-150 ${
                    i === index ? "border-coin text-ink" : i < index ? "border-ink text-muted" : "border-line text-muted hover:border-muted"
                  }`}
                >
                  <span className="num text-xs">{i + 1}</span>
                  <span className="hidden truncate text-xs font-semibold sm:block sm:max-w-full">{M.steps[id].name}</span>
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <div className="flex flex-col gap-2">
          <p className="num m-0 text-xs text-muted">{M.stepLabel(index + 1, STEPS.length)}</p>
          <h2 id="meeting-q" ref={heading} tabIndex={-1} className="sign m-0 text-[clamp(30px,4.4vw,46px)] text-balance outline-none">
            {copy.ask}
          </h2>
          <p className="m-0 max-w-[62ch] text-sm text-muted">
            <strong className="font-semibold text-ink">{M.why}:</strong> {copy.why}
          </p>
        </div>

        <div className="flex min-w-0 flex-col gap-3 border-t border-line pt-5">
          {step === "site" && (
            <>
              <PresetTiles state={state} onPreset={onPreset} />
              <Row id="m-machines" label={t.sheet.machines}>
                <NumberInput id="m-machines" min={1} {...f("machines")} />
              </Row>
            </>
          )}
          {step === "sales" && (
            <>
              <Row id="m-daily" label={t.sheet.dailySales} hint={t.sheet.dailySalesHint}>
                <NumberInput id="m-daily" prefix={sym} {...f("dailySalesPerMachine")} />
              </Row>
              <Row id="m-days" label={t.sheet.sellingDays}>
                <NumberInput id="m-days" min={1} max={31} {...f("sellingDays")} />
              </Row>
              <Row id="m-margin" label={t.sheet.margin} hint={t.sheet.marginHint}>
                <NumberInput id="m-margin" max={100} unit="%" {...f("marginPct")} />
              </Row>
            </>
          )}
          {step === "cash" && (
            <Row id="m-handling" label={t.sheet.handling} hint={t.sheet.handlingHint}>
              <NumberInput id="m-handling" prefix={sym} {...f("handlingSavedPerMachine")} />
            </Row>
          )}
          {step === "estimates" && <EstimatesGrid state={state} onScenario={onScenario} />}
          {step === "costs" && (
            <>
              <Row id="m-hardware" label={t.sheet.readerPrice} hint={t.sheet.readerPriceHint}>
                <NumberInput id="m-hardware" prefix={sym} {...f("readerPrice")} />
              </Row>
              <Row id="m-service" label={t.sheet.serviceFee}>
                <NumberInput id="m-service" prefix={sym} {...f("monthlyServiceFee")} />
              </Row>
              <Row id="m-fee" label={t.sheet.procFee} hint={t.sheet.procFeeHint}>
                <NumberInput id="m-fee" max={20} unit="%" {...f("feePct")} />
              </Row>
            </>
          )}
          {step === "close" && (
            <div className="flex flex-col gap-3">
              <h3 className="m-0 font-display text-[17px] font-bold [font-stretch:88%]">{M.objectionsTitle}</h3>
              {r.netMonthly > 0 ? (
                <>
                  <p className="m-0 text-[13px] text-muted">{M.objectionsNote}</p>
                  <div className="flex flex-col">
                    {objections.map((o) => (
                      <details key={o.q} className="group border-t border-line py-1 last:border-b">
                        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold [&::-webkit-details-marker]:hidden">
                          {o.q}
                          <span className="num text-base text-muted group-open:hidden" aria-hidden="true">+</span>
                          <span className="num hidden text-base text-muted group-open:inline" aria-hidden="true">−</span>
                        </summary>
                        <p className="m-0 pb-3 text-sm text-muted">{o.a}</p>
                      </details>
                    ))}
                  </div>
                </>
              ) : (
                <p className="m-0 text-sm">{M.noCase}</p>
              )}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1">
                <Link href={`/proposal?${query}`} className="inline-flex min-h-11 items-center bg-ink px-4 text-sm font-semibold whitespace-nowrap text-panel no-underline transition-opacity duration-150 hover:opacity-90 active:opacity-80">
                  {M.toProposal}
                </Link>
                <Link href={`/?${query}`} className="text-sm font-semibold whitespace-nowrap text-accent underline-offset-4 hover:underline">
                  {M.openCalculator}
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
          <button
            type="button"
            onClick={() => go(index - 1)}
            disabled={index === 0}
            className="inline-flex min-h-11 cursor-pointer items-center border border-line bg-transparent px-4 text-sm font-semibold text-ink hover:border-muted disabled:cursor-default disabled:opacity-40"
          >
            {M.back}
          </button>
          {index < STEPS.length - 1 && (
            <button
              type="button"
              onClick={() => go(index + 1)}
              className="inline-flex min-h-11 cursor-pointer items-center bg-ink px-4 text-sm font-semibold whitespace-nowrap text-panel transition-opacity duration-150 hover:opacity-90 active:opacity-80"
            >
              {index === STEPS.length - 2 ? M.toClose : M.next}
            </button>
          )}
        </div>
      </section>

      <aside className="display flex min-w-0 flex-col gap-4 bg-display p-5 text-display-ink sm:p-6 lg:sticky lg:top-4" aria-label={M.live}>
        <div className="label-caps text-display-dim">{M.live}</div>
        <div className="grid grid-cols-3 gap-1.5" role="group" aria-label={t.display.choose}>
          {SCENARIO_IDS.map((id) => {
            const on = id === state.selected;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={on}
                onClick={() => onSelect(id)}
                className="key-metal flex min-h-11 min-w-0 flex-col items-start justify-center px-2 py-1.5 text-left"
              >
                <span className={`label-caps max-w-full truncate text-[10px] tracking-[.04em] [font-stretch:68%] ${on ? "text-display-ink" : "text-display-dim"}`}>{t.scenario[id]}</span>
              </button>
            );
          })}
        </div>
        <div aria-live="polite">
          <div className="label-caps text-display-dim">{t.display.paybackPeriod}</div>
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="num lcd text-[64px] leading-none font-semibold tracking-[-.03em]">{pb.value}</span>
            {pb.unit && <span className="sign text-[22px]">{pb.unit}</span>}
          </div>
          <p className="num m-0 mt-2 text-sm">
            {t.display.netMonth}: {fmt.money(shown.netMonthly)}
          </p>
        </div>
        <Insights state={state} t={t} fmt={fmt} />
      </aside>
    </div>
  );
}
