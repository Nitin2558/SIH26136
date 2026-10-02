const express = require('express');
const router = express.Router();
const { getDB, saveDB, generateId } = require('../db/store');
const { computeChallengeJourney } = require('./problems');
const { extractUserFromRequest } = require('../middleware/authGuard');

const CANONICAL_PROJECT_MAP = {
  P1: { pilotId: 'pilot-1', challengeId: 'chal-1' },
  P2: { pilotId: 'pilot-2', challengeId: 'chal-2' },
  P3: { pilotId: 'pilot-3', challengeId: 'chal-3' },
  P4: { pilotId: 'pilot-4', challengeId: 'chal-4' },
  P5: { pilotId: null, challengeId: 'chal-5' },
  P6: { pilotId: 'pilot-6', challengeId: 'chal-6' }
};

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
 * GET /api/workspace/details
 * Get pilot sandbox workspace context by pilotId, challengeId, or startupId
 */
router.get('/details', (req, res) => {
  try {
    const { teamId, pilotId, problemId, challengeId, startupId } = req.query;
    const db = getDB();

    let targetId = pilotId || teamId || challengeId || problemId || startupId || 'pilot-1';

    // Map canonical project id (P1..P6)
    if (CANONICAL_PROJECT_MAP[targetId]) {
      if (CANONICAL_PROJECT_MAP[targetId].pilotId) {
        targetId = CANONICAL_PROJECT_MAP[targetId].pilotId;
      } else {
        // Pre-pilot challenge review (e.g. P5 / chal-5)
        const chalId = CANONICAL_PROJECT_MAP[targetId].challengeId;
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

    if (targetId === 'chal-5') {
      const challenge = (db.challenges || []).find(c => c.id === targetId);
      const applications = (db.applications || []).filter(a => a.challengeId === targetId);
      const evaluations = (db.evaluations || []).filter(e => e.challengeId === targetId);
      return res.json({
        hasPilot: false,
        status: 'evaluating',
        challenge,
        applications,
        evaluations,
        message: 'Startup selection in progress under expert panel evaluation. Pilot sandbox not yet initiated.'
      });
    }

    let pilot = (db.pilots || []).find(p => p.id === targetId || p.challengeId === targetId || p.startupId === targetId);
    if (!pilot && (db.pilots || []).length > 0 && !targetId.startsWith('chal-') && !targetId.startsWith('P')) {
      pilot = db.pilots[0];
    }

    if (!pilot) {
      return res.status(404).json({ error: 'Pilot sandbox workspace not found.' });
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
      paymentAmount: m.paymentAmount !== undefined ? m.paymentAmount : m.resourceAmount,
      evidenceNotes: m.evidenceNotes || m.evidenceSubmission?.description || '',
      evidenceUrl: m.evidenceUrl || m.evidenceSubmission?.demoDashboardUrl || (m.evidenceSubmission?.documents?.[0]) || '',
      metricAchieved: m.metricAchieved || (m.evidenceSubmission?.currentAchievedKpi ? `${m.evidenceSubmission.currentAchievedKpi}%` : '')
    }));

    const journey = computeChallengeJourney(challenge, [application].filter(Boolean), pilot, milestones, validationReports, pilot.procurementDecision);

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
      journey,
      participants,
      lastUpdated: pilot.updatedAt || new Date().toISOString(),
      nextAction,
      // Backward compatibility aliases
      team: {
        id: pilot.id,
        name: pilot.startupName,
        problemId: pilot.challengeId,
        status: pilot.status
      },
      problem: challenge
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;


