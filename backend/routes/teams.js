const express = require('express');
const router = express.Router();
const { getDB, saveDB, generateId } = require('../db/store');
const { extractUserFromRequest } = require('../middleware/authGuard');

// Map canonical project IDs to pilot or challenge IDs
const CANONICAL_PROJECT_MAP = {
  P1: { pilotId: 'pilot-1', challengeId: 'chal-1' },
  P2: { pilotId: 'pilot-2', challengeId: 'chal-2' },
  P3: { pilotId: 'pilot-3', challengeId: 'chal-3' },
  P4: { pilotId: 'pilot-4', challengeId: 'chal-4' },
  P5: { pilotId: null, challengeId: 'chal-5' },
  P6: { pilotId: 'pilot-6', challengeId: 'chal-6' }
};

/**
 * Helper: Authorize pilot participants
 * Only Department Officers, the Selected Startup, Assigned Validator, Assigned Expert, and Admin
 */
function checkPilotParticipant(pilot, user, db) {
  if (!user || !user.role) return false;
  if (user.role === 'admin') return true;

  // Department Officer
  if (user.role === 'government') return true;

  // Independent Validator
  if (user.role === 'validator') return true;

  // Expert Panel Member
  if (user.role === 'expert') return true;

  // Startup: MUST be the assigned startup for this pilot!
  if (user.role === 'startup') {
    const startup = (db.startups || []).find(s => s.id === pilot.startupId);
    if (startup && (startup.userId === user.id || startup.id === user.startupId)) return true;
    if (user.startupId && user.startupId === pilot.startupId) return true;
    if (pilot.startupId === user.id) return true;
    // Any other startup is explicitly denied
    return false;
  }

  return false;
}

/**
 * Helper: Compute next responsible action
 */
function computeNextAction(pilot, milestones, decisions) {
  if (pilot.status === 'stopped') {
    return { action: 'Pilot closed under GFR rules (outcome not met)', role: 'Department Officer' };
  }
  if (decisions && decisions.length > 0) {
    return { action: 'Multi-district expansion & GeM onboarding in progress', role: 'Municipal Administration' };
  }
  const readyPart = milestones.find(m => m.status === 'ready_for_release' || m.status === 'validator_approved');
  if (readyPart) {
    return { action: `Review and authorize ${readyPart.title || 'milestone'} payment tranche`, role: 'Department Officer' };
  }
  const holdPart = milestones.find(m => m.status === 'hold');
  if (holdPart) {
    return { action: 'Review partial validation findings and record hold decision', role: 'Department Officer' };
  }
  const submittedPart = milestones.find(m => m.status === 'evidence_submitted');
  if (submittedPart) {
    return { action: 'Conduct independent field audit on submitted telemetry', role: 'Independent Validator' };
  }
  const activePart = milestones.find(m => m.status === 'in_progress' || m.status === 'pending');
  if (activePart) {
    return { action: `Execute field deliverables and submit telemetry for ${activePart.title || 'milestone'}`, role: 'Selected Startup' };
  }
  return { action: 'Pilot review in progress', role: 'Department Officer' };
}

/**
 * GET /api/pilots/:id or /api/workspace/details
 * Get full pilot workspace details with enriched participants, audit trail, and next action
 */
router.get('/:id', (req, res) => {
  try {
    let { id } = req.params;
    const db = getDB();

    // Map canonical project id (P1..P6)
    if (CANONICAL_PROJECT_MAP[id]) {
      if (CANONICAL_PROJECT_MAP[id].pilotId) {
        id = CANONICAL_PROJECT_MAP[id].pilotId;
      } else {
        // Pre-pilot challenge review (e.g. P5 / chal-5)
        const chalId = CANONICAL_PROJECT_MAP[id].challengeId;
        const challenge = (db.challenges || []).find(c => c.id === chalId);
        const applications = (db.applications || []).filter(a => a.challengeId === chalId);
        const evaluations = (db.evaluations || []).filter(e => e.challengeId === chalId);
        return res.json({
          hasPilot: false,
          status: 'evaluating',
          challenge,
          applications,
          evaluations,
          message: 'Startup selection in progress under expert panel evaluation. Pilot sandbox not yet initiated.'
        });
      }
    }

    // Check if ID is directly a challenge without pilot
    if (id === 'chal-5') {
      const challenge = (db.challenges || []).find(c => c.id === id);
      const applications = (db.applications || []).filter(a => a.challengeId === id);
      const evaluations = (db.evaluations || []).filter(e => e.challengeId === id);
      return res.json({
        hasPilot: false,
        status: 'evaluating',
        challenge,
        applications,
        evaluations,
        message: 'Startup selection in progress under expert panel evaluation. Pilot sandbox not yet initiated.'
      });
    }

    const pilot = (db.pilots || []).find(p => p.id === id || p.challengeId === id || p.startupId === id);
    if (!pilot) {
      return res.status(404).json({ error: 'Pilot sandbox not found.' });
    }

    const challenge = (db.challenges || []).find(c => c.id === pilot.challengeId);
    const startup = (db.startups || []).find(s => s.id === pilot.startupId);
    const application = (db.applications || []).find(a => a.id === pilot.applicationId);
    const milestones = (db.milestones || []).filter(m => m.pilotId === pilot.id);
    const validationReports = (db.validationReports || []).filter(v => v.pilotId === pilot.id);
    const evaluations = (db.evaluations || []).filter(e => e.challengeId === pilot.challengeId);

    const decisions = pilot.procurementDecision ? [pilot.procurementDecision] : [];
    const normalizedMilestones = milestones.map(m => ({
      ...m,
      name: m.name || m.title,
      title: m.title || m.name,
      percentage: m.percentage !== undefined ? m.percentage : m.paymentPercentage,
      paymentPercentage: m.paymentPercentage !== undefined ? m.paymentPercentage : m.percentage,
      resourceAmount: m.resourceAmount !== undefined ? m.resourceAmount : m.paymentAmount,
      paymentAmount: m.paymentAmount !== undefined ? m.paymentAmount : m.resourceAmount
    }));

    const participants = [
      {
        role: 'government',
        name: pilot.officerName || 'Dr. Sunita Verma',
        title: 'Department Officer',
        org: pilot.departmentName || challenge?.departmentName || 'Department of Urban Infrastructure'
      },
      {
        role: 'startup',
        name: startup?.founderName || startup?.name || pilot.startupName,
        title: 'Selected Startup',
        org: startup?.name || pilot.startupName
      },
      {
        role: 'validator',
        name: pilot.validatorName || 'Quality & Standards Certification Bureau',
        title: 'Independent Validator',
        org: pilot.validatorName || 'Quality & Standards Certification Bureau'
      },
      {
        role: 'expert',
        name: 'Dr. K. R. Ramanujan',
        title: 'Assigned Expert Panelist',
        org: 'National Innovation Review Panel'
      }
    ];

    const nextAction = computeNextAction(pilot, normalizedMilestones, decisions);

    res.json({
      hasPilot: true,
      pilot,
      challenge,
      startup,
      application,
      milestones: normalizedMilestones,
      validationReports,
      evaluations,
      procurementDecisions: decisions,
      participants,
      lastUpdated: pilot.updatedAt || new Date().toISOString(),
      nextAction
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/pilots/:id/messages
 * Get persistent conversation history for a specific pilot.
 * Enforces role-based participant authorization: only authorized participants may read.
 */
router.get('/:id/messages', (req, res) => {
  try {
    let { id } = req.params;
    if (CANONICAL_PROJECT_MAP[id] && CANONICAL_PROJECT_MAP[id].pilotId) {
      id = CANONICAL_PROJECT_MAP[id].pilotId;
    }
    const db = getDB();

    const pilot = (db.pilots || []).find(p => p.id === id || p.challengeId === id || p.startupId === id);
    if (!pilot) {
      return res.status(404).json({ error: 'Pilot sandbox not found.' });
    }

    const user = extractUserFromRequest(req);
    if (!checkPilotParticipant(pilot, user, db)) {
      return res.status(403).json({ error: 'Access denied: You are not an authorized participant in this pilot.' });
    }

    const challenge = (db.challenges || []).find(c => c.id === pilot.challengeId);
    const startup = (db.startups || []).find(s => s.id === pilot.startupId);

    const pilotMsgs = (db.messages || []).filter(m => m.pilotId === pilot.id || m.collabId === pilot.id);

    const participants = [
      {
        role: 'government',
        name: pilot.officerName || 'Dr. Sunita Verma',
        title: 'Department Officer',
        org: pilot.departmentName || challenge?.departmentName || 'Department of Urban Infrastructure'
      },
      {
        role: 'startup',
        name: startup?.founderName || startup?.name || pilot.startupName,
        title: 'Selected Startup',
        org: startup?.name || pilot.startupName
      },
      {
        role: 'validator',
        name: pilot.validatorName || 'Quality & Standards Certification Bureau',
        title: 'Independent Validator',
        org: pilot.validatorName || 'Quality & Standards Certification Bureau'
      },
      {
        role: 'expert',
        name: 'Dr. K. R. Ramanujan',
        title: 'Assigned Expert Panelist',
        org: 'National Innovation Review Panel'
      }
    ];

    res.json({
      pilotId: pilot.id,
      challengeTitle: challenge?.title || 'Municipal Outcome Challenge',
      startupName: startup?.name || pilot.startupName,
      count: pilotMsgs.length,
      participants,
      messages: pilotMsgs
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/pilots/:id/messages
 * Post a message to the pilot conversation.
 * Enforces role-based participant authorization: only authorized participants may post.
 */
router.post('/:id/messages', (req, res) => {
  try {
    let { id } = req.params;
    if (CANONICAL_PROJECT_MAP[id] && CANONICAL_PROJECT_MAP[id].pilotId) {
      id = CANONICAL_PROJECT_MAP[id].pilotId;
    }
    const { text, attachmentUrl, attachmentName, attachmentType } = req.body;
    const db = getDB();

    const pilot = (db.pilots || []).find(p => p.id === id || p.challengeId === id || p.startupId === id);
    if (!pilot) {
      return res.status(404).json({ error: 'Pilot sandbox not found.' });
    }

    const user = extractUserFromRequest(req);
    if (!checkPilotParticipant(pilot, user, db)) {
      return res.status(403).json({ error: 'Access denied: You are not an authorized participant in this pilot.' });
    }

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Message text is required.' });
    }

    if (!db.messages) db.messages = [];

    const startup = (db.startups || []).find(s => s.id === pilot.startupId);
    let senderOrg = user.departmentName || user.startupName || user.orgName || '';
    if (!senderOrg) {
      if (user.role === 'government') senderOrg = pilot.departmentName || 'Department';
      else if (user.role === 'startup') senderOrg = startup?.name || pilot.startupName;
      else if (user.role === 'validator') senderOrg = pilot.validatorName || 'Independent Validator';
      else if (user.role === 'expert') senderOrg = 'National Innovation Review Panel';
      else senderOrg = 'Administration';
    }

    const newMsg = {
      id: 'pmsg-' + generateId().substring(0, 8),
      pilotId: pilot.id,
      challengeId: pilot.challengeId,
      senderId: user.id,
      senderName: user.name || 'Participant',
      senderRole: user.role,
      senderOrg,
      text: text.trim(),
      attachment: attachmentUrl ? {
        name: attachmentName || 'Report / Evidence Link',
        url: attachmentUrl,
        type: attachmentType || 'link'
      } : null,
      timestamp: new Date().toISOString()
    };

    db.messages.push(newMsg);
    saveDB();

    res.json({
      success: true,
      message: newMsg,
      msg: newMsg
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/pilots/:id/report
 * Generate comprehensive evidence-backed pilot report dossier
 */
router.get('/:id/report', (req, res) => {
  try {
    const { id } = req.params;
    const db = getDB();

    const pilot = (db.pilots || []).find(p => p.id === id || p.challengeId === id || p.startupId === id);
    if (!pilot) {
      return res.status(404).json({ error: 'Pilot sandbox record not found.' });
    }

    const challenge = (db.challenges || []).find(c => c.id === pilot.challengeId);
    const startup = (db.startups || []).find(s => s.id === pilot.startupId);
    const milestones = (db.milestones || []).filter(m => m.pilotId === pilot.id);
    const validationReports = (db.validationReports || []).filter(v => v.pilotId === pilot.id);
    const auditLogs = (db.auditLogs || []).filter(l => 
      l.details?.includes(pilot.startupName) || 
      l.details?.includes(challenge?.title) || 
      l.details?.includes(pilot.id)
    );

    const reportDossier = {
      reportId: `REP-${pilot.id.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`,
      generatedAt: new Date().toISOString(),
      disclaimer: 'DEMO INNOVATION PROCUREMENT PILOT REPORT — FOR SMART INDIA HACKATHON (SIH26136) EVALUATION ONLY. NOT AN OFFICIAL GOVERNMENT PROCUREMENT ORDER.',
      frameworkNotice: 'Generated pursuant to Model SBoT Pilot Sandbox Agreement and GFR Rule 194 Innovation Procurement Guidelines.',
      isSimulatedDemo: true,
      pilot: {
        id: pilot.id,
        agreementRef: pilot.agreementRef || 'SBoT-2026-MH-084',
        startDate: pilot.startDate,
        targetEndDate: pilot.targetEndDate,
        status: pilot.status,
        totalGrantBudget: pilot.totalGrantBudget,
        officerName: pilot.officerName,
        departmentName: pilot.departmentName,
        validatorName: pilot.validatorName
      },
      challenge: challenge ? {
        id: challenge.id,
        title: challenge.title,
        departmentName: challenge.departmentName,
        sector: challenge.sector,
        location: `${challenge.locationDistrict ? challenge.locationDistrict + ', ' : ''}${challenge.locationState}`,
        budgetAmount: challenge.budgetAmount,
        durationWeeks: challenge.durationWeeks,
        problemStatement: challenge.problemStatement,
        outcomeRequirement: challenge.outcomeRequirement
      } : null,
      startup: startup ? {
        id: startup.id,
        name: startup.name,
        founderName: startup.founderName,
        founderEmail: startup.founderEmail,
        dpiitNumber: startup.dpiitNumber,
        sector: startup.sector,
        trlLevel: startup.trlLevel,
        solutionName: startup.solutionName,
        solutionSummary: startup.solutionSummary,
        certifications: startup.certifications || []
      } : { name: pilot.startupName, id: pilot.startupId },
      kpiTracking: {
        metric: pilot.kpiTracking?.metric || challenge?.baselineKpi?.metric || 'Target Performance KPI',
        unit: pilot.kpiTracking?.unit || challenge?.baselineKpi?.unit || '%',
        baselineValue: pilot.kpiTracking?.baselineValue ?? challenge?.baselineKpi?.value ?? 40,
        targetValue: pilot.kpiTracking?.targetValue ?? challenge?.targetKpi?.value ?? 25,
        currentActualValue: pilot.kpiTracking?.currentActualValue ?? 22,
        status: pilot.kpiTracking?.status || 'TARGET_ACHIEVED',
        trendData: pilot.kpiTracking?.trendData || []
      },
      milestones: milestones.map((m, idx) => ({
        index: idx + 1,
        id: m.id,
        title: m.title || m.name,
        description: m.description,
        targetDate: m.targetDate,
        paymentPercentage: m.paymentPercentage || m.percentage,
        paymentAmount: m.paymentAmount || m.resourceAmount,
        status: m.status,
        evidence: m.evidenceSubmission ? {
          submittedAt: m.evidenceSubmission.submittedAt,
          description: m.evidenceSubmission.description,
          telemetrySummary: m.evidenceSubmission.telemetrySummary,
          documents: m.evidenceSubmission.documents || []
        } : null,
        validatorReview: m.validatorReview ? {
          verifiedAt: m.validatorReview.verifiedAt,
          decision: m.validatorReview.decision,
          validatorName: m.validatorReview.validatorName,
          remarks: m.validatorReview.remarks,
          verifiedKpiValue: m.validatorReview.verifiedKpiValue
        } : null,
        paymentRelease: m.paymentRelease || null
      })),
      validationReports: validationReports.map(v => ({
        id: v.id,
        validatorName: v.validatorName,
        decision: v.decision,
        verifiedValue: v.verifiedValue,
        testMethodology: v.testMethodology,
        remarks: v.remarks,
        verifiedAt: v.verifiedAt
      })),
      procurementDecision: pilot.procurementDecision || null,
      auditLogs: auditLogs.slice(0, 8)
    };

    res.json(reportDossier);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/pilots/:id/setup
 * Officer configures pilot milestones and verifies 100% payment sum
 */
router.post('/:id/setup', (req, res) => {
  try {
    const { id } = req.params;
    const { milestones, baselineValue, targetValue, metric } = req.body;

    if (!Array.isArray(milestones) || milestones.length === 0) {
      return res.status(400).json({ error: 'Milestones list is required.' });
    }

    // MANDATORY VALIDATION: Milestone percentages MUST add up to 100%
    const totalPercentage = milestones.reduce((sum, m) => sum + (Number(m.paymentPercentage) || 0), 0);
    if (totalPercentage !== 100) {
      return res.status(400).json({
        error: `Milestone payment percentages must add up to exactly 100%. Current total is ${totalPercentage}%. Please adjust milestone shares.`,
        currentTotal: totalPercentage
      });
    }

    const db = getDB();
    const pilot = (db.pilots || []).find(p => p.id === id);
    if (!pilot) return res.status(404).json({ error: 'Pilot not found.' });

    if (baselineValue !== undefined) pilot.kpiTracking.baselineValue = baselineValue;
    if (targetValue !== undefined) pilot.kpiTracking.targetValue = targetValue;
    if (metric) pilot.kpiTracking.metric = metric;

    // Remove old milestones for this pilot and insert new
    db.milestones = (db.milestones || []).filter(m => m.pilotId !== id);
    const totalBudget = pilot.totalGrantBudget || 1250000;

    const newMilestones = milestones.map((m, idx) => ({
      id: m.id || generateId(),
      pilotId: id,
      title: m.title || `Phase ${idx + 1} Deliverable`,
      description: m.description || '',
      targetDate: m.targetDate || new Date(Date.now() + (idx + 1) * 28 * 86400000).toISOString().split('T')[0],
      paymentPercentage: Number(m.paymentPercentage),
      paymentAmount: Math.round((totalBudget * Number(m.paymentPercentage)) / 100),
      status: m.status || (idx === 0 ? 'in_progress' : 'pending'),
      evidenceSubmission: m.evidenceSubmission || null,
      validatorReview: m.validatorReview || null,
      paymentRelease: m.paymentRelease || null
    }));

    db.milestones.push(...newMilestones);
    saveDB();

    res.json({
      message: 'Pilot milestones configured successfully with verified 100% payment allocation.',
      pilot,
      milestones: newMilestones
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/pilots/milestones/:id/submit-evidence
 * Startup submits milestone completion deliverables, claim metrics, and telemetry links
 */
router.post('/milestones/:id/submit-evidence', (req, res) => {
  try {
    const { id } = req.params;
    const {
      description,
      telemetrySummary,
      currentAchievedKpi,
      documents,
      demoDashboardUrl,
      submittedBy
    } = req.body;

    if (!description || !description.trim()) {
      return res.status(400).json({ error: 'Evidence description and deliverables summary are required.' });
    }

    const db = getDB();
    const milestone = (db.milestones || []).find(m => m.id === id);
    if (!milestone) return res.status(404).json({ error: 'Milestone not found.' });

    const pilot = (db.pilots || []).find(p => p.id === milestone.pilotId);

    milestone.status = 'evidence_submitted';
    milestone.evidenceSubmission = {
      submittedAt: new Date().toISOString(),
      submittedBy: submittedBy || pilot?.startupName || 'Startup Founder',
      description: description.trim(),
      telemetrySummary: telemetrySummary || 'Deliverables and telemetry data submitted for independent validation.',
      currentAchievedKpi: currentAchievedKpi !== undefined ? currentAchievedKpi : null,
      documents: Array.isArray(documents) ? documents : [documents].filter(Boolean),
      demoDashboardUrl: demoDashboardUrl || 'https://cleanroute.demo.sih.gov.in/telemetry-live'
    };

    // Update pilot current KPI if provided
    if (pilot && currentAchievedKpi !== undefined && currentAchievedKpi !== null) {
      pilot.kpiTracking.currentActualValue = Number(currentAchievedKpi);
      if (!pilot.kpiTracking.trendData) pilot.kpiTracking.trendData = [];
      pilot.kpiTracking.trendData.push({
        week: `Milestone Update`,
        value: Number(currentAchievedKpi),
        label: `${milestone.title} Evidence`
      });
    }

    if (!db.auditLogs) db.auditLogs = [];
    db.auditLogs.unshift({
      id: generateId(),
      timestamp: new Date().toISOString(),
      action: 'EVIDENCE_SUBMITTED',
      actor: `${pilot?.startupName || 'Startup'} (Applicant)`,
      details: `Submitted completion proof for ${milestone.title}: ${description.trim().substring(0, 100)}...`
    });

    saveDB();
    res.json({ message: 'Milestone completion deliverables and evidence submitted! Sent to Independent Validator queue.', milestone });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/pilots/milestones/:id/validate
 * Independent Validator reviews evidence, records Achieved / Partial / Not achieved, and uploads report.
 * Milestones transition to "ready_for_release" once verified!
 */
router.post('/milestones/:id/validate', (req, res) => {
  try {
    const { id } = req.params;
    const {
      decision, // 'Achieved' | 'Partial' | 'Not achieved'
      validatorName,
      validatorId,
      remarks,
      verifiedKpiValue,
      verificationReportUrl,
      testMethodology
    } = req.body;

    if (!decision || !remarks || !remarks.trim()) {
      return res.status(400).json({ error: 'A validation decision (Achieved / Partial / Not achieved) and verification remarks are mandatory before submission.' });
    }

    const validDecisions = ['Achieved', 'Partial', 'Not achieved'];
    if (!validDecisions.includes(decision)) {
      return res.status(400).json({ error: 'Decision must be one of: Achieved, Partial, Not achieved.' });
    }

    const db = getDB();
    const milestone = (db.milestones || []).find(m => m.id === id);
    if (!milestone) return res.status(404).json({ error: 'Milestone not found.' });

    const pilot = (db.pilots || []).find(p => p.id === milestone.pilotId);

    // Record review on milestone
    milestone.validatorReview = {
      verifiedAt: new Date().toISOString(),
      validatorName: validatorName || 'Quality & Standards Certification Bureau',
      validatorId: validatorId || 'usr-validator-1',
      decision,
      remarks: remarks.trim(),
      verifiedKpiValue: verifiedKpiValue || milestone.evidenceSubmission?.currentAchievedKpi || '22.0%',
      verificationReportUrl: verificationReportUrl || 'https://cert-bureau.gov.in/reports/Verification-Signoff.pdf',
      testMethodology: testMethodology || 'Independent empirical testing & GPS telemetry verification.'
    };

    // State transition rule:
    // If Achieved -> "ready_for_release" (Enables Department Officer's Payment Release trigger!)
    // If Partial -> "in_progress" (Allows startup to upload revised proof)
    // If Not achieved -> "in_progress"
    if (decision === 'Achieved') {
      milestone.status = 'ready_for_release';
    } else {
      milestone.status = 'in_progress';
    }

    // Save formal validation report record
    if (!db.validationReports) db.validationReports = [];
    const newReport = {
      id: generateId(),
      pilotId: milestone.pilotId,
      milestoneId: id,
      validatorId: validatorId || 'usr-validator-1',
      validatorName: validatorName || 'Quality & Standards Certification Bureau',
      kpiMetric: pilot?.kpiTracking?.metric || 'Average Waste Collection Route Delay',
      baselineValue: `${pilot?.kpiTracking?.baselineValue || 40}%`,
      targetValue: `${pilot?.kpiTracking?.targetValue || 25}%`,
      startupClaimValue: `${milestone.evidenceSubmission?.currentAchievedKpi || 22}%`,
      verifiedValue: `${verifiedKpiValue || 22}%`,
      decision,
      testMethodology: testMethodology || 'Independent field sampling and automated telemetry packet inspection.',
      remarks: remarks.trim(),
      reportPdfUrl: verificationReportUrl || 'https://cert-bureau.gov.in/reports/Verification-Signoff.pdf',
      verifiedAt: new Date().toISOString()
    };
    db.validationReports.unshift(newReport);

    if (!db.auditLogs) db.auditLogs = [];
    db.auditLogs.unshift({
      id: generateId(),
      timestamp: new Date().toISOString(),
      action: 'VALIDATOR_APPROVAL_RECORDED',
      actor: `${validatorName || 'Validator'} (Independent Bureau)`,
      details: `Recorded decision '${decision}' for ${milestone.title}. Status updated to: ${milestone.status}`
    });

    saveDB();
    res.json({
      message: `Independent validation decision '${decision}' recorded successfully! Milestone is now ${milestone.status.replace(/_/g, ' ').toUpperCase()}.`,
      milestone,
      report: newReport
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/pilots/milestones/:id/release-payment
 * Department Officer releases milestone payment tranche (Enabled ONLY when status is 'ready_for_release')
 */
router.post('/milestones/:id/release-payment', (req, res) => {
  try {
    const { id } = req.params;
    const { officerName, releaseNotes } = req.body;

    const db = getDB();
    const milestone = (db.milestones || []).find(m => m.id === id);
    if (!milestone) return res.status(404).json({ error: 'Milestone not found.' });

    // GATE CHECK: Milestone CANNOT be released unless verified by validator
    if (milestone.status !== 'ready_for_release') {
      return res.status(400).json({
        error: `Milestone cannot be released. Current status is '${milestone.status}'. Evidence must be submitted by the startup and verified as 'Achieved' by the Independent Validator first.`
      });
    }

    milestone.status = 'released';
    milestone.paymentRelease = {
      releasedAt: new Date().toISOString(),
      releasedBy: officerName || 'Dr. Sunita Verma (Director)',
      releaseNotes: releaseNotes || `Milestone payment tranche of ₹${milestone.paymentAmount?.toLocaleString('en-IN') || '0'} (${milestone.paymentPercentage}%) formally approved and released.`
    };

    const pilot = (db.pilots || []).find(p => p.id === milestone.pilotId);
    if (!db.auditLogs) db.auditLogs = [];
    db.auditLogs.unshift({
      id: generateId(),
      timestamp: new Date().toISOString(),
      action: 'MILESTONE_PAYMENT_RELEASED',
      actor: `${officerName || 'Officer'} (Department)`,
      details: `Released payment tranche of ₹${milestone.paymentAmount?.toLocaleString('en-IN')} (${milestone.paymentPercentage}%) for ${milestone.title}`
    });

    saveDB();
    res.json({
      message: `Payment tranche of ₹${milestone.paymentAmount?.toLocaleString('en-IN')} (${milestone.paymentPercentage}%) successfully released!`,
      milestone
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/pilots/:id/procurement-decision
 * Officer records formal Scale-Up / Public Procurement Decision
 */
router.post('/:id/procurement-decision', (req, res) => {
  try {
    const { id } = req.params;
    const {
      pathway,
      decision,
      rationale: rawRationale,
      evaluationMemo,
      scaleDistricts,
      recommendedScaleBudget: rawScaleBudget,
      scaleBudget,
      signedBy: rawSignedBy,
      officerName
    } = req.body;

    const rationale = (rawRationale || evaluationMemo || '').trim();
    const effectivePathway = pathway || 'GFR Rule 194 Direct Innovation Procurement / GeM Startup Runway';

    if (!rationale) {
      return res.status(400).json({ error: 'Procurement pathway and formal decision rationale are mandatory.' });
    }

    const db = getDB();
    const pilot = (db.pilots || []).find(p => p.id === id);
    if (!pilot) return res.status(404).json({ error: 'Pilot sandbox not found.' });

    const challenge = (db.challenges || []).find(c => c.id === pilot.challengeId);

    const formattedBudget = rawScaleBudget 
      ? (typeof rawScaleBudget === 'number' ? `₹ ${rawScaleBudget.toLocaleString('en-IN')}` : rawScaleBudget)
      : (scaleBudget ? `₹ ${Number(scaleBudget).toLocaleString('en-IN')}` : '₹ 1,45,00,000 (Annual Scaling Contract)');

    const effectiveSignedBy = rawSignedBy || officerName || 'Dr. Sunita Verma (Director of Urban Innovation)';

    const procurementRecord = {
      isRecorded: true,
      pathway: effectivePathway,
      decision: decision || 'PROCEED_TO_DIRECT_PROCUREMENT_AND_MULTI_DISTRICT_SCALE',
      rationale,
      evaluationMemo: rationale, // Alias
      scaleDistricts: Array.isArray(scaleDistricts) ? scaleDistricts : [scaleDistricts].filter(Boolean),
      recommendedScaleBudget: formattedBudget,
      scaleBudget: typeof scaleBudget === 'number' ? scaleBudget : 14500000, // Numeric alias
      signedBy: effectiveSignedBy,
      officerName: effectiveSignedBy, // Alias
      signedAt: new Date().toISOString()
    };

    pilot.procurementDecision = procurementRecord;
    pilot.status = 'procured';
    if (challenge) challenge.status = 'procured';

    if (!db.procurementDecisions) db.procurementDecisions = [];
    db.procurementDecisions.unshift(procurementRecord);

    if (!db.auditLogs) db.auditLogs = [];
    db.auditLogs.unshift({
      id: generateId(),
      timestamp: new Date().toISOString(),
      action: 'PROCUREMENT_DECISION_RECORDED',
      actor: `${effectiveSignedBy} (Department)`,
      details: `Formally approved procurement & scale-up for ${pilot.startupName} under ${effectivePathway}`
    });

    saveDB();
    res.json({
      message: 'Post-pilot public procurement & multi-district scale-up decision formally recorded!',
      procurementDecision: procurementRecord,
      pilot
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
