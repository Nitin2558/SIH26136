import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, ChevronDown, X, Layers, AlertOctagon, CheckCircle2, Clock, Filter } from 'lucide-react';
import { getProjects } from '../data/projects';

/**
 * Derives the human-readable pilot status from a project record.
 */
function deriveStatus(p) {
  if (p.stopped) return { label: 'Stopped', color: 'rose' };
  if (!p.step || p.step <= 2) return { label: 'Open for applications', color: 'slate' };
  if (p.step === 3) return { label: 'Expert scoring', color: 'amber' };
  if (p.step === 4) return { label: 'Startup selected', color: 'blue' };
  if (p.step === 5) return { label: 'Trial running', color: 'emerald' };
  if (p.step === 6) {
    if (p.parts && p.parts.some(function(pt) { return pt.status === 'ready'; })) return { label: 'Ready to pay', color: 'amber' };
    if (p.parts && p.parts.some(function(pt) { return pt.status === 'hold'; })) return { label: 'On hold', color: 'amber' };
    return { label: 'Result checking', color: 'blue' };
  }
  if (p.step === 7) return { label: 'Payment releasing', color: 'blue' };
  if (p.step === 8) {
    if (p.expand && p.expand.decision === 'approved') return { label: 'Scale approved', color: 'emerald' };
    return { label: 'Pilot complete', color: 'slate' };
  }
  return { label: 'In progress', color: 'blue' };
}

const STATUS_PILL_CLASSES = {
  rose:    'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900',
  amber:   'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900',
  emerald: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900',
  blue:    'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900',
  slate:   'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
};

/**
 * PilotSearchSwitcher
 *
 * Replaces the P1–P6 pill buttons with a searchable drop-down so the
 * Department Officer can find a pilot by startup name, startup ID, or domain/sector.
 *
 * Props:
 *   canonicalProjects – array of { id, companyId, label, company, dept }
 *   currentTeamId     – active teamId (pilot-1 … pilot-6 or companyId P1–P6)
 *   userRole          – user.role string ('government' | 'admin' | 'startup' | …)
 *   userStartupId     – for startup role only: their companyId so we show just their pilot
 *   onSelectProject   – callback(pilotId: string, companyId: string)
 */
export const PilotSearchSwitcher = ({
  canonicalProjects,
  currentTeamId,
  userRole,
  userStartupId,
  onSelectProject,
}) => {
  canonicalProjects = canonicalProjects || [];

  const [query, setQuery]           = useState('');
  const [domainFilter, setDomainFilter] = useState('ALL');
  const [isOpen, setIsOpen]         = useState(false);
  const containerRef = useRef(null);
  const inputRef     = useRef(null);

  // Merge static canonical list with live project data for domain / status / challenge name
  const liveProjects    = getProjects();
  const mergedProjects  = canonicalProjects.map(function(cp) {
    const live = liveProjects.find(function(lp) { return lp.id === cp.companyId; });
    return {
      pilotId:       cp.id,
      companyId:     cp.companyId,
      startupName:   cp.company,
      label:         cp.label,
      dept:          cp.dept,
      domain:        (live && live.field) ? live.field : 'General',
      challengeName: (live && live.problem) ? live.problem : cp.label,
      status:        deriveStatus(live || {}),
    };
  });

  // Role-based visibility: startup users only see their own pilot record
  const visibleProjects = mergedProjects.filter(function(proj) {
    if (userRole === 'startup') {
      return proj.companyId === userStartupId;
    }
    return true;
  });

  // Unique domains for filter chips
  const domainSet = new Set(visibleProjects.map(function(p) { return p.domain; }));
  const allDomains = ['ALL'].concat(Array.from(domainSet));

  // Filter by query + domain – partial, case-insensitive
  const filteredResults = visibleProjects.filter(function(proj) {
    const q = query.trim().toLowerCase();
    if (domainFilter !== 'ALL' && proj.domain !== domainFilter) return false;
    if (!q) return true;
    return (
      proj.startupName.toLowerCase().indexOf(q)   >= 0 ||
      proj.companyId.toLowerCase().indexOf(q)     >= 0 ||
      proj.domain.toLowerCase().indexOf(q)        >= 0 ||
      proj.challengeName.toLowerCase().indexOf(q) >= 0 ||
      proj.dept.toLowerCase().indexOf(q)          >= 0 ||
      proj.label.toLowerCase().indexOf(q)         >= 0
    );
  });

  // Currently active pilot label for the trigger button
  const activePilot = visibleProjects.find(function(p) {
    return p.pilotId === currentTeamId || p.companyId === currentTeamId;
  });

  // Close on outside click
  useEffect(function() {
    function handler(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return function() { document.removeEventListener('mousedown', handler); };
  }, []);

  // Auto-focus search input when dropdown opens
  useEffect(function() {
    if (isOpen && inputRef.current) {
      var ref = inputRef.current;
      setTimeout(function() { ref && ref.focus(); }, 50);
    }
  }, [isOpen]);

  const handleSelect = useCallback(function(proj) {
    setIsOpen(false);
    setQuery('');
    onSelectProject(proj.pilotId, proj.companyId);
  }, [onSelectProject]);

  function clearFilters() {
    setQuery('');
    setDomainFilter('ALL');
  }

  const triggerCls = 'inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-xs transition-all cursor-pointer min-w-[220px] justify-between ' +
    (isOpen ? 'border-blue-400 dark:border-blue-600' : 'border-slate-200 dark:border-slate-700');

  return (
    <div ref={containerRef} className="relative" id="pilot-search-switcher">

      {/* ── Trigger button ── */}
      <button
        id="pilot-search-trigger"
        onClick={function() { setIsOpen(function(prev) { return !prev; }); }}
        className={triggerCls}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        title="Search and switch pilot"
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">
            {activePilot ? activePilot.startupName : 'Select a pilot\u2026'}
          </span>
        </div>
        <ChevronDown className={'w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-150' + (isOpen ? ' rotate-180' : '')} />
      </button>

      {/* ── Dropdown panel ── */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 z-50 w-96 sm:w-[520px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl shadow-slate-900/20 overflow-hidden"
          role="dialog"
          aria-label="Search for a pilot"
        >
          {/* Search + domain filter header */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 space-y-2.5">

            {/* Search input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={inputRef}
                id="pilot-search-input"
                type="text"
                placeholder="Search by startup name, ID (P1\u2013P6), or domain\u2026"
                value={query}
                onChange={function(e) { setQuery(e.target.value); }}
                className="w-full pl-8 pr-8 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                autoComplete="off"
              />
              {query && (
                <button
                  onClick={function(e) {
                    e.stopPropagation();
                    setQuery('');
                    if (inputRef.current) inputRef.current.focus();
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Domain filter chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <Filter className="w-3 h-3 text-slate-400 shrink-0" />
              {allDomains.map(function(domain) {
                const active = domainFilter === domain;
                return (
                  <button
                    key={domain}
                    onClick={function() { setDomainFilter(domain); }}
                    id={'domain-filter-' + domain.toLowerCase().replace(/[^a-z0-9]/g, '-')}
                    className={'px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap ' + (active ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700')}
                  >
                    {domain === 'ALL' ? 'All domains' : domain}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Results list */}
          <ul role="listbox" aria-label="Pilot results" className="max-h-80 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800/60">
            {filteredResults.length === 0 ? (
              /* Empty state */
              <li className="px-4 py-10 flex flex-col items-center justify-center gap-2 text-center">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  No pilots match your search
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-xs">
                  {query
                    ? 'No results for "' + query + '"' + (domainFilter !== 'ALL' ? ' in domain "' + domainFilter + '"' : '') + '. Try a different name, ID, or domain.'
                    : 'No pilots available' + (domainFilter !== 'ALL' ? ' in domain "' + domainFilter + '"' : '') + '.'
                  }
                </p>
                {(query || domainFilter !== 'ALL') && (
                  <button
                    onClick={clearFilters}
                    className="mt-1 text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
                  >
                    Clear all filters
                  </button>
                )}
              </li>
            ) : (
              filteredResults.map(function(proj) {
                const isActive  = proj.pilotId === currentTeamId || proj.companyId === currentTeamId;
                const statusCls = STATUS_PILL_CLASSES[proj.status.color] || STATUS_PILL_CLASSES.slate;
                const rowCls    = 'w-full text-left px-4 py-3 transition-colors cursor-pointer group ' + (isActive ? 'bg-blue-50 dark:bg-blue-950/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50');
                const idCls     = 'text-[10px] font-black px-1.5 py-0.5 rounded font-mono ' + (isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-slate-200 dark:group-hover:bg-slate-700');
                const nameCls   = 'text-xs font-bold truncate ' + (isActive ? 'text-blue-700 dark:text-blue-300' : 'text-slate-900 dark:text-slate-100');
                const ctaCls    = 'mt-2 pt-1.5 border-t text-[11px] font-semibold flex items-center gap-1 transition-colors ' + (isActive ? 'border-blue-200/60 dark:border-blue-800/60 text-blue-600 dark:text-blue-400' : 'border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400');

                return (
                  <li key={proj.pilotId} role="option" aria-selected={isActive}>
                    <button
                      id={'pilot-result-' + proj.companyId.toLowerCase()}
                      onClick={function() { handleSelect(proj); }}
                      className={rowCls}
                    >
                      <div className="flex items-start justify-between gap-3">

                        {/* Left – names & metadata */}
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Startup ID badge */}
                            <span className={idCls}>{proj.companyId}</span>
                            {/* Startup name */}
                            <span className={nameCls}>{proj.startupName}</span>
                          </div>
                          {/* Domain + Challenge */}
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">{proj.domain}</span>
                            <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                            <span className="truncate">{proj.challengeName}</span>
                          </div>
                          {/* Department */}
                          <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{proj.dept}</div>
                        </div>

                        {/* Right – status pill + active indicator */}
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <span className={'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ' + statusCls}>
                            {proj.status.color === 'rose'    && <AlertOctagon  className="w-2.5 h-2.5" />}
                            {proj.status.color === 'emerald' && <CheckCircle2  className="w-2.5 h-2.5" />}
                            {(proj.status.color === 'amber' || proj.status.color === 'blue') && <Clock className="w-2.5 h-2.5" />}
                            {proj.status.label}
                          </span>
                          {isActive && (
                            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3" /> Current
                            </span>
                          )}
                        </div>
                      </div>

                      {/* CTA footer row */}
                      <div className={ctaCls}>
                        <Layers className="w-3 h-3" />
                        {isActive ? 'Currently viewing this Pilot Command Center' : 'Open Pilot Command Center \u2192'}
                      </div>
                    </button>
                  </li>
                );
              })
            )}
          </ul>

          {/* Footer – count + clear shortcut */}
          {filteredResults.length > 0 && (
            <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 dark:text-slate-500">
                {filteredResults.length} of {visibleProjects.length} pilot{visibleProjects.length !== 1 ? 's' : ''} shown
              </span>
              {(query || domainFilter !== 'ALL') && (
                <button
                  onClick={clearFilters}
                  className="text-[11px] text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 font-semibold cursor-pointer transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PilotSearchSwitcher;

