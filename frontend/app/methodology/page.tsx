import Link from "next/link";
import type { Metadata } from "next";
import { Badge } from "@/components/ui";

export const metadata: Metadata = {
  title: "Methodology — CLIMASCORE",
  description: "How every score on CLIMASCORE is calculated, and what it is not.",
};

export default function MethodologyPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-3 border-b border-border pb-8">
        <Badge variant="blue" className="w-fit">
          Illustrative model output — not causal proof
        </Badge>
        <h1 className="font-serif text-4xl text-navy">Methodology</h1>
        <p className="max-w-2xl text-text-muted">
          Every number CLIMASCORE displays is an illustrative modelling assumption, not a statistically
          calibrated or empirically fitted parameter. This page exists so any score can be traced back to the
          exact formula that produced it — a lender or judge should never have to take a number on trust.
        </p>
      </header>

      <Section title="1. Risk score">
        <Formula>
          Risk Score = 0.35 × Hazard + 0.30 × Exposure + 0.20 × Vulnerability + 0.15 × Business Criticality
        </Formula>
        <p>
          Each component is scored 0–100 (higher = greater climate risk). Bands: Low (0–39), Moderate
          (40–64), High (65–84), Severe (85–100). Seed example: Hazard 82, Exposure 78, Vulnerability 80,
          Business Criticality 68 → <strong>Risk ≈ 78 (High)</strong>.
        </p>
      </Section>

      <Section title="2. Adaptation measures">
        <p>
          Each measure (raised equipment, flood barrier, improved drainage, cooling/heat protection, backup
          power, protected inventory) carries illustrative effect parameters — risk-reduction points,
          vulnerability reduction %, and downtime reduction % — for the specific hazard it addresses. These
          are modelling assumptions, not measured outcomes.
        </p>
      </Section>

      <Section title="3. Loss model">
        <Formula>
          {`Total Estimated Loss = Asset Damage + Inventory Damage + Downtime Loss + Recovery Cost

Asset Damage      = Equipment Value × Damage Rate
Inventory Damage  = Inventory Value × Damage Rate
Downtime Loss     = Daily Revenue × Downtime Days × Operational Loss Factor
Recovery Cost     = Recovery Cost % × (Asset Damage + Inventory Damage)`}
        </Formula>
        <p>
          Damage rate and downtime hours are interpolated between a &ldquo;without adaptation&rdquo; endpoint
          and a &ldquo;with full adaptation&rdquo; endpoint, scaled by the selected measures&rsquo; combined
          effect — so any subset of measures produces a proportionate result, not just the all-or-nothing
          demo case.
        </p>
      </Section>

      <Section title="4. Counterfactual engine">
        <p>
          The same climate event (identical hazard, location, date, severity) is run twice through the loss
          model: once with baseline vulnerability (no adaptation), once with vulnerability adjusted for the
          selected adaptation measures. Only adaptation-driven assumptions change between the two runs — the
          event itself never does.
        </p>
      </Section>

      <Section title="5. Resilience delta">
        <Formula>
          Resilience Delta = Counterfactual (without-adaptation) Loss − Adapted (with-adaptation) Loss
        </Formula>
        <p>Displayed as estimated avoided loss (₹), illustrative loss-reduction percentage, and downtime avoided (hours).</p>
      </Section>

      <Section title="6. Uncertainty band">
        <p>
          Rather than a single, falsely precise number, every counterfactual run also reports a sensitivity
          range: the loss model is re-run with damage-rate coefficients perturbed ±15%, and both the point
          estimate and the resulting range are shown (e.g. &ldquo;₹6.7L, range ₹5.4L–₹8.1L&rdquo;). A single
          confident number reads as fabricated precision; a range signals honest, bounded modelling.
        </p>
      </Section>

      <Section title="7. Evidence confidence">
        <p>
          A 0–100 weighted score across six evidence categories (hazard/event, location, asset/operations,
          adaptation record, observed loss, remote sensing), each scored by how well that category is
          documented. Always labeled <strong>&ldquo;Illustrative evidence score&rdquo;</strong> — never
          presented as statistically calibrated confidence.
        </p>
      </Section>

      <Section title="What this model is not">
        <ul className="list-disc space-y-1 pl-5">
          <li>It is not a causally validated estimate of adaptation&rsquo;s effect.</li>
          <li>It is not a trained ML model — no real-world labeled outcome dataset exists yet to train one on.</li>
          <li>It does not measure the seed borrower&rsquo;s actual, observed losses — those are illustrative model output.</li>
          <li>
            Real external facts (RBI, WRI India, World Bank, IFC, Indian Express) are always separated from
            synthetic/modelled values via the provenance badge shown next to every number.
          </li>
        </ul>
      </Section>

      <div className="border-t border-border pt-6 text-sm">
        <Link href="/" className="font-medium text-blue hover:text-blue-dark">
          ← Back to dashboard
        </Link>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-serif text-xl text-navy">{title}</h2>
      <div className="flex flex-col gap-3 text-sm leading-relaxed text-text">{children}</div>
    </section>
  );
}

function Formula({ children }: { children: React.ReactNode }) {
  return (
    <pre className="overflow-x-auto border border-border bg-light-blue p-4 text-xs leading-relaxed text-navy">
      {children}
    </pre>
  );
}
