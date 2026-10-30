"use client";

import { useMemo, useState } from "react";
import { pct } from "@/lib/format";
import { analysePilot, guessInstallDate, parsePilotCsv, type ParseResult } from "@/lib/pilot";
import { isMeasured, type CalcState, type PilotFigures } from "@/lib/state";

type Props = {
  state: CalcState;
  onApply: (p: Omit<PilotFigures, "replaced">) => void;
  onClear: () => void;
};

const MAX_BYTES = 5_000_000;

const fmtDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

function Figure({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5 border-t border-line pt-2">
      <span className="text-xs text-muted">{label}</span>
      <span className="num text-xl font-semibold">{value}</span>
      <span className="text-xs text-muted">{note}</span>
    </div>
  );
}

export function PilotPanel({ state, onApply, onClear }: Props) {
  const [file, setFile] = useState<{ name: string; parsed: ParseResult } | null>(null);
  const [install, setInstall] = useState("");
  const [readError, setReadError] = useState("");

  const analysis = useMemo(() => (file && install ? analysePilot(file.parsed.rows, install) : null), [file, install]);
  const inUse = isMeasured(state, "upliftPct") || isMeasured(state, "cardSharePct");

  const onFile = (f: File | undefined) => {
    setReadError("");
    if (!f) return;
    if (f.size > MAX_BYTES) return setReadError("That file is over 5 MB. Export a shorter period or fewer machines.");
    f.text().then(
      (text) => {
        const parsed = parsePilotCsv(text);
        setFile({ name: f.name, parsed });
        setInstall(guessInstallDate(parsed.rows) ?? "");
      },
      () => setReadError("The file could not be read."),
    );
  };

  const figures: Omit<PilotFigures, "replaced"> | null = analysis && {
    upliftPct: analysis.upliftPct,
    cardSharePct: analysis.cardSharePct,
    machines: analysis.machines,
    daysBefore: analysis.daysBefore,
    daysAfter: analysis.daysAfter,
  };
  const usable = figures && (figures.upliftPct !== null || figures.cardSharePct !== null);
  const sameAsApplied =
    !!figures && inUse && state.pilot?.upliftPct === figures.upliftPct && state.pilot?.cardSharePct === figures.cardSharePct;

  return (
    <section className="flex min-w-0 flex-col gap-4 rounded-[10px] border border-line bg-panel p-5" aria-labelledby="pilot-head">
      <div className="flex flex-col gap-1.5">
        <h2 id="pilot-head" className="label-caps m-0 border-b border-line pb-1.5 text-muted">
          Measured figures from a pilot
        </h2>
        <p className="m-0 text-[13px] text-muted">
          Readers already on a few machines? Upload their sales as a CSV with the columns{" "}
          <code className="num text-[12px] text-ink">date, machine, sales, payment_type</code>. The sales increase and the
          card share are then measured instead of estimated. The file is read in this browser and not uploaded anywhere.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <label className="cursor-pointer rounded-md border border-line bg-bg px-3 py-2 text-sm font-semibold whitespace-nowrap text-ink transition-colors duration-150 hover:border-muted has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent">
          <input
            type="file"
            accept=".csv,text/csv,text/plain"
            className="sr-only"
            onChange={(e) => {
              onFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          {file ? "Choose another file" : "Choose a CSV file"}
        </label>
        <a href="/example-pilot-data.csv" download className="text-sm font-semibold whitespace-nowrap text-accent underline-offset-4 hover:underline">
          Download example data
        </a>
      </div>

      {readError && (
        <p className="m-0 text-sm text-loss" role="alert">
          {readError}
        </p>
      )}

      {file && file.parsed.errors.length > 0 && (
        <p className="m-0 text-sm text-loss" role="alert">
          {file.name}: {file.parsed.errors.join(" ")}
        </p>
      )}

      {file && analysis && (
        <div className="flex flex-col gap-3" aria-live="polite">
          <p className="m-0 text-[13px] text-muted">
            <span className="font-semibold text-ink">{file.name}</span>: {analysis.machines} machines,{" "}
            {fmtDate(analysis.firstDate)} to {fmtDate(analysis.lastDate)}, {file.parsed.rows.length} rows read
            {file.parsed.skipped > 0 && <> ({file.parsed.skipped} unreadable rows skipped)</>}.
          </p>

          <label className="flex flex-wrap items-center gap-3 text-sm">
            Readers installed on
            <input
              type="date"
              value={install}
              min={analysis.firstDate}
              max={analysis.lastDate}
              onChange={(e) => e.target.value && setInstall(e.target.value)}
              className="num rounded-md border border-line bg-bg px-2.5 py-1.5 text-sm text-ink hover:border-muted"
            />
            <span className="text-xs text-muted">First day with a card or phone sale. Change it if the install was earlier.</span>
          </label>

          <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2">
            <Figure
              label="Share paid by card or phone"
              value={analysis.cardSharePct === null ? "–" : pct(analysis.cardSharePct)}
              note={analysis.cardSharePct === null ? "No sales after the install date." : `${analysis.daysAfter} days since the install`}
            />
            <Figure
              label="Sales increase"
              value={analysis.upliftPct === null ? "Not measured" : pct(analysis.upliftPct)}
              note={
                analysis.upliftPct === null
                  ? "No sales from before the install date, so this stays your estimate."
                  : `${analysis.comparableMachines} machines, ${analysis.daysBefore} days before vs ${analysis.daysAfter} after`
              }
            />
          </div>

          {analysis.upliftPct !== null && analysis.upliftPct < 0 && (
            <p className="m-0 text-[13px] text-muted">Sales fell after the install in this period. The realistic case will use 0 %.</p>
          )}
          <p className="m-0 text-xs text-muted">
            A before-and-after comparison also picks up seasons, holidays and price changes. A longer pilot, or the same weeks
            compared year on year, gives a steadier figure.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={!usable || sameAsApplied}
              onClick={() => figures && onApply(figures)}
              className="cursor-pointer rounded-md bg-ink px-3.5 py-2.5 text-sm font-semibold whitespace-nowrap text-panel transition-opacity duration-150 hover:opacity-90 active:opacity-80 disabled:cursor-default disabled:opacity-40"
            >
              {sameAsApplied ? "In use in the realistic case" : "Use in the realistic case"}
            </button>
          </div>
        </div>
      )}

      {inUse && state.pilot && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-bg px-3 py-2.5 text-[13px]">
          <span>
            <span className="mr-1.5 inline-block size-2 rounded-full bg-gain align-middle" aria-hidden="true" />
            The realistic case uses pilot figures from {state.pilot.machines} machines.
          </span>
          <button
            type="button"
            onClick={onClear}
            className="cursor-pointer rounded-md border border-line bg-transparent px-2.5 py-1.5 text-sm font-semibold whitespace-nowrap text-accent hover:border-accent"
          >
            Stop using them
          </button>
        </div>
      )}
    </section>
  );
}
