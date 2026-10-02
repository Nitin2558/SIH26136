import React, { useState } from 'react';
import { 
  Building2, 
  Send, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Clock, 
  DollarSign, 
  Sparkles,
  ArrowRight,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import { 
  createCompanyApi, 
  applyToProblemApi, 
  acceptOfferApi, 
  rejectOfferApi 
} from '../services/supabaseData';
import { formatIndianCurrency } from '../data/projects';

export const StartupActionsCard = ({ onUpdate }) => {
  // Modal / Form state
  const [showCreateCompanyModal, setShowCreateCompanyModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState(null);

  // Success toast
  const [toast, setToast] = useState('');
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  // 1. Create Company Form State
  const [companyForm, setCompanyForm] = useState({
    name: '',
    city: '',
    whatYouMake: '',
    founderNames: '',
    contactEmail: ''
  });
  const [creatingCompany, setCreatingCompany] = useState(false);

  // 2. Apply Form State
  const [applyForm, setApplyForm] = useState({
    summary: '',
    daysToBuild: '90',
    costEstimate: '800000'
  });
  const [submittingApply, setSubmittingApply] = useState(false);

  // 3. My Offers State
  const [offers, setOffers] = useState([
    {
      id: 'off-1',
      problemTitle: 'Dynamic Waste Collection Route Optimization',
      dept: 'Pune Municipal Corporation',
      grant: 1250000,
      days: 90,
      summary: 'Automated dynamic route optimization across collection vehicles with GPS telemetry.',
      status: 'pending' // pending | accepted | rejected
    }
  ]);
  const [rejectingOfferId, setRejectingOfferId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processingOffer, setProcessingOffer] = useState(false);

  // Canonical Open Problems
  const openProblems = [
    {
      id: 'prob-1',
      title: 'Municipal Solid Waste Collection Route Optimization & Delay Reduction',
      dept: 'Pune Municipal Corporation',
      baseline: '45 mins delay / trip',
      goal: 'Under 10 mins delay',
      maxGrant: 1250000
    },
    {
      id: 'prob-2',
      title: 'Sub-surface Potable Water Pipe Leakage Identification Telemetry',
      dept: 'Indore Municipal Corporation',
      baseline: '32% unmetered water loss',
      goal: 'Under 12% loss',
      maxGrant: 1600000
    },
    {
      id: 'prob-3',
      title: 'Intelligent Green Corridor for Emergency Ambulances at Arterial Signals',
      dept: 'Surat Traffic Police Department',
      baseline: '18 mins response time',
      goal: 'Under 8 mins response',
      maxGrant: 1500000
    },
    {
      id: 'prob-4',
      title: 'High-Altitude Solar Microgrid Battery Storage for Remote Health Clinics',
      dept: 'Department of Health & Family Welfare, Shimla',
      baseline: '14 hrs daily blackouts',
      goal: 'Zero blackouts',
      maxGrant: 2000000
    }
  ];

  // Submit Create Company
  const handleCreateCompany = async (e) => {
    e.preventDefault();
    if (!companyForm.name || !companyForm.city) {
      alert('Please enter company name and city.');
      return;
    }
    setCreatingCompany(true);
    try {
      await createCompanyApi({
        name: companyForm.name,
        city: companyForm.city,
        field: companyForm.whatYouMake || 'Smart Cities Tech',
        about: `${companyForm.whatYouMake}. Founded by ${companyForm.founderNames || 'Team'}. Contact: ${companyForm.contactEmail || 'office@startup.in'}`
      });
      showToast(`Company "${companyForm.name}" created successfully! Check the government live feed.`);
      setShowCreateCompanyModal(false);
      setCompanyForm({ name: '', city: '', whatYouMake: '', founderNames: '', contactEmail: '' });
      if (onUpdate) onUpdate();
    } catch (err) {
      alert(err.message || 'Failed to create company');
    } finally {
      setCreatingCompany(false);
    }
  };

  // Submit Application
  const handleApply = async (e) => {
    e.preventDefault();
    if (!selectedProblem) return;
    if (!applyForm.summary.trim()) {
      alert('Please enter a summary of your fix.');
      return;
    }
    setSubmittingApply(true);
    try {
      await applyToProblemApi({
        problemId: selectedProblem.id,
        problemTitle: selectedProblem.title,
        companyName: 'CleanRoute Technologies',
        companyId: 'P1',
        proposal: applyForm.summary,
        cost: Number(applyForm.costEstimate) || 800000,
        weeks: Math.round((Number(applyForm.daysToBuild) || 90) / 7)
      });
      showToast(`Application submitted for "${selectedProblem.title}"! It has been posted to the live feed.`);
      setShowApplyModal(false);
      setSelectedProblem(null);
      setApplyForm({ summary: '', daysToBuild: '90', costEstimate: '800000' });
      if (onUpdate) onUpdate();
    } catch (err) {
      alert(err.message || 'Failed to submit application');
    } finally {
      setSubmittingApply(false);
    }
  };

  // Handle Offer Accept
  const handleAcceptOffer = async (offer) => {
    setProcessingOffer(true);
    try {
      await acceptOfferApi({
        offerId: offer.id,
        companyId: 'P1',
        companyName: 'CleanRoute Technologies',
        problemTitle: offer.problemTitle,
        grant: offer.grant
      });
      setOffers(prev => prev.map(o => o.id === offer.id ? { ...o, status: 'accepted' } : o));
      showToast(`Trial offer accepted! Small trial created with 3 payment parts (30/40/30). Check the live feed.`);
      if (onUpdate) onUpdate();
    } catch (err) {
      alert(err.message || 'Failed to accept offer');
    } finally {
      setProcessingOffer(false);
    }
  };

  // Handle Offer Reject
  const handleRejectOffer = async (offer) => {
    if (!rejectReason.trim()) {
      alert('Please enter a short reason for saying no.');
      return;
    }
    setProcessingOffer(true);
    try {
      await rejectOfferApi({
        offerId: offer.id,
        companyId: 'P1',
        companyName: 'CleanRoute Technologies',
        problemTitle: offer.problemTitle,
        reason: rejectReason
      });
      setOffers(prev => prev.map(o => o.id === offer.id ? { ...o, status: 'rejected' } : o));
      setRejectingOfferId(null);
      setRejectReason('');
      showToast(`Trial offer declined. Feedback sent to department.`);
      if (onUpdate) onUpdate();
    } catch (err) {
      alert(err.message || 'Failed to decline offer');
    } finally {
      setProcessingOffer(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl border border-slate-700 text-sm flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Banner with Quick Actions */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Startup Innovation Gateway
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Register your company, apply to open government problems, and review small trial offers.
          </p>
        </div>
        <button
          onClick={() => setShowCreateCompanyModal(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 transition shadow-sm"
        >
          <Building2 className="w-4 h-4" />
          <span>Create your company</span>
        </button>
      </div>

      {/* SECTION: My Offers */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              My offers
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Government trial offers awaiting your confirmation.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
            {offers.filter(o => o.status === 'pending').length} pending
          </span>
        </div>

        <div className="space-y-3">
          {offers.map(offer => (
            <div 
              key={offer.id} 
              className={`p-4 rounded-xl border transition-all ${
                offer.status === 'accepted' 
                  ? 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800' 
                  : offer.status === 'rejected'
                  ? 'bg-slate-50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-700 opacity-60'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-300'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {offer.problemTitle}
                    </span>
                    {offer.status === 'accepted' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Accepted
                      </span>
                    )}
                    {offer.status === 'rejected' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                        Declined
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500">
                    From: <strong className="text-slate-700 dark:text-slate-300">{offer.dept}</strong> • Trial grant: <strong className="text-slate-900 dark:text-white font-mono">{formatIndianCurrency(offer.grant)}</strong> • Duration: <strong>{offer.days} days</strong>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    {offer.summary}
                  </p>
                </div>

                {offer.status === 'pending' && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleAcceptOffer(offer)}
                      disabled={processingOffer}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Accept</span>
                    </button>
                    <button
                      onClick={() => setRejectingOfferId(offer.id)}
                      disabled={processingOffer}
                      className="px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Say no</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Say No Prompt */}
              {rejectingOfferId === offer.id && offer.status === 'pending' && (
                <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-lg space-y-2">
                  <label className="text-xs font-semibold text-rose-900">
                    Why are you saying no? (Short reason for the department)
                  </label>
                  <input
                    type="text"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="e.g. Schedule overlap / insufficient equipment..."
                    className="w-full text-xs p-2 rounded border border-rose-300 focus:outline-none focus:ring-1 focus:ring-rose-500 bg-white"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setRejectingOfferId(null)}
                      className="px-3 py-1 text-xs text-slate-600 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleRejectOffer(offer)}
                      className="px-3 py-1 text-xs font-semibold bg-rose-600 text-white rounded hover:bg-rose-700"
                    >
                      Confirm Decline
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* SECTION: Open Problems */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              Open problems
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Real municipal and department problems inviting startup trial solutions.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {openProblems.length} active problems
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {openProblems.map(prob => (
            <div 
              key={prob.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between space-y-3 transition"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                    {prob.title}
                  </h4>
                </div>
                <div className="text-xs text-slate-500">
                  Department: <strong className="text-slate-700 dark:text-slate-300">{prob.dept}</strong>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-slate-400">Before:</span>{' '}
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{prob.baseline}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Goal:</span>{' '}
                    <span className="font-semibold text-emerald-600">{prob.goal}</span>
                  </div>
                </div>
                <div className="text-xs text-slate-500">
                  Trial grant up to: <strong className="text-slate-900 dark:text-white font-mono">{formatIndianCurrency(prob.maxGrant)}</strong>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedProblem(prob);
                  setShowApplyModal(true);
                }}
                className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
              >
                <span>Apply</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL: Create Company */}
      {showCreateCompanyModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Create your company
              </h3>
              <button 
                onClick={() => setShowCreateCompanyModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCompany} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AeroSense Technologies"
                  value={companyForm.name}
                  onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Indore"
                    value={companyForm.city}
                    onChange={(e) => setCompanyForm({ ...companyForm, city: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. team@startup.in"
                    value={companyForm.contactEmail}
                    onChange={(e) => setCompanyForm({ ...companyForm, contactEmail: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Founder Names
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rohan Sharma, Priya Mehta"
                  value={companyForm.founderNames}
                  onChange={(e) => setCompanyForm({ ...companyForm, founderNames: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  What you make *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe your core product or solution in plain words..."
                  value={companyForm.whatYouMake}
                  onChange={(e) => setCompanyForm({ ...companyForm, whatYouMake: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateCompanyModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingCompany}
                  className="px-5 py-2 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {creatingCompany ? 'Saving...' : 'Create Company'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Apply to Problem */}
      {showApplyModal && selectedProblem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Send className="w-5 h-5 text-blue-600" />
                  Apply for Small Trial
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 truncate max-w-md">
                  {selectedProblem.title}
                </p>
              </div>
              <button 
                onClick={() => setShowApplyModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApply} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Summary of your fix *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Explain how your solution solves this problem, what hardware/software you will deploy..."
                  value={applyForm.summary}
                  onChange={(e) => setApplyForm({ ...applyForm, summary: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    How many days to build? *
                  </label>
                  <input
                    type="number"
                    min="14"
                    max="365"
                    required
                    value={applyForm.daysToBuild}
                    onChange={(e) => setApplyForm({ ...applyForm, daysToBuild: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-[10px] text-slate-400">e.g. 90 days</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Cost estimate (₹) *
                  </label>
                  <input
                    type="number"
                    min="50000"
                    step="10000"
                    required
                    value={applyForm.costEstimate}
                    onChange={(e) => setApplyForm({ ...applyForm, costEstimate: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                  <span className="text-[10px] text-slate-400">
                    {formatIndianCurrency(Number(applyForm.costEstimate) || 0)}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  Submitting this application immediately logs a live event to the government live feed and notifies the department officer.
                </span>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingApply}
                  className="px-5 py-2 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingApply ? 'Submitting...' : 'Submit Application'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
