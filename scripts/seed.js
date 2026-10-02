// scripts/seed.js
// Loads the 6 canonical benchmark companies into Supabase database
// Usage: node scripts/seed.js

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../backend/.env') });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('[Seed Error] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  console.error('Please configure your .env file with:');
  console.error('SUPABASE_URL=https://xyz.supabase.co');
  console.error('SUPABASE_SERVICE_ROLE_KEY=ey...');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Fixed UUIDs for reproducibility across runs
const IDS = {
  officerUser: '00000000-0000-4000-8000-000000000001',
  startupUser1: '00000000-0000-4000-8000-000000000002',
  startupUser2: '00000000-0000-4000-8000-000000000003',
  startupUser3: '00000000-0000-4000-8000-000000000004',
  judgeUser1: '00000000-0000-4000-8000-000000000011',
  judgeUser2: '00000000-0000-4000-8000-000000000012',
  judgeUser3: '00000000-0000-4000-8000-000000000013',
  checkerUser1: '00000000-0000-4000-8000-000000000021',

  p1_company: '11111111-0000-4000-8000-000000000001',
  p2_company: '11111111-0000-4000-8000-000000000002',
  p3_company: '11111111-0000-4000-8000-000000000003',
  p4_company: '11111111-0000-4000-8000-000000000004',
  p5_company: '11111111-0000-4000-8000-000000000005',
  p6_company: '11111111-0000-4000-8000-000000000006',

  p1_problem: '22222222-0000-4000-8000-000000000001',
  p2_problem: '22222222-0000-4000-8000-000000000002',
  p3_problem: '22222222-0000-4000-8000-000000000003',
  p4_problem: '22222222-0000-4000-8000-000000000004',
  p5_problem: '22222222-0000-4000-8000-000000000005',
  p6_problem: '22222222-0000-4000-8000-000000000006',

  p1_app: '33333333-0000-4000-8000-000000000001',
  p2_app: '33333333-0000-4000-8000-000000000002',
  p3_app: '33333333-0000-4000-8000-000000000003',
  p4_app: '33333333-0000-4000-8000-000000000004',
  p5_app: '33333333-0000-4000-8000-000000000005',
  p6_app: '33333333-0000-4000-8000-000000000006',

  p1_proj: '44444444-0000-4000-8000-000000000001',
  p2_proj: '44444444-0000-4000-8000-000000000002',
  p3_proj: '44444444-0000-4000-8000-000000000003',
  p4_proj: '44444444-0000-4000-8000-000000000004',
  p6_proj: '44444444-0000-4000-8000-000000000006',
};

async function seed() {
  console.log('--- Starting SAMADHAN SETU Database Seed ---');
  console.log('Target URL:', supabaseUrl);

  // 1. Clean existing demo data
  console.log('Cleaning existing demo records...');
  await supabase.from('events').delete().eq('demo', true);
  await supabase.from('payment_parts').delete().eq('demo', true);
  await supabase.from('result_checks').delete().eq('demo', true);
  await supabase.from('projects').delete().eq('demo', true);
  await supabase.from('judge_marks').delete().eq('demo', true);
  await supabase.from('applications').delete().eq('demo', true);
  await supabase.from('problems').delete().eq('demo', true);
  await supabase.from('startups').delete().eq('demo', true);

  // 2. Seed Profiles
  console.log('Seeding profiles...');
  const profiles = [
    { id: IDS.officerUser, role: 'officer', name: 'Officer Sunita', org: 'Urban Modernization Directorate' },
    { id: IDS.startupUser1, role: 'startup', name: 'Aarav Sharma', org: 'CleanRoute Technologies' },
    { id: IDS.startupUser2, role: 'startup', name: 'Priya Nair', org: 'AquaSense Labs' },
    { id: IDS.startupUser3, role: 'startup', name: 'Kabir Mehta', org: 'SignalSetu' },
    { id: IDS.judgeUser1, role: 'expert', name: 'Judge 1', org: 'IIT Bombay Infrastructure Lab' },
    { id: IDS.judgeUser2, role: 'expert', name: 'Judge 2', org: 'IISc Urban Systems' },
    { id: IDS.judgeUser3, role: 'expert', name: 'Judge 3', org: 'Ministry Technical Panel' },
    { id: IDS.checkerUser1, role: 'checker', name: 'IIT Delhi Mobility Lab', org: 'IIT Delhi Testing Lab' }
  ];
  await supabase.from('profiles').upsert(profiles, { onConflict: 'id' });

  // 3. Seed Startups
  console.log('Seeding 6 benchmark companies...');
  const startups = [
    {
      id: IDS.p1_company,
      owner_id: IDS.startupUser1,
      name: 'CleanRoute Technologies',
      city: 'Pune',
      field: 'Smart Cities',
      about: 'Dynamic garbage truck route planning with live GPS telemetry to cut household arrival delays.',
      registered: true,
      demo: true
    },
    {
      id: IDS.p2_company,
      owner_id: IDS.startupUser2,
      name: 'AquaSense Labs',
      city: 'Bengaluru',
      field: 'Water',
      about: 'Acoustic hydrophone telemetry sensors deployed along pipelines to detect water leakages in real time.',
      registered: true,
      demo: true
    },
    {
      id: IDS.p3_company,
      owner_id: IDS.startupUser3,
      name: 'SignalSetu',
      city: 'Delhi',
      field: 'Traffic',
      about: 'Edge-AI adaptive green corridor signaling to give emergency ambulances priority at red lights.',
      registered: true,
      demo: true
    },
    {
      id: IDS.p4_company,
      name: 'SunHealth Power',
      city: 'Shimla',
      field: 'Energy',
      about: 'Resilient sub-zero solar microgrid battery systems keeping remote mountain health clinics powered.',
      registered: true,
      demo: true
    },
    {
      id: IDS.p5_company,
      name: 'LightLoop',
      city: 'Indore',
      field: 'Smart Cities',
      about: 'IoT streetlight sensor meshes notifying municipal maintenance teams instantly of broken fixtures.',
      registered: true,
      demo: true
    },
    {
      id: IDS.p6_company,
      name: 'RoadWatch AI',
      city: 'Jaipur',
      field: 'Roads',
      about: 'Vehicle-mounted optical road surface scanning to detect and assign pothole repair tickets.',
      registered: true,
      demo: true
    }
  ];
  await supabase.from('startups').upsert(startups, { onConflict: 'id' });

  // 4. Seed Problems
  console.log('Seeding problems...');
  const problems = [
    {
      id: IDS.p1_problem,
      dept: 'Pune Municipal Corporation',
      title: 'Garbage trucks reach homes late',
      plain_problem: 'Garbage trucks reach homes late causing street waste buildup.',
      unit: '% late',
      before_val: 40,
      goal_val: 25,
      grant_amount: 1250000,
      weeks: 12,
      apply_deadline: '2026-05-01',
      step: 8,
      created_by: IDS.officerUser,
      demo: true
    },
    {
      id: IDS.p2_problem,
      dept: 'Bengaluru Water Supply Board',
      title: 'Water is lost from leaking pipes',
      plain_problem: 'Over 30% of potable water is lost underground through undetected pipe leaks.',
      unit: '% lost',
      before_val: 32,
      goal_val: 15,
      grant_amount: 1800000,
      weeks: 14,
      apply_deadline: '2026-06-15',
      step: 6,
      created_by: IDS.officerUser,
      demo: true
    },
    {
      id: IDS.p3_problem,
      dept: 'Traffic Management Directorate',
      title: 'Ambulances get stuck at red lights',
      plain_problem: 'Ambulances lose critical minutes waiting at congested urban traffic junctions.',
      unit: 'minutes',
      before_val: 18,
      goal_val: 10,
      grant_amount: 1600000,
      weeks: 16,
      apply_deadline: '2026-05-15',
      step: 6,
      created_by: IDS.officerUser,
      demo: true
    },
    {
      id: IDS.p4_problem,
      dept: 'Health Department, Himachal Pradesh',
      title: 'Health centres lose power for hours',
      plain_problem: 'Remote primary healthcare centres experience blackouts stopping vaccine refrigeration.',
      unit: 'hours/day',
      before_val: 9,
      goal_val: 2,
      grant_amount: 1000000,
      weeks: 10,
      apply_deadline: '2026-08-01',
      step: 5,
      created_by: IDS.officerUser,
      demo: true
    },
    {
      id: IDS.p5_problem,
      dept: 'Indore Municipal Corporation',
      title: 'Broken streetlights take too long to fix',
      plain_problem: 'Citizens wait almost a week for municipal crews to identify and fix failed streetlights.',
      unit: 'days',
      before_val: 6,
      goal_val: 2,
      grant_amount: 800000,
      weeks: 8,
      apply_deadline: '2026-10-12',
      step: 3,
      created_by: IDS.officerUser,
      demo: true
    },
    {
      id: IDS.p6_problem,
      dept: 'Jaipur Municipal Corporation',
      title: 'Pothole complaints are fixed too slowly',
      plain_problem: 'Potholes take 30 days on average to get inspected and repaired across wards.',
      unit: 'days',
      before_val: 30,
      goal_val: 10,
      grant_amount: 700000,
      weeks: 10,
      apply_deadline: '2026-06-01',
      step: 8,
      created_by: IDS.officerUser,
      demo: true
    }
  ];
  await supabase.from('problems').upsert(problems, { onConflict: 'id' });

  // 5. Seed Applications
  console.log('Seeding applications...');
  const applications = [
    {
      id: IDS.p1_app,
      problem_id: IDS.p1_problem,
      startup_id: IDS.p1_company,
      proposal: 'Automated dynamic route optimization across 450 municipal collection vehicles with GPS telemetry validation.',
      cost: 1250000,
      weeks: 12,
      status: 'accepted',
      applied_at: '2026-04-20T10:00:00Z',
      decided_at: '2026-05-08T14:30:00Z',
      demo: true
    },
    {
      id: IDS.p2_app,
      problem_id: IDS.p2_problem,
      startup_id: IDS.p2_company,
      proposal: 'Sub-surface acoustic hydrophone array sensor telemetry for real-time unrecorded potable water loss identification.',
      cost: 1800000,
      weeks: 14,
      status: 'accepted',
      applied_at: '2026-06-25T11:00:00Z',
      decided_at: '2026-07-15T16:00:00Z',
      demo: true
    },
    {
      id: IDS.p3_app,
      problem_id: IDS.p3_problem,
      startup_id: IDS.p3_company,
      proposal: 'Edge-AI adaptive green corridor signaling prioritizing ambulances across 12 arterial intersections.',
      cost: 1600000,
      weeks: 16,
      status: 'accepted',
      applied_at: '2026-05-20T09:30:00Z',
      decided_at: '2026-06-02T12:00:00Z',
      demo: true
    },
    {
      id: IDS.p4_app,
      problem_id: IDS.p4_problem,
      startup_id: IDS.p4_company,
      proposal: 'Resilient sub-zero solar microgrid battery installation across 8 high-altitude health centres.',
      cost: 1000000,
      weeks: 10,
      status: 'accepted',
      applied_at: '2026-08-10T14:00:00Z',
      decided_at: '2026-08-28T10:00:00Z',
      demo: true
    },
    {
      id: IDS.p5_app,
      problem_id: IDS.p5_problem,
      startup_id: IDS.p5_company,
      proposal: 'Smart streetlight IoT mesh nodes with automated lux sensing and instantaneous fault alerts.',
      cost: 800000,
      weeks: 8,
      status: 'applied',
      applied_at: '2026-09-28T16:45:00Z',
      demo: true
    },
    {
      id: IDS.p6_app,
      problem_id: IDS.p6_problem,
      startup_id: IDS.p6_company,
      proposal: 'Camera-based pothole detection system mounted on municipal inspection patrol vans.',
      cost: 700000,
      weeks: 10,
      status: 'accepted',
      applied_at: '2026-06-05T10:00:00Z',
      decided_at: '2026-06-18T11:00:00Z',
      demo: true
    }
  ];
  await supabase.from('applications').upsert(applications, { onConflict: 'id' });

  // 6. Seed Judge Marks
  console.log('Seeding 3 blinded judges marks...');
  const judgeMarks = [
    // P1 CleanRoute: 3 locked judges (Rank 1st of 3, avg 82)
    { application_id: IDS.p1_app, judge_id: IDS.judgeUser1, innovation: 9, workable: 8, safety: 8, cost_value: 8, proof: 8, comment: 'Strong vehicle routing algorithms with proven driver app adoption.', locked: true, locked_at: '2026-05-02T10:00:00Z', demo: true },
    { application_id: IDS.p1_app, judge_id: IDS.judgeUser2, innovation: 8, workable: 9, safety: 8, cost_value: 8, proof: 8, comment: 'Feasible deployment timeline for municipal waste vehicles.', locked: true, locked_at: '2026-05-02T11:00:00Z', demo: true },
    { application_id: IDS.p1_app, judge_id: IDS.judgeUser3, innovation: 8, workable: 8, safety: 9, cost_value: 8, proof: 8, comment: 'High compliance with city data security standards.', locked: true, locked_at: '2026-05-02T12:00:00Z', demo: true },

    // P2 AquaSense: 3 locked judges (Rank 1st of 2, avg 86)
    { application_id: IDS.p2_app, judge_id: IDS.judgeUser1, innovation: 9, workable: 8, safety: 9, cost_value: 8, proof: 9, comment: 'Hydrophone sensors show accurate acoustic leak triangulation.', locked: true, locked_at: '2026-07-05T09:00:00Z', demo: true },
    { application_id: IDS.p2_app, judge_id: IDS.judgeUser2, innovation: 9, workable: 9, safety: 8, cost_value: 8, proof: 8, comment: 'Effective pipeline non-revenue water tracking.', locked: true, locked_at: '2026-07-05T10:00:00Z', demo: true },
    { application_id: IDS.p2_app, judge_id: IDS.judgeUser3, innovation: 8, workable: 8, safety: 9, cost_value: 9, proof: 8, comment: 'Cost-effective sensor placement model.', locked: true, locked_at: '2026-07-05T11:00:00Z', demo: true },

    // P5 LightLoop: 2 locked judges, 1 pending (to test "Judges are still giving marks (2 of 3 done)")
    { application_id: IDS.p5_app, judge_id: IDS.judgeUser1, innovation: 8, workable: 8, safety: 8, cost_value: 7, proof: 7, comment: 'Solid mesh topology for streetlight monitoring.', locked: true, locked_at: '2026-10-01T15:00:00Z', demo: true },
    { application_id: IDS.p5_app, judge_id: IDS.judgeUser2, innovation: 8, workable: 7, safety: 8, cost_value: 8, proof: 7, comment: 'Straightforward retrofit onto existing streetlight poles.', locked: true, locked_at: '2026-10-01T16:00:00Z', demo: true },
    { application_id: IDS.p5_app, judge_id: IDS.judgeUser3, innovation: 7, workable: 8, safety: 8, cost_value: 8, proof: 7, comment: 'Reviewing pilot safety documentation.', locked: false, demo: true }
  ];
  await supabase.from('judge_marks').upsert(judgeMarks, { onConflict: 'application_id,judge_id' });

  // 7. Seed Projects
  console.log('Seeding projects...');
  const projects = [
    {
      id: IDS.p1_proj,
      problem_id: IDS.p1_problem,
      application_id: IDS.p1_app,
      startup_id: IDS.p1_company,
      contract_date: '2026-05-08',
      start_date: '2026-06-05',
      end_date: '2026-09-25',
      current_value: 22,
      step: 8,
      status: 'done',
      grant_amount: 1250000,
      expand_decision: 'approved',
      expand_note: 'Approved for expansion to Nashik, Nagpur, Kolhapur.',
      demo: true
    },
    {
      id: IDS.p2_proj,
      problem_id: IDS.p2_problem,
      application_id: IDS.p2_app,
      startup_id: IDS.p2_company,
      contract_date: '2026-07-15',
      start_date: '2026-07-27',
      end_date: '2026-10-30',
      current_value: 19,
      step: 6,
      status: 'running',
      grant_amount: 1800000,
      demo: true
    },
    {
      id: IDS.p3_proj,
      problem_id: IDS.p3_problem,
      application_id: IDS.p3_app,
      startup_id: IDS.p3_company,
      contract_date: '2026-06-02',
      start_date: '2026-06-10',
      end_date: '2026-10-15',
      current_value: 12.5,
      step: 6,
      status: 'running',
      grant_amount: 1600000,
      demo: true
    },
    {
      id: IDS.p4_proj,
      problem_id: IDS.p4_problem,
      application_id: IDS.p4_app,
      startup_id: IDS.p4_company,
      contract_date: '2026-08-28',
      start_date: '2026-09-08',
      end_date: '2026-12-15',
      current_value: null,
      step: 5,
      status: 'running',
      grant_amount: 1000000,
      demo: true
    },
    {
      id: IDS.p6_proj,
      problem_id: IDS.p6_problem,
      application_id: IDS.p6_app,
      startup_id: IDS.p6_company,
      contract_date: '2026-06-18',
      start_date: '2026-06-22',
      end_date: '2026-09-08',
      current_value: 27,
      step: 8,
      status: 'stopped',
      grant_amount: 700000,
      expand_decision: 'stopped',
      expand_note: 'Photo-based complaint sorting was slow; try with ward-level crews first.',
      demo: true
    }
  ];
  await supabase.from('projects').upsert(projects, { onConflict: 'id' });

  // 8. Seed Payment Parts
  console.log('Seeding payment parts...');
  const paymentParts = [
    // P1 CleanRoute (all paid)
    { project_id: IDS.p1_proj, part_no: 1, pct: 30, amount: 375000, status: 'paid', reason: 'Paid when work started', paid_at: '2026-06-12T10:00:00Z', bank_ref: 'UTR2606120041', demo: true },
    { project_id: IDS.p1_proj, part_no: 2, pct: 40, amount: 500000, status: 'paid', reason: 'Paid after result check', paid_at: '2026-09-10T11:00:00Z', bank_ref: 'UTR2609100077', demo: true },
    { project_id: IDS.p1_proj, part_no: 3, pct: 30, amount: 375000, status: 'paid', reason: 'Paid after final report', paid_at: '2026-09-25T14:00:00Z', bank_ref: 'UTR2609250019', demo: true },

    // P2 AquaSense (Part 1 paid, Part 2 ready ₹7,20,000, Part 3 notstarted)
    { project_id: IDS.p2_proj, part_no: 1, pct: 30, amount: 540000, status: 'paid', reason: 'Paid when work started', paid_at: '2026-07-27T10:00:00Z', bank_ref: 'UTR2607270033', demo: true },
    { project_id: IDS.p2_proj, part_no: 2, pct: 40, amount: 720000, status: 'ready', reason: 'Waiting for officer to approve', ready_since: '2026-09-29T10:00:00Z', demo: true },
    { project_id: IDS.p2_proj, part_no: 3, pct: 30, amount: 540000, status: 'notstarted', reason: 'Paid after final report', demo: true },

    // P3 SignalSetu (Part 1 paid, Part 2 on hold ₹6,40,000, Part 3 notstarted)
    { project_id: IDS.p3_proj, part_no: 1, pct: 30, amount: 480000, status: 'paid', reason: 'Paid when work started', paid_at: '2026-06-10T10:00:00Z', bank_ref: 'UTR2606100052', demo: true },
    { project_id: IDS.p3_proj, part_no: 2, pct: 40, amount: 640000, status: 'hold', reason: 'On hold: goal only partly met', demo: true },
    { project_id: IDS.p3_proj, part_no: 3, pct: 30, amount: 480000, status: 'notstarted', reason: 'Paid after final report', demo: true },

    // P4 SunHealth (Part 1 paid, Parts 2 & 3 notstarted)
    { project_id: IDS.p4_proj, part_no: 1, pct: 30, amount: 300000, status: 'paid', reason: 'Paid when work started', paid_at: '2026-09-08T10:00:00Z', bank_ref: 'UTR2609080064', demo: true },
    { project_id: IDS.p4_proj, part_no: 2, pct: 40, amount: 400000, status: 'notstarted', reason: 'Paid after result check', demo: true },
    { project_id: IDS.p4_proj, part_no: 3, pct: 30, amount: 300000, status: 'notstarted', reason: 'Paid after final report', demo: true },

    // P6 RoadWatch AI (Part 1 paid, Parts 2 & 3 stopped)
    { project_id: IDS.p6_proj, part_no: 1, pct: 30, amount: 210000, status: 'paid', reason: 'Paid when work started', paid_at: '2026-06-22T10:00:00Z', bank_ref: 'UTR2606220028', demo: true },
    { project_id: IDS.p6_proj, part_no: 2, pct: 40, amount: 280000, status: 'stopped', reason: 'Stopped: goal not met', demo: true },
    { project_id: IDS.p6_proj, part_no: 3, pct: 30, amount: 210000, status: 'stopped', reason: 'Stopped: goal not met', demo: true }
  ];
  await supabase.from('payment_parts').insert(paymentParts);

  // 9. Seed Result Checks
  console.log('Seeding result checks...');
  const resultChecks = [
    { project_id: IDS.p1_proj, part_no: 2, verified_value: 22, claimed_value: 23, verdict: 'met', comment: 'Average delay reduced to 22%, surpassing the 25% target.', locked: true, submitted_at: '2026-09-05T15:00:00Z', demo: true },
    { project_id: IDS.p2_proj, part_no: 2, verified_value: 19, claimed_value: 18, verdict: 'met', comment: 'Acoustic sensing detected unrecorded leaks in 14 wards.', locked: true, submitted_at: '2026-09-29T11:00:00Z', demo: true },
    { project_id: IDS.p3_proj, part_no: 2, verified_value: 12.5, claimed_value: 11, verdict: 'partly', comment: 'Improved ambulance delay from 18 min to 12.5 min; fell short of 10 min goal.', locked: true, submitted_at: '2026-09-28T14:00:00Z', demo: true },
    { project_id: IDS.p6_proj, part_no: 2, verified_value: 27, claimed_value: 19, verdict: 'not_met', comment: 'Average repair time 27 days vs target 10 days.', locked: true, submitted_at: '2026-09-05T16:00:00Z', demo: true }
  ];
  await supabase.from('result_checks').insert(resultChecks);

  // 10. Seed Chronological Events
  console.log('Seeding historical events for live feed & company journeys...');
  const events = [
    // P1 CleanRoute Journey (oldest to newest)
    { problem_id: IDS.p1_problem, startup_id: IDS.p1_company, kind: 'problem', text_plain: 'Problem posted by Pune Municipal Corporation.', why: 'Garbage trucks were late 40% of the time.', created_at: '2026-04-12T09:00:00Z', demo: true },
    { problem_id: IDS.p1_problem, startup_id: IDS.p1_company, kind: 'application', text_plain: 'CleanRoute applied for Garbage trucks reach homes late.', why: 'They offered an AI route planner for ₹12,50,000 in 12 weeks.', created_at: '2026-04-20T10:00:00Z', demo: true },
    { problem_id: IDS.p1_problem, startup_id: IDS.p1_company, kind: 'mark', text_plain: '3 judges gave marks for CleanRoute.', why: 'Average 82/100, ranked 1st of 3.', created_at: '2026-05-02T12:00:00Z', demo: true },
    { problem_id: IDS.p1_problem, startup_id: IDS.p1_company, kind: 'offer', text_plain: 'Officer shortlisted and offered the work to CleanRoute.', why: 'Passed technical criteria and ranked top in marks.', created_at: '2026-05-05T14:00:00Z', demo: true },
    { problem_id: IDS.p1_problem, startup_id: IDS.p1_company, kind: 'contract', text_plain: 'CleanRoute accepted the offer. Contract started.', why: 'Formal pilot sandbox trial agreement signed.', created_at: '2026-05-08T14:30:00Z', demo: true },
    { problem_id: IDS.p1_problem, project_id: IDS.p1_proj, startup_id: IDS.p1_company, kind: 'trial', text_plain: 'Small trial started in Pune Wards 12 & 13.', why: 'GPS hardware and driver app installed.', created_at: '2026-06-05T09:00:00Z', demo: true },
    { project_id: IDS.p1_proj, startup_id: IDS.p1_company, kind: 'payment', text_plain: '₹3,75,000 paid to CleanRoute (Part 1).', why: 'Paid when work started. Bank ref: UTR2606120041.', created_at: '2026-06-12T10:00:00Z', demo: true },
    { project_id: IDS.p1_proj, startup_id: IDS.p1_company, kind: 'check', text_plain: 'Independent checker (IIT Delhi Mobility Lab) checked the result: 22%. Goal met.', why: 'Verified telemetry logs across 450 vehicles.', created_at: '2026-09-05T15:00:00Z', demo: true },
    { project_id: IDS.p1_proj, startup_id: IDS.p1_company, kind: 'payment', text_plain: '₹5,00,000 paid to CleanRoute (Part 2).', why: 'Paid after the result check. Bank ref: UTR2609100077.', created_at: '2026-09-10T11:00:00Z', demo: true },
    { project_id: IDS.p1_proj, startup_id: IDS.p1_company, kind: 'payment', text_plain: '₹3,75,000 paid to CleanRoute (Part 3).', why: 'Paid after final report. Bank ref: UTR2609250019.', created_at: '2026-09-25T14:00:00Z', demo: true },
    { project_id: IDS.p1_proj, startup_id: IDS.p1_company, kind: 'expand', text_plain: 'Officer approved expanding to Nashik, Nagpur, Kolhapur.', why: 'Trial reached 22% late arrivals beating the 25% target.', created_at: '2026-09-28T16:00:00Z', demo: true },

    // P2 AquaSense Journey
    { problem_id: IDS.p2_problem, startup_id: IDS.p2_company, kind: 'problem', text_plain: 'Problem posted by Bengaluru Water Supply Board.', why: '32% of potable water was lost underground.', created_at: '2026-06-10T10:00:00Z', demo: true },
    { problem_id: IDS.p2_problem, startup_id: IDS.p2_company, kind: 'application', text_plain: 'AquaSense Labs applied for Water is lost from leaking pipes.', why: 'Offered acoustic hydrophone array sensors for ₹18,00,000.', created_at: '2026-06-25T11:00:00Z', demo: true },
    { problem_id: IDS.p2_problem, startup_id: IDS.p2_company, kind: 'contract', text_plain: 'AquaSense Labs accepted trial offer. Contract started.', why: 'Testbed access approved for 14 municipal wards.', created_at: '2026-07-15T16:00:00Z', demo: true },
    { project_id: IDS.p2_proj, startup_id: IDS.p2_company, kind: 'payment', text_plain: '₹5,40,000 paid to AquaSense Labs (Part 1).', why: 'Paid when work started. Bank ref: UTR2607270033.', created_at: '2026-07-27T10:00:00Z', demo: true },
    { project_id: IDS.p2_proj, startup_id: IDS.p2_company, kind: 'check', text_plain: 'Independent checker (IISc Urban Water Lab) checked result: 19%. Goal met.', why: 'Water loss dropped from 32% to 19%, meeting testbed requirements.', created_at: '2026-09-29T11:00:00Z', demo: true },
    { project_id: IDS.p2_proj, startup_id: IDS.p2_company, kind: 'payment', text_plain: 'Part 2 (₹7,20,000) is ready to pay for AquaSense Labs.', why: 'Waiting for officer release after IISc result verification.', created_at: '2026-09-29T11:05:00Z', demo: true },

    // P3 SignalSetu Journey
    { problem_id: IDS.p3_problem, startup_id: IDS.p3_company, kind: 'problem', text_plain: 'Problem posted by Traffic Management Directorate, Delhi.', why: 'Ambulances lost 18 minutes at red lights on average.', created_at: '2026-05-10T09:00:00Z', demo: true },
    { problem_id: IDS.p3_problem, startup_id: IDS.p3_company, kind: 'application', text_plain: 'SignalSetu applied for Ambulances get stuck at red lights.', why: 'Offered edge-AI adaptive signaling for ₹16,00,000 in 16 weeks.', created_at: '2026-05-20T09:30:00Z', demo: true },
    { project_id: IDS.p3_proj, startup_id: IDS.p3_company, kind: 'payment', text_plain: '₹4,80,000 paid to SignalSetu (Part 1).', why: 'Paid when work started. Bank ref: UTR2606100052.', created_at: '2026-06-10T10:00:00Z', demo: true },
    { project_id: IDS.p3_proj, startup_id: IDS.p3_company, kind: 'check', text_plain: 'Independent checker (IIT Delhi Transport Lab) checked result: 12.5 min. Partly met.', why: 'Delay dropped from 18 min to 12.5 min; full goal was 10 min.', created_at: '2026-09-28T14:00:00Z', demo: true },
    { project_id: IDS.p3_proj, startup_id: IDS.p3_company, kind: 'payment', text_plain: 'Part 2 placed on hold for SignalSetu.', why: 'On hold: goal only partly met. Officer decision needed.', created_at: '2026-09-28T14:05:00Z', demo: true },

    // P5 LightLoop Journey
    { problem_id: IDS.p5_problem, startup_id: IDS.p5_company, kind: 'problem', text_plain: 'Problem posted by Indore Municipal Corporation.', why: 'Streetlight repairs took 6 days on average.', created_at: '2026-09-15T10:00:00Z', demo: true },
    { problem_id: IDS.p5_problem, startup_id: IDS.p5_company, kind: 'application', text_plain: 'LightLoop applied for Broken streetlights take too long to fix.', why: 'Offered IoT mesh monitoring nodes for ₹8,00,000 in 8 weeks.', created_at: '2026-09-28T16:45:00Z', demo: true },
    { problem_id: IDS.p5_problem, startup_id: IDS.p5_company, kind: 'mark', text_plain: 'Judges are giving marks for LightLoop (2 of 3 done).', why: 'Evaluation scoring active until 12 Oct 2026.', created_at: '2026-10-01T16:00:00Z', demo: true },

    // P6 RoadWatch AI Journey
    { problem_id: IDS.p6_problem, startup_id: IDS.p6_company, kind: 'problem', text_plain: 'Problem posted by Jaipur Municipal Corporation.', why: 'Pothole repair turnaround took 30 days.', created_at: '2026-05-25T11:00:00Z', demo: true },
    { project_id: IDS.p6_proj, startup_id: IDS.p6_company, kind: 'payment', text_plain: '₹2,10,000 paid to RoadWatch AI (Part 1).', why: 'Paid when work started. Bank ref: UTR2606220028.', created_at: '2026-06-22T10:00:00Z', demo: true },
    { project_id: IDS.p6_proj, startup_id: IDS.p6_company, kind: 'check', text_plain: 'Independent checker (MNIT Jaipur Civil Lab) checked result: 27 days. Not met.', why: 'Turnaround stayed at 27 days; target was 10 days.', created_at: '2026-09-05T16:00:00Z', demo: true },
    { project_id: IDS.p6_proj, startup_id: IDS.p6_company, kind: 'trial', text_plain: 'Small trial stopped for RoadWatch AI.', why: 'Trial stopped because goal was not met. Remaining funds cancelled.', created_at: '2026-09-08T11:00:00Z', demo: true }
  ];
  await supabase.from('events').insert(events);

  console.log('--- SEED COMPLETED SUCCESSFULLY! ---');
  console.log('Seeded 6 companies, 6 problems, 6 applications, 3 blinded judges, 5 projects, 15 payment parts, 4 result checks, and 23 historical events.');
}

seed().catch(err => {
  console.error('[Seed Error]:', err.message);
  process.exit(1);
});
