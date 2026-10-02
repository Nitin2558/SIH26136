import React, { useState, useEffect } from 'react';
import { 
  getProjects, 
  saveProjects, 
  formatIndianCurrency, 
  getDaysWaiting 
} from '../data/projects';
import { payPartApi } from '../services/supabaseData';
import { 
  Wallet, 
  CheckCircle2, 
  Clock, 
  AlertOctagon, 
  ArrowUpRight, 
  Filter, 
  Search,
  Check,
  X,
  FileSpreadsheet
} from 'lucide-react';

export const OfficerMoneyPage = ({ setActiveTab, setSelectedCompanyId, setSelectedTeamId }) => {
  const [projectsList, setProjectsList] = useState(getProjects());
  const [filter, setFilter] = useState('ALL'); // ALL | PAID | WAITING | STOPPED
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pay modal state
  const [payingItem, setPayingItem] = useState(null);
  const [checklist, setChecklist] = useState({ kpiChecked: false, noIssues: false, ruleCompliant: false });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setProjectsList(getProjects());
    };
    window.addEventListener('sih-projects-update', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('sih-projects-update', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Flatten all parts across all projects
  const allPayments = [];
  projectsList.forEach(p => {
    p.parts.forEach(part => {
      allPayments.push({
        projectId: p.id,
        company: p.company,
        city: p.city,
        dept: p.dept,
        checker: p.checker,
        verdict: p.verdict,
        partNumber: part.n,
        pct: part.pct,
        amt: part.amt,
        status: part.status,
        date: part.date || null,
        readySince: part.readySince || null,
        holdSince: part.holdSince || null,
        ref: part.ref || '—',
        why: part.why || 'Trial milestone'
      });
    });
  });

  // Filter payments
  const filteredPayments = allPayments.filter(item => {
    if (filter === 'PAID' && item.status !== 'paid') return false;
    if (filter === 'WAITING' && item.status !== 'ready' && item.status !== 'hold') return false;
    if (filter === 'STOPPED' && item.status !== 'stopped') return false;
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCompany = item.company.toLowerCase().includes(q);
      const matchCity = item.city.toLowerCase().includes(q);
      const matchRef = item.ref.toLowerCase().includes(q);
      const matchReason = item.why.toLowerCase().includes(q);
      return matchCompany || matchCity || matchRef || matchReason;
    }
    return true;
  });

  // Totals
  const totalGrant = projectsList.reduce((acc, p) => acc + p.grant, 0);
  const totalPaid = allPayments.filter(i => i.status === 'paid').reduce((acc, i) => acc + i.amt, 0);
  const totalWaiting = allPayments.filter(i => i.status === 'ready' || i.status === 'hold').reduce((acc, i) => acc + i.amt, 0);
  const totalStopped = allPayments.filter(i => i.status === 'stopped').reduce((acc, i) => acc + i.amt, 0);
  const filteredSum = filteredPayments.reduce((acc, i) => acc + i.amt, 0);

  const handleConfirmPay = async () => {
    if (!payingItem) return;
    setIsProcessing(true);
    try {
      await payPartApi(payingItem.projectId, payingItem.partNumber);
      setPayingItem(null);
      setChecklist({ kpiChecked: false, noIssues: false, ruleCompliant: false });
    } catch (err) {
      alert(err.message || 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 font-sans bg-slate-50 dark:bg-[#0b0f19] min-h-screen -m-4 p-8 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Money</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Complete record of every payment part across department trials.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab('govt-dashboard')}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm cursor-pointer"
          >
            ← Back to dashboard
          </button>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Total trial grants</span>
          <span className="text-2xl font-bold text-slate-900 dark:text-white mt-2 block">{formatIndianCurrency(totalGrant)}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">Committed across 6 companies</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Paid so far</span>
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2 block">{formatIndianCurrency(totalPaid)}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">Sent directly to bank accounts</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Money waiting for you</span>
          <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2 block">{formatIndianCurrency(totalWaiting)}</span>
          <span className="text-xs text-amber-700 dark:text-amber-300 mt-1 block">Ready to pay or on hold</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Stopped money</span>
          <span className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-2 block">{formatIndianCurrency(totalStopped)}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">Saved because goal was not met</span>
        </div>
      </div>

      {/* Controls: Search and Filter Chips */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Filter Chips */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'ALL', label: 'All payments', count: allPayments.length },
              { id: 'PAID', label: 'Paid', count: allPayments.filter(i => i.status === 'paid').length },
              { id: 'WAITING', label: 'Waiting', count: allPayments.filter(i => i.status === 'ready' || i.status === 'hold').length },
              { id: 'STOPPED', label: 'Stopped', count: allPayments.filter(i => i.status === 'stopped').length }
            ].map(chip => (
              <button
                key={chip.id}
                onClick={() => setFilter(chip.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                  filter === chip.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {chip.label} ({chip.count})
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search company, ref..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider bg-slate-50 dark:bg-slate-800/50">
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Company</th>
                <th className="py-3 px-3">Part</th>
                <th className="py-3 px-3 text-right">Amount</th>
                <th className="py-3 px-3">Reason</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 font-mono">Bank ref</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPayments.map((item, idx) => {
                const lateDays = item.readySince ? getDaysWaiting(item.readySince) : 0;
                const isLate = item.status === 'ready' && lateDays > 7;

                return (
                  <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    
                    {/* Date */}
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {item.date ? item.date : (
                        item.readySince ? (
                          <span>
                            Since {item.readySince}
                            {isLate && (
                              <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#FEF2F2] dark:bg-rose-950 text-[#DC2626] dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                                Late: {lateDays} days
                              </span>
                            )}
                          </span>
                        ) : item.holdSince ? (
                          <span className="text-amber-700 dark:text-amber-400">On hold since {item.holdSince}</span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500">Scheduled</span>
                        )
                      )}
                    </td>

                    {/* Company */}
                    <td className="py-3 px-3 font-medium text-slate-900 dark:text-white">
                      <button
                        onClick={() => {
                          if (setSelectedCompanyId) setSelectedCompanyId(item.projectId);
                          setActiveTab('company');
                        }}
                        className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline font-bold text-left block cursor-pointer"
                      >
                        {item.company}
                      </button>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">{item.city}</div>
                    </td>

                    {/* Part */}
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      Part {item.partNumber} ({item.pct}%)
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-3 text-right font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                      {formatIndianCurrency(item.amt)}
                    </td>

                    {/* Reason */}
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                      {item.why}
                    </td>

                    {/* Status Pill */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {item.status === 'paid' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#ECFDF3] dark:bg-emerald-950/60 text-[#16A34A] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                          <CheckCircle2 className="w-3 h-3" /> Paid
                        </span>
                      )}
                      {item.status === 'ready' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#FFF7E6] dark:bg-amber-950/60 text-[#D97706] dark:text-amber-400 border border-amber-200 dark:border-amber-900">
                          <Clock className="w-3 h-3" /> Ready to pay
                        </span>
                      )}
                      {item.status === 'hold' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#FFF7E6] dark:bg-amber-950/60 text-[#D97706] dark:text-amber-400 border border-amber-200 dark:border-amber-900">
                          <Clock className="w-3 h-3" /> On hold
                        </span>
                      )}
                      {item.status === 'stopped' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#FEF2F2] dark:bg-rose-950/60 text-[#DC2626] dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                          <AlertOctagon className="w-3 h-3" /> Stopped
                        </span>
                      )}
                      {item.status === 'notstarted' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                          Not started
                        </span>
                      )}
                    </td>

                    {/* Bank ref */}
                    <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300 text-[11px] whitespace-nowrap">
                      {item.ref}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-3 text-right whitespace-nowrap space-x-2">
                      <button
                        onClick={() => {
                          const pilotMap = { P1: 'pilot-1', P2: 'pilot-2', P3: 'pilot-3', P4: 'pilot-4', P5: 'chal-5', P6: 'pilot-6' };
                          const targetPilotId = pilotMap[item.projectId] || item.projectId;
                          if (setSelectedTeamId) setSelectedTeamId(targetPilotId);
                          if (setSelectedCompanyId) setSelectedCompanyId(item.projectId);
                          setActiveTab(`workspace/${targetPilotId}`);
                        }}
                        className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline cursor-pointer"
                        title="Open Pilot Command Center"
                      >
                        Command Center →
                      </button>

                      {item.status === 'ready' && (
                        <button
                          onClick={() => setPayingItem(item)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-2.5 py-1 rounded text-[11px] shadow-sm transition cursor-pointer"
                        >
                          Review & pay
                        </button>
                      )}
                      {item.status === 'hold' && (
                        <button
                          onClick={() => setActiveTab('govt-dashboard')}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-[11px] cursor-pointer"
                        >
                          Decide →
                        </button>
                      )}
                      {item.status === 'paid' && (
                        <span className="text-[11px] text-slate-400 dark:text-slate-500">Complete</span>
                      )}
                      {item.status === 'stopped' && (
                        <span className="text-[11px] text-slate-400 dark:text-slate-500">Cancelled</span>
                      )}
                      {item.status === 'notstarted' && (
                        <span className="text-[11px] text-slate-400 dark:text-slate-500">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Total Row */}
            <tfoot>
              <tr className="border-t-2 border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 font-bold text-slate-900 dark:text-white">
                <td className="py-3 px-3" colSpan={3}>
                  Total ({filteredPayments.length} records shown)
                </td>
                <td className="py-3 px-3 text-right whitespace-nowrap">
                  {formatIndianCurrency(filteredSum)}
                </td>
                <td className="py-3 px-3" colSpan={4}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Pay Modal */}
      {payingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Review and release payment</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Payment part {payingItem.partNumber} ({payingItem.pct}%)</p>
              </div>
              <button 
                onClick={() => setPayingItem(null)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/80 rounded-lg p-4 space-y-2 border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Company:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{payingItem.company}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Amount:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">{formatIndianCurrency(payingItem.amt)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Checked by:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{payingItem.checker || 'Independent checker'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Checker verdict:</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">Goal met</span>
              </div>
            </div>

            {/* Officer Checklist */}
            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={checklist.kpiChecked} 
                  onChange={(e) => setChecklist(prev => ({ ...prev, kpiChecked: e.target.checked }))}
                  className="rounded text-blue-600 focus:ring-0" 
                />
                <span>I have read the independent checker report</span>
              </label>
              <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={checklist.noIssues} 
                  onChange={(e) => setChecklist(prev => ({ ...prev, noIssues: e.target.checked }))}
                  className="rounded text-blue-600 focus:ring-0" 
                />
                <span>No complaints or pending issues from the ward</span>
              </label>
              <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={checklist.ruleCompliant} 
                  onChange={(e) => setChecklist(prev => ({ ...prev, ruleCompliant: e.target.checked }))}
                  className="rounded text-blue-600 focus:ring-0" 
                />
                <span>Complies with government buying rules</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setPayingItem(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!(checklist.kpiChecked && checklist.noIssues && checklist.ruleCompliant) || isProcessing}
                onClick={handleConfirmPay}
                className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition shadow-sm cursor-pointer"
              >
                {isProcessing ? 'Processing payment...' : `Pay ${formatIndianCurrency(payingItem.amt)} now`}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
