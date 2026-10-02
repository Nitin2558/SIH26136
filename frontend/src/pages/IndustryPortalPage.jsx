import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Award, 
  Building2, 
  Send, 
  FileText, 
  ExternalLink, 
  Layers, 
  Sparkles,
  FileSpreadsheet,
  ArrowRight,
  Rocket,
  Scale,
  Clock,
  Download,
  Eye,
  Lock,
  Unlock,
  Check,
  X,
  Search,
  Filter,
  UserCheck,
  MessageSquare,
  TrendingUp,
  FileCheck,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Info,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { 
  getSharedValidationState, 
  saveSharedValidationState, 
  computeSuggestedDecision, 
  formatIndianCurrency 
} from '../services/sharedValidationStore';

export const IndustryPortalPage = ({ activeTab = 'industry', setActiveTab, setSelectedTeamId }) => {
  const { user } = useAuth();
  
  // Map activeTab to internal section
  const getSectionFromTab = (tab) => {
    switch (tab) {
      case 'validator-assigned': return 'assigned';
      case 'validator-workspace': return 'workspace';
      case 'validator-reports': return 'reports';
      case 'validator-conflict': return 'conflict';
      case 'validator-messages': return 'messages';
      case 'validator-profile': return 'profile';
      default: return 'overview';
    }
  };

  const currentSection = getSectionFromTab(activeTab);

  // Shared store state
  const [store, setStore] = useState(getSharedValidationState());

  useEffect(() => {
    const handleUpdate = () => {
      setStore(getSharedValidationState());
    };
    window.addEventListener('sih-validation-update', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('sih-validation-update', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // --- SECTION B: ASSIGNED PILOTS STATE ---
  const [pilotSearch, setPilotSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [domainFilter, setDomainFilter] = useState('All');
  const [stateFilter, setStateFilter] = useState('All');

  const assignedPilotsList = [
    {
      id: 'pilot-1',
      title: 'Garbage trucks reach homes late',
      domain: 'Smart Cities & CleanTech',
      state: 'Maharashtra',
      duration: '12 Weeks',
      status: 'Report Submitted (Goal Met)',
      statusColor: 'emerald',
      description: 'Dynamic collection route optimization across municipal vehicles with GPS validation in Pune.',
      department: 'Pune Municipal Corporation',
      startup: 'CleanRoute Technologies',
      targetKpi: 'Late Arrivals (≤ 25%)',
      grant: 1250000,
      canOpenWorkspace: true
    },
    {
      id: 'chal-2',
      title: 'Water is lost from leaking pipes',
      domain: 'Water',
      state: 'Karnataka',
      duration: '14 Weeks',
      status: 'Report Submitted (Goal Met)',
      statusColor: 'emerald',
      description: 'Acoustic leakage sensing telemetry in Bengaluru distribution pipelines verified by IISc Urban Water Lab.',
      department: 'Bengaluru Water Supply Board',
      startup: 'AquaSense Labs',
      targetKpi: 'Water Loss (≤ 15%)',
      grant: 1800000,
      canOpenWorkspace: true
    },
    {
      id: 'chal-3',
      title: 'Ambulances get stuck at red lights',
      domain: 'Traffic',
      state: 'Delhi',
      duration: '16 Weeks',
      status: 'Report Submitted (Partly Met)',
      statusColor: 'amber',
      description: 'Edge-AI adaptive green corridor signaling along arterial ambulance corridors in Delhi.',
      department: 'Traffic Management Directorate',
      startup: 'SignalSetu',
      targetKpi: 'Transit Delay (≤ 10 min)',
      grant: 1600000,
      canOpenWorkspace: false
    },
    {
      id: 'chal-6',
      title: 'Pothole complaints are fixed too slowly',
      domain: 'Roads',
      state: 'Rajasthan',
      duration: '10 Weeks',
      status: 'Trial Stopped (Goal Not Met)',
      statusColor: 'rose',
      description: 'Automated road defect detection tested by MNIT Jaipur Civil Lab; concluded without city expansion.',
      department: 'Jaipur Municipal Corporation',
      startup: 'RoadWatch AI',
      targetKpi: 'Fix turnaround (≤ 10 days)',
      grant: 700000,
      canOpenWorkspace: false
    }
  ];

  const filteredPilots = assignedPilotsList.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(pilotSearch.toLowerCase()) ||
                          p.department.toLowerCase().includes(pilotSearch.toLowerCase()) ||
                          p.startup.toLowerCase().includes(pilotSearch.toLowerCase());
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    const matchesDomain = domainFilter === 'All' || p.domain === domainFilter;
    const matchesState = stateFilter === 'All' || p.state === stateFilter;
    return matchesSearch && matchesStatus && matchesDomain && matchesState;
  });

  // --- SECTION C: VERIFICATION WORKSPACE STATE ---
  const isConflictCleared = store.conflictStatus['pilot-1']?.isDeclared && !store.conflictStatus['pilot-1']?.hasConflict;
  const isReportLocked = store.verification.status === 'locked';

  const [verifiedValueInput, setVerifiedValueInput] = useState(store.verification.verifiedValue || 22.0);
  const [selectedDecision, setSelectedDecision] = useState(store.verification.decision || 'Achieved');
  const [overrideJustification, setOverrideJustification] = useState(store.verification.overrideJustification || '');
  const [methodologyComments, setMethodologyComments] = useState(store.verification.methodologyNotes || '');
  const [integrityChecks, setIntegrityChecks] = useState(store.verification.integrityChecklist);
  const [attributionFlags, setAttributionFlags] = useState(store.verification.attributionFlags);
  const [attributionNotes, setAttributionNotes] = useState(store.verification.attributionNotes);
  const [declarationChecked, setDeclarationChecked] = useState(true);
  const [uploadedPdf, setUploadedPdf] = useState(store.verification.pdfFile);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitToast, setSubmitToast] = useState('');

  // Modals
  const [previewFile, setPreviewFile] = useState(null);
  const [viewReportModalData, setViewReportModalData] = useState(null);

  // Auto-suggested decision calculation
  const suggestedDecision = computeSuggestedDecision(Number(verifiedValueInput), store.targetDelay, store.baselineDelay);
  const isDecisionOverridden = selectedDecision !== suggestedDecision;

  // Confounding factors warning check
  const hasAttributionFlag = Object.values(attributionFlags).some(Boolean);

  // Live M2 payment status based on chosen decision
  const getLiveM2Status = () => {
    if (selectedDecision === 'Achieved') {
      return { label: 'Ready for Release', color: 'emerald', border: 'border-emerald-300 dark:border-emerald-800', bg: 'bg-emerald-50 dark:bg-emerald-950', text: 'text-emerald-700 dark:text-emerald-300' };
    }
    if (selectedDecision === 'Partially Achieved') {
      return { label: 'On Hold, Officer review required', color: 'amber', border: 'border-amber-300 dark:border-amber-800', bg: 'bg-amber-50 dark:bg-amber-950', text: 'text-amber-700 dark:text-amber-300' };
    }
    return { label: 'Blocked', color: 'rose', border: 'border-rose-300 dark:border-rose-800', bg: 'bg-rose-50 dark:bg-rose-950', text: 'text-rose-700 dark:text-rose-300' };
  };

  const liveM2 = getLiveM2Status();

  // Handle Submit & Sign Report
  const handleSubmitReport = () => {
    const reportId = `REP-PMC-M2-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newReport = {
      id: reportId,
      pilotId: 'pilot-1',
      pilotTitle: store.pilotTitle,
      department: store.procuringAuthority,
      startup: store.startupName,
      milestone: 'Milestone 2 (40% - ₹ 5,00,000)',
      targetKpi: 'Delay ≤ 25.0%',
      verifiedResult: `${Number(verifiedValueInput).toFixed(1)}%`,
      decision: selectedDecision,
      status: 'Locked',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      auditor: store.validatorName,
      organization: store.validatorOrg,
      auditTrail: [
        { time: '18 Sep 2026, 09:30 AM', event: `Conflict Declaration executed by ${store.validatorName} (No conflict found)` },
        { time: '19 Sep 2026, 02:15 PM', event: 'Raw GPS logs (GPS_logs_wards_12_13.csv) imported & SHA-256 verified' },
        { time: '20 Sep 2026, 10:45 AM', event: `Attribution check completed: ${hasAttributionFlag ? 'External factors adjusted' : '0 confounding external factors identified'}` },
        { time: `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, Today`, event: `Final Audit Certificate ${reportId} certified and digitally locked` },
        { time: `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, Today`, event: 'Payment sanction notice dispatched to PMC Officer Dr. Sunita Verma' }
      ]
    };

    saveSharedValidationState(prev => {
      // update milestone 2 status
      const updatedMilestones = prev.milestones.map(m => {
        if (m.id === 'ms-2') {
          return {
            ...m,
            status: selectedDecision === 'Achieved' ? 'ready_for_release' : (selectedDecision === 'Partially Achieved' ? 'on_hold' : 'blocked'),
            statusLabel: liveM2.label,
            description: `Verified ${Number(verifiedValueInput).toFixed(1)}% delay achieved (Sanctioned in Escrow by IIT Delhi Audit)`
          };
        }
        return m;
      });

      return {
        ...prev,
        verifiedResult: Number(verifiedValueInput),
        verification: {
          ...prev.verification,
          status: 'locked',
          verifiedValue: Number(verifiedValueInput),
          suggestedDecision,
          decision: selectedDecision,
          isOverridden: isDecisionOverridden,
          overrideJustification,
          methodologyNotes: methodologyComments,
          reportId,
          submittedAt: `${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          signedBy: store.validatorName,
          pdfFile: uploadedPdf || { name: 'IITD_PMC_M2_Independent_Audit_Report.pdf', size: '2.4 MB', hash: 'sha256:7f83b1657ff1fc53b92dc18148a1d65b' },
          integrityChecklist: integrityChecks,
          attributionFlags,
          attributionNotes
        },
        milestones: updatedMilestones,
        reports: [newReport, ...prev.reports.filter(r => r.id !== reportId)]
      };
    });

    setShowSubmitModal(false);
    setSubmitToast(`✓ Audit Certificate ${reportId} locked and dispatched! Milestone 2 updated to "${liveM2.label}".`);
    setTimeout(() => setSubmitToast(''), 6000);
  };

  // --- SECTION D: REPORTS STATE ---
  const [reportSearch, setReportSearch] = useState('');
  const [expandedReportId, setExpandedReportId] = useState(null);

  const filteredReports = store.reports.filter(r => 
    r.id.toLowerCase().includes(reportSearch.toLowerCase()) ||
    r.pilotTitle.toLowerCase().includes(reportSearch.toLowerCase()) ||
    r.startup.toLowerCase().includes(reportSearch.toLowerCase())
  );

  // --- SECTION E: CONFLICT DECLARATION STATE ---
  const [selectedConflictPilot, setSelectedConflictPilot] = useState('pilot-1');
  const [conflictTypeChoice, setConflictTypeChoice] = useState('no_conflict');
  const [conflictQuestions, setConflictQuestions] = useState({
    shareholding: 'no',
    employment: 'no',
    relationship: 'no',
    financial: 'no'
  });
  const [signatureInput, setSignatureInput] = useState('Prof. Anil Kapoor');
  const [conflictSubmitMsg, setConflictSubmitMsg] = useState('');

  const hasAnyConflictAnswerYes = Object.values(conflictQuestions).some(v => v === 'yes') || conflictTypeChoice === 'has_conflict';

  const handleConflictSubmit = (e) => {
    e.preventDefault();
    const isClean = !hasAnyConflictAnswerYes;

    saveSharedValidationState(prev => ({
      ...prev,
      conflictStatus: {
        ...prev.conflictStatus,
        [selectedConflictPilot]: {
          isDeclared: true,
          hasConflict: !isClean,
          signedBy: signatureInput,
          signDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          signature: signatureInput,
          answers: conflictQuestions,
          statusText: isClean ? 'No conflict declared. Verified neutral.' : 'Conflict declared: Re-assignment requested.'
        }
      }
    }));

    if (isClean) {
      setConflictSubmitMsg('✓ Conflict Declaration filed successfully. Verification Workspace is unlocked.');
    } else {
      setConflictSubmitMsg('⚠️ Conflict recorded. This pilot has been locked and marked for department re-assignment.');
    }
    setTimeout(() => setConflictSubmitMsg(''), 6000);
  };

  // --- SECTION F: MESSAGES STATE ---
  const [activeConvId, setActiveConvId] = useState('conv-officer');
  const [msgInput, setMsgInput] = useState('');

  const currentThread = store.messages.threads[activeConvId] || [];
  const currentPartner = store.messages.conversations.find(c => c.id === activeConvId);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!msgInput.trim()) return;

    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: store.validatorName,
      isMe: true,
      time: 'Just now',
      text: msgInput.trim()
    };

    saveSharedValidationState(prev => {
      const existingThread = prev.messages.threads[activeConvId] || [];
      const updatedConversations = prev.messages.conversations.map(c => {
        if (c.id === activeConvId) {
          return { ...c, lastMessage: newMsg.text, lastTime: 'Just now' };
        }
        return c;
      });

      return {
        ...prev,
        messages: {
          ...prev.messages,
          conversations: updatedConversations,
          threads: {
            ...prev.messages.threads,
            [activeConvId]: [...existingThread, newMsg]
          }
        }
      };
    });

    setMsgInput('');
  };

  return (
    <div className="space-y-6 py-2">
      
      {/* Toast Notification */}
      {submitToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center justify-between shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{submitToast}</span>
          </div>
          <button onClick={() => setSubmitToast('')} className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded-lg">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Breadcrumb Header for Inner Pages */}
      {currentSection !== 'overview' && (
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Validator Dashboard</span>
            <span>/</span>
            <span className="font-extrabold text-slate-900 dark:text-white capitalize">
              {currentSection === 'assigned' && 'Assigned Pilots'}
              {currentSection === 'workspace' && 'Verification Workspace'}
              {currentSection === 'reports' && 'Reports & Audit Ledger'}
              {currentSection === 'conflict' && 'Conflict Declaration'}
              {currentSection === 'messages' && 'Messages'}
              {currentSection === 'profile' && 'Validator Profile'}
            </span>
          </div>
          <button 
            onClick={() => setActiveTab('industry')}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>← Back to Overview</span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE A: VALIDATOR DASHBOARD (OVERVIEW)                                    */}
      {/* ========================================================================= */}
      {currentSection === 'overview' && (
        <div className="space-y-6">
          
          {/* Hero Card */}
          <div className="civic-card p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-6">
            
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    Independent Validation Command Portal
                  </h1>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800">
                    Neutral Third Party
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
                  Verify pilot outcomes from raw data. Your signed report is final and triggers milestone escrow release under GFR Rule 194.
                </p>
              </div>

              {/* Action Buttons & Capacity Pill */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold border border-slate-200 dark:border-slate-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-slate-700 dark:text-slate-300">Active Assignments: 1 / 3</span>
                </div>
                <button
                  onClick={() => setActiveTab('validator-assigned')}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Rocket className="w-3.5 h-3.5" />
                  <span>Open Assigned Pilots</span>
                </button>
              </div>
            </div>

            {/* Two Side-by-Side Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                  <Scale className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Independence Rule</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Validators must have no shareholding, employment, or personal link with the startup or department. A Conflict Declaration is mandatory before any verification can begin.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 space-y-1.5">
                <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Blind Data Rule</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Validate from raw data (GPS logs, complaint records, sensor streams), never from the startup's summary or self-reported claims.
                </p>
              </div>

            </div>

            {/* Info Strip: Pending Actions */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                <span>
                  <strong>Pending Actions:</strong> 1 verification awaiting your report for Pune Municipal Waste Pilot (Milestone 2).
                </span>
              </div>
              <button
                onClick={() => setActiveTab('validator-workspace')}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer shrink-0"
              >
                <span>Complete Verification →</span>
              </button>
            </div>

          </div>

          {/* Stats Row (4 Small Cards) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Assigned Pilots</div>
              <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">3</div>
              <div className="text-[10px] font-semibold text-slate-500">2 Active • 1 Completed</div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Pending Verification</div>
              <div className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400">1</div>
              <div className="text-[10px] font-semibold text-amber-600/80">Milestone 2 Awaiting Sign-off</div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Reports Submitted</div>
              <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">{store.reports.length}</div>
              <div className="text-[10px] font-semibold text-emerald-600/80">100% Audit Adherence</div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Avg. Turnaround</div>
              <div className="text-2xl font-black font-mono text-blue-600 dark:text-blue-400">4.2 Days</div>
              <div className="text-[10px] font-semibold text-slate-500">Benchmark SLA: 7 Days</div>
            </div>

          </div>

          {/* Featured Pilot Card (Same style as Active Sandbox Pilot card) */}
          <div className="civic-card p-6 md:p-8 rounded-3xl border border-blue-200 dark:border-blue-900 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/30 space-y-6 shadow-xs">
            
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                    Verification Due (Stage 6 of 8)
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                    Work Progress: 66% Complete
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Municipal Solid Waste Collection Route Optimization & Delay Reduction
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Domain: <strong>Smart Cities & CleanTech</strong> • Procuring Authority: <strong>Pune Municipal Corporation (PMC)</strong> • Startup: <strong>ERAER</strong> • Pilot Grant: <strong>{formatIndianCurrency(store.grantAmount)}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('validator-workspace')}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>Open Verification Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setActiveTab('validator-assigned')}
                  className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-blue-500" />
                  <span>View Assigned Pilots</span>
                </button>
              </div>
            </div>

            {/* Amber Next Action Required Box */}
            <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <strong className="font-bold text-amber-900 dark:text-amber-200">Next Action Required:</strong>
                  <span className="text-amber-800 dark:text-amber-300 ml-1.5">
                    Submit verified result and signed report for Milestone 2.
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('validator-workspace')}
                className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shrink-0 cursor-pointer shadow-2xs"
              >
                Open Verification Workspace
              </button>
            </div>

            {/* KPI Progress Preview Strip */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  {store.kpiTitle}
                </span>
                <div className="flex items-center gap-3 text-[11px] text-slate-500">
                  <span>Baseline: <strong>40.0%</strong></span>
                  <span>•</span>
                  <span>Target: <strong>≤ 25.0%</strong></span>
                  <span>•</span>
                  <span>Startup Claim: <strong className="text-blue-600">20.0%</strong></span>
                  <span>•</span>
                  <span>Verified Result: <strong className="text-emerald-600">{store.verifiedResult}%</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold text-xs flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>IIT Delhi Certified (Audit Complete)</span>
                </span>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE B: ASSIGNED PILOTS                                                   */}
      {/* ========================================================================= */}
      {currentSection === 'assigned' && (
        <div className="space-y-6">
          
          {/* Header Controls: Search & Filters */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="flex flex-col md:flex-row gap-3">
              
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search assigned pilots by keyword, city, or sector..."
                  value={pilotSearch}
                  onChange={e => setPilotSearch(e.target.value)}
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
                  <option value="Verification Due">Verification Due</option>
                  <option value="Data Collection Ongoing">Data Collection Ongoing</option>
                  <option value="Report Submitted">Report Submitted</option>
                </select>

                <select
                  value={domainFilter}
                  onChange={e => setDomainFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium focus:outline-none"
                >
                  <option value="All">All Domains</option>
                  <option value="Smart Cities & CleanTech">Smart Cities & CleanTech</option>
                  <option value="Water & Sanitation">Water & Sanitation</option>
                  <option value="Mobility">Mobility</option>
                </select>

                <select
                  value={stateFilter}
                  onChange={e => setStateFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium focus:outline-none"
                >
                  <option value="All">All States</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Delhi">Delhi</option>
                </select>

              </div>

            </div>
          </div>

          {/* 2-Column Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredPilots.map(pilotItem => (
              <div 
                key={pilotItem.id} 
                className="civic-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:border-blue-300 dark:hover:border-blue-800 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  
                  {/* Top Badge & Location/Duration */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                      pilotItem.status === 'Verification Due'
                        ? 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                        : pilotItem.status === 'Report Submitted'
                          ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                          : 'bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-800'
                    }`}>
                      {pilotItem.status}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500">
                      {pilotItem.state} • {pilotItem.duration}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug">
                      {pilotItem.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {pilotItem.description}
                    </p>
                  </div>

                  {/* Details Box */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Department:</span>
                      <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">{pilotItem.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Startup:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{pilotItem.startup}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Target KPI:</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">{pilotItem.targetKpi}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Pilot Grant:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{formatIndianCurrency(pilotItem.grant)}</span>
                    </div>
                  </div>

                </div>

                {/* Footer with CTA */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">ID: {pilotItem.id}</span>
                  {pilotItem.canOpenWorkspace ? (
                    <button
                      onClick={() => setActiveTab('validator-workspace')}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span>Open Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : pilotItem.status === 'Report Submitted' ? (
                    <button
                      onClick={() => setActiveTab('validator-reports')}
                      className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-500" />
                      <span>View Report</span>
                    </button>
                  ) : (
                    <button
                      disabled
                      className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-bold text-xs cursor-not-allowed"
                    >
                      Not yet ready
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE C: VERIFICATION WORKSPACE                                            */}
      {/* ========================================================================= */}
      {currentSection === 'workspace' && (
        <div className="space-y-6">
          
          {/* Workspace Pilot Header */}
          <div className="civic-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Stage 6 of 8: Independent Verification
                </span>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                  Milestone 2 of 3 (40% Escrow)
                </span>
                {isReportLocked && (
                  <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Report Locked ✓
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {store.pilotTitle}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Procuring Dept: <strong>{store.procuringAuthority}</strong> • Startup: <strong>{store.startupFullName}</strong> • Grant: <strong>{formatIndianCurrency(store.grantAmount)}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('validator-conflict')}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <Scale className="w-3.5 h-3.5 text-blue-500" />
                <span>Declaration Status</span>
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
                Conflict Declaration Required Before Accessing Raw Telemetry & Scoring
              </h3>
              <p className="text-xs text-amber-800 dark:text-amber-300 max-w-lg mx-auto">
                Under GFR Rule 194 procurement integrity rules, validators must declare freedom from commercial, advisory, or familial conflicts before telemetry unlocking.
              </p>
              <button
                onClick={() => setActiveTab('validator-conflict')}
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
                  <strong>Conflict Cleared:</strong> Executed by <strong>{store.validatorName}</strong> on {store.conflictStatus['pilot-1']?.signDate || '18 Sep 2026'}. Fully authorized to certify outcome.
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-700">
                Neutral Verified ✓
              </span>
            </div>
          )}

          {/* SECTION 1: KPI COMPARISON CARD */}
          <div className="civic-card p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-6">
            
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Section 1: Benchmark Comparison</span>
                <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  Target KPI: {store.kpiTitle}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  Gap: 2.0 pts difference
                </span>
              </div>
            </div>

            {/* Visual Bar with 4 Markers & Legend */}
            <div className="space-y-4 pt-2">
              
              {/* Progress track */}
              <div className="relative pt-6 pb-2">
                {/* Track background */}
                <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-full relative overflow-visible">
                  
                  {/* Target Zone (0% to 25%) */}
                  <div className="absolute left-0 top-0 h-full bg-emerald-500/20 dark:bg-emerald-500/30 rounded-l-full border-r-2 border-emerald-500" style={{ width: '62.5%' }}></div>

                  {/* Marker 1: Baseline 40% (at 100% position of scale 0-40) */}
                  <div className="absolute right-0 top-0 -translate-y-6 text-center" style={{ right: '0%' }}>
                    <span className="text-[10px] font-bold text-slate-500 block">Baseline</span>
                    <div className="w-1.5 h-6 bg-slate-400 mx-auto rounded"></div>
                  </div>

                  {/* Marker 2: Mandated Target 25% (at 62.5%) */}
                  <div className="absolute top-0 -translate-y-6 text-center -translate-x-1/2" style={{ left: '62.5%' }}>
                    <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 block">Target ≤ 25.0%</span>
                    <div className="w-1.5 h-6 bg-purple-600 dark:bg-purple-400 mx-auto rounded"></div>
                  </div>

                  {/* Marker 3: Startup Claim 20% (at 50%) */}
                  <div className="absolute top-0 -translate-y-6 text-center -translate-x-1/2" style={{ left: '50%' }}>
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 block">Claim: 20.0%</span>
                    <div className="w-2.5 h-6 bg-blue-600 mx-auto rounded-full shadow-sm"></div>
                  </div>

                  {/* Marker 4: Verified Result 22% (at 55%) */}
                  <div className="absolute top-0 -translate-y-6 text-center -translate-x-1/2" style={{ left: '55%' }}>
                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 block">Verified: 22.0%</span>
                    <div className="w-3 h-6 bg-emerald-500 mx-auto rounded-full shadow-md animate-pulse"></div>
                  </div>

                </div>
              </div>

              {/* Legend with Gap Highlight */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-500 block">1. Baseline Delay</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">40.0%</span>
                </div>
                <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800">
                  <span className="text-[10px] text-purple-600 dark:text-purple-400 block">2. Mandated Target</span>
                  <span className="font-mono font-bold text-purple-700 dark:text-purple-300">≤ 25.0% (Ceiling)</span>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 block">3. Startup Self-Claim</span>
                  <span className="font-mono font-bold text-blue-700 dark:text-blue-300">20.0% (-20.0 pts)</span>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block">4. Verified Result</span>
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">22.0% (-18.0 pts)</span>
                </div>
              </div>

              {/* Highlight Notice */}
              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <strong className="text-slate-900 dark:text-white">Binding Legal Ground:</strong> Startup claim vs verified difference is <strong>2.0 pts</strong>. Under GFR Rule 194, only the <strong>VERIFIED value (22.0%)</strong> is valid for triggering payment sanction and scale-up approval.
              </div>

            </div>

          </div>

          {/* SECTION 2: RAW DATA REVIEW (TABLE + CHECKS) */}
          <div className="civic-card p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-6">
            
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Section 2: Telemetry Audit</span>
                <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                  Raw Data Review & Cryptographic Verification
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                3 Files Available
              </span>
            </div>

            {/* Files Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 border-b border-slate-200 dark:border-slate-800 font-semibold">
                  <tr>
                    <th className="py-3 px-4">File Name</th>
                    <th className="py-3 px-3">Size</th>
                    <th className="py-3 px-3">Upload Date</th>
                    <th className="py-3 px-3">Source Entity</th>
                    <th className="py-3 px-3">SHA-256</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-500" />
                      GPS_logs_wards_12_13.csv
                    </td>
                    <td className="py-3 px-3">18.4 MB</td>
                    <td className="py-3 px-3">18 Sep 2026</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        Startup (ERAER)
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500">a3f9e2b1...</td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => setPreviewFile({
                          name: 'GPS_logs_wards_12_13.csv',
                          sha: 'a3f9e2b1897cda928e',
                          rows: [
                            { time: '2026-09-18 06:14:22', vehicle: 'MH-12-PMC-401', route: 'W12-R3', lat: '18.5204', lon: '73.8567', delay: '21.4%', fuel: '14.2 L' },
                            { time: '2026-09-18 06:28:10', vehicle: 'MH-12-PMC-402', route: 'W12-R4', lat: '18.5218', lon: '73.8582', delay: '22.1%', fuel: '13.8 L' },
                            { time: '2026-09-18 06:45:00', vehicle: 'MH-12-PMC-403', route: 'W13-R1', lat: '18.5310', lon: '73.8640', delay: '20.9%', fuel: '15.1 L' },
                            { time: '2026-09-18 07:05:45', vehicle: 'MH-12-PMC-404', route: 'W13-R2', lat: '18.5342', lon: '73.8695', delay: '22.8%', fuel: '14.6 L' }
                          ]
                        })}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-100 cursor-pointer text-[11px]"
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => alert('Simulated raw telemetry download initiated: GPS_logs_wards_12_13.csv')}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 cursor-pointer text-[11px]"
                      >
                        Download
                      </button>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-500" />
                      Complaint_records.csv
                    </td>
                    <td className="py-3 px-3">4.2 MB</td>
                    <td className="py-3 px-3">19 Sep 2026</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                        Department (PMC)
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500">89bc441f...</td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => setPreviewFile({
                          name: 'Complaint_records.csv',
                          sha: '89bc441f92e0ab771',
                          rows: [
                            { time: '2026-09-19 09:12:00', vehicle: 'PMC Grievance Portal', route: 'Ward 12 Bin #4', lat: '18.5209', lon: '73.8571', delay: 'Grievance: Cleared in 18 min', fuel: 'N/A' },
                            { time: '2026-09-19 11:34:10', vehicle: 'PMC Grievance Portal', route: 'Ward 13 Bin #12', lat: '18.5322', lon: '73.8655', delay: 'Grievance: Cleared in 22 min', fuel: 'N/A' }
                          ]
                        })}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-100 cursor-pointer text-[11px]"
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => alert('Simulated raw dispatch download initiated: Complaint_records.csv')}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 cursor-pointer text-[11px]"
                      >
                        Download
                      </button>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-500" />
                      Sensor_telemetry_M2.csv
                    </td>
                    <td className="py-3 px-3">32.1 MB</td>
                    <td className="py-3 px-3">20 Sep 2026</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        Startup (ERAER)
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500">d4e5f67a...</td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => setPreviewFile({
                          name: 'Sensor_telemetry_M2.csv',
                          sha: 'd4e5f67a213904fc',
                          rows: [
                            { time: '2026-09-20 05:00:00', vehicle: 'IoT-LiDAR-01', route: 'PMC-East-W12', lat: '18.5200', lon: '73.8560', delay: 'Optical Fill Level: 84%', fuel: 'Battery: 98%' },
                            { time: '2026-09-20 05:30:15', vehicle: 'IoT-LiDAR-02', route: 'PMC-East-W13', lat: '18.5312', lon: '73.8648', delay: 'Optical Fill Level: 92%', fuel: 'Battery: 94%' }
                          ]
                        })}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-100 cursor-pointer text-[11px]"
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => alert('Simulated telemetry stream download: Sensor_telemetry_M2.csv')}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 cursor-pointer text-[11px]"
                      >
                        Download
                      </button>
                    </td>
                  </tr>

                </tbody>
              </table>
            </div>

            {/* Mini Before / After Chart */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
              <span className="font-bold text-xs text-slate-900 dark:text-white block">
                Audited Transit Delay: Baseline Period vs. Pilot Sandbox Execution
              </span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Baseline Column */}
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-medium">Baseline (Pre-Pilot Audit)</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">40.1% Avg Delay</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-slate-400 h-full rounded-full" style={{ width: '100%' }}></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Ward 12: 40.8%</span>
                    <span>Ward 13: 39.4%</span>
                  </div>
                </div>

                {/* Pilot Period Column */}
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-emerald-600 font-bold">Pilot Sandbox (Audited Period)</span>
                    <span className="font-mono font-bold text-emerald-600">22.0% Avg Delay</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '55%' }}></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-emerald-600/80 font-medium">
                    <span>Ward 12: 22.2%</span>
                    <span>Ward 13: 21.8%</span>
                    <span className="font-bold text-emerald-600">Exceeds Ceiling (≤ 25%)</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Data Integrity Checklist */}
            <div className="space-y-2 pt-2">
              <span className="font-bold text-xs text-slate-900 dark:text-white block">
                Data Integrity Checklist (All mandatory for certification):
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
                
                {[
                  { key: 'rawNotSummarized', label: 'Data is raw and not summarized' },
                  { key: 'continuousTimestamps', label: 'Timestamps are continuous & gap-free' },
                  { key: 'noDuplicateRows', label: 'No duplicate or edited rows detected' },
                  { key: 'sampleSizeAdequate', label: 'Sample size adequate (N=450+ routes, 25 vehicles)' },
                  { key: 'checksumsMatch', label: 'SHA-256 checksums match manifest' }
                ].map(item => (
                  <label 
                    key={item.key}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <input
                      type="checkbox"
                      disabled={isReportLocked || !isConflictCleared}
                      checked={integrityChecks[item.key]}
                      onChange={e => setIntegrityChecks({ ...integrityChecks, [item.key]: e.target.checked })}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-slate-800 dark:text-slate-200 font-medium text-[11px] leading-tight">
                      {item.label}
                    </span>
                  </label>
                ))}

              </div>
            </div>

          </div>

          {/* SECTION 3: ATTRIBUTION CHECK */}
          <div className="civic-card p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-4">
            
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Section 3: Confounding Factors</span>
              <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-500" />
                Attribution Check ("Was it the solution, or something else?")
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Evaluate whether external conditions distorted delay reduction measurements during the 30-day sandbox trial.
              </p>
            </div>

            {hasAttributionFlag && (
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 flex items-center gap-2 text-xs text-amber-800 dark:text-amber-200 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>⚠️ External factor flagged: describe the adjustment made in your comments below.</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              
              {[
                { key: 'rainfall', label: 'Rainfall different from baseline period' },
                { key: 'festival', label: 'Festival or public holiday impact' },
                { key: 'fleetSize', label: 'Municipal fleet size change during trial' },
                { key: 'roadWork', label: 'Road work or civil engineering diversions' },
                { key: 'dataGaps', label: 'Cellular network or sensor telemetry gaps' }
              ].map(item => (
                <div key={item.key} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      disabled={isReportLocked || !isConflictCleared}
                      checked={attributionFlags[item.key]}
                      onChange={e => setAttributionFlags({ ...attributionFlags, [item.key]: e.target.checked })}
                      className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
                    />
                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                      {item.label}
                    </span>
                  </label>
                  {attributionFlags[item.key] && (
                    <input
                      type="text"
                      disabled={isReportLocked || !isConflictCleared}
                      placeholder="Optional: specify normalized adjustment or notes..."
                      value={attributionNotes[item.key] || ''}
                      onChange={e => setAttributionNotes({ ...attributionNotes, [item.key]: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
                    />
                  )}
                </div>
              ))}

            </div>

          </div>

          {/* SECTION 4: VERIFICATION DECISION & PDF ATTACHMENT */}
          <div className="civic-card p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-6">
            
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Section 4: Neutral Determination</span>
                <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-600" />
                  Verification Decision & Final Certification
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                GFR Rule 194 Outcome Trigger
              </span>
            </div>

            {/* Input & Suggested Decision Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-900 dark:text-white block">
                  Verified Result (%) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    disabled={isReportLocked || !isConflictCleared}
                    value={verifiedValueInput}
                    onChange={e => setVerifiedValueInput(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-base font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-4 top-3 text-xs font-bold text-slate-400">% Delay</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Target is ≤ 25.0%. Baseline was 40.0%.
                </p>
              </div>

              {/* Auto-suggested Decision Chip */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-900 dark:text-white block">
                  Auto-Suggested Determination
                </label>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                      suggestedDecision === 'Achieved'
                        ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                        : suggestedDecision === 'Partially Achieved'
                          ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300'
                          : 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-300'
                    }`}>
                      {suggestedDecision}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {suggestedDecision === 'Achieved' && '(Verified ≤ 25.0% target)'}
                      {suggestedDecision === 'Partially Achieved' && '(Verified ≤ 32.5%, ≥50% progress gap)'}
                      {suggestedDecision === 'Not Achieved' && '(Verified > 32.5% gap limit)'}
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Algorithmic</span>
                </div>
              </div>

            </div>

            {/* Decision Radio Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-900 dark:text-white block">
                Binding Decision <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                
                {[
                  { key: 'Achieved', label: 'Achieved', sub: 'Target fully met (≤ 25.0%)', color: 'emerald' },
                  { key: 'Partially Achieved', label: 'Partially Achieved', sub: 'Substantial progress (≤ 32.5%)', color: 'amber' },
                  { key: 'Not Achieved', label: 'Not Achieved', sub: 'Outcome target failed', color: 'rose' }
                ].map(opt => (
                  <label
                    key={opt.key}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                      selectedDecision === opt.key
                        ? 'bg-blue-50/80 dark:bg-blue-950/50 border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/20'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="validationDecision"
                      disabled={isReportLocked || !isConflictCleared}
                      value={opt.key}
                      checked={selectedDecision === opt.key}
                      onChange={e => setSelectedDecision(e.target.value)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white">{opt.label}</div>
                      <div className="text-[10px] text-slate-500">{opt.sub}</div>
                    </div>
                  </label>
                ))}

              </div>
            </div>

            {/* Mandatory Override Justification */}
            {isDecisionOverridden && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-200">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Mandatory Override Justification (Required):</span>
                </div>
                <textarea
                  rows={2}
                  disabled={isReportLocked || !isConflictCleared}
                  value={overrideJustification}
                  onChange={e => setOverrideJustification(e.target.value)}
                  placeholder="Explain why your binding decision differs from the mathematical suggestion..."
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            )}

            {/* Comments & Methodology */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-900 dark:text-white block">
                Technical Methodology & Audit Findings
              </label>
              <textarea
                rows={3}
                disabled={isReportLocked || !isConflictCleared}
                value={methodologyComments}
                onChange={e => setMethodologyComments(e.target.value)}
                placeholder="Detail the audit instrumentation, vehicle testbed protocol, and sample validity..."
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* PDF Report Upload (Drag & Drop) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-900 dark:text-white block">
                Signed Third-Party Audit PDF Document (.pdf only)
              </label>
              
              <div className="p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-center space-y-2">
                <FileCheck className="w-8 h-8 text-blue-500 mx-auto" />
                
                {uploadedPdf ? (
                  <div className="space-y-1">
                    <span className="font-mono font-bold text-xs text-slate-900 dark:text-white block">
                      {uploadedPdf.name} ({uploadedPdf.size})
                    </span>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 block">
                      SHA-256: {uploadedPdf.hash} • ✓ Cryptographic Integrity Checked
                    </span>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      Drag and drop your signed institutional certificate here, or click to browse
                    </p>
                    <p className="text-[10px] text-slate-400">Strictly accepts official .pdf up to 25 MB</p>
                  </div>
                )}

                {!isReportLocked && isConflictCleared && (
                  <button
                    onClick={() => setUploadedPdf({
                      name: 'IITD_PMC_M2_Independent_Audit_Report.pdf',
                      size: '2.4 MB',
                      hash: 'sha256:7f83b1657ff1fc53b92dc18148a1d65b'
                    })}
                    className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold text-xs hover:bg-blue-100 cursor-pointer"
                  >
                    {uploadedPdf ? 'Replace Document' : 'Attach Sample Audit PDF'}
                  </button>
                )}
              </div>
            </div>

            {/* Declaration Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  disabled={isReportLocked || !isConflictCleared}
                  checked={declarationChecked}
                  onChange={e => setDeclarationChecked(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 mt-0.5"
                />
                <span className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  I confirm this verification is independent, based on raw telemetry data, and complies with ISO/IEC 17025 neutrality standards. This electronic sign-off is binding under the Smart India Hackathon procurement framework.
                </span>
              </label>
            </div>

            {/* Submit Action */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="text-[11px] text-slate-500">
                Auditor: <strong>{store.validatorName}</strong> • {store.validatorOrg}
              </div>

              {!isReportLocked ? (
                <button
                  disabled={!isConflictCleared || !declarationChecked || (isDecisionOverridden && !overrideJustification.trim())}
                  onClick={() => setShowSubmitModal(true)}
                  className={`px-6 py-2.5 rounded-xl font-bold text-xs shadow-md flex items-center gap-2 transition-all ${
                    !isConflictCleared || !declarationChecked || (isDecisionOverridden && !overrideJustification.trim())
                      ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-emerald-600/20'
                  }`}
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Sign & Submit Report</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="px-4 py-2 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Report Certified & Locked ({store.verification.reportId})</span>
                  </div>
                  <button
                    onClick={() => {
                      saveSharedValidationState(prev => ({
                        ...prev,
                        verification: { ...prev.verification, status: 'pending' }
                      }));
                    }}
                    className="text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline cursor-pointer"
                  >
                    Unlock for Demo Editing
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* SECTION 5: LIVE PAYMENT IMPACT PREVIEW */}
          <div className="civic-card p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-4">
            
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Section 5: Escrow Impact</span>
                <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <Scale className="w-5 h-5 text-emerald-600" />
                  Live Milestone Escrow Release Trigger
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-slate-500">Total: {formatIndianCurrency(store.grantAmount)}</span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your determination directly governs Milestone 2 release sanction on the Startup's financial ledger:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              
              {/* Milestone 1 */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 space-y-1.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Milestone 1 (30%)</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                    Paid / Released
                  </span>
                </div>
                <div className="font-mono text-base font-bold text-slate-900 dark:text-white">₹ 3,75,000</div>
                <p className="text-[11px] text-slate-500">Testbed sensor baseline calibration (UTR Verified)</p>
              </div>

              {/* Milestone 2 (Live Dynamic Preview) */}
              <div className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 ${liveM2.border} space-y-1.5 shadow-2xs transition-all`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Milestone 2 (40%)</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${liveM2.bg} ${liveM2.text} ${liveM2.border}`}>
                    {liveM2.label}
                  </span>
                </div>
                <div className="font-mono text-base font-bold text-slate-900 dark:text-white">₹ 5,00,000</div>
                <p className="text-[11px] text-slate-500">
                  {selectedDecision === 'Achieved' && 'Verified 22.0% delay achieved (Sanctioned in Escrow)'}
                  {selectedDecision === 'Partially Achieved' && 'On Hold: Requires Department Officer review & adjusted tranche approval'}
                  {selectedDecision === 'Not Achieved' && 'Blocked: Outcome threshold not achieved. Escrow tranche retained.'}
                </p>
              </div>

              {/* Milestone 3 */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Milestone 3 (30%)</span>
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                    In Progress
                  </span>
                </div>
                <div className="font-mono text-base font-bold text-slate-900 dark:text-white">₹ 3,75,000</div>
                <p className="text-[11px] text-slate-500">Scale documentation & GFR Rule 194 memo draft</p>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE D: REPORTS                                                           */}
      {/* ========================================================================= */}
      {currentSection === 'reports' && (
        <div className="space-y-6">
          
          {/* Header search */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search submitted audit reports by ID, pilot, or startup..."
                value={reportSearch}
                onChange={e => setReportSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <span className="text-xs font-bold text-slate-500">
              {filteredReports.length} Certified Reports
            </span>
          </div>

          {/* Reports Table */}
          <div className="civic-card rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 border-b border-slate-200 dark:border-slate-800 font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">Report ID</th>
                    <th className="py-3.5 px-4">Pilot Name</th>
                    <th className="py-3.5 px-3">Startup</th>
                    <th className="py-3.5 px-3">Verified Result</th>
                    <th className="py-3.5 px-3">Decision</th>
                    <th className="py-3.5 px-3">Date</th>
                    <th className="py-3.5 px-3">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {filteredReports.map(rep => (
                    <React.Fragment key={rep.id}>
                      <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                          {rep.id}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white max-w-xs truncate">
                          {rep.pilotTitle}
                        </td>
                        <td className="py-3.5 px-3">{rep.startup}</td>
                        <td className="py-3.5 px-3 font-mono font-bold text-emerald-600">{rep.verifiedResult}</td>
                        <td className="py-3.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                            {rep.decision}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-slate-500">{rep.date}</td>
                        <td className="py-3.5 px-3">
                          <span className="flex items-center gap-1 font-bold text-[11px] text-purple-600 dark:text-purple-400">
                            <Lock className="w-3 h-3" />
                            {rep.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button
                            onClick={() => setExpandedReportId(expandedReportId === rep.id ? null : rep.id)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 cursor-pointer text-[11px]"
                          >
                            {expandedReportId === rep.id ? 'Hide Trail' : 'Audit Trail'}
                          </button>
                          <button
                            onClick={() => setViewReportModalData(rep)}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-100 cursor-pointer text-[11px]"
                          >
                            View
                          </button>
                          <button
                            onClick={() => alert(`Simulated download of certified PDF: ${rep.id}.pdf`)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-bold hover:bg-emerald-100 cursor-pointer text-[11px]"
                          >
                            Download PDF
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Audit-Trail Drawer */}
                      {expandedReportId === rep.id && (
                        <tr className="bg-slate-50/70 dark:bg-slate-800/40">
                          <td colSpan={8} className="p-4">
                            <div className="space-y-2 border-l-2 border-blue-500 pl-4 py-1 ml-4">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                Tamper-Evident Audit Ledger ({rep.id})
                              </span>
                              <div className="space-y-1 text-xs">
                                {(rep.auditTrail || []).map((step, idx) => (
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
      {/* PAGE E: CONFLICT DECLARATION                                              */}
      {/* ========================================================================= */}
      {currentSection === 'conflict' && (
        <div className="space-y-6">
          
          <div className="civic-card p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-6">
            
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Institutional Ethics & Conflict Screening
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Scale className="w-6 h-6 text-emerald-600" />
                Mandatory Conflict of Interest Declaration
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Required per pilot assignment prior to data examination. Declaring a conflict automatically triggers neutral re-assignment.
              </p>
            </div>

            {conflictSubmitMsg && (
              <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
                conflictSubmitMsg.includes('✓')
                  ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                  : 'bg-amber-50 dark:bg-amber-950 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200'
              }`}>
                <Info className="w-4 h-4 shrink-0" />
                <span>{conflictSubmitMsg}</span>
              </div>
            )}

            <form onSubmit={handleConflictSubmit} className="space-y-6">
              
              {/* Select Pilot */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-900 dark:text-white block">
                  Target Pilot Assignment
                </label>
                <select
                  value={selectedConflictPilot}
                  onChange={e => setSelectedConflictPilot(e.target.value)}
                  className="w-full md:w-2/3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                >
                  <option value="pilot-1">Municipal Solid Waste Route Optimization — Pune Municipal Corporation / ERAER</option>
                  <option value="chal-2">AI Acoustic Leakage Detection — Bengaluru Water Supply / HydroSense</option>
                  <option value="chal-3">Edge-AI Adaptive Traffic Control — Delhi Traffic Directorate / EdgeSense</option>
                </select>
              </div>

              {/* Primary Choice Radio */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className={`p-4 rounded-2xl border cursor-pointer flex items-center gap-3 ${
                  conflictTypeChoice === 'no_conflict'
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-500 dark:border-emerald-600 ring-2 ring-emerald-500/20'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                }`}>
                  <input
                    type="radio"
                    name="conflictChoice"
                    value="no_conflict"
                    checked={conflictTypeChoice === 'no_conflict'}
                    onChange={() => setConflictTypeChoice('no_conflict')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="font-bold text-xs text-slate-900 dark:text-white block">
                      I have no conflict of interest
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Independent and unencumbered to audit this pilot
                    </span>
                  </div>
                </label>

                <label className={`p-4 rounded-2xl border cursor-pointer flex items-center gap-3 ${
                  conflictTypeChoice === 'has_conflict'
                    ? 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-500 dark:border-rose-600 ring-2 ring-rose-500/20'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                }`}>
                  <input
                    type="radio"
                    name="conflictChoice"
                    value="has_conflict"
                    checked={conflictTypeChoice === 'has_conflict'}
                    onChange={() => setConflictTypeChoice('has_conflict')}
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <div>
                    <span className="font-bold text-xs text-slate-900 dark:text-white block">
                      I have a conflict, remove me from this pilot
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Auto-block pilot and trigger independent re-assignment
                    </span>
                  </div>
                </label>
              </div>

              {/* 4 Yes/No Questions */}
              <div className="space-y-3">
                <span className="font-bold text-xs text-slate-900 dark:text-white block">
                  Mandatory Independence Questionnaire:
                </span>

                {[
                  {
                    key: 'shareholding',
                    q: '1. Do you, your lab, or immediate family hold shares, equity, or convertible options in ERAER / CleanRoute Technologies?'
                  },
                  {
                    key: 'employment',
                    q: '2. Have you provided paid employment, paid advisory, or consulting services to the startup or Pune Municipal Corporation within the last 3 years?'
                  },
                  {
                    key: 'relationship',
                    q: '3. Do you possess a close personal, academic mentor, or direct familial relationship with founders or designated municipal officers?'
                  },
                  {
                    key: 'financial',
                    q: '4. Do you or your institution hold any financial interest in whether this pilot is sanctioned for scale-up procurement?'
                  }
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

              {/* Warning if any conflict is flagged */}
              {hasAnyConflictAnswerYes && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>
                    Warning: Answering "Yes" or selecting conflict will immediately lock this assignment and dispatch a re-assignment notice to the Department Committee.
                  </span>
                </div>
              )}

              {/* Typed-Name E-Signature & Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-900 dark:text-white block">
                    Typed Electronic Signature <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={signatureInput}
                    onChange={e => setSignatureInput(e.target.value)}
                    placeholder="Type full legal name..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[10px] text-slate-400">Equivalent to institutional physical seal</p>
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
      {/* PAGE F: MESSAGES                                                          */}
      {/* ========================================================================= */}
      {currentSection === 'messages' && (
        <div className="space-y-4">
          
          {/* Regulatory Non-Negotiation Notice */}
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 flex items-center gap-2.5 text-xs text-amber-900 dark:text-amber-200">
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              <strong>Regulatory Integrity Notice:</strong> As an Independent Validator, you are strictly prohibited from negotiating KPI outcome benchmarks or results with startups. All communications are logged in the public procurement audit trail.
            </span>
          </div>

          {/* 2-Pane Conversation Area */}
          <div className="civic-card rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden grid grid-cols-1 md:grid-cols-3 min-h-[500px]">
            
            {/* Left Conversations List */}
            <div className="border-r border-slate-200 dark:border-slate-800 p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Auditor Conversations
                </span>
                <span className="text-[10px] font-bold text-blue-600">Logged Channel</span>
              </div>

              <div className="space-y-1.5">
                {store.messages.conversations.map(conv => (
                  <div
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={`p-3 rounded-2xl transition-all cursor-pointer space-y-1 ${
                      activeConvId === conv.id
                        ? 'bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800'
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
              
              {/* Thread Header */}
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
                    Encrypted Audit Log
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
              <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-200 dark:border-slate-800 flex gap-2">
                <input
                  type="text"
                  placeholder="Type an official audit query or acknowledgment..."
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

      {/* ========================================================================= */}
      {/* PAGE G: PROFILE                                                           */}
      {/* ========================================================================= */}
      {currentSection === 'profile' && (
        <div className="space-y-6">
          
          <div className="civic-card p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-6">
            
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
                  AK
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                      Prof. Anil Kapoor
                    </h2>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                      Empaneled Validator
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    Chief Technical Auditor & Lab Director • <strong>Independent Lab, IIT Delhi</strong>
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    anil.kapoor@iitd.ac.in • Department of Civil & Environmental Engineering
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Accredited Tenure</span>
                <span className="font-bold text-xs text-slate-900 dark:text-white">2024 – 2027 (MoHUA Empaneled)</span>
              </div>
            </div>

            {/* Expertise Tags */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="font-bold text-xs text-slate-900 dark:text-white block">
                Audited Sector Domains & Methodologies
              </span>
              <div className="flex flex-wrap gap-2 text-xs">
                {['Urban Logistics', 'IoT & Embedded Telemetry', 'Data Analytics', 'Municipal CleanTech', 'GFR Rule 194 Compliance', 'Statistical Baseline Audits'].map((tag, i) => (
                  <span key={i} className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-semibold">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Accreditations Cards */}
            <div className="space-y-2 pt-2">
              <span className="font-bold text-xs text-slate-900 dark:text-white block">
                Official Certifications & Authority Empanelment
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400">NABL Accreditation</span>
                  <div className="font-bold text-slate-900 dark:text-white">Testing Authority #NAB-2024-8841</div>
                  <p className="text-[11px] text-slate-500">Autonomous sensor & GPS audit conformance</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">MoHUA Smart Cities</span>
                  <div className="font-bold text-slate-900 dark:text-white">Empaneled Technical Auditor</div>
                  <p className="text-[11px] text-slate-500">Municipal SBoT pilot verification authority</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-purple-600 dark:text-purple-400">ISO Standards</span>
                  <div className="font-bold text-slate-900 dark:text-white">ISO/IEC 17025:2017 Certified</div>
                  <p className="text-[11px] text-slate-500">Neutral calibration & ground-truth audit lab</p>
                </div>

              </div>
            </div>

            {/* History of Declared Conflicts */}
            <div className="space-y-2 pt-2">
              <span className="font-bold text-xs text-slate-900 dark:text-white block">
                Conflict Screening Registry (Active Clearances)
              </span>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="font-semibold text-slate-900 dark:text-white">Municipal Solid Waste Optimization (PMC / ERAER)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300">
                    No Conflict Declared ✓
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 dark:text-white">Edge-AI Adaptive Traffic Control (Delhi / EdgeSense)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300">
                    No Conflict Declared ✓
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: RAW CSV DATA PREVIEW                                             */}
      {/* ========================================================================= */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-blue-500" />
                  {previewFile.name}
                </h3>
                <span className="text-[11px] font-mono text-slate-500">
                  SHA-256 Checksum: {previewFile.sha} (Integrity Verified)
                </span>
              </div>
              <button onClick={() => setPreviewFile(null)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  <tr>
                    <th className="p-2.5">Timestamp</th>
                    <th className="p-2.5">Vehicle ID</th>
                    <th className="p-2.5">Route</th>
                    <th className="p-2.5">Lat / Lon</th>
                    <th className="p-2.5">Telemetry / Delay</th>
                    <th className="p-2.5">Fuel / Battery</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {previewFile.rows.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-2.5">{r.time}</td>
                      <td className="p-2.5 font-bold text-blue-600 dark:text-blue-400">{r.vehicle}</td>
                      <td className="p-2.5">{r.route}</td>
                      <td className="p-2.5 text-slate-500">{r.lat}, {r.lon}</td>
                      <td className="p-2.5 font-bold text-emerald-600">{r.delay}</td>
                      <td className="p-2.5 text-slate-500">{r.fuel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-2 text-xs">
              <span className="text-slate-500">Displaying first 4 sample rows of 14,200 recorded telemetry events.</span>
              <button
                onClick={() => setPreviewFile(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 font-bold text-xs"
              >
                Close Preview
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CONFIRM REPORT SUBMISSION & LOCK                                 */}
      {/* ========================================================================= */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Confirm & Certify Final Audit Report
                </h3>
                <span className="text-xs text-slate-500">Binding GFR Rule 194 Determination</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Pilot:</span>
                <span className="font-bold text-slate-900 dark:text-white truncate max-w-[240px]">{store.pilotTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Verified Result:</span>
                <span className="font-mono font-bold text-emerald-600">{Number(verifiedValueInput).toFixed(1)}% Delay</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Binding Decision:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedDecision}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Milestone 2 Trigger:</span>
                <span className="font-bold text-emerald-600">{liveM2.label} (₹ 5,00,000)</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Once submitted, this audit certificate is <strong>digitally locked and published</strong> to the Department Officer and Startup dashboards. Escrow release authorization will be issued immediately.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReport}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Confirm & Lock Report</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: VIEW CERTIFIED AUDIT REPORT                                      */}
      {/* ========================================================================= */}
      {viewReportModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Audit Certificate {viewReportModalData.id}
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Signed by {viewReportModalData.auditor} ({viewReportModalData.organization})
                  </span>
                </div>
              </div>
              <button onClick={() => setViewReportModalData(null)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Pilot Challenge</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{viewReportModalData.pilotTitle}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Procuring Authority</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{viewReportModalData.department}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Startup</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{viewReportModalData.startup}</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Mandated Target</span>
                    <span className="font-bold text-purple-600">{viewReportModalData.targetKpi}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Verified Result</span>
                    <span className="font-mono font-bold text-emerald-600">{viewReportModalData.verifiedResult}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Audit Determination</span>
                    <span className="font-bold text-emerald-700">{viewReportModalData.decision}</span>
                  </div>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-900 dark:text-white block mb-1">
                  Tamper-Evident Verification Log:
                </span>
                <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5 text-[11px] font-mono">
                  {(viewReportModalData.auditTrail || []).map((t, idx) => (
                    <div key={idx} className="flex justify-between text-slate-700 dark:text-slate-300">
                      <span>• {t.event}</span>
                      <span className="text-slate-400 text-[10px]">{t.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => alert(`Simulated download of ${viewReportModalData.id}.pdf`)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Signed PDF</span>
              </button>
              <button
                onClick={() => setViewReportModalData(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 font-bold text-xs"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
