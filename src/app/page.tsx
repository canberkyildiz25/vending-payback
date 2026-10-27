import { Calculator } from "@/components/Calculator";
import { MethodList, Signature } from "@/components/Method";
import { fromSearchParams, readSearch, type Search } from "@/lib/state";

export default async function Home({ searchParams }: { searchParams: Promise<Search> }) {
  const initial = fromSearchParams(readSearch(await searchParams));

  return (
    <main className="mx-auto flex max-w-[1120px] flex-col gap-6 px-4 pt-7 pb-10">
      <header className="flex flex-col gap-2">
        <span className="sticker self-start" aria-hidden="true">
          Exact change only
        </span>
        <h1 className="m-0 font-display text-[clamp(30px,5vw,46px)] leading-[1.05] font-extrabold tracking-[-.01em] text-balance [font-stretch:82%]">
          What would card payments earn your vending fleet?
        </h1>
        <p className="m-0 max-w-[62ch] text-muted">
          Enter your own fleet numbers to see the monthly gain, the payback period and the three-year return of adding card
          and phone payments to your machines. Compare a cautious, a likely and a hopeful case, then turn the result into a
          proposal for your client.
        </p>
      </header>

      <Calculator initial={initial} />

      <section className="flex flex-col gap-2 rounded-[10px] border border-line bg-panel px-5 py-[18px] text-sm text-muted">
        <h2 className="m-0 font-display text-lg font-bold text-ink [font-stretch:90%]">How the numbers are worked out</h2>
        <MethodList className="max-w-[75ch]" />
        <p className="m-0 max-w-[75ch]">
          The sales increase and the card share differ by location and audience. Use figures from your own pilot machines
          where you have them. The location types are starting points for a conversation, not market data.
        </p>
      </section>

      <footer className="text-muted">
        <Signature />
      </footer>
    </main>
  );
}
