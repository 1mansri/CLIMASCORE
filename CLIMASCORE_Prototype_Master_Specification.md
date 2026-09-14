# CLIMASCORE --- Master Prototype Specification

## SANKALP by Satin Finserv --- The Climate Edition 2026 \| Student Track

**Team:** Team DASK\
**Institution:** IIT Kharagpur\
**Track:** Climate Tech\
**Product:** CLIMASCORE

> **Purpose:** Single source of truth for an AI coding agent building
> the CLIMASCORE competition prototype. The agent should be able to
> implement, run, demo, and test the MVP from this document without
> requiring additional product clarification.

------------------------------------------------------------------------

# 1. PRODUCT IN ONE SENTENCE

**CLIMASCORE is a borrower-level climate-risk intelligence platform that
helps lenders measure whether climate adaptation actually reduced an
MSME's financial exposure to a climate event.**

The core innovation is the **counterfactual resilience engine**:

> For the same borrower and the same climate event, estimate what would
> likely have happened **without adaptation** versus **with
> adaptation**, then convert the difference into a lender-readable
> resilience signal.

This is not another weather dashboard, generic ESG dashboard, or
autonomous loan-approval system.

------------------------------------------------------------------------

# 2. COMPETITION STORY

The final pitch has exactly three content slides plus separate
Introduction and Thank You slides.

### Content Slide 1 --- THE WHY

**Climate risk is already a credit risk. But resilience is still
invisible at the borrower level.**

Use current 2026 evidence, especially Surat MSME flooding and heat
evidence.

### Content Slide 2 --- THE DIFFERENCE

**CLIMASCORE turns adaptation into measurable credit intelligence.**

`Borrower baseline → Adaptation financed → Climate event → Counterfactual → Resilience Delta → Lender action`

### Content Slide 3 --- THE BUSINESS

**From one MSME cluster to a climate-risk layer for finance.**

`Pilot → Lender integration → Multi-hazard / portfolio scale`

### Prototype climax

The most important screen is:

**WITHOUT ADAPTATION vs WITH ADAPTATION**

The product must visibly demonstrate how the same event can produce
different estimated losses, downtime and risk outcomes under two
adaptation scenarios.

------------------------------------------------------------------------

# 3. PROBLEM DEFINITION

MSMEs face physical climate risks that translate into:

-   asset damage
-   inventory damage
-   production downtime
-   worker productivity loss
-   supply-chain disruption
-   repair/recovery costs
-   revenue disruption
-   cash-flow stress
-   potentially higher credit risk

Financial institutions increasingly need climate-risk information, but
climate information is often:

-   geographic rather than borrower-specific
-   hazard-centric rather than financial
-   static rather than event-driven
-   difficult to connect to adaptation investments
-   fragmented across data sources
-   difficult to translate into a credit decision

## Missing layer

> **Continuous, location-specific, borrower-level evidence of whether
> adaptation changed financial exposure.**

CLIMASCORE sits between raw climate intelligence and financial
decision-making.

------------------------------------------------------------------------

# 4. CURRENT 2026 EVIDENCE

The coding agent must distinguish factual external evidence from
illustrative model outputs.

## 4.1 Surat flooding --- July 2026

Indian Express reported that powerloom unit owners in Uma Industrial
Society, Surat, said July 7--8, 2026 flooding damaged machinery, raw and
finished materials and electrical equipment. The memorandum cited
**₹10--15 lakh or more per plot** in reported direct loss, repeated
flooding on July 22--23, and many units remaining closed for around **25
days**. These are **reported claims by unit owners in a memorandum**,
not independently audited CLIMASCORE measurements.

Source: Indian Express, July 2026.\
https://indianexpress.com/article/cities/ahmedabad/surat-powerloom-owners-property-tax-waiver-flood-losses-10811066/

## 4.2 WRI India --- June 2026

WRI India's June 2026 vulnerability assessment examined **more than 300
MSMEs** and field/stakeholder evidence across manufacturing clusters in
Surat, Chennai and Coimbatore. It documents operational disruption,
supply-chain impacts, productivity losses, financial challenges and
barriers to resilience.

Source: WRI India, June 23, 2026.\
https://wri-india.org/research/resilience-micro-small-and-medium-enterprises-climate-risks-vulnerability-assessment

## 4.3 World Bank --- 2026 South Asia heat

The World Bank's 2026 report states that extreme heat is costing South
Asia nearly the equivalent of **31 million full-time jobs annually** and
could reduce the region's economy by nearly **7% by 2050**.

Source: World Bank, July 2026.\
https://www.worldbank.org/en/news/press-release/2026/07/28/extreme-heat-puts-south-asia-s-jobs-and-growth-at-risk-world-bank

## 4.4 IFC --- 2026 adaptation finance

IFC's 2026 report estimates the adaptation finance gap in developing
economies at up to **US\$339 billion per year** and highlights limited
private-sector adaptation reporting and limited firm-level visibility.

Source: IFC, 2026.\
https://www.ifc.org/en/insights-reports/2026/uncovering-the-resilience-of-smaller-firms-in-developing-countries

## 4.5 RBI --- climate-risk data infrastructure

RBI's 2024--25 Annual Report says climate change is emerging as a
significant financial-system risk and that physical-risk assessment
requires hazard and vulnerability/financial-loss data. RBI announced
**RB-CRIS (Reserve Bank - Climate Risk Information System)** to bridge
climate-risk data gaps, including physical risk, transition risk and
carbon-emissions data.

Source: RBI Annual Report 2024--25, Section VI.25 / Box VI.1.\
https://www.rbi.org.in/scripts/AnnualReportPublications.aspx?Id=1436

Strategic interpretation for CLIMASCORE: **RB-CRIS is not being
replaced. CLIMASCORE demonstrates a borrower-level intelligence layer
that can consume standardized climate-risk information and translate it
into lender action.**

------------------------------------------------------------------------

# 5. PRODUCT POSITIONING

## Primary customer

**Banks and NBFCs**, especially credit-risk, portfolio-risk and
climate-risk teams.

## Secondary ecosystem users

-   insurers
-   climate-finance providers
-   development-finance institutions
-   MSMEs / borrowers

## Primary use cases

### Before financing

-   climate-risk screening
-   borrower exposure assessment
-   adaptation-financing opportunity identification

### During financing

-   adaptation tracking
-   climate-event monitoring
-   risk-profile updates

### After a climate event

-   event impact assessment
-   counterfactual comparison
-   estimated avoided loss
-   downtime comparison
-   resilience delta
-   evidence-confidence score
-   borrower risk reassessment

### Portfolio level

-   cluster risk map
-   borrower ranking
-   event exposure
-   adaptation coverage
-   portfolio climate-risk monitoring

------------------------------------------------------------------------

# 6. CORE PRODUCT FLOW

``` text
PUBLIC CLIMATE DATA
        ↓
LOCATION + HAZARD ENGINE
        ↓
MSME RISK TWIN
        ↓
ADAPTATION RECORD
        ↓
CLIMATE EVENT ENGINE
        ↓
COUNTERFACTUAL ENGINE
        ↓
RESILIENCE DELTA
        ↓
BORROWER CLIMATE-RISK PROFILE
        ↓
LENDER ACTION
```

------------------------------------------------------------------------

# 7. DIFFERENTIATION

  Conventional approach       CLIMASCORE
  --------------------------- --------------------------------------
  Static climate risk         Event-driven borrower risk
  Hazard exposure             Hazard + borrower exposure
  Adaptation recommendation   Adaptation outcome
  Track adaptation spend      Estimate resilience effect
  Generic climate report      Lender decision signal
  One scenario                Counterfactual comparison
  Geographic risk             Borrower-level risk
  Climate data                Climate data translated into finance

Do **not** claim that the prototype has empirically proven causal
impact. The prototype demonstrates a transparent **modelled
counterfactual framework**.

------------------------------------------------------------------------

# 8. MVP DEMO PERSONA

Use a **representative synthetic textile MSME in Surat** for the primary
demo.

The borrower is fictional and must be labelled:

> **Illustrative / synthetic borrower --- created for prototype
> demonstration.**

Do not imply it is one of the real businesses referenced by external
sources.

## Seed borrower

``` json
{
  "id": "MSME-SURAT-001",
  "name": "Surat Textile Works",
  "type": "Illustrative MSME",
  "sector": "Textile / Powerloom",
  "city": "Surat",
  "state": "Gujarat",
  "country": "India",
  "annual_revenue_inr": 15000000,
  "inventory_value_inr": 3000000,
  "equipment_value_inr": 2500000,
  "facility_area_sqft": 10000,
  "employees": 55,
  "baseline_risk_score": 78,
  "risk_band": "High"
}
```

All borrower financial figures above are synthetic.

------------------------------------------------------------------------

# 9. RISK ENGINE

Use a transparent 0--100 score:

``` text
Risk Score =
0.35 × Hazard
+ 0.30 × Exposure
+ 0.20 × Vulnerability
+ 0.15 × Business Criticality
```

Each component is 0--100. Higher = greater climate risk.

## Components

### Hazard

-   flood probability/intensity
-   extreme rainfall
-   heat intensity
-   cyclone exposure
-   drought exposure

### Exposure

-   location
-   facility area
-   equipment value
-   inventory value
-   critical infrastructure dependence

### Vulnerability

-   drainage quality
-   equipment elevation
-   cooling availability
-   backup power
-   water protection
-   supply-chain dependency
-   building characteristics

### Business Criticality

-   revenue dependency
-   downtime cost
-   employment dependency
-   inventory turnover
-   operational concentration

## Seed calculation

``` text
Hazard = 82
Exposure = 78
Vulnerability = 80
Business Criticality = 68

Risk ≈ 78 / 100
```

Display:

**Climate Risk Score: 78 / 100 --- HIGH**

This is a synthetic demonstration.

------------------------------------------------------------------------

# 10. ADAPTATION ENGINE

The UI must allow selection of adaptation measures.

## Supported measures

### Raised equipment

Reduces flood exposure to critical machinery.

### Flood barriers

Reduces water ingress.

### Improved drainage

Reduces water accumulation and recovery time.

### Cooling / heat protection

Reduces heat vulnerability.

### Backup power

Reduces operational downtime.

### Inventory elevation / protected storage

Reduces inventory loss.

Each measure stores:

``` text
id
name
hazard
estimated_vulnerability_reduction
implementation_status
evidence
date
```

These effects are model assumptions in the MVP and must be clearly
labelled as such.

------------------------------------------------------------------------

# 11. CLIMATE EVENT ENGINE

Support at least two event types.

## Flood event

``` json
{
  "id": "EVENT-SURAT-FLOOD-2026",
  "type": "Flood",
  "location": "Surat, Gujarat",
  "date": "2026-07-07",
  "severity": "High",
  "source_type": "Public event evidence"
}
```

This is inspired by documented July 2026 Surat flooding. It must not be
presented as a measurement of the synthetic borrower.

## Heat event

``` json
{
  "id": "EVENT-SURAT-HEAT-2026",
  "type": "Extreme Heat",
  "location": "Surat, Gujarat",
  "date": "2026-06",
  "severity": "High",
  "source_type": "Research / field evidence"
}
```

WRI 2026 research is external evidence, not synthetic borrower data.

------------------------------------------------------------------------

# 12. COUNTERFACTUAL ENGINE --- CORE INNOVATION

Run the same event twice.

### Scenario A --- WITHOUT ADAPTATION

Use baseline vulnerability.

### Scenario B --- WITH ADAPTATION

Use modified vulnerability after selected adaptation.

The event must remain identical.

This creates a transparent modelled comparison of resilience.

------------------------------------------------------------------------

# 13. LOSS MODEL

Use a transparent illustrative model:

``` text
Total Estimated Loss =
Asset Damage
+ Inventory Damage
+ Downtime Loss
+ Recovery Cost
```

### Asset damage

``` text
Equipment Value × Damage Rate
```

### Inventory damage

``` text
Inventory Value × Damage Rate
```

### Downtime loss

``` text
Daily Revenue × Downtime Days × Operational Loss Factor
```

### Recovery cost

Configurable percentage of physical damage.

All coefficients must live in configuration rather than being scattered
through UI code.

------------------------------------------------------------------------

# 14. ILLUSTRATIVE COUNTERFACTUAL OUTPUT

For the demo seed:

### Without adaptation

``` text
Risk score: 78
Estimated loss: ₹9.8 lakh
Downtime: 39 hours
```

### With adaptation

``` text
Risk score: 31
Estimated loss: ₹3.1 lakh
Downtime: 11 hours
```

### Derived

``` text
Estimated avoided loss = ₹9.8L - ₹3.1L = ₹6.7L

Illustrative loss reduction ≈ 68%

Downtime avoided = 39 - 11 = 28 hours
```

Every UI view showing these numbers must carry:

> **Illustrative model output --- not observed borrower data.**

Use **estimated avoided loss**, never **verified savings**.

------------------------------------------------------------------------

# 15. RESILIENCE DELTA

``` text
Resilience Delta = Counterfactual Loss − Adapted Loss
```

Display:

-   risk score change
-   loss reduction percentage
-   estimated avoided loss
-   downtime avoided

Example:

``` text
Risk             78 → 31
Estimated loss   ₹9.8L → ₹3.1L
Downtime         39h → 11h
Avoided loss     ₹6.7L
```

------------------------------------------------------------------------

# 16. EVIDENCE CONFIDENCE

The product must distinguish evidence quality from modelled impact.

Inputs can include:

-   hazard/event evidence
-   location confidence
-   asset information
-   adaptation evidence
-   operational evidence
-   observed loss information
-   satellite/remote-sensing evidence

Example seed:

**Evidence Confidence: 82 / 100**

Label it:

**Illustrative evidence score**

Do not call this statistically calibrated confidence.

------------------------------------------------------------------------

# 17. REQUIRED UI SCREENS

## Screen 1 --- Dashboard

Route: `/`

Show:

-   monitored MSMEs
-   high-risk MSMEs
-   active climate events
-   adaptation interventions
-   portfolio exposure
-   Surat highlighted on map

Navigation:

-   Dashboard
-   Risk Analysis
-   MSME Profiles
-   Events
-   Adaptation
-   Portfolio
-   Reports

------------------------------------------------------------------------

## Screen 2 --- MSME Risk Profile

Route: `/msmes/:id`

Header:

**Surat Textile Works**\
Illustrative MSME\
Surat, Gujarat\
Textile / Powerloom

Main risk card:

**78 / 100 --- HIGH**

Risk breakdown:

``` text
Hazard                 82
Exposure               78
Vulnerability          80
Business Criticality   68
```

Also show:

-   flood exposure
-   heat exposure
-   equipment value
-   inventory value
-   revenue
-   operational sensitivity

------------------------------------------------------------------------

## Screen 3 --- Climate Exposure Map

Route: `/msmes/:id/exposure`

Preferred map:

-   Mapbox if configured
-   otherwise Leaflet/OpenStreetMap
-   otherwise static fallback

Layers:

-   MSME location
-   flood exposure
-   heat exposure
-   industrial cluster

No API key may be mandatory for demo mode.

------------------------------------------------------------------------

## Screen 4 --- Adaptation Plan

Route: `/msmes/:id/adaptation`

Cards:

-   raised equipment
-   flood barrier
-   drainage
-   cooling
-   backup power
-   protected inventory

Each card shows:

``` text
Measure
Hazard addressed
Status
Estimated model effect
Evidence
```

Allow add/edit/activate/deactivate.

------------------------------------------------------------------------

## Screen 5 --- Events

Route: `/events`

Show:

**Surat Flood --- July 2026**\
Severity: High

**Surat Extreme Heat --- 2026**\
Severity: High

Each event includes:

-   date
-   hazard
-   location
-   severity
-   source
-   evidence
-   affected MSMEs in demo dataset

------------------------------------------------------------------------

## Screen 6 --- Counterfactual Analysis / HERO SCREEN

Route: `/risk-analysis/:msmeId/:eventId`

Headline:

**What changed because of adaptation?**

Two large scenario panels:

### WITHOUT ADAPTATION

Risk: **78**\
Estimated loss: **₹9.8L**\
Downtime: **39 hours**

### WITH ADAPTATION

Risk: **31**\
Estimated loss: **₹3.1L**\
Downtime: **11 hours**

Between them:

**SAME CLIMATE EVENT**

Below:

### RESILIENCE DELTA

**₹6.7L estimated avoided loss**\
**68% illustrative loss reduction**\
**28 hours downtime avoided**

Badge:

**ILLUSTRATIVE MODEL OUTPUT**

This screen should be the visual climax of the product.

------------------------------------------------------------------------

## Screen 7 --- Evidence Panel

Route: `/risk-analysis/:msmeId/:eventId/evidence`

Evidence chain:

``` text
CLIMATE EVENT
      ↓
HAZARD DATA
      ↓
BORROWER LOCATION
      ↓
ASSET / OPERATIONS
      ↓
ADAPTATION RECORD
      ↓
MODELLED IMPACT
```

Each evidence item shows:

-   source
-   source URL
-   timestamp
-   data type
-   quality/completeness

Example:

``` text
Rainfall / hazard       ✓
Location                 ✓
Asset profile            ✓
Adaptation evidence     ✓
Observed loss            —
```

------------------------------------------------------------------------

## Screen 8 --- Lender Action

Route: `/decision/:msmeId`

Show:

**Borrower Climate Risk: 31 / 100 --- MODERATE**

Suggested actions:

1.  Continue monitoring
2.  Consider adaptation-linked financing
3.  Review collateral exposure
4.  Reassess after major climate events

Do not automatically approve/reject a loan.

Position the product as:

> **Decision support, not autonomous credit approval.**

------------------------------------------------------------------------

## Screen 9 --- Portfolio

Route: `/portfolio`

Show:

-   total borrowers
-   high-risk borrowers
-   event exposure
-   adaptation coverage
-   estimated exposure

Map with filters:

-   city
-   sector
-   hazard
-   risk band
-   adaptation status

------------------------------------------------------------------------

## Screen 10 --- Borrower Report

Route: `/reports/:msmeId`

Sections:

1.  Borrower profile
2.  Climate exposure
3.  Baseline risk
4.  Adaptation measures
5.  Climate event
6.  Counterfactual analysis
7.  Estimated avoided loss
8.  Evidence confidence
9.  Recommended lender actions

PDF export is optional P2. A polished print-friendly page is sufficient
for MVP.

------------------------------------------------------------------------

# 18. TECHNICAL ARCHITECTURE

``` text
                   ┌───────────────────────┐
                   │   CLIMASCORE WEB APP  │
                   │ Next.js / React / TS  │
                   └───────────┬───────────┘
                               │
                               ▼
                   ┌───────────────────────┐
                   │      FASTAPI API      │
                   └───────────┬───────────┘
                               │
          ┌────────────────────┼─────────────────────┐
          ▼                    ▼                     ▼
 ┌────────────────┐   ┌─────────────────┐   ┌────────────────┐
 │ Risk Engine    │   │ Event Engine    │   │ Evidence Engine│
 └───────┬────────┘   └────────┬────────┘   └───────┬────────┘
         │                     │                    │
         └─────────────────────┼────────────────────┘
                               ▼
                   ┌───────────────────────┐
                   │ Counterfactual Engine │
                   └───────────┬───────────┘
                               ▼
                   ┌───────────────────────┐
                   │ PostgreSQL + PostGIS  │
                   └───────────────────────┘
```

------------------------------------------------------------------------

# 19. RECOMMENDED STACK

## Frontend

-   Next.js
-   React
-   TypeScript
-   Tailwind CSS
-   shadcn/ui or equivalent
-   Recharts
-   Leaflet or Mapbox

## Backend

-   Python
-   FastAPI
-   Pydantic
-   SQLAlchemy
-   PostgreSQL
-   PostGIS

## MVP modelling

Use deterministic transparent functions. Do not train a fake ML model on
invented data.

Future production models may use XGBoost/LightGBM or calibrated
probabilistic/causal models once real training data exists.

------------------------------------------------------------------------

# 20. DATA MODEL

## MSME

``` text
id
name
sector
location
latitude
longitude
annual_revenue
inventory_value
equipment_value
facility_area
employees
hazard_scores
vulnerability_score
business_criticality
risk_score
```

## Hazard

``` text
id
type
location
severity
date
source
source_url
```

## Adaptation

``` text
id
msme_id
type
hazard
status
cost
date
evidence
estimated_effect
```

## Event

``` text
id
type
location
start_date
end_date
severity
source
```

## RiskAssessment

``` text
id
msme_id
event_id
hazard_score
exposure_score
vulnerability_score
criticality_score
risk_score
timestamp
```

## CounterfactualRun

``` text
id
msme_id
event_id
baseline_loss
adapted_loss
baseline_downtime
adapted_downtime
baseline_risk
adapted_risk
avoided_loss
loss_reduction_pct
downtime_avoided
evidence_confidence
```

## Evidence

``` text
id
type
source
source_url
timestamp
quality
description
```

------------------------------------------------------------------------

# 21. API CONTRACT

``` http
GET /api/health
GET /api/msmes
GET /api/msmes/{id}
POST /api/msmes
PUT /api/msmes/{id}
GET /api/msmes/{id}/risk
POST /api/risk/calculate
GET /api/events
GET /api/events/{id}
GET /api/msmes/{id}/adaptations
POST /api/msmes/{id}/adaptations
PUT /api/adaptations/{id}
DELETE /api/adaptations/{id}
POST /api/counterfactual/run
GET /api/counterfactual/{id}
GET /api/msmes/{id}/evidence
GET /api/portfolio/summary
GET /api/portfolio/risk-map
```

Counterfactual request:

``` json
{
  "msme_id": "MSME-SURAT-001",
  "event_id": "EVENT-SURAT-FLOOD-2026",
  "adaptations": [
    "raised_equipment",
    "flood_barrier",
    "improved_drainage"
  ]
}
```

------------------------------------------------------------------------

# 22. DEMO MODE / RELIABILITY

The prototype must include **Load Demo Scenario**.

It resets the app to the deterministic Surat scenario.

External APIs must never be mandatory.

Fallbacks:

``` text
External climate API → cached seed event
Map API → static/seeded Surat map
Satellite API → seeded evidence record
Weather API → seeded event record
```

The app must still work offline.

------------------------------------------------------------------------

# 23. REPOSITORY STRUCTURE

``` text
climascore/
├── README.md
├── docker-compose.yml
├── .env.example
├── .gitignore
├── frontend/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── dashboard/
│   │   ├── msmes/
│   │   ├── events/
│   │   ├── risk-analysis/
│   │   ├── portfolio/
│   │   └── reports/
│   ├── components/
│   ├── lib/
│   ├── hooks/
│   ├── types/
│   └── public/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── api/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   │   ├── risk_engine.py
│   │   │   ├── event_engine.py
│   │   │   ├── counterfactual_engine.py
│   │   │   ├── evidence_engine.py
│   │   │   └── portfolio_engine.py
│   │   └── db/
│   ├── tests/
│   └── requirements.txt
├── data/
│   ├── seed/
│   │   ├── msmes.json
│   │   ├── events.json
│   │   ├── adaptations.json
│   │   └── evidence.json
├── docs/
│   ├── architecture.md
│   ├── methodology.md
│   └── sources.md
└── scripts/
    ├── seed.py
    └── demo_reset.py
```

------------------------------------------------------------------------

# 24. UI DESIGN SYSTEM

The visual language must match the pitch deck:

-   premium climate-finance aesthetic
-   white/light background
-   navy typography
-   restrained royal blue
-   light blue panels
-   minimal red for risk
-   green only for adaptation/positive outcomes
-   thin dividers
-   strong whitespace
-   editorial serif headline + modern sans-serif UI
-   no cartoon graphics
-   no emoji
-   no neon
-   no excessive gradients
-   no generic AI brain imagery
-   no unnecessary rounded cards

Suggested palette:

``` text
Navy       #0B1736
Blue       #1769E0
Light blue #EAF3FB
Neutral    #F5F7FA
Text       #172033
Risk red   #C83B3B
Green      #258A62
```

------------------------------------------------------------------------

# 25. SOURCE / EVIDENCE DESIGN

Every factual external data point must carry a compact source reference.

Example UI:

`Source: WRI India, Jun 2026`

The Evidence drawer must provide the full source URL.

For synthetic numbers:

`Illustrative model output`

For the synthetic borrower:

`Illustrative / synthetic borrower`

For reported event claims:

`Reported by Indian Express; figures are claims in a local industry memorandum`

This distinction is mandatory.

------------------------------------------------------------------------

# 26. PROTOTYPE VIDEO FLOW

The prototype must support a one-minute demo.

### 2:00--2:08

Open dashboard.

### 2:08--2:18

Select Surat Textile Works.

### 2:18--2:30

Show baseline climate profile.

### 2:30--2:40

Select adaptation measures.

### 2:40--2:52

Open counterfactual analysis and reveal:

**WITHOUT ADAPTATION vs WITH ADAPTATION**

### 2:52--3:00

Show lender action.

Final line:

> **CLIMASCORE turns climate intelligence into financial action.**

------------------------------------------------------------------------

# 27. TESTING

## Risk test

``` text
82, 78, 80, 68 → approximately 78
```

## Loss test

``` text
₹9.8L - ₹3.1L = ₹6.7L
```

## Loss reduction test

``` text
₹6.7L / ₹9.8L ≈ 68.37% → display 68%
```

## Downtime test

``` text
39h - 11h = 28h
```

## Counterfactual integrity

The climate event must remain identical in both scenarios. Only
adaptation-related assumptions may change.

------------------------------------------------------------------------

# 28. SECURITY / ENGINEERING QUALITY

-   validate API inputs
-   use environment variables for secrets
-   never commit API keys
-   typed schemas
-   graceful error handling
-   deterministic demo seed
-   clean server logs
-   no broken routes
-   no console errors in demo path
-   no mandatory third-party paid service

------------------------------------------------------------------------

# 29. MVP PRIORITY

## P0 --- mandatory

1.  Dashboard
2.  MSME profile
3.  Risk score
4.  Adaptation selection
5.  Climate event
6.  Counterfactual
7.  Resilience Delta
8.  Evidence panel
9.  Lender action
10. Demo mode
11. Professional UI

## P1 --- strongly recommended

12. Map
13. Portfolio dashboard
14. Report view
15. Source drawer

## P2 --- optional

16. PDF export
17. live weather
18. live satellite
19. authentication
20. ML model
21. multi-user accounts

Build all P0 features before P2.

------------------------------------------------------------------------

# 30. BUSINESS MODEL

Primary customer: **banks and NBFCs**.

Potential commercial models:

-   enterprise SaaS
-   per-borrower risk intelligence
-   portfolio monitoring subscription
-   event-triggered assessment
-   API access
-   lender-specific integration

Do not invent pricing for the competition prototype.

------------------------------------------------------------------------

# 31. LONG-TERM MOAT

The potential moat is the dataset created over time:

``` text
Climate event
      +
Borrower exposure
      +
Adaptation
      +
Observed outcome
      +
Financial consequence
```

This can eventually connect:

**climate hazard → adaptation → business disruption → financial
outcome**

The prototype must not claim this dataset already exists.

------------------------------------------------------------------------

# 32. WHAT NOT TO BUILD

Do not spend MVP time on:

-   generic chatbot
-   generic weather app
-   generic ESG dashboard
-   carbon calculator
-   climate news feed
-   generic loan application
-   autonomous credit approval
-   fake real-time satellite imagery
-   fake ML predictions
-   unnecessary admin systems

Every feature must help answer:

1.  What risk does this borrower face?
2.  What adaptation is being financed?
3.  Did adaptation reduce estimated exposure?
4.  What should the lender do next?

------------------------------------------------------------------------

# 33. FINAL JUDGE JOURNEY

The ideal experience is:

``` text
"I see a vulnerable MSME."
        ↓
"I see why climate exposure matters financially."
        ↓
"I see what adaptation was financed."
        ↓
"I trigger a climate event."
        ↓
"I compare the same event without vs with adaptation."
        ↓
"I see the resilience delta."
        ↓
"I can inspect the evidence."
        ↓
"I understand what a lender can do with it."
```

The judge should finish with:

> **This is not another climate dashboard. It connects climate events,
> adaptation and borrower-level financial decisions.**

------------------------------------------------------------------------

# 34. DEFINITION OF DONE

The prototype is complete when a judge can open the app, select the
seeded Surat MSME, understand its baseline climate risk, select
adaptation measures, trigger a documented climate event, run the
counterfactual analysis, see the modelled resilience delta, inspect the
supporting evidence, and understand what a lender can do with the result
--- without needing the development team to explain the software.

The core promise is:

> **CLIMASCORE makes resilience measurable, so finance can act on it.**

------------------------------------------------------------------------

# 35. FINAL SOURCES

1.  **RBI Annual Report 2024--25** --- climate-risk data gaps and
    RB-CRIS.\
    https://www.rbi.org.in/scripts/AnnualReportPublications.aspx?Id=1436

2.  **WRI India --- June 23, 2026** --- MSME vulnerability assessment
    across Gujarat and Tamil Nadu.\
    https://wri-india.org/research/resilience-micro-small-and-medium-enterprises-climate-risks-vulnerability-assessment

3.  **Indian Express --- July 2026** --- reported Surat powerloom flood
    losses and closures.\
    https://indianexpress.com/article/cities/ahmedabad/surat-powerloom-owners-property-tax-waiver-flood-losses-10811066/

4.  **World Bank --- July 2026** --- South Asia heat, jobs and growth.\
    https://www.worldbank.org/en/news/press-release/2026/07/28/extreme-heat-puts-south-asia-s-jobs-and-growth-at-risk-world-bank

5.  **IFC --- 2026** --- MSME adaptation finance gap and firm-level
    adaptation data.\
    https://www.ifc.org/en/insights-reports/2026/uncovering-the-resilience-of-smaller-firms-in-developing-countries

------------------------------------------------------------------------

# 36. NON-NEGOTIABLE CODING-AGENT RULES

1.  Never invent factual evidence.
2.  Never present synthetic values as real.
3.  Never call modelled avoided loss verified savings.
4.  Always label synthetic/modelled values.
5.  Never require paid APIs for demo mode.
6.  Seed deterministic data.
7.  Make the demo work offline.
8.  Make the counterfactual comparison the visual centerpiece.
9.  Keep the UI finance-grade and professional.
10. Build P0 completely before optional integrations.
11. Every external factual claim needs a source.
12. Never claim causal proof from the prototype.
13. Explicitly separate observed/sourced evidence, modelled estimates
    and synthetic data.
14. Position the product as decision support, not autonomous lending.
15. Make the product understandable to a lender without technical
    expertise.

**CLIMASCORE \| Team DASK \| IIT Kharagpur \| SANKALP 2026 \| Climate
Tech**
