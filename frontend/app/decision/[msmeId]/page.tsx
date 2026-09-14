import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, ProvenanceBadge } from "@/components/ui";
import { RiskGauge } from "@/components/ui/risk-gauge";
import { fetchMsme, postCounterfactualRun } from "@/lib/api";
import { riskBandForScore } from "@/lib/formatting";
import { PRIMARY_EVENT_ID } from "@/lib/seed-data";
import type { LenderAction } from "@/types/domain";

export const dynamic = "force-dynamic";

const SUGGESTED_ACTIONS: LenderAction[] = [
  {
    id: "monitor",
    label: "Continue monitoring",
    detail: "Keep this borrower in the standard climate-risk monitoring cycle; no immediate action required.",
  },
  {
    id: "finance",
    label: "Consider adaptation-linked financing",
    detail: "The modelled resilience delta suggests further adaptation investment could meaningfully reduce exposure.",
  },
  {
    id: "collateral",
    label: "Review collateral exposure",
    detail: "Cross-check collateral value against the borrower's estimated physical asset exposure to this hazard.",
  },
  {
    id: "reassess",
    label: "Reassess after major climate events",
    detail: "Re-run the counterfactual analysis after the next qualifying event to update this risk profile.",
  },
];

export default async function LenderActionPage({ params }: { params: Promise<{ msmeId: string }> }) {
  const { msmeId } = await params;
  const msme = await fetchMsme(msmeId);
  if (!msme) notFound();

  const { run } = await postCounterfactualRun(msmeId, PRIMARY_EVENT_ID, [
    "raised_equipment",
    "flood_barrier",
    "improved_drainage",
  ]);
  const currentScore = run.with.riskScore;
  const band = riskBandForScore(currentScore);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-dark">Lender action</p>
        <h1 className="font-serif text-3xl text-navy">{msme.name}</h1>
        <p className="text-text-muted">Post-adaptation, post-event climate risk assessment.</p>
      </header>

      <section aria-label="Current borrower climate risk" className="flex flex-col gap-4 border border-border bg-white p-8">
        <RiskGauge score={currentScore} band={band} label="Borrower Climate Risk" size="large" showMethodologyLink />
        <ProvenanceBadge kind="modelled" showDescription />
      </section>

      <section aria-label="Suggested lender actions" className="flex flex-col gap-4">
        <h2 className="font-serif text-xl text-navy">Suggested actions</h2>
        <ol className="flex flex-col gap-3">
          {SUGGESTED_ACTIONS.map((action, idx) => (
            <li key={action.id} className="flex gap-4 border border-border bg-white p-5">
              <span className="font-serif text-2xl text-blue">{idx + 1}</span>
              <div>
                <p className="font-medium text-navy">{action.label}</p>
                <p className="text-sm text-text-muted">{action.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-label="Product positioning" className="border border-navy bg-navy p-6 text-white">
        <Badge variant="navy" className="mb-3 border-white/30 bg-white/10 text-white">
          Positioning
        </Badge>
        <p className="font-serif text-xl">Decision support, not autonomous credit approval.</p>
        <p className="mt-2 text-sm text-white/80">
          CLIMASCORE does not approve or reject a loan. It provides borrower-level climate-risk evidence and a
          transparent modelled resilience signal so a lender&rsquo;s credit team can make an informed decision.
        </p>
      </section>

      <div className="flex justify-between border-t border-border pt-6 text-sm">
        <Link href={`/msmes/${msmeId}`} className="font-medium text-blue hover:text-blue-dark">
          ← Back to MSME profile
        </Link>
        <Link href={`/reports/${msmeId}`} className="font-medium text-blue hover:text-blue-dark">
          View full borrower report →
        </Link>
      </div>
    </div>
  );
}
