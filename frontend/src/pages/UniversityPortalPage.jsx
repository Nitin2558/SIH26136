import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Rocket, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Layers, 
  ArrowRight,
  DollarSign,
  Award,
  Sparkles,
  FileText,
  HelpCircle,
  FolderKanban,
  MessageSquare,
  Users,
  Search,
  Filter,
  Edit3,
  Save,
  Send,
  Check,
  X,
  AlertTriangle,
  Building2,
  ExternalLink,
  MapPin,
  TrendingUp,
  UserCheck,
  Wallet,
  CheckCircle,
  Info,
  ChevronRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ApplyProposalModal } from '../components/ApplyProposalModal';
import { StartupActionsCard } from '../components/StartupActionsCard';
import { getSharedValidationState } from '../services/sharedValidationStore';

export const UniversityPortalPage = ({ activeTab = 'university', setActiveTab, setSelectedProblemId, setSelectedTeamId }) => {
  const { user } = useAuth();
  const startupId = user?.startupId || 'start-1';

  // Shared validator store
  const [valStore, setValStore] = useState(getSharedValidationState());

  useEffect(() => {
    const handleValUpdate = () => {
      setValStore(getSharedValidationState());
    };
    window.addEventListener('sih-validation-update', handleValUpdate);
    window.addEventListener('storage', handleValUpdate);
    return () => {
      window.removeEventListener('sih-validation-update', handleValUpdate);
      window.removeEventListener('storage', handleValUpdate);
    };
  }, []);

  const m2Data = valStore.milestones?.find(m => m.id === 'ms-2');

  // Map activeTab from sidebar to internal section view
  const getSectionFromTab = (tab) => {
    switch (tab) {
      case 'startup-my-work': return 'my-work';
      case 'startup-explore': return 'explore';
      case 'startup-collaborations': return 'collaborations';
      case 'startup-messages': return 'messages';
      case 'startup-profile': return 'profile';
      case 'startup-payments': return 'payments';
      default: return 'overview';
    }
  };

  const currentSection = getSectionFromTab(activeTab);

  // Core Data
  const [startupProfile, setStartupProfile] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [activeChallenges, setActiveChallenges] = useState([]);
  const [activeCount, setActiveCount] = useState(1);
  const [applications, setApplications] = useState([]);
  const [collaborations, setCollaborations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activePartnerId, setActivePartnerId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Apply Modal state
  const [selectedProblemForApply, setSelectedProblemForApply] = useState(null);

  // Explore filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSectorFilter, setSelectedSectorFilter] = useState('All');
  const [selectedStateFilter, setSelectedStateFilter] = useState('All');

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    name: '',
    founderName: '',
    founderEmail: '',
    dpiitNumber: '',
    teamSize: 14,
    sector: 'Smart Cities & CleanTech',
    domains: ['Smart Cities & CleanTech'],
    workforceSkills: '',
    keyCapabilities: '',
    solutionName: '',
    solutionSummary: '',
    trlLevel: 7,
    website: '',
    deckUrl: '',
    achievements: '',
    pastProjects: ''
  });
  const [profileSaveSuccess, setProfileSaveSuccess] = useState('');
  const [profileSaveError, setProfileSaveError] = useState('');

  // Messaging State
  const [newMsgText, setNewMsgText] = useState('');
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteChallengeId, setInviteChallengeId] = useState('');
  const [inviteProposedRole, setInviteProposedRole] = useState('');
  const [inviteNotes, setInviteNotes] = useState('');
  const [inviteMsgSuccess, setInviteMsgSuccess] = useState('');
  const [inviteMsgError, setInviteMsgError] = useState('');

  // Milestone technical details expand/collapse state
  const [expandedMilestones, setExpandedMilestones] = useState({
    m2: true // default Milestone 2 open to immediately demonstrate verification details
  });
  const toggleMilestone = (mId) => {
    setExpandedMilestones(prev => ({
      ...prev,
      [mId]: !prev[mId]
    }));
  };

  const refreshData = () => {
    setLoading(true);
    // 1. Fetch startup profile & active status
    fetch(`/api/startups/${startupId}`)
      .then(res => res.json())
      .then(data => {
        if (data.startup) {
          setStartupProfile(data.startup);
          setProfileFormData({
            name: data.startup.name || '',
            founderName: data.startup.founderName || '',
            founderEmail: data.startup.founderEmail || '',
            dpiitNumber: data.startup.dpiitNumber || '',
            teamSize: data.startup.teamSize || 12,
            sector: data.startup.sector || 'Smart Cities & CleanTech',
            domains: Array.isArray(data.startup.domains) ? data.startup.domains : [data.startup.sector].filter(Boolean),
            workforceSkills: Array.isArray(data.startup.workforceSkills) ? data.startup.workforceSkills.join(', ') : (data.startup.workforceSkills || ''),
            keyCapabilities: Array.isArray(data.startup.keyCapabilities) ? data.startup.keyCapabilities.join(', ') : '',
            solutionName: data.startup.solutionName || '',
            solutionSummary: data.startup.solutionSummary || data.startup.description || '',
            trlLevel: data.startup.trlLevel || 7,
            website: data.startup.website || '',
            deckUrl: data.startup.deckUrl || '',
            achievements: Array.isArray(data.startup.achievements) ? data.startup.achievements.join('\n') : '',
            pastProjects: Array.isArray(data.startup.pastProjects) ? data.startup.pastProjects.join('\n') : ''
          });
        }
        if (data.activeChallenges) {
          setActiveChallenges(data.activeChallenges);
          setActiveCount(data.activeChallengesCount || data.activeChallenges.length);
        }
        if (data.applications) {
          setApplications(data.applications);
        }
      })
      .catch(err => console.error('Error fetching startup:', err));

    // 2. Fetch challenges feed
    fetch('/api/challenges/feed')
      .then(res => res.json())
      .then(data => {
        setChallenges(data.challenges || data.problems || []);
      })
      .catch(err => console.error('Error fetching challenges:', err));

    // 3. Fetch collaborations
    fetch(`/api/startups/${startupId}/collaborations`)
      .then(res => res.json())
      .then(data => {
        setCollaborations(data.all || []);
      })
      .catch(err => console.error('Error fetching collabs:', err));

    // 4. Fetch messages & conversations
    fetch(`/api/startups/${startupId}/messages`)
      .then(res => res.json())
      .then(data => {
        setMessages(data.messages || []);
        const convos = data.conversations || [];
        setConversations(convos);
        if (convos.length > 0 && !activePartnerId) {
          setActivePartnerId(convos[0].partnerId);
        }
      })
      .catch(err => console.error('Error fetching messages:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refreshData();
  }, [startupId]);

  const limitReached = activeCount >= 2;

  // Domain matching helper
  const startupDomains = Array.isArray(startupProfile?.domains) && startupProfile.domains.length > 0
    ? startupProfile.domains
    : [startupProfile?.sector || 'Smart Cities & CleanTech'].filter(Boolean);

  const checkIsInDomain = (chal) => {
    if (!startupDomains || startupDomains.length === 0) return true;
    const s = (chal.sector || '').toLowerCase();
    const t = (chal.title || '').toLowerCase();
    return startupDomains.some(d => s.includes(d.toLowerCase()) || d.toLowerCase().includes(s) || t.includes(d.toLowerCase()));
  };

  // Pending approvals (cross-domain or joint applications waiting for expert review)
  const pendingApprovals = applications.filter(a => 
    a.requiresExpertApproval && (a.expertApprovalStatus === 'pending' || a.status === 'submitted' || a.status === 'under_evaluation')
  );

  // Filtered challenges for explore
  const filteredChallenges = challenges.filter(c => {
    const matchesSearch = !searchQuery || 
      c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.departmentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.problemStatement?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSector = selectedSectorFilter === 'All' || c.sector === selectedSectorFilter;
    const matchesState = selectedStateFilter === 'All' || c.locationState === selectedStateFilter;
    return matchesSearch && matchesSector && matchesState;
  });

  // Handle Profile Save
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSaveError('');
    setProfileSaveSuccess('');

    try {
      const res = await fetch('/api/startups/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: startupProfile?.id || startupId,
          name: profileFormData.name,
          founderName: profileFormData.founderName,
          founderEmail: profileFormData.founderEmail,
          dpiitNumber: profileFormData.dpiitNumber,
          teamSize: Number(profileFormData.teamSize),
          sector: profileFormData.domains[0] || profileFormData.sector,
          domains: profileFormData.domains,
          workforceSkills: profileFormData.workforceSkills,
          keyCapabilities: profileFormData.keyCapabilities,
          solutionName: profileFormData.solutionName,
          description: profileFormData.solutionSummary,
          solutionSummary: profileFormData.solutionSummary,
          trlLevel: Number(profileFormData.trlLevel),
          website: profileFormData.website,
          deckUrl: profileFormData.deckUrl,
          achievements: profileFormData.achievements,
          pastProjects: profileFormData.pastProjects
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save startup profile');

      setProfileSaveSuccess('✓ Startup profile updated successfully!');
      setIsEditingProfile(false);
      refreshData();
    } catch (err) {
      setProfileSaveError(err.message);
    }
  };

  // Handle Collaboration Response (Accept / Decline)
  const handleRespondCollab = async (collabId, action) => {
    if (action === 'accept' && limitReached) {
      alert('Active challenge limit reached (2/2). Complete or withdraw from an existing challenge before taking on a new one.');
      return;
    }

    try {
      const res = await fetch(`/api/startups/collaborations/${collabId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startupId: startupProfile?.id || startupId,
          action,
          responseNotes: action === 'accept' ? 'Collaboration accepted by partner startup.' : 'Declined due to current bandwidth.'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update collaboration');
      refreshData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Handle Send Message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMsgText.trim() || !activePartnerId) return;

    try {
      const res = await fetch('/api/startups/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromStartupId: startupProfile?.id || startupId,
          toStartupId: activePartnerId,
          text: newMsgText.trim()
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send message');
      setNewMsgText('');
      refreshData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Handle Send Collaboration Invite
  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (limitReached) {
      setInviteMsgError('Active challenge limit reached (2/2). Cannot initiate new challenge collaborations.');
      return;
    }
    if (!inviteChallengeId || !activePartnerId) {
      setInviteMsgError('Please select a target challenge.');
      return;
    }

    setInviteMsgError('');
    setInviteMsgSuccess('');

    try {
      const res = await fetch('/api/startups/collaborations/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromStartupId: startupProfile?.id || startupId,
          toStartupId: activePartnerId,
          challengeId: inviteChallengeId,
          proposedRole: inviteProposedRole || 'Joint solution partner',
          notes: inviteNotes || 'Let us partner on this outcome challenge.'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send invitation');

      setInviteMsgSuccess('✓ Collaboration invite sent successfully!');
      setTimeout(() => {
        setInviteModalOpen(false);
        setInviteMsgSuccess('');
        refreshData();
      }, 1200);
    } catch (err) {
      setInviteMsgError(err.message);
    }
  };

  const activeConversation = conversations.find(c => c.partnerId === activePartnerId) || conversations[0];
  const activeMessages = messages.filter(m => 
    (m.senderStartupId === startupId && m.recipientStartupId === activePartnerId) ||
    (m.senderStartupId === activePartnerId && m.recipientStartupId === startupId)
  );

  return (
    <div className="space-y-8 py-4">
      
      {/* OVERVIEW SECTION: Simple Summary of Active Challenges, Two-Challenge Limit, Pending Approvals, Next Actions */}
      {currentSection === 'overview' && (
        <div className="space-y-6">

          {/* 1. Header & Active Challenge Capacity & Domain Rules Card */}
          <div className="civic-card p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Startup Innovation Command Portal
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800 uppercase">
                DPIIT Startup India
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage outcome-based pilot deliverables, cross-domain partnerships, milestone escrow releases, and verified capabilities under GFR Rule 173(i) waivers.
            </p>
          </div>

          {/* Active Challenge Capacity Counter Badge */}
          <div className="flex items-center gap-2.5">
            <div className={`px-4 py-2 rounded-2xl border flex items-center gap-2 font-mono text-xs font-bold ${
              limitReached
                ? 'bg-rose-50 dark:bg-rose-950/80 border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300'
                : 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300'
            }`}>
              <span className="w-2.5 h-2.5 rounded-full bg-current animate-pulse"></span>
              <span>Active Capacity: {activeCount} / 2 Challenges</span>
              {limitReached && (
                <span className="text-[10px] font-sans font-extrabold uppercase px-1.5 py-0.2 rounded bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200 ml-1">
                  Ceiling Reached
                </span>
              )}
            </div>

            <button
              onClick={() => setActiveTab('startup-explore')}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Explore Challenges</span>
            </button>
          </div>
        </div>

        {/* Domain Rules & Eligibility Architecture Banner */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {/* Rule 1: In-Domain Direct Application */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-emerald-900 dark:text-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>In-Domain Direct Applications</span>
            </div>
            <p className="text-[11px] text-emerald-800 dark:text-emerald-300 leading-relaxed">
              Your startup is registered in <strong className="underline">{startupDomains.join(', ')}</strong>. You can apply directly as a solo applicant for any challenge within these domains without prior co-partner requirement.
            </p>
          </div>

          {/* Rule 2: Outside-Domain Partner + Expert Approval Rule */}
          <div className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/80 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-purple-900 dark:text-purple-200">
              <Users className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
              <span>Outside-Domain Joint Collaboration Rule</span>
            </div>
            <p className="text-[11px] text-purple-800 dark:text-purple-300 leading-relaxed">
              Applying to challenges outside your registered domain requires an <strong>accepted partner startup</strong> operating in that domain and must receive <strong>Expert Panel approval</strong> prior to sandbox award.
            </p>
          </div>
        </div>

        {/* Pending Approvals Status Alert (if any joint application is under expert review) */}
        {pendingApprovals.length > 0 ? (
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <strong className="font-bold">Pending Approvals ({pendingApprovals.length}):</strong>
                <span className="ml-1 text-[11px]">
                  {pendingApprovals.map(a => `${a.proposalTitle || a.title || 'Joint Proposal'} (Partner: ${a.partnerStartupName || 'Partner'}) — Awaiting Expert Panel Evaluation`).join(' • ')}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 shrink-0">
              Under Review
            </span>
          </div>
        ) : (
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span>
              <strong>Pending Approvals:</strong> No cross-domain joint proposals currently awaiting expert panel clearance. Current active pilot is fully compliant.
            </span>
          </div>
        )}

        {/* Limit Warning Alert If At Capacity */}
        {limitReached && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-200 text-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="font-bold">Active Challenge Limit Reached (2/2)</strong>
              <p className="text-[11px] leading-relaxed">
                You currently have 2 active challenges underway. Under SIH26136 regulations, startups may not apply for additional challenges or accept new collaboration partnerships until an existing active challenge is completed or formally closed.
              </p>
            </div>
          </div>
        )}

        {/* Entity Credentials Line */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-600 dark:text-slate-300 flex flex-wrap items-center justify-between gap-2">
          <span>
            Entity: <strong className="text-slate-900 dark:text-white">{startupProfile?.name || 'CleanRoute Technologies'}</strong> (DPIIT: <code className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{startupProfile?.dpiitNumber || 'DIPP-84920'}</code> • TRL {startupProfile?.trlLevel || 7})
            • Registered Domain: <span className="font-semibold text-purple-700 dark:text-purple-300">{startupDomains.join(', ')}</span>
          </span>
        </div>
      </div>

          {/* Startup Innovation Gateway: Create Company, My Offers, Open Problems & Apply */}
          <StartupActionsCard onUpdate={refreshData} />

          {/* Active Pilot Summary Card */}
          <div className="civic-card p-6 md:p-8 rounded-3xl border border-blue-200 dark:border-blue-900 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/30 space-y-6 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                    Active Sandbox Pilot (Stage 5 of 8)
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                    Work Progress: 66% Complete
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Municipal Solid Waste Collection Route Optimization & Delay Reduction
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Registered Domain: <strong>Smart Cities & CleanTech</strong> • Procuring Authority: <strong>Pune Municipal Corporation (PMC)</strong> • Pilot Grant: <strong>₹ 12,50,000</strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (setSelectedProblemId) setSelectedProblemId('chal-1');
                    if (setSelectedTeamId) setSelectedTeamId('pilot-1');
                    setActiveTab('workspace');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>Open Pilot Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setActiveTab('startup-my-work')}
                  className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-blue-500" />
                  <span>View in My Work</span>
                </button>
              </div>
            </div>

            {/* Next Action Box */}
            <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <strong className="font-bold text-amber-900 dark:text-amber-200">Next Action Required:</strong>
                  <span className="text-amber-800 dark:text-amber-300 ml-1.5">
                    Submit Milestone 3 sensor telemetry log and draft GFR Rule 194 Operational Scale-Up memo for Department Officer Dr. Sunita Verma's review.
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  if (setSelectedProblemId) setSelectedProblemId('chal-1');
                  if (setSelectedTeamId) setSelectedTeamId('pilot-1');
                  setActiveTab('workspace');
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shrink-0"
              >
                Upload Evidence in Workspace
              </button>
            </div>

            {/* KPI Progress Tracker */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between text-xs gap-2">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  Target KPI: Reduce route transit delay from baseline 40% to ≤ 25%
                </span>
                <span className="font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Actual Achieved: {valStore.verifiedResult}% (Verified by {valStore.validatorOrg})
                </span>
              </div>
              
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: '85%' }}></div>
              </div>
              
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Baseline Delay: <strong>40.0%</strong></span>
                <span>Mandated Target: <strong>≤ 25.0%</strong></span>
                <span className="text-emerald-600 font-bold">Achieved In Testbed: <strong>22.0% (Exceeds Target)</strong></span>
              </div>
            </div>

            {/* Milestone Escrow Summary Row */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <Wallet className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">Escrow Tranche Summary: </span>
                  <span className="text-slate-600 dark:text-slate-300">
                    ₹ 3,75,000 Disbursed • ₹ 5,00,000 Ready for Release • ₹ 3,75,000 In Progress
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('startup-payments')}
                className="text-purple-600 dark:text-purple-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View Full Payments Ledger →</span>
              </button>
            </div>
          </div>

          {/* Quick Access Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div 
              onClick={() => setActiveTab('startup-explore')}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700 transition-all cursor-pointer group space-y-2 shadow-2xs"
            >
              <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center font-bold">
                <Rocket className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors">
                Explore Challenges
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Discover {challenges.length} active government challenges matching your sector with AI fit scores.
              </p>
              <div className="pt-1 text-xs font-bold text-purple-600 flex items-center gap-1">
                <span>Browse Challenges →</span>
              </div>
            </div>

            <div 
              onClick={() => setActiveTab('startup-collaborations')}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer group space-y-2 shadow-2xs"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                Collaborations
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Manage partner invitations, outside-domain joint bids, and expert review clearances.
              </p>
              <div className="pt-1 text-xs font-bold text-blue-600 flex items-center gap-1">
                <span>Manage Partners ({collaborations.length}) →</span>
              </div>
            </div>

            <div 
              onClick={() => setActiveTab('startup-messages')}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all cursor-pointer group space-y-2 shadow-2xs"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold">
                <MessageSquare className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                Messages
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Connect and coordinate directly with partner startups and joint consortium teams.
              </p>
              <div className="pt-1 text-xs font-bold text-emerald-600 flex items-center gap-1">
                <span>Open Messages ({messages.length}) →</span>
              </div>
            </div>

            <div 
              onClick={() => setActiveTab('startup-profile')}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-700 transition-all cursor-pointer group space-y-2 shadow-2xs"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors">
                Company Profile
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                TRL {startupProfile?.trlLevel || 7} • {startupDomains[0] || 'Smart Cities'} • DPIIT: {startupProfile?.dpiitNumber || 'DIPP-84920'}
              </p>
              <div className="pt-1 text-xs font-bold text-amber-600 flex items-center gap-1">
                <span>Update Profile →</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 1: MY WORK */}
      {currentSection === 'my-work' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs md:text-sm text-slate-500 dark:text-slate-400">
              <button 
                onClick={() => setActiveTab('university')} 
                className="hover:text-blue-600 dark:hover:text-blue-400 font-bold cursor-pointer"
              >
                Startup Dashboard
              </button>
              <span>/</span>
              <span className="font-extrabold text-slate-900 dark:text-white">My Work</span>
            </div>
            <button 
              onClick={() => setActiveTab('university')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>← Back to Overview</span>
            </button>
          </div>
          {/* Active Challenge Card: CleanRoute Pune Testbed */}
          <div className="civic-card p-6 md:p-8 rounded-3xl border border-blue-200 dark:border-blue-900 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/30 space-y-6 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                    Active Sandbox Pilot (Stage 5 of 8)
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                    Work Progress: 66% Complete
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Municipal Solid Waste Collection Route Optimization & Delay Reduction
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Registered Domain: <strong>Smart Cities & CleanTech</strong> • Procuring Authority: <strong>Pune Municipal Corporation (PMC)</strong> • Pilot Grant: <strong>₹ 12,50,000</strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (setSelectedProblemId) setSelectedProblemId('chal-1');
                    if (setSelectedTeamId) setSelectedTeamId('pilot-1');
                    setActiveTab('workspace');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>Open Pilot Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Next Action Box */}
            <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <strong className="font-bold text-amber-900 dark:text-amber-200">Next Action Required:</strong>
                  <span className="text-amber-800 dark:text-amber-300 ml-1.5">
                    Submit Milestone 3 sensor telemetry log and draft GFR Rule 194 Operational Scale-Up memo for Department Officer Dr. Sunita Verma's review.
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  if (setSelectedProblemId) setSelectedProblemId('chal-1');
                  if (setSelectedTeamId) setSelectedTeamId('pilot-1');
                  setActiveTab('workspace');
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shrink-0"
              >
                Upload Evidence in Workspace
              </button>
            </div>

            {/* KPI Progress Tracker */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between text-xs gap-2">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  Target KPI: Reduce route transit delay from baseline 40% to ≤ 25%
                </span>
                <span className="font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Actual Achieved: {valStore.verifiedResult}% (Verified by {valStore.validatorOrg})
                </span>
              </div>
              
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: '85%' }}></div>
              </div>
              
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Baseline Delay: <strong>40.0%</strong></span>
                <span>Mandated Target: <strong>≤ 25.0%</strong></span>
                <span className="text-emerald-600 font-bold">Achieved In Testbed: <strong>{valStore.verifiedResult}% (Exceeds Target)</strong></span>
              </div>
            </div>

            {/* Milestone Payment Overview & Quick Switch to Payments */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                  Milestone Escrow Tranches (Total ₹ 12,50,000)
                </span>
                <button
                  onClick={() => setActiveTab('startup-payments')}
                  className="text-purple-600 dark:text-purple-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>View Full Escrow Ledger in Payments →</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
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

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-800 space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-slate-500">Milestone 2 (40%)</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      m2Data?.status === 'ready_for_release'
                        ? 'text-blue-700 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800'
                        : m2Data?.status === 'on_hold'
                          ? 'text-amber-700 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800'
                          : 'text-rose-700 bg-rose-50 dark:bg-rose-950 border-rose-200 dark:border-rose-800'
                    }`}>
                      {m2Data?.statusLabel || 'Ready for Release'}
                    </span>
                  </div>
                  <div className="font-mono text-base font-bold text-slate-900 dark:text-white">₹ 5,00,000</div>
                  <p className="text-[11px] text-slate-500">{m2Data?.description || 'Verified 22.0% delay achieved (Sanctioned in Escrow)'}</p>
                </div>

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
        </div>
      )}

      {/* SECTION 2: EXPLORE GOVERNMENT CHALLENGES */}
      {currentSection === 'explore' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs md:text-sm text-slate-500 dark:text-slate-400">
              <button 
                onClick={() => setActiveTab('university')} 
                className="hover:text-blue-600 dark:hover:text-blue-400 font-bold cursor-pointer"
              >
                Startup Dashboard
              </button>
              <span>/</span>
              <span className="font-extrabold text-slate-900 dark:text-white">Explore Challenges</span>
            </div>
            <button 
              onClick={() => setActiveTab('university')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>← Back to Overview</span>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="civic-card p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[240px] relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search challenges by keyword, department, or sector..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              {/* Sector Filter */}
              <select
                value={selectedSectorFilter}
                onChange={e => setSelectedSectorFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
              >
                <option value="All">All Domains / Sectors</option>
                <option value="Smart Cities & CleanTech">Smart Cities & CleanTech</option>
                <option value="Water Infrastructure">Water Infrastructure</option>
                <option value="Mobility & Public Safety">Mobility & Public Safety</option>
                <option value="Renewable Energy & Healthcare">Renewable Energy & Healthcare</option>
              </select>

              {/* State Filter */}
              <select
                value={selectedStateFilter}
                onChange={e => setSelectedStateFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
              >
                <option value="All">All Locations / States</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Delhi">Delhi</option>
                <option value="Himachal Pradesh">Himachal Pradesh</option>
              </select>
            </div>
          </div>

          {/* Challenges Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredChallenges.map(chal => {
              const inDomain = checkIsInDomain(chal);
              const isCleanRouteCurrent = chal.id === 'chal-1';

              return (
                <div 
                  key={chal.id}
                  className="civic-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      {inDomain ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          ✓ In-Domain Eligible
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                          ⚠ Cross-Domain Collaboration Required
                        </span>
                      )}

                      <span className="text-[10px] font-mono text-slate-500">
                        {chal.locationState} • {chal.durationWeeks} Weeks
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                      {chal.title}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                      {chal.problemStatement}
                    </p>

                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-[11px] space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Department:</span>
                        <strong className="text-slate-900 dark:text-white truncate max-w-[200px]">{chal.departmentName}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Target KPI:</span>
                        <strong className="text-emerald-600 dark:text-emerald-400">{chal.targetKpi?.metric || 'Performance outcome'} ({chal.targetKpi?.targetOperator || '<='} {chal.targetKpi?.value}{chal.targetKpi?.unit || '%'})</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Sandbox Pilot Grant:</span>
                        <strong className="font-mono text-slate-900 dark:text-white">₹ {(chal.budgetAmount || 1000000).toLocaleString('en-IN')}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">
                      {isCleanRouteCurrent ? 'Current Active Pilot' : inDomain ? 'Direct Application' : 'Joint Application'}
                    </span>

                    {isCleanRouteCurrent ? (
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-3 py-1 rounded-xl">
                        Active in Sandbox
                      </span>
                    ) : (
                      <button
                        onClick={() => setSelectedProblemForApply(chal)}
                        disabled={limitReached}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          limitReached
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-700'
                            : inDomain
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                            : 'bg-purple-600 hover:bg-purple-700 text-white shadow-xs'
                        }`}
                      >
                        <span>{limitReached ? 'Limit Reached (2/2)' : inDomain ? 'Apply Now' : 'Joint Apply'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 3: MY COLLABORATIONS */}
      {currentSection === 'collaborations' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs md:text-sm text-slate-500 dark:text-slate-400">
              <button 
                onClick={() => setActiveTab('university')} 
                className="hover:text-blue-600 dark:hover:text-blue-400 font-bold cursor-pointer"
              >
                Startup Dashboard
              </button>
              <span>/</span>
              <span className="font-extrabold text-slate-900 dark:text-white">Collaborations</span>
            </div>
            <button 
              onClick={() => setActiveTab('university')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>← Back to Overview</span>
            </button>
          </div>

          <div className="civic-card p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Cross-Domain Startup Collaborations
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Partner with startups operating in complementary domains to unlock multi-disciplinary government challenges under SIH26136.
              </p>
            </div>

            {/* Collaborations Cards */}
            <div className="space-y-4 pt-2">
              {collaborations.map(collab => {
                const isIncoming = collab.toStartupId === startupId;
                const isPending = collab.status === 'pending';
                const isAccepted = collab.status === 'accepted';
                const isDeclined = collab.status === 'declined';
                const partnerName = isIncoming ? collab.fromStartupName : collab.toStartupName;

                return (
                  <div
                    key={collab.id}
                    className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 text-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          isAccepted 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                            : isPending 
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' 
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}>
                          {collab.status}
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          Partner: {partnerName}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          ({isIncoming ? 'Received Request' : 'Sent Request'})
                        </span>
                      </div>

                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(collab.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1">
                      <div className="text-[11px] text-slate-500 font-semibold">
                        Target Challenge: <strong className="text-slate-900 dark:text-white">{collab.challengeTitle}</strong>
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-300">
                        <strong>Proposed Joint Roles:</strong> {collab.proposedRole}
                      </div>
                      {collab.notes && (
                        <div className="text-[11px] text-slate-500 italic">
                          "{collab.notes}"
                        </div>
                      )}
                    </div>

                    {/* Actions for Incoming Pending Requests */}
                    {isIncoming && isPending && (
                      <div className="flex items-center justify-end gap-2.5 pt-1">
                        <button
                          onClick={() => handleRespondCollab(collab.id, 'decline')}
                          className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleRespondCollab(collab.id, 'accept')}
                          disabled={limitReached}
                          className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold disabled:opacity-50"
                        >
                          {limitReached ? 'Limit Reached (2/2)' : 'Accept Collaboration'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: STARTUP-TO-STARTUP MESSAGES */}
      {currentSection === 'messages' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs md:text-sm text-slate-500 dark:text-slate-400">
              <button 
                onClick={() => setActiveTab('university')} 
                className="hover:text-blue-600 dark:hover:text-blue-400 font-bold cursor-pointer"
              >
                Startup Dashboard
              </button>
              <span>/</span>
              <span className="font-extrabold text-slate-900 dark:text-white">Messages</span>
            </div>
            <button 
              onClick={() => setActiveTab('university')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>← Back to Overview</span>
            </button>
          </div>

          <div className="civic-card rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 min-h-[500px]">
            {/* Left Column: Conversations List */}
            <div className="border-r border-slate-200 dark:border-slate-800 p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Conversations
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Prototype Messaging</span>
              </div>

              <div className="space-y-1.5">
                {conversations.map(c => {
                  const isSelected = c.partnerId === activePartnerId;
                  return (
                    <div
                      key={c.partnerId}
                      onClick={() => setActivePartnerId(c.partnerId)}
                      className={`p-3 rounded-2xl cursor-pointer transition-all space-y-1 ${
                        isSelected 
                          ? 'bg-purple-50 dark:bg-purple-950/80 border border-purple-300 dark:border-purple-700' 
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {c.partnerName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(c.lastTimestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        {c.lastMessage}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] text-purple-700 dark:text-purple-300">
                        <span>{c.partnerDomains?.[0] || 'Domain Partner'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Active Thread & Actions */}
            <div className="md:col-span-2 flex flex-col justify-between p-4 md:p-6 space-y-4">
              {activeConversation ? (
                <>
                  {/* Thread Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {activeConversation.partnerName}
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Founder: {activeConversation.partnerFounder} • TRL {activeConversation.partnerTrl} • DPIIT: {activeConversation.partnerDpiit || 'Verified'}
                      </p>
                    </div>

                    <button
                      onClick={() => setInviteModalOpen(true)}
                      disabled={limitReached}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>{limitReached ? 'Limit Reached (2/2)' : 'Invite to Collaborate'}</span>
                    </button>
                  </div>

                  {/* Messages Bubble History */}
                  <div className="flex-1 space-y-3 overflow-y-auto max-h-[380px] p-2">
                    {activeMessages.map(m => {
                      const isMe = m.senderStartupId === startupId;
                      return (
                        <div
                          key={m.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <span className="text-[10px] text-slate-400 mb-0.5">
                            {isMe ? 'You' : m.senderStartupName}
                          </span>
                          <div className={`p-3 rounded-2xl max-w-md text-xs leading-relaxed ${
                            isMe 
                              ? 'bg-purple-600 text-white rounded-tr-xs shadow-xs' 
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-xs'
                          }`}>
                            {m.text}
                          </div>
                          <span className="text-[9px] text-slate-400 mt-0.5">
                            {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Message Input Box */}
                  <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <input
                      type="text"
                      value={newMsgText}
                      onChange={e => setNewMsgText(e.target.value)}
                      placeholder={`Message ${activeConversation.partnerName}...`}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                    />
                    <button
                      type="submit"
                      disabled={!newMsgText.trim()}
                      className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                  Select a startup conversation to view discussions.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      )}

      {/* SECTION 5: MY PROFILE */}
      {currentSection === 'profile' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs md:text-sm text-slate-500 dark:text-slate-400">
              <button 
                onClick={() => setActiveTab('university')} 
                className="hover:text-blue-600 dark:hover:text-blue-400 font-bold cursor-pointer"
              >
                Startup Dashboard
              </button>
              <span>/</span>
              <span className="font-extrabold text-slate-900 dark:text-white">Company Profile</span>
            </div>
            <button 
              onClick={() => setActiveTab('university')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>← Back to Overview</span>
            </button>
          </div>

          <div className="civic-card p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                DPIIT Startup Registered Profile
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Operating domains, workforce capabilities, and past achievements used for explainable matching and GFR Rule 173(i) waivers.
              </p>
            </div>

            <button
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="px-4 py-2 rounded-xl border border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 font-bold text-xs hover:bg-purple-50 dark:hover:bg-purple-950 flex items-center gap-1.5 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditingProfile ? 'Cancel Editing' : 'Edit Startup Profile'}</span>
            </button>
          </div>

          {profileSaveSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold">
              {profileSaveSuccess}
            </div>
          )}
          {profileSaveError && (
            <div className="p-3.5 rounded-xl bg-rose-50 text-rose-800 text-xs font-semibold">
              {profileSaveError}
            </div>
          )}

          {isEditingProfile ? (
            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Company Legal Name</label>
                  <input
                    type="text"
                    required
                    value={profileFormData.name}
                    onChange={e => setProfileFormData({ ...profileFormData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">DPIIT Recognition Number</label>
                  <input
                    type="text"
                    required
                    value={profileFormData.dpiitNumber}
                    onChange={e => setProfileFormData({ ...profileFormData, dpiitNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              {/* Prominent & Required Operating Domains */}
              <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-purple-950 dark:text-purple-200">
                    Operating Domains / Sectors (Required & Prominent) *
                  </label>
                  <span className="text-[10px] text-purple-700 dark:text-purple-300">
                    Used for challenge eligibility & matching
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {[
                    'Smart Cities & CleanTech',
                    'Water Infrastructure',
                    'Mobility & Public Safety',
                    'Renewable Energy & Healthcare',
                    'Public Service Innovation & Governance'
                  ].map(dom => {
                    const isSelected = profileFormData.domains.includes(dom);
                    return (
                      <button
                        key={dom}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            if (profileFormData.domains.length > 1) {
                              setProfileFormData({
                                ...profileFormData,
                                domains: profileFormData.domains.filter(d => d !== dom)
                              });
                            }
                          } else {
                            setProfileFormData({
                              ...profileFormData,
                              domains: [...profileFormData.domains, dom]
                            });
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
                          isSelected 
                            ? 'bg-purple-600 text-white border-purple-600' 
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '} {dom}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Team Size</label>
                  <input
                    type="number"
                    value={profileFormData.teamSize}
                    onChange={e => setProfileFormData({ ...profileFormData, teamSize: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Workforce Skills (Comma-separated)</label>
                  <input
                    type="text"
                    value={profileFormData.workforceSkills}
                    onChange={e => setProfileFormData({ ...profileFormData, workforceSkills: e.target.value })}
                    placeholder="e.g. Geospatial AI, Embedded Firmware, LoRaWAN, Full-Stack"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Solution Name & Description</label>
                <textarea
                  rows={2}
                  value={profileFormData.solutionSummary}
                  onChange={e => setProfileFormData({ ...profileFormData, solutionSummary: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Achievements (One per line)</label>
                  <textarea
                    rows={3}
                    value={profileFormData.achievements}
                    onChange={e => setProfileFormData({ ...profileFormData, achievements: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-[11px]"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Past Projects (One per line)</label>
                  <textarea
                    rows={3}
                    value={profileFormData.pastProjects}
                    onChange={e => setProfileFormData({ ...profileFormData, pastProjects: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-[11px]"
                  ></textarea>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Profile Changes</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-slate-500 font-bold uppercase text-[10px]">Registered Domains</span>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {startupDomains.map(d => (
                      <span key={d} className="px-2 py-0.5 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-[11px]">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-slate-500 font-bold uppercase text-[10px]">Team & Readiness</span>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {startupProfile?.teamSize || 14} Engineers • TRL {startupProfile?.trlLevel || 7}
                  </div>
                  <p className="text-[11px] text-slate-500">System Prototype in Operational Field</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-slate-500 font-bold uppercase text-[10px]">DPIIT Certification</span>
                  <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {startupProfile?.dpiitNumber || 'DIPP-84920'}
                  </div>
                  <p className="text-[11px] text-emerald-600 font-semibold">100% GFR 173(i) Turnover Waived</p>
                </div>
              </div>

              {/* Workforce Skills & Capabilities */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Workforce Engineering Skills</span>
                <div className="flex flex-wrap gap-1.5">
                  {(Array.isArray(startupProfile?.workforceSkills) ? startupProfile.workforceSkills : ['Geospatial Fleet AI', 'Embedded LoRaWAN Firmware', 'Full-Stack React/Node GIS']).map(skill => (
                    <span key={skill} className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-200 text-[11px]">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Achievements & Past Projects */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <span className="text-slate-500 font-bold uppercase text-[10px]">Verified Achievements</span>
                  <ul className="space-y-1.5 text-slate-700 dark:text-slate-300 text-[11px]">
                    {(Array.isArray(startupProfile?.achievements) ? startupProfile.achievements : [
                      'Pune Municipal Corporation Pilot Phase 1 completed (22.0% delay achieved)',
                      'NABL Calibrated IoT Bin Sensor certified with IP67 rating',
                      'Winner Maharashtra Urban Tech Innovation Sandbox 2025'
                    ]).map((ach, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{ach}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <span className="text-slate-500 font-bold uppercase text-[10px]">Past Municipal Projects</span>
                  <ul className="space-y-1.5 text-slate-700 dark:text-slate-300 text-[11px]">
                    {(Array.isArray(startupProfile?.pastProjects) ? startupProfile.pastProjects : [
                      'Ward 4 Smart Bin Route Optimization (45 vehicles in testbed)',
                      'Thane Municipal Solid Waste Telemetry Study'
                    ]).map((proj, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <FolderKanban className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span>{proj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 6: PAYMENTS & MILESTONE ESCROW LEDGER */}
      {/* ========================================================================= */}
      {currentSection === 'payments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs md:text-sm text-slate-500 dark:text-slate-400">
              <button 
                onClick={() => setActiveTab('university')} 
                className="hover:text-blue-600 dark:hover:text-blue-400 font-bold cursor-pointer"
              >
                Startup Dashboard
              </button>
              <span>/</span>
              <span className="font-extrabold text-slate-900 dark:text-white">Payments</span>
            </div>
            <button 
              onClick={() => setActiveTab('university')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>← Back to Overview</span>
            </button>
          </div>

          {/* Notice Banner */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-600 dark:text-slate-300 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 uppercase">
                Simulated Demo Payments
              </span>
              <span>This portal operates in demo mode. All milestone payments and authorizations are simulated; no real money is transferred.</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Pilot Account: SIH-ESCROW-PUN-041
            </span>
          </div>

          {/* 1 & 2: Clean Summary: Total Grant & 3 Simple Amounts (Paid, Ready, Pending) */}
          <div className="civic-card p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-emerald-600" />
                  Pilot Grant & Payments
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Funding is released in stages as each milestone is completed and verified by independent experts.
                </p>
              </div>

              {/* 1. Total pilot grant */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-right min-w-[180px]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Pilot Grant</span>
                <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">₹ 12,50,000</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">100% PMC Sandbox Sanction</span>
              </div>
            </div>

            {/* 2. Released, Ready for Release, or Pending */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Paid */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-emerald-900 dark:text-emerald-200">Paid</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                    30%
                  </span>
                </div>
                <div className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-300">
                  ₹ 3,75,000
                </div>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                  Transferred for Milestone 1
                </p>
              </div>

              {/* Ready for Release */}
              <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-blue-900 dark:text-blue-200">Ready for release</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                    40%
                  </span>
                </div>
                <div className="text-xl font-bold font-mono text-blue-700 dark:text-blue-300">
                  ₹ 5,00,000
                </div>
                <p className="text-[11px] text-blue-700 dark:text-blue-400">
                  Verified by IIT Delhi; transfer queued
                </p>
              </div>

              {/* Pending */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-800 dark:text-slate-200">Pending</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    30%
                  </span>
                </div>
                <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                  ₹ 3,75,000
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Awaiting Milestone 3 deliverables
                </p>
              </div>
            </div>
          </div>

          {/* 3: Milestone Schedule with What Status Means & What Happens Next */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Milestones & Next Steps
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Understand each milestone's status and what action is required. Expand any milestone to see technical verification references.
              </p>
            </div>

            {/* Milestone 1 */}
            <div className="civic-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400">M1</span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Sensor Baseline Calibration & Route Telemetry Setup
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      Paid
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Initial testbed sensor calibration completed and validated. Full milestone payment has been released.
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400 block">₹ 3,75,000</span>
                    <span className="text-[10px] text-slate-400 font-medium">30% of total grant</span>
                  </div>
                  <button
                    onClick={() => toggleMilestone('m1')}
                    className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                    title={expandedMilestones.m1 ? "Collapse details" : "Expand details"}
                  >
                    {expandedMilestones.m1 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Status Meaning & Next Step */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span><strong>Status meaning:</strong> Payment successfully credited to startup account.</span>
                </div>
                <button
                  onClick={() => toggleMilestone('m1')}
                  className="text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1 text-[11px] cursor-pointer"
                >
                  <span>{expandedMilestones.m1 ? 'Hide payment and verification details' : 'View payment and verification details'}</span>
                  {expandedMilestones.m1 ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>

              {/* Collapsible Technical Details */}
              {expandedMilestones.m1 && (
                <div className="mt-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Verification Status</span>
                    <span className="font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Achieved (Baseline: 40% route delay)
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Sanction Reference</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200 block mt-0.5">PMC/SBM/2026/041</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Payment Reference (UTR)</span>
                    <span className="font-mono text-emerald-700 dark:text-emerald-400 block mt-0.5">PFMS-UTR-20260814920 (14 Aug 2026)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Milestone 2 */}
            <div className="civic-card p-5 rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/20 dark:bg-blue-950/20 space-y-3 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-blue-500">M2</span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      22.0% Delay Reduction Performance Target
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      Ready for release
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Target verified by IIT Delhi (22.0% delay achieved, surpassing the ≤ 25% target). Department officer signed off.
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-sm font-bold font-mono text-blue-600 dark:text-blue-400 block">₹ 5,00,000</span>
                    <span className="text-[10px] text-slate-400 font-medium">40% of total grant</span>
                  </div>
                  <button
                    onClick={() => toggleMilestone('m2')}
                    className="p-1.5 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                    title={expandedMilestones.m2 ? "Collapse details" : "Expand details"}
                  >
                    {expandedMilestones.m2 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Status Meaning & Next Step */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] border-t border-blue-100 dark:border-blue-900/60">
                <div className="flex items-center gap-1.5 text-blue-800 dark:text-blue-300">
                  <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span><strong>What happens next:</strong> Payment authorization is signed and transfer is queued in the public payment system.</span>
                </div>
                <button
                  onClick={() => toggleMilestone('m2')}
                  className="text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1 text-[11px] cursor-pointer"
                >
                  <span>{expandedMilestones.m2 ? 'Hide payment and verification details' : 'View payment and verification details'}</span>
                  {expandedMilestones.m2 ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>

              {/* Collapsible Technical Details */}
              {expandedMilestones.m2 && (
                <div className="mt-3 p-4 rounded-xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Independent Validator</span>
                    <span className="font-semibold text-blue-700 dark:text-blue-300 block mt-0.5">IIT Delhi Clean Mobility Lab</span>
                    <span className="text-[10px] text-slate-500 font-mono">Report #IITD-VAL-2026-089</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Authorization Code</span>
                    <span className="font-mono text-slate-900 dark:text-white block mt-0.5">ESCROW-AUTH-PMC-M2-READY</span>
                    <span className="text-[10px] text-slate-500">Sanctioned by Dr. Sunita Verma</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Transfer Status</span>
                    <span className="font-semibold text-blue-700 dark:text-blue-300 block mt-0.5">Sanctioned • Release Queued</span>
                    <span className="text-[10px] text-slate-500">Credited automatically upon PFMS batch clearance</span>
                  </div>
                </div>
              )}
            </div>

            {/* Milestone 3 */}
            <div className="civic-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400">M3</span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Scale-Up Architecture & GFR Rule 194 Operational Memo
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      Pending verification
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Final operational memo for multi-district scale-up across 500+ municipal waste collection vehicles.
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-sm font-bold font-mono text-slate-700 dark:text-slate-300 block">₹ 3,75,000</span>
                    <span className="text-[10px] text-slate-400 font-medium">30% of total grant</span>
                  </div>
                  <button
                    onClick={() => toggleMilestone('m3')}
                    className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                    title={expandedMilestones.m3 ? "Collapse details" : "Expand details"}
                  >
                    {expandedMilestones.m3 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Status Meaning & Next Step */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span><strong>What happens next:</strong> Submit Milestone 3 telemetry data and scale memo in Workspace to trigger review and release.</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      if (setSelectedProblemId) setSelectedProblemId('chal-1');
                      if (setSelectedTeamId) setSelectedTeamId('pilot-1');
                      setActiveTab('workspace');
                    }}
                    className="text-purple-600 dark:text-purple-400 font-bold hover:underline flex items-center gap-1 text-[11px] cursor-pointer"
                  >
                    <span>Upload Evidence in Workspace →</span>
                  </button>
                  <button
                    onClick={() => toggleMilestone('m3')}
                    className="text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1 text-[11px] cursor-pointer"
                  >
                    <span>{expandedMilestones.m3 ? 'Hide payment and verification details' : 'View payment and verification details'}</span>
                    {expandedMilestones.m3 ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              {/* Collapsible Technical Details */}
              {expandedMilestones.m3 && (
                <div className="mt-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Verification Status</span>
                    <span className="font-semibold text-slate-600 dark:text-slate-400 block mt-0.5">Pending telemetry upload</span>
                    <span className="text-[10px] text-slate-500">Requires IIT Delhi audit sign-off</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Sanction Reference</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200 block mt-0.5">PMC/SBM/2026/041-T3</span>
                    <span className="text-[10px] text-slate-500">Held securely in pilot account</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Release Trigger</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block mt-0.5">Scale Memo & GFR Rule 194 Review</span>
                    <span className="text-[10px] text-slate-500">Unlocks upon final evaluation clearance</span>
                  </div>
                </div>
              )}
            </div>
          </div>
      </div>
      )}

      {/* Collaboration Invite Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Users className="w-4 h-4 text-purple-600" />
                Invite {activeConversation?.partnerName} to Collaborate
              </h3>
              <button onClick={() => setInviteModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {inviteMsgSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 font-semibold">{inviteMsgSuccess}</div>
            )}
            {inviteMsgError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-800 font-semibold">{inviteMsgError}</div>
            )}

            <form onSubmit={handleSendInvite} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Target Government Challenge *</label>
                <select
                  required
                  value={inviteChallengeId}
                  onChange={e => setInviteChallengeId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="">-- Choose challenge for collaboration --</option>
                  {challenges.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.sector})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Proposed Roles / Division of Work</label>
                <input
                  type="text"
                  value={inviteProposedRole}
                  onChange={e => setInviteProposedRole(e.target.value)}
                  placeholder="e.g. Lead provides municipal telemetry; Partner provides sensor AI"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Invitation Notes</label>
                <textarea
                  rows={2}
                  value={inviteNotes}
                  onChange={e => setInviteNotes(e.target.value)}
                  placeholder="Explain why this collaboration delivers maximum value to the procuring department..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl border text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold"
                >
                  Send Collaboration Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Apply Proposal Modal Integration */}
      {selectedProblemForApply && (
        <ApplyProposalModal
          problem={selectedProblemForApply}
          isOpen={Boolean(selectedProblemForApply)}
          onClose={() => setSelectedProblemForApply(null)}
          onSuccess={() => {
            refreshData();
            if (setActiveTab) setActiveTab('startup-my-work');
          }}
        />
      )}

    </div>
  );
};

