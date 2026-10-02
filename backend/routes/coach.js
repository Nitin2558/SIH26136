const express = require('express');
const router = express.Router();
const { generateCoachAdvice } = require('../services/coachService');

/**
 * Handle AI Problem Coach request
 */
async function handleCoachRequest(req, res) {
  try {
    const rawText = req.body?.text || req.body?.roughDescription || req.body?.rawRequirement || '';
    const text = typeof rawText === 'string' ? rawText.trim() : '';

    if (!text) {
      return res.status(400).json({
        error: 'Please enter a problem description or rough notes for the AI Problem Coach.'
      });
    }

    const result = await generateCoachAdvice(text);
    if (!result.success) {
      return res.status(result.statusCode || 502).json({
        error: result.error || 'Coach response could not be understood, please try again'
      });
    }

    // Return the clean normalized JSON with no nested objects
    return res.json(result.data);
  } catch (err) {
    console.error('[AI Coach Handler Error]:', err);
    return res.status(502).json({
      error: 'Coach response could not be understood, please try again'
    });
  }
}

router.post('/', handleCoachRequest);

module.exports = {
  coachRouter: router,
  handleCoachRequest
};
