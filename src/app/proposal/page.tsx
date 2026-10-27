import type { Metadata } from "next";
import { Proposal } from "@/components/Proposal";
import { fromSearchParams, readSearch, type Search } from "@/lib/state";

export const metadata: Metadata = {
  title: "Client proposal · Cashless Vending Payback",
  robots: { index: false },
};

export default async function ProposalPage({ searchParams }: { searchParams: Promise<Search> }) {
  const q = readSearch(await searchParams);
  return <Proposal initial={fromSearchParams(q)} initialClient={q.get("client") ?? ""} initialBy={q.get("by") ?? ""} />;
}
