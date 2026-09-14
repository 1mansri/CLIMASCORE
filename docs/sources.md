# Sources

Every factual external claim in CLIMASCORE traces to one of the five sources below. These are **real,
independently published facts** — distinct from the synthetic seed borrower and the illustrative modelled
numbers CLIMASCORE computes from them. See `docs/methodology.md` for the modelling side and spec §25 for
the provenance-labeling rules this codebase enforces via the `ProvenanceBadge` component.

1. **RBI Annual Report 2024–25**, Section VI.25 / Box VI.1 — climate change as an emerging financial-system
   risk, and RB-CRIS (Reserve Bank – Climate Risk Information System).
   https://www.rbi.org.in/scripts/AnnualReportPublications.aspx?Id=1436
   *Strategic note: RB-CRIS is not being replaced. CLIMASCORE demonstrates a borrower-level intelligence
   layer that could consume standardized climate-risk information and translate it into lender action.*

2. **WRI India, June 23, 2026** — vulnerability assessment of 300+ MSMEs across Surat, Chennai, and
   Coimbatore: operational disruption, supply-chain impacts, productivity losses, resilience barriers.
   https://wri-india.org/research/resilience-micro-small-and-medium-enterprises-climate-risks-vulnerability-assessment

3. **Indian Express, July 2026** — reported Surat powerloom flood losses (Uma Industrial Society):
   owner-memorandum claims of ₹10–15 lakh+ per plot in direct loss, repeated flooding July 22–23, ~25-day
   closures. **These are unaudited claims by unit owners in a memorandum**, not CLIMASCORE measurements.
   https://indianexpress.com/article/cities/ahmedabad/surat-powerloom-owners-property-tax-waiver-flood-losses-10811066/

4. **World Bank, July 2026** — extreme heat costs South Asia ~31 million full-time jobs annually; could cut
   the region's economy by ~7% by 2050.
   https://www.worldbank.org/en/news/press-release/2026/07/28/extreme-heat-puts-south-asia-s-jobs-and-growth-at-risk-world-bank

5. **IFC, 2026** — adaptation finance gap in developing economies up to US$339B/year; limited
   private-sector adaptation reporting and firm-level visibility.
   https://www.ifc.org/en/insights-reports/2026/uncovering-the-resilience-of-smaller-firms-in-developing-countries

## What is NOT a source — synthetic and illustrative data

- **MSME-SURAT-001 ("Surat Textile Works")** is a fictional, illustrative borrower created for this
  prototype. It is not one of the real businesses referenced above. All its financial figures are
  synthetic.
- **EVENT-SURAT-FLOOD-2026 / EVENT-SURAT-HEAT-2026** are inspired by the real evidence above but are not
  presented as measurements of the synthetic borrower.
- All risk scores, loss estimates, downtime figures, and resilience deltas are **illustrative model
  output**, computed by the transparent formulas in `docs/methodology.md` — never "verified savings," never
  causal proof.
