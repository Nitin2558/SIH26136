// Single source of truth 6-company dataset for SAMADHAN SETU (SIH26136)
// Dates are in 2026. Status values for payment parts: paid | ready | hold | stopped | notstarted

const INITIAL_PROJECTS = [
  {
    id: "P1",
    company: "CleanRoute Technologies",
    city: "Pune",
    dept: "Pune Municipal Corporation",
    field: "Smart Cities",
    problem: "Garbage trucks reach homes late",
    unit: "% late",
    before: 40,
    goal: 25,
    now: 22,
    step: 8,
    verdict: "met",
    checker: "IIT Delhi Mobility Lab",
    checkedOn: "2026-09-05",
    grant: 1250000,
    parts: [
      { n: 1, pct: 30, amt: 375000, status: "paid", date: "2026-06-12", ref: "UTR2606120041", why: "Paid when work started" },
      { n: 2, pct: 40, amt: 500000, status: "paid", date: "2026-09-10", ref: "UTR2609100077", why: "Paid after result check" },
      { n: 3, pct: 30, amt: 375000, status: "paid", date: "2026-09-25", ref: "UTR2609250019", why: "Paid after final report" }
    ],
    expand: {
      decision: "approved",
      cities: ["Nashik", "Nagpur", "Kolhapur"],
      date: "2026-09-28"
    }
  },
  {
    id: "P2",
    company: "AquaSense Labs",
    city: "Bengaluru",
    dept: "Bengaluru Water Supply Board",
    field: "Water",
    problem: "Water is lost from leaking pipes",
    unit: "% lost",
    before: 32,
    goal: 15,
    now: 19,
    step: 6,
    verdict: "met",
    checker: "IISc Urban Water Lab",
    checkedOn: "2026-09-29",
    grant: 1800000,
    parts: [
      { n: 1, pct: 30, amt: 540000, status: "paid", date: "2026-07-27", ref: "UTR2607270033", why: "Paid when work started" },
      { n: 2, pct: 40, amt: 720000, status: "ready", readySince: "2026-09-29", why: "Waiting for officer to approve" },
      { n: 3, pct: 30, amt: 540000, status: "notstarted", why: "Paid after final report" }
    ]
  },
  {
    id: "P3",
    company: "SignalSetu",
    city: "Delhi",
    dept: "Traffic Management Directorate",
    field: "Traffic",
    problem: "Ambulances get stuck at red lights",
    unit: "minutes",
    before: 18,
    goal: 10,
    now: 12.5,
    step: 6,
    verdict: "partly",
    checker: "IIT Delhi Transport Lab",
    checkedOn: "2026-09-28",
    grant: 1600000,
    parts: [
      { n: 1, pct: 30, amt: 480000, status: "paid", date: "2026-06-10", ref: "UTR2606100052", why: "Paid when work started" },
      { n: 2, pct: 40, amt: 640000, status: "hold", holdSince: "2026-09-28", why: "On hold: goal only partly met" },
      { n: 3, pct: 30, amt: 480000, status: "notstarted", why: "Paid after final report" }
    ]
  },
  {
    id: "P4",
    company: "SunHealth Power",
    city: "Shimla",
    dept: "Health Department, Himachal Pradesh",
    field: "Energy",
    problem: "Health centres lose power for hours",
    unit: "hours/day",
    before: 9,
    goal: 2,
    now: null,
    step: 5,
    verdict: "notchecked",
    checker: null,
    checkedOn: null,
    grant: 1000000,
    parts: [
      { n: 1, pct: 30, amt: 300000, status: "paid", date: "2026-09-08", ref: "UTR2609080064", why: "Paid when work started" },
      { n: 2, pct: 40, amt: 400000, status: "notstarted", why: "Paid after result check" },
      { n: 3, pct: 30, amt: 300000, status: "notstarted", why: "Paid after final report" }
    ]
  },
  {
    id: "P5",
    company: "LightLoop",
    city: "Indore",
    dept: "Indore Municipal Corporation",
    field: "Smart Cities",
    problem: "Broken streetlights take too long to fix",
    unit: "days",
    before: 6,
    goal: 2,
    now: null,
    step: 3,
    verdict: "notchecked",
    checker: null,
    checkedOn: null,
    grant: 800000,
    applicants: 4,
    expertDeadline: "2026-10-12",
    parts: [
      { n: 1, pct: 30, amt: 240000, status: "notstarted", why: "Paid when work starts" },
      { n: 2, pct: 40, amt: 320000, status: "notstarted", why: "Paid after result check" },
      { n: 3, pct: 30, amt: 240000, status: "notstarted", why: "Paid after final report" }
    ]
  },
  {
    id: "P6",
    company: "RoadWatch AI",
    city: "Jaipur",
    dept: "Jaipur Municipal Corporation",
    field: "Roads",
    problem: "Pothole complaints are fixed too slowly",
    unit: "days",
    before: 30,
    goal: 10,
    now: 27,
    step: 8,
    verdict: "notmet",
    checker: "MNIT Jaipur Civil Lab",
    checkedOn: "2026-09-05",
    grant: 700000,
    stopped: true,
    parts: [
      { n: 1, pct: 30, amt: 210000, status: "paid", date: "2026-06-22", ref: "UTR2606220028", why: "Paid when work started" },
      { n: 2, pct: 40, amt: 280000, status: "stopped", why: "Stopped: goal not met" },
      { n: 3, pct: 30, amt: 210000, status: "stopped", why: "Stopped: goal not met" }
    ],
    expand: {
      decision: "stopped",
      date: "2026-09-08",
      learning: "Photo-based complaint sorting was slow; try with ward-level crews first."
    }
  }
];

const STORAGE_KEY = 'sih_projects_v2';

export const getProjects = () => {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PROJECTS));
      }
      return JSON.parse(JSON.stringify(INITIAL_PROJECTS));
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading projects from localStorage', e);
    return JSON.parse(JSON.stringify(INITIAL_PROJECTS));
  }
};

export const saveProjects = (projects) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
      window.dispatchEvent(new CustomEvent('sih-projects-update', { detail: projects }));
      window.dispatchEvent(new Event('storage'));
    }
  } catch (e) {
    console.error('Error saving projects to localStorage', e);
  }
};

export const resetProjects = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
  return getProjects();
};

export const formatIndianCurrency = (num) => {
  if (num === null || num === undefined) return '₹0';
  return '₹' + Number(num).toLocaleString('en-IN');
};

export const computeProjectPaidSoFar = (project) => {
  if (!project?.parts) return 0;
  return project.parts
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + (p.amt || 0), 0);
};

export const computeProjectWaiting = (project) => {
  if (!project?.parts) return 0;
  return project.parts
    .filter(p => p.status === 'ready' || p.status === 'hold')
    .reduce((sum, p) => sum + (p.amt || 0), 0);
};

export const computeMetrics = (projects) => {
  const list = projects || getProjects();
  
  // Problems open: step <= 2
  const problemsOpen = list.filter(p => p.step <= 2 && !p.stopped).length;
  
  // Experts giving marks: step === 3
  const expertsGrading = list.filter(p => p.step === 3 && !p.stopped).length;
  
  // Trials running: step 4, 5, 6
  const trialsRunning = list.filter(p => (p.step >= 4 && p.step <= 6) && !p.stopped).length;
  
  // Money waiting for you: sum of all parts in status 'ready' or 'hold'
  const moneyWaiting = list.reduce((total, p) => total + computeProjectWaiting(p), 0);

  return {
    problemsOpen,
    expertsGrading,
    trialsRunning,
    moneyWaiting
  };
};

export const getDaysWaiting = (dateStr) => {
  if (!dateStr) return 0;
  const target = new Date(dateStr);
  const now = new Date('2026-10-02');
  const diffTime = Math.max(0, now - target);
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

export const payPart = (projectId, partNumber, customRef = null) => {
  const projects = getProjects();
  const project = projects.find(p => p.id === projectId);
  if (!project) return false;

  const part = project.parts.find(p => p.n === partNumber);
  if (!part) return false;

  const todayStr = '2026-10-02';
  const ref = customRef || ('UTR26100200' + Math.floor(10 + Math.random() * 89));

  part.status = 'paid';
  part.date = todayStr;
  part.ref = ref;
  part.why = partNumber === 1 ? 'Paid when work started' : partNumber === 2 ? 'Paid after result check' : 'Paid after final report';
  delete part.readySince;
  delete part.holdSince;

  if (project.step === 6 && partNumber === 2) {
    project.step = 7;
  }

  saveProjects(projects);
  return true;
};

export const holdPart = (projectId, partNumber, reason, customAmt = null) => {
  const projects = getProjects();
  const project = projects.find(p => p.id === projectId);
  if (!project) return false;

  const part = project.parts.find(p => p.n === partNumber);
  if (!part) return false;

  if (customAmt !== null && customAmt !== undefined && customAmt < part.amt) {
    const todayStr = '2026-10-02';
    part.status = 'paid';
    part.amt = Number(customAmt);
    part.date = todayStr;
    part.ref = 'UTR26100200' + Math.floor(10 + Math.random() * 89);
    part.why = 'Partial payment approved: ' + (reason || 'Goal partly met');
    delete part.readySince;
    delete part.holdSince;
    if (project.step === 6) project.step = 7;
  } else {
    part.status = 'hold';
    part.holdSince = part.holdSince || '2026-10-02';
    part.why = reason ? ('On hold: ' + reason) : 'On hold: goal only partly met';
  }

  saveProjects(projects);
  return true;
};

export const decideExpand = (projectId, decision, learningOrCities = null) => {
  const projects = getProjects();
  const project = projects.find(p => p.id === projectId);
  if (!project) return false;

  const todayStr = '2026-10-02';
  if (decision === 'approved') {
    project.expand = {
      decision: 'approved',
      cities: Array.isArray(learningOrCities) ? learningOrCities : ['Pune', 'Nashik'],
      date: todayStr
    };
  } else {
    project.expand = {
      decision: 'stopped',
      date: todayStr,
      learning: typeof learningOrCities === 'string' ? learningOrCities : 'Trial ended at conclusion of pilot.'
    };
    project.stopped = true;
  }
  project.step = 8;
  saveProjects(projects);
  return true;
};

export const STEP_NAMES = [
  '1 Problem written',
  '2 Startups applying',
  '3 Experts giving marks',
  '4 Startup chosen',
  '5 Small trial running',
  '6 Result being checked',
  '7 Money paid',
  '8 Expand or stop?'
];

export const getStepExplanation = (step, project) => {
  if (project?.stopped) {
    return 'This project was stopped. No further work or payments will take place.';
  }
  switch (step) {
    case 1: return 'This problem is written and awaiting approval to invite startups.';
    case 2: return 'Startups are actively submitting proposals for this problem.';
    case 3: return 'Startups have applied. Experts are marking proposals until ' + (project?.expertDeadline || 'soon') + '.';
    case 4: return 'The winning startup has been selected to run the small trial.';
    case 5: return 'The startup is actively running the small trial in the field.';
    case 6: return 'The small trial is complete. ' + (project?.checker || 'The independent checker') + ' is checking results.';
    case 7: return 'Results are verified. Payments are released according to trial goals.';
    case 8:
      if (project?.expand?.decision === 'approved') {
        return 'Trial successful! Approved to expand to ' + (project.expand.cities?.join(', ') || 'more cities') + '.';
      }
      return 'The small trial is complete. Decide whether to expand to more cities or stop.';
    default:
      return 'Project is in progress.';
  }
};

export { INITIAL_PROJECTS as projects };
