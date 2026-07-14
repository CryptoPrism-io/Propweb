# PropWeb — Production System Architecture Design

**Date:** 2026-07-14
**Status:** Approved by Yogesh (CTO+CPO) via brainstorming session, 2026-07-14.
**Scope:** This is a real engineering reference for how PropWeb would actually be built post-pitch — not a pitch-deck prop. It is deliberately separate from PLAN.md's 4 pitch deliverables (deck · wireframes · costing slides · demo app); nothing here implies building the real backend as part of that pitch-package scope. It exists to (a) validate the tech-stack starting point named in the Handover Brief with real tradeoff analysis, and (b) give individual-feature architecture for the P0/P1 features in Brief §3.4, optimized against the MVP success metrics in Brief §3.6.
**Grounded in:** `docs/PropWeb_Handover_Brief_Pranav.docx` §2–§5, §7 (PRD, tech summary, costing), `docs/PropWeb.html`, `DESIGN.md` (Trust Score bands).

---

## 1. Design target: MVP-first, evolvable

Designed tightly for Phase 0–1 reality — single city (Bengaluru), a 2–8 person team over months 0–9, the "200+ verified listings per launch locality" launch bar — with explicit evolution paths called out for Phase 2 (depth) and Phase 3 (multi-city, services marketplace) so early choices don't require a rewrite. Not designed for hyperscale; that would be over-engineering against the brief's own stated team/budget.

## 2. Overall architecture: monolith + isolated Trust/KYC service

**Decision:** one core modular monolith (Next.js full-stack: React frontend + API routes/route handlers as the backend — one language, one deploy pipeline) for listings/search/matching/connect/identity/notifications/admin, **plus one isolated deployable** for the Trust/KYC verification pipeline, communicating via a Postgres-backed job queue and an outbox/event pattern — not raw dual-writes or a full message broker.

**Options considered:**

| Option | Verdict | Why |
|---|---|---|
| **A. Pure modular monolith** (KYC in-process too) | Rejected | Fastest to build, but KYC/trust is a fundamentally different workload — async, third-party-vendor-dependent, audit-heavy, and its failure modes (a KYC vendor outage) shouldn't be able to degrade search/browse latency, which is the top-of-funnel path the launch metrics depend on. |
| **B. Monolith + isolated Trust/KYC service** | **Chosen** | Keeps the 90% of work (listings, search, connect) in one simple deployable appropriate for a 2-4 person team, while isolating the one subsystem that's genuinely different in shape: compliance-sensitive, vendor-dependent, inherently async, and the actual differentiator/moat. Gives a clean seam to split further in Phase 2-3 without a rewrite. |
| **C. Service-oriented from day one** (4 services matching the deck's modules) | Rejected | Matches Phase 3 scale, but is the wrong tool for month-1 reality: distributed tracing, service-to-service auth, N deploy pipelines are pure overhead against single-city, hundreds-of-listings traffic. Directly contradicts the brief's own stated budget/team constraints. |

**Module boundaries inside the monolith** (enforced by folder structure + lint rules, not network calls):
`listings` (CRUD, geo, photos, status lifecycle: draft → pending → published → archived) · `search` (read-side query layer over Typesense) · `matching` (stateless rule-based scoring, no persistence) · `connect` (pay-to-connect orchestration + call masking) · `identity` (OTP auth, sessions) · `trust-score` (score computation/storage) · `notifications` (WhatsApp/SMS) · `admin` (KYC review queue, listing moderation, metrics dashboard).

## 3. Trust/KYC service (the one isolated deployable)

- **Database:** same Postgres *instance*, separate *schema* — isolates the process/deploy/fault domain without paying for a second RDS instance in month 1. Split to its own instance later only if load or a compliance audit demands stronger isolation.
- **Queue:** pg-boss (Postgres-backed), not Redis/SQS — avoids standing up and paying for a whole extra infra product; consistent with the brief's own "boring, reliable" philosophy for Postgres.
- **Flow:** submission → job enqueued → worker calls PAN check (Surepass/IDfy class vendor) + Aadhaar offline XML / DigiLocker → automated pass/fail; ownership-proof documents (property tax receipt / electricity bill / sale deed) go to a **manual review queue** in the `admin` module → state machine transitions `submitted → processing → manual_review → verified/rejected` → badge-issuance event published → `trust-score` and `identity` modules consume it.
- **Audit log:** append-only, stores vendor reference IDs and decision metadata only. **Never stores raw Aadhaar numbers** — this is a schema-level enforcement of the Puttaswamy (2018) legal constraint from Brief §5, not just a policy note.

## 4. Data architecture

- **Postgres (RDS, AWS Mumbai)** — source of truth for all transactional data (listings, users, connects, trust records). PostGIS extension for geo queries ("flats within 3km").
- **Typesense (self-hosted, single node, same VPC)** — derived, read-optimized search index only, never source of truth. Synced via an **outbox pattern**: writes to `listings` also insert an `outbox_events` row; a worker tails it and pushes to Typesense. This avoids dual-write drift and gives free replay capability if the index needs rebuilding.
- **No Redis in the MVP.** Sessions via signed cookies/JWT; rate limiting at the edge (Cloudflare) or in-app. One fewer moving part and one fewer cost line until a real need is proven.
- Reaffirms Typesense self-hosted over Algolia (~$69/mo vs ~$525/mo, per Brief §5) as the single biggest deliberate cost-avoidance decision in the stack.

## 5. Deployment topology

Next.js app + Trust/KYC worker both run as ECS Fargate tasks in one VPC, **AWS Mumbai (ap-south-1) — non-negotiable**, per the DPDP/KYC-vendor-credibility constraint already established in the brief. RDS Postgres Mumbai, S3 Mumbai for photos, CloudFront/Cloudflare CDN in front. Deliberately **not Vercel** despite the Next.js choice — data residency for KYC data rules it out.

## 6. Feature architecture

### 6.1 Trust Score (per-listing, 0–100, bands per `DESIGN.md`)
- Formula: weighted combination of owner verification level (from Trust/KYC) + response rate + listing freshness (age-decayed) + review aggregate.
- **Weights live in a config table, not hardcoded** — product/growth needs to tune this without a deploy, since the weights directly shape owner incentives (over-weight freshness → spam re-listing; under-weight verification → the badge becomes meaningless, undermining the ">70% verified-listing share" metric).
- Recompute trigger is hybrid: event-driven for fast-changing inputs (KYC status change, new review, response logged — immediate recompute); nightly batch for freshness decay (pure function of listing age).
- Denormalized onto the `listings` row after each recompute — search/listing-card reads never join or compute live; this is the top-of-funnel read path and must stay fast.

### 6.2 Match Score (per search, tenant-contextual)
- Rule-based per Brief §8.2: budget fit 40% + locality 25% + family/bachelor fit 15% + furnishing 10% + move-in date 10%.
- Computed **on-demand in the API layer** at search time — join the tenant's saved preference profile against each Typesense result before returning. No storage, no precompute: it's cheap deterministic arithmetic and inherently contextual to the tenant's current search, not worth caching beyond pagination consistency within one request.

### 6.3 Search & map discovery
- Query flow: filters (+ optional geo radius) → Typesense (geo + full-text + filter) → enrich with match score (per tenant) + trust score (already denormalized) → return.
- **Explicit fallback path to raw Postgres/PostGIS** if Typesense is unavailable — self-hosted search has no managed SLA, and search is the top-of-funnel entry point; an outage here shouldn't be able to zero out listing discovery and tank the launch's listing-density metric.
- Map stays fully client-side (Leaflet + OSM tiles, per Brief §8.2) — no backend implication beyond returning lat/lng in the listing payload.

### 6.4 Pay-to-connect + call masking
- Flow: Connect click → `connect_intent` created (idempotency key = tenant+listing+time-bucket, blocks double-charge on double-click) → Razorpay order → UPI payment → webhook confirms → Exotel virtual-number mapping provisioned → masked number revealed to tenant, owner notified via WhatsApp with the tenant's verified-badge summary (per Brief §3.3 user story).
- **Reconciliation worker** polls Razorpay for any `connect_intent` stuck `pending` past N minutes — webhooks get lost/delayed in production, and a paid-but-unfulfilled connect is both a support burden and a metric-integrity problem (it would look like a conversion without being one, corrupting the 8% target).
- `call_mappings` table carries a TTL — expire and recycle virtual numbers after N days idle, since Exotel bills per active virtual number; this is a direct infra-cost lever.
- Refund path for post-payment listing takedown: manual/admin-triggered in the MVP, automate later.

### 6.5 Fraud/broker detection (P1 — hooks only in MVP, so it's additive later, not a re-instrumentation project)
- Every meaningful action emits into one append-only `events` table (`listing_created`, `connect_paid`, `kyc_verified`, `search_performed`, etc.) — this table does double duty as the substrate for fraud rules *and* the business-metrics funnel (§7).
- Photo perceptual hash (pHash) computed and stored **at upload time**, even though duplicate-detection matching itself is Phase 2 — cheap now, expensive to backfill later.
- Phone blacklist check at OTP signup and listing creation ships as a near-free P0.5, cheap enough not to defer.

## 7. Business-metrics instrumentation

Mapped to the four MVP success metrics (Brief §3.6):

- **Verified-listing share (>70%) & listing density (200+/locality):** both derivable directly from the `listings` table (status, locality, verification badge). No event pipeline needed — a nightly-refreshed materialized view feeding a metrics page in the `admin` module.
- **Free-to-paid connect conversion (>8%):** needs an actual funnel — `search_performed → listing_viewed → connect_initiated → connect_paid` — sourced from the same `events` table used for fraud hooks (deliberately dual-purpose; avoids building two instrumentation systems).
- **Contact-to-visit rate (>40%) — the hardest signal.** Nothing in this architecture touches the physical world, so there is no natural system-of-record for "a visit happened." Design: an automated WhatsApp micro-survey to the tenant ~T+3 days after contact reveal ("Did you visit? Yes/No"), reusing existing notification infra, cross-referenced against an optional owner-dashboard confirmation, stored in a `connect_outcomes` table. **This will always be a self-reported, sub-100%-response-rate proxy, not a hard measurement** — stated plainly here rather than implying false precision.
- MVP analytics stays inside Postgres (the `events` table + materialized views) — not a data warehouse or a Segment/Kafka pipeline. The budget's "Tools & licenses" line (₹1.5–5L/yr, Brief §7.1) has no room for that, and volume doesn't justify it at launch scale.

## 8. Security & DPDP compliance

- Never store raw Aadhaar numbers — vendor reference tokens only (schema-enforced in the Trust/KYC service).
- Data residency: `ap-south-1` only for RDS, S3, ECS — matches the brief's own DPDP rationale.
- Least privilege: the monolith's DB role reads derived badge/status only; raw KYC vendor payloads are reachable solely from the Trust/KYC service's own role.
- Design for erasure: pseudonymous IDs in the KYC audit trail where feasible, so a deletion request doesn't require rewriting immutable compliance logs.
- Standard hygiene: TLS everywhere, encryption at rest, secrets in AWS Secrets Manager (never env files in the repo).

## 9. Cost mapping to the three budget scenarios (Brief §7.1)

- **Lean MVP infra (~₹15–25k/mo, Phase 0-1):** one small ECS Fargate task for the Next.js app, one small task for the Trust/KYC worker, `db.t4g.micro`-class RDS, one small Typesense node, S3 + CloudFront. Third-party API spend (₹3L/yr lean) covers KYC per-check fees (₹5–25/verification), Exotel minutes/numbers, WhatsApp utility messages, Razorpay's near-0% UPI fees.
- **Production-grade (₹40k–1.5L/mo, Phase 2+):** Multi-AZ RDS, Redis introduced *if* caching is actually proven necessary (not by default), scaled ECS task counts, digital-rent-agreement vendor fees (Leegality/Digio) added.

## 10. Evolution path — the one cheap decision that matters most now

Every `listings` / `search` / `trust-score` row carries a `city_id` from day one, even with exactly one row (Bengaluru) in the `cities` table. Free to add now, expensive to retrofit at Phase 3 (multi-city). Services marketplace becomes a new bounded `services` module with its own partner-integration pattern, without touching core rental modules. Native apps (Phase 3, if data justifies) consume the same Next.js API routes — the payoff of building API-first even though only web ships first.

## 11. Open risks / explicitly flagged uncertainty

- **Contact-to-visit rate measurement (§7)** is architecturally the weakest of the four success metrics — it depends on self-reported survey response rates that this design cannot guarantee. Worth a product decision on acceptable response-rate thresholds before treating the 40% target as reliably measured.
- Typesense self-hosted has no managed SLA; the Postgres/PostGIS fallback (§6.3) mitigates but doesn't eliminate operational risk on a small team with fractional DevOps.
- Weights for the Trust Score formula (§6.1) are not specified in the source brief — this design makes them config-driven but the actual initial values need a product decision, not an engineering one.

---

## Self-review

- **Placeholders:** none — every number/constraint is sourced from the Handover Brief or `DESIGN.md`; §11 explicitly names the genuine open uncertainties rather than hiding them as false precision.
- **Internal consistency:** topology (§2) drives every downstream section — data architecture, feature designs, and cost mapping all assume the monolith+isolated-KYC-service split; no contradiction with the brief's "modular monolith" language, since the split is presented as a validated refinement of it, not a rejection.
- **Scope:** single deliverable (system architecture reference), separate from PLAN.md's 4 pitch deliverables — stated explicitly at the top so it can't be misread as in-scope for the pitch package itself.
- **Ambiguity resolved:** Trust Score formula weights and initial values, and the contact-to-visit measurement approach, are both flagged as open product decisions rather than left ambiguous inside the architecture itself.
