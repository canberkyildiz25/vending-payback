"use client";

import type { ReactNode } from "react";
import type { FleetInputs } from "@/lib/payback";
import { PRESETS, PRESET_IDS, type PresetId } from "@/lib/presets";
import { CURRENCIES, SCENARIO_IDS, SCENARIO_LABEL, type Currency, type ScenarioId } from "@/lib/scenarios";
import { isMeasured, type CalcState } from "@/lib/state";
import { NumberInput } from "./NumberInput";

type Props = {
  state: CalcState;
  onPreset: (p: PresetId) => void;
  onCurrency: (c: Currency) => void;
  onFleet: (k: keyof FleetInputs, v: number) => void;
  onScenario: (id: ScenarioId, k: "upliftPct" | "cardSharePct", v: number) => void;
};

export function EstimateTag() {
  return <span className="ml-1 text-[10.5px] font-semibold uppercase tracking-[.06em] text-coin">your estimate</span>;
}

function Legend({ children }: { children: ReactNode }) {
  return <legend className="label-caps mb-1 w-full border-b border-line pb-1.5 text-muted">{children}</legend>;
}

function Row({ id, label, hint, children }: { id: string; label: ReactNode; hint?: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_128px] items-center gap-3">
      <label htmlFor={id} className="text-sm leading-snug">
        {label}
        {hint && <small className="block text-xs text-muted">{hint}</small>}
      </label>
      {children}
    </div>
  );
}

export function Worksheet({ state, onPreset, onCurrency, onFleet, onScenario }: Props) {
  const { fleet, currency: sym } = state;
  const preset = PRESETS[state.preset];
  const f = (k: keyof FleetInputs) => ({ value: fleet[k], onChange: (v: number) => onFleet(k, v) });

  return (
    <form
      className="flex min-w-0 flex-col gap-6 rounded-[10px] border border-line bg-panel p-5"
      noValidate
      onSubmit={(e) => e.preventDefault()}
      aria-label="Fleet figures"
    >
      <fieldset className="flex min-w-0 flex-col gap-3">
        <Legend>Start from a location type</Legend>
        <div className="flex flex-wrap gap-2">
          {PRESET_IDS.map((id) => (
            <label
              key={id}
              className="cursor-pointer select-none rounded-md border border-line bg-bg px-3 py-1.5 text-sm whitespace-nowrap transition-colors duration-150 hover:border-muted has-checked:border-ink has-checked:bg-ink has-checked:text-panel has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent"
            >
              <input
                type="radio"
                name="preset"
                value={id}
                checked={state.preset === id}
                onChange={() => onPreset(id)}
                className="sr-only"
              />
              {PRESETS[id].label}
            </label>
          ))}
        </div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <p className="m-0 max-w-[46ch] text-[12.5px] text-muted" aria-live="polite">
            <strong className="font-semibold text-ink">Example values for {preset.phrase}.</strong> Replace them with your
            own. {preset.hint}
          </p>
          <label className="flex items-center gap-2 text-[13px] text-muted" htmlFor="currency">
            Currency
            <select
              id="currency"
              value={sym}
              onChange={(e) => onCurrency(e.target.value as Currency)}
              className="rounded-md border border-line bg-bg px-2 py-1.5 text-sm text-ink"
            >
              {CURRENCIES.map((c) => (
                <option key={c.symbol} value={c.symbol}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </fieldset>

      <fieldset className="flex min-w-0 flex-col gap-3">
        <Legend>Your fleet today</Legend>
        <Row id="machines" label="Machines">
          <NumberInput id="machines" min={1} {...f("machines")} />
        </Row>
        <Row id="daily" label="Sales per machine per day" hint="Cash only, today">
          <NumberInput id="daily" prefix={sym} {...f("dailySalesPerMachine")} />
        </Row>
        <Row id="days" label="Selling days per month">
          <NumberInput id="days" min={1} max={31} {...f("sellingDays")} />
        </Row>
        <Row id="margin" label="Gross margin on products" hint="What you keep after product cost">
          <NumberInput id="margin" max={100} unit="%" {...f("marginPct")} />
        </Row>
      </fieldset>

      <fieldset className="flex min-w-0 flex-col gap-3">
        <Legend>With card payments: three estimates</Legend>
        <p className="m-0 text-[12.5px] text-muted">
          Nobody knows the exact uplift before a pilot. Give a low, a likely and a high figure; the display compares all
          three.
        </p>
        <div role="group" aria-labelledby="sc-head" className="grid grid-cols-3 gap-x-2 gap-y-3 sm:grid-cols-[minmax(0,1fr)_repeat(3,88px)]">
          <span id="sc-head" className="sr-only">
            Scenario estimates
          </span>
          <span className="hidden sm:block" aria-hidden="true" />
          {SCENARIO_IDS.map((id) => (
            <span key={id} className="label-caps text-right text-[11px] text-muted" aria-hidden="true">
              {SCENARIO_LABEL[id]}
            </span>
          ))}

          <p id="uplift-label" className="col-span-3 m-0 text-sm leading-snug sm:col-span-1">
            Sales increase <EstimateTag />
            <small className="block text-xs text-muted">Buyers without coins can now pay</small>
          </p>
          {SCENARIO_IDS.map((id) => (
            <NumberInput
              key={id}
              id={`uplift-${id}`}
              max={200}
              unit="%"
              value={state.scenarios[id].upliftPct}
              onChange={(v) => onScenario(id, "upliftPct", v)}
              aria-label={`Sales increase, ${SCENARIO_LABEL[id]}${id === "realistic" && isMeasured(state, "upliftPct") ? ", measured from pilot data" : ""}`}
              measured={id === "realistic" && isMeasured(state, "upliftPct")}
              aria-describedby="uplift-label"
            />
          ))}

          <p id="share-label" className="col-span-3 m-0 text-sm leading-snug sm:col-span-1">
            Share paid by card or phone <EstimateTag />
          </p>
          {SCENARIO_IDS.map((id) => (
            <NumberInput
              key={id}
              id={`share-${id}`}
              max={100}
              unit="%"
              value={state.scenarios[id].cardSharePct}
              onChange={(v) => onScenario(id, "cardSharePct", v)}
              aria-label={`Share paid by card or phone, ${SCENARIO_LABEL[id]}${id === "realistic" && isMeasured(state, "cardSharePct") ? ", measured from pilot data" : ""}`}
              measured={id === "realistic" && isMeasured(state, "cardSharePct")}
              aria-describedby="share-label"
            />
          ))}
        </div>
        {(isMeasured(state, "upliftPct") || isMeasured(state, "cardSharePct")) && (
          <p className="m-0 flex items-start gap-2 text-[12.5px] text-muted">
            <span className="mt-1.5 inline-block size-2 shrink-0 rounded-full bg-gain" aria-hidden="true" />
            <span>
              <strong className="font-semibold text-ink">Green fields come from your pilot data.</strong> Change one and it
              counts as your estimate again.
            </span>
          </p>
        )}
        <Row id="handling" label="Cash handling saved per machine per month" hint="Fewer collections, counting and coin top-ups">
          <NumberInput id="handling" prefix={sym} {...f("handlingSavedPerMachine")} />
        </Row>
      </fieldset>

      <fieldset className="flex min-w-0 flex-col gap-3">
        <Legend>Cost of the card readers</Legend>
        <Row id="hardware" label="Reader price per machine" hint="One-off, including installation">
          <NumberInput id="hardware" prefix={sym} {...f("readerPrice")} />
        </Row>
        <Row id="service" label="Service fee per reader per month">
          <NumberInput id="service" prefix={sym} {...f("monthlyServiceFee")} />
        </Row>
        <Row id="fee" label="Card processing fee" hint="Charged on card and phone sales">
          <NumberInput id="fee" max={20} unit="%" {...f("feePct")} />
        </Row>
      </fieldset>
    </form>
  );
}
