import type { Metadata } from "next";
import { Proposal } from "@/components/Proposal";
import { LANGS, MESSAGES, type Lang } from "@/lib/i18n";
import { getLang } from "@/lib/lang-server";
import { fromSearchParams, readSearch, type Search } from "@/lib/state";

export async function generateMetadata(): Promise<Metadata> {
  return { title: MESSAGES[await getLang()].proposal.metaTitle, robots: { index: false } };
}

export default async function ProposalPage({ searchParams }: { searchParams: Promise<Search> }) {
  const q = readSearch(await searchParams);
  const plang = q.get("plang");
  return (
    <Proposal
      initial={fromSearchParams(q)}
      initialClient={q.get("client") ?? ""}
      initialBy={q.get("by") ?? ""}
      initialDocLang={(LANGS as readonly string[]).includes(plang ?? "") ? (plang as Lang) : null}
    />
  );
}
