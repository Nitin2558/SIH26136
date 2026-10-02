const express = require('express');
const router = express.Router();
const { getDB, saveDB, generateId } = require('../db/store');
const { handleCoachRequest } = require('./coach');

/**
 * AI Problem Coach Service
 * Transforms vague department requests into measurable, outcome-based procurement challenges.
 * Provides rich deterministic intelligence if no LLM key is configured.
 */
async function generateAiCoachAdvice({ roughDescription, sector, departmentName }) {
  const text = (roughDescription || '').trim();
  const lower = text.toLowerCase();

  // Heuristic domain pattern matcher for intelligent demo suggestions
  let domain = 'general';
  if (lower.includes('waste') || lower.includes('garbage') || lower.includes('trash') || lower.includes('bin') || lower.includes('sanitation')) {
    domain = 'waste';
  } else if (lower.includes('water') || lower.includes('leak') || lower.includes('pipe') || lower.includes('drain') || lower.includes('sewer') || lower.includes('flood')) {
    domain = 'water';
  } else if (lower.includes('traffic') || lower.includes('ambulance') || lower.includes('signal') || lower.includes('road') || lower.includes('pothole') || lower.includes('congestion')) {
    domain = 'traffic';
  } else if (lower.includes('health') || lower.includes('hospital') || lower.includes('clinic') || lower.includes('power') || lower.includes('solar') || lower.includes('energy') || lower.includes('microgrid')) {
    domain = 'energy_health';
  } else if (lower.includes('education') || lower.includes('school') || lower.includes('student') || lower.includes('digital') || lower.includes('learning')) {
    domain = 'education';
  }

  const coachTemplates = {
    waste: {
      suggestedTitle: 'AI-Optimized Municipal Solid Waste Collection & Dynamic Fleet Dispatch',
      sector: 'Smart Cities & CleanTech',
      baselineKpi: { metric: 'Average Waste Collection Route Delay', unit: '%', value: 40, description: '40% daily delay in municipal morning collection schedules' },
      targetKpi: { metric: 'Average Waste Collection Route Delay', unit: '%', value: 25, targetOperator: '<=', description: 'Achieve <= 25% average route delay with live GPS & sensor telemetry' },
      estimatedBudget: 1250000,
      durationWeeks: 12,
      problemStatementStructured: `Current manual route scheduling in ${departmentName || 'Municipal Corporation'} causes 40% route delays, excessive diesel expenditure, and unmonitored community bin overflows during peak morning hours.`,
      outcomeRequirement: 'Deploy an automated IoT bin fill-level sensing + dynamic TSP route optimization solution across pilot wards to reduce collection route delay from 40% down to 25% or lower, backed by real-time daily municipal dashboard data.',
      constraints: ['Must integrate with open municipal GIS APIs', 'Zero hardware modification to vehicle engines', 'Works reliably on 4G cellular telemetry in dense urban alleys'],
      recommendedEligibility: { minTrl: 5, dpiitRequired: true, fairStartupRules: true }
    },
    water: {
      suggestedTitle: 'Non-Invasive Acoustic Sensor Network for Underground Water Loss & Fracture Detection',
      sector: 'Water & Urban Infrastructure',
      baselineKpi: { metric: 'Non-Revenue Water Loss (NRW)', unit: '%', value: 35, description: '35% unmetered water lost through subsurface pipeline leaks' },
      targetKpi: { metric: 'Non-Revenue Water Loss (NRW)', unit: '%', value: 15, targetOperator: '<=', description: 'Reduce non-revenue water loss to <= 15% across pilot corridor' },
      estimatedBudget: 1800000,
      durationWeeks: 14,
      problemStatementStructured: `Undetected underground pipeline fractures in ${departmentName || 'Water Supply Board'} lead to 35% non-revenue water losses and prolonged supply disruptions before physical surface pooling appears.`,
      outcomeRequirement: 'Deploy IoT acoustic noise loggers and predictive machine learning to localize deep subterranean fractures within 1-meter precision, reducing non-revenue water loss from 35% to 15%.',
      constraints: ['Non-invasive sensor attachment (no pipeline cuts)', 'Sub-surface battery lifespan >= 12 months', 'Real-time LoRaWAN/NB-IoT telemetry transmission'],
      recommendedEligibility: { minTrl: 5, dpiitRequired: true, fairStartupRules: true }
    },
    traffic: {
      suggestedTitle: 'Edge-AI Computer Vision Signal Preemption for Emergency Corridors',
      sector: 'Mobility & Public Safety',
      baselineKpi: { metric: 'Emergency Corridor Transit Delay', unit: 'Minutes', value: 18, description: '18 minutes transit delay for ambulances across high-congestion junctions' },
      targetKpi: { metric: 'Emergency Corridor Transit Delay', unit: 'Minutes', value: 6, targetOperator: '<=', description: 'Reduce ambulance transit delay to <= 6 minutes during peak hours' },
      estimatedBudget: 2200000,
      durationWeeks: 16,
      problemStatementStructured: `Fixed-cycle traffic signals at critical junctions in ${departmentName || 'Traffic Directorate'} cause emergency ambulances to wait up to 18 minutes in congestion, endangering patient critical response windows.`,
      outcomeRequirement: 'Deploy edge-AI camera sensors and smart signal controller relays that detect approaching emergency vehicles and automate green-corridor switching within 40 seconds of approach, dropping transit delay from 18 mins to <= 6 mins.',
      constraints: ['Zero latency edge inference (<150ms)', 'Fail-safe fallback to municipal signal clock during power/network glitch', 'Encrypted municipal beacon authorization'],
      recommendedEligibility: { minTrl: 6, dpiitRequired: true, fairStartupRules: true }
    },
    energy_health: {
      suggestedTitle: 'Resilient Hybrid Solar-Storage Microgrid for Remote Primary Health Centres',
      sector: 'Renewable Energy & Public Health',
      baselineKpi: { metric: 'Daily Power Outage Duration', unit: 'Hours', value: 9, description: '9 hours daily grid blackout causing cold-chain vaccine spoilage risk' },
      targetKpi: { metric: 'Clean Power Continuous Uptime', unit: '%', value: 99.5, targetOperator: '>=', description: 'Maintain >= 99.5% continuous power uptime 24x7 under harsh climate conditions' },
      estimatedBudget: 1500000,
      durationWeeks: 10,
      problemStatementStructured: `Frequent grid failures and severe weather in ${departmentName || 'Health Department'} cause 9 hours of daily power loss in remote PHCs, threatening vaccine refrigeration and diagnostic telemedicine devices.`,
      outcomeRequirement: 'Deploy a modular, cold-temperature resistant lithium solar microgrid delivering >= 99.5% clean power uptime with real-time remote cloud telemetry.',
      constraints: ['Operational in extreme temperatures (-15°C to 45°C)', 'LiFePO4 battery management with automated grid/diesel bypass', 'Remote telemetry with local data logging'],
      recommendedEligibility: { minTrl: 6, dpiitRequired: true, fairStartupRules: true }
    },
    general: {
      suggestedTitle: `Outcome-Based Innovation Sandbox Challenge for ${departmentName || 'Government Department'}`,
      sector: sector || 'Public Service Innovation & Governance',
      baselineKpi: { metric: 'Operational Inefficiency / Service Delay', unit: '%', value: 50, description: '50% baseline delay in current manual workflow' },
      targetKpi: { metric: 'Operational Inefficiency / Service Delay', unit: '%', value: 20, targetOperator: '<=', description: 'Reduce workflow friction / error rate to <= 20%' },
      estimatedBudget: 1000000,
      durationWeeks: 12,
      problemStatementStructured: `The department requires an innovative startup solution to address: "${text || 'Department operational bottleneck'}" by shifting from manual execution to automated, measurable technology outcomes.`,
      outcomeRequirement: `Deploy an innovative startup solution under a controlled sandbox pilot to reduce operational bottlenecks by at least 60% compared to existing baseline metrics.`,
      constraints: ['Transparent open APIs', 'Data privacy compliance', 'Documented sandbox evaluation deliverables'],
      recommendedEligibility: { minTrl: 5, dpiitRequired: true, fairStartupRules: true }
    }
  };

  const advice = coachTemplates[domain] || coachTemplates.general;

  return {
    isAiGenerated: true,
    isDemoFallback: !Boolean(process.env.LLM_API_KEY && process.env.LLM_API_KEY !== 'your_key_here'),
    modeNote: Boolean(process.env.LLM_API_KEY && process.env.LLM_API_KEY !== 'your_key_here')
      ? 'Generated using Live LLM API'
      : 'AI Problem Coach (Heuristic Innovation Engine - Demo Mode)',
    coachAdvice: advice,
    questionsToRefine: [
      'What is the exact numerical baseline currently measured (e.g. % delay, hours lost, cost per unit)?',
      'What minimum target KPI represents a successful pilot for department procurement?',
      'What specific geographic zone, municipal ward, or facility will serve as the pilot sandbox?',
      'What are the mandatory data security, privacy, or API integration constraints?'
    ]
  };
}

/**
 * POST /api/challenges/coach
 * AI Problem Coach for Department Officers
 */
router.post('/coach', handleCoachRequest);

/**
 * GET /api/challenges
 * List all open department challenges
 */
router.get(['/', '/feed', '/list'], (req, res) => {
  try {
    const { sector, status, department, search } = req.query;
    const db = getDB();
    let list = db.challenges || [];

    if (sector && sector !== 'All') {
      list = list.filter(c => c.sector === sector);
    }
    if (status && status !== 'All') {
      list = list.filter(c => c.status === status);
    }
    if (department && department !== 'All') {
      list = list.filter(c => (c.departmentName || '').toLowerCase().includes(department.toLowerCase()));
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.problemStatement.toLowerCase().includes(q) ||
        (c.outcomeRequirement && c.outcomeRequirement.toLowerCase().includes(q)) ||
        c.sector.toLowerCase().includes(q)
      );
    }

    const enriched = list.map(c => {
      const apps = (db.applications || []).filter(a => a.challengeId === c.id);
      const pilot = (db.pilots || []).find(p => p.challengeId === c.id);
      return {
        ...c,
        applicationsCount: apps.length,
        hasPilot: Boolean(pilot),
        pilotId: pilot ? pilot.id : null
      };
    });

    res.json({ count: enriched.length, challenges: enriched });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/challenges
 * Create new outcome-based challenge (Department Officer)
 */
router.post('/', (req, res) => {
  try {
    const {
      title,
      departmentName,
      postedBy,
      officerId,
      locationState,
      locationDistrict,
      sector,
      budgetAmount,
      durationWeeks,
      applicationDeadline,
      problemStatement,
      outcomeRequirement,
      baselineKpi,
      targetKpi,
      eligibilityRules,
      supportingDocuments
    } = req.body;

    if (!title || !problemStatement || !outcomeRequirement) {
      return res.status(400).json({ error: 'Title, problem statement, and measurable outcome requirement are required.' });
    }

    const db = getDB();
    if (!db.challenges) db.challenges = [];
    if (!db.auditLogs) db.auditLogs = [];

    const newChallenge = {
      id: generateId(),
      title: title.trim(),
      departmentName: departmentName || 'Department of Urban Infrastructure',
      postedBy: postedBy || 'Department Officer',
      officerId: officerId || 'usr-govt-1',
      locationState: locationState || 'Maharashtra',
      locationDistrict: locationDistrict || 'Pune',
      sector: sector || 'Smart Cities & CleanTech',
      status: 'open', // 'open' | 'evaluating' | 'pilot_active' | 'pilot_validated' | 'procured' | 'scaled'
      budgetAmount: Number(budgetAmount) || 1000000,
      durationWeeks: Number(durationWeeks) || 12,
      applicationDeadline: applicationDeadline || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      problemStatement: problemStatement.trim(),
      outcomeRequirement: outcomeRequirement.trim(),
      baselineKpi: baselineKpi || {
        metric: 'Baseline Delay / Inefficiency',
        unit: '%',
        value: 40,
        description: 'Current measured baseline prior to innovation intervention'
      },
      targetKpi: targetKpi || {
        metric: 'Target Delay / Inefficiency',
        unit: '%',
        value: 20,
        targetOperator: '<=',
        description: 'Target outcome required for pilot success'
      },
      eligibilityRules: eligibilityRules || {
        dpiitRequired: true,
        minTrl: 5,
        noPriorTurnoverRestriction: true, // Fair startup rule
        noYearsOfExperienceBar: true,
        requiredCapabilities: ['Demonstrated Technology Prototype', 'Startup Team Capability']
      },
      supportingDocuments: supportingDocuments || [],
      aiCoachEnhanced: true,
      createdAt: new Date().toISOString()
    };

    db.challenges.unshift(newChallenge);

    db.auditLogs.unshift({
      id: generateId(),
      timestamp: new Date().toISOString(),
      action: 'CHALLENGE_CREATED',
      actor: `${postedBy || 'Officer'} (${departmentName || 'Govt'})`,
      details: `Created outcome-based challenge: ${title.trim()}`
    });

    saveDB();
    res.json({ message: 'Outcome-based challenge published successfully!', challenge: newChallenge });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Explainable Startup Matching Engine (Deterministic Heuristic Demo Engine)
 * Recommends startups for an outcome challenge or challenges for a startup.
 */
function evaluateMatch(challenge, startup) {
  // 1. Sector Alignment (Max 35 pts)
  let sectorScore = 10;
  let sectorReason = '';
  const cSector = (challenge.sector || challenge.category || '').toLowerCase();
  const sSector = (startup.sector || '').toLowerCase();

  const sectorKeywords = {
    waste: ['waste', 'garbage', 'cleantech', 'sanitation', 'logistics', 'smart cities'],
    water: ['water', 'leak', 'pipeline', 'infrastructure', 'acoustics'],
    traffic: ['traffic', 'mobility', 'transport', 'ambulance', 'corridor', 'public safety', 'smart cities'],
    energy: ['energy', 'solar', 'power', 'microgrid', 'health', 'renewable']
  };

  let matchedCluster = null;
  for (const [cluster, words] of Object.entries(sectorKeywords)) {
    const cMatches = words.some(w => cSector.includes(w) || (challenge.title || '').toLowerCase().includes(w));
    const sMatches = words.some(w => sSector.includes(w) || (startup.solutionName || '').toLowerCase().includes(w));
    if (cMatches && sMatches) {
      matchedCluster = cluster;
      break;
    }
  }

  if (cSector && sSector && (cSector.includes(sSector) || sSector.includes(cSector))) {
    sectorScore = 35;
    sectorReason = `[+35 pts] Exact Domain Match: Both aligned in ${startup.sector || challenge.sector}`;
  } else if (matchedCluster) {
    sectorScore = 32;
    sectorReason = `[+32 pts] Domain Synergy: Overlapping target domain (${matchedCluster.toUpperCase()}) across municipal infrastructure`;
  } else if (cSector.includes('smart cities') || sSector.includes('smart cities')) {
    sectorScore = 24;
    sectorReason = `[+24 pts] Smart Cities Cross-Domain: Applicable urban innovation category`;
  } else {
    sectorScore = 10;
    sectorReason = `[+10 pts] General Sector: Operating in ${startup.sector || 'Emerging Tech'}`;
  }

  // 2. Technology Readiness Level (TRL) Fit (Max 30 pts)
  const minTrl = Number(challenge.eligibilityRules?.minTrl || challenge.targetTRL) || 5;
  const startupTrl = Number(startup.trlLevel) || 6;
  let trlScore = 10;
  let trlReason = '';

  if (startupTrl >= minTrl) {
    trlScore = 30;
    trlReason = `[+30 pts] TRL Maturity Exceeded: Startup operates at TRL ${startupTrl} (meets or exceeds challenge requirement of TRL ${minTrl}+)`;
  } else if (startupTrl === minTrl - 1) {
    trlScore = 20;
    trlReason = `[+20 pts] Near-TRL Readiness: Startup at TRL ${startupTrl} is suitable for staged sandbox piloting`;
  } else {
    trlScore = 10;
    trlReason = `[+10 pts] Early-TRL Stage: TRL ${startupTrl} requires prototype stabilization`;
  }

  // 3. Solution Fit & Capability Overlap (Max 35 pts)
  const challengeCorpus = `${challenge.title || ''} ${challenge.problemStatement || ''} ${challenge.outcomeRequirement || ''} ${(challenge.eligibilityRules?.requiredCapabilities || []).join(' ')}`.toLowerCase();
  const startupCorpus = `${startup.solutionName || ''} ${startup.solutionSummary || ''} ${(startup.keyCapabilities || []).join(' ')}`.toLowerCase();

  const domainTerms = [
    'route', 'routing', 'gps', 'waste', 'bin', 'lorawan', 'sensor', 'telemetry', 'delay',
    'water', 'leak', 'acoustic', 'pipe', 'pipeline', 'vibration', 'nrw',
    'traffic', 'ambulance', 'signal', 'camera', 'vision', 'edge-ai', 'corridor',
    'solar', 'microgrid', 'battery', 'energy', 'remote', 'telemedicine', 'clinic', 'power',
    'fleet', 'dispatch', 'gis', 'api', 'iot'
  ];

  const matchedTerms = domainTerms.filter(t => challengeCorpus.includes(t) && startupCorpus.includes(t));
  let solutionScore = 12;
  let solutionReason = '';

  if (matchedTerms.length >= 3) {
    solutionScore = 35;
    solutionReason = `[+35 pts] High Capability Overlap: Direct match across key tech tags (${matchedTerms.slice(0, 4).join(', ')})`;
  } else if (matchedTerms.length >= 1) {
    solutionScore = 24;
    solutionReason = `[+24 pts] Partial Capability Overlap: Matching features identified in ${matchedTerms.join(', ')}`;
  } else {
    solutionScore = 12;
    solutionReason = `[+12 pts] Exploratory Solution: Technology prototype requires integration adapters`;
  }

  const totalScore = sectorScore + trlScore + solutionScore;
  const matchGrade = totalScore >= 80 ? 'High Fit' : totalScore >= 60 ? 'Moderate Fit' : 'Low Fit';

  return {
    startupId: startup.id,
    startupName: startup.name,
    founderName: startup.founderName,
    dpiitNumber: startup.dpiitNumber,
    sector: startup.sector,
    solutionName: startup.solutionName,
    solutionSummary: startup.solutionSummary,
    trlLevel: startup.trlLevel,
    keyCapabilities: startup.keyCapabilities || [],
    totalScore,
    matchGrade,
    scoreBreakdown: {
      sectorScore,
      trlScore,
      solutionScore
    },
    reasons: [sectorReason, trlReason, solutionReason],
    disclaimer: 'Calculated using explainable deterministic matching based on sector alignment, TRL level, and capability tags (Demo Mode Heuristic).'
  };
}

/**
 * 8-Stage Procurement Lifecycle Journey
 * Synchronized with existing challenge, applications, pilot, and milestone records.
 */
function computeChallengeJourney(challenge, applications = [], pilot = null, milestones = [], validationReports = [], procurementDecision = null) {
  const effectiveDecision = procurementDecision || pilot?.procurementDecision;
  const hasAchievedMilestone = milestones.some(m => m.status === 'ready_for_release' || m.status === 'released' || m.validatorReview?.decision === 'Achieved');
  const hasReleasedPayment = milestones.some(m => m.status === 'released');
  const hasValidationAction = validationReports.length > 0 || milestones.some(m => m.validatorReview || m.status === 'evidence_submitted');
  const hasPilot = Boolean(pilot);
  const isWinnerSelected = Boolean(challenge.selectedStartupId || applications.some(a => a.status === 'selected'));
  const hasApplications = applications.length > 0;

  // Determine current active stage index (1-based, 1 to 8)
  let currentStageIndex = 1;
  if (effectiveDecision?.isRecorded || challenge.status === 'procured' || challenge.status === 'scaled') {
    currentStageIndex = 8;
  } else if (hasReleasedPayment || hasAchievedMilestone) {
    currentStageIndex = 7;
  } else if (hasValidationAction) {
    currentStageIndex = 6;
  } else if (hasPilot) {
    currentStageIndex = 5;
  } else if (isWinnerSelected) {
    currentStageIndex = 4;
  } else if (hasApplications || challenge.status === 'evaluating') {
    currentStageIndex = 3;
  } else if (challenge.status === 'open') {
    currentStageIndex = 2;
  } else {
    currentStageIndex = 1;
  }

  const stages = [
    {
      step: 1,
      id: 'draft',
      label: 'Draft',
      title: 'Outcome Challenge Formulation',
      description: 'Department Officer drafts the challenge with quantifiable baseline and target KPIs using the AI Problem Coach.',
      role: 'Department Officer',
      isCompleted: currentStageIndex > 1,
      isCurrent: currentStageIndex === 1
    },
    {
      step: 2,
      id: 'open',
      label: 'Open for applications',
      title: 'Public Portal Notice & Screening',
      description: 'Outcome challenge published on portal with relaxed eligibility (no 3-year turnover lock, self-certification).',
      role: 'Startup',
      isCompleted: currentStageIndex > 2,
      isCurrent: currentStageIndex === 2
    },
    {
      step: 3,
      id: 'evaluating',
      label: 'Evaluation',
      title: 'Expert Panel Technical Scoring',
      description: 'Independent experts evaluate proposals across Innovation, Feasibility, Security, and Cost (100 pts rubric).',
      role: 'Expert Panel',
      isCompleted: currentStageIndex > 3,
      isCurrent: currentStageIndex === 3
    },
    {
      step: 4,
      id: 'selected',
      label: 'Startup selected',
      title: 'Officer Selection & SBoT Agreement',
      description: 'Department Officer selects winning startup and configures staged pilot milestone payments (strictly 100% total).',
      role: 'Department Officer',
      isCompleted: currentStageIndex > 4,
      isCurrent: currentStageIndex === 4
    },
    {
      step: 5,
      id: 'pilot_active',
      label: 'Pilot active',
      title: 'Sandbox Field Execution',
      description: 'Startup deploys hardware/software prototype in the municipal testbed and streams telemetry evidence.',
      role: 'Startup',
      isCompleted: currentStageIndex > 5,
      isCurrent: currentStageIndex === 5
    },
    {
      step: 6,
      id: 'validation',
      label: 'Validation',
      title: 'Independent 3rd-Party Verification',
      description: 'Empaneled testing lab independently verifies telemetry and issues Achieved / Partial / Not achieved verdict.',
      role: 'Independent Validator',
      isCompleted: currentStageIndex > 6,
      isCurrent: currentStageIndex === 6
    },
    {
      step: 7,
      id: 'payment_ready',
      label: 'Payment ready/released',
      title: 'Milestone Tranche Release',
      description: 'Achieved validation status unlocks payment release button for the Department Officer to disburse tranche.',
      role: 'Department Officer',
      isCompleted: currentStageIndex > 7,
      isCurrent: currentStageIndex === 7
    },
    {
      step: 8,
      id: 'scale_decision',
      label: 'Scale-up decision',
      title: 'Public Procurement & Scale-Up',
      description: 'Upon successful pilot KPI achievement, Department Officer records scale-up order under GFR Rule 194 / GeM.',
      role: 'Department Officer',
      isCompleted: effectiveDecision?.isRecorded || challenge.status === 'procured',
      isCurrent: currentStageIndex === 8
    }
  ];

  const currentStage = stages.find(s => s.step === currentStageIndex) || stages[0];

  const nextActions = {
    1: 'Publish outcome challenge to invite innovation proposals.',
    2: 'Eligible DPIIT startups submit proposals and self-certify TRL readiness.',
    3: 'Expert Review Panel evaluates proposals against the 100-point rubric.',
    4: 'Department Officer finalizes Model SBoT agreement and initiates sandbox pilot.',
    5: 'Startup conducts field deployment and submits milestone telemetry evidence.',
    6: 'Independent testing lab audits field data and issues verification verdict.',
    7: 'Department Officer authorizes tranche payment release for verified milestone.',
    8: 'Procurement Scale Committee authorizes multi-district scale under GFR Rule 194.'
  };

  return {
    currentStageIndex,
    currentStageId: currentStage.id,
    currentStageLabel: currentStage.label,
    currentStageTitle: currentStage.title,
    responsibleRole: currentStage.role,
    nextAction: nextActions[currentStageIndex] || 'Proceed to next procurement lifecycle phase.',
    isFinished: Boolean(effectiveDecision?.isRecorded || challenge.status === 'procured'),
    stages
  };
}

/**
 * GET /api/challenges/:id
 * Challenge detail with applications, evaluations, pilot data, and journey state
 */
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const db = getDB();

    const challenge = (db.challenges || []).find(c => c.id === id);
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    const applications = (db.applications || []).filter(a => a.challengeId === id);
    const evaluations = (db.evaluations || []).filter(e => e.challengeId === id);
    const pilot = (db.pilots || []).find(p => p.challengeId === id);
    const milestones = pilot ? (db.milestones || []).filter(m => m.pilotId === pilot.id) : [];
    const validationReports = pilot ? (db.validationReports || []).filter(v => v.pilotId === pilot.id) : [];
    const journey = computeChallengeJourney(challenge, applications, pilot, milestones, validationReports, pilot?.procurementDecision);

    res.json({
      challenge,
      applications,
      evaluations,
      pilot: pilot || null,
      milestones,
      validationReports,
      journey
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Helper: compute active challenges count for a startup
 * Max ceiling: 2 active challenges per startup.
 * Completed or rejected challenges do not count.
 */
function getStartupActiveChallenges(startupId, db) {
  const challenges = db.challenges || [];
  const applications = db.applications || [];
  const pilots = db.pilots || [];

  const activeChallengeIds = new Set();

  applications.forEach(app => {
    const isPrimary = app.startupId === startupId;
    const isPartner = app.partnerStartupId === startupId;

    if (isPrimary || isPartner) {
      const chal = challenges.find(c => c.id === app.challengeId);
      if (app.status === 'rejected') return;
      if (chal && (chal.status === 'completed' || chal.status === 'scaled')) return;

      if (['submitted', 'under_evaluation', 'shortlisted', 'selected', 'pilot_active', 'in_progress'].includes(app.status)) {
        activeChallengeIds.add(app.challengeId);
      }
    }
  });

  pilots.forEach(p => {
    if (p.startupId === startupId || p.partnerStartupId === startupId) {
      if (p.status !== 'completed' && p.status !== 'scaled') {
        activeChallengeIds.add(p.challengeId);
      }
    }
  });

  return Array.from(activeChallengeIds).map(cId => {
    const c = challenges.find(ch => ch.id === cId);
    return {
      challengeId: cId,
      title: c?.title || 'Active Challenge',
      sector: c?.sector || 'Public Service Innovation',
      status: c?.status || 'active'
    };
  });
}

/**
 * POST /api/challenges/:id/apply
 * Startup applies with proposal & fair eligibility self-assessment
 * Enforces:
 * 1. 2-active-challenge limit (completed/rejected do not count)
 * 2. In-domain direct application vs Cross-domain collaboration requirement
 * 3. Verified accepted partner checks (prevent false claims)
 * 4. Special Expert Panel review flag for 2nd challenge and joint applications
 */
router.post('/:id/apply', (req, res) => {
  try {
    const { id } = req.params;
    const {
      startupId,
      startupName,
      founderName,
      proposalTitle,
      solutionTitle,
      proposalSummary,
      proposalText,
      technicalApproach,
      requestedBudget,
      requestedFunding,
      proposedWeeks,
      estimatedWeeks,
      eligibilityChecklist,
      selfCertifications,
      pitchDeckUrl,
      partnerStartupId,
      partnerStartupName,
      applicantRole,
      partnerRole
    } = req.body;

    const db = getDB();
    const challenge = (db.challenges || []).find(c => c.id === id);
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    const title = (proposalTitle || solutionTitle || req.body.title || '').trim();
    const summary = (proposalSummary || proposalText || req.body.summary || '').trim();
    const approach = (technicalApproach || proposalText || req.body.approach || summary || '').trim();

    if (!title || !summary) {
      return res.status(400).json({ error: 'Proposal title and summary/technical approach are required.' });
    }

    const sId = startupId || 'start-1';
    const startup = (db.startups || []).find(s => s.id === sId || s.userId === sId);

    // Rule 1: Enforce 2-active-challenge limit for applicant startup
    const applicantActive = getStartupActiveChallenges(sId, db);
    if (applicantActive.length >= 2) {
      return res.status(400).json({
        error: 'Active challenge limit reached (2/2). Complete or withdraw from an existing challenge before taking on a new one.',
        activeCount: applicantActive.length,
        activeChallenges: applicantActive
      });
    }

    // Rule 2: Domain matching & Cross-domain collaboration
    const startupDomains = Array.isArray(startup?.domains) && startup.domains.length > 0
      ? startup.domains
      : [startup?.sector].filter(Boolean);

    const chalSector = challenge.sector || '';
    const chalTitle = challenge.title || '';

    const isInDomain = startupDomains.some(d => 
      chalSector.toLowerCase().includes(d.toLowerCase()) || 
      d.toLowerCase().includes(chalSector.toLowerCase()) ||
      chalTitle.toLowerCase().includes(d.toLowerCase())
    );

    let isJointApplication = false;
    let verifiedPartner = null;

    if (!isInDomain) {
      // Cross-domain collaboration is MANDATORY
      if (!partnerStartupId) {
        return res.status(400).json({
          error: `Cross-domain collaboration required: This challenge is in "${chalSector}", which does not match your registered domain (${startupDomains.join(', ')}). To apply, you must invite and receive acceptance from at least one startup whose registered domain matches this challenge.`,
          requiresCollaboration: true
        });
      }

      // Verify that this partner has accepted a collaboration with the applicant
      const acceptedCollab = (db.collaborations || []).find(c =>
        c.status === 'accepted' &&
        ((c.fromStartupId === sId && c.toStartupId === partnerStartupId) ||
         (c.fromStartupId === partnerStartupId && c.toStartupId === sId)) &&
        (c.challengeId === id || !c.challengeId)
      );

      if (!acceptedCollab) {
        return res.status(400).json({
          error: `Unverified or false partner claim: No accepted collaboration was found with the specified partner startup. You must first send a collaboration invite and receive their acceptance before submitting a joint proposal.`
        });
      }

      // Check partner registered domain matches challenge
      verifiedPartner = (db.startups || []).find(s => s.id === partnerStartupId);
      if (!verifiedPartner) {
        return res.status(404).json({ error: 'Partner startup not found.' });
      }

      const partnerDomains = Array.isArray(verifiedPartner.domains) && verifiedPartner.domains.length > 0
        ? verifiedPartner.domains
        : [verifiedPartner.sector].filter(Boolean);

      const partnerMatchesDomain = partnerDomains.some(d =>
        chalSector.toLowerCase().includes(d.toLowerCase()) ||
        d.toLowerCase().includes(chalSector.toLowerCase()) ||
        chalTitle.toLowerCase().includes(d.toLowerCase())
      );

      if (!partnerMatchesDomain) {
        return res.status(400).json({
          error: `Partner domain mismatch: Partner startup ${verifiedPartner.name} (${partnerDomains.join(', ')}) does not have a registered domain matching "${chalSector}".`
        });
      }

      // Enforce 2-challenge limit on partner startup as well
      const partnerActive = getStartupActiveChallenges(verifiedPartner.id, db);
      if (partnerActive.length >= 2) {
        return res.status(400).json({
          error: `Partner startup ${verifiedPartner.name} has already reached the maximum 2 active challenges limit (${partnerActive.length}/2) and cannot take on a new challenge.`
        });
      }

      isJointApplication = true;
    }

    // Rule 3: Special Expert Panel review required if:
    // - Joint cross-domain collaboration application, OR
    // - Startup already has 1 active challenge (this is their 2nd active challenge application)
    const isSecondChallenge = applicantActive.length === 1;
    const requiresExpertApproval = isJointApplication || isSecondChallenge;

    const newApp = {
      id: generateId(),
      challengeId: id,
      startupId: sId,
      startupName: startupName || startup?.name || 'Innovating Startup',
      founderName: founderName || startup?.founderName || 'Startup Founder',
      proposalTitle: title,
      proposalSummary: summary,
      technicalApproach: approach || summary,
      requestedBudget: Number(requestedBudget || requestedFunding) || challenge.budgetAmount || 1000000,
      proposedWeeks: Number(proposedWeeks || estimatedWeeks) || challenge.durationWeeks || 12,
      isJointApplication,
      partnerStartupId: isJointApplication ? partnerStartupId : null,
      partnerStartupName: isJointApplication ? (partnerStartupName || verifiedPartner?.name) : null,
      applicantRole: applicantRole || `${startup?.name || 'Lead Startup'} Core Solution Lead`,
      partnerRole: partnerRole || (isJointApplication ? `${verifiedPartner?.name} Domain Specialist Lead` : null),
      requiresExpertApproval,
      expertApprovalStatus: requiresExpertApproval ? 'pending' : 'approved',
      specialReviewReason: isJointApplication && isSecondChallenge
        ? 'Joint cross-domain application & 2nd active challenge review'
        : isJointApplication
        ? 'Joint cross-domain collaboration application review'
        : isSecondChallenge
        ? 'Second active challenge (2/2) capacity review'
        : null,
      eligibilityChecklist: eligibilityChecklist || {
        isDpiitRecognized: true,
        dpiitCertNumber: startup?.dpiitNumber || 'DIPP-VERIFIED',
        hasRequiredTrl: true,
        trlLevel: startup?.trlLevel || 6,
        hasTeamCapacity: true,
        relevantSolutionFit: true,
        agreesToSandboxTerms: true
      },
      status: 'submitted',
      pitchDeckUrl: pitchDeckUrl || 'https://demo.sih.gov.in/pitch-deck.pdf',
      expertScoreAvg: null,
      createdAt: new Date().toISOString()
    };

    if (!db.applications) db.applications = [];
    db.applications.push(newApp);

    if (challenge.status === 'open') {
      challenge.status = 'evaluating';
    }

    if (!db.auditLogs) db.auditLogs = [];
    db.auditLogs.unshift({
      id: generateId(),
      timestamp: new Date().toISOString(),
      action: isJointApplication ? 'JOINT_APPLICATION_SUBMITTED' : 'APPLICATION_SUBMITTED',
      actor: `${newApp.startupName}${isJointApplication ? ` & ${newApp.partnerStartupName}` : ''} (Applicant)`,
      details: `Submitted ${isJointApplication ? 'joint cross-domain ' : ''}proposal for challenge: ${challenge.title}${requiresExpertApproval ? ' (Pending Special Expert Panel Review)' : ''}`
    });

    saveDB();
    res.json({
      message: 'Application & proposal submitted successfully!',
      application: newApp,
      requiresExpertApproval
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/challenges/:id/applications/:appId/expert-approval
 * Expert Panel reviews and decides on additional (2nd) challenge or joint collaboration
 * Actions: 'approved' | 'changes_requested' | 'rejected'
 */
router.post('/:id/applications/:appId/expert-approval', (req, res) => {
  try {
    const { id, appId } = req.params;
    const { expertId, expertName, decision, comments, rubricReview } = req.body;
    const db = getDB();

    const app = (db.applications || []).find(a => a.id === appId && a.challengeId === id);
    if (!app) {
      return res.status(404).json({ error: 'Application not found for this challenge' });
    }

    if (!['approved', 'changes_requested', 'rejected'].includes(decision)) {
      return res.status(400).json({ error: 'Decision must be "approved", "changes_requested", or "rejected".' });
    }

    app.expertApprovalStatus = decision;
    app.expertApprovalRecord = {
      expertId: expertId || 'usr-expert-1',
      expertName: expertName || 'Dr. K. R. Ramanujan',
      decision,
      comments: comments || 'Proposal meets technical maturity, workforce capacity, and compliance requirements.',
      rubricReview: rubricReview || {
        domainFit: 'Satisfactory',
        workforceReadiness: 'Verified',
        pastAchievements: 'Credible',
        limitCompliance: 'Verified within 2-challenge ceiling'
      },
      reviewedAt: new Date().toISOString()
    };

    if (!db.auditLogs) db.auditLogs = [];
    db.auditLogs.unshift({
      id: generateId(),
      timestamp: new Date().toISOString(),
      action: 'EXPERT_SPECIAL_APPROVAL_' + decision.toUpperCase(),
      actor: `${expertName || 'Expert Panel'} (Reviewer)`,
      details: `Expert Panel decision "${decision}" recorded for ${app.startupName} proposal.`
    });

    saveDB();
    res.json({
      message: `Expert review decision "${decision}" recorded successfully!`,
      application: app
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/challenges/:id/evaluate
 * Expert Evaluator scores an application across 4 criteria
 */
router.post('/:id/evaluate', (req, res) => {
  try {
    const { id } = req.params;
    const {
      applicationId,
      startupName,
      expertId,
      expertName,
      criteriaScores,
      recommendation,
      generalComments
    } = req.body;

    if (!applicationId || !criteriaScores) {
      return res.status(400).json({ error: 'Application ID and criteria scores are required.' });
    }

    const db = getDB();
    const challenge = (db.challenges || []).find(c => c.id === id);
    if (!challenge) return res.status(404).json({ error: 'Challenge not found' });

    const app = (db.applications || []).find(a => a.id === applicationId);
    if (!app) return res.status(404).json({ error: 'Application not found' });

    // Calculate total score (/100) from criteria
    const inno = Number(criteriaScores.innovation?.score) || 0;
    const feas = Number(criteriaScores.feasibility?.score) || 0;
    const secu = Number(criteriaScores.security?.score) || 0;
    const cost = Number(criteriaScores.costViability?.score) || 0;
    const totalScore = inno + feas + secu + cost;

    const evaluationRecord = {
      id: generateId(),
      challengeId: id,
      applicationId,
      startupName: startupName || app.startupName,
      expertId: expertId || 'usr-expert-1',
      expertName: expertName || 'Dr. K. R. Ramanujan',
      criteriaScores: {
        innovation: { score: inno, max: 25, weight: 25, label: 'Innovation & Novelty', comment: criteriaScores.innovation?.comment || '' },
        feasibility: { score: feas, max: 25, weight: 25, label: 'Technical Feasibility & TRL', comment: criteriaScores.feasibility?.comment || '' },
        security: { score: secu, max: 25, weight: 25, label: 'Security & Compliance', comment: criteriaScores.security?.comment || '' },
        costViability: { score: cost, max: 25, weight: 25, label: 'Cost & Scalability', comment: criteriaScores.costViability?.comment || '' }
      },
      totalScore,
      maxTotal: 100,
      recommendation: recommendation || 'RECOMMEND_FOR_PILOT',
      advisoryNote: 'This expert score provides non-binding technical advisory input to support the Department Officer’s decision.',
      generalComments: generalComments || 'Proposal meets technical maturity criteria.',
      submittedAt: new Date().toISOString()
    };

    if (!db.evaluations) db.evaluations = [];
    db.evaluations.push(evaluationRecord);

    app.expertScoreAvg = totalScore;
    app.status = 'under_evaluation';

    if (!db.auditLogs) db.auditLogs = [];
    db.auditLogs.unshift({
      id: generateId(),
      timestamp: new Date().toISOString(),
      action: 'EXPERT_EVALUATION_RECORDED',
      actor: `${expertName || 'Expert Evaluator'} (Reviewer)`,
      details: `Evaluated ${app.startupName} with score ${totalScore}/100`
    });

    saveDB();
    res.json({ message: 'Expert evaluation score recorded successfully!', evaluation: evaluationRecord });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/challenges/:id/select-winner
 * Department Officer selects startup for pilot sandbox
 */
router.post('/:id/select-winner', (req, res) => {
  try {
    const { id } = req.params;
    const { 
      applicationId, 
      officerName, 
      selectionRationale, 
      milestones: customMilestones,
      agreementRef 
    } = req.body;

    const db = getDB();
    const challenge = (db.challenges || []).find(c => c.id === id);
    if (!challenge) return res.status(404).json({ error: 'Challenge not found' });

    const app = (db.applications || []).find(a => a.id === applicationId);
    if (!app) return res.status(404).json({ error: 'Application not found' });

    // Verify Expert Panel special approval if required
    if (app.requiresExpertApproval && app.expertApprovalStatus !== 'approved') {
      return res.status(400).json({
        error: `Officer Selection Blocked: Proposal for "${app.startupName}" requires prior Expert Panel approval for secondary challenge capacity or cross-domain collaboration. Current Expert Review status: "${app.expertApprovalStatus || 'pending'}".`,
        expertApprovalStatus: app.expertApprovalStatus || 'pending'
      });
    }

    // Validate custom milestones if provided: percentages MUST equal 100%
    if (Array.isArray(customMilestones) && customMilestones.length > 0) {
      const sum = customMilestones.reduce((acc, m) => acc + (Number(m.paymentPercentage || m.percentage) || 0), 0);
      if (sum !== 100) {
        return res.status(400).json({
          error: `Milestone payment percentages must add up to exactly 100%. Current sum: ${sum}%.`,
          currentTotal: sum
        });
      }
    }

    // Mark application as selected
    app.status = 'selected';
    challenge.status = 'pilot_active';
    challenge.selectedStartupId = app.startupId;
    challenge.selectedStartupName = app.startupName;

    // Reject other applications
    (db.applications || []).filter(a => a.challengeId === id && a.id !== applicationId).forEach(other => {
      if (other.status !== 'selected') other.status = 'rejected';
    });

    const bgt = challenge.budgetAmount || 1250000;

    // Create or update Pilot Record
    let pilot = (db.pilots || []).find(p => p.challengeId === id);
    if (!pilot) {
      const pilotId = generateId();
      pilot = {
        id: pilotId,
        challengeId: id,
        applicationId,
        startupId: app.startupId,
        startupName: app.startupName,
        agreementRef: agreementRef || `SBoT-${new Date().getFullYear()}-MH-${Math.floor(100 + Math.random() * 900)}`,
        departmentName: challenge.departmentName,
        officerId: challenge.officerId || 'usr-govt-1',
        officerName: officerName || challenge.postedBy || 'Dr. Sunita Verma',
        validatorId: 'usr-validator-1',
        validatorName: 'Quality & Standards Certification Bureau',
        startDate: new Date().toISOString().split('T')[0],
        targetEndDate: new Date(Date.now() + (challenge.durationWeeks || 12) * 7 * 86400000).toISOString().split('T')[0],
        totalGrantBudget: bgt,
        status: 'active',
        kpiTracking: {
          metric: challenge.baselineKpi?.metric || 'Average Collection Delay',
          unit: challenge.baselineKpi?.unit || '%',
          baselineValue: challenge.baselineKpi?.value || 40,
          targetValue: challenge.targetKpi?.value || 25,
          currentActualValue: challenge.baselineKpi?.value || 40,
          status: 'PILOT_STARTED',
          trendData: [
            { week: 'Baseline', value: challenge.baselineKpi?.value || 40, label: 'Pre-pilot Baseline' }
          ]
        },
        procurementDecision: null,
        createdAt: new Date().toISOString()
      };
      if (!db.pilots) db.pilots = [];
      db.pilots.push(pilot);
      challenge.pilotId = pilotId;

      // Create milestones: use custom if provided, otherwise default 30%/40%/30%
      if (!db.milestones) db.milestones = [];
      // Remove any pre-existing milestones for this pilot ID
      db.milestones = db.milestones.filter(m => m.pilotId !== pilotId);

      if (Array.isArray(customMilestones) && customMilestones.length > 0) {
        customMilestones.forEach((m, idx) => {
          const pct = Number(m.paymentPercentage || m.percentage) || 30;
          db.milestones.push({
            id: generateId(),
            pilotId,
            title: m.title || m.name || `Milestone ${idx + 1}`,
            description: m.description || `Deliverable for phase ${idx + 1}`,
            targetDate: m.targetDate || new Date(Date.now() + (Number(m.targetWeeks) || (idx + 1) * 4) * 7 * 86400000).toISOString().split('T')[0],
            paymentPercentage: pct,
            paymentAmount: Math.round(bgt * (pct / 100)),
            status: idx === 0 ? 'in_progress' : 'pending',
            evidenceSubmission: null,
            validatorReview: null
          });
        });
      } else {
        db.milestones.push(
          {
            id: generateId(),
            pilotId,
            title: 'Milestone 1: IoT Hardware & Sensor Telemetry Deployment',
            description: 'Deploy field sensors/tablets, verify LoRaWAN/cloud data telemetry pipeline.',
            targetDate: new Date(Date.now() + 21 * 86400000).toISOString().split('T')[0],
            paymentPercentage: 30,
            paymentAmount: Math.round(bgt * 0.30),
            status: 'in_progress',
            evidenceSubmission: null,
            validatorReview: null
          },
          {
            id: generateId(),
            pilotId,
            title: 'Milestone 2: Dynamic System Pilot & KPI Outcome Demonstration',
            description: 'Run operational sandbox pilot, demonstrate measurable reduction in target KPI.',
            targetDate: new Date(Date.now() + 56 * 86400000).toISOString().split('T')[0],
            paymentPercentage: 40,
            paymentAmount: Math.round(bgt * 0.40),
            status: 'pending',
            evidenceSubmission: null,
            validatorReview: null
          },
          {
            id: generateId(),
            pilotId,
            title: 'Milestone 3: Final Security Audit, System Handover & Scale-up Documentation',
            description: 'Deliver API documentation, vulnerability report, and GeM procurement onboarding package.',
            targetDate: new Date(Date.now() + 84 * 86400000).toISOString().split('T')[0],
            paymentPercentage: 30,
            paymentAmount: Math.round(bgt * 0.30),
            status: 'pending',
            evidenceSubmission: null,
            validatorReview: null
          }
        );
      }
    }

    if (!db.auditLogs) db.auditLogs = [];
    db.auditLogs.unshift({
      id: generateId(),
      timestamp: new Date().toISOString(),
      action: 'PILOT_INITIATED',
      actor: `${officerName || 'Officer'} (Department)`,
      details: `Selected ${app.startupName} for pilot sandbox on ${challenge.title}. Rationale: ${selectionRationale || 'Highest technical merit and feasibility'}`
    });

    saveDB();
    const createdMilestones = (db.milestones || []).filter(m => m.pilotId === pilot.id);
    res.json({ 
      message: `Startup ${app.startupName} selected for pilot sandbox!`, 
      pilot, 
      challenge,
      milestones: createdMilestones 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/challenges/:id/recommendations
 * Explainable Startup Matching recommendations for a challenge
 */
router.get('/:id/recommendations', (req, res) => {
  try {
    const { id } = req.params;
    const db = getDB();
    const challenge = (db.challenges || []).find(c => c.id === id);
    if (!challenge) return res.status(404).json({ error: 'Challenge not found' });

    const startups = db.startups || [];
    const recommendations = startups.map(s => evaluateMatch(challenge, s))
      .sort((a, b) => b.totalScore - a.totalScore);

    res.json({
      challengeId: id,
      challengeTitle: challenge.title,
      recommendations,
      count: recommendations.length,
      heuristicMode: true
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/challenges/:id/journey
 * Explicit journey status endpoint
 */
router.get('/:id/journey', (req, res) => {
  try {
    const { id } = req.params;
    const db = getDB();
    const challenge = (db.challenges || []).find(c => c.id === id);
    if (!challenge) return res.status(404).json({ error: 'Challenge not found' });

    const applications = (db.applications || []).filter(a => a.challengeId === id);
    const pilot = (db.pilots || []).find(p => p.challengeId === id);
    const milestones = pilot ? (db.milestones || []).filter(m => m.pilotId === pilot.id) : [];
    const validationReports = pilot ? (db.validationReports || []).filter(v => v.pilotId === pilot.id) : [];
    const journey = computeChallengeJourney(challenge, applications, pilot, milestones, validationReports, pilot?.procurementDecision);

    res.json({
      challengeId: id,
      challengeTitle: challenge.title,
      journey
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
module.exports.evaluateMatch = evaluateMatch;
module.exports.computeChallengeJourney = computeChallengeJourney;

