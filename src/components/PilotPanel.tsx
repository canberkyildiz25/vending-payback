"use client";

import { useMemo, useState } from "react";
import { analysePilot, guessInstallDate, parsePilotCsv, type ParseResult, type PilotError } from "@/lib/pilot";
import { isMeasured, type CalcState, type PilotFigures } from "@/lib/state";
import { useI18n } from "./I18n";

type Props = {
  state: CalcState;
  onApply: (p: Omit<PilotFigures, "replaced">) => void;
  onClear: () => void;
};

const MAX_BYTES = 5_000_000;

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
  const { t, fmt } = useI18n(state.currency);
  const P = t.pilot;
  const errorText = (e: PilotError) => (e.code === "empty" ? P.errEmpty : e.code === "missing" ? P.errMissing(e.columns.join(", ")) : P.errNoRows);
  const [file, setFile] = useState<{ name: string; parsed: ParseResult } | null>(null);
  const [install, setInstall] = useState("");
  const [readError, setReadError] = useState("");

  const analysis = useMemo(() => (file && install ? analysePilot(file.parsed.rows, install) : null), [file, install]);
  const inUse = isMeasured(state, "upliftPct") || isMeasured(state, "cardSharePct");

  const onFile = (f: File | undefined) => {
    setReadError("");
    if (!f) return;
    if (f.size > MAX_BYTES) return setReadError(P.tooBig);
    f.text().then(
      (text) => {
        const parsed = parsePilotCsv(text);
        setFile({ name: f.name, parsed });
        setInstall(guessInstallDate(parsed.rows) ?? "");
      },
      () => setReadError(P.unreadable),
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
    <section className="flex min-w-0 flex-col gap-4 bg-panel p-5 sm:p-6" aria-labelledby="pilot-head">
      <div className="flex flex-col gap-1.5">
        <h2 id="pilot-head" className="band m-0">
          {P.title}
        </h2>
        <p className="m-0 text-[13px] text-muted">
          {P.introBefore} <code className="num text-[12px] text-ink">date, machine, sales, payment_type</code>. {P.introAfter}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <label className="inline-flex min-h-11 cursor-pointer items-center border border-ink bg-bg px-4 text-sm font-semibold whitespace-nowrap text-ink transition-colors duration-150 hover:border-muted has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent">
          <input
            type="file"
            accept=".csv,text/csv,text/plain"
            className="sr-only"
            onChange={(e) => {
              onFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          {file ? P.chooseAnother : P.choose}
        </label>
        <a href="/example-pilot-data.csv" download className="text-sm font-semibold whitespace-nowrap text-accent underline-offset-4 hover:underline">
          {P.example}
        </a>
      </div>

      {readError && (
        <p className="m-0 text-sm text-loss" role="alert">
          {readError}
        </p>
      )}

      {file && file.parsed.errors.length > 0 && (
        <p className="m-0 text-sm text-loss" role="alert">
          {file.name}: {file.parsed.errors.map(errorText).join(" ")}
        </p>
      )}

      {file && analysis && (
        <div className="flex flex-col gap-3" aria-live="polite">
          <p className="m-0 text-[13px] text-muted">
            <span className="font-semibold text-ink">{file.name}</span>: {P.fileSummary(analysis.machines, fmt.date(analysis.firstDate), fmt.date(analysis.lastDate), file.parsed.rows.length)}
            {file.parsed.skipped > 0 && P.skipped(file.parsed.skipped)}.
          </p>

          <label className="flex flex-wrap items-center gap-3 text-sm">
            {P.installedOn}
            <input
              type="date"
              value={install}
              min={analysis.firstDate}
              max={analysis.lastDate}
              onChange={(e) => e.target.value && setInstall(e.target.value)}
              className="num border border-ink bg-bg px-2.5 py-1.5 text-sm text-ink hover:border-muted"
            />
            <span className="text-xs text-muted">{P.installHint}</span>
          </label>

          <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2">
            <Figure
              label={P.shareLabel}
              value={analysis.cardSharePct === null ? "–" : fmt.pct(analysis.cardSharePct)}
              note={analysis.cardSharePct === null ? P.noAfter : P.daysSince(analysis.daysAfter)}
            />
            <Figure
              label={P.increaseLabel}
              value={analysis.upliftPct === null ? P.notMeasured : fmt.pct(analysis.upliftPct)}
              note={
                analysis.upliftPct === null
                  ? P.noBefore
                  : P.comparison(analysis.comparableMachines, analysis.daysBefore, analysis.daysAfter)
              }
            />
          </div>

          {analysis.upliftPct !== null && analysis.upliftPct < 0 && (
            <p className="m-0 text-[13px] text-muted">{P.fell}</p>
          )}
          <p className="m-0 text-xs text-muted">
            {P.caveat}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={!usable || sameAsApplied}
              onClick={() => figures && onApply(figures)}
              className="inline-flex min-h-11 cursor-pointer items-center bg-ink px-4 text-sm font-semibold whitespace-nowrap text-panel transition-opacity duration-150 hover:opacity-90 active:opacity-80 disabled:cursor-default disabled:opacity-40"
            >
              {sameAsApplied ? P.inUse : P.use}
            </button>
          </div>
        </div>
      )}

      {inUse && state.pilot && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-bg px-3 py-2.5 text-[13px]">
          <span>
            <span className="mr-1.5 inline-block size-2 rounded-full bg-gain align-middle" aria-hidden="true" />
            {P.banner(state.pilot.machines)}
          </span>
          <button
            type="button"
            onClick={onClear}
            className="cursor-pointer border border-line bg-transparent px-2.5 py-1.5 text-sm font-semibold whitespace-nowrap text-accent hover:border-accent"
          >
            {P.stop}
          </button>
        </div>
      )}
    </section>
  );
}
