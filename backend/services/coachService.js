/**
 * AI Problem Coach Service (SIH26136)
 * Converts informal, solution-oriented notes into an outcome-based, technology-neutral challenge.
 */

const SYSTEM_PROMPT = `You are an expert AI Problem Coach for public procurement in India under the SAMADHAN SETU platform.
Your task is to convert solution-oriented, informal, or rough notes into an outcome-based, technology-neutral challenge for eligible startups.

CRITICAL INSTRUCTIONS:
1. Return ONLY a valid JSON object matching the exact schema below. Do not wrap in markdown or include extra text.
2. Understand Hindi, Hinglish, and local terms (for example "kabbadi wala" or "kabbadi wla" means scrap collector; "choked nallah" means clogged drainage canal; "safai karmi" means sanitation worker).
3. Technology-neutrality: Focus on measurable outcomes, not specific equipment or brands.
4. NEVER invent measured numerical statistics. When baseline or target KPIs are missing, write "To be confirmed" and add questions for the officer asking for those numbers.

JSON SCHEMA:
{
  "title": "Outcome-based challenge title",
  "problem_summary": "Clear, technology-neutral summary of the operational challenge and public impact",
  "baseline_kpi": "To be confirmed",
  "target_kpi": "To be confirmed",
  "timeline_weeks": 12,
  "measurement_method": "How outcome is independently verified",
  "grant_estimate_inr": 1200000,
  "questions_for_officer": [
    "What is the current average collection delay or frequency in the target locality?",
    "What specific target punctuality or coverage percentage would indicate pilot success?"
  ]
}`;

/**
 * Safely extract JSON from model response
 */
function extractJSON(content) {
  if (!content || typeof content !== 'string') return null;
  let cleaned = content.trim();

  // Strip markdown code fences if present (e.g. ```json ... ```)
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  }

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
      } catch (innerErr) {
        return null;
      }
    }
    return null;
  }
}

/**
 * Helper to safely flatten any value into a clean, human-readable string
 */
function flattenToString(val, defaultStr = 'To be confirmed') {
  if (val === null || val === undefined) return defaultStr;
  if (typeof val === 'string') {
    const trimmed = val.trim();
    return trimmed.length > 0 ? trimmed : defaultStr;
  }
  if (typeof val === 'number') return String(val);
  if (typeof val === 'boolean') return val ? 'Yes' : 'No';
  if (Array.isArray(val)) {
    const joined = val.map(item => flattenToString(item, '')).filter(Boolean).join('; ');
    return joined.length > 0 ? joined : defaultStr;
  }
  if (typeof val === 'object') {
    const parts = [];
    if (val.value !== undefined) parts.push(String(val.value));
    if (val.unit) parts.push(String(val.unit));
    if (val.metric && val.metric !== val.value) parts.push(`(${val.metric})`);
    if (val.description && !parts.includes(val.description)) parts.push(`- ${val.description}`);
    if (parts.length > 0) return parts.join(' ').trim();

    try {
      const vals = Object.values(val).filter(v => typeof v === 'string' || typeof v === 'number');
      if (vals.length > 0) return vals.join(' - ');
      return JSON.stringify(val);
    } catch (e) {
      return defaultStr;
    }
  }
  return defaultStr;
}

/**
 * Normalize function guaranteeing the response ALWAYS has exactly the required keys and safe primitive types
 * title, problem_summary, baseline_kpi, target_kpi, measurement_method : string
 * timeline_weeks, grant_estimate_inr : number
 * questions_for_officer : array of strings
 */
function normalize(raw) {
  if (!raw || typeof raw !== 'object') {
    raw = {};
  }

  // 1. Strings
  const title = flattenToString(raw.title || raw.suggestedTitle, 'Outcome-Based Challenge');
  const problem_summary = flattenToString(
    raw.problem_summary || raw.refinedDescription || raw.summary || raw.description,
    'To be confirmed'
  );
  const baseline_kpi = flattenToString(
    raw.baseline_kpi || raw.baselineKPI || raw.baselineKpi,
    'To be confirmed'
  );
  const target_kpi = flattenToString(
    raw.target_kpi || raw.targetKPI || raw.targetKpi,
    'To be confirmed'
  );
  const measurement_method = flattenToString(
    raw.measurement_method || raw.measurementMethod,
    'Independent verification through audit and telemetry logs'
  );

  // 2. Numbers
  let timeline_weeks = 12;
  const rawWeeks = raw.timeline_weeks !== undefined ? raw.timeline_weeks : (raw.timelineWeeks !== undefined ? raw.timelineWeeks : raw.durationWeeks);
  if (typeof rawWeeks === 'number' && !isNaN(rawWeeks)) {
    timeline_weeks = Math.round(rawWeeks);
  } else if (typeof rawWeeks === 'string') {
    const parsed = parseInt(rawWeeks.replace(/\D/g, ''), 10);
    if (!isNaN(parsed) && parsed > 0) timeline_weeks = parsed;
  }

  let grant_estimate_inr = 0;
  const rawGrant = raw.grant_estimate_inr !== undefined ? raw.grant_estimate_inr : (raw.suggestedPilotBudget !== undefined ? raw.suggestedPilotBudget : raw.estimatedBudget);
  if (typeof rawGrant === 'number' && !isNaN(rawGrant)) {
    grant_estimate_inr = Math.round(rawGrant);
  } else if (typeof rawGrant === 'string') {
    const parsed = parseInt(rawGrant.replace(/[^\d]/g, ''), 10);
    if (!isNaN(parsed) && parsed > 0) grant_estimate_inr = parsed;
  }

  // 3. Array of strings
  let questions_for_officer = [];
  const rawQuestions = raw.questions_for_officer || raw.questionsToRefine || raw.questions;
  if (Array.isArray(rawQuestions)) {
    questions_for_officer = rawQuestions.map(q => {
      if (typeof q === 'string') return q.trim();
      if (q && typeof q === 'object') {
        return q.question || q.text || q.prompt || flattenToString(q, '');
      }
      return String(q || '');
    }).filter(Boolean);
  }

  return {
    title,
    problem_summary,
    baseline_kpi,
    target_kpi,
    timeline_weeks,
    measurement_method,
    grant_estimate_inr,
    questions_for_officer
  };
}

/**
 * Deterministic fallback in case no LLM key is configured or offline demo mode
 */
function getDeterministicFallback(rawText) {
  const lower = (rawText || '').toLowerCase();
  let title = 'Outcome-Based Public Service Challenge';
  let summary = `Operational modernization requirement: ${rawText}`;
  let method = 'Independent field audit and sensor telemetry verification by accredited assessment lab.';

  if (lower.includes('kabbadi') || lower.includes('kabadi') || lower.includes('scrap') || lower.includes('waste') || lower.includes('garbage')) {
    title = 'Dynamic Municipal Scrap & Recyclable Collection Timings & Route Optimization';
    summary = 'Informal and decentralized waste/scrap collection schedules lead to irregular pickup, overflowing accumulation, and public dissatisfaction. The challenge is to optimize collector dispatch and ensure verified, punctual pickup schedules.';
    method = 'GPS timestamps, citizen receipt verification, and municipal digital route logs.';
  } else if (lower.includes('water') || lower.includes('leak') || lower.includes('pipe')) {
    title = 'Underground Water Infrastructure Fracture & Non-Revenue Water Loss Detection';
    summary = 'Subterranean water loss causes distribution disruptions and resource waste. The challenge is to non-invasively detect and localize subsurface pipe fractures.';
    method = 'Acoustic sensor telemetry, pressure transducer logs, and flow meter audits.';
  }

  return normalize({
    title,
    problem_summary: summary,
    baseline_kpi: 'To be confirmed',
    target_kpi: 'To be confirmed',
    timeline_weeks: 12,
    measurement_method: method,
    grant_estimate_inr: 1200000,
    questions_for_officer: [
      'What is the measured baseline metric currently recorded in the target location?',
      'What target performance improvement or threshold defines pilot success?',
      'What specific ward, locality, or facility will serve as the initial pilot sandbox?'
    ]
  });
}

/**
 * Generate AI Coach Advice using LLM or Fallback
 */
async function generateCoachAdvice(text) {
  const apiKey = (process.env.LLM_API_KEY || '').trim();
  const endpoint = process.env.LLM_API_ENDPOINT || 'https://api.groq.com/openai/v1/chat/completions';
  const primaryModel = process.env.LLM_MODEL || 'openai/gpt-oss-20b';

  // If no API key configured, use deterministic fallback
  if (!apiKey || apiKey === 'your_key_here') {
    return { success: true, data: getDeterministicFallback(text) };
  }

  const modelsToTry = [primaryModel, 'openai/gpt-oss-120b', 'llama-3.3-70b-versatile'];

  for (const model of modelsToTry) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: text }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2
        }),
        signal: AbortSignal.timeout(18000)
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.warn(`[AI Coach] Model ${model} returned HTTP ${res.status}: ${errorText.slice(0, 150)}`);
        if (res.status === 429 || res.status === 404 || res.status === 400) {
          continue;
        }
        return {
          success: false,
          statusCode: 502,
          error: 'Coach response could not be understood, please try again'
        };
      }

      const responseJson = await res.json();
      const rawContent = responseJson.choices?.[0]?.message?.content;
      if (!rawContent) {
        continue;
      }

      const structured = extractJSON(rawContent);
      if (!structured) {
        return {
          success: false,
          statusCode: 502,
          error: 'Coach response could not be understood, please try again'
        };
      }

      const normalizedResult = normalize(structured);
      return { success: true, data: normalizedResult };
    } catch (fetchErr) {
      console.warn(`[AI Coach] Error calling model ${model}:`, fetchErr.message);
      if (model === modelsToTry[modelsToTry.length - 1]) {
        return {
          success: false,
          statusCode: 502,
          error: 'Coach response could not be understood, please try again'
        };
      }
    }
  }

  return {
    success: false,
    statusCode: 502,
    error: 'Coach response could not be understood, please try again'
  };
}

module.exports = {
  generateCoachAdvice,
  normalize,
  getDeterministicFallback
};
