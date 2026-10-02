import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  getProjects, 
  computeMetrics, 
  computeProjectPaidSoFar, 
  computeProjectWaiting,
  formatIndianCurrency, 
  getDaysWaiting,
  STEP_NAMES,
  getStepExplanation
} from '../data/projects';
import { 
  fetchLiveEvents, 
  subscribeToLiveEvents, 
  payPartApi, 
  resolveHoldApi 
} from '../services/supabaseData';
import { 
  PlusCircle, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp,
  CheckCircle2, 
  Clock, 
  AlertOctagon, 
  Check, 
  X, 
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Building2,
  Calendar,
  AlertTriangle,
  Radio,
  Filter
} from 'lucide-react';

export const GovernmentDashboardPage = ({ 
  setActiveTab, 
  setSelectedProblemId, 
  setSelectedTeamId,
  setSelectedCompanyId 
}) => {
  const { user } = useAuth();
  const [projectsList, setProjectsList] = useState(getProjects());
  const [activeFilter, setActiveFilter] = useState('ALL'); // ALL | NEEDS_ME | RUNNING | DONE | STOPPED
  const [expandedId, setExpandedId] = useState(null);

  // Live Updates Stream State
  const [liveEvents, setLiveEvents] = useState([]);
  const [eventFilter, setEventFilter] = useState('ALL'); // ALL | APPLICATIONS | PAYMENTS | CHECKS
  const [highlightedEventId, setHighlightedEventId] = useState(null);
  const [isFeedConnected, setIsFeedConnected] = useState(true);

  // Officer Payment Side Panel State
  const [payModalProject, setPayModalProject] = useState(null);
  const [payModalPart, setPayModalPart] = useState(null);
  const [payBankRef, setPayBankRef] = useState('');
  const [payError, setPayError] = useState('');
  const [isPaying, setIsPaying] = useState(false);

  // Partial Hold Decision Modal
  const [holdDecisionProject, setHoldDecisionProject] = useState(null);
  const [holdDecisionPart, setHoldDecisionPart] = useState(null);
  const [holdActionType, setHoldActionType] = useState('full');
  const [customHoldAmt, setCustomHoldAmt] = useState('');
  const [customHoldReason, setCustomHoldReason] = useState('');
  const [isSavingHold, setIsSavingHold] = useState(false);

  // Toast confirmation
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Helper: Relative time formatter
  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return 'Just now';
    const diffMs = Date.now() - new Date(dateStr).getTime();
    if (diffMs < 0) return 'Just now';
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} min ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr} hr ago`;
    const diffDays = Math.floor(diffHr / 24);
    return `${diffDays} days ago`;
  };

  // Load initial events & refresh projects
  const refreshData = async () => {
    setProjectsList(getProjects());
    const evs = await fetchLiveEvents(eventFilter);
    setLiveEvents(evs);
  };

  useEffect(() => {
    refreshData();

    // Subscribe to live events (Supabase Realtime + cross-tab custom events)
    const unsubscribe = subscribeToLiveEvents((newEvent) => {
      setLiveEvents(prev => [newEvent, ...prev.filter(e => e.id !== newEvent.id)]);
      // 3-second highlight glow on new event
      setHighlightedEventId(newEvent.id);
      setTimeout(() => setHighlightedEventId(null), 3000);
      setProjectsList(getProjects());
    });

    const handleUpdate = () => {
      setProjectsList(getProjects());
    };
    window.addEventListener('sih-projects-update', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      unsubscribe();
      window.removeEventListener('sih-projects-update', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Re-fetch events when filter chip changes
  useEffect(() => {
    fetchLiveEvents(eventFilter).then(evs => setLiveEvents(evs));
  }, [eventFilter]);

  // Navigate to Company Page
  const handleOpenCompany = (companyId) => {
    if (setSelectedCompanyId) {
      setSelectedCompanyId(companyId);
    }
    setActiveTab('company');
  };

  const CANONICAL_PILOT_MAP = {
    P1: { pilotId: 'pilot-1', challengeId: 'chal-1' },
    P2: { pilotId: 'pilot-2', challengeId: 'chal-2' },
    P3: { pilotId: 'pilot-3', challengeId: 'chal-3' },
    P4: { pilotId: 'pilot-4', challengeId: 'chal-4' },
    P5: { pilotId: 'chal-5', challengeId: 'chal-5' },
    P6: { pilotId: 'pilot-6', challengeId: 'chal-6' }
  };

  const handleOpenPilotCommandCenter = (projectId) => {
    const mapped = CANONICAL_PILOT_MAP[projectId] || { pilotId: projectId, challengeId: 'chal-1' };
    if (setSelectedTeamId) setSelectedTeamId(mapped.pilotId);
    if (setSelectedProblemId) setSelectedProblemId(mapped.challengeId);
    if (setSelectedCompanyId) setSelectedCompanyId(projectId);
    setActiveTab(`workspace/${mapped.pilotId}`);
  };

  // 4 plain number cards
  const metrics = computeMetrics(projectsList);

  // Generate "What needs you today" rows
  const needsYouRows = [];
  projectsList.forEach(p => {
    if (p.stopped) return;

    p.parts.forEach(part => {
      if (part.status === 'ready') {
        needsYouRows.push({
          id: `ready-${p.id}-${part.n}`,
          projectId: p.id,
          project: p,
          part: part,
          type: 'ready',
          company: p.company,
          text: `Pay ${p.company} ${formatIndianCurrency(part.amt)} (checked by ${p.checker || 'independent checker'})`,
          buttonLabel: 'Review & pay',
          priority: 1
        });
      }
      if (part.status === 'hold') {
        needsYouRows.push({
          id: `hold-${p.id}-${part.n}`,
          projectId: p.id,
          project: p,
          part: part,
          type: 'hold',
          company: p.company,
          text: `Decide on ${p.company}: goal only partly met`,
          buttonLabel: 'Decide',
          priority: 2
        });
      }
    });

    if (p.step === 8 && !p.expand && !p.stopped) {
      needsYouRows.push({
        id: `expand-${p.id}`,
        projectId: p.id,
        project: p,
        type: 'expand',
        company: p.company,
        text: `Decide if ${p.company} should expand to more cities`,
        buttonLabel: 'Decide',
        priority: 3
      });
    }

    if (p.step === 3 && p.applicants > 0) {
      needsYouRows.push({
        id: `step3-${p.id}`,
        projectId: p.id,
        project: p,
        type: 'view_experts',
        company: p.company,
        text: `${p.applicants} startups applied for ${p.problem}; experts finish by ${p.expertDeadline || '12 Oct 2026'}`,
        buttonLabel: 'View',
        isSecondary: true,
        priority: 4
      });
    }
  });

  needsYouRows.sort((a, b) => a.priority - b.priority);
  const visibleNeedsYou = needsYouRows.slice(0, 3);

  // Filter projects for Section D
  const filteredProjects = projectsList.filter(p => {
    if (activeFilter === 'NEEDS_ME') {
      const hasReady = p.parts.some(pt => pt.status === 'ready' || pt.status === 'hold');
      const hasExpand = p.step === 8 && !p.expand && !p.stopped;
      return hasReady || hasExpand;
    }
    if (activeFilter === 'RUNNING') {
      return (p.step >= 4 && p.step <= 6) && !p.stopped;
    }
    if (activeFilter === 'DONE') {
      return p.step === 8 && !p.stopped;
    }
    if (activeFilter === 'STOPPED') {
      return p.stopped === true;
    }
    return true;
  });

  // Action Handlers
  const handleOpenPayModal = (project, part) => {
    setPayModalProject(project);
    setPayModalPart(part);
    setPayBankRef(`UTR2610${Math.floor(100000 + Math.random() * 899999)}`);
    setPayError('');
  };

  const handleConfirmPayment = async () => {
    if (!payModalProject || !payModalPart) return;
    setIsPaying(true);
    setPayError('');
    try {
      await payPartApi(payModalProject.id, payModalPart.n, payBankRef.trim());
      showToast(`Payment of ${formatIndianCurrency(payModalPart.amt)} released to ${payModalProject.company}.`);
      setPayModalProject(null);
      setPayModalPart(null);
      await refreshData();
    } catch (err) {
      setPayError(err.message || 'Payment could not be processed.');
    } finally {
      setIsPaying(false);
    }
  };

  const handleOpenHoldDecision = (project, part) => {
    setHoldDecisionProject(project);
    setHoldDecisionPart(part);
    setHoldActionType('full');
    setCustomHoldAmt(String(part.amt * 0.75));
    setCustomHoldReason('');
  };

  const handleConfirmHoldDecision = async () => {
    if (!holdDecisionProject || !holdDecisionPart) return;
    if (!customHoldReason.trim()) {
      alert('Please enter a plain reason for this decision.');
      return;
    }
    setIsSavingHold(true);
    try {
      await resolveHoldApi(
        holdDecisionProject.id, 
        holdDecisionPart.n, 
        holdActionType === 'full' ? 'pay_full' : holdActionType === 'smaller' ? 'pay_less' : 'keep_hold',
        customHoldAmt,
        customHoldReason
      );
      showToast('Decision recorded successfully.');
      setHoldDecisionProject(null);
      setHoldDecisionPart(null);
      await refreshData();
    } catch (err) {
      alert(err.message || 'Error recording decision.');
    } finally {
      setIsSavingHold(false);
    }
  };

  return (
    <div className="space-y-8 pb-16 font-sans bg-slate-50 dark:bg-[#0b0f19] min-h-screen -m-4 p-8 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-slate-800 text-white text-xs px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ====================================================================== */}
      {/* SECTION A: Greeting + One Caption + One Blue Button "+ Add a problem" */}
      {/* ====================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Good morning, {user?.name || 'Officer Sunita'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Here is what is happening with your department's trials and payments.
          </p>
        </div>

        <div>
          <button
            onClick={() => setActiveTab('submit')}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            + Add a problem
          </button>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* SECTION B & LIVE FEED: "What needs you today" & "Live updates" */}
      {/* ====================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: What needs you today (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  What needs you today
                </h2>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {visibleNeedsYou.length > 0 ? `${visibleNeedsYou.length} items requiring attention` : 'All caught up'}
              </span>
            </div>

            {visibleNeedsYou.length === 0 ? (
              <div className="py-8 flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400 text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>You are all caught up. No urgent actions waiting.</span>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {visibleNeedsYou.map((item) => (
                  <div 
                    key={item.id} 
                    className="py-3.5 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="mt-0.5 sm:mt-0 w-2 h-2 rounded-full bg-amber-500 shrink-0"></div>
                      <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">
                        {item.type === 'ready' ? (
                          <span>
                            Pay <button onClick={() => handleOpenCompany(item.projectId)} className="font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 underline cursor-pointer">{item.company}</button> {formatIndianCurrency(item.part.amt)} (checked by {item.project.checker || 'independent checker'})
                          </span>
                        ) : item.type === 'hold' ? (
                          <span>
                            Decide on <button onClick={() => handleOpenCompany(item.projectId)} className="font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 underline cursor-pointer">{item.company}</button>: goal only partly met
                          </span>
                        ) : (
                          item.text
                        )}
                      </p>
                    </div>

                    <div className="shrink-0 self-end sm:self-auto flex items-center gap-2">
                      <button
                        onClick={() => handleOpenPilotCommandCenter(item.projectId)}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold px-2.5 py-1 rounded hover:bg-blue-50 dark:hover:bg-slate-800 transition cursor-pointer"
                      >
                        Command Center →
                      </button>

                      {item.type === 'ready' && (
                        <button
                          onClick={() => handleOpenPayModal(item.project, item.part)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-3.5 py-1.5 rounded-lg shadow-sm transition cursor-pointer"
                        >
                          {item.buttonLabel}
                        </button>
                      )}

                      {item.type === 'hold' && (
                        <button
                          onClick={() => handleOpenHoldDecision(item.project, item.part)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-3.5 py-1.5 rounded-lg shadow-sm transition cursor-pointer"
                        >
                          {item.buttonLabel}
                        </button>
                      )}

                      {item.type === 'view_experts' && (
                        <button
                          onClick={() => {
                            setExpandedId(item.projectId);
                            const el = document.getElementById(`project-${item.projectId}`);
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-xs px-3.5 py-1.5 rounded-lg transition cursor-pointer"
                        >
                          {item.buttonLabel}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: SECTION 5 LIVE UPDATES PANEL (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Live updates
                </h2>
              </div>

              {/* Filter Chips */}
              <div className="flex items-center gap-1 text-[10px]">
                {['ALL', 'APPLICATIONS', 'PAYMENTS', 'CHECKS'].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => setEventFilter(chip)}
                    className={`px-2 py-0.5 rounded transition cursor-pointer ${
                      eventFilter === chip 
                        ? 'bg-blue-600 text-white font-bold' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {chip === 'ALL' ? 'All' : chip === 'APPLICATIONS' ? 'Applications' : chip === 'PAYMENTS' ? 'Payments' : 'Checks'}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Events Stream */}
            <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
              {liveEvents.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                  No updates yet. Actions will appear in real time.
                </div>
              ) : (
                liveEvents.map((ev) => {
                  const isHighlighted = highlightedEventId === ev.id;
                  
                  // Coloured dot by kind
                  let dotColor = 'bg-blue-500';
                  if (ev.kind === 'payment') dotColor = 'bg-emerald-500';
                  else if (ev.kind === 'check') dotColor = 'bg-amber-500';
                  else if (ev.kind === 'trial' || ev.kind === 'expand') dotColor = 'bg-purple-500';

                  return (
                    <div 
                      key={ev.id}
                      className={`p-2.5 rounded-lg border transition-all duration-500 text-xs space-y-0.5 ${
                        isHighlighted 
                          ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700 ring-2 ring-blue-300 dark:ring-blue-800 shadow-sm' 
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 truncate">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`}></span>
                          <button
                            onClick={() => handleOpenCompany(ev.companyId || 'P1')}
                            className="font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 hover:underline truncate cursor-pointer"
                          >
                            {ev.company}
                          </button>
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 shrink-0">
                          {formatRelativeTime(ev.created_at)}
                        </span>
                      </div>
                      
                      <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-tight pl-4">
                        {ev.text_plain}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-2 text-[10px] text-slate-500 dark:text-slate-400 text-right flex items-center justify-end gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Realtime database connected
          </div>
        </div>

      </div>

      {/* ====================================================================== */}
      {/* SECTION C: Four Plain Number Cards */}
      {/* ====================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Problems open */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Problems open
          </span>
          <span className="text-3xl font-bold text-slate-900 dark:text-white mt-2 block">
            {metrics.problemsOpen}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            Drafted or taking startup applications
          </span>
        </div>

        {/* Card 2: Experts giving marks */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Experts giving marks
          </span>
          <span className="text-3xl font-bold text-slate-900 dark:text-white mt-2 block">
            {metrics.expertsGrading}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            Proposals currently being scored
          </span>
        </div>

        {/* Card 3: Trials running */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Trials running
          </span>
          <span className="text-3xl font-bold text-slate-900 dark:text-white mt-2 block">
            {metrics.trialsRunning}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            Active trials testing in the field
          </span>
        </div>

        {/* Card 4: Money waiting for you */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Money waiting for you
          </span>
          <span className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-2 block">
            {formatIndianCurrency(metrics.moneyWaiting)}
          </span>
          <span className="text-xs text-amber-700 dark:text-amber-300 mt-1 block">
            Ready to pay or on hold
          </span>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* SECTION D & E: "All projects" List & Expandable Project Cards */}
      {/* ====================================================================== */}
      <div className="space-y-4">
        
        {/* Header & Filter Chips */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">All projects</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click any project to see its goals, results, and full money trail. Click company name to view profile.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'ALL', label: 'All', count: projectsList.length },
              { id: 'NEEDS_ME', label: 'Needs me', count: projectsList.filter(p => p.parts.some(pt => pt.status === 'ready' || pt.status === 'hold') || (p.step === 8 && !p.expand && !p.stopped)).length },
              { id: 'RUNNING', label: 'Running', count: projectsList.filter(p => (p.step >= 4 && p.step <= 6) && !p.stopped).length },
              { id: 'DONE', label: 'Done', count: projectsList.filter(p => p.step === 8 && !p.stopped).length },
              { id: 'STOPPED', label: 'Stopped', count: projectsList.filter(p => p.stopped).length }
            ].map(chip => (
              <button
                key={chip.id}
                onClick={() => setActiveFilter(chip.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                  activeFilter === chip.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {chip.label} ({chip.count})
              </button>
            ))}
          </div>
        </div>

        {/* Project Cards List */}
        <div className="space-y-4">
          {filteredProjects.map((p) => {
            const isExpanded = expandedId === p.id;
            const paidSoFar = computeProjectPaidSoFar(p);
            const stepSentence = getStepExplanation(p.step, p);

            let statusPill = null;
            if (p.stopped) {
              statusPill = (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FEF2F2] dark:bg-rose-950/60 text-[#DC2626] dark:text-rose-400 border border-rose-200 dark:border-rose-900 inline-flex items-center gap-1">
                  <AlertOctagon className="w-3 h-3" /> Stopped
                </span>
              );
            } else if (p.step === 8 && p.expand?.decision === 'approved') {
              statusPill = (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#ECFDF3] dark:bg-emerald-950/60 text-[#16A34A] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> All done
                </span>
              );
            } else if (p.parts.some(pt => pt.status === 'ready')) {
              statusPill = (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FFF7E6] dark:bg-amber-950/60 text-[#D97706] dark:text-amber-400 border border-amber-200 dark:border-amber-900 inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Ready to pay
                </span>
              );
            } else if (p.parts.some(pt => pt.status === 'hold')) {
              statusPill = (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FFF7E6] dark:bg-amber-950/60 text-[#D97706] dark:text-amber-400 border border-amber-200 dark:border-amber-900 inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" /> On hold
                </span>
              );
            } else {
              statusPill = (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                  Small trial running
                </span>
              );
            }

            return (
              <div 
                id={`project-${p.id}`}
                key={p.id}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all overflow-hidden"
              >
                {/* Header / Summary Row */}
                <div 
                  onClick={() => setExpandedId(isExpanded ? null : p.id)}
                  className="p-6 cursor-pointer select-none space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      {/* Company Name as Link to Company Page */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenCompany(p.id);
                        }}
                        className="text-base font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 hover:underline text-left cursor-pointer"
                      >
                        {p.company}
                      </button>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                        {p.city} • {p.dept}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenPilotCommandCenter(p.id);
                        }}
                        className="bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 font-bold text-xs px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800 transition flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        {p.id === 'P5' ? 'Review Proposals →' : 'Command Center →'}
                      </button>
                      {statusPill}
                      <div className="text-right hidden sm:block">
                        <span className="text-xs text-slate-500 dark:text-slate-400 block">Paid so far</span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {formatIndianCurrency(paidSoFar)} / {formatIndianCurrency(p.grant)}
                        </span>
                      </div>
                      <div className="text-slate-400 dark:text-slate-500">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">Problem: </span> 
                    {p.problem}
                  </p>

                  {/* Horizontal 8-Step Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="grid grid-cols-8 gap-1.5">
                      {STEP_NAMES.map((name, index) => {
                        const stepNum = index + 1;
                        const isCurrent = p.step === stepNum && !p.stopped;
                        const isPast = p.step > stepNum || (p.step === 8 && stepNum === 8);
                        
                        let barBg = 'bg-slate-100 dark:bg-slate-800';
                        if (p.stopped) {
                          barBg = stepNum <= p.step ? 'bg-rose-200 dark:bg-rose-900' : 'bg-slate-100 dark:bg-slate-800';
                        } else if (isCurrent) {
                          barBg = 'bg-blue-600 shadow-xs';
                        } else if (isPast) {
                          barBg = 'bg-emerald-500';
                        }

                        return (
                          <div key={index} className="flex flex-col gap-1">
                            <div className={`h-1.5 rounded-full ${barBg} transition-colors`} />
                            <span className={`text-[10px] truncate ${isCurrent ? 'font-bold text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 hidden lg:block'}`}>
                              {name}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="text-xs text-slate-500 dark:text-slate-400 pt-1 flex items-center justify-between">
                      <span>{stepSentence}</span>
                      <span className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline">
                        {isExpanded ? 'Click to close details' : 'Click to see details & money trail →'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* EXPANDED PROJECT VIEW: 5 BLOCKS */}
                {isExpanded && (
                  <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-6 space-y-6 animate-in fade-in-50 duration-150">
                    
                    {/* Grid of Blocks 1, 2, 3 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                       {/* Block 1 */}
                      <div className="bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-xs">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                          Block 1: What was the goal?
                        </span>
                        <div className="mt-3 flex items-center gap-3">
                          <div>
                            <span className="text-[11px] text-slate-400 dark:text-slate-500 block">Before</span>
                            <span className="text-base font-bold text-slate-800 dark:text-slate-200">
                              {p.before} {p.unit}
                            </span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 mt-3" />
                          <div>
                            <span className="text-[11px] text-slate-400 dark:text-slate-500 block">Goal</span>
                            <span className="text-base font-bold text-blue-600 dark:text-blue-400">
                              {p.goal} {p.unit}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                          Goal set under government buying rule for small trials.
                        </p>
                      </div>

                      {/* Block 2 */}
                      <div className="bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-xs">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                          Block 2: What happened?
                        </span>
                        <div className="mt-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-500 dark:text-slate-400">Measured result:</span>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {p.now !== null ? `${p.now} ${p.unit}` : 'Testing in progress'}
                            </span>
                          </div>
                          
                          {p.now !== null && (
                            <div className="mt-2 space-y-1">
                              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden flex">
                                <div 
                                  className={`h-full ${p.verdict === 'met' ? 'bg-emerald-500' : p.verdict === 'partly' ? 'bg-amber-500' : 'bg-rose-500'}`}
                                  style={{ width: `${Math.min(100, Math.max(10, ((p.before - p.now) / (p.before - p.goal)) * 100))}%` }}
                                />
                              </div>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                                {p.verdict === 'met' && 'Goal was fully achieved in the trial.'}
                                {p.verdict === 'partly' && 'Improved from before, but did not hit the full goal.'}
                                {p.verdict === 'notmet' && 'Did not meet the required improvement.'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Block 3 */}
                      <div className="bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-xs">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                          Block 3: Who checked it?
                        </span>
                        <div className="mt-3 space-y-2">
                          <div className="text-xs">
                            <span className="text-slate-400 dark:text-slate-500 block">Independent checker</span>
                            <span className="font-semibold text-slate-900 dark:text-white block">
                              {p.checker || 'Not assigned yet'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs pt-1">
                            <div>
                              <span className="text-slate-400 dark:text-slate-500 block">Checked on</span>
                              <span className="font-medium text-slate-700 dark:text-slate-300">
                                {p.checkedOn || 'Pending test'}
                              </span>
                            </div>

                            <div>
                              <span className="text-slate-400 dark:text-slate-500 block">Verdict</span>
                              {p.verdict === 'met' && (
                                <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Goal met
                                </span>
                              )}
                              {p.verdict === 'partly' && (
                                <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 font-semibold">
                                  <Clock className="w-3.5 h-3.5" /> Partly met
                                </span>
                              )}
                              {p.verdict === 'notmet' && (
                                <span className="inline-flex items-center gap-1 text-rose-700 dark:text-rose-400 font-semibold">
                                  <AlertOctagon className="w-3.5 h-3.5" /> Not met
                                </span>
                              )}
                              {p.verdict === 'notchecked' && (
                                <span className="text-slate-400 dark:text-slate-500">Not checked yet</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Block 4: Where did the money go? */}
                    <div className="bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-xs space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                            Block 4: Where did the money go?
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Money kept safe and released only after verified results.
                          </p>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                          <div>
                            <span className="text-slate-400 dark:text-slate-500">Total grant: </span>
                            <span className="font-bold text-slate-900 dark:text-white">{formatIndianCurrency(p.grant)}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 dark:text-slate-500">Paid so far: </span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatIndianCurrency(paidSoFar)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 relative before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
                        {p.parts.map((part) => {
                          const lateDays = part.readySince ? getDaysWaiting(part.readySince) : 0;
                          const isLate = part.status === 'ready' && lateDays > 7;

                          return (
                            <div key={part.n} className="flex items-start gap-4 relative">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                {part.status === 'paid' && (
                                  <div className="w-6 h-6 rounded-full bg-[#ECFDF3] dark:bg-emerald-950/80 text-[#16A34A] dark:text-emerald-400 flex items-center justify-center">
                                    <Check className="w-3.5 h-3.5" />
                                  </div>
                                )}
                                {part.status === 'ready' && (
                                  <div className="w-6 h-6 rounded-full bg-[#FFF7E6] dark:bg-amber-950/80 text-[#D97706] dark:text-amber-400 flex items-center justify-center">
                                    <Clock className="w-3.5 h-3.5" />
                                  </div>
                                )}
                                {part.status === 'hold' && (
                                  <div className="w-6 h-6 rounded-full bg-[#FFF7E6] dark:bg-amber-950/80 text-[#D97706] dark:text-amber-400 flex items-center justify-center">
                                    <Clock className="w-3.5 h-3.5" />
                                  </div>
                                )}
                                {part.status === 'stopped' && (
                                  <div className="w-6 h-6 rounded-full bg-[#FEF2F2] dark:bg-rose-950/80 text-[#DC2626] dark:text-rose-400 flex items-center justify-center">
                                    <X className="w-3.5 h-3.5" />
                                  </div>
                                )}
                                {part.status === 'notstarted' && (
                                  <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-300 flex items-center justify-center text-xs">
                                    {part.n}
                                  </div>
                                )}
                              </div>

                              <div className="flex-1 bg-slate-50 dark:bg-slate-900/80 rounded-lg p-3 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                                      Part {part.n} ({part.pct}%): {formatIndianCurrency(part.amt)}
                                    </span>
                                    
                                    {part.status === 'paid' && (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#ECFDF3] dark:bg-emerald-950/60 text-[#16A34A] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                                        Paid
                                      </span>
                                    )}
                                    {part.status === 'ready' && (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FFF7E6] dark:bg-amber-950/60 text-[#D97706] dark:text-amber-400 border border-amber-200 dark:border-amber-900">
                                        Ready to pay
                                      </span>
                                    )}
                                    {part.status === 'hold' && (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FFF7E6] dark:bg-amber-950/60 text-[#D97706] dark:text-amber-400 border border-amber-200 dark:border-amber-900">
                                        On hold
                                      </span>
                                    )}
                                    {part.status === 'stopped' && (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FEF2F2] dark:bg-rose-950/60 text-[#DC2626] dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                                        Stopped
                                      </span>
                                    )}
                                    {part.status === 'notstarted' && (
                                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                        Not started
                                      </span>
                                    )}

                                    {isLate && (
                                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEF2F2] dark:bg-rose-950 text-[#DC2626] dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                                        Late: {lateDays} days
                                      </span>
                                    )}
                                  </div>

                                  <p className="text-xs text-slate-600 dark:text-slate-300">{part.why}</p>

                                  <div className="text-[11px] text-slate-400 dark:text-slate-500">
                                    {part.status === 'paid' && (
                                      <span>
                                        Paid on {part.date} • <span className="font-mono text-slate-600 dark:text-slate-300">Bank ref: {part.ref}</span>
                                      </span>
                                    )}
                                    {part.status === 'ready' && (
                                      <span className="text-amber-700 dark:text-amber-400">
                                        Waiting for officer to approve since {part.readySince}
                                      </span>
                                    )}
                                    {part.status === 'hold' && (
                                      <span className="text-amber-700 dark:text-amber-400">
                                        Officer decision needed (on hold since {part.holdSince})
                                      </span>
                                    )}
                                    {part.status === 'stopped' && (
                                      <span className="text-slate-400 dark:text-slate-500">
                                        Remaining funds cancelled under government buying rules
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div>
                                  {part.status === 'ready' && (
                                    <button
                                      onClick={() => handleOpenPayModal(p, part)}
                                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-3.5 py-1.5 rounded-lg shadow-sm transition cursor-pointer"
                                    >
                                      Pay now
                                    </button>
                                  )}
                                  {part.status === 'hold' && (
                                    <button
                                      onClick={() => handleOpenHoldDecision(p, part)}
                                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-3.5 py-1.5 rounded-lg shadow-sm transition cursor-pointer"
                                    >
                                      Review hold
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Block 5: What next? */}
                    <div className="bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                          Block 5: What next?
                        </span>
                        <p className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white mt-1">
                          {p.stopped && 'Small trial was stopped. No further action needed.'}
                          {!p.stopped && p.step === 8 && p.expand?.decision === 'approved' && (
                            `Small trial finished successfully. Rollout approved for ${p.expand.cities?.join(', ') || 'more cities'}.`
                          )}
                          {!p.stopped && p.step === 6 && p.parts.some(pt => pt.status === 'ready') && (
                            'The independent checker confirmed the goal was met. Review and pay Part 2.'
                          )}
                          {!p.stopped && p.step === 6 && p.parts.some(pt => pt.status === 'hold') && (
                            'The goal was only partly met. Officer must decide payment terms.'
                          )}
                          {!p.stopped && p.step === 5 && (
                            'Small trial is running in the field. Field verification scheduled next.'
                          )}
                          {!p.stopped && p.step === 3 && (
                            'Experts are marking startup proposals. Selection announcement follows.'
                          )}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                        {p.step === 6 && p.parts.some(pt => pt.status === 'ready') && (
                          <button
                            onClick={() => {
                              const rPart = p.parts.find(pt => pt.status === 'ready');
                              if (rPart) handleOpenPayModal(p, rPart);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-4 py-2 rounded-lg shadow-sm transition cursor-pointer"
                          >
                            Review & pay {formatIndianCurrency(p.parts.find(pt => pt.status === 'ready')?.amt)}
                          </button>
                        )}

                        <button 
                          onClick={() => handleOpenPilotCommandCenter(p.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-3.5 py-1.5 rounded-lg shadow-sm transition cursor-pointer"
                        >
                          {p.id === 'P5' ? 'Open Application & Scoring Center →' : 'Open Pilot Command Center →'}
                        </button>

                        <button 
                          onClick={() => handleOpenCompany(p.id)}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold underline cursor-pointer"
                        >
                          View company page →
                        </button>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ====================================================================== */}
      {/* SIDE PANEL / MODAL: SECTION 3 OFFICER PAY FLOW */}
      {/* ====================================================================== */}
      {payModalProject && payModalPart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Release Payment</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Part {payModalPart.n} ({payModalPart.pct}%)</p>
              </div>
              <button 
                onClick={() => { setPayModalProject(null); setPayModalPart(null); }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {payError && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
                {payError}
              </div>
            )}

            <div className="bg-slate-50 dark:bg-slate-800/80 rounded-lg p-3.5 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Company:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{payModalProject.company}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Release Amount:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">{formatIndianCurrency(payModalPart.amt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Checker verdict:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Goal met ({payModalProject.now} {payModalProject.unit})</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400">Report status:</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-medium">Approved by {payModalProject.checker || 'Independent checker'}</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-slate-700 dark:text-slate-200 block">Bank Reference (UTR number):</label>
              <input
                type="text"
                value={payBankRef}
                onChange={(e) => setPayBankRef(e.target.value)}
                placeholder="e.g. UTR2610020084"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Generated bank transaction identifier recorded in government ledger.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => { setPayModalProject(null); setPayModalPart(null); }}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPaying || !payBankRef.trim()}
                onClick={handleConfirmPayment}
                className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg transition shadow-sm cursor-pointer"
              >
                {isPaying ? 'Processing...' : `Confirm & Pay ${formatIndianCurrency(payModalPart.amt)}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: OFFICER HOLD DECISION */}
      {holdDecisionProject && holdDecisionPart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Resolve Hold Decision</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Goal partly met ({holdDecisionProject.now} {holdDecisionProject.unit})</p>
              </div>
              <button 
                onClick={() => { setHoldDecisionProject(null); setHoldDecisionPart(null); }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <label className={`block p-3 rounded-lg border cursor-pointer ${holdActionType === 'full' ? 'border-blue-600 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/40' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'}`}>
                <input type="radio" name="holdOpt" checked={holdActionType === 'full'} onChange={() => setHoldActionType('full')} className="mr-2 text-blue-600" />
                <span className="font-bold text-slate-900 dark:text-white">Pay full ({formatIndianCurrency(holdDecisionPart.amt)})</span>
              </label>

              <label className={`block p-3 rounded-lg border cursor-pointer ${holdActionType === 'smaller' ? 'border-blue-600 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/40' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'}`}>
                <input type="radio" name="holdOpt" checked={holdActionType === 'smaller'} onChange={() => setHoldActionType('smaller')} className="mr-2 text-blue-600" />
                <span className="font-bold text-slate-900 dark:text-white">Pay smaller amount</span>
                {holdActionType === 'smaller' && (
                  <input
                    type="number"
                    value={customHoldAmt}
                    onChange={(e) => setCustomHoldAmt(e.target.value)}
                    placeholder="Amount in ₹"
                    className="w-full mt-2 px-3 py-1.5 rounded border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                )}
              </label>

              <label className={`block p-3 rounded-lg border cursor-pointer ${holdActionType === 'keep_hold' ? 'border-blue-600 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/40' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'}`}>
                <input type="radio" name="holdOpt" checked={holdActionType === 'keep_hold'} onChange={() => setHoldActionType('keep_hold')} className="mr-2 text-blue-600" />
                <span className="font-bold text-slate-900 dark:text-white">Keep on hold</span>
              </label>

              <div className="pt-2">
                <label className="font-semibold text-slate-700 dark:text-slate-200 block mb-1">Plain Reason (mandatory):</label>
                <input
                  type="text"
                  value={customHoldReason}
                  onChange={(e) => setCustomHoldReason(e.target.value)}
                  placeholder="e.g. Substantial improvement verified; paying pro-rated share"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => { setHoldDecisionProject(null); setHoldDecisionPart(null); }}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSavingHold}
                onClick={handleConfirmHoldDecision}
                className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-sm cursor-pointer"
              >
                {isSavingHold ? 'Saving...' : 'Save Decision'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subtle Grey Footer Demo Tag */}
      <div className="pt-8 text-center">
        <span className="text-[11px] text-slate-400 dark:text-slate-500">
          Demo data • SAMADHAN SETU Public Procurement Mechanism
        </span>
      </div>

    </div>
  );
};
