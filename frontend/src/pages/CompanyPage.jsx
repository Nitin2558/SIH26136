import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  fetchCompanyDetails, 
  payPartApi, 
  resolveHoldApi 
} from '../services/supabaseData';
import { formatIndianCurrency, getDaysWaiting } from '../data/projects';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  AlertOctagon, 
  FileText, 
  Download, 
  Check, 
  X, 
  ExternalLink,
  ShieldCheck,
  Building2,
  Calendar,
  Wallet,
  ArrowRight,
  Award,
  Layers,
  Sparkles
} from 'lucide-react';

export const CompanyPage = ({ companyId = 'P1', setActiveTab }) => {
  const { user } = useAuth();
  const isOfficer = user?.role === 'government' || user?.role === 'officer';

  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Officer Pay Side Panel State
  const [payDrawerPart, setPayDrawerPart] = useState(null);
  const [bankRefInput, setBankRefInput] = useState('');
  const [isProcessingPay, setIsProcessingPay] = useState(false);
  const [payError, setPayError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Hold Decision State
  const [holdDrawerPart, setHoldDrawerPart] = useState(null);
  const [holdAction, setHoldAction] = useState('full'); // full | smaller | keep_hold
  const [holdAmount, setHoldAmount] = useState('');
  const [holdReason, setHoldReason] = useState('');
  const [isProcessingHold, setIsProcessingHold] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchCompanyDetails(companyId);
    setCompanyData(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('sih-projects-update', loadData);
    window.addEventListener('sih-live-event', loadData);
    return () => {
      window.removeEventListener('sih-projects-update', loadData);
      window.removeEventListener('sih-live-event', loadData);
    };
  }, [companyId]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  const handleConfirmPay = async () => {
    if (!payDrawerPart) return;
    setIsProcessingPay(true);
    setPayError('');
    try {
      await payPartApi(companyData.id, payDrawerPart.n, bankRefInput.trim());
      showToast(`Payment of ${formatIndianCurrency(payDrawerPart.amt)} released successfully.`);
      setPayDrawerPart(null);
      setBankRefInput('');
      await loadData();
    } catch (err) {
      setPayError(err.message || 'Payment could not be completed.');
    } finally {
      setIsProcessingPay(false);
    }
  };

  const handleConfirmHold = async () => {
    if (!holdDrawerPart) return;
    if (!holdReason.trim()) {
      alert('Please enter a plain reason for this decision.');
      return;
    }
    setIsProcessingHold(true);
    try {
      await resolveHoldApi(companyData.id, holdDrawerPart.n, holdAction === 'full' ? 'pay_full' : holdAction === 'smaller' ? 'pay_less' : 'keep_hold', holdAmount, holdReason);
      showToast('Decision recorded successfully.');
      setHoldDrawerPart(null);
      setHoldReason('');
      await loadData();
    } catch (err) {
      alert(err.message || 'Error recording decision.');
    } finally {
      setIsProcessingHold(false);
    }
  };

  if (loading || !companyData) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] p-8 -m-4 flex items-center justify-center text-slate-500 dark:text-slate-400 text-sm">
        Loading company details...
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 font-sans bg-slate-50 dark:bg-[#0b0f19] min-h-screen -m-4 p-8 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-slate-800 text-white text-xs px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Back Link */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveTab(isOfficer ? 'govt-dashboard' : 'university')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-1.5 rounded-lg shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> ← Back
        </button>
        <span className="text-[11px] text-slate-400 dark:text-slate-500">
          Company Overview • SAMADHAN SETU
        </span>
      </div>

      {/* ====================================================================== */}
      {/* 1) HEADER CARD */}
      {/* ====================================================================== */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {companyData.company}
            </h1>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {companyData.city} • {companyData.field}
            </span>
            {companyData.registered && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ECFDF3] dark:bg-emerald-950/60 text-[#16A34A] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 inline-flex items-center gap-1">
                <Check className="w-3 h-3" /> Registered startup
              </span>
            )}
          </div>

          <div>
            {companyData.statusPill === 'Done' && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#ECFDF3] dark:bg-emerald-950/60 text-[#16A34A] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 inline-flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Done
              </span>
            )}
            {companyData.statusPill === 'Running' && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900 inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Running
              </span>
            )}
            {companyData.statusPill === 'Waiting for decision' && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#FFF7E6] dark:bg-amber-950/60 text-[#D97706] dark:text-amber-400 border border-amber-200 dark:border-amber-900 inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Waiting for decision
              </span>
            )}
            {companyData.statusPill === 'Stopped' && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#FEF2F2] dark:bg-rose-950/60 text-[#DC2626] dark:text-rose-400 border border-rose-200 dark:border-rose-900 inline-flex items-center gap-1">
                <AlertOctagon className="w-3.5 h-3.5" /> Stopped
              </span>
            )}
          </div>
        </div>

        {/* One sentence about what the company does */}
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {companyData.about}
        </p>
      </div>

      {/* ====================================================================== */}
      {/* 2) "WHAT WAS ASKED AND WHAT HAPPENED" CARD */}
      {/* ====================================================================== */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          What was asked and what happened
        </h2>

        {/* Problem in one sentence */}
        <div className="bg-[#F7F8FA] rounded-lg p-3.5 border border-[#E8EAEF]">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Problem</span>
          <p className="text-xs sm:text-sm font-medium text-slate-800 mt-0.5">
            {companyData.problem}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Before -> Goal & Now Bar */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-slate-500 block">Goal comparison</span>
            <div className="flex items-center gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">Before</span>
                <span className="text-base font-bold text-slate-800">
                  {companyData.before} {companyData.unit}
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 mt-3" />
              <div>
                <span className="text-slate-400 block">Goal</span>
                <span className="text-base font-bold text-blue-600">
                  {companyData.goal} {companyData.unit}
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 mt-3" />
              <div>
                <span className="text-slate-400 block">Now</span>
                <span className="text-base font-bold text-slate-900">
                  {companyData.now !== null ? `${companyData.now} ${companyData.unit}` : 'Testing in progress'}
                </span>
              </div>
            </div>

            {/* Simple Before / Goal / Now Bar */}
            {companyData.now !== null && (
              <div className="space-y-1 pt-1">
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                  <div 
                    className={`h-full ${companyData.verdict === 'met' ? 'bg-emerald-500' : companyData.verdict === 'partly' ? 'bg-amber-500' : 'bg-rose-500'}`}
                    style={{ width: `${Math.min(100, Math.max(12, ((companyData.before - companyData.now) / (companyData.before - companyData.goal)) * 100))}%` }}
                  />
                </div>
                <span className="text-[11px] text-slate-500 block">
                  {companyData.verdict === 'met' && 'Trial met the target improvement.'}
                  {companyData.verdict === 'partly' && 'Improved from before, but did not reach the full goal.'}
                  {companyData.verdict === 'not_met' && 'Did not meet the required improvement.'}
                </span>
              </div>
            )}
          </div>

          {/* Who checked it */}
          <div className="bg-[#F7F8FA] rounded-lg p-4 border border-[#E8EAEF] space-y-2 text-xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Who checked it</span>
            <div className="flex justify-between">
              <span className="text-slate-500">Independent checker:</span>
              <span className="font-semibold text-slate-900">{companyData.checker || 'Independent checker not assigned'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Checked on:</span>
              <span className="text-slate-700">{companyData.checkedOn || 'Pending completion'}</span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-[#E8EAEF]">
              <span className="text-slate-500">Verdict:</span>
              <div>
                {companyData.verdict === 'met' && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#ECFDF3] text-[#16A34A] inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Goal met
                  </span>
                )}
                {companyData.verdict === 'partly' && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#FFF7E6] text-[#D97706] inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Partly met
                  </span>
                )}
                {companyData.verdict === 'not_met' && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#FEF2F2] text-[#DC2626] inline-flex items-center gap-1">
                    <AlertOctagon className="w-3 h-3" /> Not met
                  </span>
                )}
                {companyData.verdict === 'notchecked' && (
                  <span className="text-slate-400">Not checked yet</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* 3) "THEIR OFFER" CARD */}
      {/* ====================================================================== */}
      <div className="bg-white rounded-xl border border-[#E8EAEF] p-6 shadow-sm space-y-4">
        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Their offer
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#F7F8FA] rounded-lg p-3.5 border border-[#E8EAEF]">
            <span className="text-[11px] text-slate-500 block">Cost asked</span>
            <span className="text-base font-bold text-slate-900 mt-1 block">
              {formatIndianCurrency(companyData.cost)}
            </span>
          </div>

          <div className="bg-[#F7F8FA] rounded-lg p-3.5 border border-[#E8EAEF]">
            <span className="text-[11px] text-slate-500 block">Weeks promised</span>
            <span className="text-base font-bold text-slate-900 mt-1 block">
              {companyData.weeks} weeks
            </span>
          </div>

          <div className="bg-[#F7F8FA] rounded-lg p-3.5 border border-[#E8EAEF]">
            <span className="text-[11px] text-slate-500 block">Date applied</span>
            <span className="text-base font-bold text-slate-900 mt-1 block">
              {companyData.appliedDate}
            </span>
          </div>
        </div>

        <div className="space-y-1 text-xs">
          <span className="font-semibold text-slate-700 block">Proposal summary & claimed achievement:</span>
          <p className="text-slate-600 bg-slate-50 p-3.5 rounded-lg border border-[#E8EAEF] leading-relaxed">
            {companyData.proposal}
          </p>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* 4) "JUDGES' MARKS" CARD */}
      {/* ====================================================================== */}
      <div className="bg-white rounded-xl border border-[#E8EAEF] p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-[#E8EAEF] pb-3">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Judges' marks
          </h2>
          <span className="text-[11px] text-slate-400">
            Blind evaluation by independent technical experts
          </span>
        </div>

        {!companyData.areAllJudgesLocked ? (
          <div className="py-6 text-center space-y-2 bg-[#FFF7E6] rounded-xl border border-amber-200 p-6">
            <Clock className="w-6 h-6 text-amber-600 mx-auto" />
            <h3 className="text-sm font-bold text-amber-900">
              Judges are still giving marks (2 of 3 done)
            </h3>
            <p className="text-xs text-amber-700 max-w-md mx-auto">
              Under blind scoring rules, individual marks and ranks remain confidential until all assigned judges lock their scores.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Average & Rank */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F7F8FA] p-4 rounded-xl border border-[#E8EAEF]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                  {companyData.avgScore}
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Average score out of 100</span>
                  <span className="text-sm font-bold text-slate-900">
                    Weighted across all technical and cost categories
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 block">Rank among applicants</span>
                <span className="text-sm font-bold text-[#2563EB] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                  {companyData.rankText}
                </span>
              </div>
            </div>

            {/* Five criteria rows with progress bars */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-700 block">Scoring breakdown:</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                {companyData.criteriaBars.map((crit, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600 font-medium">{crit.name}</span>
                      <span className="font-bold text-slate-900">{crit.score} / {crit.max}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-blue-600 h-full rounded-full" 
                        style={{ width: `${(crit.score / crit.max) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Each Judge breakdown (Judge 1/2/3 only - never show names to startup) */}
            <div className="space-y-2.5 pt-2">
              <span className="text-xs font-semibold text-slate-700 block">Judge evaluations:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {companyData.judgesList.map((j, idx) => (
                  <div key={idx} className="bg-slate-50 rounded-lg p-3.5 border border-[#E8EAEF] space-y-1.5 text-xs">
                    <div className="flex justify-between items-center font-bold text-slate-900">
                      <span>{j.name}</span>
                      <span className="text-blue-600">{j.total}/100</span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      "{j.comment}"
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-1 text-[11px] text-slate-400">
              Marks are locked and cannot be changed.
            </div>
          </div>
        )}
      </div>

      {/* ====================================================================== */}
      {/* 5) "THE FULL JOURNEY" (Vertical Timeline, Oldest First) */}
      {/* ====================================================================== */}
      <div className="bg-white rounded-xl border border-[#E8EAEF] p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#E8EAEF] pb-3">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            The full journey
          </h2>
          <span className="text-[11px] text-slate-400">
            Chronological milestone and verification log
          </span>
        </div>

        {/* Timeline rows */}
        <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E8EAEF]">
          {companyData.fullJourney.map((step, idx) => (
            <div key={idx} className="flex items-start gap-3.5 relative">
              <div className="w-6 h-6 rounded-full bg-blue-100 border border-blue-400 text-blue-700 flex items-center justify-center text-[10px] font-bold shrink-0 z-10">
                {idx + 1}
              </div>
              <div className="bg-[#F7F8FA] rounded-lg p-3 border border-[#E8EAEF] flex-1 text-xs space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">{step.sentence}</span>
                  <span className="text-[11px] text-slate-400 whitespace-nowrap ml-2">{step.date}</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  <span className="font-medium text-slate-600">Why: </span>
                  {step.why}
                </p>
              </div>
            </div>
          ))}

          {/* Upcoming Step indicator */}
          {companyData.statusPill === 'Running' && (
            <div className="flex items-start gap-3.5 relative opacity-60">
              <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-300 text-slate-400 flex items-center justify-center text-[10px] font-bold shrink-0 z-10">
                Next
              </div>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 flex-1 text-xs">
                <span className="font-semibold text-slate-500">Next: final report verification, then Part 3 payment release.</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ====================================================================== */}
      {/* 6) "WHERE THE MONEY WENT" CARD */}
      {/* ====================================================================== */}
      <div className="bg-white rounded-xl border border-[#E8EAEF] p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8EAEF] pb-3">
          <div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Where the money went
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Trial grant parts and payment authorization statuses.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="text-slate-500">Total grant: <strong className="text-slate-900">{formatIndianCurrency(companyData.grant)}</strong></span>
            <span className="text-slate-500">Paid so far: <strong className="text-emerald-600">{formatIndianCurrency(companyData.paidSoFar)}</strong></span>
            <span className="text-slate-500">Waiting: <strong className="text-amber-600">{formatIndianCurrency(companyData.waitingAmt)}</strong></span>
          </div>
        </div>

        {/* 3 Payment Parts Rows */}
        <div className="space-y-3">
          {companyData.parts.map((part) => {
            const lateDays = part.readySince ? getDaysWaiting(part.readySince) : 0;
            const isLate = part.status === 'ready' && lateDays > 7;

            return (
              <div 
                key={part.n}
                className="bg-[#F7F8FA] rounded-xl p-4 border border-[#E8EAEF] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  {/* Status Icon */}
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    {part.status === 'paid' && (
                      <div className="w-7 h-7 rounded-full bg-[#ECFDF3] text-[#16A34A] flex items-center justify-center">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                    {part.status === 'ready' && (
                      <div className="w-7 h-7 rounded-full bg-[#FFF7E6] text-[#D97706] flex items-center justify-center">
                        <Clock className="w-4 h-4" />
                      </div>
                    )}
                    {part.status === 'hold' && (
                      <div className="w-7 h-7 rounded-full bg-[#FFF7E6] text-[#D97706] flex items-center justify-center">
                        <Clock className="w-4 h-4" />
                      </div>
                    )}
                    {part.status === 'stopped' && (
                      <div className="w-7 h-7 rounded-full bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center">
                        <X className="w-4 h-4" />
                      </div>
                    )}
                    {part.status === 'notstarted' && (
                      <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold">
                        {part.n}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">
                        Part {part.n} ({part.pct}%): {formatIndianCurrency(part.amt)}
                      </span>
                      
                      {part.status === 'paid' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#ECFDF3] text-[#16A34A]">
                          Paid
                        </span>
                      )}
                      {part.status === 'ready' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FFF7E6] text-[#D97706]">
                          Ready to pay
                        </span>
                      )}
                      {part.status === 'hold' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FFF7E6] text-[#D97706]">
                          On hold
                        </span>
                      )}
                      {part.status === 'stopped' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FEF2F2] text-[#DC2626]">
                          Stopped
                        </span>
                      )}
                      {part.status === 'notstarted' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-200 text-slate-600">
                          Not started
                        </span>
                      )}

                      {isLate && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEF2F2] text-[#DC2626]">
                          Late: {lateDays} days
                        </span>
                      )}
                    </div>

                    <p className="text-slate-600">{part.why}</p>

                    <div className="text-[11px] text-slate-400">
                      {part.status === 'paid' && (
                        <span>Paid on {part.date} • <strong className="font-mono text-slate-600">Bank ref: {part.ref}</strong></span>
                      )}
                      {part.status === 'ready' && (
                        <span className="text-amber-700">Waiting for officer to approve since {part.readySince}</span>
                      )}
                      {part.status === 'hold' && (
                        <span className="text-amber-700">Officer decision needed (on hold since {part.holdSince})</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Officer Pay Button / Disabled States (Officer only) */}
                {isOfficer && (
                  <div className="self-end sm:self-auto shrink-0 text-right">
                    {part.status === 'ready' && (
                      <button
                        onClick={() => {
                          setPayDrawerPart(part);
                          setBankRefInput(`UTR2610${Math.floor(100000 + Math.random() * 899999)}`);
                          setPayError('');
                        }}
                        className="bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-xs px-3.5 py-1.5 rounded-lg shadow-sm transition"
                      >
                        Pay {formatIndianCurrency(part.amt)}
                      </button>
                    )}

                    {part.status === 'hold' && (
                      <div>
                        <button
                          onClick={() => {
                            setHoldDrawerPart(part);
                            setHoldAction('full');
                            setHoldAmount(String(part.amt * 0.75));
                            setHoldReason('');
                          }}
                          className="bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-xs px-3.5 py-1.5 rounded-lg shadow-sm transition"
                        >
                          Review hold
                        </button>
                      </div>
                    )}

                    {part.status === 'notstarted' && (
                      <div className="text-[11px] text-slate-400">
                        {companyData.verdict === 'notchecked' ? 'Waiting for independent checker result' : 'Scheduled milestone'}
                      </div>
                    )}

                    {part.status === 'stopped' && (
                      <div className="text-[11px] text-rose-600 font-medium">
                        Stopped: goal was not met
                      </div>
                    )}

                    {part.status === 'paid' && (
                      <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 justify-end">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Paid on {part.date}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ====================================================================== */}
      {/* 7) "DOCUMENTS" CARD */}
      {/* ====================================================================== */}
      {companyData.documents && companyData.documents.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E8EAEF] p-6 shadow-sm space-y-3">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Documents
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {companyData.documents.map((doc, idx) => (
              <div 
                key={idx} 
                className="bg-[#F7F8FA] rounded-lg p-3.5 border border-[#E8EAEF] flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                  <div className="truncate">
                    <span className="font-semibold text-slate-800 truncate block">{doc.name}</span>
                    <span className="text-[10px] text-slate-400">{doc.size} • {doc.date}</span>
                  </div>
                </div>

                <button 
                  onClick={() => alert(`Simulated download of ${doc.name}`)}
                  className="text-blue-600 hover:text-blue-800 p-1.5 rounded hover:bg-white transition shrink-0"
                  title="Download document"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* SIDE PANEL / MODAL: OFFICER PAY FLOW */}
      {/* ====================================================================== */}
      {payDrawerPart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-md w-full p-6 border border-[#E8EAEF] shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E8EAEF] pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Release Payment</h3>
                <p className="text-xs text-slate-500">Part {payDrawerPart.n} ({payDrawerPart.pct}%)</p>
              </div>
              <button 
                onClick={() => setPayDrawerPart(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {payError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {payError}
              </div>
            )}

            <div className="bg-[#F7F8FA] rounded-lg p-3.5 border border-[#E8EAEF] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Company:</span>
                <span className="font-semibold text-slate-900">{companyData.company}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Release Amount:</span>
                <span className="font-bold text-[#2563EB] text-sm">{formatIndianCurrency(payDrawerPart.amt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Checker verdict:</span>
                <span className="font-semibold text-emerald-600">Goal met ({companyData.now} {companyData.unit})</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-[#E8EAEF]">
                <span className="text-slate-500">Verification report:</span>
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); alert('Opening checker report PDF'); }}
                  className="text-blue-600 underline flex items-center gap-1"
                >
                  View report <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-slate-700 block">Bank Reference (UTR number):</label>
              <input
                type="text"
                value={bankRefInput}
                onChange={(e) => setBankRefInput(e.target.value)}
                placeholder="e.g. UTR2610020084"
                className="w-full px-3 py-2 rounded-lg border border-[#E8EAEF] font-mono text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white"
              />
              <span className="text-[11px] text-slate-400">
                Generated bank transaction identifier recorded in government ledger.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8EAEF]">
              <button
                type="button"
                onClick={() => setPayDrawerPart(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessingPay || !bankRefInput.trim()}
                onClick={handleConfirmPay}
                className="px-4 py-2 text-xs font-semibold bg-[#2563EB] hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg transition shadow-sm"
              >
                {isProcessingPay ? 'Processing...' : `Confirm & Pay ${formatIndianCurrency(payDrawerPart.amt)}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: OFFICER HOLD DECISION */}
      {holdDrawerPart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-md w-full p-6 border border-[#E8EAEF] shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E8EAEF] pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Resolve Hold Decision</h3>
                <p className="text-xs text-slate-500">Goal partly met ({companyData.now} {companyData.unit})</p>
              </div>
              <button 
                onClick={() => setHoldDrawerPart(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <label className={`block p-3 rounded-lg border cursor-pointer ${holdAction === 'full' ? 'border-blue-600 bg-blue-50/50' : 'border-[#E8EAEF]'}`}>
                <input type="radio" name="holdOpt" checked={holdAction === 'full'} onChange={() => setHoldAction('full')} className="mr-2 text-blue-600" />
                <span className="font-bold text-slate-900">Pay full ({formatIndianCurrency(holdDrawerPart.amt)})</span>
              </label>

              <label className={`block p-3 rounded-lg border cursor-pointer ${holdAction === 'smaller' ? 'border-blue-600 bg-blue-50/50' : 'border-[#E8EAEF]'}`}>
                <input type="radio" name="holdOpt" checked={holdAction === 'smaller'} onChange={() => setHoldAction('smaller')} className="mr-2 text-blue-600" />
                <span className="font-bold text-slate-900">Pay smaller amount</span>
                {holdAction === 'smaller' && (
                  <input
                    type="number"
                    value={holdAmount}
                    onChange={(e) => setHoldAmount(e.target.value)}
                    placeholder="Amount in ₹"
                    className="w-full mt-2 px-3 py-1.5 rounded border border-[#E8EAEF] text-xs bg-white"
                  />
                )}
              </label>

              <label className={`block p-3 rounded-lg border cursor-pointer ${holdAction === 'keep_hold' ? 'border-blue-600 bg-blue-50/50' : 'border-[#E8EAEF]'}`}>
                <input type="radio" name="holdOpt" checked={holdAction === 'keep_hold'} onChange={() => setHoldAction('keep_hold')} className="mr-2 text-blue-600" />
                <span className="font-bold text-slate-900">Keep on hold</span>
              </label>

              <div className="pt-2">
                <label className="font-semibold text-slate-700 block mb-1">Plain Reason (mandatory):</label>
                <input
                  type="text"
                  value={holdReason}
                  onChange={(e) => setHoldReason(e.target.value)}
                  placeholder="e.g. Substantial improvement verified; paying pro-rated share"
                  className="w-full px-3 py-2 rounded-lg border border-[#E8EAEF] text-xs bg-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8EAEF]">
              <button
                type="button"
                onClick={() => setHoldDrawerPart(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessingHold}
                onClick={handleConfirmHold}
                className="px-4 py-2 text-xs font-semibold bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg transition shadow-sm"
              >
                {isProcessingHold ? 'Saving...' : 'Save Decision'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
