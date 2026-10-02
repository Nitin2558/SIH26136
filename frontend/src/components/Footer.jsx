import React from 'react';
import { Rocket, ShieldCheck, Scale, Award, FileText } from 'lucide-react';

export const Footer = ({ setActiveTab }) => {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-16 py-10 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                <Rocket className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white text-base tracking-tight">
                Startup Public Procurement Mechanism
              </span>
              <span className="text-[10px] font-bold font-mono text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                SIH26136
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg">
              A transparent, outcome-driven innovation procurement mechanism enabling government departments to identify, pilot, verify, and scale innovative solutions from DPIIT-recognized startups under GFR Rule 194.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              <span className="flex items-center gap-1"><Scale className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Model SBoT Pilot Agreements</span>
              <span>•</span>
              <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> 100% Staged Milestone Escrow</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Independent 3rd-Party Verification</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">Procurement Navigation</h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
              <li><button onClick={() => setActiveTab('feed')} className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer">Open Outcome Challenges</button></li>
              <li><button onClick={() => setActiveTab('submit')} className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer">AI Problem Coach Creator</button></li>
              <li><button onClick={() => setActiveTab('needs-review')} className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer">Expert Multi-Criteria Scoring</button></li>
              <li><button onClick={() => setActiveTab('industry')} className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer">Independent Assessment Lab</button></li>
              <li><button onClick={() => setActiveTab('impact')} className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer">Procurement Conversion Analytics</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">Core Innovation Paradigm</h4>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              <span className="font-bold text-slate-900 dark:text-white block mb-1">Outcome-Driven SBoT Pilots</span>
              Replaces rigid 3-year turnover barriers with objective KPI milestones, independent testbed certification, and fast-track GFR Rule 194 direct public procurement.
            </div>
          </div>

        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
          Built for Smart India Hackathon (Problem Statement SIH26136) — Startup-Friendly Public Procurement Platform
        </div>
      </div>
    </footer>
  );
};
