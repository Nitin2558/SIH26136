const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Load user-configurable keywords & portals database
function getCustomConfig() {
  try {
    const customPath = path.join(__dirname, '../config/custom-keywords.json');
    if (fs.existsSync(customPath)) {
      return JSON.parse(fs.readFileSync(customPath, 'utf8'));
    }
  } catch (e) {
    console.warn('[Classifier] Failed to load custom-keywords.json:', e.message);
  }
  return { customGrievanceKeywords: [], customResearchKeywords: [], customPortals: [] };
}

// Load configurable government portal redirection lookup table
let portalsTable = [];
try {
  const portalsPath = path.join(__dirname, '../config/portals.json');
  if (fs.existsSync(portalsPath)) {
    portalsTable = JSON.parse(fs.readFileSync(portalsPath, 'utf8'));
  }
} catch (e) {
  console.warn('[Classifier] Failed to load portals.json:', e.message);
}

function getPortalsTable() {
  let table = [];
  try {
    const portalsPath = path.join(__dirname, '../config/portals.json');
    if (fs.existsSync(portalsPath)) {
      table = JSON.parse(fs.readFileSync(portalsPath, 'utf8'));
    }
  } catch (e) {
    console.warn('[Classifier] Failed to reload portals.json:', e.message);
  }
  
  // Merge user-defined custom portals at top priority
  const custom = getCustomConfig();
  if (Array.isArray(custom.customPortals)) {
    for (const cp of custom.customPortals) {
      if (!table.some(p => p.id === cp.id)) {
        table.unshift(cp);
      }
    }
  }
  return table.length > 0 ? table : portalsTable;
}

function matchGovernmentPortal(title = '', description = '', category = '') {
  const text = `${title} ${description}`.toLowerCase();
  const currentTable = getPortalsTable();

  // Match specific portal keywords first
  for (const portal of currentTable) {
    if (portal.keywords && portal.keywords.some(kw => text.includes(kw.toLowerCase()))) {
      return portal;
    }
  }

  // Return null if no specific keyword matched, allowing the AI's autonomous recommendation to apply
  return null;
}

function getDefaultPortal() {
  const currentTable = getPortalsTable();
  return currentTable.find(p => p.id === 'cpgrams-default') || {
    id: "cpgrams-default",
    portalName: "CPGRAMS National Portal (pgportal.gov.in)",
    portalUrl: "https://pgportal.gov.in",
    department: "Department of Administrative Reforms & Public Grievances (DARPG)",
    description: "Government of India primary single-window public grievance portal."
  };
}

/**
 * 1. Anti-Spam, Test-Input & Joke Safeguard Filter
 */
const JOKE_OR_TEST_PHRASES = [
  'just kidding', 'just spam', 'just testing', 'testing 123', 'test test',
  'just joke', 'only joking', 'it is a joke', 'this is a joke', 'fake problem',
  'nothing here', 'random test', 'demo text', 'sample text', 'hello world',
  'asdfghjkl', 'qwertyuiop', 'zxcvbnm', '123456789', '12345678', '123456',
  'asdf', 'qwerty', 'zxcv', 'hjkl', 'foo bar', 'lorem ipsum', 'blabla', 'blah blah',
  'buy crypto', 'bitcoin', 'casino', 'discount code', 'earn money', 'call now',
  'whatsapp group', 'telegram group', 'subscribe', 'click here', 'cheap shoes',
  'free gift', 'win iphone', 'loan offer', 'viagra', 'follow me', 'my cat is cute',
  'check check', 'micro check', 'only testing'
];

function detectSpam(title = '', description = '') {
  const cleanTitle = (typeof title === 'string' ? title : String(title || '')).trim();
  const cleanDesc = (typeof description === 'string' ? description : String(description || '')).trim();
  const fullText = `${cleanTitle} ${cleanDesc}`.toLowerCase().replace(/\s+/g, ' ');

  // Rule 0: Test, joke or placeholder phrase detection
  for (const phrase of JOKE_OR_TEST_PHRASES) {
    if (fullText.includes(phrase)) {
      return {
        isSpam: true,
        reason: `Anti-Spam Safeguard: Submission identified as informal test text or joke ("${phrase}"). Please describe an actual community, civic, or technological issue.`
      };
    }
  }

  // Rule 1: Extremely short input (< 12 characters or fewer than 3 words)
  const words = fullText.split(' ').filter(w => w.length > 0);
  if (fullText.length < 12 || words.length < 3) {
    return {
      isSpam: true,
      reason: 'Anti-Spam Safeguard: Problem description is too brief (< 3 words) to articulate a valid societal or technical problem.'
    };
  }

  // Rule 2: Repetitive characters (e.g. "aaaaaa", "zzzzzzz", "!!!!!")
  if (/(.)\1{4,}/.test(fullText)) {
    return {
      isSpam: true,
      reason: 'Anti-Spam Safeguard: Excessive character repetition detected (keyboard mash or junk text).'
    };
  }

  // Rule 3: Gibberish check (unusually long word with no spaces)
  const hasLongWord = words.some(w => w.length > 28);
  if (hasLongWord) {
    return {
      isSpam: true,
      reason: 'Anti-Spam Safeguard: Unusually long unbroken word detected (gibberish or invalid formatting).'
    };
  }

  // Rule 4: Consonant / vowel ratio check
  const latinLetters = fullText.replace(/[^a-z]/g, '');
  if (latinLetters.length > 15) {
    const vowels = latinLetters.match(/[aeiou]/g) || [];
    const vowelRatio = vowels.length / latinLetters.length;
    if (vowelRatio < 0.12) {
      return {
        isSpam: true,
        reason: 'Anti-Spam Safeguard: Low linguistic coherence detected (high consonant concentration / keyboard smash).'
      };
    }
  }

  return { isSpam: false };
}

/**
 * 2. Domain & Sector Semantic Lexicons
 */
const SECTOR_LEXICONS = {
  'Education': [
    'school', 'schools', 'college', 'university', 'teacher', 'teachers', 'student', 'students',
    'classroom', 'curriculum', 'education', 'learning', 'attendance', 'exam', 'examination',
    'tribal school', 'dropout', 'literacy', 'pedagogy', 'laboratory', 'syllabus', 'textbook',
    'e-learning', 'lms', 'digital learning', 'study', 'teaching', 'vocational'
  ],
  'Agriculture': [
    'farmer', 'farmers', 'crop', 'crops', 'farming', 'agriculture', 'agricultural', 'soil',
    'pesticide', 'pesticides', 'fertilizer', 'harvest', 'irrigation', 'kisan', 'sugarcane',
    'wheat', 'paddy', 'grain', 'mandi', 'pest', 'seed', 'yield', 'monsoon', 'post-harvest',
    'spoilage', 'cold storage', 'agro', 'tractor', 'farm produce'
  ],
  'Water & Sanitation': [
    'water', 'drinking water', 'groundwater', 'fluoride', 'arsenic', 'salinity', 'desalination',
    'borewell', 'handpump', 'well', 'water supply', 'contamination', 'water quality', 'river',
    'flood', 'flooding', 'drainage', 'sewer', 'sewage', 'gutter', 'drain', 'water treatment',
    'potable water', 'purification', 'membrane', 'filtration', 'watershed', 'stormwater'
  ],
  'Healthcare': [
    'health', 'healthcare', 'hospital', 'clinic', 'doctor', 'doctors', 'patient', 'patients',
    'medical', 'medicine', 'disease', 'dengue', 'malaria', 'tuberculosis', 'dialysis',
    'ambulance', 'diagnostic', 'diagnosis', 'blood bank', 'maternal', 'infant mortality',
    'telemedicine', 'vaccine', 'pharmacy', 'sanitary', 'clinical', 'pathology'
  ],
  'Energy': [
    'solar', 'electricity', 'power', 'grid', 'microgrid', 'blackout', 'blackouts', 'voltage',
    'battery', 'batteries', 'renewable energy', 'wind energy', 'biomass', 'clean energy',
    'photovoltaic', 'transformer', 'substation', 'power cut', 'ev charging', 'generator'
  ],
  'Environment': [
    'environment', 'environmental', 'air pollution', 'air quality', 'smog', 'aqi', 'particulate',
    'pollution', 'emissions', 'carbon', 'stubble burning', 'plastic waste', 'solid waste',
    'waste management', 'recycling', 'landfill', 'deforestation', 'biodiversity', 'ecosystem'
  ],
  'Mobility & Transportation': [
    'traffic', 'transport', 'transportation', 'bus', 'buses', 'transit', 'metro', 'railway',
    'train', 'commute', 'congestion', 'road safety', 'accidents', 'intersection', 'junction',
    'signals', 'traffic light', 'pedestrian', 'walkway', 'highway', 'toll'
  ],
  'Governance & Public Safety': [
    'police', 'safety', 'crime', 'street lighting', 'dark street', 'cctv', 'surveillance',
    'emergency response', 'fire brigade', 'disaster management', 'corruption', 'ration shop',
    'public distribution', 'civil registry', 'bureaucracy', 'transparency'
  ],
  'Infrastructure': [
    'road', 'roads', 'pothole', 'potholes', 'bridge', 'flyover', 'building', 'footpath',
    'street light', 'streetlight', 'pipeline', 'infrastructure', 'urban', 'sidewalk', 'construction'
  ]
};

const SOFTWARE_INDICATORS = [
  'ai', 'artificial intelligence', 'machine learning', 'deep learning', 'algorithm', 'software',
  'app', 'mobile app', 'web app', 'platform', 'portal', 'database', 'cloud', 'computer vision',
  'nlp', 'natural language', 'data analytics', 'analytics', 'dashboard', 'telemetry', 'api',
  'code', 'model', 'neural network', 'blockchain', 'cybersecurity', 'smart prediction', 'tracking system'
];

const HARDWARE_INDICATORS = [
  'sensor', 'sensors', 'iot', 'hardware', 'device', 'microcontroller', 'embedded', 'circuit',
  'robot', 'robotics', 'drone', 'drones', 'camera', 'solar panel', 'battery', 'filtration unit',
  'membrane', 'mechanism', 'meter', 'prototype', 'machinery', 'radar', 'sonar', 'actuator',
  'nanomaterial', 'material', 'composite', 'structural', 'purifier', 'physical device'
];

const GRIEVANCE_INDICATORS = [
  'pothole in front', 'pothole on road', 'broken streetlight', 'street light not working',
  'light band', 'kachra pada', 'garbage dumped', 'drainage blocked', 'gutter overflow',
  'dirty tap water', 'no water coming', 'safai nahi hui', 'bribe', 'officer not responding',
  'pension delayed', 'ration not given', 'bill incorrect', 'electric meter reading wrong',
  'broken pipe', 'complaint against', 'near my house', 'outside my house', 'in our lane',
  'verification fail', 'verification failed', 'card fail', 'card verification', 'biometric not matching',
  'aadhaar fail', 'aadhar fail', 'otp not received', 'subsidy not credited', 'account frozen',
  'water not coming', 'power cut', 'electricity not coming', 'garbage overflowing', 'road broken',
  'license delayed', 'challan wrong', 'ration card', 'khasra', 'khatauni', 'pension stopped'
];

/**
 * Detect operational, administrative, and individual service execution complaints
 * that belong on CPGRAMS / UIDAI / State grievance cells rather than R&D platforms.
 */
function detectExecutionGrievance(text = '') {
  const lower = text.toLowerCase().trim();

  // 1. Identity, Cards, and Official Documentation
  const hasIdentityKeyword = /(aadhaar|aadhar|uidai|pan card|voter id|ration card|rashan|pension|driving licen[cs]e|rc book|challan|passport|epfo|provident fund|\bpf\b|subsidy|dbt|pm.?kisan|certificate|patwari|khasra|khatauni|birth certificate|death certificate|caste certificate|income certificate)/i.test(lower);
  const hasIdentityFault = /(fail|failed|not working|not verified|verification fail|biometric|fingerprint|iris|otp|delay|delayed|pending|rejected|not received|error|stuck|stopped|freeze|frozen|update|correction|mismatch)/i.test(lower);

  if (hasIdentityKeyword && (hasIdentityFault || lower.length < 60)) {
    return {
      isGrievance: true,
      reason: 'Identified as an individual government document / identity service delivery complaint. Filtered from R&D feed and routed to CPGRAMS / UIDAI for administrative resolution.',
      portalId: /aadhaar|aadhar|uidai/i.test(lower) ? 'uidai-aadhaar' : 'mygov-citizen'
    };
  }

  // 2. Municipal & Local Utility Complaints
  const hasMunicipalObject = /(pothole|road|street.?light|light|gutter|drain|drainage|sewer|water|bijli|electricity|power|garbage|kachra|trash|waste|meter|bill|pipeline|tap|nal|sanitation|sweeper)/i.test(lower);
  const hasGrievanceFault = /(not coming|not working|band|choke|choked|blocked|overflow|burst|spill|pothole|gaddha|broken|leak|leaking|dirty|smell|cut|failure|failed|too high|wrong bill|not cleaned|safai|delay|bribe|complaint|trouble)/i.test(lower);
  const hasLocalScope = /(in front of|outside|near my|in my|in our|my house|my lane|our street|our colony|our village|our area|please send|please fix|please repair|please clean|officer not)/i.test(lower);

  if (hasMunicipalObject && (hasGrievanceFault || hasLocalScope)) {
    // Exclude actual academic research phrasing (e.g. "novel nanotechnology filter for groundwater")
    const isAcademicResearch = /(nanotechnology|algorithm|novel material|machine learning|biopolymer|synthetic|genome|quantum|autonomous drone|research on|development of|need a zero-electricity|solar-driven|graphene|nanomembrane|membrane|purification unit|filtration unit|fluoride|arsenic removal|mesh network|micro-server|offline-first|lms module|biogas reactor|catalyst|spectroscopy|sensor node|deep learning|edge ml|prototype|engineering design)/i.test(lower);
    if (!isAcademicResearch) {
      return {
        isGrievance: true,
        reason: 'Identified as a routine municipal or administrative civic maintenance issue. Filtered from R&D feed and routed to CPGRAMS for government resolution.'
      };
    }
  }

  // 3. User Custom Keywords Support
  const custom = getCustomConfig();
  if (Array.isArray(custom.customGrievanceKeywords)) {
    for (const ckw of custom.customGrievanceKeywords) {
      if (lower.includes(ckw.toLowerCase())) {
        return {
          isGrievance: true,
          reason: `Identified as a civic / administrative grievance matching configured service parameter ("${ckw}"). Routed to government grievance portal.`
        };
      }
    }
  }

  // 4. Operational & Institutional Service Delivery Failures
  const hasInstitutionalEntity = /\b(school|college|hospital|clinic|phc|chc|police|station|train|railway|ration|pds|bank|branch|office|dept|tehsil|panchayat)\b/i.test(lower);
  const hasStaffOrOperationalIssue = /\b(absent|not coming|closed early|bribe|money asking|refused|prescription|expired medicine|mid-day meal|meal not|fir|stolen|complaint|no water cooler|fan not working|dirty toilet)\b/i.test(lower);
  if (hasInstitutionalEntity && hasStaffOrOperationalIssue) {
    const isAcademicResearch = /(nanotechnology|algorithm|novel material|machine learning|biopolymer|synthetic|genome|quantum|autonomous drone|research on|development of|need a zero-electricity|solar-driven|graphene|nanomembrane|membrane|purification unit|filtration unit|fluoride|arsenic removal|mesh network|micro-server|offline-first|lms module|biogas reactor|catalyst|spectroscopy|sensor node|deep learning|edge ml|prototype|engineering design)/i.test(lower);
    if (!isAcademicResearch) {
      return {
        isGrievance: true,
        reason: 'Identified as an operational service delivery failure or staff grievance in a public institution. Filtered from R&D feed and routed to official grievance redressal.'
      };
    }
  }

  // 5. Direct Grievance / Complaint Indicators
  for (const kw of GRIEVANCE_INDICATORS) {
    if (lower.includes(kw)) {
      return {
        isGrievance: true,
        reason: 'Identified as a localized civic complaint rather than an unsolved technological challenge.'
      };
    }
  }

  return { isGrievance: false };
}

/**
 * Infer sector/category from problem text
 */
function inferCategory(text = '') {
  const lower = text.toLowerCase();
  let bestCategory = 'Infrastructure';
  let highestCount = 0;

  for (const [category, keywords] of Object.entries(SECTOR_LEXICONS)) {
    let count = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        count += kw.includes(' ') ? 3 : 1;
      }
    }
    if (count > highestCount) {
      highestCount = count;
      bestCategory = category;
    }
  }

  return bestCategory;
}

/**
 * Infer solution requirement type (Software, Hardware, Hybrid, Administrative, Not-Sure)
 */
function inferSolutionType(text = '') {
  const lower = text.toLowerCase();

  // If operational execution grievance is detected, strictly classify as administrative
  const egCheck = detectExecutionGrievance(text);
  if (egCheck.isGrievance) {
    return {
      type: 'administrative',
      label: 'Municipal / Civic Administrative Action',
      isTechSolvable: false
    };
  }

  let swCount = 0;
  SOFTWARE_INDICATORS.forEach(kw => { if (lower.includes(kw)) swCount++; });

  let hwCount = 0;
  HARDWARE_INDICATORS.forEach(kw => { if (lower.includes(kw)) hwCount++; });

  let grievanceCount = 0;
  GRIEVANCE_INDICATORS.forEach(kw => { if (lower.includes(kw)) grievanceCount++; });

  // Clear localized civic complaint -> Administrative
  if (grievanceCount > 0 && swCount === 0 && hwCount === 0) {
    return {
      type: 'administrative',
      label: 'Municipal / Civic Administrative Action',
      isTechSolvable: false
    };
  }

  if (swCount > 0 && hwCount > 0) {
    return {
      type: 'hybrid',
      label: 'Hybrid R&D (Hardware + Software / AI)',
      isTechSolvable: true
    };
  }

  if (hwCount > 0 && swCount === 0) {
    return {
      type: 'hardware',
      label: 'Hardware & Engineering Innovation',
      isTechSolvable: true
    };
  }

  if (swCount > 0 && hwCount === 0) {
    return {
      type: 'software',
      label: 'Software & AI / Data Innovation',
      isTechSolvable: true
    };
  }

  return {
    type: 'not-sure',
    label: 'Needs Technical Scoping',
    isTechSolvable: false
  };
}

/**
 * Synthesize a clean, concise 2 to 3 words problem title (NEVER solution or hackathon style)
 */
function generateSynthesizedTitle(description = '', category = 'Infrastructure') {
  if (!description || !description.trim()) {
    const defaultTitles = {
      'Water & Sanitation': 'Dirty Water Supply',
      'Infrastructure': 'Damaged Main Road',
      'Healthcare': 'Clinic Facility Shortage',
      'Education': 'School Infrastructure Shortage',
      'Agriculture': 'Crop Water Shortage',
      'Energy': 'Frequent Power Outages',
      'Environment': 'Garbage Dumping Issue',
      'Mobility & Transportation': 'Public Transport Disruption',
      'Governance & Public Safety': 'Public Safety Concern'
    };
    return defaultTitles[category] || 'Civic Infrastructure Issue';
  }

  const text = description.toLowerCase();

  // 1. High-frequency civic problem pattern matching (2-3 words directly naming the real-world issue)
  const PROBLEM_PATTERNS = [
    // Water & Sanitation
    { regex: /\b(dirty|smelly|muddy|black|polluted|bad|contaminated)\b.*\b(water|tap|drinking|bath|supply|pipe)\b/, title: 'Dirty Water Supply' },
    { regex: /\b(water|tap|drinking|bath)\b.*\b(dirty|smelly|muddy|black|polluted|bad|contaminated)\b/, title: 'Dirty Water Supply' },
    { regex: /\b(fluoride|arsenic|lead|chemical)\b/, title: 'Fluoride Water Contamination' },
    { regex: /\b(drain|drainage|sewer|gutter|nali)\b.*\b(overflow|blocked|burst|choked|jam|dirty)\b/, title: 'Drainage Overflow' },
    { regex: /\b(overflow|blocked|choked)\b.*\b(drain|drainage|sewer|gutter|nali)\b/, title: 'Drainage Overflow' },
    { regex: /\b(water|pipe|pipeline)\b.*\b(leak|leaking|burst|broken)\b/, title: 'Water Pipeline Leakage' },
    { regex: /\b(no\s+water|water\s+shortage|pani\s+nahi|paani\s+nahi)\b/, title: 'Water Supply Shortage' },
    { regex: /\b(water\s*logging|waterlogged|waterlog|submerged)\b/, title: 'Street Waterlogging' },
    
    // Roads & Transport
    { regex: /\b(pothole|potholes|gaddha|khadde)\b/, title: 'Road Potholes' },
    { regex: /\b(broken|damaged|ruined)\s+(road|sadak|street|highway)\b/, title: 'Damaged Road' },
    { regex: /\b(road|sadak|street)\b.*\b(broken|damaged|bad|ruined)\b/, title: 'Damaged Road' },
    { regex: /\b(bridge|pul)\b.*\b(crack|broken|damage|collapse)\b/, title: 'Damaged Bridge' },
    { regex: /\b(traffic|jam|congestion|choke)\b/, title: 'Traffic Congestion' },
    { regex: /\b(bus|auto|rickshaw|metro)\b.*\b(delay|absent|shortage|cancel)\b/, title: 'Transport Disruption' },
    
    // Electricity & Power
    { regex: /\b(power\s*cut|electricity|bijli|blackout|outage)\b/, title: 'Frequent Power Outages' },
    { regex: /\b(voltage|low\s+voltage|fluctuation)\b/, title: 'Voltage Fluctuations' },
    { regex: /\b(transformer|transfar)\b.*\b(burnt|burst|phook|smoke)\b/, title: 'Burnt Electric Transformer' },
    { regex: /\b(street\s*light|streetlight|batti)\b.*\b(dark|broken|off|fuse|light)\b/, title: 'Broken Streetlights' },
    { regex: /\b(street\s*light|streetlight)\b/, title: 'Streetlight Failure' },
    
    // Waste & Cleanliness
    { regex: /\b(garbage|kachra|trash|waste|kuda)\b.*\b(dump|pile|overflow|stink|spread)\b/, title: 'Garbage Dump Overflow' },
    { regex: /\b(garbage|kachra|kuda)\b/, title: 'Garbage Dumping' },
    { regex: /\b(stagnant|stinking|rotten)\b/, title: 'Stagnant Dirty Waste' },
    
    // Health & Safety
    { regex: /\b(hospital|doctor|clinic|nurse|dispensary)\b.*\b(absent|shortage|bad|close)\b/, title: 'Clinic Doctor Shortage' },
    { regex: /\b(hospital|doctor|clinic)\b/, title: 'Hospital Facility Issue' },
    { regex: /\b(dengue|malaria|mosquito)\b/, title: 'Mosquito Disease Outbreak' },
    { regex: /\b(crime|theft|harassment|police)\b/, title: 'Public Safety Concern' },
    
    // Education & Agriculture
    { regex: /\b(school|teacher|classroom)\b.*\b(shortage|absent|broken|bad)\b/, title: 'School Infrastructure Shortage' },
    { regex: /\b(school|teacher)\b/, title: 'School Infrastructure Issue' },
    { regex: /\b(crop|kisan|farmer|farming|drought|fertilizer)\b/, title: 'Agricultural Crop Distress' },
    { regex: /\b(air\s+pollution|smog|dust|smoke|aqi)\b/, title: 'Severe Air Pollution' }
  ];

  for (const pattern of PROBLEM_PATTERNS) {
    if (pattern.regex.test(text)) {
      return pattern.title;
    }
  }

  // 2. Intelligent Keyword Distillation: Strip filler words and conversational clutter
  const STOP_WORDS = new Set([
    'i', 'me', 'my', 'we', 'our', 'ours', 'you', 'your', 'he', 'she', 'it', 'they', 
    'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been', 
    'being', 'have', 'has', 'had', 'do', 'does', 'did', 'feels', 'feel', 'feeling', 
    'felt', 'while', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 
    'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 
    'own', 'same', 'so', 'than', 'too', 'very', 'can', 'will', 'just', 'should', 
    'now', 'there', 'here', 'this', 'that', 'these', 'those', 'also', 'into', 
    'with', 'from', 'about', 'near', 'please', 'help', 'having', 'take', 'taking', 
    'facing', 'issue', 'problem', 'society', 'area', 'colony', 'mohalla', 'ward', 
    'days', 'since', 'hai', 'bhi', 'se', 'me', 'par', 'ko', 'ki', 'ka', 'ke', 
    'aur', 'nahi', 'karo', 'kare', 'raha', 'rahi', 'rahe', 'sir', 'madam', 'gov', 
    'govt', 'action', 'urgent', 'kindly', 'clean', 'good', 'bad', 'system', 'platform',
    'solution', 'challenge', 'project', 'model'
  ]);

  const clean = description
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const words = clean.split(' ').map(w => w.toLowerCase()).filter(w => w.length > 2 && !STOP_WORDS.has(w));

  if (words.length >= 2) {
    // Pick first 2 or 3 words only
    const topWords = words.slice(0, 3).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
    return topWords.join(' ');
  } else if (words.length === 1) {
    const single = words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase();
    return `${single} Issue`;
  }

  // Fallback
  return `${category} Issue`;
}

/**
 * 3. Extract JSON helper
 */
function extractJSON(text) {
  if (!text) return null;
  const unmarkdown = text.replace(/```(?:json)?\s*/gi, '').replace(/```\s*$/gi, '').trim();
  const jsonMatch = unmarkdown.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (e) {
      // ignore
    }
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    return null;
  }
}

/**
 * 4. Call Unified LLM (Groq / OpenAI / Gemini)
 */
async function callLLMUnified(prompt, modelOverride = null) {
  const apiKey = (process.env.LLM_API_KEY || process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY || '').trim();

  if (!apiKey || apiKey === 'your_key_here') {
    return { isError: true, reason: 'No LLM API key provided' };
  }

  const isGroq = apiKey.startsWith('gsk_') || process.env.LLM_PROVIDER === 'groq';
  const isGemini = (apiKey.startsWith('AIza') || process.env.LLM_PROVIDER === 'gemini') && !isGroq;

  let requestUrl;
  let requestOptions;
  let requestBody;

  if (isGemini) {
    const model = process.env.LLM_MODEL || 'gemini-1.5-flash';
    requestUrl = process.env.LLM_API_ENDPOINT || `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    requestBody = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });
    requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody)
      }
    };
  } else if (isGroq) {
    const model = modelOverride || process.env.LLM_MODEL || 'openai/gpt-oss-20b';
    requestUrl = process.env.LLM_API_ENDPOINT || 'https://api.groq.com/openai/v1/chat/completions';
    requestBody = JSON.stringify({
      model,
      max_tokens: 1000,
      messages: [
        { role: "system", content: "You are an AI civic problem analyst. You MUST respond with ONLY a valid, parseable JSON object matching the requested schema." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });
    requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(requestBody)
      }
    };
  } else {
    // Standard OpenAI
    const model = process.env.LLM_MODEL || "gpt-3.5-turbo";
    requestUrl = process.env.LLM_API_ENDPOINT || 'https://api.openai.com/v1/chat/completions';
    requestBody = JSON.stringify({
      model,
      max_tokens: 600,
      messages: [
        { role: "system", content: "You are a precise JSON-only classifier for civic problem statements." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });
    requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(requestBody)
      }
    };
  }

  return new Promise((resolve, reject) => {
    try {
      const parsedUrl = new URL(requestUrl);
      const transport = parsedUrl.protocol === 'https:' ? https : http;

      const req = transport.request(parsedUrl, requestOptions, (res) => {
        let rawData = '';
        res.on('data', chunk => rawData += chunk);
        res.on('end', () => {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            return resolve({ isError: true, reason: `HTTP status ${res.statusCode}: ${rawData.slice(0, 100)}` });
          }

          try {
            const parsedRes = JSON.parse(rawData);
            let contentText = '';
            if (isGemini) {
              contentText = parsedRes.candidates?.[0]?.content?.parts?.[0]?.text || '';
            } else {
              contentText = parsedRes.choices?.[0]?.message?.content || '';
            }

            const structuredData = extractJSON(contentText);
            if (structuredData) {
              resolve({ isError: false, data: structuredData });
            } else {
              resolve({ isError: true, reason: 'Failed to extract JSON from model response' });
            }
          } catch (parseErr) {
            resolve({ isError: true, reason: parseErr.message });
          }
        });
      });

      req.setTimeout(15000, () => {
        req.destroy();
        resolve({ isError: true, reason: 'Request timed out' });
      });

      req.on('error', (e) => resolve({ isError: true, reason: e.message }));
      req.write(requestBody);
      req.end();
    } catch (err) {
      resolve({ isError: true, reason: err.message });
    }
  });
}

/**
 * Robust LLM caller with model fallback (gpt-oss-20b -> gpt-oss-120b -> compound) and exponential backoff on rate limits
 */
async function callLLMUnifiedWithRetry(prompt, retries = 2) {
  const modelsToTry = [
    process.env.LLM_MODEL || 'openai/gpt-oss-20b',
    'openai/gpt-oss-120b',
    'groq/compound'
  ];

  for (const modelCandidate of modelsToTry) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      const res = await callLLMUnified(prompt, modelCandidate);
      if (!res.isError) return res;
      if (res.reason && (res.reason.includes('429') || res.reason.includes('rate_limit')) && attempt < retries) {
        const delayMs = (attempt + 1) * 800;
        console.warn(`[Classifier] Model ${modelCandidate} rate limit encountered. Retrying in ${delayMs}ms...`);
        await new Promise(r => setTimeout(r, delayMs));
        continue;
      }
      // If error is not 429 or retries exhausted for this model, move to next fallback model
      break;
    }
  }
  return { isError: true, reason: 'All available AI models exhausted' };
}


/**
 * 5. Primary AI Auto-Analyze & Extraction Service
 * Accepts raw citizen description, automatically generates title, category,
 * solution requirement (software/hardware/hybrid), research status, and reasoning.
 */
async function analyzeAndExtractProblem(description = '', existingTitle = '', existingCategory = '') {
  // Step 1: Strict Anti-Spam & Joke Check
  const spamCheck = detectSpam(existingTitle, description);
  if (spamCheck.isSpam) {
    return {
      isSpam: true,
      status: 'spam-rejected',
      statusLabel: 'Invalid / Test Content Warning',
      confidence: 0.99,
      suggestedTitle: existingTitle || 'Invalid / Test Submission',
      category: existingCategory || 'Other',
      solutionType: 'not-sure',
      solutionTypeLabel: 'N/A',
      aiReason: spamCheck.reason,
      redirectPortal: null,
      keyTechnologies: []
    };
  }

  // Step 2: Attempt LLM Dynamic Analysis with First-Principles Reasoning Engine
  const prompt = `You are an advanced Cognitive AI Civic Analyst for India's National Innovation Platform (SIH).
Your mission is to evaluate ANY citizen problem statement—whether written in formal English, Hindi, Hinglish, local slang, or incomplete/ungrammatical notes—and determine its true nature.

*** CRITICAL INSTRUCTION: DO NOT RELY SOLELY ON STATIC KEYWORDS ***
A citizen can submit an issue using novel phrasing, colloquial terms, or regional dialect that has never been pre-programmed.
You must use FIRST-PRINCIPLES COGNITIVE REASONING to evaluate what is actually happening in the physical world.

Citizen's Submission:
"""
${description}
"""
Existing Title (if any): "${existingTitle || 'None'}"
Existing Category (if any): "${existingCategory || 'None'}"

*** FIRST-PRINCIPLES DECISION LITMUS TEST ***
Apply this 3-step decision test:

TEST 1: THE ROOT MECHANISM TEST (Implementation Failure vs Unsolved Frontier)
Ask: "What actually broke or is failing here?"
A) An OPERATIONAL, ADMINISTRATIVE, MAINTENANCE, or SERVICE DELIVERY failure of an EXISTING government system, scheme, department, utility, or infrastructure.
   - The law, scheme, department, facility, or standard commercial technology already exists, but is currently:
     * Broken, leaking, burst, burnt out, or unmaintained (e.g. pothole, broken pipeline, transformer burnt out, dark street light).
     * Staff absent, corrupt, demanding bribes, or refusing service (e.g. doctor absent at clinic, teacher absent, mid-day meal not provided, FIR not registered by police, TTE taking bribe, ration dealer hoarding grain).
     * Clerical delay, stuck application, or incorrect bill (e.g. pension delayed, PF withdrawal stuck, electricity bill inflated, scholarship pending).
     * System authentication or IT service delivery error (e.g. Aadhaar verification failed, biometric mismatch, portal 500 error, OTP not arriving).
   -> IF YES: This is strictly a "general-grievance" (solutionType: "administrative").
      It belongs on CPGRAMS or the relevant Ministry portal. It MUST NOT be sent to university R&D.

B) An UNSOLVED SCIENTIFIC, ENGINEERING, or TECHNOLOGICAL CHALLENGE where NO practical commercial solution or device currently exists worldwide or at affordable cost in India.
   - Requires laboratory experimentation, novel materials, hardware sensor prototypes, edge AI models, or deep-tech innovation by engineering students & scientists (e.g. IIT/NIT/CSIR).
   - Examples:
     * "Developing low-cost biodegradable membranes from agricultural stubble to filter fluoride and arsenic from groundwater"
     * "Ultra-low-power edge ML acoustic sensor nodes operating on vibrational energy harvesting to predict Himalayan landslides"
     * "Decentralized opportunistic mesh protocol for smartphone communications during complete telecom grid blackouts"
     * "Non-silicon solar cell coatings resistant to severe desert sandstorms"
   -> IF YES: This is "research-worthy" (solutionType: "software" | "hardware" | "hybrid").

TEST 2: THE ANTI-HALLUCINATION GUARD (Do not invent tech for operational tickets)
- If the problem mentions a technical noun (e.g. "portal", "website", "app", "database", "server", "computer", "meter", "machine", "X-ray", "scanner", "camera", "drone", "motor"), DO NOT hallucinate that this requires inventing new algorithms or blockchain!
- If an existing hospital machine is broken, a website crashed, a meter is fast, or an app gives an error -> IT IS A ROUTINE MAINTENANCE GRIEVANCE.

TEST 3: MULTI-LINGUAL & HINGLISH COMPREHENSION
- Comprehend Hindi/Hinglish phrasing naturally:
  * "Paani nahi aa raha 3 din se" -> Water supply failure (General Grievance).
  * "Ration dealer ration nahi de raha agle mahine aane ko bolta hai" -> PDS welfare failure (General Grievance).
  * "Police chowki me report nahi likh rahe" -> Police administrative grievance (General Grievance).
  * "Transformer phook gaya line man paise maang raha hai" -> Corruption & power grid ticket (General Grievance).

Analyze this problem carefully and return ONLY a valid JSON object matching this exact schema:
{
  "isSpamOrJoke": boolean (true if the text is a joke, test input like "just kidding" or "just spam", greeting, gibberish, or non-problem),
  "suggestedTitle": string (STRICT REQUIREMENT: Exactly 2 to 3 words naming the real-world civic problem ONLY. Examples: "Dirty Water Supply", "Broken Main Drainage", "Road Potholes", "Frequent Power Outages", "Broken Streetlight", "Garbage Dump Overflow". DO NOT exceed 3 words. DO NOT use solution names, hackathon titles, or words like 'System', 'Platform', 'Framework', 'Monitoring', 'Solution'),
  "category": string (MUST BE ONE OF: "Infrastructure", "Water & Sanitation", "Healthcare", "Education", "Agriculture", "Energy", "Environment", "Mobility & Transportation", "Governance & Public Safety", "Other"),
  "solutionType": "software" | "hardware" | "hybrid" | "administrative" | "not-sure",
  "status": "research-worthy" | "general-grievance" | "needs-review" | "spam-rejected",
  "confidence": number between 0.75 and 0.98,
  "reason": string (1-2 clear first-principles sentences explaining why this is an operational civic grievance or novel research challenge),
  "keyTechnologies": array of 2-4 strings (only for research-worthy, otherwise empty array []),
  "recommendedPortal": {
    "portalName": string (e.g. "RailMadad", "CPGRAMS Education Cell", "UIDAI Aadhaar Cell", "National Consumer Helpline", "Jal Shakti Portal", "Ministry of Power CGRF"),
    "portalUrl": string (official URL e.g. "https://pgportal.gov.in", "https://railmadad.indianrailways.gov.in", "https://consumerhelpline.gov.in", "https://myaadhaar.uidai.gov.in/check-aadhaar-validity"),
    "department": string (e.g. "Ministry of Railways", "Ministry of Education", "Ministry of Health & Family Welfare", "Department of Consumer Affairs"),
    "description": string (short 1-sentence note explaining why this is the official redressal channel)
  }
}`;

  const llmRes = await callLLMUnifiedWithRetry(prompt);

  if (!llmRes.isError && llmRes.data) {
    const d = llmRes.data;
    if (d.isSpamOrJoke || d.status === 'spam-rejected') {
      return {
        isSpam: true,
        status: 'spam-rejected',
        statusLabel: 'Invalid / Test Content Warning',
        confidence: typeof d.confidence === 'number' ? d.confidence : 0.95,
        suggestedTitle: existingTitle || 'Invalid / Test Submission',
        category: d.category || existingCategory || 'Other',
        solutionType: 'not-sure',
        solutionTypeLabel: 'N/A',
        aiReason: d.reason || 'Anti-Spam Safeguard: Input identified as non-problem test text or joke.',
        redirectPortal: null,
        keyTechnologies: []
      };
    }

    // Safety Override: Enforce execution grievance classification if user is reporting a broken/delayed government service
    const egCheck = detectExecutionGrievance(`${description} ${d.suggestedTitle || existingTitle}`);
    if (egCheck.isGrievance) {
      d.status = 'general-grievance';
      d.solutionType = 'administrative';
      d.reason = egCheck.reason || d.reason;
    }

    const solType = d.solutionType || 'not-sure';
    const solTypeMap = {
      'software': 'Software & AI / Algorithms',
      'hardware': 'Hardware & Physical Engineering',
      'hybrid': 'Hybrid R&D (Hardware + Software)',
      'administrative': 'Municipal / Civic Administrative Action',
      'not-sure': 'Needs Technical Scoping'
    };

    const statusMap = {
      'research-worthy': 'Research-Worthy Problem (R&D Innovation)',
      'general-grievance': 'Operational Execution Grievance (Municipal Redressal)',
      'needs-review': 'Under Community / Expert Review',
      'spam-rejected': 'Invalid / Test Content Warning'
    };

    const problemType = d.status === 'research-worthy' ? 'research' : d.status === 'general-grievance' ? 'execution' : 'review';
    const problemTypeLabel = d.status === 'research-worthy' ? 'Research Problem (R&D)' : d.status === 'general-grievance' ? 'Execution Grievance (Civic Maintenance)' : 'Under Review';

    // Determine target redirection portal:
    // 1. User-configured keyword match (highest priority)
    // 2. AI autonomous first-principles recommendation (if valid URL provided)
    // 3. Official CPGRAMS central single-window fallback
    let redirectPortal = null;
    if (d.status === 'general-grievance') {
      const keywordPortal = matchGovernmentPortal(d.suggestedTitle || existingTitle, description, d.category);
      if (keywordPortal) {
        redirectPortal = keywordPortal;
      } else if (d.recommendedPortal && d.recommendedPortal.portalUrl && d.recommendedPortal.portalName) {
        redirectPortal = {
          id: 'ai-recommended',
          category: d.category || 'General',
          portalName: d.recommendedPortal.portalName,
          portalUrl: d.recommendedPortal.portalUrl,
          department: d.recommendedPortal.department || 'Government of India',
          description: d.recommendedPortal.description || 'AI-recommended official government grievance redressal portal.'
        };
      } else {
        redirectPortal = getDefaultPortal();
      }
    }

    let computedTitle = existingTitle;
    if (!computedTitle && d.suggestedTitle) {
      const clean = d.suggestedTitle
        .replace(/\b(system|platform|framework|solution|monitoring|technology|architecture|hackathon|challenge|project)\b/gi, '')
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      const tokens = clean.split(' ').filter(Boolean);
      if (tokens.length >= 2) {
        computedTitle = tokens.slice(0, 3).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      }
    }
    if (!computedTitle) {
      computedTitle = generateSynthesizedTitle(description, d.category);
    }

    return {
      isSpam: false,
      status: d.status || 'research-worthy',
      statusLabel: statusMap[d.status] || 'Civic Problem',
      problemType,
      problemTypeLabel,
      confidence: typeof d.confidence === 'number' ? Math.max(0.70, Math.min(0.98, d.confidence)) : 0.88,
      suggestedTitle: computedTitle,
      category: d.category || existingCategory || 'Infrastructure',
      solutionType: solType,
      solutionTypeLabel: solTypeMap[solType] || 'Needs Technical Scoping',
      aiReason: d.reason || 'Processed and verified by AI analysis engine.',
      redirectPortal,
      keyTechnologies: Array.isArray(d.keyTechnologies) ? d.keyTechnologies : []
    };
  } else if (llmRes.isError) {
    console.warn('[Classifier] LLM dynamic analysis bypassed/failed:', llmRes.reason);
  }

  // Step 3: Deep Built-in Semantic Fallback (Used when offline or API limit reached)
  const detectedCategory = existingCategory || inferCategory(description);
  const solInfo = inferSolutionType(description);
  const generatedTitle = existingTitle || generateSynthesizedTitle(description, detectedCategory);
  const keywordPortal = matchGovernmentPortal(generatedTitle, description, detectedCategory);
  const redirectPortal = keywordPortal || getDefaultPortal();

  let status = 'research-worthy';
  let confidence = 0.85;
  let reason = '';

  const fallbackEgCheck = detectExecutionGrievance(`${description} ${generatedTitle}`);
  if (fallbackEgCheck.isGrievance || solInfo.type === 'administrative') {
    status = 'general-grievance';
    confidence = 0.95;
    reason = fallbackEgCheck.reason || `Identified as a routine municipal or administrative civic grievance. Filtered from R&D feed and routed to ${redirectPortal.portalName} for direct government redressal.`;
  } else if (solInfo.type === 'hybrid' || solInfo.type === 'hardware' || solInfo.type === 'software') {
    status = 'research-worthy';
    confidence = 0.88;
    reason = `Systemic challenge in ${detectedCategory} requiring ${solInfo.label}. Validated for University & Industry R&D pipeline.`;
  } else {
    status = 'needs-review';
    confidence = 0.65;
    reason = `Borderline problem statement in ${detectedCategory}. Queued for community & official feasibility evaluation.`;
  }

  const fallbackProblemType = status === 'research-worthy' ? 'research' : status === 'general-grievance' ? 'execution' : 'review';
  const fallbackProblemTypeLabel = status === 'research-worthy' ? 'Research Problem (R&D)' : status === 'general-grievance' ? 'Execution Grievance (Civic Maintenance)' : 'Under Review';

  return {
    isSpam: false,
    status,
    statusLabel: status === 'research-worthy' ? 'Research-Worthy Problem (R&D Innovation)' : status === 'general-grievance' ? 'Operational Execution Grievance (Municipal Redressal)' : 'Under Expert Review',
    problemType: fallbackProblemType,
    problemTypeLabel: fallbackProblemTypeLabel,
    confidence,
    suggestedTitle: generatedTitle,
    category: detectedCategory,
    solutionType: solInfo.type,
    solutionTypeLabel: solInfo.label,
    aiReason: reason,
    redirectPortal: status === 'general-grievance' ? redirectPortal : null,
    keyTechnologies: solInfo.type === 'hybrid' ? ['IoT Sensors', 'Predictive AI'] : solInfo.type === 'hardware' ? ['Physical Sensors', 'Engineering Prototype'] : solInfo.type === 'software' ? ['Software Platform', 'Algorithms'] : []
  };
}

/**
 * 6. Master Classification Entry Point (used during /api/problems/submit)
 */
async function classifyProblem(title, description, category, formAnswers = {}) {
  const analysis = await analyzeAndExtractProblem(description, title, category);

  // Form answer override considerations:
  // If submitter explicitly chose "No" to tech solvability and it has grievance indicators, ensure grievance
  if (formAnswers.techSolvable === 'No' || formAnswers.techSolvable === 'no') {
    if (analysis.status !== 'spam-rejected') {
      analysis.status = 'general-grievance';
      analysis.redirectPortal = matchGovernmentPortal(title || analysis.suggestedTitle, description, category) || analysis.redirectPortal || getDefaultPortal();
      const targetPortalName = analysis.redirectPortal?.portalName || 'CPGRAMS Central Public Grievance Portal';
      analysis.aiReason = `Classified as general civic grievance per submitter confirmation and operational nature. Redirected to ${targetPortalName}.`;
    }
  }

  // Guarantee that if status is general-grievance, redirectPortal is never null
  if (analysis.status === 'general-grievance' && !analysis.redirectPortal) {
    analysis.redirectPortal = getDefaultPortal();
  }

  const isResearch = analysis.status === 'research-worthy';
  const isGrievance = analysis.status === 'general-grievance';
  const defaultProblemType = isResearch ? 'research' : isGrievance ? 'execution' : 'review';
  const defaultProblemTypeLabel = isResearch ? 'Research Problem (R&D)' : isGrievance ? 'Execution Grievance (Civic Maintenance)' : 'Under Review';
  const defaultStatusLabel = isResearch ? 'Research-Worthy Problem (R&D Innovation)' : isGrievance ? 'Operational Execution Grievance (Municipal Redressal)' : 'Under Expert Review';

  return {
    status: analysis.status,
    statusLabel: analysis.statusLabel || defaultStatusLabel,
    problemType: analysis.problemType || defaultProblemType,
    problemTypeLabel: analysis.problemTypeLabel || defaultProblemTypeLabel,
    confidence: analysis.confidence,
    heuristicScore: analysis.confidence,
    llmLabel: analysis.status,
    llmConfidence: analysis.confidence,
    aiReason: analysis.aiReason,
    solutionType: analysis.solutionType,
    solutionTypeLabel: analysis.solutionTypeLabel,
    suggestedTitle: analysis.suggestedTitle,
    category: analysis.category,
    redirectPortal: analysis.redirectPortal,
    keyTechnologies: analysis.keyTechnologies,
    auditLog: {
      timestamp: new Date().toISOString(),
      provider: process.env.LLM_PROVIDER || 'groq',
      model: process.env.LLM_MODEL || 'openai/gpt-oss-20b',
      statusRouting: analysis.status
    }
  };
}

function calculateHeuristicScore(title, description, formAnswers = {}) {
  const text = `${title} ${description}`.toLowerCase();
  let score = 0.50;
  if (formAnswers.techSolvable === 'Yes') score += 0.20;
  if (formAnswers.techSolvable === 'No') score -= 0.30;
  return parseFloat(Math.max(0.1, Math.min(0.95, score)).toFixed(2));
}

module.exports = {
  classifyProblem,
  analyzeAndExtractProblem,
  calculateHeuristicScore,
  matchGovernmentPortal,
  detectSpam,
  inferCategory,
  inferSolutionType
};
