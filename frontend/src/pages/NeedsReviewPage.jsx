import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Award, 
  CheckCircle2, 
  Clock, 
  Send, 
  AlertCircle, 
  Building2, 
  Rocket, 
  Sliders, 
  X,
  FolderKanban, 
  ArrowRight,
  Users,
  Check,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Scale,
  Lock,
  Unlock,
  Eye,
  Search,
  Filter,
  Info,
  Calendar,
  Layers,
  Sparkles,
  HelpCircle,
  FileCheck,
  ChevronDown,
  ChevronUp,
  Flag,
  UserX,
  ExternalLink
} from 'lucide-react';
import { 
  getSharedExpertState, 
  saveSharedExpertState, 
  calculateWeightedTotal 
} from '../services/sharedExpertStore';

export const NeedsReviewPage = ({ activeTab = 'needs-review', setActiveTab, setSelectedProblemId }) => {
  const { user } = useAuth();

  // Map activeTab to internal section
  const getSectionFromTab = (tab) => {
    switch (tab) {
      case 'expert-assignments': return 'assignments';
      case 'expert-workspace': return 'workspace';
      case 'expert-cross-domain': return 'cross-domain';
      case 'expert-history': return 'history';
      case 'expert-conflict': return 'conflict';
      case 'expert-messages': return 'messages';
      case 'expert-profile': return 'profile';
      default: return 'overview';
    }
  };

  const currentSection = getSectionFromTab(activeTab);

  // Shared store state
  const [store, setStore] = useState(getSharedExpertState());

  useEffect(() => {
    const handleUpdate = () => {
      setStore(getSharedExpertState());
    };
    window.addEventListener('sih-expert-update', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('sih-expert-update', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const [toastMsg, setToastMsg] = useState('');
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 6000);
  };

  // --- SECTION B: MY ASSIGNMENTS STATE ---
  const [assignSearch, setAssignSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [domainFilter, setDomainFilter] = useState('All');
  const [stateFilter, setStateFilter] = useState('All');

  const myAssignmentsList = [
    {
      id: 'pilot-1',
      title: 'Municipal Solid Waste Collection Route Optimization & Delay Reduction',
      domain: 'Smart Cities & CleanTech',
      state: 'Maharashtra',
      duration: '12 Weeks',
      status: 'Scoring Due',
      statusColor: 'amber',
      description: 'Evaluate 3 blind proposals for dynamic vehicle route optimization across 450+ municipal collection vehicles in Pune Ward 12 & 13.',
      department: 'Pune Municipal Corporation (PMC)',
      applicantsCount: 3,
      targetKpi: 'Average Route Delay (≤ 25%)',
      grant: 1250000,
      assignedDate: store.panelAssignedDate
    },
    {
      id: 'chal-2',
      title: 'AI Acoustic Leakage Detection in Urban Water Distribution Pipelines',
      domain: 'Water & Utilities',
      state: 'Karnataka',
      duration: '14 Weeks',
      status: store.conflicts['chal-2']?.isDeclared ? 'Scoring Due' : 'Declaration Pending',
      statusColor: store.conflicts['chal-2']?.isDeclared ? 'amber' : 'rose',
      description: 'Evaluate sub-surface acoustic telemetry proposals and cross-domain consortium clearance for non-revenue potable water loss reduction.',
      department: 'Bengaluru Water Supply & Sewerage Board (BWSSB)',
      applicantsCount: 2,
      targetKpi: 'Non-Revenue Water Loss (≤ 15%)',
      grant: 1800000,
      assignedDate: '16 Sep 2026'
    },
    {
      id: 'chal-3',
      title: 'Solar-Powered Telemedicine Microgrid for Remote Mountain Health Centres',
      domain: 'Clean Energy & Healthcare',
      state: 'Himachal Pradesh',
      duration: '10 Weeks',
      status: 'Scores Locked',
      statusColor: 'emerald',
      description: 'Resilient sub-zero solar telemetry power management evaluated and certified for remote primary health clinics.',
      department: 'Dept of Health & Family Welfare, HP',
      applicantsCount: 4,
      targetKpi: 'Blackout downtime ≤ 1 hr/wk',
      grant: 1000000,
      assignedDate: '10 Aug 2026'
    },
    {
      id: 'P5',
      title: 'Broken streetlights take too long to fix',
      domain: 'Smart Cities',
      state: 'Madhya Pradesh',
      duration: '8 Weeks',
      status: 'Scoring Due',
      statusColor: 'amber',
      description: 'Evaluate 4 blind proposals for LightLoop smart streetlight monitoring in Indore. Experts finish marks by 12 Oct 2026.',
      department: 'Indore Municipal Corporation',
      applicantsCount: 4,
      targetKpi: 'Repair turnaround ≤ 2 days',
      grant: 800000,
      assignedDate: '28 Sep 2026'
    }
  ];

  const filteredAssignments = myAssignmentsList.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(assignSearch.toLowerCase()) ||
                          item.department.toLowerCase().includes(assignSearch.toLowerCase());
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    const matchesDomain = domainFilter === 'All' || item.domain === domainFilter;
    const matchesState = stateFilter === 'All' || item.state === stateFilter;
    return matchesSearch && matchesStatus && matchesDomain && matchesState;
  });

  // --- SECTION C: EVALUATION WORKSPACE (BLIND SCORING) STATE ---
  const isConflictCleared = store.conflicts['pilot-1']?.isDeclared && !store.conflicts['pilot-1']?.hasConflict;
  const [selectedAppId, setSelectedAppId] = useState('app-a');
  const activeApp = store.blindApplicants[selectedAppId] || store.blindApplicants['app-a'];

  // Current applicant scoring state
  const [currentScores, setCurrentScores] = useState(activeApp.scores);
  const [currentJustifications, setCurrentJustifications] = useState(activeApp.justifications);
  const [currentRedFlag, setCurrentRedFlag] = useState(activeApp.isRedFlagged || false);
  const [currentRedFlagReason, setCurrentRedFlagReason] = useState(activeApp.redFlagReason || '');
  const [showLockModal, setShowLockModal] = useState(false);
  const [showLateConflictModal, setShowLateConflictModal] = useState(false);

  // Sync state when applicant changes
  useEffect(() => {
    if (activeApp) {
      setCurrentScores(activeApp.scores);
      setCurrentJustifications(activeApp.justifications);
      setCurrentRedFlag(activeApp.isRedFlagged || false);
      setCurrentRedFlagReason(activeApp.redFlagReason || '');
    }
  }, [selectedAppId]);

  const liveWeightedScore = calculateWeightedTotal(currentScores);

  const handleSaveDraft = () => {
    saveSharedExpertState(prev => ({
      ...prev,
      blindApplicants: {
        ...prev.blindApplicants,
        [selectedAppId]: {
          ...prev.blindApplicants[selectedAppId],
          status: prev.blindApplicants[selectedAppId].status === 'locked' ? 'locked' : 'draft',
          scores: currentScores,
          justifications: currentJustifications,
          weightedTotal: liveWeightedScore,
          isRedFlagged: currentRedFlag,
          redFlagReason: currentRedFlagReason
        }
      }
    }));
    showToast(`✓ Draft score of ${liveWeightedScore}/100 saved for ${activeApp.blindCode}.`);
  };

  const handleLockScore = () => {
    saveSharedExpertState(prev => {
      const updated = {
        ...prev.blindApplicants,
        [selectedAppId]: {
          ...prev.blindApplicants[selectedAppId],
          status: 'locked',
          scores: currentScores,
          justifications: currentJustifications,
          weightedTotal: liveWeightedScore,
          isRedFlagged: currentRedFlag,
          redFlagReason: currentRedFlagReason,
          lockedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', Today'
        }
      };

      // Check if all are now locked to unlock consensus
      const allLocked = Object.values(updated).every(a => a.status === 'locked');

      return {
        ...prev,
        blindApplicants: updated,
        panelConsensus: {
          ...prev.panelConsensus,
          isConsensusUnlocked: allLocked || prev.panelConsensus.isConsensusUnlocked
        }
      };
    });

    setShowLockModal(false);
    showToast(`✓ Evaluation locked for ${activeApp.blindCode} (${liveWeightedScore}/100). Recorded in audit trail.`);
  };

  // Late Conflict Recognition handler
  const handleLateConflictConfirm = () => {
    saveSharedExpertState(prev => ({
      ...prev,
      conflicts: {
        ...prev.conflicts,
        'pilot-1': {
          isDeclared: true,
          hasConflict: true,
          signedBy: store.expertName,
          signDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          statusText: 'Late conflict declared: Expert recognised applicant from proposal content. Random re-assignment initiated.'
        }
      }
    }));
    setShowLateConflictModal(false);
    showToast(`⚠️ Late conflict logged for ${activeApp.blindCode}. You have been removed from this panel; a neutral replacement will be randomly drawn.`);
  };

  // --- SECTION D: CROSS-DOMAIN APPROVALS STATE ---
  const crossDomainReq = store.crossDomainRequests[0];
  const [cdChecklist, setCdChecklist] = useState(crossDomainReq?.checklist || {});
  const [cdComment, setCdComment] = useState(crossDomainReq?.expertComments || 'Approved consortium proposal. Cross-domain synergy between CleanRoute GIS routing and HydroSense acoustic telemetry addresses BWSSB leak detection targets with zero civil excavation risk.');
  const [cdDecisionSubmitting, setCdDecisionSubmitting] = useState(false);

  const handleCrossDomainDecision = (decisionType) => {
    if (!cdComment.trim()) {
      alert('Mandatory expert remarks required before decision submission.');
      return;
    }
    setCdDecisionSubmitting(true);

    saveSharedExpertState(prev => ({
      ...prev,
      crossDomainRequests: prev.crossDomainRequests.map(r => {
        if (r.id === crossDomainReq.id) {
          return {
            ...r,
            status: decisionType,
            expertComments: cdComment,
            checklist: cdChecklist,
            reviewedBy: store.expertName,
            reviewedAt: `${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
          };
        }
        return r;
      })
    }));

    // Synchronize cross-domain approval to localStorage for startup view
    try {
      localStorage.setItem('sih_cross_domain_approval_status', decisionType);
      window.dispatchEvent(new CustomEvent('sih-startup-update', { detail: { crossDomainApproved: decisionType === 'approved' } }));
    } catch (e) {
      console.error(e);
    }

    setCdDecisionSubmitting(false);
    showToast(`✓ Cross-domain proposal ${decisionType.toUpperCase()}. Startup notified and platform status updated.`);
  };

  // --- SECTION E: SCORING HISTORY STATE ---
  const [expandedHistoryId, setExpandedHistoryId] = useState(null);

  // --- SECTION F: CONFLICT DECLARATION STATE ---
  const [selectedConflictChallenge, setSelectedConflictChallenge] = useState('pilot-1');
  const [conflictChoice, setConflictChoice] = useState('no_conflict');
  const [conflictQuestions, setConflictQuestions] = useState({
    shareholding: 'no',
    employment: 'no',
    relationship: 'no',
    funding: 'no'
  });
  const [conflictSignature, setConflictSignature] = useState(store.expertName);
  const [conflictSuccessBanner, setConflictSuccessBanner] = useState('');

  const hasAnyConflictYes = Object.values(conflictQuestions).some(v => v === 'yes') || conflictChoice === 'has_conflict';

  const handleConflictFormSubmit = (e) => {
    e.preventDefault();
    const isClean = !hasAnyConflictYes;

    saveSharedExpertState(prev => ({
      ...prev,
      conflicts: {
        ...prev.conflicts,
        [selectedConflictChallenge]: {
          isDeclared: true,
          hasConflict: !isClean,
          signedBy: conflictSignature,
          signDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          signature: conflictSignature,
          answers: conflictQuestions,
          statusText: isClean ? 'No conflict declared. Cleared to evaluate.' : 'Conflict declared: Random re-assignment requested.'
        }
      }
    }));

    if (isClean) {
      setConflictSuccessBanner(`✓ Conflict Declaration recorded for ${selectedConflictChallenge}. Evaluation Workspace unlocked.`);
    } else {
      setConflictSuccessBanner(`⚠️ Conflict recorded. Assignment removed and returned to the pool for random re-assignment.`);
    }
    setTimeout(() => setConflictSuccessBanner(''), 6000);
  };

  // --- SECTION G: MESSAGES STATE ---
  const [activeConvId, setActiveConvId] = useState('conv-coord');
  const [msgInput, setMsgInput] = useState('');
  const currentThread = store.messages.threads[activeConvId] || [];
  const currentPartner = store.messages.conversations.find(c => c.id === activeConvId);

  const handleSendMsg = (e) => {
    e.preventDefault();
    if (!msgInput.trim()) return;

    const newM = {
      id: `m-${Date.now()}`,
      sender: store.expertName,
      isMe: true,
      time: 'Just now',
      text: msgInput.trim()
    };

    saveSharedExpertState(prev => {
      const existing = prev.messages.threads[activeConvId] || [];
      const updatedConvs = prev.messages.conversations.map(c => 
        c.id === activeConvId ? { ...c, lastMessage: newM.text, lastTime: 'Just now' } : c
      );
      return {
        ...prev,
        messages: {
          ...prev.messages,
          conversations: updatedConvs,
          threads: {
            ...prev.messages.threads,
            [activeConvId]: [...existing, newM]
          }
        }
      };
    });

    setMsgInput('');
  };

  return (
    <div className="space-y-6 py-2">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-bold flex items-center justify-between shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg('')} className="p-1 hover:bg-amber-100 dark:hover:bg-amber-900 rounded-lg">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Breadcrumb Header for Inner Pages */}
      {currentSection !== 'overview' && (
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Expert Dashboard</span>
            <span>/</span>
            <span className="font-extrabold text-slate-900 dark:text-white capitalize">
              {currentSection === 'assignments' && 'My Assignments'}
              {currentSection === 'workspace' && 'Evaluation Workspace'}
              {currentSection === 'cross-domain' && 'Cross-Domain Approvals'}
              {currentSection === 'history' && 'Scoring History'}
              {currentSection === 'conflict' && 'Conflict Declaration'}
              {currentSection === 'messages' && 'Messages'}
              {currentSection === 'profile' && 'Expert Profile'}
            </span>
          </div>
          <button 
            onClick={() => setActiveTab('needs-review')}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>← Back to Overview</span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE A: EXPERT DASHBOARD (OVERVIEW)                                       */}
      {/* ========================================================================= */}
      {currentSection === 'overview' && (
        <div className="space-y-6">
          
          {/* Hero Card */}
          <div className="civic-card p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-6">
            
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    Expert Evaluation Command Portal
                  </h1>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/70 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-800">
                    Blind & Audited
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
                  Evaluate startups on merit. Your identity, scores and conflict declarations are recorded in a locked audit trail.
                </p>
              </div>

              {/* Action Buttons & Capacity Pill */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold border border-slate-200 dark:border-slate-700">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  <span className="text-slate-700 dark:text-slate-300">Active Assignments: 2</span>
                </div>
                <button
                  onClick={() => setActiveTab('expert-assignments')}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Rocket className="w-3.5 h-3.5" />
                  <span>Open My Assignments</span>
                </button>
              </div>
            </div>

            {/* Two Side-by-Side Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 space-y-1.5">
                <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Random Panel Rule</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Panel members are assigned by the system at random from the empanelled expert pool. Neither the Department Officer nor the startup can choose the panel.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 space-y-1.5">
                <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Blind Scoring Rule</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Applicant names and logos are hidden ("Applicant A, B, C") until every panel member has locked their score, preventing unconscious bias.
                </p>
              </div>

            </div>

            {/* Info Strip: Pending Actions */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                <span>
                  <strong>Pending Actions:</strong> 1 evaluation (Pune Solid Waste) and 1 cross-domain approval (BWSSB Leakage Detection) awaiting you.
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab('expert-cross-domain')}
                  className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                >
                  Review Cross-Domain Bid →
                </button>
                <button
                  onClick={() => setActiveTab('expert-workspace')}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Score Proposals →
                </button>
              </div>
            </div>

          </div>

          {/* Stats Row (4 Small Cards) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Assigned Evaluations</div>
              <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">3</div>
              <div className="text-[10px] font-semibold text-slate-500">2 Active • 1 Sealed</div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Scores Locked</div>
              <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">2</div>
              <div className="text-[10px] font-semibold text-emerald-600/80">Applicant A & B Certified</div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Cross-Domain Requests</div>
              <div className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400">1</div>
              <div className="text-[10px] font-semibold text-amber-600/80">Joint Bid Awaiting Review</div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Avg. Scoring Time</div>
              <div className="text-2xl font-black font-mono text-blue-600 dark:text-blue-400">3.4 Hours</div>
              <div className="text-[10px] font-semibold text-slate-500">SLA Window: 72 Hours</div>
            </div>

          </div>

          {/* Featured Card (Active Sandbox Pilot style) */}
          <div className="civic-card p-6 md:p-8 rounded-3xl border border-amber-200 dark:border-amber-900/60 bg-gradient-to-r from-amber-50/40 to-orange-50/40 dark:from-amber-950/20 dark:to-orange-950/20 space-y-6 shadow-xs">
            
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-800">
                    Evaluation Due
                  </span>
                  <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                    Assigned by system on 14 Sep 2026
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Municipal Solid Waste Collection Route Optimization & Delay Reduction
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Domain: <strong>Smart Cities & CleanTech</strong> • Procuring Authority: <strong>Pune Municipal Corporation (PMC)</strong> • Applicants: <strong>3</strong> • Pilot Grant: <strong>₹ 12,50,000</strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('expert-workspace')}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>Open Evaluation Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setActiveTab('expert-assignments')}
                  className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-amber-500" />
                  <span>View My Assignments</span>
                </button>
              </div>
            </div>

            {/* Amber Next Action Required Box */}
            <div className="p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <strong className="font-bold text-amber-950 dark:text-amber-200">Next Action Required:</strong>
                  <span className="text-amber-800 dark:text-amber-300 ml-1.5">
                    Sign conflict declaration and score 3 applicants before the deadline.
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('expert-workspace')}
                className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shrink-0 cursor-pointer shadow-2xs"
              >
                Open Evaluation Workspace
              </button>
            </div>

            {/* Panel Status Summary Strip */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-purple-600" />
                  Evaluation Rubric: 100-Point Weighted Multi-Criteria
                </span>
                <div className="flex items-center gap-3 text-[11px] text-slate-500">
                  <span>Innovation (20%)</span>
                  <span>•</span>
                  <span>Feasibility (25%)</span>
                  <span>•</span>
                  <span>Cybersecurity (20%)</span>
                  <span>•</span>
                  <span>Cost (15%)</span>
                  <span>•</span>
                  <span>Capability Proof (20%)</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold text-xs flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Conflict Cleared by Dr. Meera Iyer ✓</span>
                </span>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE B: MY ASSIGNMENTS                                                    */}
      {/* ========================================================================= */}
      {currentSection === 'assignments' && (
        <div className="space-y-6">
          
          {/* Header Controls: Search & Filters */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="flex flex-col md:flex-row gap-3">
              
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search assigned evaluations by keyword, city, or sector..."
                  value={assignSearch}
                  onChange={e => setAssignSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium focus:outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Scoring Due">Scoring Due</option>
                  <option value="Declaration Pending">Declaration Pending</option>
                  <option value="Scores Locked">Scores Locked</option>
                </select>

                <select
                  value={domainFilter}
                  onChange={e => setDomainFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium focus:outline-none"
                >
                  <option value="All">All Domains</option>
                  <option value="Smart Cities & CleanTech">Smart Cities & CleanTech</option>
                  <option value="Water & Utilities">Water & Utilities</option>
                  <option value="Clean Energy & Healthcare">Clean Energy & Healthcare</option>
                </select>

                <select
                  value={stateFilter}
                  onChange={e => setStateFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium focus:outline-none"
                >
                  <option value="All">All States</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Himachal Pradesh">Himachal Pradesh</option>
                </select>

              </div>

            </div>
          </div>

          {/* 2-Column Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredAssignments.map(item => (
              <div 
                key={item.id} 
                className="civic-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:border-amber-300 dark:hover:border-amber-800 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  
                  {/* Top Badge & Location/Duration */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                      item.status === 'Scoring Due'
                        ? 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                        : item.status === 'Scores Locked'
                          ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                          : 'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                    }`}>
                      {item.status}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500">
                      {item.state} • {item.duration}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Details Box */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Department:</span>
                      <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">{item.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">No. of Applicants:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{item.applicantsCount} Blind Proposals</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Target KPI:</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">{item.targetKpi}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Pilot Grant:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{formatCurrency(item.grant)}</span>
                    </div>
                  </div>

                </div>

                {/* Footer with CTA */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Assigned: {item.assignedDate}</span>
                  
                  {item.status === 'Scoring Due' && (
                    <button
                      onClick={() => setActiveTab('expert-workspace')}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span>Open Evaluation</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {item.status === 'Declaration Pending' && (
                    <button
                      onClick={() => setActiveTab('expert-conflict')}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Scale className="w-3.5 h-3.5" />
                      <span>Sign Declaration</span>
                    </button>
                  )}

                  {item.status === 'Scores Locked' && (
                    <button
                      onClick={() => setActiveTab('expert-history')}
                      className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-500" />
                      <span>View My Scores</span>
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE C: EVALUATION WORKSPACE (BLIND SCORING)                               */}
      {/* ========================================================================= */}
      {currentSection === 'workspace' && (
        <div className="space-y-6">
          
          {/* Header */}
          <div className="civic-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Stage 3 of 8: Multi-Criteria Scoring
                </span>
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  2 Days 14 Hours Remaining
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Municipal Solid Waste Collection Route Optimization & Delay Reduction
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Procuring Dept: <strong>Pune Municipal Corporation (PMC)</strong> • Assigned Panel Chair: <strong>{store.expertName} ({store.expertOrg})</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowLateConflictModal(true)}
                className="px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 font-bold text-xs border border-rose-200 dark:border-rose-800 flex items-center gap-1.5 cursor-pointer"
                title="If you recognise an applicant from their technical approach, report late conflict immediately"
              >
                <UserX className="w-3.5 h-3.5" />
                <span>Report Late Conflict</span>
              </button>
            </div>
          </div>

          {/* STEP 0: CONFLICT GATE */}
          {!isConflictCleared ? (
            <div className="p-6 rounded-3xl bg-amber-50/90 dark:bg-amber-950/60 border-2 border-amber-300 dark:border-amber-700 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 mx-auto flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-amber-950 dark:text-amber-200">
                Conflict Declaration Required Before Accessing Proposals & Scoring
              </h3>
              <p className="text-xs text-amber-800 dark:text-amber-300 max-w-lg mx-auto">
                Under GFR Rule 194 procurement integrity rules, expert evaluators must declare freedom from commercial, advisory, or personal conflicts before viewing blind proposals.
              </p>
              <button
                onClick={() => setActiveTab('expert-conflict')}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Scale className="w-4 h-4" />
                <span>Sign Conflict Declaration Now</span>
              </button>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Conflict Cleared:</strong> Signed by <strong>{store.expertName}</strong> on {store.conflicts['pilot-1']?.signDate || '15 Sep 2026'}. Fully authorized for multi-criteria evaluation.
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-700">
                Blind Protocol Active ✓
              </span>
            </div>
          )}

          {/* 2-COLUMN WORKSPACE: LEFT = APPLICANTS, RIGHT = BLIND SCORING FORM */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Blind Applicants List (4 cols) */}
            <div className="lg:col-span-4 space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Blind Applicants (3)
                </span>
                <span className="text-[10px] text-slate-400">Identities Sealed</span>
              </div>

              {Object.values(store.blindApplicants).map(applicant => {
                const isSelected = selectedAppId === applicant.id;
                return (
                  <div
                    key={applicant.id}
                    onClick={() => setSelectedAppId(applicant.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? 'bg-blue-50/80 dark:bg-blue-950/60 border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {applicant.blindCode}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        applicant.status === 'locked'
                          ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300'
                          : applicant.status === 'draft'
                            ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        {applicant.status === 'locked' ? 'Locked ✓' : applicant.status === 'draft' ? 'Draft' : 'Not Scored'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                      {applicant.approachSummary}
                    </p>

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 dark:border-slate-800/80">
                      <span className="text-slate-500">TRL: <strong>TRL {applicant.trlLevel}</strong></span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {applicant.weightedTotal ? `${applicant.weightedTotal} / 100` : '—'}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Panel Consensus Trigger Card */}
              {store.panelConsensus.isConsensusUnlocked && (
                <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/80 space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-purple-900 dark:text-purple-200">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>Panel Consensus Unlocked</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    All 3 panel members have recorded their evaluations. Scroll down to review aggregate scores and ranking.
                  </p>
                </div>
              )}
            </div>

            {/* Right Column: Blind Proposal Review & 5-Criteria Form (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Blind Notice Banner */}
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    <strong>Blind Protocol:</strong> Identity hidden until all scores are locked. Evaluating <strong>{activeApp.blindCode}</strong>.
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                  {activeApp.dpiitStatus}
                </span>
              </div>

              {/* Blind Proposal Summary Cards */}
              <div className="civic-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-4 text-xs">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider text-slate-500">
                  Applicant Technical Proposal Summary
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Technical Architecture</span>
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                      {activeApp.techArchitecture}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Data Handling & Privacy</span>
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                      {activeApp.dataHandlingPlan}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Cybersecurity & Encryption</span>
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                      {activeApp.securityMeasures}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Cost & Budget Allocation</span>
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                      {activeApp.costBreakdown}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">
                    Capability Proof (Substitutes 3-Year Turnover under GFR Rule 194)
                  </span>
                  <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                    {activeApp.capabilityProof} • Team: {activeApp.teamStrength}
                  </p>
                </div>
              </div>

              {/* 5 Weighted Scoring Criteria Form */}
              <div className="civic-card p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-6">
                
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      Weighted Evaluation Rubric (Total: 100%)
                    </h3>
                    <p className="text-xs text-slate-500">Each criterion scored 0–10 with mandatory justification</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Weighted Total</span>
                    <span className="text-2xl font-black font-mono text-blue-600 dark:text-blue-400">
                      {liveWeightedScore} <span className="text-sm font-normal text-slate-400">/ 100</span>
                    </span>
                  </div>
                </div>

                {/* 5 Criteria Items */}
                {[
                  { key: 'innovation', weight: '20%', label: '1. Innovation and Novelty', desc: 'Distinctiveness of edge routing algorithms and sensor fusion compared to conventional GPS.' },
                  { key: 'feasibility', weight: '25%', label: '2. Technical Feasibility and TRL', desc: 'Robustness of hardware integration on municipal fleet and operational readiness (TRL 7).' },
                  { key: 'security', weight: '20%', label: '3. Data Security and Cybersecurity', desc: 'AES-256 telemetry encryption, municipal NOC isolation, and DPDP Act compliance.' },
                  { key: 'cost', weight: '15%', label: '4. Cost-Effectiveness and Value', desc: 'Fairness of proposed SBoT milestone pilot grant (₹ 12,50,000) and public value.' },
                  { key: 'capability', weight: '20%', label: '5. Capability Proof (Replaces Turnover)', desc: 'Validated municipal testbed track record, bench telemetry, and specialized engineering skills.' }
                ].map(crit => {
                  const val = currentScores[crit.key] || 0;
                  const just = currentJustifications[crit.key] || '';
                  const isLocked = activeApp.status === 'locked';

                  return (
                    <div key={crit.key} className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80">
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-xs text-slate-900 dark:text-white block">
                            {crit.label} <span className="text-[11px] font-normal text-purple-600 font-semibold">({crit.weight} weight)</span>
                          </span>
                          <span className="text-[11px] text-slate-500">{crit.desc}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-base font-bold text-slate-900 dark:text-white w-8 text-right">
                            {val}
                          </span>
                          <span className="text-xs text-slate-400">/ 10</span>
                        </div>
                      </div>

                      {/* Slider Input */}
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="1"
                        disabled={isLocked || !isConflictCleared}
                        value={val}
                        onChange={e => setCurrentScores({ ...currentScores, [crit.key]: Number(e.target.value) })}
                        className="w-full accent-blue-600 cursor-pointer"
                      />

                      {/* Mandatory Justification */}
                      <div>
                        <input
                          type="text"
                          disabled={isLocked || !isConflictCleared}
                          placeholder="Mandatory one-line justification for this score..."
                          value={just}
                          onChange={e => setCurrentJustifications({ ...currentJustifications, [crit.key]: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                    </div>
                  );
                })}

                {/* Red Flag Checkbox */}
                <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-2">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      disabled={activeApp.status === 'locked' || !isConflictCleared}
                      checked={currentRedFlag}
                      onChange={e => setCurrentRedFlag(e.target.checked)}
                      className="rounded border-rose-300 text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="font-bold text-xs text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
                      <Flag className="w-3.5 h-3.5 text-rose-600" />
                      Flag this proposal with a Red Flag (Severe technical or compliance risk)
                    </span>
                  </label>
                  {currentRedFlag && (
                    <input
                      type="text"
                      disabled={activeApp.status === 'locked' || !isConflictCleared}
                      placeholder="Specify the critical reason (e.g. unrealistic claims, data leakage risk)..."
                      value={currentRedFlagReason}
                      onChange={e => setCurrentRedFlagReason(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 text-xs text-rose-900 dark:text-rose-100 focus:outline-none"
                    />
                  )}
                </div>

                {/* Rank-Readiness Note */}
                <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
                  <span>
                    <strong>Outcome Assessment:</strong> {liveWeightedScore >= 75 ? 'Qualified for Sandbox Pilot Award (> 75 pts)' : 'Below benchmark threshold (≤ 75 pts)'}
                  </span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    Weighted: {liveWeightedScore} / 100
                  </span>
                </div>

                {/* Actions: Save Draft vs Lock Score */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-400">
                    Evaluator: <strong>{store.expertName}</strong> ({store.expertOrg})
                  </div>

                  {activeApp.status !== 'locked' ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSaveDraft}
                        disabled={!isConflictCleared}
                        className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-300 dark:border-slate-700 cursor-pointer"
                      >
                        Save Draft
                      </button>
                      <button
                        onClick={() => setShowLockModal(true)}
                        disabled={!isConflictCleared || (currentRedFlag && !currentRedFlagReason.trim())}
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Lock Score</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="px-4 py-2 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" />
                        Score Sealed ({activeApp.lockedAt || 'Certified'})
                      </span>
                      <button
                        onClick={() => {
                          saveSharedExpertState(prev => ({
                            ...prev,
                            blindApplicants: {
                              ...prev.blindApplicants,
                              [selectedAppId]: { ...prev.blindApplicants[selectedAppId], status: 'draft' }
                            }
                          }));
                          showToast('Score unlocked for demo editing.');
                        }}
                        className="text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline cursor-pointer"
                      >
                        Unlock for Demo
                      </button>
                    </div>
                  )}
                </div>

              </div>

              {/* POST-LOCK PANEL CONSENSUS CARD */}
              {store.panelConsensus.isConsensusUnlocked && (
                <div className="civic-card p-6 md:p-8 rounded-3xl border border-purple-200 dark:border-purple-900 bg-white dark:bg-slate-900 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="space-y-0.5">
                      <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                        Panel Consensus & Aggregate Ranking
                      </h3>
                      <p className="text-xs text-slate-500">
                        Synthesized from 3 empanelled independent evaluators (Dr. Meera Iyer, Prof. S. Joshi, Dr. K. Narang)
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                      3 / 3 Evaluators Locked
                    </span>
                  </div>

                  <div className="space-y-3">
                    {store.panelConsensus.applicants.map(cApp => (
                      <div key={cApp.blindCode} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-slate-900 dark:text-white">{cApp.blindCode}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200">
                              {cApp.status}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Evaluator Scores: {cApp.expertScores.join(', ')} • Spread: {cApp.spread} pts
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">Consensus Average</span>
                          <span className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                            {cApp.averageScore} <span className="text-xs text-slate-400">/ 100</span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    <strong className="text-slate-900 dark:text-white">Unsealing Protocol:</strong> All three evaluators have recorded scores within normal variance (max spread 6.5 pts). Real startup identities will be unsealed directly for Department Officer Dr. Sunita Verma to issue the SBoT sandbox award.
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE D: CROSS-DOMAIN APPROVALS                                            */}
      {/* ========================================================================= */}
      {currentSection === 'cross-domain' && (
        <div className="space-y-6">
          
          <div className="civic-card p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-6">
            
            <div className="space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/70 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800">
                GFR Rule 194 Special Approval Gate
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-6 h-6 text-purple-600" />
                Cross-Domain Joint Partnership Review
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Applying outside a startup's registered domain requires an accepted partner startup operating in that domain and Expert Panel approval before sandbox award.
              </p>
            </div>

            {/* Request Card */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-4 text-xs">
              
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Challenge</span>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">{crossDomainReq.challengeTitle}</span>
                  <div className="text-[11px] text-slate-500">{crossDomainReq.procuringAuthority} • Domain: {crossDomainReq.challengeDomain}</div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                  crossDomainReq.status === 'approved'
                    ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300'
                    : crossDomainReq.status === 'changes_requested'
                      ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300'
                      : 'bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200'
                }`}>
                  Status: {crossDomainReq.status}
                </span>
              </div>

              {/* Startup Entities Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-blue-600">Lead Applicant</span>
                  <div className="font-bold text-slate-900 dark:text-white">{crossDomainReq.leadStartup}</div>
                  <div className="text-slate-500">Registered Domain: <strong>{crossDomainReq.leadDomain}</strong></div>
                  <p className="text-[11px] text-slate-400">Applying outside registered sector</p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-emerald-600">Accepted Partner Startup</span>
                  <div className="font-bold text-slate-900 dark:text-white">{crossDomainReq.partnerStartup}</div>
                  <div className="text-slate-500">Registered Domain: <strong>{crossDomainReq.partnerDomain}</strong></div>
                  <p className="text-[11px] text-emerald-600 font-semibold">{crossDomainReq.partnerDpiit} • Matches Challenge Sector ✓</p>
                </div>

              </div>

              {/* Work Split & Proof */}
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Proposed Consortium Work Split</span>
                  <p className="text-slate-800 dark:text-slate-200 font-medium">{crossDomainReq.workSplit}</p>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Supporting Evidence & Agreements</span>
                  <p className="text-slate-800 dark:text-slate-200 font-medium">{crossDomainReq.supportingProof}</p>
                </div>
              </div>

              {/* 5-Point Compliance Checklist */}
              <div className="space-y-2 pt-2">
                <span className="font-bold text-slate-900 dark:text-white block">
                  Cross-Domain Verification Checklist (Panel Review):
                </span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  {[
                    { key: 'dpiitRecognised', label: 'Partner startup is DPIIT recognised' },
                    { key: 'domainCapabilityProof', label: 'Partner has valid domain capability proof' },
                    { key: 'workSplitClear', label: 'Work split is balanced and well-defined' },
                    { key: 'ipDataDefined', label: 'IP ownership & data responsibilities defined' },
                    { key: 'noConflictBetweenPartners', label: 'No conflict of interest between entities' }
                  ].map(chk => (
                    <label key={chk.key} className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cdChecklist[chk.key]}
                        onChange={e => setCdChecklist({ ...cdChecklist, [chk.key]: e.target.checked })}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="font-medium text-slate-800 dark:text-slate-200">{chk.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Mandatory Comments */}
              <div className="space-y-1.5 pt-2">
                <label className="font-bold text-slate-900 dark:text-white block">
                  Mandatory Panel Decision Remarks <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={cdComment}
                  onChange={e => setCdComment(e.target.value)}
                  placeholder="Record formal technical memo justifying approval or specific changes requested..."
                  className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Decision Action Buttons */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
                <div className="text-[11px] text-slate-400">
                  Reviewer: <strong>{store.expertName}</strong> • {store.expertOrg}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={cdDecisionSubmitting}
                    onClick={() => handleCrossDomainDecision('rejected')}
                    className="px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 font-bold text-xs border border-rose-200 dark:border-rose-800 cursor-pointer"
                  >
                    Reject Proposal
                  </button>
                  <button
                    disabled={cdDecisionSubmitting}
                    onClick={() => handleCrossDomainDecision('changes_requested')}
                    className="px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-700 dark:text-amber-300 font-bold text-xs border border-amber-200 dark:border-amber-800 cursor-pointer"
                  >
                    Request Changes
                  </button>
                  <button
                    disabled={cdDecisionSubmitting}
                    onClick={() => handleCrossDomainDecision('approved')}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve Proposal</span>
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE E: SCORING HISTORY                                                   */}
      {/* ========================================================================= */}
      {currentSection === 'history' && (
        <div className="space-y-6">
          
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold text-slate-900 dark:text-white">
              Permanent Panel Audit Log
            </span>
            <span className="text-[11px] font-medium italic">
              Scores cannot be changed after locking.
            </span>
          </div>

          <div className="civic-card rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 border-b border-slate-200 dark:border-slate-800 font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">Challenge</th>
                    <th className="py-3.5 px-3">Department</th>
                    <th className="py-3.5 px-3">Applicants Scored</th>
                    <th className="py-3.5 px-3">My Score</th>
                    <th className="py-3.5 px-3">Date Locked</th>
                    <th className="py-3.5 px-3">Status</th>
                    <th className="py-3.5 px-4 text-right">Audit Entry</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {store.history.map(item => (
                    <React.Fragment key={item.challengeId}>
                      <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white max-w-xs truncate">
                          {item.title}
                        </td>
                        <td className="py-3.5 px-3">{item.department}</td>
                        <td className="py-3.5 px-3 font-semibold">{item.applicantsCount} Proposals</td>
                        <td className="py-3.5 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                          {item.myScore} / 100
                        </td>
                        <td className="py-3.5 px-3 text-slate-500">{item.dateLocked}</td>
                        <td className="py-3.5 px-3">
                          <span className="flex items-center gap-1 font-bold text-[11px] text-purple-600 dark:text-purple-400">
                            <Lock className="w-3 h-3" />
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setExpandedHistoryId(expandedHistoryId === item.challengeId ? null : item.challengeId)}
                            className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 cursor-pointer text-[11px]"
                          >
                            {expandedHistoryId === item.challengeId ? 'Hide Audit Entry' : 'View Audit Entry'}
                          </button>
                        </td>
                      </tr>

                      {expandedHistoryId === item.challengeId && (
                        <tr className="bg-slate-50/70 dark:bg-slate-800/40">
                          <td colSpan={7} className="p-4">
                            <div className="space-y-2 border-l-2 border-purple-500 pl-4 py-1 ml-4">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                Immutable Forensic Audit Trail ({item.challengeId})
                              </span>
                              <div className="space-y-1 text-xs">
                                {(item.auditEntries || []).map((step, idx) => (
                                  <div key={idx} className="flex items-center gap-3">
                                    <span className="font-mono text-[10px] text-slate-400 shrink-0">{step.time}</span>
                                    <span className="text-slate-700 dark:text-slate-300 font-medium">• {step.event}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE F: CONFLICT DECLARATION                                              */}
      {/* ========================================================================= */}
      {currentSection === 'conflict' && (
        <div className="space-y-6">
          
          <div className="civic-card p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-6">
            
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Ethical Safeguards & Independence
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Scale className="w-6 h-6 text-amber-600" />
                Conflict of Interest Declaration
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Mandatory for every assigned challenge prior to scoring. If an applicant is recognised from proposal content during evaluation, use the late conflict option.
              </p>
            </div>

            {conflictSuccessBanner && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{conflictSuccessBanner}</span>
              </div>
            )}

            <form onSubmit={handleConflictFormSubmit} className="space-y-6">
              
              {/* Select Challenge */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-900 dark:text-white block">
                  Evaluation Challenge
                </label>
                <select
                  value={selectedConflictChallenge}
                  onChange={e => setSelectedConflictChallenge(e.target.value)}
                  className="w-full md:w-2/3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                >
                  <option value="pilot-1">Municipal Solid Waste Route Optimization — Pune Municipal Corporation</option>
                  <option value="chal-2">AI Acoustic Leakage Detection — Bengaluru Water Supply (BWSSB)</option>
                  <option value="chal-3">Solar Telemedicine Microgrid — Himachal Pradesh Health Dept</option>
                </select>
              </div>

              {/* Radio: No Conflict vs Has Conflict */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className={`p-4 rounded-2xl border cursor-pointer flex items-center gap-3 ${
                  conflictChoice === 'no_conflict'
                    ? 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-500 dark:border-amber-600 ring-2 ring-amber-500/20'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                }`}>
                  <input
                    type="radio"
                    name="confChoice"
                    value="no_conflict"
                    checked={conflictChoice === 'no_conflict'}
                    onChange={() => setConflictChoice('no_conflict')}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <span className="font-bold text-xs text-slate-900 dark:text-white block">
                      I have no conflict of interest
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Independent and unencumbered to evaluate applicants
                    </span>
                  </div>
                </label>

                <label className={`p-4 rounded-2xl border cursor-pointer flex items-center gap-3 ${
                  conflictChoice === 'has_conflict'
                    ? 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-500 dark:border-rose-600 ring-2 ring-rose-500/20'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                }`}>
                  <input
                    type="radio"
                    name="confChoice"
                    value="has_conflict"
                    checked={conflictChoice === 'has_conflict'}
                    onChange={() => setConflictChoice('has_conflict')}
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <div>
                    <span className="font-bold text-xs text-slate-900 dark:text-white block">
                      I have a conflict, remove me from this evaluation
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Auto-block and reassign to a new random panel member
                    </span>
                  </div>
                </label>
              </div>

              {/* 4 Yes/No Questions */}
              <div className="space-y-3">
                <span className="font-bold text-xs text-slate-900 dark:text-white block">
                  Mandatory Conflict Checklist:
                </span>

                {[
                  { key: 'shareholding', q: '1. Do you or your immediate family hold shares, equity, or commercial advisory roles in any applicant entity?' },
                  { key: 'employment', q: '2. Have you been employed by or consulted for any applicant or the procuring department in the last 3 years?' },
                  { key: 'relationship', q: '3. Do you have a personal, direct mentorship, or familial relationship with any founder or project lead?' },
                  { key: 'funding', q: '4. Have you received research funding, grants, or equipment donations from an applicant in the last 24 months?' }
                ].map(item => (
                  <div key={item.key} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <span className="text-slate-800 dark:text-slate-200 font-medium max-w-xl">
                      {item.q}
                    </span>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name={`q_${item.key}`}
                          value="no"
                          checked={conflictQuestions[item.key] === 'no'}
                          onChange={() => setConflictQuestions({ ...conflictQuestions, [item.key]: 'no' })}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="font-bold text-slate-700 dark:text-slate-300">No</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name={`q_${item.key}`}
                          value="yes"
                          checked={conflictQuestions[item.key] === 'yes'}
                          onChange={() => setConflictQuestions({ ...conflictQuestions, [item.key]: 'yes' })}
                          className="text-rose-600 focus:ring-rose-500"
                        />
                        <span className="font-bold text-rose-600">Yes</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              {/* Late Recognition Notice */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Recognise an applicant from their proposal content during scoring?
                  </span>
                  <span className="text-slate-500">
                    You can report a late conflict at any time from the evaluation workspace to automatically reassign.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLateConflictModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold text-xs shrink-0 cursor-pointer"
                >
                  I recognise an applicant
                </button>
              </div>

              {/* Typed-name E-signature & Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-900 dark:text-white block">
                    Typed Electronic Signature <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={conflictSignature}
                    onChange={e => setConflictSignature(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs font-bold text-slate-900 dark:text-white"
                  />
                  <p className="text-[10px] text-slate-400">Recorded with IIT Bombay Institutional ID</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-900 dark:text-white block">
                    Declaration Date
                  </label>
                  <div className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-600 dark:text-slate-300">
                    {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Submit Declaration</span>
                </button>
              </div>

            </form>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGES G & H: MESSAGES AND PROFILE                                         */}
      {/* ========================================================================= */}
      {currentSection === 'messages' && (
        <div className="space-y-4">
          
          {/* Regulatory Non-Contact Notice */}
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 flex items-center gap-2.5 text-xs text-amber-900 dark:text-amber-200">
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              <strong>Integrity Guard:</strong> Experts cannot contact applicants during evaluation. All panel communications are recorded in the public procurement audit trail.
            </span>
          </div>

          {/* 2-Pane Conversation Area */}
          <div className="civic-card rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden grid grid-cols-1 md:grid-cols-3 min-h-[500px]">
            
            {/* Left Conversations List */}
            <div className="border-r border-slate-200 dark:border-slate-800 p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Panel Communications
                </span>
                <span className="text-[10px] font-bold text-amber-600">Logged Channel</span>
              </div>

              <div className="space-y-1.5">
                {store.messages.conversations.map(conv => (
                  <div
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={`p-3 rounded-2xl transition-all cursor-pointer space-y-1 ${
                      activeConvId === conv.id
                        ? 'bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {conv.partnerName}
                      </span>
                      <span className="text-[10px] text-slate-400">{conv.lastTime}</span>
                    </div>
                    <div className="text-[10px] font-medium text-slate-500">
                      {conv.partnerRole} • {conv.partnerOrg}
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate">
                      {conv.lastMessage}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Chat Thread */}
            <div className="md:col-span-2 flex flex-col justify-between p-4 md:p-6 bg-slate-50/50 dark:bg-slate-900/40">
              
              {currentPartner && (
                <div className="pb-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {currentPartner.partnerName}
                    </h4>
                    <span className="text-[11px] text-slate-500">
                      {currentPartner.partnerRole} • {currentPartner.partnerOrg}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    Audit Logged
                  </span>
                </div>
              )}

              {/* Message Bubbles */}
              <div className="py-4 space-y-3 overflow-y-auto max-h-[360px]">
                {currentThread.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-0.5">
                      <span>{msg.sender}</span>
                      <span>•</span>
                      <span>{msg.time}</span>
                    </div>
                    <div className={`p-3.5 rounded-2xl max-w-md text-xs leading-relaxed ${
                      msg.isMe
                        ? 'bg-blue-600 text-white rounded-br-xs'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-xs'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input Box */}
              <form onSubmit={handleSendMsg} className="pt-3 border-t border-slate-200 dark:border-slate-800 flex gap-2">
                <input
                  type="text"
                  placeholder="Type an official panel query or coordination message..."
                  value={msgInput}
                  onChange={e => setMsgInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>

            </div>

          </div>

        </div>
      )}

      {currentSection === 'profile' && (
        <div className="space-y-6">
          
          <div className="civic-card p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-6">
            
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
                  MI
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                      Dr. Meera Iyer
                    </h2>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                      Expert Panel Member
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    Department of Urban Systems & Civil Engineering • <strong>IIT Bombay</strong>
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    meera.iyer@iitb.ac.in • Empanelment ID: {store.empanelmentId}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Empanelment Term</span>
                <span className="font-bold text-xs text-slate-900 dark:text-white">2024 – 2027 (MoHUA & DPIIT)</span>
              </div>
            </div>

            {/* Expertise Tags */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="font-bold text-xs text-slate-900 dark:text-white block">
                Specialized Technical Domains
              </span>
              <div className="flex flex-wrap gap-2 text-xs">
                {store.expertise.map((tag, i) => (
                  <span key={i} className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-semibold">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Empanelment Credentials */}
            <div className="space-y-2 pt-2">
              <span className="font-bold text-xs text-slate-900 dark:text-white block">
                Official Empanelment & Credentials
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400">MoHUA National Pool</span>
                  <div className="font-bold text-slate-900 dark:text-white">Smart Cities Expert Panelist</div>
                  <p className="text-[11px] text-slate-500">Autonomous evaluation authority for municipal outcome procurement</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-purple-600 dark:text-purple-400">NITI Aayog Framework</span>
                  <div className="font-bold text-slate-900 dark:text-white">TRL & Innovation Auditor</div>
                  <p className="text-[11px] text-slate-500">Empaneled under GFR Rule 194 innovation procurement</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400">Professional Body</span>
                  <div className="font-bold text-slate-900 dark:text-white">IEEE Senior Member</div>
                  <p className="text-[11px] text-slate-500">Intelligent Transportation Systems Society</p>
                </div>
              </div>
            </div>

            {/* Clearances Registry */}
            <div className="space-y-2 pt-2">
              <span className="font-bold text-xs text-slate-900 dark:text-white block">
                Conflict Screening Registry (Active Assignments)
              </span>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="font-semibold text-slate-900 dark:text-white">Municipal Solid Waste Route Optimization (PMC)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 border border-emerald-300">
                    No Conflict Declared ✓
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 dark:text-white">Edge-AI Adaptive Traffic Control (Delhi Traffic)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 border border-emerald-300">
                    Scores Sealed & Completed ✓
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: CONFIRM SCORE LOCK                                               */}
      {/* ========================================================================= */}
      {showLockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Lock & Certify Score for {activeApp.blindCode}
                </h3>
                <span className="text-xs text-slate-500">Immutable Evaluation Lock</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Applicant:</span>
                <span className="font-bold text-slate-900 dark:text-white">{activeApp.blindCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Calculated Weighted Total:</span>
                <span className="font-mono font-bold text-blue-600 text-sm">{liveWeightedScore} / 100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Red Flag Status:</span>
                <span className={`font-bold ${currentRedFlag ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {currentRedFlag ? `Flagged (${currentRedFlagReason})` : 'Clean — No Flag'}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Locked scores cannot be edited and are added to the audit trail. Once all panel members complete scoring, consensus rankings will be computed.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowLockModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleLockScore}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Confirm & Lock Score</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: REPORT LATE CONFLICT                                             */}
      {/* ========================================================================= */}
      {showLateConflictModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 space-y-4 border border-rose-200 dark:border-rose-800 shadow-2xl">
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-rose-900 dark:text-rose-200">
                  Report Late Conflict / Recognised Applicant
                </h3>
                <span className="text-xs text-rose-600">Immediate Recusal Protocol</span>
              </div>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              Because evaluation is conducted on blind proposals, you may inadvertently recognise an applicant from their unique mathematical approach, patent citation, or team details.
            </p>

            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-900 dark:text-rose-200 font-medium">
              Clicking <strong>"I recognise this applicant"</strong> will immediately remove you from this evaluation panel, cancel existing draft scores, and trigger an automated draw for a neutral replacement panel member from the MoHUA pool.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowLateConflictModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleLateConflictConfirm}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <UserX className="w-3.5 h-3.5" />
                <span>I recognise this applicant (Recuse Me)</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

// Helper: Format currency
const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '₹ 0';
  return '₹ ' + Number(amount).toLocaleString('en-IN');
};
