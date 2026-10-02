# Architecture Notes — Startup Public Procurement Platform (SIH26136)

## 1. Design Rationale

This platform implements the end-to-end lifecycle for **startup-friendly public procurement**: government departments identify operational challenges, DPIIT-recognized startups apply with innovative solutions, expert panels score proposals, selected startups execute monitored sandbox pilots, independent labs validate outcomes, and successful pilots receive formal procurement decisions for scale-up.

It is **NOT** a general grievance platform or citizen complaint system. It specifically targets the gap between government innovation needs and eligible startup capabilities, using outcome-based KPIs rather than prescriptive technical specifications.

---

## 2. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18+ SPA, Vite, Tailwind CSS v4 |
| Backend | Express.js (Node.js) |
| Database | JSON file store (`backend/db/data.json`) — suitable for demo/hackathon |
| Auth | JWT tokens via `jsonwebtoken`, password hashing via `bcryptjs` |
| Deployment | Single-server (frontend `dist/` served by Express), Netlify-compatible |

---

## 3. Four Primary Roles

1. **Department Officer** (`government`): Creates outcome challenges, reviews applications, selects startups, configures milestones, releases payments, records procurement decisions.
2. **Startup** (`startup`): Maintains DPIIT profile, browses challenges, submits proposals with eligibility self-certification, submits pilot evidence, tracks milestones.
3. **Expert Panel** (`expert`): Scores applications across 4 criteria (Innovation, Feasibility, Security, Cost — 25 pts each = /100).
4. **Independent Validator** (`validator`): Reviews pilot evidence, records Achieved/Partial/Not achieved decisions, uploads verification reports.

An additional **Admin** (`admin`) utility role provides platform oversight, audit trail inspection, and database re-seeding.

---

## 4. Key Backend Route Structure

- `app.use('/api/challenges', problemRoutes)` — Challenge CRUD, AI coach, applications, evaluations, winner selection
- `app.use('/api/pilots', teamRoutes)` — Pilot listing/detail, setup, milestone evidence, validation, payment release, procurement decision
- `app.use('/api/startups', startupRoutes)` — Startup directory and profile management
- `app.use('/api/templates', templateRoutes)` — Procurement template listing and document generation
- `app.use('/api/workspace', workspaceRoutes)` — Workspace detail aggregation endpoint
- `app.use('/api/admin', adminRoutes)` — Stats, users, audit logs, database re-seed

Milestone operations use flat routes under `/api/pilots/milestones/:id/*` (not nested under pilot ID).

---

## 5. Data Model (JSON Store)

The `backend/db/data.json` file contains these collections:

- `users` — Registered users with roles
- `startups` — DPIIT startup profiles with TRL, certifications, capabilities
- `challenges` — Outcome-based department challenges with baseline/target KPIs
- `applications` — Startup proposals with eligibility checklists
- `evaluations` — Expert panel scoring records (4 criteria × 25 pts)
- `pilots` — Active sandbox pilots with KPI tracking and trend data
- `milestones` — Staged payment milestones (must total 100%)
- `validationReports` — Independent verification reports
- `procurementDecisions` — Formal scale-up/procurement records
- `auditLogs` — Transparent lifecycle event log

---

## 6. Demo Data Scenario

The seed script (`backend/seed.js`) creates a complete municipal waste-route challenge:

- **Challenge**: Municipal Solid Waste Collection Route Optimization (Pune)
- **Baseline KPI**: 40% average collection route delay
- **Target KPI**: ≤ 25% delay
- **Startup**: CleanRoute Technologies (DIPP-84920, TRL 7)
- **Expert Score**: 82/100 (Innovation 22 + Feasibility 21 + Security 20 + Cost 19)
- **Pilot Status**: Active with 3 milestones (30%/40%/30% = 100%)
  - Milestone 1: Released (validator-verified, payment disbursed)
  - Milestone 2: Ready for release (validator verified 22% actual delay)
  - Milestone 3: In progress
- **Actual KPI Achieved**: 22% (beats 25% target)
- **Procurement Decision**: Rule 194 direct procurement approved for city-wide scale-up

Three additional challenges are seeded in open/evaluating states for demonstration.

---

## 7. Payment & Procurement Disclaimers

- All payment statuses ("Released", "Ready for release") are **demo statuses only**. No real financial transactions occur.
- Procurement decisions reference GFR Rule 194 and GeM as demonstration of intended real-world pathways.
- Templates are labeled as **demo drafts**, not legally approved documents.
- No external APIs, payment gateways, or government systems are actually connected in this MVP.
