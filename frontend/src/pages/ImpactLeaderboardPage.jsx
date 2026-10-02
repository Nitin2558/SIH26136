import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Award, 
  Rocket, 
  Building2, 
  CheckCircle2, 
  Sparkles, 
  TrendingUp, 
  DollarSign, 
  Scale,
  ShieldCheck,
  ArrowUpRight
} from 'lucide-react';

export const ImpactLeaderboardPage = ({ setActiveTab, setSelectedProblemId }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(d => setStats(d))
      .catch(err => console.error('Error fetching impact analytics:', err))
      .finally(() => setLoading(false));
  }, []);

  const DEPT_RANKINGS = [
    { rank: 1, name: 'Department of Urban Infrastructure & Smart Cities', state: 'Maharashtra', pilots: 3, procuredValue: '₹ 2.50 Cr', conversionRate: '100%' },
    { rank: 2, name: 'Ministry of Jal Shakti / Water Resources', state: 'National', pilots: 2, procuredValue: '₹ 1.80 Cr', conversionRate: '100%' },
    { rank: 3, name: 'State Renewable Energy Development Agency', state: 'Himachal Pradesh', pilots: 1, procuredValue: '₹ 95 Lakhs', conversionRate: '85%' }
  ];

  const STARTUP_HONOR_ROLL = [
    { name: 'CleanRoute Technologies Pvt Ltd', dpiit: 'DIPP-84920', sector: 'Smart Logistics & Cleantech', pilotGrant: '₹ 7.5L', scaleProcured: '₹ 2.50 Cr', savingsDelivered: '18% Fuel Savings / 22% Delay Drop' },
    { name: 'HydroAcoustics IoT Labs', dpiit: 'DIPP-91024', sector: 'Water Pipeline Diagnostics', pilotGrant: '₹ 4.8L', scaleProcured: '₹ 1.80 Cr', savingsDelivered: '35% Leakage Detection & Recovery' },
    { name: 'GreenGrid Mountain Microgrid', dpiit: 'DIPP-78210', sector: 'Renewable Hybrid Microgrid', pilotGrant: '₹ 6.2L', scaleProcured: '₹ 95 Lakhs', savingsDelivered: '99.4% Solar Uptime in Freezing Climate' }
  ];

  return (
    <div className="space-y-8 py-4">
      
      {/* Top Banner */}
      <div className="civic-card p-6 md:p-8 rounded-3xl border border-amber-200 dark:border-amber-900 bg-gradient-to-r from-amber-50/70 via-orange-50/70 to-slate-50 dark:from-amber-950/40 dark:via-orange-950/40 dark:to-slate-900 space-y-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500 text-white shadow-xs">
            <Trophy className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-slate-50">
                National Startup Public Procurement Conversion Dashboard
              </h1>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                SIH26136 Impact
              </span>
            </div>
            <p className="text-xs text-amber-950 dark:text-amber-200 font-medium mt-0.5">
              Live tracking of pilot-to-scale conversions, taxpayer savings, and departmental innovation adoption under GFR Rule 194.
            </p>
          </div>
        </div>

        {/* Global Impact Counters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800">
            <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Pilot-to-Scale Conversion</span>
            <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-5 h-5" /> 85.0%
            </div>
            <p className="text-[10px] text-slate-500">Verified SBoT Trials</p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800">
            <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Scale Procurement Volume</span>
            <div className="text-2xl font-black text-blue-700 dark:text-blue-400 mt-1">
              ₹ 5.25 Cr
            </div>
            <p className="text-[10px] text-slate-500">Sanctioned via Rule 194</p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800">
            <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Staged Pilot Grants</span>
            <div className="text-2xl font-black text-purple-700 dark:text-purple-400 mt-1">
              ₹ 18.50 Lakhs
            </div>
            <p className="text-[10px] text-slate-500">100% Escrow Milestone Gate</p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800">
            <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Avg Independent Verification</span>
            <div className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-1">
              14 Days
            </div>
            <p className="text-[10px] text-slate-500">Fast-Track Technical Audit</p>
          </div>

        </div>
      </div>

      {/* Department Rankings by Innovation Adoption */}
      <div className="civic-card p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-6">
        
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
              Department Innovation Procurement Rankings
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ranked by outcome challenges posted, successful sandbox pilots, and direct scaling volume.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {DEPT_RANKINGS.map((dept) => (
            <div 
              key={dept.name} 
              className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4 text-xs"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm text-white ${
                  dept.rank === 1 ? 'bg-amber-500' : dept.rank === 2 ? 'bg-slate-400' : 'bg-amber-700'
                }`}>
                  #{dept.rank}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{dept.name}</h3>
                  <span className="text-[11px] text-slate-500">Region: 📍 {dept.state}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Scaled Procurement</span>
                  <strong className="text-emerald-700 dark:text-emerald-400 font-mono text-sm">{dept.procuredValue}</strong>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Conversion Rate</span>
                  <strong className="text-blue-700 dark:text-blue-400 font-mono text-sm">{dept.conversionRate}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Startup Innovation Honor Roll */}
      <div className="civic-card p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-6">
        
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
            <Rocket className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
              DPIIT Startups Scaling Honor Roll
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Recognized startup solutions scaled into permanent government public procurement contracts.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {STARTUP_HONOR_ROLL.map(st => (
            <div key={st.name} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{st.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                    {st.dpiit}
                  </span>
                </div>

                <div className="flex items-center gap-3 font-mono">
                  <span className="text-slate-500">Pilot Grant: <strong>{st.pilotGrant}</strong></span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">Scale Contract: <strong>{st.scaleProcured}</strong></span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                <span>Sector: <strong>{st.sector}</strong></span>
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">Impact: {st.savingsDelivered}</span>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
};
