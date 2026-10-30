"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useMemo, type ReactNode } from "react";
import { createFormat } from "@/lib/format";
import { LANGS, LANG_COOKIE, LANG_NAME, MESSAGES, type Lang } from "@/lib/i18n";
import type { Currency } from "@/lib/scenarios";

const Ctx = createContext<Lang>("en");

export function I18nProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  return <Ctx.Provider value={lang}>{children}</Ctx.Provider>;
}

/** Messages and a formatter for the page language and the given currency. */
export function useI18n(currency: Currency = "EUR") {
  const lang = useContext(Ctx);
  return useMemo(() => ({ lang, t: MESSAGES[lang], fmt: createFormat(lang, currency) }), [lang, currency]);
}

export function LangSwitcher() {
  const lang = useContext(Ctx);
  const router = useRouter();
  return (
    <label className="flex items-center gap-2 text-[13px] text-muted">
      <span className="sr-only sm:not-sr-only">{MESSAGES[lang].langLabel}</span>
      <select
        value={lang}
        onChange={(e) => {
          document.cookie = `${LANG_COOKIE}=${e.target.value}; path=/; max-age=31536000; samesite=lax`;
          router.refresh();
        }}
        className="min-h-9 cursor-pointer rounded-md border border-line bg-panel px-2 py-1.5 text-sm text-ink hover:border-muted"
        aria-label={MESSAGES[lang].langLabel}
      >
        {LANGS.map((l) => (
          <option key={l} value={l}>
            {LANG_NAME[l]}
          </option>
        ))}
      </select>
    </label>
  );
}
