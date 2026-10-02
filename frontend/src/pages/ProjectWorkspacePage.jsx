import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ProcurementJourneyTracker } from '../components/ProcurementJourneyTracker';
import { PilotSearchSwitcher } from '../components/PilotSearchSwitcher';
import { PilotEvidenceReportModal } from '../components/PilotEvidenceReportModal';
import { 
  Rocket, 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  DollarSign, 
  TrendingUp, 
  FileText, 
  Scale, 
  Clock, 
  AlertCircle, 
  ExternalLink, 
  Lock, 
  Layers, 
  Award, 
  Send, 
  Plus, 
  BarChart3, 
  Info, 
  Printer,
  ArrowLeft,
  MessageSquare,
  Paperclip,
  Users,
  UserCheck,
  Briefcase,
  Tag,
  Check,
  ChevronRight,
  X,
  AlertOctagon
} from 'lucide-react';

export const ProjectWorkspacePage = ({ 
  teamId, 
  setActiveTab, 
  setSelectedCompanyId, 
  setSelectedProblemId 
}) => {
  const { user } = useAuth();
  
  const [workspaceData, setWorkspaceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState('milestones'); // 'milestones' | 'validation' | 'scale-decision' | 'conversation'
  const [reportModalOpen, setReportModalOpen] = useState(false);

  // Startup Profile Drawer/Modal state
  const [profileModalStartup, setProfileModalStartup] = useState(null);

  // Pilot Conversation State
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [isPostingMessage, setIsPostingMessage] = useState(false);
  const [postError, setPostError] = useState('');
  const [conversationForbidden, setConversationForbidden] = useState(false);

  // Milestone Evidence Submission Modal (Startup Flow)
  const [evidenceModalMilestone, setEvidenceModalMilestone] = useState(null);
  const [evidenceText, setEvidenceText] = useState('Completed field run across 25 vehicles. Live telematics data attached.');
  const [evidenceUrl, setEvidenceUrl] = useState('https://cleanroute.demo.sih.gov.in/telemetry-live');
  const [metricAchieved, setMetricAchieved] = useState('22');

  // Scale-up / Procurement Decision Modal State (Officer Flow)
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [decisionOutcome, setDecisionOutcome] = useState('SCALE_MULTI_DISTRICT');
  const [scaleBudget, setScaleBudget] = useState(14500000);
  const [evaluationMemo, setEvaluationMemo] = useState(
    'CleanRoute successfully demonstrated 22% collection delay (beating the 25% target from a 40% baseline) over 45 municipal vehicles. Independent validator confirmed 99.4% GPS telemetry data integrity with zero missed collection zones. Approved for city-wide scale-up and recommendation to adjacent municipal corporations.'
  );

  const [submittingAction, setSubmittingAction] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');
  const [actionError, setActionError] = useState('');

  const CANONICAL_PROJECTS = [
    { id: 'pilot-1', companyId: 'P1', label: 'CleanRoute (Active Trial)', company: 'CleanRoute Technologies', dept: 'Waste Logistics, Pune' },
    { id: 'pilot-2', companyId: 'P2', label: 'AquaSense (Active Trial)', company: 'HydroSense Acoustics', dept: 'Water Supply, Chennai' },
    { id: 'pilot-3', companyId: 'P3', label: 'SignalSetu (Active Trial)', company: 'TrafficPulse Mobility', dept: 'Traffic Police, Bengaluru' },
    { id: 'pilot-4', companyId: 'P4', label: 'SunHealth (Active Trial)', company: 'SolarCold Health Logistics', dept: 'Public Health, Nagpur' },
    { id: 'chal-5', companyId: 'P5', label: 'Streetlights (Pre-Pilot Scoring)', company: 'LightLoop Innovations + 3 others', dept: 'Power & Energy, Indore' },
    { id: 'pilot-6', companyId: 'P6', label: 'RoadWatch (Trial Stopped)', company: 'RoadWatch AI Technologies', dept: 'Public Works, Delhi' }
  ];

  // Helper for auth headers
  const getAuthHeaders = () => {
    return {
      ...(user?.token ? { 'Authorization': `Bearer ${user.token}` } : {}),
      ...(user?.id ? { 'x-user-id': user.id } : {}),
      ...(user?.role ? { 'x-user-role': user.role } : {})
    };
  };

  const fetchWorkspace = () => {
    const query = teamId ? `teamId=${teamId}` : 'teamId=pilot-1';
    setLoading(true);
    fetch(`/api/workspace/details?${query}`, { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => {
        setWorkspaceData(data);
        if (data.pilot?.id) {
          fetchPilotMessages(data.pilot.id);
        }
      })
      .catch(err => console.error('Error fetching pilot workspace:', err))
      .finally(() => setLoading(false));
  };

  const fetchPilotMessages = async (pilotId) => {
    if (!pilotId) return;
    setMessagesLoading(true);
    setConversationForbidden(false);
    try {
      const res = await fetch(`/api/pilots/${pilotId}/messages`, { headers: getAuthHeaders() });
      if (res.status === 403) {
        setConversationForbidden(true);
        setMessages([]);
        return;
      }
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error('Error fetching pilot messages:', err);
    } finally {
      setMessagesLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspace();
  }, [teamId]);

  const pilot = workspaceData?.pilot || workspaceData?.team;
  const challenge = workspaceData?.challenge || workspaceData?.problem;
  const milestones = workspaceData?.milestones || [];
  const validationReports = workspaceData?.validationReports || [];
  const procurementDecisions = (workspaceData?.procurementDecisions && workspaceData.procurementDecisions.length > 0)
    ? workspaceData.procurementDecisions
    : (pilot?.procurementDecision ? [pilot.procurementDecision] : []);
  const startup = workspaceData?.startup;
  const participants = workspaceData?.participants || [];
  const nextAction = workspaceData?.nextAction;
  const lastUpdated = workspaceData?.lastUpdated;

  // Format relative time helper
  const formatTime = (ts) => {
    if (!ts) return 'Just now';
    try {
      const d = new Date(ts);
      return d.toLocaleDateString('en-IN', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return ts;
    }
  };

  // Switch between projects from Command Center
  const handleSwitchProject = (targetId, compId) => {
    if (setSelectedCompanyId && compId) setSelectedCompanyId(compId);
    if (setActiveTab) setActiveTab(`workspace/${targetId}`);
  };

  // Back button handler based on current user role
  const handleBackToDashboard = () => {
    if (user?.role === 'startup') setActiveTab('university');
    else if (user?.role === 'validator') setActiveTab('industry');
    else if (user?.role === 'expert') setActiveTab('needs-review');
    else setActiveTab('govt-dashboard');
  };

  // Submit Milestone Evidence (Startup Action)
  const handleSubmitEvidence = async (e) => {
    e.preventDefault();
    if (!evidenceModalMilestone || !pilot) return;

    setSubmittingAction(true);
    setActionError('');

    try {
      const res = await fetch(`/api/pilots/milestones/${evidenceModalMilestone.id}/submit-evidence`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          description: evidenceText,
          telemetrySummary: `Deliverables & telemetry proof submitted for independent validation: ${evidenceUrl}`,
          currentAchievedKpi: metricAchieved ? Number(metricAchieved) : undefined,
          documents: evidenceUrl ? [evidenceUrl] : [],
          demoDashboardUrl: evidenceUrl,
          submittedBy: user?.name || 'Startup Founder'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit milestone evidence');

      setActionSuccessMsg(`Evidence submitted for "${evidenceModalMilestone.title || evidenceModalMilestone.name}". Forwarded to Independent Validator queue.`);
      setEvidenceModalMilestone(null);
      fetchWorkspace();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSubmittingAction(false);
    }
  };

  // Release Milestone Payment (Department Officer Action)
  const handleReleasePayment = async (milestoneId) => {
    if (!pilot) return;
    setSubmittingAction(true);
    setActionError('');

    try {
      const res = await fetch(`/api/pilots/milestones/${milestoneId}/release-payment`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          officerName: user?.name || 'Dr. Sunita Verma',
          releaseNotes: 'Independent validation verified. Milestone grant tranche approved and released via demo escrow.'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to release payment');

      const amt = data.milestone?.paymentAmount || data.milestone?.resourceAmount || 500000;
      setActionSuccessMsg(`Payment tranche of ₹${amt.toLocaleString('en-IN')} approved and released! (Demo simulation only)`);
      fetchWorkspace();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSubmittingAction(false);
    }
  };

  // Post new pilot conversation message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !pilot?.id) return;
    setIsPostingMessage(true);
    setPostError('');

    try {
      const res = await fetch(`/api/pilots/${pilot.id}/messages`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          text: messageText.trim(),
          attachmentUrl: attachmentUrl.trim() || undefined,
          attachmentName: attachmentUrl.trim() ? 'Telemetry / Document Link' : undefined,
          attachmentType: 'link'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to post message to pilot conversation');
      }

      setMessageText('');
      setAttachmentUrl('');
      if (data.msg || data.message) {
        setMessages(prev => [...prev, data.msg || data.message]);
      } else {
        fetchPilotMessages(pilot.id);
      }
    } catch (err) {
      setPostError(err.message);
    } finally {
      setIsPostingMessage(false);
    }
  };

  // Submit Scale-up / Public Procurement Decision (Officer Action)
  const handleSubmitDecision = async (e) => {
    e.preventDefault();
    if (!pilot) return;

    setSubmittingAction(true);
    setActionError('');

    try {
      const res = await fetch(`/api/pilots/${pilot.id}/procurement-decision`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          decision: decisionOutcome,
          rationale: evaluationMemo,
          evaluationMemo,
          scaleBudget: Number(scaleBudget),
          recommendedScaleBudget: `₹ ${Number(scaleBudget).toLocaleString('en-IN')} (Annual Scaling Contract)`,
          officerName: user?.name || 'Dr. Sunita Verma',
          signedBy: user?.name || 'Dr. Sunita Verma (Director of Urban Innovation)',
          pathway: 'GFR Rule 194 Direct Innovation Procurement / GeM Startup Runway',
          scaleDistricts: ['Pune Municipal Corporation (All 15 Wards)', 'Pimpri-Chinchwad Municipal Corporation (PCMC)', 'Nagpur Smart City']
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to record decision');

      setActionSuccessMsg('Formal Scale-Up Procurement Decision logged successfully under GFR Rule 194!');
      setDecisionModalOpen(false);
      fetchWorkspace();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSubmittingAction(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
        <div className="text-slate-500 text-xs font-semibold">Loading Pilot Command Center...</div>
      </div>
    );
  }

  // PRE-PILOT REVIEW STATE (e.g. Indore Smart Streetlights, P5 / chal-5)
  // Shows applicant proposals & scoring without inventing an active pilot
  if (workspaceData?.hasPilot === false) {
    const apps = workspaceData.applications || [];
    const evals = workspaceData.evaluations || [];
    const p5Challenge = workspaceData.challenge;

    return (
      <div className="space-y-6 py-4">
        
        {/* Top Navigation & Status Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBackToDashboard}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-xs transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </button>
            <span className="text-xs text-slate-400">/</span>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Pre-Pilot Evaluation Center
            </span>
          </div>

          {/* Pilot Search & Select – replaces P1–P6 buttons */}
          <PilotSearchSwitcher
            canonicalProjects={CANONICAL_PROJECTS}
            currentTeamId={teamId}
            userRole={user?.role}
            userStartupId={user?.startupId}
            onSelectProject={handleSwitchProject}
          />
        </div>

        {/* Pre-Pilot Header Card */}
        <div className="p-6 md:p-8 rounded-3xl border border-amber-200 dark:border-amber-900 bg-gradient-to-r from-amber-50/70 via-orange-50/50 to-white dark:from-amber-950/30 dark:to-slate-900 space-y-4 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900 text-amber-900 dark:text-amber-200 border border-amber-300">
                  Pre-Pilot Sandbox: Proposal Evaluation Phase
                </span>
                <span className="text-xs font-mono text-slate-500">Ref: CHAL-2026-MP-005</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
                {p5Challenge?.title || 'Smart Streetlight Fault Detection & Adaptive Dimming'}
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Department: <strong>{p5Challenge?.departmentName || 'Indore Municipal Corporation (Dept. of Power & Energy)'}</strong>
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Applicant Pool</span>
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {apps.length} Startups Applied
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-amber-200/80 dark:border-amber-800 text-xs text-slate-700 dark:text-slate-300 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-300">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Selection Status: Proposal Evaluation Underway</span>
            </div>
            <p className="leading-relaxed">
              No single startup has been selected yet. Independent technical experts are grading the submitted proposals. 
              Once the evaluation panel completes review by <strong>12 Oct 2026</strong>, the highest scoring startup will be awarded the small trial sandbox contract.
            </p>
          </div>
        </div>

        {/* 4 Applicant Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              Applicant Proposals & Startup Profiles ({apps.length})
            </h2>
            <span className="text-xs text-slate-400">
              Click any applicant to inspect team, TRL & technical credentials
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {apps.map((app, idx) => {
              const startupData = {
                id: app.startupId,
                name: app.startupName,
                founderName: app.founderName,
                dpiitNumber: app.eligibilityChecklist?.dpiitCertNumber || 'DIPP-66120',
                verifiedDpiit: app.eligibilityChecklist?.isDpiitRecognized,
                trlLevel: app.eligibilityChecklist?.trlLevel || 6,
                teamSize: 8,
                sector: 'Smart Street Lighting & IoT',
                solutionName: app.proposalTitle,
                solutionSummary: app.proposalSummary,
                description: app.proposalSummary,
                deckUrl: app.pitchDeckUrl,
                workforceSkills: ['LoRaWAN Mesh', 'Embedded Photocell Hardware', 'Municipal Lighting SCADA', 'Streetlight Maintenance AI'],
                keyCapabilities: ['Mesh Auto-Routing', 'Fault Triangulation', 'Automated Work-Order Generation'],
                achievements: ['Pilot demo in Smart City Jabalpur', 'IP66 Rated Enclosure Certified']
              };

              return (
                <div 
                  key={app.id || idx}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-400 transition space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">
                        Applicant #{idx + 1}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                        {app.startupName}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Founder: {app.founderName}
                      </p>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      TRL {app.eligibilityChecklist?.trlLevel || 6}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 space-y-1 text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">
                      {app.proposalTitle}
                    </span>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                      {app.proposalSummary}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 text-slate-500">
                    <div>
                      Budget Request: <strong>₹{(app.requestedBudget || 800000).toLocaleString('en-IN')}</strong>
                    </div>
                    <div>
                      Proposed Weeks: <strong>{app.proposedWeeks || 10} wks</strong>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setProfileModalStartup(startupData)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                    >
                      <Briefcase className="w-3.5 h-3.5" /> View Startup Profile →
                    </button>

                    {app.pitchDeckUrl && (
                      <a
                        href={app.pitchDeckUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-500 hover:text-slate-700 text-xs flex items-center gap-1"
                      >
                        Pitch Deck <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Startup Profile Modal */}
        {profileModalStartup && renderStartupProfileModal()}

      </div>
    );
  }

  // ACTIVE PILOT VIEW (P1, P2, P3, P4, P6)
  if (!pilot || !challenge) {
    return <div className="py-12 text-center text-slate-500 text-xs">No active pilot workspace found.</div>;
  }

  const latestDecision = procurementDecisions[0];

  // Numerical KPI values for comparative bar chart
  const baselineValue = challenge.baselineKpi?.value || 40;
  const targetValue = challenge.targetKpi?.value || 25;
  const actualValue = pilot.kpiTracking?.currentActualValue !== undefined ? pilot.kpiTracking.currentActualValue : 22;

  // Render Startup Profile Modal/Drawer
  function renderStartupProfileModal() {
    const s = profileModalStartup || startup || {
      name: pilot?.startupName || 'Startup',
      founderName: 'Priya Patel',
      founderEmail: 'priya@cleanroute.tech',
      dpiitNumber: 'DIPP-84920',
      teamSize: 14,
      sector: 'Smart Cities & CleanTech',
      domains: ['Smart Cities & CleanTech', 'Waste Logistics', 'IoT & Sensor Telemetry'],
      trlLevel: 7,
      website: 'https://cleanroute.demo.sih.gov.in',
      deckUrl: 'https://cleanroute.demo.sih.gov.in/pitch-deck.pdf',
      verifiedDpiit: true,
      description: 'Real-time GPS + Fill-level sensor optimization reducing garbage truck fuel consumption, missed pickups, and route delays for smart municipalities.',
      keyCapabilities: ['Edge IoT Telemetry', 'Dynamic TSP Routing AI', 'Municipal ERP Webhooks'],
      workforceSkills: ['Geospatial Fleet AI', 'Embedded LoRaWAN Firmware', 'Full-Stack React/Node GIS', 'Edge Telematics'],
      achievements: ['Pune Municipal Corporation Pilot Phase 1 completed (22.0% delay achieved)', 'NABL Calibrated IoT Bin Sensor certified with IP67 rating']
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
        <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 space-y-6 shadow-2xl text-slate-900 dark:text-slate-100 max-h-[90vh] overflow-y-auto">
          
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                  DPIIT Recognized Startup
                </span>
                {s.verifiedDpiit && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified Reg: {s.dpiitNumber || 'DIPP-84920'}
                  </span>
                )}
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-slate-50 mt-1">
                {s.name}
              </h3>
              <p className="text-xs text-slate-500">
                Founder: <strong>{s.founderName}</strong> {s.founderEmail && `(${s.founderEmail})`} • Sector: {s.sector || 'Urban Tech'}
              </p>
            </div>

            <button 
              onClick={() => setProfileModalStartup(null)}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Solution & Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Core Technology & Solution</h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
              {s.solutionSummary || s.description}
            </p>
          </div>

          {/* Metrics Grid: TRL & Team */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900">
              <span className="text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400 block">Tech Readiness</span>
              <span className="text-lg font-black text-blue-900 dark:text-blue-100">
                TRL {s.trlLevel || 7} / 9
              </span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 block">Demonstrated in field</span>
            </div>

            <div className="p-3.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900">
              <span className="text-[10px] font-bold uppercase text-purple-600 dark:text-purple-400 block">Workforce & Team</span>
              <span className="text-lg font-black text-purple-900 dark:text-purple-100">
                {s.teamSize || 14} Members
              </span>
              <span className="text-[10px] text-purple-600 dark:text-purple-400 block">Engineering & Ops</span>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900">
              <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 block">DPIIT Status</span>
              <span className="text-lg font-black text-emerald-900 dark:text-emerald-100">
                Recognized
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block">{s.dpiitNumber || 'DIPP-84920'}</span>
            </div>
          </div>

          {/* Workforce Skills */}
          {s.workforceSkills && s.workforceSkills.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Key Workforce Capabilities & Skills</h4>
              <div className="flex flex-wrap gap-1.5">
                {s.workforceSkills.map((sk, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Capabilities */}
          {s.keyCapabilities && s.keyCapabilities.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Demonstrated Capabilities</h4>
              <ul className="text-xs space-y-1 text-slate-700 dark:text-slate-300">
                {s.keyCapabilities.map((cap, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{cap}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Achievements */}
          {s.achievements && s.achievements.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Audited Achievements & Past Deployments</h4>
              <ul className="text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
                {s.achievements.map((ach, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-emerald-50/50 dark:bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900">
                    <Award className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{ach}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={() => {
                const compMap = { 'start-1': 'P1', 'start-2': 'P2', 'start-3': 'P3', 'start-4': 'P4', 'start-5': 'P5', 'start-6': 'P6' };
                const cId = compMap[s.id] || 'P1';
                if (setSelectedCompanyId) setSelectedCompanyId(cId);
                setProfileModalStartup(null);
                setActiveTab(`company/${cId}`);
              }}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
            >
              Open Full Company Page ({s.name}) →
            </button>

            <button
              onClick={() => setProfileModalStartup(null)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
            >
              Close
            </button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4">
      
      {/* Simulation Disclaimer Banner */}
      <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Demo Simulation Mode:</strong> Payment release actions and GFR Rule 194 scaling authorizations are demonstration records for SIH26136. No live banking, PFMS, or legal liabilities are attached.
          </span>
        </div>
        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 shrink-0">
          Simulation Only
        </span>
      </div>

      {/* TOP NAVIGATION & PROJECT SWITCHER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleBackToDashboard}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-xs transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </button>
          <span className="text-xs text-slate-400">/</span>
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Pilot Command Center: <strong>{pilot.startupName || pilot.name}</strong>
          </span>
        </div>

        {/* Pilot Search & Select – replaces P1–P6 buttons */}
        <PilotSearchSwitcher
          canonicalProjects={CANONICAL_PROJECTS}
          currentTeamId={teamId}
          userRole={user?.role}
          userStartupId={user?.startupId}
          onSelectProject={handleSwitchProject}
        />
      </div>

      {/* NEXT ACTION & LAST UPDATED STATUS BAR */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                Next Action
              </span>
              {nextAction?.role && (
                <span className="text-[11px] font-semibold text-slate-500">
                  Responsible: <strong>{nextAction.role}</strong>
                </span>
              )}
            </div>
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              {nextAction?.action || 'Execute field deliverables and maintain continuous telematics monitoring'}
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 shrink-0 sm:text-right">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Last Activity Logged</span>
          <span className="font-medium text-slate-700 dark:text-slate-300">{formatTime(lastUpdated)}</span>
        </div>
      </div>

      {/* 8-Stage Procurement Lifecycle Journey Tracker */}
      {workspaceData?.journey && (
        <ProcurementJourneyTracker journey={workspaceData.journey} />
      )}

      {/* Workspace Header Banner */}
      <div className="civic-card p-6 md:p-8 rounded-3xl border border-blue-200 dark:border-blue-900 bg-gradient-to-r from-blue-50/70 via-indigo-50/70 to-slate-50 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-slate-900 space-y-6 shadow-xs">
        
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center flex-wrap gap-2">
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Model SBoT Pilot Command Center
              </span>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                Ref: {pilot.agreementRef || 'SBoT-2026-MH-084'}
              </span>
              {pilot.status === 'stopped' && (
                <span className="px-3 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center gap-1">
                  <AlertOctagon className="w-3.5 h-3.5" /> TRIAL STOPPED
                </span>
              )}
              {latestDecision && (
                <span className="px-3 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" /> GFR RULE 194 SCALE AUTHORIZED
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-slate-50 mt-2">
              {pilot.startupName || pilot.name}
            </h1>
            <p className="text-xs text-blue-900 dark:text-blue-300 font-semibold mt-1">
              Target Outcome Challenge: {challenge.title}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* View Startup Profile Button */}
            <button
              onClick={() => setProfileModalStartup(startup)}
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-blue-700 dark:text-blue-300 font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Briefcase className="w-4 h-4 text-blue-600" />
              <span>View Startup Profile</span>
            </button>

            {/* Pilot Evidence Report Button */}
            <button
              onClick={() => setReportModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Generate printable pilot closeout evidence dossier"
            >
              <FileText className="w-4 h-4" />
              <span>Pilot Evidence Report (PDF)</span>
            </button>

            {(!latestDecision && !pilot.stopped && (user?.role === 'government' || user?.role === 'admin')) && (
              <button
                onClick={() => setDecisionModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
              >
                <Scale className="w-4 h-4" /> Authorize Rule 194 Scale Procurement
              </button>
            )}

            {user?.role === 'validator' && (
              <button
                onClick={() => setActiveTab('industry')}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" /> Open Assessment Lab →
              </button>
            )}
          </div>
        </div>

        {/* Live Performance KPI Benchmarks (Before vs Target vs Actual) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 border-t border-blue-200/80 dark:border-blue-900/80 pt-6 text-xs">
          
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-500">1. Baseline Metric (Before)</span>
            <div className="font-mono text-base font-bold text-rose-700 dark:text-rose-400">
              {challenge.baselineKpi?.value ? `${challenge.baselineKpi.value}${challenge.baselineKpi.unit || '%'}` : '40% Delay'}
            </div>
            <p className="text-[10px] text-slate-400">{challenge.baselineKpi?.description || 'Pre-pilot measured baseline'}</p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 space-y-1">
            <span className="text-[10px] font-bold uppercase text-blue-700 dark:text-blue-300">2. Target KPI (Pilot Goal)</span>
            <div className="font-mono text-base font-bold text-blue-700 dark:text-blue-300">
              {challenge.targetKpi?.value ? `${challenge.targetKpi.targetOperator || '<='} ${challenge.targetKpi.value}${challenge.targetKpi.unit || '%'}` : '<= 25% Delay'}
            </div>
            <p className="text-[10px] text-slate-400">SBoT contract success threshold</p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 space-y-1">
            <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400">3. Current Achieved Benchmark</span>
            <div className="font-mono text-base font-black text-emerald-700 dark:text-emerald-400">
              {actualValue}% Delay
            </div>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
              {actualValue <= targetValue ? '✓ Exceeds SBoT Goal' : 'Pending verification'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 space-y-1">
            <span className="text-[10px] font-bold uppercase text-purple-700 dark:text-purple-300">4. 3rd-Party Lab Audit</span>
            <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              {pilot.validatorName || 'IIT Delhi Mobility Lab'}
            </div>
            <p className="text-[10px] text-purple-700 dark:text-purple-400 font-bold">
              {pilot.status === 'stopped' ? 'Audit: Halted' : 'Status: Achieved & Certified'}
            </p>
          </div>

        </div>

        {/* VISUAL COMPARATIVE BEFORE / TARGET / ACTUAL KPI BAR CHART */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                Outcome KPI Comparative Performance Chart
              </h3>
            </div>
            <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800 uppercase">
              {actualValue <= targetValue ? 'Target Surpassed' : 'Under Evaluation'}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Bar 1: Baseline */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span className="text-rose-700 dark:text-rose-400">Pre-Pilot Municipal Baseline</span>
                <span className="font-mono font-bold text-rose-700 dark:text-rose-400">{baselineValue}% Delay</span>
              </div>
              <div className="w-full h-3.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-rose-500 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(baselineValue, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Bar 2: Target Pass Goal */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span className="text-blue-700 dark:text-blue-300">SBoT Target Pilot Threshold (Success Goal)</span>
                <span className="font-mono font-bold text-blue-700 dark:text-blue-300">≤ {targetValue}% Delay</span>
              </div>
              <div className="w-full h-3.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(targetValue, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Bar 3: Actual Verified Result */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">Independent Verified Field Achievement (Current Result)</span>
                <span className="font-mono font-black text-emerald-700 dark:text-emerald-400">{actualValue}% Delay (Verified)</span>
              </div>
              <div className="w-full h-4 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden p-0.5 border border-emerald-300 dark:border-emerald-700">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500 shadow-sm" 
                  style={{ width: `${Math.min(actualValue, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Tabs Navigation Bar */}
        <div className="flex items-center gap-2 pt-2 border-t border-blue-200/80 dark:border-blue-900/80 overflow-x-auto">
          <button
            onClick={() => setActiveWorkspaceTab('milestones')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeWorkspaceTab === 'milestones' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> 100% Staged Milestone Escrow ({milestones.length})
          </button>

          <button
            onClick={() => setActiveWorkspaceTab('validation')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeWorkspaceTab === 'validation' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Award className="w-4 h-4" /> Independent Validator Reports ({validationReports.length})
          </button>

          <button
            onClick={() => setActiveWorkspaceTab('scale-decision')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeWorkspaceTab === 'scale-decision' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Scale className="w-4 h-4" /> Procurement & Scaling Decision ({procurementDecisions.length})
          </button>

          <button
            onClick={() => setActiveWorkspaceTab('conversation')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeWorkspaceTab === 'conversation' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" /> Pilot Conversation ({messages.length})
          </button>
        </div>

      </div>

      {actionSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-2.5 border border-emerald-300 dark:border-emerald-800 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          <span className="font-bold">{actionSuccessMsg}</span>
        </div>
      )}

      {actionError && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2.5 border border-rose-200 dark:border-rose-800 animate-in fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{actionError}</span>
        </div>
      )}

      {/* TAB 1: 100% STAGED MILESTONE TIMELINE */}
      {activeWorkspaceTab === 'milestones' && (
        <div className="civic-card p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 bg-white dark:bg-slate-900">
          
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" /> Staged Milestone Escrow & Payment Readiness Gates
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Funds are unlocked strictly upon independent verification. Total pilot sum strictly equals 100%.
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Staged Grant</span>
              <span className="text-lg font-black text-emerald-700 dark:text-emerald-400">
                ₹{milestones.reduce((acc, m) => acc + (m.paymentAmount || m.resourceAmount || 0), 0).toLocaleString('en-IN')} (100%)
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {milestones.map((ms, idx) => {
              const isReleased = ms.status === 'released';
              const isReadyForRelease = ms.status === 'ready_for_release' || ms.status === 'ready';
              const isSubmitted = ms.status === 'evidence_submitted';
              const isPending = ms.status === 'pending' || ms.status === 'in_progress' || ms.status === 'in-progress';

              const titleText = ms.title || ms.name || `Milestone ${idx + 1}`;
              const pct = ms.paymentPercentage !== undefined ? ms.paymentPercentage : (ms.percentage || 30);
              const amount = ms.paymentAmount || ms.resourceAmount || Math.round(1250000 * (pct / 100));

              return (
                <div 
                  key={ms.id} 
                  className={`p-6 rounded-2xl border transition-all space-y-4 ${
                    isReleased ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800' :
                    isReadyForRelease ? 'bg-indigo-50/70 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-700 shadow-sm' :
                    isSubmitted ? 'bg-purple-50/40 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800' :
                    'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    
                    <div className="space-y-1.5 max-w-2xl">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono">
                          Phase {idx + 1} ({pct}%)
                        </span>

                        {isReleased && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300">
                            ✓ Payment Released (Demo Escrow)
                          </span>
                        )}
                        {isReadyForRelease && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-300 animate-pulse">
                            ⚡ Ready for Release (Verified by 3rd Party)
                          </span>
                        )}
                        {isSubmitted && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-300">
                            Under 3rd Party Assessment
                          </span>
                        )}
                        {isPending && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            In-Progress / Execution
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">{titleText}</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{ms.description}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-base font-black text-emerald-700 dark:text-emerald-400">
                        ₹{amount.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        Target Date: {ms.targetDate || `Week ${(idx + 1) * 4}`}
                      </div>
                    </div>

                  </div>

                  {/* Startup Evidence Info Box */}
                  {(ms.evidenceSubmission || ms.evidenceNotes) && (
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                      <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                        <span className="flex items-center gap-1.5">
                          <Rocket className="w-3.5 h-3.5 text-blue-600" />
                          Startup Evidence Deliverable:
                        </span>
                        {(ms.evidenceSubmission?.demoDashboardUrl || ms.evidenceUrl) && (
                          <a 
                            href={ms.evidenceSubmission?.demoDashboardUrl || ms.evidenceUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 text-[11px]"
                          >
                            View Telemetry Logs <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 italic leading-relaxed">
                        "{ms.evidenceSubmission?.description || ms.evidenceNotes}"
                      </p>
                      {ms.evidenceSubmission?.telemetrySummary && (
                        <p className="text-[11px] text-slate-500 font-mono">
                          Telemetry: {ms.evidenceSubmission.telemetrySummary}
                        </p>
                      )}
                      {(ms.evidenceSubmission?.currentAchievedKpi !== undefined || ms.metricAchieved) && (
                        <div className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-bold pt-0.5">
                          Reported Metric: {ms.evidenceSubmission?.currentAchievedKpi ? `${ms.evidenceSubmission.currentAchievedKpi}%` : ms.metricAchieved}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Independent Validator Certification Box */}
                  {ms.validatorReview && (
                    <div className="p-4 rounded-xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs space-y-1.5">
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-1.5 text-purple-800 dark:text-purple-300">
                          <Award className="w-4 h-4 text-purple-600" />
                          Independent Validator Certification ({ms.validatorReview.validatorName}):
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          ms.validatorReview.decision === 'Achieved' 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                          Verdict: {ms.validatorReview.decision}
                        </span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 italic leading-relaxed">
                        "{ms.validatorReview.remarks}"
                      </p>
                      {ms.validatorReview.verifiedKpiValue && (
                        <div className="text-[11px] font-mono text-purple-800 dark:text-purple-300 font-bold">
                          Audited Benchmark: {ms.validatorReview.verifiedKpiValue}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Payment Release Gate Bar */}
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                    
                    <div>
                      {isReleased ? (
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Tranche released to {pilot.startupName || 'Startup'} bank account (Demo Simulation).
                        </span>
                      ) : isReadyForRelease ? (
                        <span className="text-indigo-700 dark:text-indigo-300 font-bold flex items-center gap-1 text-[11px]">
                          <ShieldCheck className="w-4 h-4 text-indigo-600" /> Independent Validator certified "Achieved". Gate unlocked for Officer release!
                        </span>
                      ) : isSubmitted ? (
                        <span className="text-purple-700 dark:text-purple-300 text-[11px] font-medium flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-purple-600" /> Deliverables submitted. Waiting for Independent Validator review.
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px] font-medium flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5 text-amber-600" /> Payment locked until independent validation pass
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Startup Evidence Action */}
                      {(user?.role === 'startup' || user?.role === 'admin') && isPending && (
                        <button
                          onClick={() => setEvidenceModalMilestone(ms)}
                          className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" /> Submit Milestone Evidence
                        </button>
                      )}

                      {/* Officer Payment Release Action */}
                      {(user?.role === 'government' || user?.role === 'admin') && isReadyForRelease && (
                        <button
                          onClick={() => handleReleasePayment(ms.id)}
                          disabled={submittingAction}
                          className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <DollarSign className="w-4 h-4" /> Authorize Tranche Release (₹{amount.toLocaleString('en-IN')})
                        </button>
                      )}
                    </div>

                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* TAB 2: INDEPENDENT VALIDATOR ASSESSMENT REPORTS */}
      {activeWorkspaceTab === 'validation' && (
        <div className="civic-card p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 bg-white dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600" /> Independent 3rd-Party Assessment Reports ({validationReports.length})
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Audited field measurements and verification verdicts from empaneled technical institutes.
              </p>
            </div>

            {user?.role === 'validator' && (
              <button
                onClick={() => setActiveTab('industry')}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                + Conduct New Verification
              </button>
            )}
          </div>

          {validationReports.length === 0 ? (
            <div className="py-10 text-center text-slate-500 text-xs">
              No validation reports filed yet. Independent validators submit reports after field testbed inspection.
            </div>
          ) : (
            <div className="space-y-4">
              {validationReports.map(rep => (
                <div key={rep.id} className="p-6 rounded-2xl bg-purple-50/40 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase text-purple-800 dark:text-purple-300 bg-purple-100 dark:bg-purple-950 px-2.5 py-0.5 rounded">
                          {rep.validatorName || rep.institution || 'Quality & Standards Certification Bureau'}
                        </span>
                        <span className="text-xs text-slate-500">Auditor: {rep.validatorName}</span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-slate-50 mt-1">
                        Milestone: {rep.milestoneId || rep.milestoneName || 'Milestone 2'} — {rep.kpiMetric || 'Metric Achieved'}
                      </h4>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                      rep.decision === 'Achieved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      Verdict: {rep.decision}
                    </span>
                  </div>

                  {/* Audited Metric Comparison Box */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800/80 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Startup Claimed Benchmark:</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-mono">
                        {rep.startupClaimValue || rep.claimedMetric || '22.0%'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-purple-700 dark:text-purple-300 block text-[11px] font-bold">Independent Verified Ground Truth:</span>
                      <strong className="text-emerald-700 dark:text-emerald-400 font-mono">
                        {rep.verifiedValue || rep.auditedMetric || '22.0% (Audited)'}
                      </strong>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic bg-white/70 dark:bg-slate-900/70 p-4 rounded-xl border border-purple-100 dark:border-purple-900">
                    "{rep.remarks || rep.reportNotes || 'Independent field sampling confirmed actual metric meets or exceeds the required target threshold.'}"
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 font-medium">
                    <span>Audit Date: {new Date(rep.verifiedAt || rep.timestamp || Date.now()).toLocaleDateString()}</span>
                    {(rep.reportPdfUrl || rep.evidenceAttachment) && (
                      <a href={rep.reportPdfUrl || rep.evidenceAttachment} target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                        Download Certified Report PDF <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PROCUREMENT & SCALE-UP DECISION (RULE 194) */}
      {activeWorkspaceTab === 'scale-decision' && (
        <div className="civic-card p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 bg-white dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                <Scale className="w-5 h-5 text-emerald-600" /> Scale-Up & Direct Procurement Pathway (GFR Rule 194)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Formal legal authorization for full municipal deployment following successful pilot trial.
              </p>
            </div>

            {(!latestDecision && !pilot.stopped && (user?.role === 'government' || user?.role === 'admin')) && (
              <button
                onClick={() => setDecisionModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md cursor-pointer"
              >
                + Record Procurement Decision
              </button>
            )}
          </div>

          {procurementDecisions.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl space-y-2">
              <p>No formal scale procurement decision logged yet.</p>
              <p className="text-[11px] text-slate-400">Department officers can record procurement authorizations after milestones are verified.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {procurementDecisions.map((dec, i) => {
                const memoText = dec.rationale || dec.evaluationMemo || 'Direct commercial scaling authorized based on verified pilot outcomes.';
                const budgetStr = dec.recommendedScaleBudget || (dec.scaleBudget ? `₹ ${Number(dec.scaleBudget).toLocaleString('en-IN')}` : '₹ 1,45,00,000');
                const officerStr = dec.signedBy || dec.officerName || 'Dr. Sunita Verma (Director of Urban Innovation)';

                return (
                  <div key={dec.id || i} className="p-6 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-emerald-600 text-white">
                          Authorized Procurement Decision
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mt-1">
                          Outcome: {dec.decision}
                        </h3>
                        <p className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold">
                          Authorized by: {officerStr} • Pathway: {dec.pathway || 'GFR Rule 194 Direct Innovation Procurement / GeM Startup Runway'}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Scale Budget Sanctioned</span>
                        <span className="text-xl font-black text-emerald-700 dark:text-emerald-400">
                          {budgetStr}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1">
                      <strong className="text-slate-900 dark:text-slate-100 font-bold block">Evaluation Committee Justification Memo:</strong>
                      <p className="text-slate-700 dark:text-slate-300 italic leading-relaxed whitespace-pre-line">
                        "{memoText}"
                      </p>
                    </div>

                    {dec.scaleDistricts && dec.scaleDistricts.length > 0 && (
                      <div className="flex items-center flex-wrap gap-2 text-xs">
                        <span className="font-bold text-slate-700 dark:text-slate-300">Sanctioned Expansion Zones:</span>
                        {dec.scaleDistricts.map((dist, dIdx) => (
                          <span key={dIdx} className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-semibold border border-emerald-300">
                            📍 {dist}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PILOT CONVERSATION & COMMUNICATIONS */}
      {activeWorkspaceTab === 'conversation' && (
        <div className="civic-card p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 bg-white dark:bg-slate-900">
          
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" /> Dedicated Pilot Communication Channel
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Authorized conversation between Department Officer, Selected Startup, Independent Validator, and Expert Reviewer.
              </p>
            </div>

            <button
              onClick={() => fetchPilotMessages(pilot.id)}
              className="text-xs text-blue-600 hover:text-blue-800 font-bold hover:underline"
            >
              ↻ Refresh Messages
            </button>
          </div>

          {/* Authorized Participants List */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-extrabold uppercase text-slate-500 dark:text-slate-400 block mb-2">
              Authorized Pilot Stakeholders & Participants
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {participants.map((pt, pIdx) => {
                let badgeColor = 'bg-blue-100 text-blue-800 border-blue-200';
                if (pt.role === 'startup') badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-200';
                if (pt.role === 'validator') badgeColor = 'bg-purple-100 text-purple-800 border-purple-200';
                if (pt.role === 'expert') badgeColor = 'bg-amber-100 text-amber-800 border-amber-200';

                return (
                  <div key={pIdx} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${badgeColor}`}>
                      {pt.title}
                    </span>
                    <strong className="text-slate-900 dark:text-slate-100 block text-xs truncate">
                      {pt.name}
                    </strong>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {pt.org}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Access Forbidden Alert (Security Requirement) */}
          {conversationForbidden ? (
            <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <AlertCircle className="w-5 h-5 text-rose-600" />
                <span>Access Denied (403 Forbidden)</span>
              </div>
              <p className="text-xs leading-relaxed">
                You are currently signed in as an unrelated startup user. Pilot communications are strictly role-isolated under security policy SIH26136. 
                Only the assigned Department Officer, the specific selected startup (<strong>{pilot.startupName}</strong>), the empaneled Independent Validator, and assigned Panel Experts may view or post messages in this pilot channel.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Messages Stream */}
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {messagesLoading ? (
                  <div className="py-8 text-center text-xs text-slate-400">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="py-10 text-center text-slate-400 text-xs border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                    No messages yet in this pilot channel. Start the conversation below.
                  </div>
                ) : (
                  messages.map((msg, mIdx) => {
                    const isOfficer = msg.senderRole === 'government';
                    const isStartup = msg.senderRole === 'startup';
                    const isValidator = msg.senderRole === 'validator';
                    const isExpert = msg.senderRole === 'expert';

                    let roleBadgeClass = 'bg-slate-100 text-slate-700';
                    let roleLabel = 'Participant';
                    if (isOfficer) { roleBadgeClass = 'bg-blue-100 text-blue-800'; roleLabel = 'Department Officer'; }
                    else if (isStartup) { roleBadgeClass = 'bg-emerald-100 text-emerald-800'; roleLabel = 'Selected Startup'; }
                    else if (isValidator) { roleBadgeClass = 'bg-purple-100 text-purple-800'; roleLabel = 'Independent Validator'; }
                    else if (isExpert) { roleBadgeClass = 'bg-amber-100 text-amber-800'; roleLabel = 'Technical Expert'; }

                    return (
                      <div 
                        key={msg.id || mIdx}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                              {msg.senderName}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${roleBadgeClass}`}>
                              {roleLabel}
                            </span>
                            {msg.senderOrg && (
                              <span className="text-[11px] text-slate-400 hidden sm:inline">
                                • {msg.senderOrg}
                              </span>
                            )}
                          </div>

                          <span className="text-[10px] text-slate-400">
                            {formatTime(msg.timestamp)}
                          </span>
                        </div>

                        <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                          {msg.text}
                        </p>

                        {msg.attachment && (
                          <div className="pt-1">
                            <a
                              href={msg.attachment.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:underline text-xs font-semibold shadow-2xs"
                            >
                              <Paperclip className="w-3.5 h-3.5 text-blue-500" />
                              <span>{msg.attachment.name || 'View Attached Evidence Document'}</span>
                              <ExternalLink className="w-3 h-3 ml-0.5" />
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Message Composer */}
              <form onSubmit={handleSendMessage} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-blue-600" /> Send Message to Pilot Channel
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Signed in as: <strong>{user?.name || 'User'}</strong> ({user?.role || 'Guest'})
                  </span>
                </div>

                {postError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{postError}</span>
                  </div>
                )}

                <div>
                  <textarea
                    rows={2}
                    required
                    placeholder="Type an update, audit observation, or milestone note for the pilot stakeholders..."
                    value={messageText}
                    onChange={e => setMessageText(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
                  ></textarea>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <input
                      type="url"
                      placeholder="Optional attachment URL (e.g. telemetry dashboard, Google Drive, or PDF link)"
                      value={attachmentUrl}
                      onChange={e => setAttachmentUrl(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isPostingMessage || !messageText.trim()}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 justify-center cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isPostingMessage ? 'Posting...' : 'Post Message'}</span>
                  </button>
                </div>
              </form>

            </div>
          )}

        </div>
      )}

      {/* Startup Profile Modal */}
      {profileModalStartup && renderStartupProfileModal()}

      {/* Modal: Submit Milestone Evidence (Startup Flow) */}
      {evidenceModalMilestone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">
                Submit Milestone Evidence
              </h3>
              <button onClick={() => setEvidenceModalMilestone(null)} className="text-slate-400 text-xs">✕</button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
              Milestone: <strong>{evidenceModalMilestone.title || evidenceModalMilestone.name}</strong>
            </p>

            <form onSubmit={handleSubmitEvidence} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-800 dark:text-slate-200 font-bold mb-1">
                  Deliverable Summary & Ground Evidence Notes *
                </label>
                <textarea
                  rows={3}
                  required
                  value={evidenceText}
                  onChange={e => setEvidenceText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
                ></textarea>
              </div>

              <div>
                <label className="block text-slate-800 dark:text-slate-200 font-bold mb-1">
                  Telemetry / Code / Data Log URL *
                </label>
                <input
                  type="url"
                  required
                  value={evidenceUrl}
                  onChange={e => setEvidenceUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-slate-800 dark:text-slate-200 font-bold mb-1">
                  Current Measured KPI Value (% or unit) *
                </label>
                <input
                  type="text"
                  required
                  value={metricAchieved}
                  onChange={e => setMetricAchieved(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono font-bold text-xs focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEvidenceModalMilestone(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
                >
                  Submit for Lab Verification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Authorize Scale-Up Procurement (Officer Flow) */}
      {decisionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 space-y-4 shadow-2xl text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">
                Authorize GFR Rule 194 Scale Procurement
              </h3>
              <button onClick={() => setDecisionModalOpen(false)} className="text-slate-400 text-xs">✕</button>
            </div>

            <form onSubmit={handleSubmitDecision} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-800 dark:text-slate-200 font-bold mb-1">
                  Procurement Outcome Decision *
                </label>
                <select
                  value={decisionOutcome}
                  onChange={e => setDecisionOutcome(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold"
                >
                  <option value="PROCEED_TO_DIRECT_PROCUREMENT_AND_MULTI_DISTRICT_SCALE">PROCEED_TO_DIRECT_PROCUREMENT_AND_MULTI_DISTRICT_SCALE (City-Wide Scale)</option>
                  <option value="EXPAND_PILOT">EXPAND_PILOT (Extend testbed to adjacent municipal wards)</option>
                  <option value="PROCURE_GEM">PROCURE_GEM (Direct rate-contract onboarding on GeM)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-800 dark:text-slate-200 font-bold mb-1">
                  Sanctioned Scale Budget (₹ INR) *
                </label>
                <input
                  type="number"
                  required
                  value={scaleBudget}
                  onChange={e => setScaleBudget(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-800 dark:text-slate-200 font-bold mb-1">
                  Department Evaluation Memo & Audit Justification *
                </label>
                <textarea
                  rows={4}
                  required
                  value={evaluationMemo}
                  onChange={e => setEvaluationMemo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs leading-relaxed"
                ></textarea>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setDecisionModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20"
                >
                  Confirm & Authorize Scale Procurement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pilot Evidence Report Modal */}
      <PilotEvidenceReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        pilotId={pilot?.id || 'pilot-1'}
      />

    </div>
  );
};
