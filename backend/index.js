const app = require('./app');
const { runPatternAggregation } = require('./services/aggregator');

const PORT = process.env.PORT || 5000;

// Periodic Background Job: In-process Pattern Aggregation Runner (runs every 60 minutes)
setInterval(() => {
  try {
    console.log('[Background Cron] Running scheduled pattern aggregation check...');
    runPatternAggregation(3);
  } catch (err) {
    console.error('[Background Cron] Aggregation error:', err.message);
  }
}, 60 * 60 * 1000);

// Server Startup & LLM API Key Validation
const apiKey = process.env.LLM_API_KEY || process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;
if (!apiKey || apiKey.trim() === '' || apiKey === 'your_key_here') {
  console.error('[LLM Service Error] LLM_API_KEY is not set — classification will run on heuristic fallback mode.');
} else {
  console.log('[LLM Service] LLM_API_KEY detected and loaded successfully.');
}

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` Startup Public Procurement Platform (SIH26136) Running`);
  console.log(` App & API URL: http://localhost:${PORT}`);
  console.log(` Health Check:  http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});
