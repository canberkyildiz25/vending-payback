"use client";

import { useState } from "react";
import { pressDigit, slotCode } from "@/lib/keypad";
import type { PresetId } from "@/lib/presets";
import type { CalcState } from "@/lib/state";
import { useI18n } from "./I18n";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

/** Type a slot number as on a real machine. The tiles do the same job for anyone who would rather click. */
export function Keypad({ state, onPreset }: { state: CalcState; onPreset: (p: PresetId) => void }) {
  const { t } = useI18n(state.currency);
  const K = t.sales.keypad;
  const [buffer, setBuffer] = useState("");
  const [invalid, setInvalid] = useState("");

  const press = (digit: string) => {
    const r = pressDigit(buffer, digit);
    if (r.kind === "typing") {
      setBuffer(r.buffer);
      setInvalid("");
      return;
    }
    setBuffer("");
    if (r.kind === "selected") {
      setInvalid("");
      onPreset(r.preset);
    } else setInvalid(r.code);
  };

  const readout = invalid ? "--" : buffer || slotCode(state.preset);
  const label = invalid ? K.invalid(invalid) : t.presets[state.preset].label;

  return (
    <div className="flex min-w-0 flex-col gap-2 bg-[var(--metal)] p-2.5" role="group" aria-label={K.aria}>
      <div className="flex items-baseline justify-between gap-3 bg-display px-2.5 py-1.5" role="status">
        <span className={`num text-2xl leading-none font-semibold ${invalid ? "text-display-neg" : "lcd"}`}>{readout}
          {buffer && <span className="caret">_</span>}
        </span>
        <span className="min-w-0 truncate text-right text-xs text-display-dim">{label}</span>
      </div>
      <div className="grid grid-cols-6 gap-1 lg:grid-cols-3">
        {KEYS.map((k) => (
          <button key={k} type="button" onClick={() => press(k)} className="key-metal num min-h-10 text-sm font-semibold">
            {k}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            setBuffer("");
            setInvalid("");
          }}
          aria-label={K.clear}
          className="key-metal num col-span-2 min-h-10 text-sm font-semibold text-display-coin"
        >
          C
        </button>
      </div>
    </div>
  );
}
