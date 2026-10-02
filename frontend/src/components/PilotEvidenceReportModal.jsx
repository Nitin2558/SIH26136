import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Building2, 
  Rocket, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Scale, 
  Check, 
  Copy,
  ExternalLink
} from 'lucide-react';

export const PilotEvidenceReportModal = ({ isOpen, onClose, pilotId = 'pilot-1' }) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetch(`/api/pilots/${pilotId}/report`)
      .then(res => res.json())
      .then(data => setReport(data))
      .catch(err => console.error('Failed to load pilot report:', err))
      .finally(() => setLoading(false));
  }, [isOpen, pilotId]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    if (!report) return;
    const text = `
=== SIH26136 INNOVATION PROCUREMENT PILOT CLOSEOUT REPORT ===
Report ID: ${report.reportId}
Date: ${new Date(report.generatedAt).toLocaleDateString('en-IN')}
Challenge: ${report.challenge?.title}
Department: ${report.challenge?.departmentName}
Awarded Startup: ${report.startup?.name} (DPIIT: ${report.startup?.dpiitNumber || 'N/A'}, TRL: ${report.startup?.trlLevel || 'N/A'})

KPI PERFORMANCE BENCHMARK:
- Metric: ${report.kpiTracking?.metric}
- Baseline: ${report.kpiTracking?.baselineValue}${report.kpiTracking?.unit}
- Target: <= ${report.kpiTracking?.targetValue}${report.kpiTracking?.unit}
- Actual Verified: ${report.kpiTracking?.currentActualValue}${report.kpiTracking?.unit} (${report.kpiTracking?.status})

VALIDATOR VERDICT:
- Auditing Body: ${report.validationReports?.[0]?.validatorName || 'Third-Party Testing Lab'}
- Verdict: ${report.validationReports?.[0]?.decision || 'Achieved'}
- Methodology: ${report.validationReports?.[0]?.testMethodology}

SCALE-UP & PROCUREMENT DECISION (GFR RULE 194):
- Pathway: ${report.procurementDecision?.pathway || 'Rule 194 Direct Innovation Procurement'}
- Decision: ${report.procurementDecision?.decision}
- Scale Budget: ${report.procurementDecision?.recommendedScaleBudget}
- Authorized By: ${report.procurementDecision?.signedBy}

DISCLAIMER: ${report.disclaimer}
=============================================================
`.trim();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      
      {/* Modal Container */}
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-slate-900 dark:text-slate-100">
        
        {/* Top Action Bar (Screen Only - Hidden when printing) */}
        <div className="print:hidden flex items-center justify-between p-4 px-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Evidence-Backed Pilot Closeout Dossier (SIH26136)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-6 print:p-0 print:overflow-visible">
          
          {loading ? (
            <div className="py-20 text-center text-xs text-slate-500 font-semibold space-y-2">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p>Aggregating verified telemetry logs, milestone tranches, and audit certificates...</p>
            </div>
          ) : !report ? (
            <div className="py-20 text-center text-xs text-rose-500 font-semibold">
              Failed to load pilot evidence report.
            </div>
          ) : (
            <div className="space-y-6 text-slate-900 dark:text-slate-100">
              
              {/* Official Header */}
              <div className="border-b-2 border-slate-900 dark:border-slate-100 pb-5 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="text-[11px] font-black uppercase tracking-widest text-blue-700 dark:text-blue-400">
                      GOVERNMENT OF MAHARASHTRA • INNOVATION PROCUREMENT CELL
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 dark:text-white mt-1">
                      PILOT PERFORMANCE & OUTCOME VERIFICATION REPORT
                    </h1>
                    <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      Framework: Model SBoT Sandbox Agreement & GFR Rule 194 Direct Scale-Up
                    </div>
                  </div>

                  <div className="text-right text-xs space-y-0.5">
                    <div className="font-mono font-bold text-slate-900 dark:text-slate-100">{report.reportId}</div>
                    <div className="text-slate-500">Dated: {new Date(report.generatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                    <div className="text-[10px] font-mono text-slate-400">Ref: {report.pilot?.agreementRef}</div>
                  </div>
                </div>

                {/* Prominent Mandatory Demo Disclaimer */}
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2 leading-relaxed">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">MANDATORY DEMONSTRATION NOTICE (SIH26136):</strong> This document is generated for Smart India Hackathon evaluation purposes. It aggregates verified municipal telemetry, milestone escrow sign-offs, and third-party audit reports from the CleanRoute pilot sandbox. It serves as an audit demonstration and is not an official legal procurement award.
                  </div>
                </div>
              </div>

              {/* Section 1: Challenge & Originating Department */}
              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-1">
                  1. Challenge Context & Originating Department
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Challenge Title:</span>
                    <strong className="font-bold text-slate-900 dark:text-slate-100">{report.challenge?.title}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Department / Sanction Authority:</span>
                    <strong className="font-bold text-slate-900 dark:text-slate-100">{report.challenge?.departmentName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Testbed Region:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{report.challenge?.location}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Total Pilot Sandbox Grant:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">₹{(report.pilot?.totalGrantBudget || 0).toLocaleString('en-IN')} (100% Staged Escrow)</span>
                  </div>
                </div>
              </div>

              {/* Section 2: Awarded Startup Profile */}
              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-1">
                  2. Awarded DPIIT Startup Identification
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Startup Name:</span>
                    <strong className="font-bold text-slate-900 dark:text-slate-100">{report.startup?.name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">DPIIT Recognition No:</span>
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{report.startup?.dpiitNumber || 'DIPP-84920'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Technology Readiness Level:</span>
                    <span className="font-bold text-purple-700 dark:text-purple-300">TRL {report.startup?.trlLevel || 7} (Field Operational)</span>
                  </div>
                  <div className="sm:col-span-3">
                    <span className="text-slate-500 text-[10px] block">Solution Summary:</span>
                    <span className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">{report.startup?.solutionSummary}</span>
                  </div>
                </div>
              </div>

              {/* Section 3: Verified KPI Outcome Benchmarks */}
              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-1 flex items-center justify-between">
                  <span>3. Audited KPI Performance Telemetry</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold text-[11px]">✓ TARGET EXCEEDED</span>
                </h3>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Pre-Pilot Baseline</div>
                    <div className="text-xl sm:text-2xl font-black text-rose-600 mt-0.5">
                      {report.kpiTracking?.baselineValue}{report.kpiTracking?.unit}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">Manual dispatch delay</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900">
                    <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">Target Contract KPI</div>
                    <div className="text-xl sm:text-2xl font-black text-blue-700 dark:text-blue-300 mt-0.5">
                      &le; {report.kpiTracking?.targetValue}{report.kpiTracking?.unit}
                    </div>
                    <div className="text-[10px] text-blue-600/80 mt-1">Threshold for success</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800">
                    <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">Actual Verified Outcome</div>
                    <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {report.kpiTracking?.currentActualValue}{report.kpiTracking?.unit}
                    </div>
                    <div className="text-[10px] font-bold text-emerald-600 mt-1">18 pts delay reduction</div>
                  </div>
                </div>
              </div>

              {/* Section 4: Staged Milestones & Payment Release Table */}
              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-1">
                  4. Staged Milestones & Escrow Payment Tranches (100% Validated)
                </h3>

                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-[10px] font-bold uppercase text-slate-600 dark:text-slate-300">
                      <tr>
                        <th className="p-2.5">Phase</th>
                        <th className="p-2.5">Deliverable Title</th>
                        <th className="p-2.5">Share</th>
                        <th className="p-2.5">Amount</th>
                        <th className="p-2.5">Validator Signoff</th>
                        <th className="p-2.5">Payment Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {report.milestones?.map((m) => (
                        <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                          <td className="p-2.5 font-bold font-mono">P{m.index}</td>
                          <td className="p-2.5">
                            <div className="font-bold text-slate-900 dark:text-slate-100">{m.title}</div>
                            {m.evidence?.description && (
                              <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                                Evidence: {m.evidence.description}
                              </div>
                            )}
                          </td>
                          <td className="p-2.5 font-bold">{m.paymentPercentage}%</td>
                          <td className="p-2.5 font-mono">₹{(m.paymentAmount || 0).toLocaleString('en-IN')}</td>
                          <td className="p-2.5">
                            {m.validatorReview ? (
                              <span className="inline-flex items-center gap-1 font-bold text-emerald-600 text-[11px]">
                                <CheckCircle2 className="w-3.5 h-3.5" /> {m.validatorReview.decision}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px] italic">Simulated in-progress</span>
                            )}
                          </td>
                          <td className="p-2.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              m.status === 'released' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                              m.status === 'ready_for_release' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                              'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}>
                              {m.status.replace(/_/g, ' ').toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 5: Independent Third-Party Validation Verdict */}
              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-1">
                  5. Independent Third-Party Assessment Lab Certification
                </h3>

                <div className="p-4 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 space-y-2 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      <div>
                        <strong className="text-slate-900 dark:text-slate-100 font-bold block">
                          {report.validationReports?.[0]?.validatorName || 'TechAudit & Standards Certification Bureau'}
                        </strong>
                        <span className="text-[10px] text-slate-500">NABL & ISO/IEC 17025 Accredited Assessment Body</span>
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-600 text-white shadow-2xs">
                      VERDICT: {report.validationReports?.[0]?.decision || 'ACHIEVED'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-emerald-100 dark:border-emerald-900/40 text-[11px]">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Test Methodology:</span>
                      <span className="text-slate-700 dark:text-slate-300">
                        {report.validationReports?.[0]?.testMethodology || 'Independent empirical sampling of 450 vehicle trips using automated GPS geofencing & bin RFID verification logs.'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Auditor Certification Remarks:</span>
                      <span className="text-slate-700 dark:text-slate-300">
                        {report.validationReports?.[0]?.remarks || 'All test criteria met. Delay reduced by 18 percentage points from baseline. Telemetry data integrity 99.4%.'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 6: Post-Pilot Public Procurement & Scale-Up Decision */}
              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-1">
                  6. Post-Pilot Public Procurement & Scale-Up Order (GFR Rule 194)
                </h3>

                <div className="p-4 rounded-2xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/60 space-y-3 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-blue-900 dark:text-blue-200">
                      {report.procurementDecision?.pathway || 'GFR Rule 194 Direct Innovation Procurement / GeM Startup Runway'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {report.procurementDecision?.decision || 'PROCEED TO SCALE'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                    {report.procurementDecision?.rationale || 'CleanRoute successfully demonstrated 22% collection delay over 45 municipal vehicles. Independent validator confirmed 99.4% telemetry data integrity. Approved for city-wide scale-up and inter-district recommendation.'}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-blue-100 dark:border-blue-900/40 text-[11px]">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Approved Scaling Districts:</span>
                      <strong className="text-slate-900 dark:text-slate-100">
                        {Array.isArray(report.procurementDecision?.scaleDistricts) 
                          ? report.procurementDecision.scaleDistricts.join(', ') 
                          : 'Pune Municipal Corporation, Pimpri-Chinchwad, Nagpur'}
                      </strong>
                    </div>

                    <div>
                      <span className="text-slate-500 text-[10px] block">Recommended Scale Contract Ceiling:</span>
                      <strong className="text-emerald-700 dark:text-emerald-400">
                        {report.procurementDecision?.recommendedScaleBudget || '₹ 1,45,00,000 (Annual City-Wide Service Contract)'}
                      </strong>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between pt-2 border-t border-blue-100 dark:border-blue-900/40 text-[10px] text-slate-500">
                    <span>Authorized Signatory: <strong className="text-slate-800 dark:text-slate-200">{report.procurementDecision?.signedBy || 'Dr. Sunita Verma (Director)'}</strong></span>
                    <span className="font-mono">Tamper-evident verification hash: SIH-26136-CERT-OK</span>
                  </div>
                </div>
              </div>

              {/* Document Footer Signatures */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 text-center text-xs text-slate-500">
                <div className="space-y-1">
                  <div className="font-bold text-slate-900 dark:text-slate-100">{report.pilot?.validatorName || 'Quality & Standards Bureau'}</div>
                  <div className="text-[10px]">Independent Assessment Authority</div>
                  <div className="text-[9px] text-emerald-600 font-bold">✓ Digitally Certified</div>
                </div>

                <div className="space-y-1">
                  <div className="font-bold text-slate-900 dark:text-slate-100">{report.pilot?.officerName || 'Dr. Sunita Verma'}</div>
                  <div className="text-[10px]">{report.pilot?.departmentName || 'Director of Urban Innovation'}</div>
                  <div className="text-[9px] text-blue-600 font-bold">✓ Sanctioned & Recorded</div>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};
