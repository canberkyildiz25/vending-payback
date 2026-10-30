"use client";

import { useEffect, useRef, useState } from "react";
import type { CalcState } from "@/lib/state";
import { emailSummary } from "@/lib/summary";
import { useI18n } from "./I18n";

/** Copies a plain-text business case; shows it in a box when the clipboard is blocked. */
export function CopySummary({ state }: { state: CalcState }) {
  const { t, fmt } = useI18n(state.currency);
  const [copied, setCopied] = useState(false);
  const [fallback, setFallback] = useState<string | null>(null);
  const area = useRef<HTMLTextAreaElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (fallback !== null) area.current?.select();
  }, [fallback]);

  const copy = async () => {
    const text = emailSummary(state, t, fmt);
    try {
      await navigator.clipboard.writeText(text);
      setFallback(null);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2200);
    } catch {
      setFallback(text);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={copy}
        className="inline-flex min-h-11 cursor-pointer items-center border border-line bg-transparent px-4 text-sm font-semibold whitespace-nowrap text-ink transition-colors duration-150 hover:border-ink active:bg-white/[.1]"
      >
        {t.display.copy}
      </button>
      <span className="text-[13px] text-coin" role="status">
        {copied ? t.display.copied : ""}
      </span>
      {fallback !== null && (
        <textarea
          ref={area}
          readOnly
          value={fallback}
          aria-label={t.display.summaryAria}
          className="num min-h-40 w-full basis-full border-0 bg-display-grid p-2.5 text-[13px] text-display-ink"
        />
      )}
    </>
  );
}
