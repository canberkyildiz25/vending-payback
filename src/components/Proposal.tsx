"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { createFormat } from "@/lib/format";
import { LANGS, LANG_NAME, MESSAGES, type Lang } from "@/lib/i18n";
import { breakEvenUplift, costOfDelay } from "@/lib/insights";
import { computePayback, type FleetInputs, type PaybackResult } from "@/lib/payback";
import { SCENARIO_IDS, type ScenarioId } from "@/lib/scenarios";
import { isMeasured, presetFleet, toSearchParams, type CalcState } from "@/lib/state";
import { LangSwitcher, useI18n } from "./I18n";
import { MethodList, Signature } from "./Method";
import { PaybackChart } from "./PaybackChart";

const LOGO_KEY = "vending-payback:logo";
const MAX_LOGO_BYTES = 1_500_000;

type Props = { initial: CalcState; initialClient: string; initialBy: string; initialDocLang: Lang | null };

// The logo lives in sessionStorage so it survives a reload of the tab, with an
// in-memory copy for browsers that block storage. It is never sent anywhere.
let memoryLogo: string | null = null;
const LOGO_EVENT = "vending-payback:logo";

function readLogo(): string | null {
  try {
    return sessionStorage.getItem(LOGO_KEY) ?? memoryLogo;
  } catch {
    return memoryLogo;
  }
}
function writeLogo(v: string | null) {
  memoryLogo = v;
  try {
    if (v) sessionStorage.setItem(LOGO_KEY, v);
    else sessionStorage.removeItem(LOGO_KEY);
  } catch {
    /* private mode: the logo just won't survive a reload */
  }
  window.dispatchEvent(new Event(LOGO_EVENT));
}
function subscribeLogo(cb: () => void) {
  window.addEventListener(LOGO_EVENT, cb);
  return () => window.removeEventListener(LOGO_EVENT, cb);
}

const noSubscribe = () => () => {};

function Mark({ children, tone }: { children: ReactNode; tone: "muted" | "coin" | "gain" }) {
  const color = tone === "coin" ? "text-paper-coin" : tone === "gain" ? "text-paper-gain" : "text-paper-muted";
  return <span className={`text-[10.5px] font-semibold tracking-[.06em] whitespace-nowrap uppercase ${color}`}>{children}</span>;
}

function Th({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return <th className={`label-caps border-b border-paper-ink py-2 text-[11px] font-bold ${className}`}>{children}</th>;
}
function Td({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <td className={`border-b border-paper-line py-2 ${className}`}>{children}</td>;
}

export function Proposal({ initial, initialClient, initialBy, initialDocLang }: Props) {
  const state = initial;
  // ui: the controls, in the visitor's language. doc: the proposal itself, in the client's.
  const { lang: uiLang, t: ui } = useI18n(state.currency);
  const [docLang, setDocLang] = useState<Lang>(initialDocLang ?? uiLang);
  const t = MESSAGES[docLang];
  const fmt = useMemo(() => createFormat(docLang, state.currency), [docLang, state.currency]);
  const P = t.proposal;
  const U = ui.proposal;

  const [client, setClient] = useState(initialClient);
  const [by, setBy] = useState(initialBy);
  // Browser-only values; the server renders them empty so hydration matches.
  const logo = useSyncExternalStore(subscribeLogo, readLogo, () => null);
  const today = useSyncExternalStore(noSubscribe, () => fmt.date(new Date().toISOString(), "long"), () => "");
  const [logoError, setLogoError] = useState("");

  const calcQuery = useMemo(() => toSearchParams(state).toString(), [state]);
  useEffect(() => {
    const id = setTimeout(() => {
      const q = new URLSearchParams(calcQuery);
      if (client.trim()) q.set("client", client.trim());
      if (by.trim()) q.set("by", by.trim());
      if (docLang !== uiLang) q.set("plang", docLang);
      window.history.replaceState(null, "", `?${q}`);
    }, 300);
    return () => clearTimeout(id);
  }, [calcQuery, client, by, docLang, uiLang]);

  const results = useMemo(
    () => Object.fromEntries(SCENARIO_IDS.map((id) => [id, computePayback(state.fleet, state.scenarios[id])])) as Record<ScenarioId, PaybackResult>,
    [state],
  );
  const base = results.realistic;
  const example = presetFleet(state.preset, state.currency);
  const isExample = (k: keyof FleetInputs) => state.fleet[k] === example[k];
  const who = client.trim() || P.yourFleet;
  const be = breakEvenUplift(state.fleet, state.scenarios.realistic.cardSharePct);
  const delay = costOfDelay(state.fleet, state.scenarios.realistic, 6);
  const anyMeasured = isMeasured(state, "upliftPct") || isMeasured(state, "cardSharePct");

  const onLogo = (file: File | undefined) => {
    setLogoError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) return setLogoError(U.logoNotImage);
    if (file.size > MAX_LOGO_BYTES) return setLogoError(U.logoTooBig);
    const reader = new FileReader();
    reader.onload = () => writeLogo(String(reader.result));
    reader.readAsDataURL(file);
  };

  const field = "min-h-10 w-full min-w-0 rounded-md border border-line bg-bg px-2.5 py-2 text-sm text-ink hover:border-muted focus-visible:border-accent";
  const btn = "inline-flex min-h-10 cursor-pointer items-center rounded-md border border-line bg-bg px-3 text-sm font-semibold whitespace-nowrap text-ink hover:border-muted";

  const f = state.fleet;
  const fleetRows: { k: keyof FleetInputs; value: string }[] = [
    { k: "machines", value: fmt.num(f.machines, 0) },
    { k: "dailySalesPerMachine", value: fmt.money(f.dailySalesPerMachine) },
    { k: "sellingDays", value: fmt.num(f.sellingDays, 0) },
    { k: "marginPct", value: fmt.pct(f.marginPct) },
    { k: "handlingSavedPerMachine", value: fmt.money(f.handlingSavedPerMachine) },
    { k: "readerPrice", value: fmt.money(f.readerPrice) },
    { k: "monthlyServiceFee", value: fmt.money(f.monthlyServiceFee, 2) },
    { k: "feePct", value: fmt.pct(f.feePct) },
  ];

  const scenarioRow = (label: ReactNode, cell: (id: ScenarioId) => ReactNode, className = "") => (
    <tr className={className}>
      <Td className="font-sans">{label}</Td>
      {SCENARIO_IDS.map((id) => (
        <Td key={id} className={`text-right ${id === "realistic" && className ? "text-paper-coin" : ""}`}>
          {cell(id)}
        </Td>
      ))}
    </tr>
  );
  const pctCell = (k: "upliftPct" | "cardSharePct", id: ScenarioId) => (
    <span className="inline-flex items-baseline justify-end gap-1.5">
      {id === "realistic" && isMeasured(state, k) && <Mark tone="gain">{P.measured}</Mark>}
      {fmt.pct(state.scenarios[id][k])}
    </span>
  );

  return (
    <main className="mx-auto flex max-w-[1120px] flex-col gap-6 px-4 pt-5 pb-10 print:p-0">
      <section className="no-print flex flex-col gap-4 rounded-[10px] border border-line bg-panel p-5 sm:p-6" aria-labelledby="prep-head">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 id="prep-head" className="m-0 font-display text-2xl font-extrabold [font-stretch:82%]">
            {U.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4">
            <Link href={`/?${calcQuery}`} className="text-sm font-semibold whitespace-nowrap text-accent underline-offset-4 hover:underline">
              {U.back}
            </Link>
            <LangSwitcher />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)]">
          <label className="flex flex-col gap-1 text-sm">
            {U.clientName}
            <input className={field} value={client} onChange={(e) => setClient(e.target.value)} placeholder={U.clientPlaceholder} autoComplete="off" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            {U.preparedBy}
            <input className={field} value={by} onChange={(e) => setBy(e.target.value)} placeholder={U.preparedPlaceholder} autoComplete="off" />
          </label>
          <div className="flex flex-col gap-1 text-sm">
            <span id="logo-label">{U.logo}</span>
            <div className="flex flex-wrap items-center gap-2">
              {/* the native file button would follow the OS language; this one follows the page */}
              <label className={`${btn} has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent`}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    onLogo(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                  className="sr-only"
                  aria-labelledby="logo-label"
                  aria-describedby="logo-note"
                />
                {logo ? U.chooseAnother : U.chooseImage}
              </label>
              {logo && (
                <button type="button" onClick={() => writeLogo(null)} className={`${btn} bg-transparent text-accent hover:border-accent`}>
                  {U.remove}
                </button>
              )}
            </div>
            <span id="logo-note" className={`text-xs ${logoError ? "text-loss" : "text-muted"}`} role={logoError ? "alert" : undefined}>
              {logoError || U.logoNote}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <label className="flex items-center gap-2 text-sm">
            {U.docLang}
            <select
              value={docLang}
              onChange={(e) => setDocLang(e.target.value as Lang)}
              className="min-h-10 cursor-pointer rounded-md border border-line bg-bg px-2 text-sm text-ink hover:border-muted"
            >
              {LANGS.map((l) => (
                <option key={l} value={l}>
                  {LANG_NAME[l]}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex min-h-11 cursor-pointer items-center rounded-md bg-ink px-4 text-sm font-semibold whitespace-nowrap text-panel transition-opacity duration-150 hover:opacity-90 active:opacity-80"
          >
            {U.print}
          </button>
          <p className="m-0 text-xs text-muted">{U.printHint}</p>
        </div>
      </section>

      <article
        lang={docLang}
        className="sheet-paper mx-auto flex w-full max-w-[794px] flex-col gap-7 rounded-[4px] border border-paper-line bg-paper px-6 py-8 text-paper-ink shadow-[0_1px_2px_rgb(0_0_0/.06),0_12px_32px_-12px_rgb(0_0_0/.18)] sm:px-12 sm:py-12"
      >
        <header className="flex flex-col gap-5">
          <div className="flex items-start justify-between gap-4">
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element -- local data URL, nothing to optimise
              <img src={logo} alt={P.logoAlt(client.trim())} className="max-h-14 max-w-[180px] object-contain" />
            ) : (
              <span className="label-caps text-[11px] text-paper-muted">{P.businessCase}</span>
            )}
            <span className="num text-right text-xs text-paper-muted">{today}</span>
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="m-0 font-display text-[clamp(26px,4.4vw,38px)] leading-[1.06] font-extrabold text-balance [overflow-wrap:anywhere] [font-stretch:82%]">
              {P.heading(who)}
            </h2>
            <p className="m-0 max-w-[62ch] text-[15px] text-paper-muted">
              {by.trim() ? P.preparedByLine(by.trim()) : null}
              {P.basedOn(f.machines)}
              <span className="num text-paper-ink">{fmt.money(base.monthlySalesToday)}</span>
              {P.perMonth}
            </p>
          </div>
        </header>

        <section className="print-avoid-break flex flex-col gap-3" aria-labelledby="p-cases">
          <h3 id="p-cases" className="m-0 font-display text-lg font-bold [font-stretch:90%]">
            {P.returns}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[460px] border-collapse text-sm">
              <thead>
                <tr>
                  <Th className="text-left">
                    <span className="sr-only">{P.measure}</span>
                  </Th>
                  {SCENARIO_IDS.map((id) => (
                    <Th key={id} className={`text-right ${id === "realistic" ? "text-paper-coin" : ""}`}>
                      {t.scenario[id]}
                    </Th>
                  ))}
                </tr>
              </thead>
              <tbody className="num">
                {scenarioRow(
                  <>
                    {P.rowUplift} <Mark tone="coin">{P.estimate}</Mark>
                  </>,
                  (id) => pctCell("upliftPct", id),
                )}
                {scenarioRow(
                  <>
                    {P.rowShare} <Mark tone="coin">{P.estimate}</Mark>
                  </>,
                  (id) => pctCell("cardSharePct", id),
                )}
                {scenarioRow(P.rowNet, (id) => fmt.money(results[id].netMonthly))}
                {scenarioRow(P.rowPayback, (id) => fmt.paybackText(results[id].paybackMonths), "font-semibold")}
                {scenarioRow(P.row3y, (id) => fmt.money(results[id].net3Years))}
              </tbody>
            </table>
          </div>
          {state.pilot && anyMeasured && <p className="m-0 text-sm text-paper-muted">{P.measuredNote(state.pilot.machines, state.pilot.daysBefore, state.pilot.daysAfter)}</p>}
          <p className="m-0 text-sm text-paper-muted">
            {P.upfrontEvery}
            <span className="num text-paper-ink">{fmt.money(base.upfront)}</span>
            {P.upfrontFor(f.machines)}
          </p>
        </section>

        <section className="print-avoid-break flex flex-col gap-1.5" aria-labelledby="p-true">
          <h3 id="p-true" className="m-0 font-display text-lg font-bold [font-stretch:90%]">
            {t.sales.proposal.title}
          </h3>
          <p className="m-0 text-sm">
            {be.kind === "needs" ? t.sales.email.breakEven(fmt.pct(be.upliftPct)) : be.kind === "no-growth-needed" ? t.sales.email.noGrowth : t.sales.insight.impossible}
          </p>
          {delay > 0 && <p className="m-0 text-sm">{t.sales.email.delay(fmt.money(delay))}</p>}
        </section>

        <section className="print-avoid-break flex flex-col gap-2" aria-labelledby="p-chart">
          <h3 id="p-chart" className="m-0 font-display text-lg font-bold [font-stretch:90%]">
            {P.chartTitle}
          </h3>
          <PaybackChart results={results} selected="realistic" t={t} fmt={fmt} />
        </section>

        <section className="print-avoid-break flex flex-col gap-2" aria-labelledby="p-assume">
          <h3 id="p-assume" className="m-0 font-display text-lg font-bold [font-stretch:90%]">
            {P.assume}
          </h3>
          <table className="w-full border-collapse text-sm">
            <tbody>
              {fleetRows.map((row) => (
                <tr key={row.k}>
                  <Td>
                    {P.fleetRows[row.k]} {isExample(row.k) && <Mark tone="muted">{P.example}</Mark>}
                  </Td>
                  <Td className="num pl-3 text-right whitespace-nowrap">{row.value}</Td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="m-0 text-xs text-paper-muted">{P.legend(t.presets[state.preset].label.toLocaleLowerCase(fmt.locale))}</p>
        </section>

        <section className="print-avoid-break flex flex-col gap-3 text-paper-ink" aria-labelledby="p-method">
          <h3 id="p-method" className="m-0 font-display text-lg font-bold [font-stretch:90%]">
            {t.method.title}
          </h3>
          <div className="[--ink:var(--paper-ink)] [--line:var(--paper-line)] [--muted:var(--paper-muted)]">
            <MethodList t={t} />
          </div>
        </section>

        <section className="print-avoid-break flex flex-col gap-1 border-t-2 border-paper-ink pt-4" aria-labelledby="p-next">
          <h3 id="p-next" className="m-0 font-display text-lg font-bold [font-stretch:90%]">
            {P.nextStep}
          </h3>
          <p className="m-0 max-w-[62ch] text-sm">{P.nextStepBody}</p>
        </section>

        <Signature t={t} className="text-paper-muted" />
      </article>
    </main>
  );
}
