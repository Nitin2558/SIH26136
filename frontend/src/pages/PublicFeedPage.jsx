import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ApplyProposalModal } from '../components/ApplyProposalModal';
import { 
  Rocket, 
  Search, 
  ThumbsUp, 
  Building2, 
  ArrowRight,
  Sparkles,
  PlusCircle,
  MapPin,
  Compass,
  ShieldCheck,
  Scale,
  Award,
  DollarSign,
  TrendingUp,
  Clock,
  Layers
} from 'lucide-react';

export const PublicFeedPage = ({ setActiveTab, setSelectedProblemId, setSelectedTeamId }) => {
  const { user } = useAuth();

  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [stateFilter, setStateFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [applyModalProblem, setApplyModalProblem] = useState(null);

  const fetchFeed = () => {
    setLoading(true);
    const query = new URLSearchParams({
      category,
      state: stateFilter,
      status: statusFilter,
      search
    });

    fetch(`/api/challenges/feed?${query.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (data.challenges) setChallenges(data.challenges);
        else if (data.problems) setChallenges(data.problems);
      })
      .catch(err => console.error('Error fetching challenges feed:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFeed();
  }, [category, stateFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchFeed();
  };

  const handleVote = async (challengeId, e) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/challenges/${challengeId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id || 'anonymous', value: 1 })
      });
      if (res.ok) fetchFeed();
    } catch (err) {
      console.error('Error voting:', err);
    }
  };

  return (
    <div className="space-y-8 py-4">
      
      {/* Header */}
      <div className="civic-card p-6 md:p-8 rounded-3xl border border-blue-200 dark:border-blue-900 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/30 space-y-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-blue-600 text-white shadow-xs">
              <Rocket className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 dark:text-slate-50">
                  Open Outcome Challenges & Pilot Opportunities
                </h1>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  SIH26136
                </span>
              </div>
              <p className="text-xs text-blue-950 dark:text-blue-200 font-medium">
                Government departmental challenges formulated by target KPIs — open for DPIIT startup applications, expert scoring & SBoT pilot grant awards.
              </p>
            </div>
          </div>

          {user?.role === 'government' && (
            <button
              onClick={() => setActiveTab('submit')}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" /> Post Outcome Challenge
            </button>
          )}
        </div>

        {/* Search & Filters Bar */}
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-2">
          
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search challenges, KPIs, IoT, cleantech, logistics..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-blue-600 font-medium"
            >
              <option value="All">All Domains / Sectors</option>
              <option value="Urban Infrastructure & Cleantech">Urban & Cleantech</option>
              <option value="Water Resources & Leakage">Water Resources</option>
              <option value="Urban Mobility & Smart Signals">Mobility & Signals</option>
              <option value="Renewable Energy & Microgrids">Energy & Microgrids</option>
              <option value="Healthcare & Tele-Diagnostics">Healthcare</option>
            </select>
          </div>

          <div>
            <select
              value={stateFilter}
              onChange={e => setStateFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-blue-600 font-medium"
            >
              <option value="All">All Regions / States</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Delhi">Delhi</option>
              <option value="Himachal Pradesh">Himachal Pradesh</option>
              <option value="Rajasthan">Rajasthan</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-blue-600 font-medium"
            >
              <option value="All">All Statuses</option>
              <option value="open">Open for Proposals</option>
              <option value="pilot-in-progress">Pilot In Progress</option>
              <option value="procured">Scaled / Procured</option>
            </select>
          </div>

        </form>
      </div>

      {/* Feed Cards List */}
      {loading ? (
        <div className="py-12 text-center text-slate-500 text-xs font-medium">Loading outcome challenges...</div>
      ) : challenges.length === 0 ? (
        <div className="civic-card p-12 rounded-3xl text-center text-slate-500 text-xs">
          No matching outcome challenges found for selected filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {challenges.map(chal => {
            const isPilotActive = chal.activePilot || chal.activeTeam || chal.status === 'pilot_active' || chal.status === 'pilot-in-progress' || chal.hasPilot || chal.pilotId;
            const grantLakhs = ((chal.budgetAmount || chal.pilotGrantBudget || 1250000) / 100000).toFixed(1);
            const scaleLakhs = ((chal.scaleProcurementBudget || 25000000) / 10000000).toFixed(1);

            const baselineText = chal.baselineKpi?.value 
              ? `${chal.baselineKpi.value}${chal.baselineKpi.unit || '%'}` 
              : chal.baselineKPI;
            
            const targetText = chal.targetKpi?.value 
              ? `${chal.targetKpi.targetOperator || '<='} ${chal.targetKpi.value}${chal.targetKpi.unit || '%'}` 
              : chal.targetKPI;

            return (
              <div 
                key={chal.id} 
                className="civic-card-interactive p-6 rounded-3xl space-y-4 flex flex-col justify-between cursor-pointer border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-400 dark:hover:border-blue-700 transition-all shadow-xs"
                onClick={() => {
                  setSelectedProblemId(chal.id);
                  setActiveTab('detail');
                }}
              >
                
                <div className="space-y-3">
                  {/* Header badges */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 px-2.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                        {chal.sector || chal.category}
                      </span>

                      {(chal.eligibilityRules?.minTrl || chal.targetTRL) && (
                        <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800">
                          TRL {chal.eligibilityRules?.minTrl || chal.targetTRL}
                        </span>
                      )}

                      {(chal.durationWeeks || chal.trialPeriodWeeks) && (
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" /> {chal.durationWeeks || chal.trialPeriodWeeks} Wks Trial
                        </span>
                      )}
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      chal.status === 'procured' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300' :
                      isPilotActive ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border-indigo-300' :
                      'bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-200'
                    }`}>
                      {chal.status === 'procured' ? '✓ Procured / Scaled' : isPilotActive ? '⚡ Pilot Active' : '🟢 Open for Proposals'}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    {chal.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                    {chal.problemStatement || chal.description}
                  </p>

                  {/* Quantifiable KPI Benchmarks Box */}
                  {(baselineText || targetText) && (
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                      {baselineText && (
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 dark:text-slate-400">Baseline Metric:</span>
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{baselineText}</span>
                        </div>
                      )}
                      {targetText && (
                        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200 dark:border-slate-700">
                          <span className="text-emerald-700 dark:text-emerald-400 font-bold">Target KPI Goal:</span>
                          <span className="font-mono font-black text-emerald-700 dark:text-emerald-400">{targetText}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Financial Grants & Scale Scale-up Ceiling */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-500 block">Staged Pilot Grant</span>
                      <strong className="text-slate-900 dark:text-slate-100 font-mono text-xs">₹{grantLakhs} Lakhs</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-500 block">Scale-Up Value (Rule 194)</span>
                      <strong className="text-emerald-700 dark:text-emerald-400 font-mono text-xs">₹{scaleLakhs} Cr Ceiling</strong>
                    </div>
                  </div>

                  {/* Submitter & Region Info */}
                  <div className="flex items-center flex-wrap gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-1 font-medium">
                    <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                      <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      {chal.departmentName || 'Govt Department'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {chal.locationDistrict ? `${chal.locationDistrict}, ` : ''}{chal.locationState}
                    </span>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => handleVote(chal.id, e)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 transition-colors font-semibold cursor-pointer"
                    >
                      <ThumbsUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>{chal.upvotes || 0}</span>
                    </button>

                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      {chal.proposalCount || chal.proposalsCount || 0} Startup Bids
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isPilotActive ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (setSelectedProblemId) setSelectedProblemId(chal.id);
                          if (setSelectedTeamId && (chal.activePilot?.id || chal.activeTeam?.id)) {
                            setSelectedTeamId(chal.activePilot?.id || chal.activeTeam?.id);
                          }
                          setActiveTab('workspace');
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold hover:bg-indigo-100 flex items-center gap-1 cursor-pointer"
                      >
                        <Layers className="w-3.5 h-3.5" /> Pilot Command Center →
                      </button>
                    ) : (
                      user?.role === 'startup' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setApplyModalProblem(chal);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs flex items-center gap-1 cursor-pointer"
                        >
                          Apply Proposal
                        </button>
                      )
                    )}

                    <button 
                      onClick={() => {
                        setSelectedProblemId(chal.id);
                        setActiveTab('detail');
                      }}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Apply Proposal Modal */}
      {applyModalProblem && (
        <ApplyProposalModal
          problem={applyModalProblem}
          isOpen={!!applyModalProblem}
          onClose={() => setApplyModalProblem(null)}
          onSuccess={() => {
            fetchFeed();
          }}
        />
      )}

    </div>
  );
};
