# MASTER SERVICE AGREEMENT (MSA)

**PropWeb × Trinetry Infotech Private Limited**

---

## 1. PARTIES

**Client:** PropWeb Private Limited  
Legal Entity Name: [PROPWEB_LEGAL_ENTITY_NAME]  
CIN: [PROPWEB_CIN]  
PAN: [PROPWEB_PAN]  
GSTIN: [PROPWEB_GSTIN]  
Registered Office: [PROPWEB_REGISTERED_ADDRESS]  
Authorized Signatory: [PROPWEB_AUTHORIZED_SIGNATORY]  
CEO 1: [PROPWEB_CEO_1_NAME]  
CEO 2: [PROPWEB_CEO_2_NAME]  

**Vendor:** Trinetry Infotech Private Limited  
CIN: U62099PN2025PTC247965  
PAN: AAMCT4307L  
GSTIN: 27AAMCT4307L1ZY  
Registered Office: 34/A Gulmoher, Centrepoint Near WNC NGR, Vadgaon Sheri, Pune – 411014, Maharashtra, India  
Directors: Yogesh Sahu, Umesh Shankar Sahu  
Bank Account Name: [TRINETRY_BANK_ACCOUNT_NAME]  
Bank Name: [TRINETRY_BANK_NAME]  
Account Number: [TRINETRY_ACCOUNT_NUMBER]  
IFSC Code: [TRINETRY_IFSC_CODE]  

---

## 2. PROJECT OVERVIEW

**Project Name:** PropWeb MVP Build – Bengaluru Rental Platform  
**Project Duration:** 18 Weeks from date of signing  
**Effective Date:** [DATE_OF_SIGNING]  
**Primary Delivery Centre:** Pune, Maharashtra  
**On-site Requirement:** One (1) dedicated Trinetry engineer shall be stationed at PropWeb Mumbai office throughout the engagement for coordination, integration, and knowledge transfer.

---

## 3. SCOPE OF WORK

### 3.1 In Scope (P0 Launch Set – Live Delivery)

- Search & map discovery — locality filters, list + map views
- Owner listing creation — photos, rent amount, geotag
- Trust badges — Verified Owner & Verified Tenant (KYC-backed)
- Rental Trust Score (0–100 scale)
- Pay-to-connect integration (Razorpay)
- Contact masking (Exotel)
- OTP authentication flows
- KYC workflows
- Owner dashboard with analytics
- Real backend infrastructure (Node.js/TypeScript, PostgreSQL + PostGIS, AWS Mumbai)
- Bengaluru rentals only
- Web-first delivery

### 3.2 Out of Scope (Future Phases – Separate Fee)

- AI Match Score (rule-based or ML)
- Digital rent agreement / eSign / e-stamping
- Fraud & broker detection / duplicate photo detection
- Services marketplace (movers, cleaning, interiors)
- Resale flows, native apps, in-app rent payment
- Multi-city expansion
- Any scope brought forward requires written change order + additional fee

---

## 4. DELIVERABLES & MILESTONES

| Milestone | Code | Amount | Percentage | Timeline | Deliverable |
|-----------|------|--------|------------|----------|-------------|
| Mobilization | M0 | ₹7,50,000 | 15% | On signing | Pod mobilization, environment provisioning, architecture setup |
| Backend & Auth | M1 | ₹7,50,000 | 15% | Week 4 | AWS Mumbai setup, CI/CD pipeline, OTP auth, database schema, design system |
| Discovery & Listing | M2 | ₹10,00,000 | 20% | Week 8 | Search + map UI, listing creation flow, detail pages, live data integration |
| Trust & KYC | M3 | ₹10,00,000 | 20% | Week 12 | KYC workflows, verified badges, Rental Trust Score algorithm & display |
| Monetization & Comms | M4 | ₹7,50,000 | 15% | Week 15 | Pay-to-connect (Razorpay), contact masking (Exotel), owner dashboard |
| Go-Live | M5 | ₹7,50,000 | 15% | Week 18 | Security hardening, UAT, performance testing, production deployment |
| **TOTAL** | | **₹50,00,000** | **100%** | 18 weeks | Fully functional MVP on live infrastructure |

---

## 5. PAYMENT TERMS

**Contract Value:** ₹50,00,000 + Applicable GST (18%)  
**Total Contract Value (with GST):** ₹59,00,000

### 5.1 Payment Schedule

Payment is linked to milestone acceptance and released as follows:

| Milestone | Amount | GST (18%) | Total | Payment Due |
|-----------|--------|-----------|-------|-------------|
| M0 | ₹7,50,000 | ₹1,35,000 | ₹8,85,000 | Upon signing |
| M1 | ₹7,50,000 | ₹1,35,000 | ₹8,85,000 | Within 7 business days of acceptance |
| M2 | ₹10,00,000 | ₹1,80,000 | ₹11,80,000 | Within 7 business days of acceptance |
| M3 | ₹10,00,000 | ₹1,80,000 | ₹11,80,000 | Within 7 business days of acceptance |
| M4 | ₹7,50,000 | ₹1,35,000 | ₹8,85,000 | Within 7 business days of acceptance |
| M5 | ₹7,50,000 | ₹1,35,000 | ₹8,85,000 | Within 7 business days of acceptance |

### 5.2 Invoicing & Payment

- Trinetry shall invoice PropWeb upon milestone completion and client acceptance.
- Payment shall be due within **7 business days** of invoice date.
- Invoices to be sent to: [PROPWEB_PAYMENT_EMAIL]
- Bank transfer to Trinetry account details provided above.

### 5.3 Late Payment Interest

If payment is not received within 7 business days of invoice date, interest at **1.5% per month** (simple interest) shall accrue on the outstanding amount.

### 5.4 Taxes & GST

- All amounts listed are exclusive of Applicable GST (currently 18%).
- GST shall be charged and paid separately as per Indian law.
- Both parties shall maintain valid GST registration and provide GST-compliant invoices.

---

## 6. MILESTONE ACCEPTANCE & DELIVERY

### 6.1 Acceptance Criteria

Each milestone must meet the following acceptance criteria before payment is released:

1. **Code Quality:** Code shall follow industry standards; all deliverables shall pass agreed code review.
2. **Testing:** Unit tests, integration tests, and UAT shall pass with <5% critical defects.
3. **Documentation:** Technical and deployment documentation shall be provided.
4. **Performance:** No unresolved critical or high-severity bugs blocking core functionality.
5. **Deployment:** Code deployed to AWS Mumbai staging environment, accessible to PropWeb team for review.

### 6.2 Approval Window

PropWeb shall review and approve/reject each milestone within **7 business days** of delivery. If no response is provided within 7 days, the milestone is deemed accepted.

### 6.3 Rework & Resubmission

If a milestone is rejected due to non-conformance with acceptance criteria, Trinetry shall rework at no additional cost and resubmit within 5 business days.

---

## 7. PROJECT WARRANTY

**Warranty Period:** 180 days from production go-live (M5 completion)

During the warranty period, Trinetry shall:
- Fix any defects in code or deliverables at no additional cost.
- Provide critical bug fixes within 24 business hours.
- Provide standard bug fixes within 7 business days.
- Maintain systems uptime of 99% SLA for infrastructure provisioned by Trinetry.

Post-warranty defects or enhancements shall be quoted separately.

---

## 8. TEAM & STAFFING

### 8.1 Trinetry Team Composition

**Embedded at PropWeb Mumbai Office:**
- 1 Senior Full-Stack Engineer (liaison, coordination, knowledge transfer)

**At Trinetry Pune Office:**
- 1 Full-Stack Tech Lead (architecture, code review, critical decisions)
- 2-3 Backend Engineers (API, database, KYC integrations)
- 1-2 Frontend Engineers (UI/UX implementation, responsiveness)
- 0.5 DevOps Engineer (fractional, infrastructure, CI/CD)
- 0.5 Design/UX consultant (fractional, design system, UI refinement)

### 8.2 Staffing Discretion

Trinetry may adjust team composition at its discretion if milestones and timeline are on track. Any material changes to the core team lead or delivery resources shall be communicated to PropWeb in writing.

---

## 9. COMMUNICATION & GOVERNANCE

### 9.1 Communication Channels

- **Primary:** Email (official communication)
- **Secondary:** WhatsApp (urgent updates, quick clarifications)
- **Escalation:** Weekly sync meetings (Mondays, 10:00 AM IST) via video call

### 9.2 Reporting

- **Weekly Status Reports:** Every Friday detailing progress, blockers, risks
- **Milestone Reports:** Detailed delivery report for each milestone including test results, deployment logs
- **Change Requests:** Submitted in writing; evaluated and quoted separately

### 9.3 Access & Infrastructure

PropWeb shall provide:
- AWS account access (or handle provisioning cost if hosted by Trinetry)
- GitHub/GitLab repository access
- Staging environment access for testing
- Necessary third-party API credentials (Razorpay, Exotel, etc.)

---

## 10. EXCLUSIVITY & CONFIDENTIALITY

### 10.1 Exclusivity

For the first **30 days** from signing, Trinetry commits not to take on competing rental/property platform projects that could create a conflict of interest.

### 10.2 Confidentiality

Both parties agree to maintain confidentiality of proprietary information, business plans, and code shared during the engagement. Confidentiality obligations survive project completion for 2 years.

### 10.3 Non-Disclosure

Trinetry shall not disclose PropWeb's business plans, user data, or code publicly without written consent. PropWeb shall not publicly disclose Trinetry's methodology or internal processes without consent.

---

## 11. INTELLECTUAL PROPERTY

### 11.1 Work Product Ownership

All code, designs, documentation, and deliverables created under this MSA are the exclusive property of PropWeb upon receipt of payment for that milestone.

### 11.2 Third-Party Libraries

Open-source libraries used shall be listed with their respective licenses (MIT, GPL, Apache, etc.). Trinetry ensures all third-party code complies with applicable licenses.

### 11.3 Pre-Existing IP

Any pre-existing Trinetry tools, frameworks, or methodologies may be reused (with appropriate licensing terms if proprietary).

---

## 12. LIABILITY & INDEMNIFICATION

### 12.1 Limitation of Liability

- Neither party shall be liable for indirect, incidental, special, or consequential damages.
- Trinetry's total liability is capped at the fees paid in the current milestone or ₹10,00,000, whichever is lower.

### 12.2 Indemnification

- Trinetry indemnifies PropWeb against claims that the deliverables infringe third-party IP rights.
- PropWeb indemnifies Trinetry against claims arising from PropWeb's misuse or modification of deliverables.

---

## 13. TERMINATION & DISPUTE RESOLUTION

### 13.1 Termination for Cause

Either party may terminate this MSA if:
- The other party materially breaches terms and fails to cure within 15 days of written notice.
- The other party becomes insolvent or enters insolvency proceedings.

### 13.2 Termination for Convenience

PropWeb may terminate this MSA for convenience with 30 days' written notice. In such case, Trinetry shall be paid for completed milestones plus reasonable wind-down costs (not to exceed 2 weeks of team costs).

### 13.3 Dispute Resolution

1. **Negotiation:** Disputes shall first be discussed between project leads within 5 business days.
2. **Escalation:** If unresolved, escalate to principals (CEO/Director level) for resolution.
3. **Arbitration:** If still unresolved after 15 days, disputes shall be resolved through arbitration under the **Arbitration and Conciliation Act, 1996**, with seat of arbitration in **Mumbai**.
4. **Arbitration Details:**
   - Single arbitrator mutually agreed upon by both parties
   - Language: English
   - Applicable Law: **Laws of India**
   - Jurisdiction: **Courts of Mumbai**

---

## 14. FORCE MAJEURE

Neither party shall be liable for delays or failures in performance due to events beyond reasonable control, including:
- Natural disasters
- Government actions
- War or terrorism
- Pandemics
- Network outages or infrastructure failures

Affected party shall notify the other within 48 hours and provide reasonable alternative timeline.

---

## 15. GENERAL PROVISIONS

### 15.1 Entire Agreement

This MSA constitutes the entire agreement between the parties and supersedes all prior negotiations, representations, and agreements.

### 15.2 Amendments

Amendments must be in writing and signed by authorized representatives of both parties.

### 15.3 Notices

All notices shall be sent via email to:
- **PropWeb:** [PROPWEB_NOTICE_EMAIL]
- **Trinetry:** [TRINETRY_NOTICE_EMAIL]

### 15.4 Governing Law

This MSA shall be governed by and construed in accordance with the **Laws of India** and subject to the **Exclusive Jurisdiction of Courts in Mumbai**.

### 15.5 Severability

If any provision is found invalid or unenforceable, the remaining provisions shall continue in full force and effect.

---

## 16. SIGNATURES

**For PropWeb Private Limited:**

Authorized Signatory: ___________________________  
Name: [PROPWEB_AUTHORIZED_SIGNATORY]  
Title: [PROPWEB_SIGNATORY_TITLE]  
Date: ___________________________  

**For Trinetry Infotech Private Limited:**

Authorized Signatory: ___________________________  
Name: [TRINETRY_AUTHORIZED_SIGNATORY]  
Title: [TRINETRY_SIGNATORY_TITLE]  
Date: ___________________________  

---

## APPENDICES

### Appendix A: Technical Specifications
- Platform: Node.js/TypeScript (Backend), React/Vue (Frontend)
- Database: PostgreSQL + PostGIS
- Hosting: AWS Mumbai Region
- CI/CD: GitHub Actions / GitLab CI
- Monitoring: CloudWatch, DataDog (optional)

### Appendix B: Third-Party Integrations
- Payment Gateway: Razorpay
- Communication: Exotel
- Geolocation: Google Maps / Mapbox
- KYC: [KYC_PARTNER_TO_BE_DETERMINED]

### Appendix C: Acceptance Checklist (Per Milestone)
- [ ] Code deployed to staging
- [ ] All unit & integration tests passing
- [ ] UAT test cases passed
- [ ] Documentation completed
- [ ] Security audit completed (if required)
- [ ] Performance benchmarks met
- [ ] Critical defects resolved

---

**Document Version:** 1.0  
**Last Updated:** 23-July-2026  
**Status:** Draft for negotiation — not legal or financial advice.
