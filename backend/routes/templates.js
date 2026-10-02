const express = require('express');
const router = express.Router();
const { getDB } = require('../db/store');

/**
 * Standard Procurement Framework Templates for SIH26136
 * All documents are marked with prominent demo disclaimers.
 */
const TEMPLATES = [
  {
    id: 'tpl-problem-statement',
    title: 'Outcome-Based Problem Statement Template',
    category: 'Challenge Definition',
    version: '1.2 (SIH26136)',
    applicablePhase: 'Stage 1: Challenge Definition',
    description: 'Standardized municipal canvas translating civic bottlenecks into measurable outcome KPIs and baseline targets rather than rigid specifications.',
    content: `# OUTCOME-BASED PROBLEM STATEMENT CANVAS (SBoT-OPS-01)
> ⚠️ **DEMO DRAFT — NOT A LEGALLY APPROVED DOCUMENT**
> *Prepared for Smart India Hackathon Problem Statement SIH26136 demonstration only. Not a binding government gazette notification.*

---

## 1. Department & Administrative Context
- **Issuing Department**: Department of Urban Infrastructure & Smart Cities Mission
- **Competent Authority**: Municipal Commissioner / Director of Urban Innovation
- **Jurisdiction / Zone**: Municipal Corporation Testbed Wards (e.g., Pune Wards 4 & 7)
- **Sector**: Smart Cities & Waste Logistics
- **Sanction Reference**: GFR-2017 / Rule 194 Innovation Sandbox Pilot

---

## 2. Problem Statement (Operational Bottleneck)
Pune Municipal Corporation operates over 450 solid waste collection vehicles across 15 administrative wards. Manual route planning, unpredictable traffic congestion, and unmonitored community bin overflows currently cause an average morning collection route delay of 40%. This results in high fuel expenditure, public complaints, and uncollected waste during peak commute hours.

---

## 3. Quantifiable KPI Benchmarks (Outcome Requirements)
*Public procurement under SIH26136 specifies target performance outcomes, not proprietary hardware brands.*

| Benchmark Parameter | Current Baseline | Target Pilot Threshold | Target Operator | Verification Methodology |
|---|---|---|---|---|
| **Average Collection Route Delay** | 40.0% | ≤ 25.0% | Less than or equal | Automated in-cab GPS geofence timestamps |
| **Fleet Diesel Fuel Consumption** | Baseline Log (100%) | ≤ 85.0% (-15% reduction) | Less than or equal | Fuel dispenser RFID logs & odometer sync |
| **Missed Community Bin Pickups** | 12.4% daily | ≤ 3.0% daily | Less than or equal | Ultrasonic LoRaWAN fill sensor telemetry |
| **Public Service SLA Breaches** | 35 complaints/ward/wk | ≤ 10 complaints/ward/wk | Less than or equal | Municipal service portal API webhooks |

---

## 4. Fair Startup Eligibility Criteria (Zero Turnover Barriers)
1. **DPIIT Registration**: Startup must hold valid recognition under Startup India (\`DIPP-XXXXX\`).
2. **Prior Turnover Relaxation**: In accordance with GFR Rule 173(i) and DPIIT circulars, prior turnover and prior experience criteria are **100% waived**.
3. **Technology Readiness Level (TRL)**: Minimum TRL 5 (System prototype validated in relevant environment).
4. **IP Ownership**: Startup must self-certify ownership or lawful licensing of core proprietary IP.

---

## 5. Pilot Sandbox Constraints & Staged Grant Allocation
- **Sandbox Duration**: 12 Weeks (Phase 1 Setup: 3 Wks, Phase 2 Live Run: 6 Wks, Phase 3 Scale Docs: 3 Wks)
- **Pilot Grant Budget**: ₹ 12,50,000 (Allocated strictly across 3 milestones: 30% / 40% / 30% = 100%)
- **Data Security**: TLS 1.3 encrypted data in transit; on-premise or CERT-In empaneled cloud residency in India.

---

**Authorized Signatory (Department Officer)**:  
*Dr. Sunita Verma, Director of Urban Modernization*  
*Date of Issue: September 2026*
`
  },
  {
    id: 'tpl-evaluation-matrix',
    title: 'Startup Evaluation Criteria & Scoring Matrix',
    category: 'Evaluation & Screening',
    version: '1.1 (SIH26136)',
    applicablePhase: 'Stage 3: Expert Evaluation',
    description: 'Multi-criteria scoring matrix weighting Innovation (25%), Technical Feasibility (25%), Cybersecurity & Privacy (25%), and Cost Viability (25%).',
    content: `# STARTUP MULTI-CRITERIA EVALUATION RUBRIC (/100 PTS)
> ⚠️ **DEMO DRAFT — NOT A LEGALLY APPROVED DOCUMENT**
> *Prepared for Smart India Hackathon Problem Statement SIH26136 demonstration only. Technical advisory score for Department Award Committees.*

---

## 1. Overview & Evaluation Principles
The evaluation panel evaluates startup applications against four objective pillars (25 points each = 100 points maximum). Scoring is advisory and transparently recorded on the platform audit trail.

---

## 2. Four-Dimension Weighted Scoring Rubric

### Dimension 1: Technical Innovation & Novelty (Max: 25 Points)
- **Proprietary Technology / Algorithms** (0–10 pts): Novelty of dynamic optimization algorithms, AI edge inference, or patented sensor techniques over commercial off-the-shelf software.
- **Problem-Outcome Fit** (0–10 pts): Direct suitability of the solution to solve the department's baseline inefficiency without requiring overhaul of existing fleet.
- **Intellectual Property Strength** (0–5 pts): Patent granted/published, proprietary source code rights, or unique trade secrets.

### Dimension 2: Feasibility & Technology Readiness Level (Max: 25 Points)
- **TRL Maturity (TRL 5–8)** (0–10 pts): Working hardware/software prototype demonstrated in operational or near-operational field environments.
- **Deployment Velocity** (0–8 pts): Capability to deploy sensors, telematics devices, and driver consoles within the 21-day Phase 1 window.
- **Technical Team Capabilities** (0–7 pts): Relevant expertise in geospatial routing, embedded IoT systems, and public administration dashboards.

### Dimension 3: Cybersecurity, Privacy & Data Compliance (Max: 25 Points)
- **Encryption & Transmission Security** (0–10 pts): End-to-end TLS 1.3 encryption, secure API token exchange, and encrypted telemetry pipelines.
- **Data Sovereignty & Local Hosting** (0–8 pts): Compliance with Digital Personal Data Protection (DPDP) Act and storage within Indian borders.
- **CERT-In / STQC Audit Readiness** (0–7 pts): Clean vulnerability assessment report (VAPT) and absence of critical CVE vulnerabilities.

### Dimension 4: Cost Viability & Public Scale-Up ROI (Max: 25 Points)
- **Milestone Budget Allocation** (0–10 pts): Transparent milestone cost breakdown strictly summing to 100% of pilot grant (₹ 12,50,000).
- **Unit Economic Sustainability** (0–8 pts): Per-vehicle recurring operational cost viable for city-wide scale-up across 450 vehicles.
- **Commercialization Plan** (0–7 pts): Readiness for GeM Startup Runway listing and direct scaling under GFR Rule 194.

---

## 3. Benchmark Scoring Example (CleanRoute Technologies)
- **Dimension 1 (Innovation)**: 22 / 25
- **Dimension 2 (Feasibility)**: 21 / 25
- **Dimension 3 (Security)**: 20 / 25
- **Dimension 4 (Cost Viability)**: 19 / 25
- **Total Composite Score**: **82 / 100** (Recommendation: *AWARD FOR SANDBOX PILOT*)

---

**Empaneled Expert Reviewer**:  
*Prof. Arvind Nambiar, IIT Bombay Innovation Cell*  
*Advisory Role: Senior Technical Evaluator*
`
  },
  {
    id: 'tpl-pilot-agreement',
    title: 'Model Startup Pilot & Sandbox Agreement',
    category: 'Contracting & Sandbox',
    version: '2.0 (SIH26136)',
    applicablePhase: 'Stage 4: Pilot Contracting',
    description: 'Standard Sandbox Sandbox-Build-Operate-Test (SBoT) agreement defining staged milestones, milestone funding tranches, and verification rules.',
    content: `# MODEL SANDBOX-BUILD-OPERATE-TEST (SBoT) PILOT AGREEMENT
> ⚠️ **DEMO DRAFT — NOT A LEGALLY APPROVED DOCUMENT**
> *Standardized bilateral pilot contract for Smart India Hackathon SIH26136 demonstration between Government Department and DPIIT Startup.*

---

## 1. Parties to the Agreement
This Agreement is entered into on **01 September 2026** between:
1. **The Department of Urban Infrastructure & Smart Cities Mission**, Government of Maharashtra (hereinafter "The Department"); and
2. **CleanRoute Technologies Private Limited**, DPIIT Recognition #DIPP-84920 (hereinafter "The Startup").

---

## 2. Scope of Pilot Sandbox
The Startup agrees to deploy its *Dynamic AI Municipal Route & Waste Telemetry System* across 45 municipal waste collection vehicles operating in Pune Wards 4 & 7 for an active sandbox testing period of twelve (12) weeks.

---

## 3. Staged Milestone Escrow & Payment Allocation (Strict 100% Rule)
The total pilot sandbox grant of **₹ 12,50,000** shall be disbursed in strict milestone tranches upon independent certification:

| Tranche | Deliverable Scope | Percentage | Amount (INR) | Release Condition |
|---|---|---|---|---|
| **Milestone 1** | In-cab tablet hardware & 60 LoRaWAN bin sensors deployment | 30% | ₹ 3,75,000 | Certified field hardware telemetry online |
| **Milestone 2** | Dynamic TSP routing live run; delay reduced from 40% to ≤ 25% | 40% | ₹ 5,00,000 | Independent Validator "Achieved" verdict |
| **Milestone 3** | Security audit report, API specs & GeM catalog scaling package | 30% | ₹ 3,75,000 | VAPT audit passed & scaling memo executed |
| **Total** | **Verified 100% Pilot Grant Allocation** | **100%** | **₹ 12,50,000** | Strict 100% sum enforced |

---

## 4. Payment Release Gate Check
*No tranche shall be disbursed on verbal instructions or self-certified claims.*  
The platform requires:
1. Startup submits deliverable proof and live telemetry logs.
2. Independent Validator certifies finding as **'Achieved'**, advancing status to **'Ready for release'**.
3. Department Officer authorizes electronic disbursement.

---

**For The Department**: Dr. Sunita Verma, Director of Urban Modernization  
**For The Startup**: Priya Patel / Aarav Sharma, CleanRoute Technologies
`
  },
  {
    id: 'tpl-data-ip-clauses',
    title: 'Data Governance & Intellectual Property (IP) Clauses',
    category: 'Legal & IP Protection',
    version: '1.0 (SIH26136)',
    applicablePhase: 'Stage 4: Pilot Contracting',
    description: 'Startup-friendly IP retention clauses protecting founder patents while granting the government perpetual non-exclusive pilot usage licenses.',
    content: `# INTELLECTUAL PROPERTY & DATA GOVERNANCE FRAMEWORK
> ⚠️ **DEMO DRAFT — NOT A LEGALLY APPROVED DOCUMENT**
> *Startup-friendly IP retention clauses under SIH26136 procurement guidelines.*

---

## 1. Ownership of Background & Foreground IP
1. **Startup IP Retention**: The Startup retains 100% sole ownership of all Background Intellectual Property, patents, source code, neural network model weights, and proprietary optimization algorithms.
2. **No Transfer of Core Tech**: Participation in the public sandbox pilot does **NOT** transfer ownership of startup patents or source repositories to the Government.

---

## 2. Government Usage License
1. **Perpetual Internal License**: The Department is granted a perpetual, non-exclusive, royalty-free license to use the deployed sandbox software instance strictly for internal municipal operations within the pilot testbed.
2. **No Reverse Engineering**: The Department agrees not to decompile, reverse engineer, or sublicense the Startup's proprietary binaries or hardware firmware to any third-party commercial vendor.

---

## 3. Public Municipal Data Sovereignty
1. **Public Data Ownership**: All municipal civic records, garbage bin telemetry logs, vehicle GPS coordinates, and ward collection statistics remain the exclusive property of the Municipal Corporation.
2. **Anonymized Machine Learning Rights**: The Startup may utilize anonymized, aggregated traffic velocity logs to train and refine its TSP routing algorithms, provided no personal or individual identifiers are stored or exposed.

---

**Signed in Concurrence**:  
*Department Legal Cell & Startup Authorized Signatory*
`
  },
  {
    id: 'tpl-cybersecurity-checklist',
    title: 'Cybersecurity & Privacy Compliance Checklist',
    category: 'Security & Compliance',
    version: '2.1 (SIH26136)',
    applicablePhase: 'Stage 5: Sandbox Testing',
    description: 'CERT-In & STQC aligned security verification checklist covering telemetry encryption (TLS 1.3), API token auth, and cloud server geofencing.',
    content: `# CYBERSECURITY & PRIVACY COMPLIANCE GATE (CERT-IN ALIGNED)
> ⚠️ **DEMO DRAFT — NOT A LEGALLY APPROVED DOCUMENT**
> *Mandatory technical security checklist prior to live municipal sandbox connectivity.*

---

## Mandatory Security Controls Checklist

| Control ID | Security Domain | Verification Standard | Compliance Status |
|---|---|---|---|
| **SEC-01** | Telemetry In-Transit | TLS 1.3 with AES-256-GCM cipher suite | ✅ Verified Compliant |
| **SEC-02** | Telemetry At-Rest | AES-256 volume encryption for municipal database | ✅ Verified Compliant |
| **SEC-03** | Cloud Server Geofencing | Data centers strictly localized within Republic of India | ✅ Verified Compliant |
| **SEC-04** | API Authentication | Short-lived signed JWT bearer tokens with RBAC | ✅ Verified Compliant |
| **SEC-05** | IoT Hardware Hardening | Disabled JTAG / debug ports on deployed vehicle consoles | ✅ Verified Compliant |
| **SEC-06** | Vulnerability Assessment | Zero critical/high CVE findings on STQC/CERT-In scan | ✅ Verified Compliant |
| **SEC-07** | DPDP Compliance | No PII (driver biometric or phone logs) unencrypted | ✅ Verified Compliant |

---

**Certifying Security Officer**:  
*Quality & Standards Certification Bureau (NABL Empaneled)*
`
  },
  {
    id: 'tpl-risk-register',
    title: 'Pilot Risk Register & Mitigation Matrix',
    category: 'Risk Management',
    version: '1.0 (SIH26136)',
    applicablePhase: 'Stage 5: Sandbox Testing',
    description: 'Systematic contingency matrix covering hardware failure, battery degradation, network dropouts, and operator adoption barriers.',
    content: `# PILOT RISK REGISTER & CONTINGENCY MITIGATION MATRIX
> ⚠️ **DEMO DRAFT — NOT A LEGALLY APPROVED DOCUMENT**
> *Risk assessment protocol for municipal testbed operations under SIH26136.*

---

## Identified Hazards & Preventive Measures

| Risk ID | Hazard Description | Severity | Likelihood | Mitigation Strategy | Contingency Plan |
|---|---|---|---|---|---|
| **RSK-01** | Cellular 4G dead zones in dense municipal alleys | Medium | High | Offline tablet caching with automatic opportunistic sync on reconnect | Drivers navigate via pre-cached ward road network |
| **RSK-02** | LoRaWAN bin sensor battery drain in monsoon | High | Low | IP67 sealed enclosures with ultra-low-power sleep cycles (15-min ping) | Rapid hot-swap sensor pool maintained by startup |
| **RSK-03** | Municipal driver resistance to digital navigation | Medium | Medium | Simple vernacular Marathi/Hindi UI with audio turn-by-turn alerts | Ward superintendent incentives for on-time completion |
| **RSK-04** | Hardware tablet theft or vandalism | Low | Medium | Custom locked-down vehicle mounts with tamper alert sensors | Remote wipe capability via mobile device management |
| **RSK-05** | API latency during morning peak hours | Medium | Low | Cloud edge CDN caching and local micro-services failover | Fallback to pre-computed static optimal route sheet |

---

**Safety & Operations Officer**:  
*Pune Municipal Corporation Smart Operations Center*
`
  },
  {
    id: 'tpl-procurement-pathway',
    title: 'Post-Pilot Public Procurement & Scale-up Pathway (Rule 194)',
    category: 'Procurement & Scale',
    version: '2.0 (SIH26136)',
    applicablePhase: 'Stage 7: Scale-Up & Procurement',
    description: 'Direct procurement justification note under GFR Rule 194 and GeM Startup Runway scale-up protocol following verified pilot success.',
    content: `# POST-PILOT DIRECT PROCUREMENT & SCALE-UP PROTOCOL (GFR RULE 194)
> ⚠️ **DEMO DRAFT — NOT A LEGALLY APPROVED DOCUMENT**
> *Procurement justification memo template for transitioning validated startup pilots into commercial municipal contracts.*

---

## 1. Statutory Procurement Authority
- **General Financial Rules (GFR) 2017**: **Rule 194** (*Procurement of Innovative Solutions from Startups*)
- **Ministry of Finance Circular**: F.20/2/2014-PPD (Exemption from Prior Turnover and Experience)
- **GeM Integration Pathway**: GeM Startup Runway Direct Contract Adoption

---

## 2. Justification for Direct Commercial Procurement
1. **Demonstrated Performance Exceeding Target**: CleanRoute Technologies demonstrated an actual route delay of **22.0%**, outperforming the required pilot target benchmark of **≤ 25.0%** (from a 40.0% municipal baseline).
2. **Fuel Economy Gains**: Realized **18.4% verified diesel fuel savings** across 45 collection vehicles over 30 consecutive operational days.
3. **Independent 3rd-Party Endorsement**: Quality & Standards Certification Bureau (IIT Delhi lab audit) confirmed 99.4% data telemetry integrity with zero missed collection zones.
4. **Proprietary Innovation**: The Startup holds unique dynamic TSP routing IP not available from standard commercial fleet vendors.

---

## 3. Scale-Up Sanction Scope
- **Scaling Territory**: Pune Municipal Corporation (All 15 Administrative Wards - 450 Collection Trucks)
- **Inter-Departmental Referral**: Forwarded to Pimpri-Chinchwad Municipal Corporation (PCMC) & Nagpur Smart City
- **Annual Scale Budget Sanction**: **₹ 1,45,00,000** (Annual City-Wide Service Contract)
- **Procurement Vehicle**: Direct rate contract onboarding via GeM Startup Runway

---

## 4. Evaluation Committee Sign-off
*"Having examined the verified pilot data, audit certification, and economic savings, the Evaluation Committee unanimously approves direct procurement under GFR Rule 194."*

**Committee Chair**: Dr. Sunita Verma, Director of Urban Modernization  
**Finance Representative**: Joint Commissioner (Accounts), Municipal Corporation  
**Technical Expert**: Prof. Arvind Nambiar, IIT Bombay Innovation Cell  
*Date of Sign-off: October 2026*
`
  }
];

/**
 * GET /api/templates
 * List available procurement & pilot legal/technical templates
 */
router.get('/', (req, res) => {
  res.json({ templates: TEMPLATES });
});

/**
 * GET /api/templates/:id
 * Get single template by ID
 */
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const tmpl = TEMPLATES.find(t => t.id === id);
  if (!tmpl) return res.status(404).json({ error: 'Template not found' });
  res.json({ template: tmpl });
});

/**
 * GET /api/templates/:id/generate
 * Generate prefilled printable document using live challenge/pilot data
 */
router.get('/:id/generate', (req, res) => {
  try {
    const { id } = req.params;
    const { challengeId, pilotId } = req.query;
    const db = getDB();

    const tmpl = TEMPLATES.find(t => t.id === id) || TEMPLATES[0];
    const targetPilot = (db.pilots || []).find(p => p.id === (pilotId || 'pilot-1')) || (db.pilots || [])[0];
    const targetChallenge = (db.challenges || []).find(c => c.id === (challengeId || targetPilot?.challengeId || 'chal-1')) || (db.challenges || [])[0];
    const targetStartup = (db.startups || []).find(s => s.id === targetPilot?.startupId) || (db.startups || [])[0];
    const targetMilestones = (db.milestones || []).filter(m => m.pilotId === targetPilot?.id);

    const docData = {
      challengeTitle: targetChallenge?.title || 'Municipal Waste Route Optimization',
      departmentName: targetChallenge?.departmentName || 'Department of Urban Infrastructure',
      officerName: targetChallenge?.postedBy || 'Dr. Sunita Verma (Director)',
      startupName: targetStartup?.name || 'CleanRoute Technologies',
      founderName: targetStartup?.founderName || 'Priya Patel',
      dpiitNumber: targetStartup?.dpiitNumber || 'DIPP-84920',
      baselineKpi: `${targetChallenge?.baselineKpi?.metric || 'Route Delay'}: ${targetChallenge?.baselineKpi?.value || 40}%`,
      targetKpi: `${targetChallenge?.targetKpi?.metric || 'Route Delay'}: <= ${targetChallenge?.targetKpi?.value || 25}%`,
      achievedKpi: targetPilot?.kpiTracking?.currentActualValue ? `${targetPilot.kpiTracking.currentActualValue}%` : '22.0%',
      budgetAmount: `₹ ${(targetChallenge?.budgetAmount || 1250000).toLocaleString('en-IN')}`,
      milestones: targetMilestones.map((m, i) => `Milestone ${i+1}: ${m.title || m.name} (${m.paymentPercentage || m.percentage}% — ₹${(m.paymentAmount || m.resourceAmount)?.toLocaleString('en-IN')})`),
      date: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
    };

    res.json({
      templateId: id,
      template: tmpl,
      documentData: docData,
      generatedAt: new Date().toISOString(),
      disclaimer: 'DEMO DRAFT: Generated for Smart India Hackathon 2026 demonstration purposes. Not a legally binding substitute for formal gazetted notifications.'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
