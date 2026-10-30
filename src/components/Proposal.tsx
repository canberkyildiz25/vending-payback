"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { money, paybackText, pct } from "@/lib/format";
import { computePayback, type FleetInputs, type PaybackResult } from "@/lib/payback";
import { PRESETS } from "@/lib/presets";
import { SCENARIO_IDS, SCENARIO_LABEL, type ScenarioId } from "@/lib/scenarios";
import { isMeasured, toSearchParams, type CalcState } from "@/lib/state";
import { MethodList, Signature } from "./Method";
import { PaybackChart } from "./PaybackChart";

const LOGO_KEY = "vending-payback:logo";
const MAX_LOGO_BYTES = 1_500_000;

type Props = { initial: CalcState; initialClient: string; initialBy: string };

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
const todayLabel = () => new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

function ExampleMark() {
  return <span className="ml-1.5 text-[10.5px] font-semibold tracking-[.06em] text-paper-muted uppercase">example value</span>;
}
function EstimateMark() {
  return <span className="ml-1.5 text-[10.5px] font-semibold tracking-[.06em] text-paper-coin uppercase">estimate</span>;
}

function MeasuredMark() {
  return <span className="mr-1.5 font-sans text-[10.5px] font-semibold tracking-[.06em] text-paper-gain uppercase">measured</span>;
}

function Th({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return <th className={`label-caps border-b border-paper-ink py-2 text-[11px] font-bold ${className}`}>{children}</th>;
}
function Td({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <td className={`border-b border-paper-line py-2 ${className}`}>{children}</td>;
}

export function Proposal({ initial, initialClient, initialBy }: Props) {
  const state = initial;
  const sym = state.currency;
  const [client, setClient] = useState(initialClient);
  const [by, setBy] = useState(initialBy);
  // Browser-only values; the server renders them empty so hydration matches.
  const logo = useSyncExternalStore(subscribeLogo, readLogo, () => null);
  const today = useSyncExternalStore(noSubscribe, todayLabel, () => "");
  const [logoError, setLogoError] = useState("");

  const calcQuery = useMemo(() => toSearchParams(state).toString(), [state]);
  useEffect(() => {
    const t = setTimeout(() => {
      const q = new URLSearchParams(calcQuery);
      if (client.trim()) q.set("client", client.trim());
      if (by.trim()) q.set("by", by.trim());
      window.history.replaceState(null, "", `?${q}`);
    }, 300);
    return () => clearTimeout(t);
  }, [calcQuery, client, by]);

  const results = useMemo(
    () => Object.fromEntries(SCENARIO_IDS.map((id) => [id, computePayback(state.fleet, state.scenarios[id])])) as Record<ScenarioId, PaybackResult>,
    [state],
  );
  const base = results.realistic;
  const preset = PRESETS[state.preset];
  const isExample = (k: keyof FleetInputs) => state.fleet[k] === preset.fleet[k];
  const who = client.trim() || "your vending fleet";

  const onLogo = (file: File | undefined) => {
    setLogoError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) return setLogoError("Choose an image file (PNG, JPG or SVG).");
    if (file.size > MAX_LOGO_BYTES) return setLogoError("That image is over 1.5 MB. Choose a smaller one.");
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result);
      writeLogo(url);
    };
    reader.readAsDataURL(file);
  };

  const field = "w-full min-w-0 rounded-md border border-line bg-bg px-2.5 py-2 text-sm text-ink hover:border-muted focus-visible:border-accent";

  const fleetRows: { k: keyof FleetInputs; label: string; value: string }[] = [
    { k: "machines", label: "Machines", value: String(state.fleet.machines) },
    { k: "dailySalesPerMachine", label: "Sales per machine per day, cash only", value: money(state.fleet.dailySalesPerMachine, sym) },
    { k: "sellingDays", label: "Selling days per month", value: String(state.fleet.sellingDays) },
    { k: "marginPct", label: "Gross margin on products", value: pct(state.fleet.marginPct) },
    { k: "handlingSavedPerMachine", label: "Cash handling saved per machine per month", value: money(state.fleet.handlingSavedPerMachine, sym) },
    { k: "readerPrice", label: "Reader price per machine, one-off", value: money(state.fleet.readerPrice, sym) },
    { k: "monthlyServiceFee", label: "Service fee per reader per month", value: money(state.fleet.monthlyServiceFee, sym, 2) },
    { k: "feePct", label: "Card processing fee", value: pct(state.fleet.feePct) },
  ];

  return (
    <main className="mx-auto flex max-w-[1120px] flex-col gap-6 px-4 pt-7 pb-10 print:p-0">
      <section className="no-print flex flex-col gap-4 rounded-[10px] border border-line bg-panel p-5" aria-labelledby="prep-head">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h1 id="prep-head" className="m-0 font-display text-2xl font-extrabold [font-stretch:82%]">
            Client proposal
          </h1>
          <Link href={`/?${calcQuery}`} className="text-sm font-semibold whitespace-nowrap text-accent underline-offset-4 hover:underline">
            ← Back to the figures
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)]">
          <label className="flex flex-col gap-1 text-sm">
            Client name
            <input className={field} value={client} onChange={(e) => setClient(e.target.value)} placeholder="Who the proposal is for" autoComplete="off" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Prepared by
            <input className={field} value={by} onChange={(e) => setBy(e.target.value)} placeholder="Your name and company" autoComplete="off" />
          </label>
          <div className="flex flex-col gap-1 text-sm">
            <span id="logo-label">Client logo (optional)</span>
            <div className="flex flex-wrap items-center gap-2">
              {/* the native file button would follow the OS language; this one stays in English */}
              <label className="cursor-pointer rounded-md border border-line bg-bg px-2.5 py-1.5 text-sm font-semibold whitespace-nowrap text-ink hover:border-muted has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent">
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
                {logo ? "Choose another image" : "Choose an image"}
              </label>
              {logo && (
                <button
                  type="button"
                  onClick={() => {
                    writeLogo(null);
                  }}
                  className="cursor-pointer rounded-md border border-line bg-transparent px-2.5 py-1.5 text-sm font-semibold text-accent hover:border-accent"
                >
                  Remove
                </button>
              )}
            </div>
            <span id="logo-note" className={`text-xs ${logoError ? "text-loss" : "text-muted"}`} role={logoError ? "alert" : undefined}>
              {logoError || "The logo stays in this browser tab. Nothing is uploaded."}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="cursor-pointer rounded-md bg-ink px-3.5 py-2.5 text-sm font-semibold whitespace-nowrap text-panel transition-opacity duration-150 hover:opacity-90 active:opacity-80"
          >
            Print or save as PDF
          </button>
          <p className="m-0 text-xs text-muted">In the print dialog, choose “Save as PDF” as the destination.</p>
        </div>
      </section>

      <article className="sheet-paper mx-auto flex w-full max-w-[794px] flex-col gap-7 rounded-[4px] border border-paper-line bg-paper px-6 py-8 text-paper-ink shadow-[0_1px_2px_rgb(0_0_0/.06),0_12px_32px_-12px_rgb(0_0_0/.18)] sm:px-12 sm:py-12">
        <header className="flex flex-col gap-5">
          <div className="flex items-start justify-between gap-4">
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element -- local data URL, nothing to optimise
              <img src={logo} alt={client ? `${client} logo` : "Client logo"} className="max-h-14 max-w-[180px] object-contain" />
            ) : (
              <span className="label-caps text-[11px] text-paper-muted">Business case</span>
            )}
            <span className="num text-right text-xs text-paper-muted">{today}</span>
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="m-0 font-display text-[clamp(26px,4.4vw,38px)] leading-[1.06] font-extrabold text-balance [font-stretch:82%]">
              Card and phone payments for {who}
            </h2>
            <p className="m-0 max-w-[62ch] text-[15px] text-paper-muted">
              {by.trim() ? <>Prepared by {by.trim()}. </> : null}
              Based on {state.fleet.machines} machines and current cash sales of{" "}
              <span className="num text-paper-ink">{money(base.monthlySalesToday, sym)}</span> per month. Three cases are shown
              because the sales increase is an estimate until a pilot measures it.
            </p>
          </div>
        </header>

        <section className="print-avoid-break flex flex-col gap-3" aria-labelledby="p-cases">
          <h3 id="p-cases" className="m-0 font-display text-lg font-bold [font-stretch:90%]">
            What the readers return
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[460px] border-collapse text-sm">
              <thead>
                <tr>
                  <Th className="text-left">
                    <span className="sr-only">Measure</span>
                  </Th>
                  {SCENARIO_IDS.map((id) => (
                    <Th key={id} className={`text-right ${id === "realistic" ? "text-paper-coin" : ""}`}>
                      {SCENARIO_LABEL[id]}
                    </Th>
                  ))}
                </tr>
              </thead>
              <tbody className="num">
                <tr>
                  <Td className="font-sans">
                    Sales increase <EstimateMark />
                  </Td>
                  {SCENARIO_IDS.map((id) => (
                    <Td key={id} className="text-right">
                      {id === "realistic" && isMeasured(state, "upliftPct") && <MeasuredMark />}
                      {pct(state.scenarios[id].upliftPct)}
                    </Td>
                  ))}
                </tr>
                <tr>
                  <Td className="font-sans">
                    Paid by card or phone <EstimateMark />
                  </Td>
                  {SCENARIO_IDS.map((id) => (
                    <Td key={id} className="text-right">
                      {id === "realistic" && isMeasured(state, "cardSharePct") && <MeasuredMark />}
                      {pct(state.scenarios[id].cardSharePct)}
                    </Td>
                  ))}
                </tr>
                <tr>
                  <Td className="font-sans">Net gain per month</Td>
                  {SCENARIO_IDS.map((id) => (
                    <Td key={id} className="text-right">{money(results[id].netMonthly, sym)}</Td>
                  ))}
                </tr>
                <tr className="font-semibold">
                  <Td className="font-sans">Payback period</Td>
                  {SCENARIO_IDS.map((id) => (
                    <Td key={id} className={`text-right ${id === "realistic" ? "text-paper-coin" : ""}`}>{paybackText(results[id].paybackMonths)}</Td>
                  ))}
                </tr>
                <tr>
                  <Td className="font-sans">Net gain after 3 years</Td>
                  {SCENARIO_IDS.map((id) => (
                    <Td key={id} className="text-right">{money(results[id].net3Years, sym)}</Td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          {state.pilot && (isMeasured(state, "upliftPct") || isMeasured(state, "cardSharePct")) && (
            <p className="m-0 text-sm text-paper-muted">
              “Measured” figures in the realistic case come from pilot data on {state.pilot.machines} machines
              {state.pilot.daysBefore > 0 ? `,  days before and  days after the readers went in` : `,  days with readers`}
              . The other cases remain estimates.
            </p>
          )}
          <p className="m-0 text-sm text-paper-muted">
            Upfront investment in every case: <span className="num text-paper-ink">{money(base.upfront, sym)}</span> for{" "}
            {state.fleet.machines} card readers, installed.
          </p>
        </section>

        <section className="print-avoid-break flex flex-col gap-2" aria-labelledby="p-chart">
          <h3 id="p-chart" className="m-0 font-display text-lg font-bold [font-stretch:90%]">
            Cumulative net position over 36 months
          </h3>
          <PaybackChart results={results} selected="realistic" sym={sym} />
        </section>

        <section className="print-avoid-break flex flex-col gap-2" aria-labelledby="p-assume">
          <h3 id="p-assume" className="m-0 font-display text-lg font-bold [font-stretch:90%]">
            What the figures assume
          </h3>
          <table className="w-full border-collapse text-sm">
            <tbody>
              {fleetRows.map((row) => (
                <tr key={row.k}>
                  <Td>
                    {row.label}
                    {isExample(row.k) && <ExampleMark />}
                  </Td>
                  <Td className="num pl-3 text-right whitespace-nowrap">{row.value}</Td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="m-0 text-xs text-paper-muted">
            “Example value” marks a figure taken from the {preset.label.toLowerCase()} starting point and not yet replaced with
            your own. “Estimate” marks a figure a pilot would measure.
          </p>
        </section>

        <section className="print-avoid-break flex flex-col gap-2 text-sm text-paper-muted" aria-labelledby="p-method">
          <h3 id="p-method" className="m-0 font-display text-lg font-bold text-paper-ink [font-stretch:90%]">
            How the numbers are worked out
          </h3>
          <MethodList />
        </section>

        <section className="print-avoid-break flex flex-col gap-1 border-t-2 border-paper-ink pt-4" aria-labelledby="p-next">
          <h3 id="p-next" className="m-0 font-display text-lg font-bold [font-stretch:90%]">
            Suggested next step
          </h3>
          <p className="m-0 max-w-[62ch] text-sm">
            Fit readers to a handful of machines for one to two months. The pilot replaces the estimated sales increase and
            card share with your own measured figures, and the business case can be rerun on them.
          </p>
        </section>

        <Signature className="text-paper-muted" />
      </article>
    </main>
  );
}
