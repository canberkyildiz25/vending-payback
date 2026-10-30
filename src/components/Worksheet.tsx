"use client";

import Image, { type StaticImageData } from "next/image";
import type { ReactNode } from "react";
import campus from "@/assets/campus.webp";
import custom from "@/assets/custom.webp";
import factory from "@/assets/factory.webp";
import gym from "@/assets/gym.webp";
import hospital from "@/assets/hospital.webp";
import office from "@/assets/office.webp";
import type { FleetInputs } from "@/lib/payback";
import { PRESET_IDS, type PresetId } from "@/lib/presets";
import { CURRENCIES, SCENARIO_IDS, type Currency, type ScenarioId } from "@/lib/scenarios";
import { isMeasured, type CalcState } from "@/lib/state";
import { useI18n } from "./I18n";
import { NumberInput } from "./NumberInput";

const PHOTO: Record<PresetId, StaticImageData> = { custom, factory, gym, campus, hospital, office };

type Props = {
  state: CalcState;
  onPreset: (p: PresetId) => void;
  onCurrency: (c: Currency) => void;
  onFleet: (k: keyof FleetInputs, v: number) => void;
  onScenario: (id: ScenarioId, k: "upliftPct" | "cardSharePct", v: number) => void;
};

function Tag({ children }: { children: ReactNode }) {
  return <span className="ml-1.5 text-[10.5px] font-semibold tracking-[.06em] whitespace-nowrap text-coin uppercase">{children}</span>;
}

export function Legend({ children }: { children: ReactNode }) {
  return (
    <legend className="mb-1 w-full border-b border-line pb-2 font-display text-[17px] leading-tight font-bold [font-stretch:88%]">
      {children}
    </legend>
  );
}

export function Row({ id, label, hint, children }: { id: string; label: ReactNode; hint?: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,128px)] items-center gap-3">
      <label htmlFor={id} className="text-sm leading-snug">
        {label}
        {hint && <small className="block text-xs text-muted">{hint}</small>}
      </label>
      {children}
    </div>
  );
}

export function PresetTiles({ state, onPreset }: Pick<Props, "state" | "onPreset">) {
  const { t } = useI18n(state.currency);
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {PRESET_IDS.map((id) => (
        <label
          key={id}
          className="group relative flex min-w-0 cursor-pointer flex-col overflow-hidden rounded-md border border-line bg-bg transition-colors duration-150 hover:border-muted has-checked:border-ink has-checked:ring-1 has-checked:ring-ink has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent"
        >
          <input type="radio" name="preset" value={id} checked={state.preset === id} onChange={() => onPreset(id)} className="sr-only" />
          <Image
            src={PHOTO[id]}
            alt=""
            sizes="(min-width: 640px) 160px, 45vw"
            placeholder="blur"
            className="aspect-[16/9] h-auto w-full object-cover grayscale transition-[filter] duration-200 group-hover:grayscale-0 group-has-checked:grayscale-0"
          />
          <span className="flex min-h-10 items-center px-2.5 py-1.5 text-[13px] leading-tight font-semibold group-has-checked:bg-ink group-has-checked:text-panel">
            {t.presets[id].label}
          </span>
        </label>
      ))}
    </div>
  );
}

export function EstimatesGrid({ state, onScenario }: Pick<Props, "state" | "onScenario">) {
  const { t } = useI18n(state.currency);
  const measured = (k: "upliftPct" | "cardSharePct") => isMeasured(state, k);
  return (
    <>
      <div role="group" aria-labelledby="sc-head" className="grid grid-cols-3 gap-x-2 gap-y-3 sm:grid-cols-[minmax(0,1fr)_repeat(3,88px)]">
        <span id="sc-head" className="sr-only">
          {t.sheet.scenarioEstimates}
        </span>
        <span className="hidden sm:block" aria-hidden="true" />
        {SCENARIO_IDS.map((id) => (
          <span key={id} className="label-caps text-right text-[10.5px] tracking-[.02em] text-muted [font-stretch:72%]" aria-hidden="true">
            {t.scenario[id]}
          </span>
        ))}

        <p id="uplift-label" className="col-span-3 m-0 text-sm leading-snug sm:col-span-1">
          {t.sheet.salesIncrease} <Tag>{t.sheet.yourEstimate}</Tag>
          <small className="block text-xs text-muted">{t.sheet.salesIncreaseHint}</small>
        </p>
        {SCENARIO_IDS.map((id) => (
          <NumberInput
            key={id}
            id={`uplift-${id}`}
            max={200}
            unit="%"
            value={state.scenarios[id].upliftPct}
            onChange={(v) => onScenario(id, "upliftPct", v)}
            aria-label={`${t.sheet.salesIncrease}, ${t.scenario[id]}${id === "realistic" && measured("upliftPct") ? t.sheet.measuredSuffix : ""}`}
            aria-describedby="uplift-label"
            measured={id === "realistic" && measured("upliftPct")}
          />
        ))}

        <p id="share-label" className="col-span-3 m-0 text-sm leading-snug sm:col-span-1">
          {t.sheet.cardShare} <Tag>{t.sheet.yourEstimate}</Tag>
        </p>
        {SCENARIO_IDS.map((id) => (
          <NumberInput
            key={id}
            id={`share-${id}`}
            max={100}
            unit="%"
            value={state.scenarios[id].cardSharePct}
            onChange={(v) => onScenario(id, "cardSharePct", v)}
            aria-label={`${t.sheet.cardShare}, ${t.scenario[id]}${id === "realistic" && measured("cardSharePct") ? t.sheet.measuredSuffix : ""}`}
            aria-describedby="share-label"
            measured={id === "realistic" && measured("cardSharePct")}
          />
        ))}
      </div>
      {(measured("upliftPct") || measured("cardSharePct")) && (
        <p className="m-0 flex items-start gap-2 text-[12.5px] text-muted">
          <span className="mt-1.5 inline-block size-2 shrink-0 rounded-full bg-gain" aria-hidden="true" />
          <span>
            <strong className="font-semibold text-ink">{t.sheet.pilotFieldsStrong}</strong> {t.sheet.pilotFieldsRest}
          </span>
        </p>
      )}
    </>
  );
}

export function Worksheet({ state, onPreset, onCurrency, onFleet, onScenario }: Props) {
  const { fleet } = state;
  const { t, fmt } = useI18n(state.currency);
  const sym = fmt.symbol;
  const f = (k: keyof FleetInputs) => ({ value: fleet[k], onChange: (v: number) => onFleet(k, v) });
  const p = t.presets[state.preset];

  return (
    <form className="flex min-w-0 flex-col gap-7 rounded-[10px] border border-line bg-panel p-5 sm:p-6" noValidate onSubmit={(e) => e.preventDefault()} aria-label={t.sheet.aria}>
      <fieldset className="m-0 flex min-w-0 flex-col gap-3 border-0 p-0">
        <Legend>{t.sheet.startFrom}</Legend>
        <PresetTiles state={state} onPreset={onPreset} />
        <div className="flex flex-wrap items-end justify-between gap-3">
          <p className="m-0 max-w-[46ch] text-[13px] text-muted" aria-live="polite">
            <strong className="font-semibold text-ink">{t.sheet.exampleFor(p.phrase)}</strong> {t.sheet.replace} {p.hint}
          </p>
          <label className="flex items-center gap-2 text-[13px] text-muted" htmlFor="currency">
            {t.sheet.currency}
            <select
              id="currency"
              value={state.currency}
              onChange={(e) => onCurrency(e.target.value as Currency)}
              className="min-h-9 cursor-pointer rounded-md border border-line bg-bg px-2 py-1.5 text-sm text-ink hover:border-muted"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>
      </fieldset>

      <fieldset className="m-0 flex min-w-0 flex-col gap-3 border-0 p-0">
        <Legend>{t.sheet.fleetToday}</Legend>
        <Row id="machines" label={t.sheet.machines}>
          <NumberInput id="machines" min={1} {...f("machines")} />
        </Row>
        <Row id="daily" label={t.sheet.dailySales} hint={t.sheet.dailySalesHint}>
          <NumberInput id="daily" prefix={sym} {...f("dailySalesPerMachine")} />
        </Row>
        <Row id="days" label={t.sheet.sellingDays}>
          <NumberInput id="days" min={1} max={31} {...f("sellingDays")} />
        </Row>
        <Row id="margin" label={t.sheet.margin} hint={t.sheet.marginHint}>
          <NumberInput id="margin" max={100} unit="%" {...f("marginPct")} />
        </Row>
      </fieldset>

      <fieldset className="m-0 flex min-w-0 flex-col gap-3 border-0 p-0">
        <Legend>{t.sheet.withCards}</Legend>
        <p className="m-0 text-[13px] text-muted">{t.sheet.estimatesIntro}</p>
        <EstimatesGrid state={state} onScenario={onScenario} />
        <Row id="handling" label={t.sheet.handling} hint={t.sheet.handlingHint}>
          <NumberInput id="handling" prefix={sym} {...f("handlingSavedPerMachine")} />
        </Row>
      </fieldset>

      <fieldset className="m-0 flex min-w-0 flex-col gap-3 border-0 p-0">
        <Legend>{t.sheet.readerCosts}</Legend>
        <Row id="hardware" label={t.sheet.readerPrice} hint={t.sheet.readerPriceHint}>
          <NumberInput id="hardware" prefix={sym} {...f("readerPrice")} />
        </Row>
        <Row id="service" label={t.sheet.serviceFee}>
          <NumberInput id="service" prefix={sym} {...f("monthlyServiceFee")} />
        </Row>
        <Row id="fee" label={t.sheet.procFee} hint={t.sheet.procFeeHint}>
          <NumberInput id="fee" max={20} unit="%" {...f("feePct")} />
        </Row>
      </fieldset>
    </form>
  );
}
