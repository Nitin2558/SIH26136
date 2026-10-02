# Startup-Friendly Public Procurement Platform (SIH26136)

> **Smart India Hackathon Problem Statement SIH26136**:  
> *"Startup friendly public procurement mechanism that enables government departments to identify, pilot, procure, and scale innovative solutions from eligible startups."*

---

## ⚡ Unified Single-Command Execution

You can run **both the Frontend UI and Backend API on a single unified server (`http://localhost:5000`)** using **one single command**!

### Run Everything with One Command:
```bash
npm start
```
*(Or `npm run dev`)*

This single command will:
1. Build the React production bundle into `frontend/dist`.
2. Seed the database (`backend/db/data.json`) with the end-to-end **Municipal Solid Waste Collection Route Optimization** scenario (CleanRoute Technologies `#DIPP-84920`, IIT Delhi validator, SBoT 30%/40%/30% milestone escrow, Rule 194 scale-up decision) and 3 additional realistic challenges.
3. Start the Express server on **`http://localhost:5000`**, serving both the full interactive web app UI and all SIH26136 API endpoints.

---

## 🌟 The 8-Stage Public Innovation Procurement Lifecycle

1. **Outcome Challenge Definition & AI Problem Coach**:
   - Department officers formulate challenges by measurable target KPIs (e.g. *<25% collection delay, >=15% diesel savings*) rather than prescriptive brand specifications.
   - Built-in **AI Problem Coach** (`POST /api/challenges/coach`) converts raw requirements into structured outcome rubrics and sandbox parameters.
2. **DPIIT Startup Fair Eligibility Discovery**:
   - Startups filter challenges without prohibitive past-turnover barriers or 3-year prior experience roadblocks.
   - Fair eligibility checklist: DPIIT registration (`DIPP-XXXXX`), TRL 4–9 self-certification, IP ownership declaration, and cybersecurity compliance.
3. **Multi-Criteria Expert Panel Evaluation (/100 Points)**:
   - Empaneled experts score proposals using a balanced 100-point rubric:
     - **Technical Innovation & IP Uniqueness** (0–25 pts)
     - **Operational Feasibility & TRL Readiness** (0–25 pts)
     - **Cybersecurity, Data Privacy & Safety** (0–25 pts)
     - **Cost Efficiency & Public Value ROI** (0–25 pts)
   - Advisory score and qualitative panel recommendations guide the department award committee.
4. **Award & 100% Staged Pilot Milestone Agreement (Model SBoT)**:
   - Department officer awards the winning startup and executes a **Model SBoT Pilot Agreement**.
   - Pilot milestones are configured with strict percentage validation (**must sum to exactly 100%**).
5. **Sandbox Testbed Execution**:
   - Startups deploy prototypes in designated operational zones (e.g., 25 municipal collection vehicles in Pune), logging telemetry, sensor feeds, and verification artifacts.
6. **Independent 3rd-Party Verification & Assessment Lab**:
   - Empaneled technical testing institutes (e.g., IIT Delhi Clean Mobility Assessment Lab) inspect field testbeds, compare claimed metrics against audited ground truth, and certify reports.
   - A verdict of **`Achieved`** automatically transitions the milestone to **`ready_for_release`**.
7. **Milestone Payment Release**:
   - Department officer reviews validator certification and authorizes payment tranche release without tender committee hold-ups.
8. **Scale-Up & Direct Public Procurement (GFR Rule 194 / GeM)**:
   - Formal evaluation committee memo records successful pilot outcomes and authorizes direct commercial scaling under **GFR Rule 194** and GeM rate contracts.

---

## 👥 4 Stakeholder Roles + Admin Utility

Click the profile badge in the top navbar or sidebar to switch personas instantly:

| Role | Demo Persona | Key Responsibilities |
|---|---|---|
| **🏛️ Department Officer** | Dr. Sunita Verma (*Dept of Urban Infrastructure, MH*) | Create outcome-based challenges with AI Problem Coach, review startup applications, select a winner, define pilot KPIs and 100% payment milestones, monitor results, authorize payment release, and record procurement or scale-up decision. |
| **🚀 Startup** | Aarav Sharma (*CleanRoute Technologies, DIPP-84920*) | Create a profile, browse and apply to challenges, submit pilot updates and evidence, track milestones and payment status. |
| **🎓 Expert Panel** | Prof. Arvind Nambiar (*IIT Bombay Innovation Cell*) | Score assigned applications against innovation, feasibility, security, and cost criteria (25 pts each = /100). |
| **🔬 Independent Validator** | Dr. Ritu Sengupta (*IIT Delhi Clean Mobility Assessment Lab*) | Review pilot results and evidence, record Achieved / Partial / Not achieved, add comments, and upload a report. |
| **🛡️ Admin** *(utility)* | Procurement Oversight Admin | View platform analytics, inspect audit trails, re-seed demo database. |

---

## 📁 Standard Procurement Framework Templates

The platform includes 7 pre-drafted, printable, and downloadable standard legal and operational documents (`/templates`):
1. **Model SBoT Pilot Agreement**: Sandbox trial contract with IP protection, milestone escrow, and liability caps.
2. **Outcome Problem Statement Canvas**: Template for translating departmental pain points into quantifiable target KPIs.
3. **Multi-Criteria Evaluation Matrix & Rubric**: 100-point scoring guidelines across Innovation, Feasibility, Security, and Cost.
4. **IP Ownership & Public Data Clauses**: Standard clauses ensuring startup retains core IP while granting government perpetual sandbox usage licenses.
5. **Cybersecurity & Compliance Gate Checklist**: CERT-In alignment and citizen data protection controls.
6. **Pilot Risk Register & Mitigation Template**: Operational hazard assessment and fallback protocols.
7. **Rule 194 Direct Scale-Up Procurement Protocol**: Step-by-step pathway for non-tender commercial scaling following validated pilot success.

---

## 🛠️ API Endpoints Summary

- **Auth**: `POST /api/auth/login` (supports `{ demoRole }` for instant demo access), `POST /api/auth/register`, `PUT /api/auth/profile`
- **Challenges**: `GET /api/challenges` (also `/feed`, `/list`), `GET /api/challenges/:id`, `POST /api/challenges`, `POST /api/challenges/coach`, `POST /api/challenges/:id/apply`, `POST /api/challenges/:id/evaluate`, `POST /api/challenges/:id/select-winner`
- **Pilots**: `GET /api/pilots`, `GET /api/pilots/:id`, `POST /api/pilots/:id/setup`, `POST /api/pilots/:id/procurement-decision`
- **Milestones**: `POST /api/pilots/milestones/:id/submit-evidence`, `POST /api/pilots/milestones/:id/validate`, `POST /api/pilots/milestones/:id/release-payment`
- **Startups**: `GET /api/startups`, `GET /api/startups/:id`, `POST /api/startups/profile`
- **Templates**: `GET /api/templates`, `GET /api/templates/:id/generate`
- **Admin**: `GET /api/admin/stats`, `GET /api/admin/audit-logs`, `GET /api/admin/users`, `POST /api/admin/seed`
- **Workspace**: `GET /api/workspace/details`
- **System Health**: `GET /api/health`

> **Note**: All demo data, payment statuses, and procurement decisions are simulated for hackathon demonstration. No real financial transactions occur.
