// frontend/src/services/sharedValidationStore.js
// Centralized shared state store between Validator and Startup personas for SIH26136

const STORAGE_KEY = 'sih_validation_store_v1';

const DEFAULT_STATE = {
  // Pilot 1: Pune Solid Waste
  pilotId: 'pilot-1',
  pilotTitle: 'Municipal Solid Waste Collection Route Optimization & Delay Reduction',
  procuringAuthority: 'Pune Municipal Corporation (PMC)',
  startupName: 'ERAER',
  startupFullName: 'CleanRoute Technologies Pvt Ltd (ERAER)',
  grantAmount: 1250000,
  domain: 'Smart Cities & CleanTech',
  state: 'Maharashtra',
  duration: '12 Weeks',

  // Target KPI Metrics
  kpiTitle: 'Reduce route transit delay from baseline 40% to ≤ 25%',
  baselineDelay: 40.0,
  targetDelay: 25.0,
  startupClaim: 20.0,
  verifiedResult: 22.0,
  validatorOrg: 'Independent Lab, IIT Delhi',
  validatorName: 'Prof. Anil Kapoor',

  // Conflict Declaration state
  conflictStatus: {
    'pilot-1': {
      isDeclared: true,
      hasConflict: false,
      signedBy: 'Prof. Anil Kapoor',
      signDate: '18 Sep 2026',
      signature: 'Prof. Anil Kapoor',
      answers: {
        shareholding: 'no',
        employment: 'no',
        relationship: 'no',
        financial: 'no'
      },
      statusText: 'No conflict declared. Verified neutral.'
    },
    'chal-2': {
      isDeclared: false,
      hasConflict: false,
      signedBy: null,
      signDate: null,
      statusText: 'Pending Declaration'
    },
    'chal-3': {
      isDeclared: true,
      hasConflict: false,
      signedBy: 'Prof. Anil Kapoor',
      signDate: '12 Aug 2026',
      statusText: 'Cleared'
    }
  },

  // Verification Decision state
  verification: {
    status: 'locked', // 'pending' | 'locked'
    verifiedValue: 22.0,
    suggestedDecision: 'Achieved', // Achieved | Partially Achieved | Not Achieved
    decision: 'Achieved',
    isOverridden: false,
    overrideJustification: '',
    methodologyNotes: 'Independent testbed telemetry audit conducted across 25 Pune Municipal collection vehicles over 30 consecutive operating days. GPS route traversal and fuel consumption logs cross-verified against municipal dispatch sheets. Average transit delay decreased from 40.0% baseline to 22.0%, comfortably meeting the ≤ 25.0% outcome ceiling with 18.2% diesel economy.',
    reportId: 'REP-PMC-M2-2026-904',
    submittedAt: '02 Oct 2026, 11:15 AM',
    signedBy: 'Prof. Anil Kapoor',
    pdfFile: {
      name: 'IITD_PMC_M2_Independent_Audit_Report.pdf',
      size: '2.4 MB',
      hash: 'sha256:7f83b1657ff1fc53b92dc18148a1d65b'
    },
    integrityChecklist: {
      rawNotSummarized: true,
      continuousTimestamps: true,
      noDuplicateRows: true,
      sampleSizeAdequate: true,
      checksumsMatch: true
    },
    attributionFlags: {
      rainfall: false,
      festival: false,
      fleetSize: false,
      roadWork: false,
      dataGaps: false
    },
    attributionNotes: {
      rainfall: '',
      festival: '',
      fleetSize: '',
      roadWork: '',
      dataGaps: ''
    }
  },

  // Milestone Escrow Tranches (100% total)
  milestones: [
    {
      id: 'ms-1',
      name: 'Milestone 1 (30%)',
      amount: 375000,
      percentage: 30,
      status: 'paid',
      statusLabel: 'Paid / Released',
      description: 'Testbed sensor baseline calibration & ward route setup (UTR Verified)',
      authCode: 'ESCROW-PMC-M1-REL-8491'
    },
    {
      id: 'ms-2',
      name: 'Milestone 2 (40%)',
      amount: 500000,
      percentage: 40,
      status: 'ready_for_release',
      statusLabel: 'Ready for Release',
      description: 'Verified 22.0% delay achieved (Sanctioned in Escrow by IIT Delhi Audit)',
      authCode: 'ESCROW-AUTH-PMC-M2-READY'
    },
    {
      id: 'ms-3',
      name: 'Milestone 3 (30%)',
      amount: 375000,
      percentage: 30,
      status: 'in_progress',
      statusLabel: 'In Progress',
      description: 'Final scale-up documentation & GFR Rule 194 direct procurement memorandum',
      authCode: 'ESCROW-PENDING-PMC-M3'
    }
  ],

  // Submitted Reports Registry
  reports: [
    {
      id: 'REP-PMC-M2-2026-904',
      pilotId: 'pilot-1',
      pilotTitle: 'Municipal Solid Waste Collection Route Optimization & Delay Reduction',
      department: 'Pune Municipal Corporation (PMC)',
      startup: 'ERAER (CleanRoute)',
      milestone: 'Milestone 2 (40% - ₹ 5,00,000)',
      targetKpi: 'Delay ≤ 25.0%',
      verifiedResult: '22.0%',
      decision: 'Achieved',
      status: 'Locked',
      date: '02 Oct 2026',
      auditor: 'Prof. Anil Kapoor',
      organization: 'Independent Lab, IIT Delhi',
      auditTrail: [
        { time: '18 Sep 2026, 09:30 AM', event: 'Conflict Declaration executed by Prof. Anil Kapoor (No conflict found)' },
        { time: '19 Sep 2026, 02:15 PM', event: 'Raw GPS logs (GPS_logs_wards_12_13.csv) imported & SHA-256 verified' },
        { time: '20 Sep 2026, 10:45 AM', event: 'Attribution check completed: 0 confounding external factors identified' },
        { time: '02 Oct 2026, 11:15 AM', event: 'Final Audit Certificate REP-PMC-M2-2026-904 certified and locked' },
        { time: '02 Oct 2026, 11:15 AM', event: 'Payment sanction notice dispatched to PMC Officer Dr. Sunita Verma' }
      ]
    },
    {
      id: 'REP-DEL-M1-2026-812',
      pilotId: 'chal-3',
      pilotTitle: 'Edge-AI Adaptive Traffic Control for Emergency Vehicle Corridors',
      department: 'Directorate of Traffic Management, Delhi',
      startup: 'EdgeSense Robotics',
      milestone: 'Milestone 1 (30% - ₹ 4,50,000)',
      targetKpi: 'Emergency Transit Delay ≤ 10 min',
      verifiedResult: '8.4 min',
      decision: 'Achieved',
      status: 'Locked',
      date: '14 Sep 2026',
      auditor: 'Prof. Anil Kapoor',
      organization: 'Independent Lab, IIT Delhi',
      auditTrail: [
        { time: '12 Aug 2026, 10:00 AM', event: 'Conflict Declaration filed with Delhi Traffic Directorate' },
        { time: '10 Sep 2026, 04:30 PM', event: 'Intersection camera telemetry analyzed' },
        { time: '14 Sep 2026, 03:00 PM', event: 'Audit Certificate REP-DEL-M1-2026-812 signed & archived' }
      ]
    }
  ],

  // Validator Messages
  messages: {
    conversations: [
      {
        id: 'conv-officer',
        partnerName: 'Dr. Sunita Verma',
        partnerRole: 'Department Officer',
        partnerOrg: 'Pune Municipal Corporation (PMC)',
        unreadCount: 0,
        lastMessage: 'Raw telemetry upload for Ward 12-13 has been approved from PMC servers.',
        lastTime: 'Yesterday, 4:20 PM'
      },
      {
        id: 'conv-startup',
        partnerName: 'Aarav Sharma',
        partnerRole: 'Startup Founder',
        partnerOrg: 'CleanRoute Technologies (ERAER)',
        unreadCount: 0,
        lastMessage: 'We have re-synced the GPS telemetry with standard UTC+5:30 timestamps.',
        lastTime: '2 days ago'
      }
    ],
    threads: {
      'conv-officer': [
        {
          id: 'msg-1',
          sender: 'Dr. Sunita Verma',
          isMe: false,
          time: '28 Sep 2026, 10:15 AM',
          text: 'Hello Prof. Kapoor. We have uploaded the baseline dispatch sheets and citizen grievance logs for Ward 12 and 13. Please verify whether the raw logs match PMC server checksums.'
        },
        {
          id: 'msg-2',
          sender: 'Prof. Anil Kapoor',
          isMe: true,
          time: '28 Sep 2026, 11:45 AM',
          text: 'Acknowledged, Dr. Verma. The SHA-256 hashes for Complaint_records.csv have been matched with your municipal manifest. We are conducting the telemetry integrity audit now.'
        },
        {
          id: 'msg-3',
          sender: 'Dr. Sunita Verma',
          isMe: false,
          time: 'Yesterday, 4:20 PM',
          text: 'Raw telemetry upload for Ward 12-13 has been approved from PMC servers. Once your signed certificate is submitted, the escrow release order for Milestone 2 will be processed automatically.'
        }
      ],
      'conv-startup': [
        {
          id: 'msg-4',
          sender: 'Aarav Sharma',
          isMe: false,
          time: '29 Sep 2026, 02:30 PM',
          text: 'Prof. Kapoor, we noticed the vehicle sensor telemetry file initially had mixed epoch timestamps. We have normalized all records to UTC+5:30 as requested by the testbed audit protocol.'
        },
        {
          id: 'msg-5',
          sender: 'Prof. Anil Kapoor',
          isMe: true,
          time: '29 Sep 2026, 03:10 PM',
          text: 'Received. Please note as an Independent Validator under SIH26136 regulations, all raw data is evaluated independently without negotiation. The updated checksum d4e5f67a is confirmed.'
        },
        {
          id: 'msg-6',
          sender: 'Aarav Sharma',
          isMe: false,
          time: '2 days ago',
          text: 'We have re-synced the GPS telemetry with standard UTC+5:30 timestamps.'
        }
      ]
    }
  }
};

export const getSharedValidationState = () => {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STATE));
      return DEFAULT_STATE;
    }
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STATE, ...parsed };
  } catch (err) {
    console.error('Error loading validation store:', err);
    return DEFAULT_STATE;
  }
};

export const saveSharedValidationState = (updater) => {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const current = getSharedValidationState();
    const updated = typeof updater === 'function' ? updater(current) : { ...current, ...updater };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('sih-validation-update', { detail: updated }));
    return updated;
  } catch (err) {
    console.error('Error saving validation store:', err);
    return DEFAULT_STATE;
  }
};

// Helper: Release milestone payment by Department Officer
export const releaseMilestonePayment = (milestoneId = 'ms-2', sanctionNote = '') => {
  return saveSharedValidationState(prev => {
    const updatedMilestones = prev.milestones.map(m => {
      if (m.id === milestoneId) {
        return {
          ...m,
          status: 'paid',
          statusLabel: 'Paid / Released',
          releasedAt: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          authCode: 'ESCROW-PMC-M2-REL-8910',
          sanctionNote: sanctionNote || 'Approved and released by Department Officer Dr. Sunita Verma under GFR Rule 194.'
        };
      }
      return m;
    });

    const newReportAudit = [
      ...(prev.reports?.[0]?.auditTrail || []),
      {
        time: 'Just now',
        event: 'Milestone 2 payment (₹ 5,00,000) sanctioned and released by PMC Officer Dr. Sunita Verma'
      }
    ];

    const updatedReports = prev.reports.map((r, idx) => {
      if (idx === 0) {
        return { ...r, auditTrail: newReportAudit };
      }
      return r;
    });

    return {
      ...prev,
      milestones: updatedMilestones,
      reports: updatedReports
    };
  });
};

// Helper: Hold milestone payment by Department Officer with reason
export const holdMilestonePayment = (milestoneId = 'ms-2', reason = '') => {
  return saveSharedValidationState(prev => {
    const updatedMilestones = prev.milestones.map(m => {
      if (m.id === milestoneId) {
        return {
          ...m,
          status: 'on_hold',
          statusLabel: 'On Hold by Officer',
          holdReason: reason || 'Officer requested clarification on testbed telemetry logs.'
        };
      }
      return m;
    });
    return {
      ...prev,
      milestones: updatedMilestones
    };
  });
};

// Helper: Calculate Auto-Suggested Decision
export const computeSuggestedDecision = (verifiedNum, targetNum = 25.0, baselineNum = 40.0) => {
  if (isNaN(verifiedNum)) return 'Pending';
  // Target is <= 25.0%
  if (verifiedNum <= targetNum) {
    return 'Achieved';
  }
  // 50% improvement threshold = baseline - (baseline - target)/2 = 40 - 7.5 = 32.5%
  const halfGap = baselineNum - (baselineNum - targetNum) / 2;
  if (verifiedNum <= halfGap) {
    return 'Partially Achieved';
  }
  return 'Not Achieved';
};

// Helper: Format currency in Indian format
export const formatIndianCurrency = (num) => {
  if (!num && num !== 0) return '₹ 0';
  return '₹ ' + Number(num).toLocaleString('en-IN');
};
