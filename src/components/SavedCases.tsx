"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { createFormat } from "@/lib/format";
import { computePayback } from "@/lib/payback";
import { SAVED_KEY, caseState, listCases, removeCase, restoreCase, saveCase, type SavedCase } from "@/lib/saved";
import type { CalcState } from "@/lib/state";
import { useI18n } from "./I18n";

const CHANGED = "vending-payback:saved-changed";

function storage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
// The raw string is the snapshot: it compares by value, so React only re-renders on a real change.
function snapshot(): string {
  try {
    return storage()?.getItem(SAVED_KEY) ?? "";
  } catch {
    return "";
  }
}
function subscribe(cb: () => void) {
  const onStorage = (e: StorageEvent) => e.key === SAVED_KEY && cb(); // another tab
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGED, cb);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGED, cb);
  };
}
const notify = () => window.dispatchEvent(new Event(CHANGED));

type Props = { state: CalcState; onOpen: (s: CalcState) => void };

export function SavedCases({ state, onOpen }: Props) {
  const { t, fmt } = useI18n(state.currency);
  const S = t.saved;
  const raw = useSyncExternalStore(subscribe, snapshot, () => "");
  const cases = useMemo(() => (raw ? listCases({ getItem: () => raw, setItem: () => {} }) : []), [raw]);
  const [name, setName] = useState("");
  const [status, setStatus] = useState<{ text: string; undo?: { entry: SavedCase; index: number } } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);
  const say = (text: string, undo?: { entry: SavedCase; index: number }) => {
    setStatus({ text, undo });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus(null), undo ? 8000 : 3000);
  };
  const blocked = () => say(S.blocked);

  const save = () => {
    const replacing = cases.some((c) => c.name.toLowerCase() === name.trim().toLowerCase());
    const next = saveCase(storage(), name, state);
    if (!next) return blocked();
    notify();
    say(replacing ? S.updated(next[0].name) : S.saved(next[0].name));
    setName("");
  };

  const remove = (c: SavedCase, index: number) => {
    if (!removeCase(storage(), c.id)) return blocked();
    notify();
    say(S.deleted(c.name), { entry: c, index });
  };

  const undo = () => {
    if (!status?.undo) return;
    if (!restoreCase(storage(), status.undo.entry, status.undo.index)) return blocked();
    notify();
    say(S.restored(status.undo.entry.name));
  };

  return (
    <section className="flex min-w-0 flex-col gap-4 bg-panel p-5 sm:p-6" aria-labelledby="saved-head">
      <div className="flex flex-col gap-1.5">
        <h2 id="saved-head" className="band m-0">
          {S.title}
        </h2>
        <p className="m-0 text-[13px] text-muted">{S.intro}</p>
      </div>

      <form
        className="flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <label htmlFor="case-name" className="sr-only">
          {S.nameLabel}
        </label>
        <input
          id="case-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={80}
          placeholder={S.placeholder}
          autoComplete="off"
          className="min-w-0 flex-1 basis-48 border border-ink bg-bg px-2.5 py-2 text-sm text-ink hover:border-muted focus-visible:border-accent"
        />
        <button
          type="submit"
          disabled={!name.trim()}
          className="cursor-pointer bg-ink px-3.5 py-2 text-sm font-semibold whitespace-nowrap text-panel transition-opacity duration-150 hover:opacity-90 active:opacity-80 disabled:cursor-default disabled:opacity-40"
        >
          {S.save}
        </button>
      </form>

      <p className="m-0 min-h-5 text-[13px]" role="status">
        {status && (
          <>
            {status.text}{" "}
            {status.undo && (
              <button type="button" onClick={undo} className="cursor-pointer border-0 bg-transparent p-0 font-semibold text-accent underline underline-offset-4">
                {S.undo}
              </button>
            )}
          </>
        )}
      </p>

      {cases.length > 0 ? (
        <ul className="m-0 flex list-none flex-col p-0">
          {cases.map((c, i) => {
            const s = caseState(c);
            const cf = createFormat(fmt.lang, s.currency);
            const pb = cf.paybackLabel(computePayback(s.fleet, s.scenarios.realistic).paybackMonths);
            return (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 border-t border-line py-2.5">
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-semibold">{c.name}</span>
                  <span className="text-xs text-muted">
                    {t.presets[s.preset].label} · {S.machines(s.fleet.machines)} · {S.payback} <span className="num">{pb.value}</span> {pb.unit} · {cf.date(c.savedAt)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onOpen(s);
                      say(S.opened(c.name));
                    }}
                    aria-label={S.openAria(c.name)}
                    className="cursor-pointer border border-ink bg-bg px-2.5 py-1.5 text-sm font-semibold text-ink hover:border-muted active:bg-line"
                  >
                    {S.open}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(c, i)}
                    aria-label={S.delAria(c.name)}
                    className="cursor-pointer border border-transparent bg-transparent px-2.5 py-1.5 text-sm font-semibold text-loss hover:border-line"
                  >
                    {S.del}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="m-0 text-[13px] text-muted">{S.empty}</p>
      )}
    </section>
  );
}
