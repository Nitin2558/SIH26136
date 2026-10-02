const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '.env') });

const { getDB } = require('./db/store');
const { seedDatabase } = require('./seed');
const { runPatternAggregation } = require('./services/aggregator');
const { supabase } = require('./config/supabase');

const authRoutes = require('./routes/auth');
const problemRoutes = require('./routes/problems');
const teamRoutes = require('./routes/teams');
const workspaceRoutes = require('./routes/workspace');
const adminRoutes = require('./routes/admin');
const startupRoutes = require('./routes/startups');
const templateRoutes = require('./routes/templates');
const { coachRouter } = require('./routes/coach');

const app = express();

// Enable CORS & JSON parsing
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Serverless Body Normalizer & URL Prefix Middleware for Netlify / AWS Lambda
app.use((req, res, next) => {
  if (req.url && req.url.startsWith('/.netlify/functions/api')) {
    req.url = req.url.replace('/.netlify/functions/api', '/api');
  }
  if (req.body) {
    if (typeof req.body === 'string' && req.body.trim()) {
      try {
        req.body = JSON.parse(req.body);
      } catch (e) {
        // Ignore
      }
    } else if (Buffer.isBuffer(req.body)) {
      try {
        req.body = JSON.parse(req.body.toString('utf8'));
      } catch (e) {
        // Ignore
      }
    }
  }
  next();
});

// Ensure database is populated on initial launch
const db = getDB();
if (!db.challenges || db.challenges.length === 0) {
  seedDatabase();
}

// API Routes (Primary SIH26136 + Backward Compatible Aliases)
app.use('/api/auth', authRoutes);
app.use('/api/challenges', problemRoutes);
app.use('/api/problems', problemRoutes); // Alias
app.use('/api/pilots', teamRoutes);
app.use('/api/teams', teamRoutes); // Alias
app.use('/api/startups', startupRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/workspace', workspaceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/coach', coachRouter);

// Storage Guard Endpoint
app.use('/storage', (req, res) => {
  return res.status(403).json({ error: 'Access Denied: Direct raw storage access is restricted. Use short-lived signed URLs.' });
});

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  const currentDb = getDB();
  res.json({
    status: 'ok',
    app: 'Startup Friendly Public Procurement Platform API (SIH26136)',
    timestamp: new Date().toISOString(),
    challengesCount: (currentDb.challenges || currentDb.problems || []).length,
    pilotsCount: (currentDb.pilots || currentDb.teams || []).length,
    startupsCount: (currentDb.startups || []).length,
    llmConfigured: Boolean(process.env.LLM_API_KEY && process.env.LLM_API_KEY !== 'your_key_here'),
    supabaseConnected: Boolean(supabase),
    supabaseUrl: process.env.SUPABASE_URL || null
  });
});

// Single-Server Integration: Serve Frontend Static Production Build if exists
const frontendDist = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(frontendDist, 'index.html'));
    }
    next();
  });
}

module.exports = app;
