"use client";

import { useState } from "react";

type Props = {
  id: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  prefix?: string;
  unit?: string;
  /** Marks a value that came from pilot data rather than an estimate. */
  measured?: boolean;
  "aria-label"?: string;
  "aria-describedby"?: string;
};

// Text, not type="number": the browser would otherwise show "2,5" or "2.5" depending on
// the OS language. Both a comma and a point are accepted as the decimal mark.
const toNumber = (s: string) => (s.trim() === "" ? 0 : Number(s.trim().replace(",", ".")));

/**
 * Number field that lets the user clear it and retype without the value
 * snapping back. An empty field counts as 0 in the maths.
 */
export function NumberInput({ id, value, onChange, min = 0, max, prefix, unit, measured, ...aria }: Props) {
  const [raw, setRaw] = useState(String(value));
  const [synced, setSynced] = useState(value);

  // A preset or URL change replaces the value from outside: show it.
  if (value !== synced) {
    setSynced(value);
    if (toNumber(raw) !== value) setRaw(String(value));
  }

  const parsed = toNumber(raw);
  const invalid = !Number.isFinite(parsed) || parsed < min || (max !== undefined && parsed > max);

  return (
    <div className={"inp" + (prefix ? " has-prefix" : "") + (unit ? " has-unit" : "") + (measured ? " is-measured" : "")}>
      {prefix && <span className="prefix" aria-hidden="true">{prefix}</span>}
      <input
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        spellCheck={false}
        value={raw}
        aria-invalid={invalid || undefined}
        {...aria}
        onChange={(e) => {
          const next = e.target.value;
          setRaw(next);
          const v = toNumber(next);
          if (Number.isFinite(v)) {
            setSynced(v);
            onChange(v);
          }
        }}
      />
      {unit && <span className="unit" aria-hidden="true">{unit}</span>}
    </div>
  );
}
