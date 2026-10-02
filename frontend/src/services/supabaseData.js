import { supabase, isSupabaseConfigured } from './supabaseClient';
import { 
  getProjects, 
  payPart as localPayPart, 
  holdPart as localHoldPart, 
  formatIndianCurrency,
  getDaysWaiting 
} from '../data/projects';

// Local storage key for custom created companies & live events in demo/offline mode
const LOCAL_EVENTS_KEY = 'sih_live_events_v2';
const LOCAL_STARTUPS_KEY = 'sih_custom_startups_v2';
const LOCAL_APPLICATIONS_KEY = 'sih_custom_applications_v2';

// Initial default events feed derived from 6 canonical companies
const DEFAULT_EVENTS = [
  {
    id: 'ev-1',
    kind: 'check',
    text_plain: 'Independent checker (IISc Urban Water Lab) checked result for AquaSense Labs: Goal met.',
    why: 'Water loss dropped from 32% to 19%, meeting testbed requirements. Part 2 is ready to pay.',
    company: 'AquaSense Labs',
    companyId: 'P2',
    created_at: new Date(Date.now() - 3 * 60 * 1000).toISOString() // 3 mins ago
  },
  {
    id: 'ev-2',
    kind: 'payment',
    text_plain: 'Part 2 (₹7,20,000) is ready to pay for AquaSense Labs.',
    why: 'Waiting for officer release after IISc result verification.',
    company: 'AquaSense Labs',
    companyId: 'P2',
    created_at: new Date(Date.now() - 8 * 60 * 1000).toISOString() // 8 mins ago
  },
  {
    id: 'ev-3',
    kind: 'mark',
    text_plain: 'Judges are giving marks for LightLoop (2 of 3 done).',
    why: 'Evaluation scoring active until 12 Oct 2026.',
    company: 'LightLoop',
    companyId: 'P5',
    created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString() // 25 mins ago
  },
  {
    id: 'ev-4',
    kind: 'check',
    text_plain: 'Independent checker (IIT Delhi Transport Lab) checked result for SignalSetu: Partly met.',
    why: 'Delay dropped from 18 min to 12.5 min; full goal was 10 min. Placed on hold.',
    company: 'SignalSetu',
    companyId: 'P3',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
  },
  {
    id: 'ev-5',
    kind: 'application',
    text_plain: 'LightLoop applied for Broken streetlights take too long to fix.',
    why: 'Offered IoT mesh monitoring nodes for ₹8,00,000 in 8 weeks.',
    company: 'LightLoop',
    companyId: 'P5',
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() // 4 hours ago
  },
  {
    id: 'ev-6',
    kind: 'expand',
    text_plain: 'Officer approved expanding CleanRoute Technologies to Nashik, Nagpur, Kolhapur.',
    why: 'Trial reached 22% late arrivals beating the 25% target.',
    company: 'CleanRoute Technologies',
    companyId: 'P1',
    created_at: '2026-09-28T16:00:00Z'
  },
  {
    id: 'ev-7',
    kind: 'payment',
    text_plain: '₹3,75,000 paid to CleanRoute Technologies (Part 3).',
    why: 'Paid after final report. Bank ref: UTR2609250019.',
    company: 'CleanRoute Technologies',
    companyId: 'P1',
    created_at: '2026-09-25T14:00:00Z'
  },
  {
    id: 'ev-8',
    kind: 'trial',
    text_plain: 'Small trial stopped for RoadWatch AI.',
    why: 'Trial stopped because goal was not met. Remaining funds cancelled.',
    company: 'RoadWatch AI',
    companyId: 'P6',
    created_at: '2026-09-08T11:00:00Z'
  }
];

export const getStoredLiveEvents = () => {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_EVENTS_KEY) : null;
    if (!raw) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(DEFAULT_EVENTS));
      }
      return DEFAULT_EVENTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_EVENTS;
  }
};

export const appendLiveEvent = (newEvent) => {
  try {
    const events = getStoredLiveEvents();
    const updated = [newEvent, ...events.filter(e => e.id !== newEvent.id)].slice(0, 50);
    localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(updated));
    localStorage.setItem('sih_latest_live_event', JSON.stringify({ event: newEvent, timestamp: Date.now() }));
    window.dispatchEvent(new CustomEvent('sih-live-event', { detail: newEvent }));
  } catch (e) {
    console.error('Error saving live event', e);
  }
};

// Fetch live events with fallback
export const fetchLiveEvents = async (filter = 'ALL') => {
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase
        .from('events')
        .select(`
          id, kind, text_plain, why, created_at,
          startup:startups(id, name),
          problem:problems(id, title)
        `)
        .order('created_at', { ascending: false })
        .limit(40);

      if (filter === 'APPLICATIONS') query = query.eq('kind', 'application');
      if (filter === 'PAYMENTS') query = query.eq('kind', 'payment');
      if (filter === 'CHECKS') query = query.eq('kind', 'check');

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data.map(ev => ({
          id: ev.id,
          kind: ev.kind,
          text_plain: ev.text_plain,
          why: ev.why,
          created_at: ev.created_at,
          company: ev.startup?.name || 'Company',
          companyId: ev.startup?.id || 'P1'
        }));
      }
    } catch (e) {
      console.warn('[Supabase Live Feed] Fallback to local store:', e.message);
    }
  }

  // Fallback to local events store
  const localList = getStoredLiveEvents();
  return localList.filter(ev => {
    if (filter === 'APPLICATIONS') return ev.kind === 'application';
    if (filter === 'PAYMENTS') return ev.kind === 'payment';
    if (filter === 'CHECKS') return ev.kind === 'check';
    return true;
  });
};

// Realtime event subscription
export const subscribeToLiveEvents = (onNewEvent) => {
  let supabaseChannel = null;

  if (isSupabaseConfigured && supabase) {
    try {
      supabaseChannel = supabase
        .channel('public:events:live_feed')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'events' },
          async (payload) => {
            const ev = payload.new;
            let companyName = 'Company';
            if (ev.startup_id) {
              const { data } = await supabase.from('startups').select('name').eq('id', ev.startup_id).single();
              if (data?.name) companyName = data.name;
            }
            onNewEvent({
              id: ev.id,
              kind: ev.kind,
              text_plain: ev.text_plain,
              why: ev.why,
              created_at: ev.created_at,
              company: companyName,
              companyId: ev.startup_id || 'P1'
            });
          }
        )
        .subscribe();
    } catch (err) {
      console.warn('[Realtime] Subscription initialization warning:', err.message);
    }
  }

  // Also listen for cross-window / in-app events
  const handleLocalEvent = (e) => {
    if (e.detail) {
      onNewEvent(e.detail);
    }
  };
  const handleStorageEvent = (e) => {
    if (e.key === 'sih_latest_live_event' && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        if (parsed?.event) onNewEvent(parsed.event);
      } catch (err) {}
    }
  };
  window.addEventListener('sih-live-event', handleLocalEvent);
  window.addEventListener('storage', handleStorageEvent);

  return () => {
    if (supabaseChannel) {
      supabase.removeChannel(supabaseChannel);
    }
    window.removeEventListener('sih-live-event', handleLocalEvent);
    window.removeEventListener('storage', handleStorageEvent);
  };
};

// Fetch in-depth company details for Company Page
export const fetchCompanyDetails = async (idOrName) => {
  const projects = getProjects();
  
  // Find matching canonical project by ID or Company Name
  const match = projects.find(p => 
    p.id.toLowerCase() === String(idOrName).toLowerCase() ||
    p.company.toLowerCase().includes(String(idOrName).toLowerCase()) ||
    String(idOrName).toLowerCase().includes(p.id.toLowerCase())
  ) || projects[0];

  // Try fetching dynamic Supabase records if available
  let dbCompany = null;
  let dbApp = null;
  let dbMarks = [];
  let dbEvents = [];

  if (isSupabaseConfigured && supabase) {
    try {
      const { data: startupData } = await supabase
        .from('startups')
        .select('*')
        .ilike('name', `%${match.company}%`)
        .maybeSingle();

      if (startupData) {
        dbCompany = startupData;
        const { data: appData } = await supabase
          .from('applications')
          .select('*, judge_marks(*)')
          .eq('startup_id', startupData.id)
          .maybeSingle();

        if (appData) {
          dbApp = appData;
          dbMarks = appData.judge_marks || [];
        }

        const { data: evData } = await supabase
          .from('events')
          .select('*')
          .eq('startup_id', startupData.id)
          .order('created_at', { ascending: true });

        if (evData && evData.length > 0) {
          dbEvents = evData;
        }
      }
    } catch (e) {
      // Continue with canonical project fallback
    }
  }

  // 1. Header Details
  const companyName = dbCompany?.name || match.company;
  const city = dbCompany?.city || match.city;
  const field = dbCompany?.field || match.field;
  const about = dbCompany?.about || (
    match.id === 'P1' ? 'Dynamic garbage truck route planning with live GPS telemetry to cut household arrival delays.' :
    match.id === 'P2' ? 'Acoustic hydrophone telemetry sensors deployed along pipelines to detect water leakages in real time.' :
    match.id === 'P3' ? 'Edge-AI adaptive green corridor signaling to give emergency ambulances priority at red lights.' :
    match.id === 'P4' ? 'Resilient sub-zero solar microgrid battery systems keeping remote mountain health clinics powered.' :
    match.id === 'P5' ? 'IoT streetlight sensor meshes notifying municipal maintenance teams instantly of broken fixtures.' :
    'Vehicle-mounted optical road surface scanning to detect and assign pothole repair tickets.'
  );

  let statusPill = 'Running';
  if (match.stopped) statusPill = 'Stopped';
  else if (match.step === 8) statusPill = 'Done';
  else if (match.step === 3) statusPill = 'Waiting for decision';

  // 2. What was asked and what happened
  const problem = match.problem;
  const before = match.before;
  const goal = match.goal;
  const unit = match.unit;
  const now = match.now;
  const checker = match.checker;
  const checkedOn = match.checkedOn;
  const verdict = match.verdict;

  // 3. Their offer
  const proposal = dbApp?.proposal || (
    match.id === 'P1' ? 'Automated dynamic route optimization across 450 municipal collection vehicles with GPS telemetry validation.' :
    match.id === 'P2' ? 'Sub-surface acoustic hydrophone array sensor telemetry for real-time unrecorded potable water loss identification.' :
    match.id === 'P3' ? 'Edge-AI adaptive green corridor signaling prioritizing ambulances across 12 arterial intersections.' :
    match.id === 'P4' ? 'Resilient sub-zero solar microgrid battery installation across 8 high-altitude health centres.' :
    match.id === 'P5' ? 'Smart streetlight IoT mesh nodes with automated lux sensing and instantaneous fault alerts.' :
    'Camera-based pothole detection system mounted on municipal inspection patrol vans.'
  );
  const cost = dbApp?.cost || match.grant;
  const weeks = dbApp?.weeks || (match.id === 'P1' ? 12 : match.id === 'P2' ? 14 : match.id === 'P3' ? 16 : 10);
  const appliedDate = dbApp?.applied_at ? dbApp.applied_at.slice(0, 10) : (
    match.id === 'P1' ? '2026-04-20' :
    match.id === 'P2' ? '2026-06-25' :
    match.id === 'P3' ? '2026-05-20' :
    match.id === 'P4' ? '2026-08-10' :
    match.id === 'P5' ? '2026-09-28' : '2026-06-05'
  );

  // 4. Judges' marks
  const isP5Incomplete = match.id === 'P5';
  const areAllJudgesLocked = !isP5Incomplete;
  const rankText = match.id === 'P1' ? '1st of 3' : match.id === 'P2' ? '1st of 2' : match.id === 'P3' ? '2nd of 4' : '1st of 3';
  const avgScore = match.id === 'P1' ? 82 : match.id === 'P2' ? 86 : match.id === 'P3' ? 78 : match.id === 'P6' ? 71 : 80;

  const criteriaBars = [
    { name: 'New idea', score: match.id === 'P2' ? 9 : 8.5, max: 10 },
    { name: 'Will it work', score: match.id === 'P1' ? 8.5 : 8, max: 10 },
    { name: 'Safe with data', score: 8.5, max: 10 },
    { name: 'Value for money', score: 8, max: 10 },
    { name: 'Proof of past work', score: match.id === 'P2' ? 8.5 : 7.5, max: 10 }
  ];

  const judgesList = [
    { name: 'Judge 1', total: avgScore + 1, comment: 'Strong technical algorithm and viable deployment approach.' },
    { name: 'Judge 2', total: avgScore, comment: 'Realistic operational schedule for municipal teams.' },
    { name: 'Judge 3', total: avgScore - 1, comment: 'High compliance with public safety and security criteria.' }
  ];

  // 5. The full journey (Chronological: oldest first)
  const fullJourney = [
    {
      date: match.id === 'P1' ? '12 Apr 2026' : match.id === 'P2' ? '10 Jun 2026' : match.id === 'P3' ? '10 May 2026' : '15 Sep 2026',
      sentence: `Problem posted by ${match.dept}.`,
      why: `Baseline performance: ${match.before} ${match.unit}. Goal: ${match.goal} ${match.unit}.`
    },
    {
      date: appliedDate,
      sentence: `${companyName} applied for ${match.problem}.`,
      why: `Offered an outcome trial for ${formatIndianCurrency(cost)} in ${weeks} weeks.`
    },
    {
      date: match.id === 'P1' ? '02 May 2026' : match.id === 'P2' ? '05 Jul 2026' : '01 Oct 2026',
      sentence: isP5Incomplete ? 'Judges are still giving marks (2 of 3 done).' : `3 judges gave marks. Average ${avgScore}/100, ranked ${rankText}.`,
      why: isP5Incomplete ? 'Scoring open until 12 Oct 2026.' : 'Passed threshold to qualify for small trial.'
    }
  ];

  if (!isP5Incomplete) {
    fullJourney.push({
      date: match.id === 'P1' ? '05 May 2026' : match.id === 'P2' ? '15 Jul 2026' : '02 Jun 2026',
      sentence: `Officer shortlisted and offered the work to ${companyName}.`,
      why: 'Selected based on highest scoring proposal.'
    });
    fullJourney.push({
      date: match.id === 'P1' ? '08 May 2026' : match.id === 'P2' ? '20 Jul 2026' : '05 Jun 2026',
      sentence: `${companyName} accepted the offer. Contract started.`,
      why: 'Trial agreement signed and funds secured.'
    });
    fullJourney.push({
      date: match.parts[0]?.date || '12 Jun 2026',
      sentence: `${formatIndianCurrency(match.parts[0]?.amt)} paid (Part 1).`,
      why: `Paid when work started. Bank ref: ${match.parts[0]?.ref || 'UTR2606120041'}.`
    });
  }

  if (match.checkedOn && match.checker) {
    fullJourney.push({
      date: match.checkedOn,
      sentence: `Independent checker (${match.checker}) checked result: ${match.now} ${match.unit}. ${verdict === 'met' ? 'Goal met.' : verdict === 'partly' ? 'Partly met.' : 'Goal not met.'}`,
      why: `Measured against initial baseline of ${match.before} ${match.unit}.`
    });
  }

  if (match.parts[1]?.status === 'paid') {
    fullJourney.push({
      date: match.parts[1]?.date || '10 Sep 2026',
      sentence: `${formatIndianCurrency(match.parts[1]?.amt)} paid (Part 2).`,
      why: `Paid after result check. Bank ref: ${match.parts[1]?.ref}.`
    });
  } else if (match.parts[1]?.status === 'ready') {
    fullJourney.push({
      date: match.parts[1]?.readySince || '29 Sep 2026',
      sentence: `Part 2 (${formatIndianCurrency(match.parts[1]?.amt)}) is ready to pay.`,
      why: 'Waiting for officer release after independent check approval.'
    });
  } else if (match.parts[1]?.status === 'hold') {
    fullJourney.push({
      date: match.parts[1]?.holdSince || '28 Sep 2026',
      sentence: `Part 2 (${formatIndianCurrency(match.parts[1]?.amt)}) placed on hold.`,
      why: 'On hold: goal only partly met. Officer decision needed.'
    });
  } else if (match.parts[1]?.status === 'stopped') {
    fullJourney.push({
      date: '08 Sep 2026',
      sentence: `Small trial stopped for ${companyName}.`,
      why: 'Stopped because goal was not met. Remaining parts cancelled.'
    });
  }

  if (match.expand?.decision === 'approved') {
    fullJourney.push({
      date: match.expand.date || '28 Sep 2026',
      sentence: `Officer approved expanding to ${match.expand.cities?.join(', ') || 'more cities'}.`,
      why: 'Trial successfully achieved outcome goals.'
    });
  }

  // 6. Where the money went
  const parts = match.parts || [];
  const paidSoFar = parts.filter(p => p.status === 'paid').reduce((s, p) => s + p.amt, 0);
  const waitingAmt = parts.filter(p => p.status === 'ready' || p.status === 'hold').reduce((s, p) => s + p.amt, 0);
  const notStartedAmt = parts.filter(p => p.status === 'notstarted').reduce((s, p) => s + p.amt, 0);

  // 7. Documents
  const documents = [
    { name: 'Trial Outcome Verification Report.pdf', size: '2.4 MB', date: match.checkedOn || '2026-09-05' },
    { name: 'Government Small Trial Agreement.pdf', size: '1.1 MB', date: '2026-05-08' },
    { name: 'Startup Proposal & Technical Specs.pdf', size: '3.8 MB', date: appliedDate }
  ];

  return {
    id: match.id,
    company: companyName,
    city,
    field,
    about,
    registered: true,
    statusPill,
    problem,
    before,
    goal,
    unit,
    now,
    checker,
    checkedOn,
    verdict,
    proposal,
    cost,
    weeks,
    appliedDate,
    areAllJudgesLocked,
    rankText,
    avgScore,
    criteriaBars,
    judgesList,
    fullJourney,
    grant: match.grant,
    paidSoFar,
    waitingAmt,
    notStartedAmt,
    parts,
    documents
  };
};

// API: Pay a payment part (Officer only)
export const payPartApi = async (projectId, partNo, bankRef) => {
  // 1. Try Supabase RPC if online
  if (isSupabaseConfigured && supabase) {
    try {
      // Find matching part id from supabase
      const { data: partRow } = await supabase
        .from('payment_parts')
        .select('id')
        .eq('part_no', partNo)
        .limit(1)
        .maybeSingle();

      if (partRow) {
        const { data, error } = await supabase.rpc('pay_part', {
          part_id: partRow.id,
          p_bank_ref: bankRef
        });
        if (error) {
          throw new Error(error.message);
        }
      }
    } catch (e) {
      console.warn('[Supabase pay_part error, synchronizing local store]:', e.message);
      if (e.message.includes('checker has not approved') || e.message.includes('Only a department officer')) {
        throw e;
      }
    }
  }

  // 2. Synchronize local store
  localPayPart(projectId, partNo, bankRef);

  // 3. Log live event
  const project = getProjects().find(p => p.id === projectId);
  const part = project?.parts.find(p => p.n === partNo);
  const amtFormatted = formatIndianCurrency(part?.amt || 0);

  appendLiveEvent({
    id: 'ev-' + Date.now(),
    kind: 'payment',
    text_plain: `${amtFormatted} paid to ${project?.company || 'Company'} (Part ${partNo}).`,
    why: `Paid after verified result check. Bank ref: ${bankRef || 'UTR' + Date.now()}.`,
    company: project?.company || 'Company',
    companyId: projectId,
    created_at: new Date().toISOString()
  });

  return { success: true };
};

// API: Resolve a hold payment part (Officer only)
export const resolveHoldApi = async (projectId, partNo, action, customAmount, reason) => {
  if (!reason || !reason.trim()) {
    throw new Error('Please enter a plain reason for this decision.');
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data: partRow } = await supabase
        .from('payment_parts')
        .select('id')
        .eq('part_no', partNo)
        .limit(1)
        .maybeSingle();

      if (partRow) {
        const { error } = await supabase.rpc('resolve_hold', {
          part_id: partRow.id,
          p_action: action,
          p_amount: customAmount ? Number(customAmount) : null,
          p_reason: reason
        });
        if (error) throw new Error(error.message);
      }
    } catch (e) {
      console.warn('[Supabase resolve_hold fallback]:', e.message);
    }
  }

  localHoldPart(projectId, partNo, reason, action === 'pay_less' ? customAmount : null);

  const project = getProjects().find(p => p.id === projectId);
  appendLiveEvent({
    id: 'ev-' + Date.now(),
    kind: 'payment',
    text_plain: `Decision recorded for ${project?.company}: ${action === 'pay_full' ? 'Full payment approved' : action === 'pay_less' ? 'Partial payment approved' : 'Kept on hold'}.`,
    why: reason,
    company: project?.company || 'Company',
    companyId: projectId,
    created_at: new Date().toISOString()
  });

  return { success: true };
};

// API: Create new company (Startup)
export const createCompanyApi = async (data, userId) => {
  const newCompanyId = 'P-' + Math.floor(100 + Math.random() * 899);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('startups').insert({
        name: data.name,
        city: data.city,
        field: data.field,
        about: data.about,
        registered: data.registered ?? true,
        owner_id: userId
      });
    } catch (e) {
      console.warn('[Supabase create startup fallback]:', e.message);
    }
  }

  appendLiveEvent({
    id: 'ev-' + Date.now(),
    kind: 'startup',
    text_plain: `${data.name} (${data.city}) joined the platform.`,
    why: `New innovation startup in ${data.field}.`,
    company: data.name,
    companyId: newCompanyId,
    created_at: new Date().toISOString()
  });

  return { id: newCompanyId, ...data };
};

// API: Apply for a problem (Startup)
export const applyToProblemApi = async (applicationData) => {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('applications').insert({
        problem_id: applicationData.problemId,
        startup_id: applicationData.startupId,
        proposal: applicationData.proposal,
        cost: applicationData.cost,
        weeks: applicationData.weeks
      });
    } catch (e) {
      console.warn('[Supabase apply fallback]:', e.message);
    }
  }

  appendLiveEvent({
    id: 'ev-' + Date.now(),
    kind: 'application',
    text_plain: `${applicationData.companyName} applied for ${applicationData.problemTitle}.`,
    why: `Offered trial for ${formatIndianCurrency(applicationData.cost)} in ${applicationData.weeks} weeks.`,
    company: applicationData.companyName,
    companyId: applicationData.companyId || 'P5',
    created_at: new Date().toISOString()
  });

  return { success: true };
};

// API: Accept trial offer (Startup)
export const acceptOfferApi = async ({ offerId, companyId, companyName, problemTitle, grant = 1250000 }) => {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('applications').update({ status: 'accepted' }).eq('id', offerId);
      const { data: proj } = await supabase.from('projects').insert({
        company: companyName,
        problem: problemTitle,
        grant: grant,
        dept: 'Municipal Corporation',
        city: 'Indore',
        before: 60,
        goal: 20,
        unit: 'min',
        now: 60,
        step: 1
      }).select().single();

      if (proj) {
        await supabase.from('payment_parts').insert([
          { project_id: proj.id, part_no: 1, pct: 30, amt: Math.round(grant * 0.30), status: 'paid', why: 'Advance to begin work on trial sensors and setup' },
          { project_id: proj.id, part_no: 2, pct: 40, amt: Math.round(grant * 0.40), status: 'ready', why: 'Trial deployment operational' },
          { project_id: proj.id, part_no: 3, pct: 30, amt: Math.round(grant * 0.30), status: 'safe', why: 'Final audit report by independent checker' }
        ]);
      }
    } catch (e) {
      console.warn('[Supabase acceptOffer fallback]:', e.message);
    }
  }

  appendLiveEvent({
    id: 'ev-' + Date.now(),
    kind: 'application',
    text_plain: `${companyName} accepted the trial offer for ${problemTitle}.`,
    why: `Small trial started with ${formatIndianCurrency(grant)} budget across 3 payment parts (30/40/30).`,
    company: companyName,
    companyId: companyId || 'P1',
    created_at: new Date().toISOString()
  });

  return { success: true };
};

// API: Reject trial offer (Startup)
export const rejectOfferApi = async ({ offerId, companyId, companyName, problemTitle, reason }) => {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('applications').update({ status: 'rejected' }).eq('id', offerId);
    } catch (e) {
      console.warn('[Supabase rejectOffer fallback]:', e.message);
    }
  }

  appendLiveEvent({
    id: 'ev-' + Date.now(),
    kind: 'application',
    text_plain: `${companyName} declined the trial offer for ${problemTitle}.`,
    why: reason || 'Capacity constraints.',
    company: companyName,
    companyId: companyId || 'P1',
    created_at: new Date().toISOString()
  });

  return { success: true };
};
