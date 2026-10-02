import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { 
  Sparkles, 
  Send, 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Bot, 
  TrendingUp, 
  Scale, 
  Clock, 
  DollarSign, 
  Sliders, 
  HelpCircle,
  FileText,
  Info
} from 'lucide-react';

const SubmitProblemPageInternal = ({ setActiveTab, setSelectedProblemId }) => {
  const { user } = useAuth();

  // Core Challenge Definition State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Urban Infrastructure & Cleantech');
  const [departmentName, setDepartmentName] = useState(
    user?.departmentName || 'Department of Urban Infrastructure & Smart Cities, Maharashtra'
  );
  const [locationState, setLocationState] = useState(user?.locationState || 'Maharashtra');
  const [locationDistrict, setLocationDistrict] = useState('Pune');

  // Quantifiable Outcome KPIs
  const [baselineKPI, setBaselineKPI] = useState('');
  const [targetKPI, setTargetKPI] = useState('');
  const [pilotGrantBudget, setPilotGrantBudget] = useState(750000);
  const [scaleProcurementBudget, setScaleProcurementBudget] = useState(25000000);
  const [targetTRL, setTargetTRL] = useState('7');
  const [trialPeriodWeeks, setTrialPeriodWeeks] = useState(12);
  const [sandboxConditions, setSandboxConditions] = useState(
    '25 municipal waste collection trucks operating across 4 ward zones in Pune with live telemetry logging and daily disposal manifests.'
  );

  // AI Problem Coach State
  const [coachInput, setCoachInput] = useState('');
  const [isCoaching, setIsCoaching] = useState(false);
  const [coachOutput, setCoachOutput] = useState(null);
  const [coachError, setCoachError] = useState('');
  const [coachSuccessMsg, setCoachSuccessMsg] = useState('');

  // Submission Status
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successChallenge, setSuccessChallenge] = useState(null);

  const SECTORS = [
    'Urban Infrastructure & Cleantech',
    'Water Resources & Leakage',
    'Urban Mobility & Smart Signals',
    'Renewable Energy & Microgrids',
    'Healthcare & Tele-Diagnostics',
    'Agriculture & Cold Chain',
    'Public Safety & Disaster Response'
  ];

  // Safe field render helper
  const safeRender = (val) => {
    if (val === null || val === undefined || val === '') return '—';
    if (typeof val === 'string' || typeof val === 'number') return String(val);
    if (typeof val === 'boolean') return val ? 'Yes' : 'No';
    return '—';
  };

  // AI Problem Coach Invocation
  const handleRunProblemCoach = async (presetText = null) => {
    const rawText = presetText !== null ? presetText : coachInput;
    const trimmed = (rawText || '').trim();

    if (!trimmed) {
      setCoachError('Please enter a problem description or rough notes for the AI Problem Coach.');
      return;
    }

    setIsCoaching(true);
    setCoachError('');
    setCoachSuccessMsg('');

    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: trimmed,
          departmentName,
          sector: category
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setCoachError(data.error || 'AI Problem Coach could not formulate challenge');
        return;
      }

      setCoachOutput(data);

      // Auto-fill main submission form inputs safely with primitive strings/numbers
      if (typeof data.title === 'string' && data.title !== '—') setTitle(data.title);
      if (typeof data.problem_summary === 'string' && data.problem_summary !== '—') setDescription(data.problem_summary);
      if (typeof data.baseline_kpi === 'string' && data.baseline_kpi !== '—') setBaselineKPI(data.baseline_kpi);
      if (typeof data.target_kpi === 'string' && data.target_kpi !== '—') setTargetKPI(data.target_kpi);
      if (typeof data.grant_estimate_inr === 'number' && data.grant_estimate_inr > 0) setPilotGrantBudget(data.grant_estimate_inr);
      if (typeof data.timeline_weeks === 'number' && data.timeline_weeks > 0) setTrialPeriodWeeks(data.timeline_weeks);
      if (typeof data.category === 'string') setCategory(data.category);

      setCoachSuccessMsg('✨ AI Problem Coach successfully transformed requirement into outcome-based KPIs and grant structure!');
    } catch (err) {
      setCoachError(err.message || 'Unable to connect to AI Problem Coach service. Please ensure backend is running.');
    } finally {
      setIsCoaching(false);
    }
  };

  const loadPreset = (type) => {
    setError('');
    if (type === 'waste') {
      const txt = 'We want to purchase 500 GPS tracking units for garbage trucks because our municipal collection trucks arrive late and skip bins, causing public complaints and high diesel bills.';
      setCoachInput(txt);
      setDescription(txt);
      setCategory('Urban Infrastructure & Cleantech');
      setLocationDistrict('Pune');
      handleRunProblemCoach(txt);
    } else if (type === 'water') {
      const txt = 'Our city pipeline network loses over 35% potable water to unmapped underground leaks and pipe bursts before reaching household taps.';
      setCoachInput(txt);
      setDescription(txt);
      setCategory('Water Resources & Leakage');
      setLocationDistrict('Nagpur');
      handleRunProblemCoach(txt);
    } else if (type === 'traffic') {
      const txt = 'Ambulances and emergency response vehicles are stuck in peak traffic gridlock with static timer traffic signals causing fatal transit delays.';
      setCoachInput(txt);
      setDescription(txt);
      setCategory('Urban Mobility & Smart Signals');
      setLocationDistrict('Mumbai');
      handleRunProblemCoach(txt);
    }
  };

  const handleSubmitChallenge = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Please provide a challenge title and outcome description.');
      return;
    }
    if (!baselineKPI.trim() || !targetKPI.trim()) {
      setError('Quantifiable Baseline KPI and Target KPI are required for outcome-based procurement.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
          departmentName,
          locationState,
          locationDistrict,
          baselineKPI: baselineKPI.trim(),
          targetKPI: targetKPI.trim(),
          pilotGrantBudget: Number(pilotGrantBudget),
          scaleProcurementBudget: Number(scaleProcurementBudget),
          targetTRL,
          trialPeriodWeeks: Number(trialPeriodWeeks),
          sandboxConditions: sandboxConditions.trim(),
          submitterType: user?.role === 'government' ? 'government' : 'government',
          submitterId: user?.id || 'usr-govt-1',
          submitterName: user?.name || 'Dr. Sunita Verma'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to post challenge');

      setSuccessChallenge(data.challenge);
      if (setSelectedProblemId) setSelectedProblemId(data.challenge.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (successChallenge) {
    return (
      <div className="max-w-3xl mx-auto py-12 space-y-6 animate-in fade-in">
        <div className="civic-card p-8 rounded-3xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/40 text-center space-y-4 shadow-lg">
          <div className="w-16 h-16 rounded-3xl bg-emerald-600 text-white mx-auto flex items-center justify-center shadow-md shadow-emerald-600/30">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50">
            Outcome Challenge Formulated & Published!
          </h2>
          <p className="text-xs text-slate-700 dark:text-slate-300 max-w-lg mx-auto leading-relaxed">
            Your outcome-based challenge <strong>"{successChallenge.title}"</strong> is now live on the Public Innovation Feed. DPIIT-recognized startups can now apply with pilot proposals, and empaneled expert panels can begin scoring.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                if (setSelectedProblemId) setSelectedProblemId(successChallenge.id);
                setActiveTab('detail');
              }}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              View Challenge Details & Proposals →
            </button>
            <button
              onClick={() => {
                setSuccessChallenge(null);
                setTitle('');
                setDescription('');
                setCoachOutput(null);
              }}
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 cursor-pointer"
            >
              Post Another Challenge
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8">
      
      {/* Header */}
      <div className="civic-card p-6 md:p-8 rounded-3xl border border-blue-200 dark:border-blue-900 bg-gradient-to-r from-blue-50/70 to-indigo-50/70 dark:from-blue-950/40 dark:to-indigo-950/40 space-y-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-blue-600 text-white shadow-xs">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 dark:text-slate-50">
                  Post Outcome-Based Procurement Challenge
                </h1>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  AI Problem Coach Powered
                </span>
              </div>
              <p className="text-xs text-blue-950 dark:text-blue-200 font-medium mt-0.5">
                Formulate challenges focusing on target performance outcomes rather than restrictive input specifications.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Demo Presets Bar */}
        <div className="pt-3 flex flex-wrap items-center gap-2 border-t border-blue-200/80 dark:border-blue-900">
          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Quick Formulation Presets:</span>
          <button
            type="button"
            onClick={() => loadPreset('waste')}
            className="px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition-colors cursor-pointer"
          >
            ⚡ Waste Route Optimization (CleanRoute Demo)
          </button>
          <button
            type="button"
            onClick={() => loadPreset('water')}
            className="px-3 py-1 rounded-xl bg-cyan-50 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 text-xs font-semibold hover:bg-cyan-100 transition-colors cursor-pointer"
          >
            ⚡ Pipeline Acoustic Leakage
          </button>
          <button
            type="button"
            onClick={() => loadPreset('traffic')}
            className="px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold hover:bg-indigo-100 transition-colors cursor-pointer"
          >
            ⚡ Emergency Traffic Green Corridor
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/80 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2.5 border border-rose-200 dark:border-rose-800 animate-in fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {coachSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-2.5 border border-emerald-300 dark:border-emerald-800 animate-in fade-in">
          <Sparkles className="w-5 h-5 shrink-0 text-emerald-600" />
          <span className="font-medium">{coachSuccessMsg}</span>
        </div>
      )}

      {/* AI Problem Coach Interactive Formulation Drawer / Box */}
      <ErrorBoundary>
        <div className="civic-card p-6 md:p-8 rounded-3xl border border-indigo-200 dark:border-indigo-900 bg-gradient-to-r from-indigo-50/40 to-blue-50/40 dark:from-indigo-950/30 dark:to-blue-950/30 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  AI Problem Coach (Prescriptive-to-Outcome Converter)
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Paste your rough draft or existing tender specs; the coach generates quantifiable baseline & target KPIs, grant estimates, and testing sandboxes.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <textarea
              rows={3}
              value={coachInput}
              onChange={e => {
                setCoachInput(e.target.value);
                if (coachError) setCoachError('');
              }}
              placeholder="Type departmental challenge in plain language (e.g. 'We need GPS trackers for 500 garbage trucks to stop late arrivals and fuel waste...')"
              className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-indigo-600 shadow-inner"
            ></textarea>

            {coachError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                <span className="font-semibold">{coachError}</span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleRunProblemCoach()}
                disabled={isCoaching}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${isCoaching ? 'animate-spin' : ''}`} />
                <span>{isCoaching ? 'Coach is thinking...' : '✨ Run AI Problem Coach'}</span>
              </button>
            </div>
          </div>

          {coachOutput && (
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-xs space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Formulated Outcome Architecture
                </span>
                <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-200 font-bold px-2 py-0.5 rounded">
                  Auto-Filled in Form Below
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Challenge Title</span>
                  <p className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-0.5">
                    {safeRender(coachOutput.title)}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Outcome-Based Problem Summary</span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mt-0.5">
                    {safeRender(coachOutput.problem_summary)}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-500 block">Baseline KPI</span>
                    <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                      {safeRender(coachOutput.baseline_kpi)}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 block">Target KPI</span>
                    <span className="font-mono text-xs font-bold text-emerald-800 dark:text-emerald-300 mt-0.5 block">
                      {safeRender(coachOutput.target_kpi)}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800">
                    <span className="text-[10px] font-bold text-purple-700 dark:text-purple-400 block">Timeline</span>
                    <span className="font-bold text-xs text-purple-800 dark:text-purple-300 mt-0.5 block">
                      {safeRender(coachOutput.timeline_weeks)} Weeks
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
                    <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 block">Est. Pilot Grant</span>
                    <span className="font-bold text-xs text-blue-800 dark:text-blue-300 mt-0.5 block">
                      ₹ {Number(coachOutput.grant_estimate_inr || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {coachOutput.measurement_method && (
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-500 block">Independent Verification Method</span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
                      {safeRender(coachOutput.measurement_method)}
                    </p>
                  </div>
                )}

                {(coachOutput.questions_for_officer ?? []).length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 space-y-2">
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> Follow-Up Questions for Department Officer:
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-xs text-amber-800 dark:text-amber-300/90 pl-1">
                      {(coachOutput.questions_for_officer ?? []).map((q, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {safeRender(typeof q === 'object' ? (q.question || q.text || JSON.stringify(q)) : q)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </ErrorBoundary>

      {/* Main Challenge Submission Form */}
      <form onSubmit={handleSubmitChallenge} className="civic-card p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 bg-white dark:bg-slate-900">
        
        {/* Section 1: Challenge Meta */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-blue-600" /> 1. Department & Outcome Challenge Scope
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Outcome Challenge Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Municipal Solid Waste Collection Route Optimization & Telemetry Pilot"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold text-sm focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Problem & Operational Context *
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe the systemic operational problem, field constraints, affected public stakeholders, and current failure points..."
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-blue-600 leading-relaxed"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">Domain Sector *</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-blue-600 font-semibold"
              >
                {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">State / Province *</label>
              <input
                type="text"
                required
                value={locationState}
                onChange={e => setLocationState(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">District / City *</label>
              <input
                type="text"
                required
                value={locationDistrict}
                onChange={e => setLocationDistrict(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Quantifiable KPIs (Baseline vs Target) */}
        <div className="p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-blue-600" /> 2. Quantifiable Success Metrics (Mandatory Outcome Gate)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Baseline Metric (Current Ground State) *
              </label>
              <input
                type="text"
                required
                value={baselineKPI}
                onChange={e => setBaselineKPI(e.target.value)}
                placeholder="e.g. 40% missed/delayed pickups, ₹18.4L monthly fuel overhead"
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-bold focus:outline-none focus:border-blue-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Target Success KPI (Pilot Pass Criteria) *
              </label>
              <input
                type="text"
                required
                value={targetKPI}
                onChange={e => setTargetKPI(e.target.value)}
                placeholder="e.g. < 25% collection delay rate, >= 15% diesel fuel savings"
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-bold focus:outline-none focus:border-emerald-600 text-emerald-800 dark:text-emerald-300 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Financial Structure & GFR Rule 194 Scale Ceiling */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-600" /> 3. Staged Pilot Grant & GFR Rule 194 Scaling Budget
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Staged Pilot Grant (₹ INR) *
              </label>
              <input
                type="number"
                required
                value={pilotGrantBudget}
                onChange={e => setPilotGrantBudget(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono font-bold text-xs focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Scale-Up Procurement Ceiling (₹ INR)
              </label>
              <input
                type="number"
                value={scaleProcurementBudget}
                onChange={e => setScaleProcurementBudget(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono font-bold text-xs focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Target TRL Readiness Range
              </label>
              <select
                value={targetTRL}
                onChange={e => setTargetTRL(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-blue-600 font-semibold"
              >
                <option value="4-6">TRL 4 - 6 (Early Lab & Functional Prototype)</option>
                <option value="6-8">TRL 6 - 8 (Field Demonstrated Prototype)</option>
                <option value="7-9">TRL 7 - 9 (Operational Environment Ready)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Pilot Trial Period (Weeks)
              </label>
              <input
                type="number"
                min={4}
                max={52}
                value={trialPeriodWeeks}
                onChange={e => setTrialPeriodWeeks(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold text-xs focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Sandbox Field Conditions & Testbed Access
              </label>
              <input
                type="text"
                value={sandboxConditions}
                onChange={e => setSandboxConditions(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Publishing this challenge establishes an open outcome-based sandbox pilot under Model SBoT guidelines.
          </p>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {submitting ? 'Publishing Challenge...' : 'Publish Outcome Challenge'} <Send className="w-4 h-4" />
          </button>
        </div>

      </form>

    </div>
  );
};

export const SubmitProblemPage = (props) => (
  <ErrorBoundary>
    <SubmitProblemPageInternal {...props} />
  </ErrorBoundary>
);
