import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import gym from "@/assets/gym.webp";
import { SiteFooter } from "@/components/Method";
import { PaybackChart } from "@/components/PaybackChart";
import { TopBar } from "@/components/TopBar";
import { createFormat } from "@/lib/format";
import { MESSAGES } from "@/lib/i18n";
import { breakEvenUplift, costOfDelay } from "@/lib/insights";
import { getLang } from "@/lib/lang-server";
import { computePayback, type PaybackResult } from "@/lib/payback";
import { SCENARIO_IDS, type ScenarioId } from "@/lib/scenarios";
import { stateFromPreset, toSearchParams } from "@/lib/state";

export async function generateMetadata(): Promise<Metadata> {
  return { title: MESSAGES[await getLang()].sales.caseStudy.metaTitle };
}

/** One beat of the conversation: what happens on the left, the evidence on the right, the lesson underneath. */
function Beat({ n, title, body, lesson, children }: { n: number; title: string; body: ReactNode; lesson: string; children: ReactNode }) {
  return (
    <section className="grid items-start gap-x-8 gap-y-4 border-t border-line pt-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <div className="flex min-w-0 flex-col gap-2.5">
        <span className="num text-sm text-coin">{n} / 4</span>
        <h2 className="m-0 font-display text-[clamp(23px,3vw,30px)] leading-[1.1] font-extrabold text-balance [font-stretch:82%]">{title}</h2>
        <div className="text-[15px] text-muted">{body}</div>
        <p className="m-0 border-t border-dashed border-line pt-2.5 text-sm font-semibold">{lesson}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

export default async function CasePage() {
  const lang = await getLang();
  const t = MESSAGES[lang];
  const C = t.sales.caseStudy;
  const state = stateFromPreset("gym");
  const fmt = createFormat(lang, state.currency);
  const results = Object.fromEntries(SCENARIO_IDS.map((id) => [id, computePayback(state.fleet, state.scenarios[id])])) as Record<ScenarioId, PaybackResult>;
  const be = breakEvenUplift(state.fleet, state.scenarios.realistic.cardSharePct);
  const needed = fmt.pct(be.kind === "needs" ? be.upliftPct : 0);
  const delay = costOfDelay(state.fleet, state.scenarios.realistic, 6);
  const query = toSearchParams(state).toString();

  return (
    <main className="mx-auto flex max-w-[1120px] flex-col gap-8 px-4 pt-5 pb-10">
      <TopBar t={t} page="case" />
      <header className="flex flex-col gap-3">
        <h1 className="m-0 max-w-[20ch] font-display text-[clamp(32px,5.4vw,56px)] leading-[1.02] font-extrabold tracking-[-.015em] text-balance [font-stretch:80%]">{C.title}</h1>
        <p className="m-0 max-w-[60ch] text-[15.5px] text-muted">{C.intro}</p>
        <span className="self-start text-[11px] font-semibold tracking-[.06em] text-coin uppercase">{C.exampleTag}</span>
      </header>

      <Beat n={1} title={C.steps.problem.title} body={C.steps.problem.body(state.fleet.machines, fmt.money(results.realistic.monthlySalesToday))} lesson={C.steps.problem.lesson}>
        <Image src={gym} alt={C.photoAlt} placeholder="blur" sizes="(min-width: 1024px) 560px, 100vw" className="aspect-[16/9] h-auto w-full rounded-[10px] object-cover" />
      </Beat>

      <Beat n={2} title={C.steps.numbers.title} body={C.steps.numbers.body} lesson={C.steps.numbers.lesson}>
        <div className="display flex flex-col gap-4 rounded-[12px] bg-display p-5 text-display-ink">
          <div className="grid grid-cols-3 gap-2">
            {SCENARIO_IDS.map((id) => {
              const p = fmt.paybackLabel(results[id].paybackMonths);
              const on = id === "realistic";
              return (
                <div key={id} className={`flex min-w-0 flex-col gap-1 border-t-[3px] pt-2 ${on ? "border-display-coin" : "border-display-grid"}`}>
                  <span className="label-caps truncate text-[10px] tracking-[.04em] text-display-dim sm:text-[11px]">{t.scenario[id]}</span>
                  <span className={`num text-xl font-semibold ${on ? "text-display-coin" : ""}`}>
                    {p.value} <span className="font-sans text-xs font-normal text-display-dim">{t.display.monthShort}</span>
                  </span>
                  <span className="num text-xs text-display-dim">{fmt.money(results[id].netMonthly)}</span>
                </div>
              );
            })}
          </div>
          <PaybackChart results={results} selected="realistic" t={t} fmt={fmt} />
        </div>
      </Beat>

      <Beat n={3} title={C.steps.objection.title} body={C.steps.objection.body(needed)} lesson={C.steps.objection.lesson}>
        <div className="flex flex-col gap-4 rounded-[10px] border border-line bg-panel p-5 sm:p-6">
          <p className="m-0 font-display text-[22px] leading-tight font-bold [font-stretch:85%]">{C.steps.objection.quote}</p>
          <p className="num m-0 text-[clamp(44px,7vw,68px)] leading-none font-semibold text-coin">{needed}</p>
          <p className="m-0 text-sm">{t.sales.insight.needs(needed)}</p>
          <p className="m-0 border-t border-line pt-3 text-sm text-muted">{C.steps.objection.delay(fmt.money(delay))}</p>
        </div>
      </Beat>

      <Beat n={4} title={C.steps.close.title} body={C.steps.close.body} lesson={C.steps.close.lesson}>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <Link href={`/proposal?${query}`} className="inline-flex min-h-11 items-center rounded-md bg-ink px-4 text-sm font-semibold whitespace-nowrap text-panel no-underline transition-opacity duration-150 hover:opacity-90 active:opacity-80">
            {C.openProposal}
          </Link>
          <Link href="/" className="inline-flex min-h-11 items-center rounded-md border border-line px-4 text-sm font-semibold whitespace-nowrap text-ink no-underline hover:border-muted">
            {C.openCalculator}
          </Link>
          <Link href={`/meeting?${query}`} className="text-sm font-semibold whitespace-nowrap text-accent underline-offset-4 hover:underline">
            {C.openMeeting}
          </Link>
        </div>
      </Beat>

      <section className="grid gap-x-8 gap-y-3 rounded-[12px] bg-display p-6 text-display-ink sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <h2 className="m-0 font-display text-[clamp(23px,3vw,30px)] leading-[1.1] font-extrabold [font-stretch:82%]">{C.whyTitle}</h2>
        <div className="flex flex-col gap-3">
          {C.why.map((p) => (
            <p key={p} className="m-0 text-[15px]">
              {p}
            </p>
          ))}
        </div>
      </section>

      <SiteFooter t={t} />
    </main>
  );
}
