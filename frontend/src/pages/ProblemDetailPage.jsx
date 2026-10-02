import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ApplyProposalModal } from '../components/ApplyProposalModal';
import { ProcurementJourneyTracker } from '../components/ProcurementJourneyTracker';
import { ExplainableMatchingCard } from '../components/ExplainableMatchingCard';
import { PilotEvidenceReportModal } from '../components/PilotEvidenceReportModal';
import { 
  Building2, 
  Rocket, 
  Award, 
  ChevronLeft, 
  ShieldCheck, 
  Scale, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Layers, 
  CheckCircle2, 
  ExternalLink,
  Sliders,
  Plus,
  Trash2,
  Lock,
  AlertCircle,
  FileText,
  Printer,
  Sparkles
} from 'lucide-react';

export const ProblemDetailPage = ({ problemId, setActiveTab, setSelectedTeamId }) => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  // Winner Selection & Milestone Setup Modal State (Officer Flow)
  const [setupModalApp, setSetupModalApp] = useState(null);
  const [pilotAgreementRef, setPilotAgreementRef] = useState('SBoT-2026-MH-084');
  const [milestonesInput, setMilestonesInput] = useState([
    { name: 'Phase 1: Telemetry & Baseline Sensor Integration', description: 'Install edge IoT devices in 10 vehicles and record live baseline telemetry.', percentage: 30, targetWeeks: 4 },
    { name: 'Phase 2: Live AI Route Optimization Sandbox Run', description: 'Enable dynamic dispatch routing in 25 vehicles and achieve <25% delay rate.', percentage: 40, targetWeeks: 8 },
    { name: 'Phase 3: Independent KPI Verification & Multi-District Scale Handover', description: '3rd party assessment by IIT Delhi Clean Mobility Lab and handover.', percentage: 30, targetWeeks: 12 }
  ]);
  const [setupSubmitting, setSetupSubmitting] = useState(false);
  const [setupError, setSetupError] = useState('');

  const fetchDetail = () => {
    const id = problemId || 'chal-1';
    setLoading(true);
    fetch(`/api/challenges/${id}`)
      .then(res => res.json())
      .then(resData => setData(resData))
      .catch(err => console.error('Error fetching challenge detail:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDetail();
  }, [problemId]);

  // Milestone Setup percentage sum calculation
  const totalPercentage = milestonesInput.reduce((acc, m) => acc + (Number(m.percentage) || 0), 0);

  const handleAddMilestoneRow = () => {
    setMilestonesInput(prev => [
      ...prev,
      { name: `Phase ${prev.length + 1}: Staged Deliverable`, description: 'Deliverable description...', percentage: 0, targetWeeks: 4 }
    ]);
  };

  const handleRemoveMilestoneRow = (index) => {
    if (milestonesInput.length <= 1) return;
    setMilestonesInput(prev => prev.filter((_, i) => i !== index));
  };

  const handleMilestoneFieldChange = (index, field, value) => {
    setMilestonesInput(prev => prev.map((m, i) => i === index ? { ...m, [field]: value } : m));
  };

  const handleSelectWinnerAndSetupPilot = async (e) => {
    e.preventDefault();
    if (!setupModalApp) return;

    if (totalPercentage !== 100) {
      setSetupError(`Milestone payment tranches MUST sum to exactly 100%. Current total: ${totalPercentage}%`);
      return;
    }

    setSetupSubmitting(true);
    setSetupError('');

    try {
      const res = await fetch(`/api/challenges/${setupModalApp.challengeId || problemId || 'chal-1'}/select-winner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: setupModalApp.id,
          agreementRef: pilotAgreementRef,
          officerName: user?.name || 'Dr. Sunita Verma',
          milestones: milestonesInput.map(m => ({
            title: m.name,
            name: m.name,
            description: m.description,
            paymentPercentage: Number(m.percentage),
            percentage: Number(m.percentage),
            targetWeeks: Number(m.targetWeeks)
          }))
        })
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Failed to select winner');

      setSetupModalApp(null);
      fetchDetail();

      if (resData.pilot && setSelectedTeamId) {
        setSelectedTeamId(resData.pilot.id);
        setActiveTab('workspace');
      }
    } catch (err) {
      setSetupError(err.message);
    } finally {
      setSetupSubmitting(false);
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-slate-500 text-xs font-medium">Loading challenge details...</div>;
  }

  const challenge = data?.challenge || data?.problem;
  const applications = data?.applications || data?.proposals || [];
  const evaluations = data?.evaluations || [];
  const activePilot = data?.activePilot || data?.pilot || data?.activeTeam;

  if (!challenge) {
    return (
      <div className="py-12 text-center text-slate-500 text-xs">
        Challenge not found. <button onClick={() => setActiveTab('feed')} className="text-blue-600 font-bold underline">Return to Feed</button>
      </div>
    );
  }

  const baselineKpiDisplay = challenge.baselineKpi?.value 
    ? `${challenge.baselineKpi.value}${challenge.baselineKpi.unit || '%'}: ${challenge.baselineKpi.description || challenge.baselineKpi.metric}`
    : (challenge.baselineKPI || '40% Route Delay');

  const targetKpiDisplay = challenge.targetKpi?.value 
    ? `${challenge.targetKpi.targetOperator || '<='} ${challenge.targetKpi.value}${challenge.targetKpi.unit || '%'}: ${challenge.targetKpi.description || challenge.targetKpi.metric}`
    : (challenge.targetKPI || '<= 25% Route Delay');

  return (
    <div className="space-y-8 py-4">
      
      {/* Back button options */}
      <div className="flex items-center gap-3 text-xs font-semibold">
        <button 
          onClick={() => setActiveTab('feed')}
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Outcome Challenges Feed
        </button>
      </div>

      {/* 8-Stage Procurement Lifecycle Journey Tracker */}
      {data?.journey && (
        <ProcurementJourneyTracker journey={data.journey} />
      )}

      {/* Main Challenge Card */}
      <div className="civic-card p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 bg-white dark:bg-slate-900">
        
        {/* Status badges */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center flex-wrap gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
              {challenge.sector || challenge.category}
            </span>

            {(challenge.eligibilityRules?.minTrl || challenge.targetTRL) && (
              <span className="text-xs font-bold text-purple-700 dark:text-purple-300 px-3 py-1 rounded-xl bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800">
                Target TRL {challenge.eligibilityRules?.minTrl || challenge.targetTRL}
              </span>
            )}

            {(challenge.durationWeeks || challenge.trialPeriodWeeks) && (
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" /> {challenge.durationWeeks || challenge.trialPeriodWeeks} Weeks Sandbox
              </span>
            )}
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              challenge.status === 'procured' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300' :
              activePilot ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-300' :
              'bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200'
            }`}>
              {challenge.status === 'procured' ? '✓ Scale-Up Procured (Rule 194)' : activePilot ? '⚡ SBoT Pilot In Progress' : '🟢 Open for Startup Proposals'}
            </span>

            {activePilot && (
              <button
                type="button"
                onClick={() => setReportModalOpen(true)}
                className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title="View and print official audited pilot evidence report"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Pilot Report (PDF)</span>
              </button>
            )}
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-50 leading-tight">
          {challenge.title}
        </h1>

        {/* Submitter Info Bar */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-semibold">Originating Department</span>
              <strong className="text-slate-900 dark:text-slate-50 text-sm font-bold">{challenge.departmentName}</strong>
            </div>
          </div>

          <div className="text-right">
            <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-semibold">Testbed Region</span>
            <strong className="text-slate-900 dark:text-slate-100 font-bold">{challenge.locationDistrict ? `${challenge.locationDistrict}, ` : ''}{challenge.locationState}</strong>
          </div>
        </div>

        {/* Quantifiable KPI Benchmarks Card */}
        <div className="p-5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-950 dark:text-blue-200 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-blue-600" /> Mandatory Outcome Benchmark Targets
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800">
              <span className="text-slate-500 block text-[11px]">Baseline Failure Rate (Current State):</span>
              <p className="text-sm font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">{baselineKpiDisplay}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800">
              <span className="text-emerald-700 dark:text-emerald-400 block text-[11px] font-bold">Target Pilot Benchmark (Success Threshold):</span>
              <p className="text-sm font-mono font-black text-emerald-700 dark:text-emerald-400 mt-0.5">{targetKpiDisplay}</p>
            </div>
          </div>
        </div>

        {/* Financial Grants & Sandbox Conditions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-500">Staged Pilot Grant Budget</span>
            <div className="text-xl font-black text-slate-900 dark:text-slate-50">
              ₹{(challenge.budgetAmount || challenge.pilotGrantBudget || 1250000).toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] text-slate-500">Released in strict verified milestone tranches (100%)</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-500">GFR Rule 194 Scale Ceiling</span>
            <div className="text-xl font-black text-emerald-700 dark:text-emerald-400">
              ₹{(challenge.scaleProcurementBudget || 25000000).toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] text-slate-500">Direct scale-up authorization upon pilot success</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-500">Sandbox Testbed Conditions</span>
            <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-3 leading-relaxed">
              {challenge.sandboxConditions || 'Field access across municipal ward zones with live telemetry logs.'}
            </p>
          </div>
        </div>

        {/* Description & Outcome Requirements */}
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Problem Statement & Bottleneck</h3>
            <p className="text-xs md:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
              {challenge.problemStatement || challenge.description}
            </p>
          </div>

          {challenge.outcomeRequirement && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Target Outcome Requirement</h3>
              <p className="text-xs md:text-sm text-emerald-900 dark:text-emerald-200 font-medium leading-relaxed whitespace-pre-line bg-emerald-50/60 dark:bg-emerald-950/40 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                {challenge.outcomeRequirement}
              </p>
            </div>
          )}
        </div>

        {/* Pilot Active Workspace Banner */}
        {activePilot && (
          <div className="p-5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-xs">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">Active SBoT Pilot Agreement</span>
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Awarded to {activePilot.startupName || activePilot.name} ({activePilot.dpiitNumber || 'DPIIT Startup'})
                </h4>
              </div>
            </div>

            <button
              onClick={() => {
                if (setSelectedTeamId) setSelectedTeamId(activePilot.id);
                setActiveTab('workspace');
              }}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              Open Pilot Command Center →
            </button>
          </div>
        )}

      </div>

      {/* Explainable Startup Matching Engine (Transparent Evaluation Aid) */}
      <ExplainableMatchingCard 
        challengeId={challenge.id} 
        mode="challenge" 
      />

      {/* Startup Applications & Proposals Section */}
      <div className="civic-card p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 bg-white dark:bg-slate-900">
        
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300">
              <Rocket className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                DPIIT Startup Applications ({applications.length})
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Fair eligibility proposals submitted by recognized startups
              </p>
            </div>
          </div>

          {!activePilot && user?.role === 'startup' && (
            <button
              onClick={() => setApplyModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-md shadow-blue-600/20 flex items-center gap-1.5 cursor-pointer"
            >
              + Submit Pilot Proposal
            </button>
          )}

          {user?.role === 'expert' && (
            <button
              onClick={() => setActiveTab('needs-review')}
              className="px-4 py-2 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-bold text-xs hover:bg-purple-100 flex items-center gap-1 cursor-pointer"
            >
              <Award className="w-3.5 h-3.5" /> Score on Expert Panel →
            </button>
          )}
        </div>

        {applications.length === 0 ? (
          <div className="py-10 text-center text-slate-500 text-xs">
            No startup applications submitted yet. Eligible DPIIT startups can apply above.
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map(app => {
              const isAwarded = app.status === 'awarded' || app.status === 'approved' || (activePilot && (activePilot.startupId === app.startupId || activePilot.applicationId === app.id));
              const matchingEval = evaluations.find(ev => ev.applicationId === app.id);

              return (
                <div 
                  key={app.id} 
                  className={`p-6 rounded-2xl border space-y-4 ${
                    isAwarded ? 'bg-indigo-50/50 border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-800' : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center flex-wrap gap-2">
                        <h4 className="text-base font-bold text-slate-900 dark:text-slate-50">{app.startupName || app.teamName}</h4>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          {app.dpiitNumber || 'DPIIT Registered'}
                        </span>
                        {app.trlLevel && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
                            TRL {app.trlLevel}
                          </span>
                        )}
                      </div>

                      <div className="text-xs font-bold text-blue-700 dark:text-blue-300">
                        Solution: {app.solutionTitle || 'Innovative Pilot Proposal'}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {matchingEval && (
                        <div className="px-3 py-1 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 text-xs font-bold flex items-center gap-1 border border-purple-200 dark:border-purple-800">
                          <Award className="w-3.5 h-3.5 text-purple-600" />
                          <span>Score: {matchingEval.totalScore}/100</span>
                        </div>
                      )}

                      {isAwarded ? (
                        <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-extrabold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Awarded Pilot Winner
                        </span>
                      ) : (
                        (user?.role === 'government' || user?.role === 'admin') && !activePilot && (
                          <button
                            onClick={() => setSetupModalApp(app)}
                            className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <Scale className="w-3.5 h-3.5" /> Select Winner & Setup Pilot Milestones
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    "{app.proposalText}"
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700 font-medium">
                    <div className="flex items-center gap-3">
                      <span>Lead: {app.leadName || app.leadStudentName}</span>
                      <span>•</span>
                      <span>Trial Timeline: {app.estimatedWeeks} Weeks</span>
                      <span>•</span>
                      <span>Requested: ₹{(app.requestedFunding || 750000).toLocaleString()}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      {app.demoUrl && (
                        <a href={app.demoUrl} target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                          Sandbox Demo <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {app.pitchDeckUrl && (
                        <a href={app.pitchDeckUrl} target="_blank" rel="noreferrer" className="text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1">
                          Pitch Deck <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Winner Selection & 100% Staged Milestone Configurator Modal (Officer Flow) */}
      {setupModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 overflow-hidden max-h-[90vh] overflow-y-auto shadow-2xl text-slate-900 dark:text-slate-100 space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">
                    Award Pilot & Configure 100% Staged Milestones
                  </h3>
                  <p className="text-xs text-slate-500">Startup: {setupModalApp.startupName || setupModalApp.teamName}</p>
                </div>
              </div>
              <button onClick={() => setSetupModalApp(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs">✕</button>
            </div>

            {setupError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2 border border-rose-200 dark:border-rose-800">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{setupError}</span>
              </div>
            )}

            <form onSubmit={handleSelectWinnerAndSetupPilot} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Model SBoT Pilot Agreement Reference Number *
                </label>
                <input
                  type="text"
                  required
                  value={pilotAgreementRef}
                  onChange={e => setPilotAgreementRef(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono font-bold focus:outline-none focus:border-emerald-600"
                />
              </div>

              {/* Staged Milestone Tranche Percentage Setup */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-700 dark:text-slate-300 font-bold">
                    Staged Milestone Tranches (Must strictly total 100%) *
                  </label>
                  <span className={`px-2.5 py-0.5 rounded-full font-mono text-xs font-black ${
                    totalPercentage === 100 ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}>
                    Total: {totalPercentage}% / 100% {totalPercentage === 100 ? '✓ Valid' : '⚠️ Must be 100%'}
                  </span>
                </div>

                <div className="space-y-3">
                  {milestonesInput.map((m, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          required
                          value={m.name}
                          onChange={e => handleMilestoneFieldChange(idx, 'name', e.target.value)}
                          placeholder="Phase Name"
                          className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-bold text-xs"
                        />
                        <div className="flex items-center gap-1.5 shrink-0">
                          <input
                            type="number"
                            min={1}
                            max={100}
                            required
                            value={m.percentage}
                            onChange={e => handleMilestoneFieldChange(idx, 'percentage', e.target.value)}
                            className="w-16 px-2 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono font-bold text-center text-xs"
                          />
                          <span className="font-bold">%</span>
                          {milestonesInput.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveMilestoneRow(idx)}
                              className="p-1.5 text-rose-500 hover:text-rose-700"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <input
                        type="text"
                        value={m.description}
                        onChange={e => handleMilestoneFieldChange(idx, 'description', e.target.value)}
                        placeholder="Deliverable and KPI benchmark"
                        className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-[11px]"
                      />
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleAddMilestoneRow}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Milestone Tranche
                </button>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSetupModalApp(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={setupSubmitting || totalPercentage !== 100}
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {setupSubmitting ? 'Executing Agreement...' : 'Execute Agreement & Launch Pilot'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Apply Proposal Modal */}
      {applyModalOpen && (
        <ApplyProposalModal
          problem={challenge}
          isOpen={applyModalOpen}
          onClose={() => setApplyModalOpen(false)}
          onSuccess={() => {
            fetchDetail();
          }}
        />
      )}

      {/* Pilot Evidence Report Modal */}
      <PilotEvidenceReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        pilotId={activePilot?.id || 'pilot-1'}
      />

    </div>
  );
};
