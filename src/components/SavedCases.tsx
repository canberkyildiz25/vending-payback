"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { paybackLabel } from "@/lib/format";
import { computePayback } from "@/lib/payback";
import { PRESETS } from "@/lib/presets";
import { SAVED_KEY, caseState, listCases, removeCase, restoreCase, saveCase, type SavedCase } from "@/lib/saved";
import type { CalcState } from "@/lib/state";

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

const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

type Props = { state: CalcState; onOpen: (s: CalcState) => void };

export function SavedCases({ state, onOpen }: Props) {
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
  const blocked = () => say("This browser blocks saving. Bookmark the page instead: the address holds every figure.");

  const save = () => {
    const replacing = cases.some((c) => c.name.toLowerCase() === name.trim().toLowerCase());
    const next = saveCase(storage(), name, state);
    if (!next) return blocked();
    notify();
    say(replacing ? `Updated “${next[0].name}”.` : `Saved “${next[0].name}”.`);
    setName("");
  };

  const remove = (c: SavedCase, index: number) => {
    if (!removeCase(storage(), c.id)) return blocked();
    notify();
    say(`Deleted “${c.name}”.`, { entry: c, index });
  };

  const undo = () => {
    if (!status?.undo) return;
    if (!restoreCase(storage(), status.undo.entry, status.undo.index)) return blocked();
    notify();
    say(`Restored “${status.undo.entry.name}”.`);
  };

  return (
    <section className="flex min-w-0 flex-col gap-4 rounded-[10px] border border-line bg-panel p-5" aria-labelledby="saved-head">
      <div className="flex flex-col gap-1.5">
        <h2 id="saved-head" className="label-caps m-0 border-b border-line pb-1.5 text-muted">
          Saved client cases
        </h2>
        <p className="m-0 text-[13px] text-muted">Kept in this browser only. Nothing is sent to a server.</p>
      </div>

      <form
        className="flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <label htmlFor="case-name" className="sr-only">
          Name for this case
        </label>
        <input
          id="case-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={80}
          placeholder="Client or site name"
          autoComplete="off"
          className="min-w-0 flex-1 basis-48 rounded-md border border-line bg-bg px-2.5 py-2 text-sm text-ink hover:border-muted focus-visible:border-accent"
        />
        <button
          type="submit"
          disabled={!name.trim()}
          className="cursor-pointer rounded-md bg-ink px-3.5 py-2 text-sm font-semibold whitespace-nowrap text-panel transition-opacity duration-150 hover:opacity-90 active:opacity-80 disabled:cursor-default disabled:opacity-40"
        >
          Save current figures
        </button>
      </form>

      <p className="m-0 min-h-5 text-[13px]" role="status">
        {status && (
          <>
            {status.text}{" "}
            {status.undo && (
              <button type="button" onClick={undo} className="cursor-pointer border-0 bg-transparent p-0 font-semibold text-accent underline underline-offset-4">
                Undo
              </button>
            )}
          </>
        )}
      </p>

      {cases.length > 0 ? (
        <ul className="m-0 flex list-none flex-col p-0">
          {cases.map((c, i) => {
            const s = caseState(c);
            const pb = paybackLabel(computePayback(s.fleet, s.scenarios.realistic).paybackMonths);
            return (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 border-t border-line py-2.5">
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-semibold">{c.name}</span>
                  <span className="text-xs text-muted">
                    {PRESETS[s.preset].label} · {s.fleet.machines} machines · realistic payback{" "}
                    <span className="num">{pb.value}</span> {pb.unit} · {fmt(c.savedAt)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onOpen(s);
                      say(`Opened “${c.name}”.`);
                    }}
                    aria-label={`Open ${c.name}`}
                    className="cursor-pointer rounded-md border border-line bg-bg px-2.5 py-1.5 text-sm font-semibold text-ink hover:border-muted active:bg-line"
                  >
                    Open
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(c, i)}
                    aria-label={`Delete ${c.name}`}
                    className="cursor-pointer rounded-md border border-transparent bg-transparent px-2.5 py-1.5 text-sm font-semibold text-loss hover:border-line"
                  >
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="m-0 text-[13px] text-muted">No saved cases yet. Name the figures above and save them to come back later.</p>
      )}
    </section>
  );
}
