import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  Building2, 
  Rocket, 
  Award, 
  Layers, 
  FileText, 
  Scale, 
  ChevronRight,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const STAGE_ICONS = {
  1: FileText,       // Draft
  2: Rocket,         // Open for applications
  3: Award,          // Evaluation
  4: Building2,      // Startup selected
  5: Layers,         // Pilot active
  6: ShieldCheck,    // Validation
  7: CheckCircle2,   // Payment ready/released
  8: Scale           // Scale-up decision
};

const ROLE_BADGES = {
  'Department Officer': {
    color: 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950/80 dark:text-sky-300 dark:border-sky-800',
    icon: Building2
  },
  'Startup': {
    color: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-800',
    icon: Rocket
  },
  'Expert Panel': {
    color: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800',
    icon: Award
  },
  'Independent Validator': {
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800',
    icon: ShieldCheck
  }
};

export const ProcurementJourneyTracker = ({ journey, className = '' }) => {
  const [expanded, setExpanded] = useState(false);

  if (!journey || !journey.stages) {
    return null;
  }

  const { currentStageIndex, currentStageLabel, currentStageTitle, responsibleRole, nextAction, stages, isFinished } = journey;
  const RoleIcon = ROLE_BADGES[responsibleRole]?.icon || Building2;
  const roleBadgeStyle = ROLE_BADGES[responsibleRole]?.color || 'bg-blue-100 text-blue-800 border-blue-200';

  return (
    <div className={`p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4 ${className}`}>
      
      {/* Top Header: Title & Active Stage Summary */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Procurement Lifecycle Tracker
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold border border-slate-200 dark:border-slate-700">
              SIH26136 8-Stage Flow
            </span>
          </div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
            Stage {currentStageIndex} of 8: <span className="text-blue-600 dark:text-blue-400">{currentStageLabel}</span>
          </h2>
        </div>

        {/* Responsible Role Badge */}
        <div className="flex items-center gap-2">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${roleBadgeStyle}`}>
            <RoleIcon className="w-3.5 h-3.5 shrink-0" />
            <span>Action Required by: <strong>{responsibleRole}</strong></span>
          </div>
          
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={expanded ? 'Collapse stage details' : 'Expand all 8 stage details'}
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Horizontal Stepper (Desktop & Tablet) */}
      <div className="relative py-2 overflow-x-auto scrollbar-none">
        <div className="flex items-center justify-between min-w-[720px] relative">
          
          {/* Progress Connector Track */}
          <div className="absolute top-4 left-6 right-6 h-1 bg-slate-200 dark:bg-slate-800 z-0">
            <div 
              className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-500"
              style={{ width: `${((currentStageIndex - 1) / (stages.length - 1)) * 100}%` }}
            />
          </div>

          {/* Stepper Nodes */}
          {stages.map((st) => {
            const Icon = STAGE_ICONS[st.step] || CheckCircle2;
            const isCompleted = st.isCompleted;
            const isCurrent = st.isCurrent;

            return (
              <div 
                key={st.step} 
                className="flex flex-col items-center text-center relative z-10 w-24 group select-none"
              >
                {/* Step Circle */}
                <div 
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs transition-all duration-300 shadow-2xs ${
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                      : isCurrent
                        ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-950 scale-110 shadow-blue-600/30 animate-pulse'
                        : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-300 dark:border-slate-700'
                  }`}
                  title={`${st.step}. ${st.title} (${st.role})`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>

                {/* Step Number & Label */}
                <span className={`text-[10px] font-bold mt-2 leading-tight ${
                  isCurrent 
                    ? 'text-blue-600 dark:text-blue-400 font-extrabold' 
                    : isCompleted 
                      ? 'text-slate-800 dark:text-slate-200 font-semibold' 
                      : 'text-slate-400 dark:text-slate-500'
                }`}>
                  {st.label}
                </span>

                {/* Role Under Label */}
                <span className="text-[9px] text-slate-600 dark:text-slate-300 truncate max-w-[90px] mt-0.5">
                  {st.role.split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Next Action Box */}
      <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping shrink-0" />
          <div>
            <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider block">
              Current Immediate Next Action:
            </span>
            <p className="font-semibold text-slate-800 dark:text-slate-200 leading-normal">
              {nextAction}
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-1.5">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {isFinished ? '✓ Lifecycle Scale-Up Completed' : `Stage ${currentStageIndex} Active`}
          </span>
        </div>
      </div>

      {/* Collapsible Full 8-Stage Detailed Breakdown */}
      {expanded && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5 animate-in fade-in duration-200">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Lifecycle Stage Governance & Responsible Roles:
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {stages.map(st => {
              const Icon = STAGE_ICONS[st.step] || CheckCircle2;
              const isCurrent = st.isCurrent;
              const isCompleted = st.isCompleted;

              return (
                <div 
                  key={st.step}
                  className={`p-3 rounded-2xl border transition-all ${
                    isCurrent
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-1 ring-blue-600'
                      : isCompleted
                        ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20 text-slate-700 dark:text-slate-300'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 text-slate-400 dark:text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                        isCompleted ? 'bg-emerald-600 text-white' : isCurrent ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                      }`}>
                        {st.step}
                      </div>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{st.title}</span>
                    </div>

                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isCompleted ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' :
                      isCurrent ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold' :
                      'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {isCompleted ? 'Completed' : isCurrent ? 'In Progress' : 'Pending'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mb-2">
                    {st.description}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span>Responsible: <strong className="text-slate-700 dark:text-slate-300">{st.role}</strong></span>
                    {isCurrent && <span className="text-blue-600 dark:text-blue-400 font-bold">● Active Stage</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
