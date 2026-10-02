// frontend/src/services/sharedExpertStore.js
// Centralized shared state store for the Expert Panel persona (SIH26136)

const STORAGE_KEY = 'sih_expert_store_v1';

const DEFAULT_STATE = {
  // Empanelled Expert Profile
  expertId: 'usr-expert-1',
  expertName: 'Dr. Meera Iyer',
  expertRole: 'Expert Panel Member',
  expertOrg: 'Urban Systems, IIT Bombay',
  empanelmentId: 'EXP-MOHUA-2024-918',
  expertise: ['Urban Infrastructure', 'AI/ML', 'Cyber Security', 'Smart Logistics', 'Sensor Telematics'],

  // Assigned Random Panel Metadata
  panelAssignedDate: '14 Sep 2026',
  panelPoolSize: 10,
  assignedPanelMembers: [
    { name: 'Dr. Meera Iyer', org: 'IIT Bombay', role: 'Chairperson' },
    { name: 'Prof. Sandeep Joshi', org: 'IIT Madras', role: 'Member' },
    { name: 'Dr. Kavita Narang', org: 'IISc Bangalore', role: 'Member' }
  ],

  // Conflict Declarations per Challenge
  conflicts: {
    'pilot-1': {
      isDeclared: true,
      hasConflict: false,
      signedBy: 'Dr. Meera Iyer',
      signDate: '15 Sep 2026',
      signature: 'Dr. Meera Iyer',
      answers: {
        shareholding: 'no',
        employment: 'no',
        relationship: 'no',
        funding: 'no'
      },
      statusText: 'No conflict declared. Cleared to evaluate.'
    },
    'chal-2': {
      isDeclared: false,
      hasConflict: false,
      signedBy: null,
      signDate: null,
      statusText: 'Declaration Pending'
    },
    'chal-3': {
      isDeclared: true,
      hasConflict: false,
      signedBy: 'Dr. Meera Iyer',
      signDate: '10 Aug 2026',
      statusText: 'Cleared'
    }
  },

  // Blind Applicants for Municipal Solid Waste Challenge (#chal-1 / #pilot-1)
  blindApplicants: {
    'app-a': {
      id: 'app-a',
      blindCode: 'Applicant A',
      status: 'locked', // 'not_scored' | 'draft' | 'locked'
      actualStartupName: 'CleanRoute Technologies (ERAER)', // Sealed until all panel members lock
      dpiitStatus: 'DPIIT Recognised (#DIPP-84920)',
      approachSummary: 'Dynamic graph-theoretic route optimization combining edge-LiDAR bin volume sensors with municipal dispatch schedule telemetry.',
      techArchitecture: 'Edge inference on NVIDIA Jetson embedded on 25 collection vehicles. Hybrid MQTT + cellular uplink to Pune Smart City central NOC.',
      trlLevel: 7,
      dataHandlingPlan: 'End-to-end AES-256 encrypted telemetry logs with strict isolated tenant data namespaces under Indian DPDP Act 2023.',
      securityMeasures: 'Role-based access control (RBAC), signed firmware over-the-air updates, zero plain-text GPS telemetry storage.',
      costBreakdown: 'Hardware & Sensor Telemetry: ₹ 4,50,000 • Software & NOC Integration: ₹ 5,00,000 • Field Ops & Testing: ₹ 3,00,000 (Total ₹ 12,50,000)',
      capabilityProof: 'Prior municipal pilot with Pimpri-Chinchwad Smart City (15 vehicles, 28% delay reduction). ISO 27001 certified development lab.',
      teamStrength: '14 Core Engineers (4 PhDs in Operations Research, 6 Embedded Systems Developers, 4 DevOps)',
      scores: {
        innovation: 9, // 20%
        feasibility: 9, // 25%
        security: 8, // 20%
        cost: 9, // 15%
        capability: 9 // 20%
      },
      justifications: {
        innovation: 'Novel combination of volumetric optical fill telemetry with real-time heuristic routing.',
        feasibility: 'Mature TRL 7 stack with proven edge gateway integration on commercial waste chassis.',
        security: 'Rigorous data privacy architecture compliant with Digital Personal Data Protection standards.',
        cost: 'Well-budgeted SBoT milestone structure with transparent hardware allocation.',
        capability: 'Validated pilot evidence and strong technical team substituting legacy turnover requirements.'
      },
      weightedTotal: 88.5,
      isRedFlagged: false,
      redFlagReason: '',
      lockedAt: '01 Oct 2026, 04:30 PM'
    },
    'app-b': {
      id: 'app-b',
      blindCode: 'Applicant B',
      status: 'locked',
      actualStartupName: 'EcoTrack Robotics',
      dpiitStatus: 'DPIIT Recognised (#DIPP-71044)',
      approachSummary: 'RFID tag tracking on residential municipal bins with fixed checkpoint timestamp scanning.',
      techArchitecture: 'Passive HF RFID tags scanned via handheld barcode terminals. Daily batch sync over Wi-Fi at municipal depot.',
      trlLevel: 5,
      dataHandlingPlan: 'Depot database synchronization with manual CSV export.',
      securityMeasures: 'Standard password-protected depot terminal access.',
      costBreakdown: 'RFID tags & Handheld Scanners: ₹ 6,00,000 • Portal License: ₹ 4,00,000 • Training: ₹ 2,50,000',
      capabilityProof: 'University campus pilot with 50 residential collection points.',
      teamStrength: '6 General Software Developers',
      scores: {
        innovation: 5,
        feasibility: 6,
        security: 5,
        cost: 6,
        capability: 5
      },
      justifications: {
        innovation: 'Standard passive RFID architecture lacking dynamic real-time traffic or delay avoidance.',
        feasibility: 'Dependent on manual driver scanning at every bin, high operational failure risk.',
        security: 'Unencrypted batch transmission vulnerable to depot terminal interception.',
        cost: 'High hardware tag replacement recurring cost.',
        capability: 'Limited to small enclosed campus testbed without real municipal scale.'
      },
      weightedTotal: 54.0,
      isRedFlagged: false,
      redFlagReason: '',
      lockedAt: '01 Oct 2026, 05:15 PM'
    },
    'app-c': {
      id: 'app-c',
      blindCode: 'Applicant C',
      status: 'draft',
      actualStartupName: 'GeoLogix Smart Fleet',
      dpiitStatus: 'DPIIT Recognised (#DIPP-93210)',
      approachSummary: 'Smartphone GPS application installed on sanitation drivers\' personal mobile devices with speed tracking.',
      techArchitecture: 'Flutter mobile application streaming raw GPS coordinates to cloud MongoDB backend.',
      trlLevel: 6,
      dataHandlingPlan: 'Cloud hosted MongoDB with public REST APIs.',
      securityMeasures: 'Bearer token authentication; cellular data dependency.',
      costBreakdown: 'Mobile app deployment: ₹ 3,00,000 • Cloud infrastructure: ₹ 4,00,000 • Margin: ₹ 5,50,000',
      capabilityProof: 'Courier delivery tracking app deployed for private logistics firm.',
      teamStrength: '8 Mobile App Developers',
      scores: {
        innovation: 6,
        feasibility: 6,
        security: 4,
        cost: 6,
        capability: 6
      },
      justifications: {
        innovation: 'Generic smartphone GPS tracking with no bin fill level or specialized municipal telemetry.',
        feasibility: 'Subject to driver phone battery drain, GPS spoofing, and intermittent device switching.',
        security: 'Cloud REST API endpoints lack adequate intrusion detection and municipal firewall integration.',
        cost: 'Overpriced cloud margin relative to basic mobile application architecture.',
        capability: 'Private courier app background has minimal municipal solid waste operational synergy.'
      },
      weightedTotal: 55.5,
      isRedFlagged: true,
      redFlagReason: 'Driver phone tracking introduces unacceptable data manipulation and route compliance risks.',
      lockedAt: null
    }
  },

  // Panel Consensus Aggregates (Seeded with other 2 panel members' scores)
  panelConsensus: {
    isConsensusUnlocked: true,
    totalPanelMembers: 3,
    membersLocked: 3,
    applicants: [
      {
        blindCode: 'Applicant A',
        expertScores: [88.5, 91.0, 87.5],
        averageScore: 89.0,
        rank: 1,
        spread: 3.5, // 91 - 87.5
        hasHighDisagreement: false,
        status: 'Rank 1 — Recommended for Pilot Award'
      },
      {
        blindCode: 'Applicant C',
        expertScores: [55.5, 62.0, 58.0],
        averageScore: 58.5,
        rank: 2,
        spread: 6.5,
        hasHighDisagreement: false,
        status: 'Rank 2'
      },
      {
        blindCode: 'Applicant B',
        expertScores: [54.0, 52.0, 50.0],
        averageScore: 52.0,
        rank: 3,
        spread: 4.0,
        hasHighDisagreement: false,
        status: 'Rank 3'
      }
    ]
  },

  // Cross-Domain Approvals
  crossDomainRequests: [
    {
      id: 'req-cd-1',
      challengeId: 'chal-2',
      challengeTitle: 'AI Acoustic Leakage Detection in Urban Water Distribution Pipelines',
      challengeDomain: 'Water & Utilities',
      state: 'Karnataka',
      procuringAuthority: 'Bengaluru Water Supply & Sewerage Board (BWSSB)',
      leadStartup: 'ERAER (CleanRoute Technologies Pvt Ltd)',
      leadDomain: 'Smart Cities & CleanTech',
      partnerStartup: 'HydroSense IoT Solutions Pvt Ltd',
      partnerDomain: 'Water & Utilities',
      partnerDpiit: 'DIPP-49201',
      workSplit: '55% GIS telemetry, route scheduling & edge analytics (ERAER) • 45% Sub-surface acoustic hydrophone array & leak acoustics (HydroSense)',
      supportingProof: 'NABL hydrophone calibration certificate, BWSSB pilot feasibility memo, joint consortium agreement signed on 18 Sep 2026.',
      checklist: {
        dpiitRecognised: true,
        domainCapabilityProof: true,
        workSplitClear: true,
        ipDataDefined: true,
        noConflictBetweenPartners: true
      },
      status: 'pending', // 'pending' | 'approved' | 'changes_requested' | 'rejected'
      expertComments: '',
      reviewedBy: null,
      reviewedAt: null
    }
  ],

  // Scoring History
  history: [
    {
      challengeId: 'chal-3',
      title: 'Edge-AI Adaptive Traffic Control for Emergency Vehicle Corridors',
      department: 'Directorate of Traffic Management, Delhi',
      applicantsCount: 4,
      myScore: 84.5,
      dateLocked: '12 Aug 2026',
      status: 'Scores Sealed & Certified',
      auditEntries: [
        { time: '10 Aug 2026, 09:30 AM', event: 'Conflict Declaration executed by Dr. Meera Iyer (No conflict found)' },
        { time: '11 Aug 2026, 02:15 PM', event: 'Blind proposals decrypted and evaluated' },
        { time: '11 Aug 2026, 04:45 PM', event: 'Draft scores saved with weighted criteria breakdown' },
        { time: '12 Aug 2026, 11:20 AM', event: 'Final scores locked and cryptographic signature stored in audit ledger' }
      ]
    }
  ],

  // Expert Messages
  messages: {
    conversations: [
      {
        id: 'conv-coord',
        partnerName: 'Prof. K. Ramanathan',
        partnerRole: 'Panel Coordinator',
        partnerOrg: 'Empanelment Oversight Committee, MoHUA',
        unreadCount: 0,
        lastMessage: 'All 3 panel members have signed declarations for Pune Waste Management challenge.',
        lastTime: 'Yesterday, 3:15 PM'
      },
      {
        id: 'conv-officer',
        partnerName: 'Dr. Sunita Verma',
        partnerRole: 'Department Officer',
        partnerOrg: 'Pune Municipal Corporation (PMC)',
        unreadCount: 0,
        lastMessage: 'Technical specifications for Ward 12 & 13 collection routes have been updated.',
        lastTime: '3 days ago'
      }
    ],
    threads: {
      'conv-coord': [
        {
          id: 'm1',
          sender: 'Prof. K. Ramanathan',
          isMe: false,
          time: '28 Sep 2026, 11:00 AM',
          text: 'Dear Dr. Iyer, you have been selected at random from the MoHUA empanelled expert pool for Pune Municipal Waste Route Optimization (#chal-1).'
        },
        {
          id: 'm2',
          sender: 'Dr. Meera Iyer',
          isMe: true,
          time: '28 Sep 2026, 11:45 AM',
          text: 'Received and confirmed. I have reviewed the applicant blind proposals and completed conflict clearance.'
        },
        {
          id: 'm3',
          sender: 'Prof. K. Ramanathan',
          isMe: false,
          time: 'Yesterday, 3:15 PM',
          text: 'All 3 panel members have signed declarations for Pune Waste Management challenge. Please lock your scoring rubric once finalized.'
        }
      ],
      'conv-officer': [
        {
          id: 'm4',
          sender: 'Dr. Sunita Verma',
          isMe: false,
          time: '26 Sep 2026, 02:00 PM',
          text: 'Welcome to the Pune Smart City outcome procurement panel, Dr. Iyer. We look forward to the independent expert evaluation.'
        },
        {
          id: 'm5',
          sender: 'Dr. Meera Iyer',
          isMe: true,
          time: '26 Sep 2026, 02:40 PM',
          text: 'Thank you Dr. Verma. Please note as an Expert Panel Member, applicant identities remain strictly blind during evaluation.'
        },
        {
          id: 'm6',
          sender: 'Dr. Sunita Verma',
          isMe: false,
          time: '3 days ago',
          text: 'Technical specifications for Ward 12 & 13 collection routes have been updated.'
        }
      ]
    }
  }
};

export const getSharedExpertState = () => {
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
    console.error('Error loading expert store:', err);
    return DEFAULT_STATE;
  }
};

export const saveSharedExpertState = (updater) => {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const current = getSharedExpertState();
    const updated = typeof updater === 'function' ? updater(current) : { ...current, ...updater };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('sih-expert-update', { detail: updated }));
    return updated;
  } catch (err) {
    console.error('Error saving expert store:', err);
    return DEFAULT_STATE;
  }
};

// Calculate Weighted Score (Total 100)
// Innovation (20%), Feasibility (25%), Security (20%), Cost (15%), Capability (20%)
export const calculateWeightedTotal = (scores) => {
  const inn = (Number(scores?.innovation) || 0) * 10 * 0.20;
  const fea = (Number(scores?.feasibility) || 0) * 10 * 0.25;
  const sec = (Number(scores?.security) || 0) * 10 * 0.20;
  const cos = (Number(scores?.cost) || 0) * 10 * 0.15;
  const cap = (Number(scores?.capability) || 0) * 10 * 0.20;
  return Number((inn + fea + sec + cos + cap).toFixed(1));
};
