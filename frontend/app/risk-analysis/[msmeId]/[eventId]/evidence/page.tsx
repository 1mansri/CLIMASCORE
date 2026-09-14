import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui";
import { EvidenceChain } from "@/components/evidence-chain";
import { fetchEvent, fetchEvidence, fetchMsme } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function EvidencePanelPage({
  params,
}: {
  params: Promise<{ msmeId: string; eventId: string }>;
}) {
  const { msmeId, eventId } = await params;
  const [msme, event, evidence] = await Promise.all([fetchMsme(msmeId), fetchEvent(eventId), fetchEvidence(msmeId, eventId)]);
  if (!msme || !event) notFound();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-dark">Evidence panel</p>
        <h1 className="font-serif text-3xl text-navy">Where these numbers come from</h1>
        <p className="text-text-muted">
          {msme.name} · {event.location.split(",")[0]} {event.type} — {event.date}
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Badge variant="outline">Evidence confidence: 82 / 100</Badge>
          <Badge variant="amber">Illustrative evidence score</Badge>
        </div>
        <p className="max-w-xl text-xs text-text-muted">
          This is not a statistically calibrated confidence measure — it is an illustrative indication of how
          much of the evidence chain below is backed by named sources versus modelled assumptions.
        </p>
      </header>

      <EvidenceChain items={evidence} msmeName={msme.name} />

      <div className="flex justify-between border-t border-border pt-6 text-sm">
        <Link href={`/risk-analysis/${msmeId}/${eventId}`} className="font-medium text-blue hover:text-blue-dark">
          ← Back to counterfactual analysis
        </Link>
        <Link href={`/decision/${msmeId}`} className="font-medium text-blue hover:text-blue-dark">
          Continue to lender action →
        </Link>
      </div>
    </div>
  );
}
