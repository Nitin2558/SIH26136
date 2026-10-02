const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_FILE = path.join(__dirname, 'data.json');
const TMP_DATA_FILE = path.join('/tmp', 'data.json');

let db = {
  users: [],
  challenges: [],
  startups: [],
  applications: [],
  evaluations: [],
  pilots: [],
  milestones: [],
  validationReports: [],
  procurementDecisions: [],
  auditLogs: [],
  collaborations: [],
  messages: []
};

// Load initial state if data.json exists
function loadDB() {
  try {
    let sourcePath = DATA_FILE;
    if (fs.existsSync(TMP_DATA_FILE)) {
      sourcePath = TMP_DATA_FILE;
    }
    if (fs.existsSync(sourcePath)) {
      const raw = fs.readFileSync(sourcePath, 'utf8');
      db = JSON.parse(raw);
      if (!db.users) db.users = [];
      if (!db.challenges) db.challenges = [];
      if (!db.startups) db.startups = [];
      if (!db.applications) db.applications = [];
      if (!db.evaluations) db.evaluations = [];
      if (!db.pilots) db.pilots = [];
      if (!db.milestones) db.milestones = [];
      if (!db.validationReports) db.validationReports = [];
      if (!db.procurementDecisions) db.procurementDecisions = [];
      if (!db.auditLogs) db.auditLogs = [];
      if (!db.collaborations) db.collaborations = [];
      if (!db.messages) db.messages = [];
      console.log('[DB Store] Loaded SIH26136 state from:', sourcePath);
    } else {
      console.log('[DB Store] Initialized fresh in-memory database store for SIH26136');
    }
  } catch (err) {
    console.error('[DB Store] Error loading data:', err.message);
  }
}

function saveDB() {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch (err) {
    // Fallback to /tmp directory on serverless read-only platforms
    try {
      fs.writeFileSync(TMP_DATA_FILE, JSON.stringify(db, null, 2), 'utf8');
    } catch (tmpErr) {
      // In-memory state remains updated
    }
  }
}

// Initial load
loadDB();

function generateId() {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'id-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now().toString(36);
}

module.exports = {
  getDB: () => db,
  saveDB,
  generateId,
  resetDB: (newDb) => {
    db = newDb;
    saveDB();
  }
};

