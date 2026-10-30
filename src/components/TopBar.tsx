import Link from "next/link";
import type { Messages } from "@/lib/i18n";
import { LangSwitcher } from "./I18n";

type Page = "calculator" | "meeting" | "case";

/** Sticker, the three ways into the tool, and the language. */
export function TopBar({ t, page }: { t: Messages; page: Page }) {
  const items: { id: Page; href: string; label: string }[] = [
    { id: "calculator", href: "/", label: t.sales.nav.calculator },
    { id: "meeting", href: "/meeting", label: t.sales.nav.meeting },
    { id: "case", href: "/case", label: t.sales.nav.caseStudy },
  ];
  return (
    <div className="on-cabinet flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
      <span className="sticker" aria-hidden="true">
        {t.header.sticker}
      </span>
      <nav aria-label={t.sales.nav.aria} className="order-3 flex w-full flex-wrap gap-x-5 gap-y-1 sm:order-none sm:w-auto">
        {items.map((i) => (
          <Link
            key={i.id}
            href={i.href}
            aria-current={i.id === page ? "page" : undefined}
            className={`inline-flex min-h-9 items-center text-sm font-semibold whitespace-nowrap underline-offset-[6px] hover:underline ${
              i.id === page ? "text-ink underline decoration-coin decoration-2" : "text-muted"
            }`}
          >
            {i.label}
          </Link>
        ))}
      </nav>
      <LangSwitcher />
    </div>
  );
}
