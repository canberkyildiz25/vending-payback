import type { Messages } from "@/lib/i18n";

/**
 * How the numbers are worked out, set like a till receipt: each line a name
 * and its formula, the margin rule as the closing line. Shared by the
 * calculator and the proposal.
 */
export function MethodList({ t, className = "" }: { t: Messages; className?: string }) {
  return (
    <div className={`flex min-w-0 flex-col ${className}`}>
      <dl className="m-0 flex flex-col">
        {t.method.rows.map(([name, formula]) => (
          <div key={name} className="grid gap-x-4 gap-y-0.5 border-b border-dashed border-line py-2.5 sm:grid-cols-[minmax(0,13rem)_minmax(0,1fr)]">
            <dt className="text-sm font-semibold">{name}</dt>
            <dd className="num m-0 text-[13px] text-muted">= {formula}</dd>
          </div>
        ))}
      </dl>
      <p className="num m-0 border-t-2 border-ink pt-2.5 text-[13px] font-semibold">{t.method.marginNote}</p>
    </div>
  );
}

const REPO = "https://github.com/canberkyildiz25/vending-payback";

export function SiteFooter({ t }: { t: Messages }) {
  return (
    <footer className="on-cabinet flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-t border-line pt-5">
      <p className="m-0 font-display text-base font-bold [font-stretch:90%]">{t.footer.signature}</p>
      <p className="m-0 flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-muted">
        <a href={REPO} className="whitespace-nowrap text-accent underline-offset-4 hover:underline">
          {t.footer.source}
        </a>
        <a href="https://unsplash.com" className="whitespace-nowrap text-muted underline-offset-4 hover:underline">
          {t.footer.photos}
        </a>
      </p>
    </footer>
  );
}

/** Signature line on the printed proposal. */
export function Signature({ t, className = "" }: { t: Messages; className?: string }) {
  return <p className={`m-0 text-[13px] ${className}`}>{t.footer.signature}</p>;
}
