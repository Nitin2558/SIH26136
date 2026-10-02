import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Rocket, 
  Building2, 
  CheckCircle2, 
  Award, 
  ChevronRight, 
  Layers, 
  Info, 
  ExternalLink,
  Sliders,
  ShieldCheck,
  TrendingUp,
  HelpCircle
} from 'lucide-react';

export const ExplainableMatchingCard = ({ 
  challengeId, 
  startupId, 
  mode = 'challenge', // 'challenge' (officer looks at startups) | 'startup' (startup looks at challenges)
  onSelectStartup,
  onSelectChallenge,
  className = ''
}) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError('');

    let url = '';
    if (mode === 'challenge' && challengeId) {
      url = `/api/challenges/${challengeId}/recommendations`;
    } else if (mode === 'startup' && startupId) {
      url = `/api/startups/${startupId}/matching-challenges`;
    } else if (challengeId) {
      url = `/api/challenges/${challengeId}/recommendations`;
    }

    if (!url) {
      setLoading(false);
      return;
    }

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.recommendations) {
          setRecommendations(data.recommendations);
        } else if (data.matchingChallenges) {
          setRecommendations(data.matchingChallenges);
        } else {
          setRecommendations([]);
        }
      })
      .catch(err => {
        console.error('Failed to load matching recommendations:', err);
        setError('Unable to load matching recommendations.');
      })
      .finally(() => setLoading(false));
  }, [challengeId, startupId, mode]);

  if (loading) {
    return (
      <div className={`p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-2 ${className}`}>
        <Sparkles className="w-5 h-5 text-blue-600 animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-semibold">Running explainable startup matching heuristic...</p>
      </div>
    );
  }

  if (error || recommendations.length === 0) {
    return null;
  }

  return (
    <div className={`civic-card p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-5 ${className}`}>
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                {mode === 'challenge' ? 'Explainable Startup Matching' : 'Recommended Challenges For Your Solution'}
              </h3>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Rule-Based Fit
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {mode === 'challenge'
                ? 'Ranked candidate startups based on sector alignment, TRL maturity, and capability keywords.'
                : 'Challenges matched to your DPIIT technology sector, TRL level, and solution keywords.'}
            </p>
          </div>
        </div>

        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-xl">
          {recommendations.length} Candidate{recommendations.length > 1 ? 's' : ''} Analyzed
        </div>
      </div>

      {/* Transparent Disclaimer Box */}
      <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-[11px] leading-relaxed">
          <strong className="font-bold">Transparent Demonstration Heuristic:</strong> Matching recommendations are computed deterministically using sector classification, declared TRL, and capability overlap. This is an explainable evaluation aid and does not constitute a live government registry integration.
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-3">
        {recommendations.map((item, idx) => {
          const isTopFit = idx === 0 && item.totalScore >= 75;
          const isExpanded = expandedId === (item.startupId || item.challengeId);
          const itemId = item.startupId || item.challengeId;

          const gradeBadgeColor = 
            item.totalScore >= 80 ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800' :
            item.totalScore >= 60 ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800' :
            'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700';

          return (
            <div 
              key={itemId || idx}
              className={`p-4 rounded-2xl border transition-all ${
                isTopFit 
                  ? 'border-blue-300 dark:border-blue-800/80 bg-blue-50/20 dark:bg-blue-950/10 shadow-xs' 
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-slate-300'
              }`}
            >
              
              {/* Main Summary Row */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 ${
                    item.totalScore >= 80 ? 'bg-emerald-600 text-white shadow-emerald-600/20 shadow-sm' :
                    item.totalScore >= 60 ? 'bg-blue-600 text-white shadow-blue-600/20 shadow-sm' :
                    'bg-slate-500 text-white'
                  }`}>
                    {item.totalScore}%
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate">
                        {item.startupName || item.challengeTitle}
                      </h4>
                      {isTopFit && (
                        <span className="hidden sm:inline-flex text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-600 text-white shadow-2xs">
                          Top Match
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      <span>{item.sector || 'Smart Infrastructure'}</span>
                      {item.dpiitNumber && (
                        <>
                          <span>•</span>
                          <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{item.dpiitNumber}</span>
                        </>
                      )}
                      {item.trlLevel && (
                        <>
                          <span>•</span>
                          <span className="font-semibold text-purple-600 dark:text-purple-400">TRL {item.trlLevel}</span>
                        </>
                      )}
                      {item.budgetAmount && (
                        <>
                          <span>•</span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">₹{(item.budgetAmount).toLocaleString('en-IN')} Sandbox</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Score Tag & Toggle Details */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-xl border ${gradeBadgeColor}`}>
                    {item.matchGrade || `${item.totalScore}% Match`}
                  </span>

                  <button
                    onClick={() => setExpandedId(isExpanded ? null : itemId)}
                    className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>{isExpanded ? 'Hide Fit' : 'Explain Fit'}</span>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Solution Preview Note */}
              {item.solutionSummary && !isExpanded && (
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2 line-clamp-1">
                  💡 {item.solutionSummary}
                </p>
              )}

              {/* Expanded Explainability Breakdown */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3 animate-in fade-in duration-150">
                  
                  {/* 3-Part Dimension Progress Breakdown */}
                  {item.scoreBreakdown && (
                    <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs">
                      <div>
                        <div className="text-[10px] font-bold text-slate-500 mb-1">Sector Fit</div>
                        <div className="font-extrabold text-slate-900 dark:text-slate-100">{item.scoreBreakdown.sectorScore} / 35 pts</div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-1.5 overflow-hidden">
                          <div className="bg-blue-600 h-full rounded-full" style={{ width: `${(item.scoreBreakdown.sectorScore / 35) * 100}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] font-bold text-slate-500 mb-1">TRL Readiness</div>
                        <div className="font-extrabold text-slate-900 dark:text-slate-100">{item.scoreBreakdown.trlScore} / 30 pts</div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-1.5 overflow-hidden">
                          <div className="bg-purple-600 h-full rounded-full" style={{ width: `${(item.scoreBreakdown.trlScore / 30) * 100}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] font-bold text-slate-500 mb-1">Solution Overlap</div>
                        <div className="font-extrabold text-slate-900 dark:text-slate-100">{item.scoreBreakdown.solutionScore} / 35 pts</div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-1.5 overflow-hidden">
                          <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${(item.scoreBreakdown.solutionScore / 35) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Itemized Reasons Bullets */}
                  {item.reasons && item.reasons.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                        Explainable Fit Rationale:
                      </span>
                      <ul className="space-y-1 text-[11px] text-slate-700 dark:text-slate-300">
                        {item.reasons.map((r, rIdx) => (
                          <li key={rIdx} className="flex items-start gap-1.5">
                            <span className="text-blue-600 dark:text-blue-400 font-bold shrink-0 mt-0.5">•</span>
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Capabilities Tags */}
                  {item.keyCapabilities && item.keyCapabilities.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-400 font-bold">Key Tags:</span>
                      {item.keyCapabilities.map((cap, cIdx) => (
                        <span key={cIdx} className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {cap}
                        </span>
                      ))}
                    </div>
                  )}

                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
};
