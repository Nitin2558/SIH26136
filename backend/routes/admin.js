const express = require('express');
const router = express.Router();
const { getDB, saveDB } = require('../db/store');

/**
 * GET /api/admin/users
 */
router.get('/users', (req, res) => {
  try {
    const db = getDB();
    const sanitized = (db.users || []).map(({ passwordHash, ...user }) => user);
    res.json({ users: sanitized });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/admin/stats
 * Platform statistics and public procurement conversion metrics
 */
router.get('/stats', (req, res) => {
  try {
    const db = getDB();
    const totalChallenges = (db.challenges || []).length;
    const openChallenges = (db.challenges || []).filter(c => c.status === 'open').length;
    const evaluatingChallenges = (db.challenges || []).filter(c => c.status === 'evaluating').length;
    const activePilots = (db.pilots || []).filter(p => p.status === 'active').length;
    const procuredCount = (db.pilots || []).filter(p => p.status === 'procured' || p.procurementDecision?.isRecorded).length;
    const totalStartups = (db.startups || []).length;
    const totalApplications = (db.applications || []).length;
    const totalEvaluations = (db.evaluations || []).length;
    const totalValidations = (db.validationReports || []).length;

    const totalFundingAllocated = (db.challenges || []).reduce((sum, c) => sum + (c.budgetAmount || 0), 0);
    const totalDisbursed = (db.milestones || [])
      .filter(m => m.status === 'released')
      .reduce((sum, m) => sum + (m.paymentAmount || 0), 0);

    res.json({
      totalChallenges,
      openChallenges,
      evaluatingChallenges,
      activePilots,
      procuredCount,
      totalStartups,
      totalApplications,
      totalEvaluations,
      totalValidations,
      totalFundingAllocated,
      totalDisbursed,
      conversionRate: activePilots > 0 ? `${Math.round((procuredCount / (activePilots + procuredCount)) * 100)}%` : '100%',
      // Aliases for backward compatibility
      totalProblems: totalChallenges,
      researchWorthy: openChallenges + activePilots,
      activeTeams: activePilots,
      solutionsAdopted: procuredCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/admin/audit-logs
 * System-wide audit trail of challenge lifecycles
 */
router.get('/audit-logs', (req, res) => {
  try {
    const db = getDB();
    res.json({ logs: db.auditLogs || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/admin/seed
 * Re-seed database to demo defaults
 */
router.post('/seed', (req, res) => {
  try {
    const { seedDatabase } = require('../seed');
    seedDatabase();
    res.json({ message: 'Database re-seeded with SIH26136 demo data successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

