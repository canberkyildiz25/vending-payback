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

      <header className="on-cabinet flex flex-col gap-7">
        <h1 className="fascia m-0">{t.header.title}</h1>
        <div className="grid items-end gap-x-10 gap-y-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="flex min-w-0 flex-col gap-4">
            <p className="m-0 max-w-[58ch] text-[16px]">{t.header.lede}</p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <Link href="/case" className="key-brass">
                {t.sales.cta.caseStudy}
              </Link>
              <Link href="/meeting" className="inline-flex min-h-12 items-center border border-line px-4 text-sm font-semibold whitespace-nowrap text-ink no-underline hover:border-ink">
                {t.sales.cta.meeting}
              </Link>
            </div>
          </div>
          <figure className="shelf m-0 flex min-w-0 flex-col">
            <Image src={hero} alt={t.header.heroAlt} priority placeholder="blur" sizes="(min-width: 1024px) 520px, 100vw" className="signal-in aspect-[21/9] h-auto w-full object-cover" />
            <figcaption className="rail">{t.header.heroCaption}</figcaption>
          </figure>
        </div>
      </header>

      <Calculator initial={initial} />

      <section className="grid items-start gap-x-10 gap-y-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]" aria-labelledby="method-head">
        <div className="on-cabinet flex flex-col gap-3">
          <h2 id="method-head" className="sign m-0 text-[clamp(30px,4.4vw,46px)]">
            {t.method.title}
          </h2>
          <p className="m-0 max-w-[48ch] text-sm text-muted">{t.method.note}</p>
        </div>
        <div className="receipt">
          <MethodList t={t} />
        </div>
      </section>

      <SiteFooter t={t} />
    </main>
  );
}
