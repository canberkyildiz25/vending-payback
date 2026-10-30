import type { Metadata } from "next";
import { Meeting } from "@/components/Meeting";
import { SiteFooter } from "@/components/Method";
import { TopBar } from "@/components/TopBar";
import { MESSAGES } from "@/lib/i18n";
import { getLang } from "@/lib/lang-server";
import { fromSearchParams, readSearch, type Search } from "@/lib/state";

export async function generateMetadata(): Promise<Metadata> {
  return { title: MESSAGES[await getLang()].sales.meeting.metaTitle };
}

export default async function MeetingPage({ searchParams }: { searchParams: Promise<Search> }) {
  const [initial, lang] = await Promise.all([searchParams.then((sp) => fromSearchParams(readSearch(sp))), getLang()]);
  const t = MESSAGES[lang];
  return (
    <main className="mx-auto flex max-w-[1120px] flex-col gap-6 px-4 pt-5 pb-10">
      <div className="on-sign -mt-5 flex flex-col gap-5 pt-5 pb-8">
      <TopBar t={t} page="meeting" />
      <header className="flex flex-col gap-3">
        <h1 className="fascia m-0 text-[clamp(50px,9vw,104px)]">{t.sales.meeting.title}</h1>
        <p className="m-0 max-w-[62ch] text-muted">{t.sales.meeting.intro}</p>
      </header>
      </div>
      <Meeting initial={initial} />
      <SiteFooter t={t} />
    </main>
  );
}
