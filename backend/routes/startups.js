const express = require('express');
const router = express.Router();
const { getDB, saveDB, generateId } = require('../db/store');
const { evaluateMatch } = require('./problems');

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

  // 1. Applications (primary applicant or accepted partner)
  applications.forEach(app => {
    const isPrimary = app.startupId === startupId;
    const isPartner = app.partnerStartupId === startupId;

    if (isPrimary || isPartner) {
      const chal = challenges.find(c => c.id === app.challengeId);
      // Completed, scaled or rejected challenges do NOT count
      if (app.status === 'rejected') return;
      if (chal && (chal.status === 'completed' || chal.status === 'scaled')) return;

      if (['submitted', 'under_evaluation', 'shortlisted', 'selected', 'pilot_active', 'in_progress'].includes(app.status)) {
        activeChallengeIds.add(app.challengeId);
      }
    }
  });

  // 2. Pilots
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
      status: c?.status || 'active',
      departmentName: c?.departmentName || 'Government Department',
      budgetAmount: c?.budgetAmount || 0,
      durationWeeks: c?.durationWeeks || 12,
      targetKpi: c?.targetKpi || null
    };
  });
}

/**
 * GET /api/startups
 * List registered DPIIT startups and innovation solutions
 */
router.get('/', (req, res) => {
  try {
    const { sector, trl, search } = req.query;
    const db = getDB();
    let list = db.startups || [];

    if (sector && sector !== 'All') {
      list = list.filter(s => {
        if (s.sector === sector) return true;
        if (Array.isArray(s.domains) && s.domains.includes(sector)) return true;
        return false;
      });
    }
    if (trl) {
      list = list.filter(s => s.trlLevel >= parseInt(trl, 10));
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        (s.solutionName && s.solutionName.toLowerCase().includes(q)) ||
        (s.solutionSummary && s.solutionSummary.toLowerCase().includes(q)) ||
        (s.sector && s.sector.toLowerCase().includes(q)) ||
        (Array.isArray(s.domains) && s.domains.some(d => d.toLowerCase().includes(q))) ||
        (s.dpiitNumber && s.dpiitNumber.toLowerCase().includes(q))
      );
    }

    const enhanced = list.map(s => {
      const activeChallenges = getStartupActiveChallenges(s.id, db);
      return {
        ...s,
        activeChallengesCount: activeChallenges.length,
        canTakeNewChallenge: activeChallenges.length < 2,
        domains: Array.isArray(s.domains) && s.domains.length > 0 ? s.domains : [s.sector].filter(Boolean)
      };
    });

    res.json({ count: enhanced.length, startups: enhanced });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/startups/:id/active-status
 * Check 2-challenge limit compliance for a startup
 */
router.get('/:id/active-status', (req, res) => {
  try {
    const { id } = req.params;
    const db = getDB();
    const startup = (db.startups || []).find(s => s.id === id || s.userId === id);
    if (!startup) {
      return res.status(404).json({ error: 'Startup profile not found.' });
    }

    const activeChallenges = getStartupActiveChallenges(startup.id, db);
    const activeCount = activeChallenges.length;
    const maxLimit = 2;
    const limitReached = activeCount >= maxLimit;

    res.json({
      startupId: startup.id,
      startupName: startup.name,
      activeCount,
      maxLimit,
      canApply: !limitReached,
      limitReached,
      message: limitReached 
        ? 'Active challenge limit reached (2/2). Complete or withdraw from an existing challenge before taking on a new one.' 
        : `Startup has ${activeCount}/${maxLimit} active challenges. Eligible to apply or accept collaborations.`,
      activeChallenges
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/startups/:id/matching-challenges
 * Recommend challenges for a startup profile using explainable matching
 */
router.get('/:id/matching-challenges', (req, res) => {
  try {
    const { id } = req.params;
    const db = getDB();
    const startup = (db.startups || []).find(s => s.id === id || s.userId === id);
    if (!startup) {
      return res.status(404).json({ error: 'Startup profile not found.' });
    }

    const activeChallenges = getStartupActiveChallenges(startup.id, db);
    const canApply = activeChallenges.length < 2;

    const startupDomains = Array.isArray(startup.domains) && startup.domains.length > 0
      ? startup.domains
      : [startup.sector].filter(Boolean);

    const challenges = db.challenges || [];
    const matches = challenges.map(c => {
      const evaluation = evaluateMatch(c, startup);
      // Domain matching check
      const isInDomain = startupDomains.some(d => 
        c.sector?.toLowerCase().includes(d.toLowerCase()) || 
        d.toLowerCase().includes(c.sector?.toLowerCase()) ||
        c.title?.toLowerCase().includes(d.toLowerCase())
      );

      return {
        challengeId: c.id,
        challengeTitle: c.title,
        departmentName: c.departmentName,
        sector: c.sector,
        status: c.status,
        budgetAmount: c.budgetAmount,
        durationWeeks: c.durationWeeks,
        targetKpi: c.targetKpi,
        totalScore: evaluation.totalScore,
        matchGrade: evaluation.matchGrade,
        scoreBreakdown: evaluation.scoreBreakdown,
        reasons: evaluation.reasons,
        disclaimer: evaluation.disclaimer,
        isInDomain,
        domainRequirement: isInDomain ? 'In-domain eligible' : 'Cross-domain collaboration required',
        canApplyNow: canApply
      };
    }).sort((a, b) => b.totalScore - a.totalScore);

    res.json({
      startupId: startup.id,
      startupName: startup.name,
      domains: startupDomains,
      activeChallengesCount: activeChallenges.length,
      limitReached: !canApply,
      matchingChallenges: matches,
      count: matches.length,
      heuristicMode: true
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/startups/:id/collaborations
 * Get collaboration invites & accepted partners for a startup
 */
router.get('/:id/collaborations', (req, res) => {
  try {
    const { id } = req.params;
    const db = getDB();
    const startup = (db.startups || []).find(s => s.id === id || s.userId === id);
    if (!startup) {
      return res.status(404).json({ error: 'Startup profile not found.' });
    }

    const sId = startup.id;
    const allCollabs = db.collaborations || [];

    const sent = allCollabs.filter(c => c.fromStartupId === sId);
    const received = allCollabs.filter(c => c.toStartupId === sId);
    const accepted = allCollabs.filter(c => 
      (c.fromStartupId === sId || c.toStartupId === sId) && c.status === 'accepted'
    );

    res.json({
      startupId: sId,
      totalCount: sent.length + received.length,
      sent,
      received,
      accepted,
      all: allCollabs.filter(c => c.fromStartupId === sId || c.toStartupId === sId)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/startups/collaborations/invite
 * Send a collaboration invitation to partner on a challenge
 */
router.post('/collaborations/invite', (req, res) => {
  try {
    const { fromStartupId, toStartupId, challengeId, proposedRole, notes } = req.body;
    const db = getDB();

    if (!fromStartupId || !toStartupId || !challengeId) {
      return res.status(400).json({ error: 'fromStartupId, toStartupId, and challengeId are required.' });
    }

    if (fromStartupId === toStartupId) {
      return res.status(400).json({ error: 'Cannot send a collaboration invite to your own startup.' });
    }

    const fromStartup = (db.startups || []).find(s => s.id === fromStartupId);
    const toStartup = (db.startups || []).find(s => s.id === toStartupId);
    const challenge = (db.challenges || []).find(c => c.id === challengeId);

    if (!fromStartup || !toStartup) {
      return res.status(404).json({ error: 'One or both startups not found in registered database.' });
    }
    if (!challenge) {
      return res.status(404).json({ error: 'Target challenge not found.' });
    }

    // Enforce 2-challenge limit on sender
    const senderActive = getStartupActiveChallenges(fromStartup.id, db);
    if (senderActive.length >= 2) {
      return res.status(400).json({
        error: 'Active challenge limit reached (2/2). Complete or withdraw from an existing challenge before taking on a new one.',
        currentActiveCount: senderActive.length
      });
    }

    // Enforce 2-challenge limit on recipient
    const recipientActive = getStartupActiveChallenges(toStartup.id, db);
    if (recipientActive.length >= 2) {
      return res.status(400).json({
        error: `${toStartup.name} has already reached the maximum 2 active challenges ceiling and cannot accept new invites at this time.`,
        recipientActiveCount: recipientActive.length
      });
    }

    if (!db.collaborations) db.collaborations = [];

    // Check duplicate pending invite
    const existing = db.collaborations.find(c => 
      c.challengeId === challengeId &&
      ((c.fromStartupId === fromStartupId && c.toStartupId === toStartupId) ||
       (c.fromStartupId === toStartupId && c.toStartupId === fromStartupId)) &&
      c.status === 'pending'
    );

    if (existing) {
      return res.status(400).json({ error: 'A pending collaboration request already exists between these two startups for this challenge.' });
    }

    const newCollab = {
      id: 'collab-' + generateId().substring(0, 8),
      fromStartupId: fromStartup.id,
      fromStartupName: fromStartup.name,
      toStartupId: toStartup.id,
      toStartupName: toStartup.name,
      challengeId: challenge.id,
      challengeTitle: challenge.title,
      challengeSector: challenge.sector,
      status: 'pending',
      proposedRole: proposedRole || `${fromStartup.name} joint solution partner`,
      notes: notes || 'Proposal for joint outcome-based sandbox pilot.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.collaborations.push(newCollab);

    // Also record thread message
    if (!db.messages) db.messages = [];
    db.messages.push({
      id: 'msg-' + generateId().substring(0, 8),
      collabId: newCollab.id,
      senderStartupId: fromStartup.id,
      senderStartupName: fromStartup.name,
      senderFounder: fromStartup.founderName || 'Founder',
      recipientStartupId: toStartup.id,
      recipientStartupName: toStartup.name,
      text: `[Collaboration Invitation] ${fromStartup.name} invited ${toStartup.name} to collaborate on challenge "${challenge.title}". Proposed role: ${newCollab.proposedRole}. Note: ${newCollab.notes}`,
      timestamp: new Date().toISOString()
    });

    if (!db.auditLogs) db.auditLogs = [];
    db.auditLogs.unshift({
      id: generateId(),
      timestamp: new Date().toISOString(),
      action: 'COLLABORATION_INVITE_SENT',
      actor: `${fromStartup.name} (Startup)`,
      details: `Invited ${toStartup.name} to collaborate on ${challenge.title}`
    });

    saveDB();
    res.json({ message: 'Collaboration invitation sent successfully!', collaboration: newCollab });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/startups/collaborations/:collabId/respond
 * Accept or decline a collaboration request
 */
router.post('/collaborations/:collabId/respond', (req, res) => {
  try {
    const { collabId } = req.params;
    const { startupId, action, responseNotes } = req.body; // action: 'accept' | 'decline'
    const db = getDB();

    const collab = (db.collaborations || []).find(c => c.id === collabId);
    if (!collab) {
      return res.status(404).json({ error: 'Collaboration request not found.' });
    }

    if (collab.toStartupId !== startupId && collab.fromStartupId !== startupId) {
      return res.status(403).json({ error: 'You are not authorized to respond to this collaboration request.' });
    }

    if (action === 'accept') {
      // Validate 2-challenge limit on both startups
      const senderActive = getStartupActiveChallenges(collab.fromStartupId, db);
      const recipientActive = getStartupActiveChallenges(collab.toStartupId, db);

      if (senderActive.length >= 2) {
        return res.status(400).json({
          error: `Cannot accept: ${collab.fromStartupName} has reached the 2 active challenge limit.`
        });
      }
      if (recipientActive.length >= 2) {
        return res.status(400).json({
          error: 'Active challenge limit reached (2/2). Complete or withdraw from an existing challenge before accepting new collaborations.'
        });
      }

      collab.status = 'accepted';
      collab.acceptedAt = new Date().toISOString();
      collab.responseNotes = responseNotes || 'Collaboration accepted by partner startup.';
    } else if (action === 'decline') {
      collab.status = 'declined';
      collab.declinedAt = new Date().toISOString();
      collab.responseNotes = responseNotes || 'Collaboration declined by partner startup.';
    } else {
      return res.status(400).json({ error: 'Invalid action. Must be "accept" or "decline".' });
    }

    collab.updatedAt = new Date().toISOString();

    // Add thread message
    if (!db.messages) db.messages = [];
    const respondingStartup = (db.startups || []).find(s => s.id === startupId);
    const partnerId = collab.fromStartupId === startupId ? collab.toStartupId : collab.fromStartupId;
    const partnerStartup = (db.startups || []).find(s => s.id === partnerId);

    db.messages.push({
      id: 'msg-' + generateId().substring(0, 8),
      collabId: collab.id,
      senderStartupId: startupId,
      senderStartupName: respondingStartup?.name || 'Partner Startup',
      senderFounder: respondingStartup?.founderName || 'Founder',
      recipientStartupId: partnerId,
      recipientStartupName: partnerStartup?.name || 'Startup',
      text: action === 'accept'
        ? `[Collaboration Accepted] We have accepted the collaboration request for "${collab.challengeTitle}". Let’s build the joint proposal.`
        : `[Collaboration Declined] We are currently at capacity and have declined the collaboration request for "${collab.challengeTitle}".`,
      timestamp: new Date().toISOString()
    });

    if (!db.auditLogs) db.auditLogs = [];
    db.auditLogs.unshift({
      id: generateId(),
      timestamp: new Date().toISOString(),
      action: action === 'accept' ? 'COLLABORATION_ACCEPTED' : 'COLLABORATION_DECLINED',
      actor: `${respondingStartup?.name || 'Startup'} (Partner)`,
      details: `${action === 'accept' ? 'Accepted' : 'Declined'} collaboration on ${collab.challengeTitle}`
    });

    saveDB();
    res.json({ message: `Collaboration successfully ${action}ed!`, collaboration: collab });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/startups/:id/messages
 * Get conversation threads and messages for startup
 */
router.get('/:id/messages', (req, res) => {
  try {
    const { id } = req.params;
    const db = getDB();
    const startup = (db.startups || []).find(s => s.id === id || s.userId === id);
    if (!startup) {
      return res.status(404).json({ error: 'Startup profile not found.' });
    }

    const sId = startup.id;
    const allMsgs = (db.messages || []).filter(m => 
      m.senderStartupId === sId || m.recipientStartupId === sId
    );

    // Group into conversations by partner
    const conversationsMap = {};
    allMsgs.forEach(m => {
      const partnerId = m.senderStartupId === sId ? m.recipientStartupId : m.senderStartupId;
      const partnerName = m.senderStartupId === sId ? m.recipientStartupName : m.senderStartupName;

      if (!conversationsMap[partnerId]) {
        const partnerStartup = (db.startups || []).find(s => s.id === partnerId);
        conversationsMap[partnerId] = {
          partnerId,
          partnerName: partnerStartup?.name || partnerName || 'Collaborating Startup',
          partnerFounder: partnerStartup?.founderName || 'Founder',
          partnerDomains: partnerStartup?.domains || [partnerStartup?.sector].filter(Boolean),
          partnerDpiit: partnerStartup?.dpiitNumber || '',
          partnerTrl: partnerStartup?.trlLevel || 6,
          lastMessage: m.text,
          lastTimestamp: m.timestamp,
          messages: []
        };
      }
      conversationsMap[partnerId].messages.push(m);
      if (new Date(m.timestamp) > new Date(conversationsMap[partnerId].lastTimestamp)) {
        conversationsMap[partnerId].lastMessage = m.text;
        conversationsMap[partnerId].lastTimestamp = m.timestamp;
      }
    });

    const conversations = Object.values(conversationsMap).sort((a, b) => 
      new Date(b.lastTimestamp) - new Date(a.lastTimestamp)
    );

    res.json({
      startupId: sId,
      count: allMsgs.length,
      conversations,
      messages: allMsgs
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/startups/messages
 * Send a message to another startup
 */
router.post('/messages', (req, res) => {
  try {
    const fromId = req.body.fromStartupId || req.body.senderStartupId;
    const toId = req.body.toStartupId || req.body.recipientStartupId;
    const text = req.body.text;
    const collabId = req.body.collabId;
    const db = getDB();

    if (!fromId || !toId || !text || !text.trim()) {
      return res.status(400).json({ error: 'Sender startup, recipient startup, and message text are required.' });
    }

    const fromStartup = (db.startups || []).find(s => s.id === fromId);
    const toStartup = (db.startups || []).find(s => s.id === toId);

    if (!fromStartup || !toStartup) {
      return res.status(404).json({ error: 'Sender or recipient startup not found.' });
    }

    if (!db.messages) db.messages = [];

    const newMsg = {
      id: 'msg-' + generateId().substring(0, 8),
      collabId: collabId || null,
      senderStartupId: fromStartup.id,
      senderStartupName: fromStartup.name,
      senderFounder: fromStartup.founderName || 'Founder',
      recipientStartupId: toStartup.id,
      recipientStartupName: toStartup.name,
      text: text.trim(),
      timestamp: new Date().toISOString()
    };

    db.messages.push(newMsg);
    saveDB();

    res.json({ message: 'Message sent successfully!', msg: newMsg, messageRecord: newMsg });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/startups/:id
 * Get single startup profile, active status, applications & pilots
 */
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const db = getDB();
    const startup = (db.startups || []).find(s => s.id === id || s.userId === id);
    if (!startup) {
      return res.status(404).json({ error: 'Startup profile not found.' });
    }

    const applications = (db.applications || []).filter(a => 
      a.startupId === startup.id || a.partnerStartupId === startup.id
    );
    const pilots = (db.pilots || []).filter(p => 
      p.startupId === startup.id || p.partnerStartupId === startup.id
    );
    const activeChallenges = getStartupActiveChallenges(startup.id, db);
    const collaborations = (db.collaborations || []).filter(c => 
      c.fromStartupId === startup.id || c.toStartupId === startup.id
    );

    const safeDomains = Array.isArray(startup.domains) && startup.domains.length > 0 
      ? startup.domains 
      : [startup.sector].filter(Boolean);

    res.json({
      startup: {
        ...startup,
        domains: safeDomains
      },
      activeChallenges,
      activeChallengesCount: activeChallenges.length,
      canTakeNewChallenge: activeChallenges.length < 2,
      limitReached: activeChallenges.length >= 2,
      applications,
      pilots,
      collaborations
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/startups/profile
 * Create or update startup profile
 */
router.post('/profile', (req, res) => {
  try {
    const {
      id,
      name,
      founderName,
      founderEmail,
      dpiitNumber,
      incorporationYear,
      teamSize,
      sector,
      domains,
      solutionName,
      description,
      solutionSummary,
      trlLevel,
      website,
      deckUrl,
      certifications,
      keyCapabilities,
      workforceSkills,
      achievements,
      pastProjects
    } = req.body;

    const db = getDB();
    if (!db.startups) db.startups = [];

    let startup = null;
    if (id) {
      startup = db.startups.find(s => s.id === id);
    }
    if (!startup && founderEmail) {
      startup = db.startups.find(s => s.founderEmail === founderEmail);
    }
    if (!startup && dpiitNumber) {
      startup = db.startups.find(s => s.dpiitNumber === dpiitNumber);
    }

    // Normalize domains
    let parsedDomains = domains;
    if (typeof domains === 'string') {
      parsedDomains = domains.split(',').map(d => d.trim()).filter(Boolean);
    }
    if (!Array.isArray(parsedDomains) || parsedDomains.length === 0) {
      parsedDomains = [sector || 'Smart Cities & CleanTech'];
    }

    // Normalize workforceSkills
    let parsedSkills = workforceSkills;
    if (typeof workforceSkills === 'string') {
      parsedSkills = workforceSkills.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (!Array.isArray(parsedSkills)) parsedSkills = ['Rapid Prototyping', 'IoT Telemetry'];

    // Normalize capabilities
    let parsedCapabilities = keyCapabilities;
    if (typeof keyCapabilities === 'string') {
      parsedCapabilities = keyCapabilities.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (!Array.isArray(parsedCapabilities)) parsedCapabilities = ['Telemetry', 'Edge AI'];

    // Normalize achievements
    let parsedAchievements = achievements;
    if (typeof achievements === 'string') {
      parsedAchievements = achievements.split('\n').map(a => a.trim()).filter(Boolean);
    }
    if (!Array.isArray(parsedAchievements)) parsedAchievements = [];

    // Normalize pastProjects
    let parsedPastProjects = pastProjects;
    if (typeof pastProjects === 'string') {
      parsedPastProjects = pastProjects.split('\n').map(p => p.trim()).filter(Boolean);
    }
    if (!Array.isArray(parsedPastProjects)) parsedPastProjects = [];

    if (startup) {
      if (name) startup.name = name;
      if (founderName) startup.founderName = founderName;
      if (dpiitNumber) startup.dpiitNumber = dpiitNumber;
      if (incorporationYear) startup.incorporationYear = Number(incorporationYear);
      if (teamSize !== undefined) startup.teamSize = Number(teamSize);
      if (sector) startup.sector = sector;
      if (parsedDomains.length > 0) startup.domains = parsedDomains;
      if (solutionName) startup.solutionName = solutionName;
      if (description) startup.description = description;
      if (solutionSummary) startup.solutionSummary = solutionSummary;
      if (trlLevel !== undefined) startup.trlLevel = Number(trlLevel);
      if (website !== undefined) startup.website = website;
      if (deckUrl !== undefined) startup.deckUrl = deckUrl;
      if (certifications) startup.certifications = certifications;
      if (parsedCapabilities) startup.keyCapabilities = parsedCapabilities;
      if (parsedSkills) startup.workforceSkills = parsedSkills;
      if (parsedAchievements.length > 0) startup.achievements = parsedAchievements;
      if (parsedPastProjects.length > 0) startup.pastProjects = parsedPastProjects;
      startup.updatedAt = new Date().toISOString();
    } else {
      startup = {
        id: generateId(),
        userId: 'usr-startup-' + Date.now().toString(36),
        name: name || 'Innovative Startup',
        founderName: founderName || 'Founder',
        founderEmail: founderEmail || 'founder@startup.io',
        dpiitNumber: dpiitNumber || 'DIPP-' + Math.floor(10000 + Math.random() * 90000),
        incorporationYear: Number(incorporationYear) || 2023,
        teamSize: Number(teamSize) || 8,
        sector: sector || parsedDomains[0] || 'Smart Cities & CleanTech',
        domains: parsedDomains,
        solutionName: solutionName || 'AI Municipal Optimization',
        description: description || solutionSummary || 'Scalable technology prototype for government public procurement.',
        solutionSummary: solutionSummary || description || 'Scalable technology prototype for government public procurement.',
        trlLevel: Number(trlLevel) || 7,
        website: website || '',
        deckUrl: deckUrl || '',
        verifiedDpiit: Boolean(dpiitNumber),
        certifications: certifications || ['DPIIT Startup India Certificate'],
        keyCapabilities: parsedCapabilities,
        workforceSkills: parsedSkills,
        achievements: parsedAchievements,
        pastProjects: parsedPastProjects,
        createdAt: new Date().toISOString()
      };
      db.startups.push(startup);
    }

    saveDB();
    res.json({ message: 'Startup profile saved successfully!', startup });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
module.exports.getStartupActiveChallenges = getStartupActiveChallenges;
