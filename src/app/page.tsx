import Image from "next/image";
import Link from "next/link";
import hero from "@/assets/hero.webp";
import { Calculator } from "@/components/Calculator";
import { MethodList, SiteFooter } from "@/components/Method";
import { TopBar } from "@/components/TopBar";
import { MESSAGES } from "@/lib/i18n";
import { getLang } from "@/lib/lang-server";
import { fromSearchParams, readSearch, type Search } from "@/lib/state";

export default async function Home({ searchParams }: { searchParams: Promise<Search> }) {
  const [initial, lang] = await Promise.all([searchParams.then((sp) => fromSearchParams(readSearch(sp))), getLang()]);
  const t = MESSAGES[lang];

  return (
    <main className="mx-auto flex max-w-[1120px] flex-col gap-8 px-4 pt-5 pb-10">
      <TopBar t={t} page="calculator" />

      <header className="grid items-center gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-3">
          <h1 className="m-0 font-display text-[clamp(32px,5.4vw,56px)] leading-[1.02] font-extrabold tracking-[-.015em] text-balance [overflow-wrap:anywhere] [font-stretch:80%]">
            {t.header.title}
          </h1>
          <p className="m-0 max-w-[60ch] text-[15.5px] text-muted">{t.header.lede}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1">
            <Link href="/case" className="inline-flex min-h-11 items-center rounded-md bg-ink px-4 text-sm font-semibold whitespace-nowrap text-panel no-underline transition-opacity duration-150 hover:opacity-90 active:opacity-80">
              {t.sales.cta.caseStudy}
            </Link>
            <Link href="/meeting" className="inline-flex min-h-11 items-center rounded-md border border-line px-4 text-sm font-semibold whitespace-nowrap text-ink no-underline hover:border-muted">
              {t.sales.cta.meeting}
            </Link>
          </div>
        </div>
        <figure className="m-0 flex min-w-0 flex-col gap-2">
          <Image
            src={hero}
            alt={t.header.heroAlt}
            priority
            placeholder="blur"
            sizes="(min-width: 1024px) 440px, 100vw"
            className="aspect-[16/9] h-auto w-full rounded-[10px] object-cover"
          />
          <figcaption className="num text-[12px] text-muted">{t.header.heroCaption}</figcaption>
        </figure>
      </header>

      <Calculator initial={initial} />

      <section className="grid gap-5 rounded-[10px] border border-line bg-panel px-5 py-6 sm:px-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]" aria-labelledby="method-head">
        <div className="flex flex-col gap-2">
          <h2 id="method-head" className="m-0 font-display text-[22px] leading-tight font-extrabold [font-stretch:85%]">
            {t.method.title}
          </h2>
          <p className="m-0 max-w-[48ch] text-sm text-muted">{t.method.note}</p>
        </div>
        <MethodList t={t} />
      </section>

      <SiteFooter t={t} />
    </main>
  );
}
