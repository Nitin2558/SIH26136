import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  Cpu, 
  Rocket, 
  Building2, 
  TrendingUp, 
  Scale,
  ChevronRight,
  Award,
  DollarSign,
  ShieldCheck,
  Compass,
  Sliders,
  FileSpreadsheet,
  LogIn,
  UserPlus,
  AlertTriangle,
  Printer,
  ExternalLink,
  Target
} from 'lucide-react';
import { PilotEvidenceReportModal } from '../components/PilotEvidenceReportModal';

export const LandingPage = ({ setActiveTab, setSelectedProblemId, setSignupInitialRole }) => {
  const [stats, setStats] = useState({
    totalChallenges: 4,
    activePilots: 1,
    evaluatedProposals: 2,
    totalPilotFunding: 1850000,
    startupsCount: 3,
    procurementDecisions: 1
  });

  const [featuredChallenges, setFeaturedChallenges] = useState([]);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(data => { 
        if (data.totalChallenges || data.totalProblems) {
          setStats({
            totalChallenges: data.totalChallenges || data.totalProblems || 4,
            activePilots: data.activePilots || data.activeTeams || 1,
            evaluatedProposals: data.evaluatedProposals || 2,
            totalPilotFunding: data.totalPilotFunding || data.totalFundingAllocated || 1850000,
            startupsCount: data.startupsCount || 3,
            procurementDecisions: data.procurementDecisions || data.solutionsAdopted || 1
          });
        }
      })
      .catch(() => {});

    fetch('/api/challenges/feed')
      .then(res => res.json())
      .then(data => { 
        if (data.challenges) setFeaturedChallenges(data.challenges.slice(0, 3));
        else if (data.problems) setFeaturedChallenges(data.problems.slice(0, 3));
      })
      .catch(() => {});
  }, []);

  const handleRegisterAsStartup = () => {
    if (setSignupInitialRole) setSignupInitialRole('startup');
    setActiveTab('signup');
  };

  const HOW_IT_WORKS_STEPS = [
    {
      step: '01',
      title: 'Department Posts Measurable Challenges',
      role: 'Department Officer',
      desc: 'Government departments formulate challenges with measurable KPI targets (e.g. collection delay reduction, energy savings) instead of rigid equipment brands, assisted by the AI Problem Coach.',
      icon: Building2,
      badgeColor: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
    },
    {
      step: '02',
      title: 'Startups Apply with Relaxed Eligibility',
      role: 'Startup',
      desc: 'DPIIT-recognized startups discover outcome challenges and submit proposals. Prior turnover and prior experience barriers are 100% waived under GFR Rule 173(i) and DPIIT circulars.',
      icon: Rocket,
      badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
    },
    {
      step: '03',
      title: 'Multi-Criteria Expert Evaluation',
      role: 'Expert Panel',
      desc: 'Empaneled technical domain experts evaluate proposals on a 100-point rubric across Technical Innovation (25%), Feasibility (25%), Cybersecurity (25%), and Cost ROI (25%).',
      icon: Award,
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
    },
    {
      step: '04',
      title: 'Pilots are Independently Verified',
      role: 'Independent Validator',
      desc: 'Winning startups deploy in designated live field testbeds under a Model SBoT agreement. Empaneled third-party testing labs independently audit telemetry and certify performance outcomes.',
      icon: ShieldCheck,
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
    },
    {
      step: '05',
      title: 'Milestone Payments & Scale-Up',
      role: 'Department Officer',
      desc: 'Achieved milestones transition to "Ready for release" for fast escrow disbursement. Validated pilots proceed directly to commercial scale-up and procurement under GFR Rule 194.',
      icon: Scale,
      badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
    }
  ];

  const CORE_INNOVATIONS = [
    {
      title: 'Explainable Startup Matching',
      subtitle: 'Transparent 3-Pillar Heuristic',
      desc: 'Eliminates opaque black-box recommendations with an open multi-factor heuristic: Sector Alignment (35%), TRL Maturity (30%), and Capability Fit (35%). Includes itemized score bars and plain-language rationale bullets for officers and startups.',
      badge: 'Heuristic Matching',
      icon: Sliders,
      actionText: 'View Heuristic Demo',
      onClick: () => {
        if (setSelectedProblemId) setSelectedProblemId('chal-1');
        setActiveTab('detail');
      }
    },
    {
      title: 'Procurement Journey Tracker',
      subtitle: '8-Stage Synchronized Stepper',
      desc: 'Tracks every challenge in real-time from Draft → Applications → Evaluation → Startup Selection → Pilot Active → Validation → Payment Release → Scale-Up. Displays active stage pulsing, responsible role badges, and immediate next actions.',
      badge: 'Real-time Lifecycle',
      icon: Compass,
      actionText: 'View Journey Tracker',
      onClick: () => {
        if (setSelectedProblemId) setSelectedProblemId('chal-1');
        setActiveTab('detail');
      }
    },
    {
      title: 'Evidence-Backed Pilot Reports',
      subtitle: 'Printable Audit Dossier (PDF)',
      desc: 'Consolidates baseline vs. target vs. verified actual KPIs, milestone escrow records, third-party lab audit certificates, and GFR Rule 194 scale-up sanction orders into a printable, audit-grade closeout package formatted for A4 PDF export.',
      badge: 'Print & PDF Export',
      icon: FileSpreadsheet,
      actionText: 'Preview Closeout Dossier',
      onClick: () => setShowReportModal(true)
    }
  ];

  const PUBLIC_ROLES = [
    {
      role: 'Department Officer',
      summary: 'Posts challenges and manages pilots.',
      details: 'Formulates outcome challenges using the AI Coach, selects winning startups, sets milestone escrow budgets (100%), authorizes payment tranches, and issues scale-up sanction orders.',
      icon: Building2,
      color: 'border-sky-200 dark:border-sky-900 bg-sky-50/50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300'
    },
    {
      role: 'Startup',
      summary: 'Discovers challenges, applies, and submits pilot evidence.',
      details: 'DPIIT-recognized innovation entities submit outcome proposals under relaxed turnover rules, execute field sandbox pilots, upload sensor telemetry, and track milestone escrow disbursements.',
      icon: Rocket,
      color: 'border-purple-200 dark:border-purple-900 bg-purple-50/50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300'
    },
    {
      role: 'Expert Panel',
      summary: 'Scores startup applications.',
      details: 'Independent domain academics and technical researchers evaluate applicant proposals across 4 weighted dimensions (/100 points) to provide unbiased advisory scoring.',
      icon: Award,
      color: 'border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300'
    },
    {
      role: 'Independent Validator',
      summary: 'Verifies pilot evidence and outcomes.',
      details: 'Empaneled technical assessment laboratories and audit authorities independently audit field telemetry, verify claimed KPI benchmarks, and issue compliance certification.',
      icon: ShieldCheck,
      color: 'border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
    }
  ];

  return (
    <div className="space-y-16 py-6">
      
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white p-8 md:p-14 shadow-xl shadow-blue-950/30 border border-blue-900/40">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold tracking-wide">
            <Sparkles className="w-4 h-4 text-blue-300" />
            SIH26136 — Startup Public Procurement Mechanism
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Identify, Pilot, Procure & Scale <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-sky-200 to-indigo-200">Innovative Solutions</span>
          </h1>

          <p className="text-slate-200 text-sm md:text-base leading-relaxed font-normal">
            A transparent, startup-friendly public procurement mechanism: Government departments post measurable challenges, eligible DPIIT startups apply, independent experts evaluate proposals, pilots are independently verified in live testbeds, and successful solutions proceed directly to procurement or scale-up under GFR Rule 194.
          </p>

          {/* 3 Explicit Primary Buttons Requested: Explore Challenges, Register as a Startup, Sign In */}
          <div className="flex flex-wrap items-center gap-3.5 pt-3">
            <button
              onClick={() => setActiveTab('feed')}
              className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Rocket className="w-4 h-4 text-blue-100" />
              <span>Explore Challenges</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleRegisterAsStartup}
              className="px-6 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-purple-200" />
              <span>Register as a Startup</span>
            </button>

            <button
              onClick={() => setActiveTab('login')}
              className="px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 flex items-center gap-2 transition-all cursor-pointer backdrop-blur-xs"
            >
              <LogIn className="w-4 h-4 text-slate-300" />
              <span>Sign In</span>
            </button>
          </div>
        </div>

        {/* Live Metrics Counter */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-white/10 pt-8">
          <div className="p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-xs">
            <div className="text-2xl md:text-3xl font-black text-sky-300">{stats.totalChallenges}</div>
            <div className="text-xs text-slate-200 font-medium mt-0.5">Outcome Challenges</div>
          </div>
          <div className="p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-xs">
            <div className="text-2xl md:text-3xl font-black text-purple-300">{stats.startupsCount}</div>
            <div className="text-xs text-slate-200 font-medium mt-0.5">DPIIT Startups</div>
          </div>
          <div className="p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-xs">
            <div className="text-2xl md:text-3xl font-black text-emerald-300">₹{(stats.totalPilotFunding / 100000).toFixed(1)}L</div>
            <div className="text-xs text-slate-200 font-medium mt-0.5">Staged Pilot Grants</div>
          </div>
          <div className="p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-xs">
            <div className="text-2xl md:text-3xl font-black text-amber-300">{stats.procurementDecisions}</div>
            <div className="text-xs text-slate-200 font-medium mt-0.5">Scale-Up Procurements</div>
          </div>
        </div>
      </section>

      {/* Demonstration / Prototype Transparency Notice */}
      <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-start gap-3 text-xs text-slate-700 dark:text-slate-300">
        <div className="p-1.5 rounded-lg bg-blue-600 text-white shrink-0 mt-0.5">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
        <div className="space-y-0.5">
          <span className="font-bold text-blue-950 dark:text-blue-200">
            Smart India Hackathon Prototype Notice (Problem Statement SIH26136)
          </span>
          <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
            This platform is an evaluation prototype demonstrating a transparent public procurement mechanism under GFR Rule 173(i) and GFR Rule 194. All data, telemetry feeds, and startup profiles are simulated demonstration models and do not imply official government endorsement or live registry integrations.
          </p>
        </div>
      </div>

      {/* “HOW IT WORKS” SECTION */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800">
            <Target className="w-3.5 h-3.5" />
            <span>Structured Procurement Mechanism</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
            How the Procurement Portal Works
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            From problem definition to commercial scale-up: A 5-step transparent workflow eliminating legacy 3-year turnover barriers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {HOW_IT_WORKS_STEPS.map((step) => {
            const IconComp = step.icon;
            return (
              <div 
                key={step.step}
                className="civic-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 relative hover:border-blue-400 dark:hover:border-blue-700 transition-all shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black font-mono text-blue-600 dark:text-blue-400">
                      STEP {step.step}
                    </span>
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400">
                      <IconComp className="w-4 h-4" />
                    </div>
                  </div>

                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${step.badgeColor}`}>
                    {step.role}
                  </span>

                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
                    {step.title}
                  </h3>

                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CORE PLATFORM INNOVATIONS HIGHLIGHT */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[10px] font-extrabold uppercase px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            Key Platform Capabilities
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
            Engineered for Fair & Fast Public Procurement
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Three core features designed to make innovation procurement accountable, transparent, and scalable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CORE_INNOVATIONS.map((feat, idx) => {
            const IconComp = feat.icon;
            return (
              <div 
                key={idx}
                className="civic-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 hover:border-blue-400 dark:hover:border-blue-700 transition-all shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-800">
                      {feat.badge}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {feat.subtitle}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                      {feat.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={feat.onClick}
                    className="w-full py-2.5 px-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>{feat.actionText}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FEATURED SEED SCENARIO: CLEANROUTE PUNE */}
      <section className="civic-card p-6 md:p-8 rounded-3xl border border-blue-200 dark:border-blue-900 bg-gradient-to-r from-blue-50/70 to-indigo-50/70 dark:from-blue-950/30 dark:to-indigo-950/30 space-y-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-blue-600 text-white shadow-xs">
              <Rocket className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Demonstration Journey
                </span>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                  Stage 8: Scale-Up Decision
                </span>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                Municipal Solid Waste Collection Route Optimization
              </h3>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowReportModal(true)}
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-blue-400 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Pilot Evidence Report (PDF)</span>
            </button>

            <button
              onClick={() => {
                if (setSelectedProblemId) setSelectedProblemId('chal-1');
                setActiveTab('workspace');
              }}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>Launch Pilot Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-slate-500 font-semibold block text-[10px] uppercase">Procuring Department</span>
            <strong className="text-slate-900 dark:text-slate-100 text-sm">Dept of Urban Infrastructure, Maharashtra</strong>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-slate-500 font-semibold block text-[10px] uppercase">Selected Startup</span>
            <strong className="text-slate-900 dark:text-slate-100 text-sm">CleanRoute Tech (DIPP-84920)</strong>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-slate-500 font-semibold block text-[10px] uppercase">Verified KPI Benchmark</span>
            <div className="font-mono text-sm font-bold text-emerald-700 dark:text-emerald-400">
              40% Delay → 22.4% Verified (Target ≤ 25%)
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-slate-500 font-semibold block text-[10px] uppercase">Staged Milestone Tranches</span>
            <strong className="text-slate-900 dark:text-slate-100 text-sm">₹7,50,000 (30% + 40% + 30% = 100%)</strong>
          </div>
        </div>
      </section>

      {/* THE 4 PUBLIC ROLES SECTION */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[10px] font-extrabold uppercase px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            Platform Participants
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
            Four Specialized Stakeholder Roles
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            The platform connects four key actors to maintain rigorous checks, balances, and rapid decision-making.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PUBLIC_ROLES.map((r, i) => {
            const IconComp = r.icon;
            return (
              <div 
                key={i} 
                className={`p-6 rounded-3xl border ${r.color} space-y-3 flex flex-col justify-between transition-all`}
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-xs">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {r.role}
                    </h3>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
                      {r.summary}
                    </p>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {r.details}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FEATURED OPEN OUTCOME CHALLENGES */}
      {featuredChallenges.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Featured Outcome Challenges</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Departmental challenges currently open for DPIIT startup applications and pilot proposals.</p>
            </div>
            <button
              onClick={() => setActiveTab('feed')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All Challenges</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredChallenges.map(chal => (
              <div 
                key={chal.id} 
                className="civic-card-interactive p-6 rounded-2xl space-y-4 cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 transition-all flex flex-col justify-between"
                onClick={() => {
                  setSelectedProblemId(chal.id);
                  setActiveTab('detail');
                }}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 px-2.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                      {chal.category}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      Pilot Grant: ₹{((chal.pilotGrantBudget || 750000) / 100000).toFixed(1)}L
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-2 hover:text-blue-600 transition-colors">
                    {chal.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                    {chal.description}
                  </p>

                  {chal.baselineKPI && chal.targetKPI && (
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px] space-y-1">
                      <div className="flex justify-between text-slate-500 dark:text-slate-400">
                        <span>Baseline: <strong>{chal.baselineKPI}</strong></span>
                        <span>Target: <strong className="text-emerald-600 dark:text-emerald-400">{chal.targetKPI}</strong></span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  <span>📍 {chal.locationState}</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">Apply / View Challenge →</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Embedded Pilot Evidence Report Modal */}
      <PilotEvidenceReportModal 
        isOpen={showReportModal} 
        onClose={() => setShowReportModal(false)} 
        pilotId="pilot-1"
      />

    </div>
  );
};
