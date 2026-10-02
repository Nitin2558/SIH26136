import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Rocket, 
  Send, 
  AlertCircle, 
  X, 
  ShieldCheck, 
  CheckSquare, 
  Layers, 
  Award,
  Sparkles,
  ExternalLink,
  Users,
  AlertTriangle
} from 'lucide-react';

export const ApplyProposalModal = ({ problem, isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const currentStartupId = user?.startupId || 'start-1';

  const [startupProfile, setStartupProfile] = useState(null);
  const [activeStatus, setActiveStatus] = useState(null);
  const [collaborations, setCollaborations] = useState([]);
  const [fetchingCollabs, setFetchingCollabs] = useState(false);

  const [startupName, setStartupName] = useState(user?.companyName || 'CleanRoute Technologies Pvt Ltd');
  const [dpiitNumber, setDpiitNumber] = useState(user?.dpiitNumber || 'DIPP-84920');
  const [trlLevel, setTrlLevel] = useState(7);
  const [solutionTitle, setSolutionTitle] = useState('Dynamic AI Dispatch & Telematics Routing Engine');
  const [proposalText, setProposalText] = useState(
    'Deploying an automated edge-AI telemetry unit in 25 municipal collection vehicles connected to our central dynamic dispatch engine to re-optimize routes every 15 minutes, cutting transit delays from 40% to 22% and reducing diesel consumption by 18%.'
  );
  const [estimatedWeeks, setEstimatedWeeks] = useState(12);
  const [requestedFunding, setRequestedFunding] = useState(problem?.budgetAmount || problem?.pilotGrantBudget || 1250000);
  const [leadName, setLeadName] = useState(user?.name || 'Priya Patel');
  const [teamMembersStr, setTeamMembersStr] = useState('Priya Patel (CEO), Maya Iyer (GIS Lead), Devraj Sen (Hardware Ops)');
  const [demoUrl, setDemoUrl] = useState('https://cleanroute.demo.sih.gov.in/demo');
  const [pitchDeckUrl, setPitchDeckUrl] = useState('https://cleanroute.demo.sih.gov.in/deck.pdf');

  // Collaboration State
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [applicantRole, setApplicantRole] = useState('');
  const [partnerRole, setPartnerRole] = useState('');

  // Fair Eligibility Self-Certifications
  const [certDpiit, setCertDpiit] = useState(true);
  const [certIp, setCertIp] = useState(true);
  const [certSecurity, setCertSecurity] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen || !problem) return;

    fetch(`/api/startups/${currentStartupId}`)
      .then(res => res.json())
      .then(data => {
        if (data.startup) {
          setStartupProfile(data.startup);
          setStartupName(data.startup.name || startupName);
          setDpiitNumber(data.startup.dpiitNumber || dpiitNumber);
          if (data.startup.trlLevel) setTrlLevel(data.startup.trlLevel);
        }
        if (data.activeChallenges) {
          setActiveStatus({
            activeCount: data.activeChallengesCount,
            limitReached: data.limitReached,
            activeChallenges: data.activeChallenges
          });
        }
      })
      .catch(err => console.error('Error fetching startup:', err));

    setFetchingCollabs(true);
    fetch(`/api/startups/${currentStartupId}/collaborations`)
      .then(res => res.json())
      .then(data => {
        const accepted = data.accepted || [];
        setCollaborations(accepted);
        // Pre-select if there is an accepted collaboration for this challenge
        const forThisChal = accepted.find(c => c.challengeId === problem.id);
        if (forThisChal) {
          const pId = forThisChal.fromStartupId === currentStartupId ? forThisChal.toStartupId : forThisChal.fromStartupId;
          setSelectedPartnerId(pId);
          setApplicantRole('Municipal GIS mapping, telemetry gateway & field navigation');
          setPartnerRole(forThisChal.proposedRole || 'Subsurface acoustic sensor loggers & signal processing AI');
        } else if (accepted.length > 0) {
          const first = accepted[0];
          const pId = first.fromStartupId === currentStartupId ? first.toStartupId : first.fromStartupId;
          setSelectedPartnerId(pId);
        }
      })
      .catch(err => console.error('Error fetching collabs:', err))
      .finally(() => setFetchingCollabs(false));
  }, [isOpen, problem, currentStartupId]);

  if (!isOpen || !problem) return null;

  // Domain check
  const domains = startupProfile?.domains || [startupProfile?.sector].filter(Boolean);
  const chalSector = problem.sector || '';
  const chalTitle = problem.title || '';
  const isInDomain = domains.length === 0 || domains.some(d => 
    chalSector.toLowerCase().includes(d.toLowerCase()) || 
    d.toLowerCase().includes(chalSector.toLowerCase()) ||
    chalTitle.toLowerCase().includes(d.toLowerCase())
  );

  const limitReached = activeStatus?.limitReached || (activeStatus?.activeCount >= 2);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (limitReached) {
      setError('Active challenge limit reached (2/2). Complete or withdraw from an existing challenge before taking on a new one.');
      return;
    }

    if (!isInDomain && !selectedPartnerId) {
      setError('Cross-domain collaboration required: You must select an accepted partner startup matching this challenge sector.');
      return;
    }

    if (!certDpiit || !certIp || !certSecurity) {
      setError('Please acknowledge all fair eligibility and compliance self-certifications.');
      return;
    }

    setLoading(true);
    setError('');

    const selectedPartnerCollab = collaborations.find(c => 
      c.fromStartupId === selectedPartnerId || c.toStartupId === selectedPartnerId
    );
    const partnerName = selectedPartnerCollab 
      ? (selectedPartnerCollab.fromStartupId === currentStartupId ? selectedPartnerCollab.toStartupName : selectedPartnerCollab.fromStartupName)
      : '';

    try {
      const res = await fetch(`/api/challenges/${problem.id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startupId: currentStartupId,
          startupName,
          founderName: leadName,
          proposalTitle: solutionTitle,
          proposalSummary: proposalText,
          technicalApproach: proposalText,
          requestedBudget: Number(requestedFunding),
          proposedWeeks: Number(estimatedWeeks),
          leadName,
          teamMembers: teamMembersStr.split(',').map(m => m.trim()),
          demoUrl,
          pitchDeckUrl,
          isJointApplication: !isInDomain,
          partnerStartupId: !isInDomain ? selectedPartnerId : null,
          partnerStartupName: !isInDomain ? partnerName : null,
          applicantRole: !isInDomain ? (applicantRole || `${startupName} Lead`) : null,
          partnerRole: !isInDomain ? (partnerRole || `${partnerName} Partner Lead`) : null,
          selfCertifications: {
            dpiitRegistered: certDpiit,
            ipOwnership: certIp,
            securityCompliant: certSecurity
          }
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit proposal');

      if (onSuccess) onSuccess(data.application || data.proposal);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 overflow-hidden max-h-[90vh] overflow-y-auto shadow-2xl text-slate-900 dark:text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300">
              <Rocket className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Submit Innovation Pilot Proposal</h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  DPIIT Fair Access
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Target Challenge: {problem.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white bg-slate-100 dark:bg-slate-800 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Active Challenge Limit Warning Banner */}
        {limitReached && (
          <div className="mt-4 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/70 border-2 border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-200 text-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="font-bold">Active Challenge Limit Reached (2/2)</strong>
              <p className="leading-relaxed text-[11px]">
                Under SIH26136 guidelines, each startup is limited to a maximum of 2 active challenges simultaneously (including active pilots and submitted proposals). You must complete or withdraw from an existing challenge before taking on a new one.
              </p>
            </div>
          </div>
        )}

        {/* Capacity / Eligibility Tracker Bar */}
        <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-slate-600 dark:text-slate-400">Startup Capacity:</span>
            <strong className="text-slate-900 dark:text-white font-mono">
              {activeStatus?.activeCount || 1} / 2 Active Challenges
            </strong>
          </div>
          {isInDomain ? (
            <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              ✓ In-Domain Direct Eligible
            </span>
          ) : (
            <span className="font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800">
              ⚠ Cross-Domain Collaboration Required
            </span>
          )}
        </div>

        {/* Cross-Domain Collaboration Card (When outside registered domain) */}
        {!isInDomain && (
          <div className="mt-4 p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border-2 border-purple-300 dark:border-purple-700 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-purple-950 dark:text-purple-200 font-bold">
                <Users className="w-4 h-4 text-purple-600" />
                <span>Cross-Domain Partner Selection (Mandatory)</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-200 uppercase">
                SIH26136 Rule
              </span>
            </div>

            <p className="text-[11px] text-purple-800 dark:text-purple-300 leading-relaxed">
              This challenge requires expertise in <strong>{chalSector}</strong>. Because your primary registered domains are <code>{domains.join(', ')}</code>, you must include an accepted partner startup whose registered domain matches this challenge.
            </p>

            {collaborations.length === 0 ? (
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 text-[11px] text-amber-700 dark:text-amber-400 space-y-1">
                <p className="font-bold">No accepted collaborations available.</p>
                <p>
                  Please send a collaboration invitation to an eligible partner startup via the <strong>Messages / Collaborations</strong> tab. Once they accept, their entity will appear here for joint submission.
                </p>
              </div>
            ) : (
              <div className="space-y-3 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-purple-200 dark:border-purple-800">
                <div>
                  <label className="block text-[11px] font-bold text-slate-900 dark:text-white mb-1">
                    Select Accepted Partner Startup *
                  </label>
                  <select
                    value={selectedPartnerId}
                    onChange={e => setSelectedPartnerId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-purple-300 dark:border-purple-700 text-slate-900 dark:text-white font-bold text-xs focus:outline-none"
                  >
                    <option value="">-- Choose verified partner startup --</option>
                    {collaborations.map(c => {
                      const pId = c.fromStartupId === currentStartupId ? c.toStartupId : c.fromStartupId;
                      const pName = c.fromStartupId === currentStartupId ? c.toStartupName : c.fromStartupName;
                      return (
                        <option key={c.id} value={pId}>
                          {pName} (Status: Accepted Partner • {c.challengeSector || 'Domain Partner'})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Lead Startup Contribution / Role
                    </label>
                    <input
                      type="text"
                      value={applicantRole}
                      onChange={e => setApplicantRole(e.target.value)}
                      placeholder="e.g. Municipal GIS mapping, telemetry gateway & dashboard"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Partner Startup Contribution / Role
                    </label>
                    <input
                      type="text"
                      value={partnerRole}
                      onChange={e => setPartnerRole(e.target.value)}
                      placeholder="e.g. Acoustic pipe sensors & ML leakage localization"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-5 text-xs">
          
          {/* Section 1: Startup Profile & DPIIT Identity */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> 1. Startup Credentials & DPIIT Registration
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Company Legal Entity *</label>
                <input
                  type="text"
                  required
                  value={startupName}
                  onChange={e => setStartupName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">DPIIT Recognition Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DIPP-84920"
                  value={dpiitNumber}
                  onChange={e => setDpiitNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono font-bold focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Technology Readiness Level (TRL) *</label>
                <select
                  value={trlLevel}
                  onChange={e => setTrlLevel(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-600"
                >
                  <option value={4}>TRL 4: Lab Validated Prototype</option>
                  <option value={5}>TRL 5: Integrated in Relevant Environment</option>
                  <option value={6}>TRL 6: Prototype Demonstrated in Field</option>
                  <option value={7}>TRL 7: System Prototype Demonstrated in Operational Field (Recommended for SBoT)</option>
                  <option value={8}>TRL 8: System Complete & Qualified</option>
                  <option value={9}>TRL 9: Proven Operational System</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Founding / Technical Lead *</label>
                <input
                  type="text"
                  required
                  value={leadName}
                  onChange={e => setLeadName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Proposed Solution & Outcome Benchmarks */}
          <div className="space-y-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Proposed Solution Title *</label>
              <input
                type="text"
                required
                value={solutionTitle}
                onChange={e => setSolutionTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold text-sm focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Technical Pilot Proposal & Methodology *</label>
              <textarea
                rows={4}
                required
                value={proposalText}
                onChange={e => setProposalText(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 leading-relaxed focus:outline-none focus:border-blue-600"
                placeholder="Explain how your innovation addresses the baseline KPI, hardware/software deployment plan, and trial milestones..."
              ></textarea>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Pilot Trial Timeline (Weeks) *</label>
                <input
                  type="number"
                  min={4}
                  max={52}
                  value={estimatedWeeks}
                  onChange={e => setEstimatedWeeks(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Pilot Grant Budget Request (₹ INR) *</label>
                <input
                  type="number"
                  value={requestedFunding}
                  onChange={e => setRequestedFunding(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono font-bold focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Live Sandbox / Demo URL</label>
                <input
                  type="url"
                  value={demoUrl}
                  onChange={e => setDemoUrl(e.target.value)}
                  placeholder="https://yourstartup.com/demo"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-xs focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Technical Pitch Deck PDF Link</label>
                <input
                  type="url"
                  value={pitchDeckUrl}
                  onChange={e => setPitchDeckUrl(e.target.value)}
                  placeholder="https://yourstartup.com/deck.pdf"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-xs focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Core Engineering Team Members</label>
              <input
                type="text"
                value={teamMembersStr}
                onChange={e => setTeamMembersStr(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          {/* Section 3: Fair Eligibility & Statutory Compliance Self-Certifications */}
          <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-blue-600" /> Mandatory Fair Eligibility Compliance Declarations
            </h4>
            
            <label className="flex items-start gap-2.5 cursor-pointer text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={certDpiit}
                onChange={e => setCertDpiit(e.target.checked)}
                className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 shrink-0"
              />
              <span>We certify that our entity is a recognized startup under DPIIT rules with valid certificate and turnover limits.</span>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={certIp}
                onChange={e => setCertIp(e.target.checked)}
                className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 shrink-0"
              />
              <span>We confirm 100% intellectual property ownership or explicit licensing of the proposed technology core.</span>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={certSecurity}
                onChange={e => setCertSecurity(e.target.checked)}
                className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 shrink-0"
              />
              <span>We agree to pilot data isolation, CERT-In compliance, and independent 3rd-party validation audits.</span>
            </label>
          </div>

          {/* Submit Actions */}
          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || limitReached || (!isInDomain && !selectedPartnerId)}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading 
                ? 'Submitting Application...' 
                : limitReached 
                ? 'Limit Reached (2/2 Active)' 
                : (!isInDomain && !selectedPartnerId)
                ? 'Select Partner to Proceed'
                : 'Submit Pilot Proposal'} <Send className="w-3.5 h-3.5" />
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
