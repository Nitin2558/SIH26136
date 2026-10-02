const { getDB, resetDB, generateId } = require('./db/store');

function seedDatabase() {
  console.log('[Seed] Generating comprehensive SIH26136 Startup Public Procurement dataset...');

  // 1. Users (Department Officer, Startup Founder, Expert Evaluator, Independent Validator, Admin)
  const users = [
    {
      id: 'usr-govt-1',
      name: 'Dr. Sunita Verma',
      email: 'sunita.verma@gov.in',
      phone: '9820112233',
      role: 'government',
      departmentName: 'Department of Urban Infrastructure & Smart Cities Mission',
      locationState: 'Maharashtra',
      designation: 'Director of Urban Innovation',
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr-startup-1',
      name: 'Priya Patel',
      email: 'priya@cleanroute.tech',
      phone: '9820223344',
      role: 'startup',
      startupName: 'CleanRoute Technologies',
      dpiitNumber: 'DIPP-84920',
      sector: 'Smart Cities & CleanTech',
      locationState: 'Maharashtra',
      designation: 'Founder & CEO',
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr-expert-1',
      name: 'Dr. K. R. Ramanujan',
      email: 'ramanujan@expert-panel.gov.in',
      phone: '9820334455',
      role: 'expert',
      orgName: 'National Innovation & Public Procurement Review Panel',
      expertise: 'Geospatial AI & Municipal Logistics Systems',
      locationState: 'Delhi',
      designation: 'Senior Technical Evaluator',
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr-validator-1',
      name: 'Quality & Standards Certification Bureau',
      email: 'audit@cert-bureau.gov.in',
      phone: '9820445566',
      role: 'validator',
      orgName: 'TechAudit & Standards Certification Bureau',
      accreditation: 'NABL & ISO/IEC 17025 Certified Third-Party Testing Agency',
      locationState: 'Karnataka',
      designation: 'Independent Pilot Validator',
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr-admin-1',
      name: 'System Admin',
      email: 'admin@samadhansetu.gov.in',
      phone: '9820556677',
      role: 'admin',
      orgName: 'Smart India Hackathon Innovation Procurement Mission',
      locationState: 'Delhi',
      designation: 'Platform Administrator',
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr-startup-2',
      name: 'Aman Verma',
      email: 'aman@hydrosense.tech',
      phone: '9820667788',
      role: 'startup',
      startupName: 'HydroSense Acoustics',
      startupId: 'start-2',
      dpiitNumber: 'DIPP-91042',
      sector: 'Water Infrastructure',
      locationState: 'Karnataka',
      designation: 'Founder & CTO',
      createdAt: new Date().toISOString()
    }
  ];

  // 2. Startups Catalog & Profiles
  const startups = [
    {
      id: 'start-1',
      userId: 'usr-startup-1',
      name: 'CleanRoute Technologies',
      founderName: 'Priya Patel',
      founderEmail: 'priya@cleanroute.tech',
      dpiitNumber: 'DIPP-84920',
      incorporationYear: 2023,
      teamSize: 14,
      sector: 'Smart Cities & CleanTech',
      domains: ['Smart Cities & CleanTech', 'Waste Logistics', 'IoT & Sensor Telemetry'],
      solutionName: 'Dynamic AI Municipal Route & Waste Telemetry System',
      description: 'Real-time GPS + Fill-level sensor optimization reducing garbage truck fuel consumption, missed pickups, and route delays for smart municipalities.',
      solutionSummary: 'Real-time GPS + Fill-level sensor optimization reducing garbage truck fuel consumption, missed pickups, and route delays.',
      trlLevel: 7, // TRL 7 = System prototype demonstration in operational environment
      website: 'https://cleanroute.demo.sih.gov.in',
      deckUrl: 'https://cleanroute.demo.sih.gov.in/pitch-deck.pdf',
      verifiedDpiit: true,
      certifications: ['ISO 27001 (Data Security)', 'DPIIT Startup India Certificate', 'NABL Sensor Calibrated'],
      keyCapabilities: ['Edge IoT Telemetry', 'Dynamic TSP Routing AI', 'Municipal ERP Webhooks', 'Automated Driver Dispatch Navigation'],
      workforceSkills: ['Geospatial Fleet AI', 'Embedded LoRaWAN Firmware', 'Full-Stack React/Node GIS', 'Municipal Integration', 'Edge Telematics'],
      achievements: [
        'Pune Municipal Corporation Pilot Phase 1 completed (22.0% delay achieved)',
        'NABL Calibrated IoT Bin Sensor certified with IP67 rating',
        'Winner Maharashtra Urban Tech Innovation Sandbox 2025'
      ],
      pastProjects: [
        'Ward 4 Smart Bin Route Optimization (45 vehicles in testbed)',
        'Thane Municipal Solid Waste Telemetry Study'
      ]
    },
    {
      id: 'start-2',
      userId: 'usr-startup-2',
      name: 'HydroSense Acoustics',
      founderName: 'Aman Verma',
      founderEmail: 'aman@hydrosense.tech',
      dpiitNumber: 'DIPP-91042',
      incorporationYear: 2022,
      teamSize: 9,
      sector: 'Water Infrastructure',
      domains: ['Water Infrastructure', 'Acoustic Sensors', 'Subsurface Pipeline Telematics'],
      solutionName: 'Acoustic Pipe-Sensor Leak Pinpointing AI',
      description: 'Ultra-sensitive vibration and hydrophone acoustic sensors detecting underground pipeline leaks with 0.5m precision, minimizing non-revenue water loss.',
      solutionSummary: 'Ultra-sensitive vibration and hydrophone acoustic sensors detecting underground pipeline leaks with 0.5m precision.',
      trlLevel: 6,
      website: 'https://hydrosense.demo.sih.gov.in',
      deckUrl: 'https://hydrosense.demo.sih.gov.in/deck.pdf',
      verifiedDpiit: true,
      certifications: ['DPIIT Startup India Certificate', 'CPCB Compliant', 'ISO 9001 Quality Assured'],
      keyCapabilities: ['Acoustic Wavelet AI', 'Battery-operated LoRaWAN Sensors', 'GIS Pipeline Overlay'],
      workforceSkills: ['Acoustic Wavelet Processing', 'LoRaWAN Hydrophone Telemetry', 'Underground GIS Mapping', 'Hydraulic Modeling'],
      achievements: [
        'BWSSB Feasibility Study 2025 (12km corridor tested)',
        'Accredited Hydrophone Sensor Benchmarking by CPRI'
      ],
      pastProjects: [
        'Bengaluru East Pipeline Acoustic Leak Pilot (8 fractures isolated)',
        'Mysuru Feeder Main Non-Invasive Logging Test'
      ]
    },
    {
      id: 'start-3',
      userId: 'usr-startup-3',
      name: 'UrbanFlow Computer Vision',
      founderName: 'Neha Gupta',
      founderEmail: 'neha@urbanflow.ai',
      dpiitNumber: 'DIPP-78311',
      incorporationYear: 2023,
      teamSize: 12,
      sector: 'Mobility & Public Safety',
      domains: ['Mobility & Public Safety', 'Traffic AI', 'Computer Vision Edge Systems'],
      solutionName: 'Edge-AI Adaptive Emergency Corridor Signal Switcher',
      description: 'Camera-based traffic light controllers creating dynamic green-wave corridors for emergency ambulances with under 150ms edge inference.',
      solutionSummary: 'Camera-based traffic light controllers creating dynamic green-wave corridors for emergency ambulances.',
      trlLevel: 7,
      website: 'https://urbanflow.demo.sih.gov.in',
      deckUrl: 'https://urbanflow.demo.sih.gov.in/deck.pdf',
      verifiedDpiit: true,
      certifications: ['DPIIT Startup India Certificate', 'STQC Certified Video Analytics'],
      keyCapabilities: ['YOLOv9 Emergency Vehicle Detection', 'NTCIP Signal Controller Interface', 'Zero-Latency Edge Box'],
      workforceSkills: ['YOLOv9 Real-Time Video Inferencing', 'NTCIP Traffic Controller Protocols', 'Edge CUDA Optimization', 'Emergency Vehicle Siren Detection'],
      achievements: [
        'STQC Video Analytics Certified for Public Deployments',
        'Delhi Police Traffic Innovation Award 2025'
      ],
      pastProjects: [
        'AIIMS-Safdarjung Emergency Green Wave Corridor Trial',
        'Jaipur Smart Signal Deployment'
      ]
    },
    {
      id: 'start-4',
      userId: 'usr-startup-4',
      name: 'UrjaGrid Remote Power',
      founderName: 'Vikram Shah',
      founderEmail: 'vikram@urjagrid.in',
      dpiitNumber: 'DIPP-65239',
      incorporationYear: 2021,
      teamSize: 18,
      sector: 'Renewable Energy & Public Health',
      domains: ['Renewable Energy & Healthcare', 'Remote Microgrids', 'Cold-Climate Energy Storage'],
      solutionName: 'Modular High-Altitude Solar Telemedicine Microgrid',
      description: 'Containerized LiFePO4 solar microgrid providing 99.9% power reliability to off-grid rural and mountain clinics under harsh sub-zero conditions.',
      solutionSummary: 'Containerized LiFePO4 solar microgrid providing 99.9% power reliability to off-grid rural and mountain clinics.',
      trlLevel: 8,
      website: 'https://urjagrid.demo.sih.gov.in',
      deckUrl: 'https://urjagrid.demo.sih.gov.in/deck.pdf',
      verifiedDpiit: true,
      certifications: ['MNRE Empaneled', 'DPIIT Startup India Certificate', 'IEC 62133 Battery Safety'],
      keyCapabilities: ['Remote Cloud Telemetry', 'Automated Hybrid Inverter Control', 'Zero Cold-Start Lithium Storage'],
      workforceSkills: ['LiFePO4 Battery Management Systems (BMS)', 'Extreme Weather Thermal Regulation', 'Remote SCADA & Cloud Telemetry', 'Hybrid Solar Inverter Integration'],
      achievements: [
        'MNRE Empaneled Clean Energy Provider',
        'IEC 62133 Certified High-Altitude Battery Enclosure',
        'Continuous 24x7 power validated across 12 Himalayan PHCs'
      ],
      pastProjects: [
        'Kinnaur Mountain PHC 24x7 Solar Microgrid Pilot',
        'Spiti Valley Cold-Chain Vaccine Power Unit'
      ]
    },
    {
      id: 'start-5',
      userId: 'usr-startup-5',
      name: 'LightLoop Innovations',
      founderName: 'Rajesh Nair',
      founderEmail: 'rajesh@lightloop.tech',
      dpiitNumber: 'DIPP-66120',
      incorporationYear: 2023,
      teamSize: 11,
      sector: 'Smart Cities & CleanTech',
      domains: ['Smart Cities', 'Municipal Lighting', 'IoT Sensors'],
      solutionName: 'Automated Photocell & Fault Reporting Streetlight Mesh',
      description: 'Mesh network sensors detecting faulty streetlights and auto-dispatching repair tickets to municipal crews.',
      solutionSummary: 'Mesh network sensors detecting faulty streetlights and auto-dispatching repair tickets.',
      trlLevel: 6,
      website: 'https://lightloop.demo.sih.gov.in',
      deckUrl: 'https://lightloop.demo.sih.gov.in/deck.pdf',
      verifiedDpiit: true,
      certifications: ['DPIIT Startup India Certificate', 'BEE Energy Star Rated'],
      keyCapabilities: ['LoRaWAN Streetlight Mesh', 'Photocell LUX Measurement', 'Automatic Crew Dispatch'],
      workforceSkills: ['Mesh RF Networking', 'Embedded Firmware', 'Municipal Work Order ERP', 'Cloud Telemetry'],
      achievements: ['Smart Cities Mission Sandbox 2025 finalist'],
      pastProjects: ['Indore Ward 2 Streetlight Sensor Feasibility']
    },
    {
      id: 'start-6',
      userId: 'usr-startup-6',
      name: 'RoadWatch AI Technologies',
      founderName: 'Ananya Sen',
      founderEmail: 'ananya@roadwatch.ai',
      dpiitNumber: 'DIPP-54890',
      incorporationYear: 2022,
      teamSize: 8,
      sector: 'Roads & Infrastructure',
      domains: ['Roads', 'Computer Vision', 'Municipal Maintenance'],
      solutionName: 'Mobile Phone Mounted Pothole AI Mapping',
      description: 'Smartphone accelerometer and camera app mounted on municipal garbage trucks to map potholes in real-time.',
      solutionSummary: 'Smartphone accelerometer and camera app mounted on municipal garbage trucks to map potholes.',
      trlLevel: 5,
      website: 'https://roadwatch.demo.sih.gov.in',
      deckUrl: 'https://roadwatch.demo.sih.gov.in/deck.pdf',
      verifiedDpiit: true,
      certifications: ['DPIIT Startup India Certificate'],
      keyCapabilities: ['Accelerometer Pothole Detection', 'GIS Heatmaps', 'Citizen Complaint Matching'],
      workforceSkills: ['Computer Vision', 'Mobile Sensing', 'GIS Mapping'],
      achievements: ['Jaipur Municipal Corporation Pilot Phase 1'],
      pastProjects: ['Jaipur Pothole Survey 2025']
    }
  ];

  // 3. Outcome-Based Department Challenges
  const challenges = [
    {
      id: 'chal-1',
      title: 'Municipal Solid Waste Collection Route Optimization & Delay Reduction',
      departmentName: 'Department of Urban Infrastructure & Smart Cities Mission',
      postedBy: 'Dr. Sunita Verma',
      officerId: 'usr-govt-1',
      locationState: 'Maharashtra',
      locationDistrict: 'Pune',
      sector: 'Smart Cities & CleanTech',
      status: 'pilot_active', // 'open' | 'evaluating' | 'pilot_active' | 'pilot_validated' | 'procured' | 'scaled'
      budgetAmount: 1250000, // ₹12,50,000 Pilot Grant / Sandbox Budget
      durationWeeks: 12,
      applicationDeadline: '2026-10-15',
      problemStatement: 'Pune Municipal Corporation manages 450+ waste collection vehicles across 15 wards. Daily traffic bottlenecks, unmonitored bin overflow, and static route sheets cause average pickup delays of 40%, generating citizen complaints and high diesel waste.',
      outcomeRequirement: 'Deploy an automated IoT sensor + dynamic routing solution across 2 test municipal wards to reduce average collection route delay from 40% to 25% or below, with verified daily dashboard telemetry.',
      baselineKpi: {
        metric: 'Average Waste Collection Route Delay',
        unit: '%',
        value: 40,
        description: '40% daily delay in municipal waste collection schedule measured against target morning timetable.'
      },
      targetKpi: {
        metric: 'Average Waste Collection Route Delay',
        unit: '%',
        value: 25,
        targetOperator: '<=',
        description: 'Reduce average daily collection route delay to 25% or lower across 45 collection vehicles in Wards 4 & 7.'
      },
      eligibilityRules: {
        dpiitRequired: true,
        minTrl: 5,
        noPriorTurnoverRestriction: true, // Fair startup rule: zero prior turnover lock
        noYearsOfExperienceBar: true,
        requiredCapabilities: ['Geospatial Fleet Routing', 'IoT Bin Telemetry or Mobile Driver Guidance', 'Data API for Municipal Integration']
      },
      supportingDocuments: [
        { name: 'Pune_Municipal_Ward_Route_Map.pdf', size: '2.4 MB' },
        { name: 'Baseline_Vehicle_Fuel_Log_2025-26.xlsx', size: '1.1 MB' }
      ],
      aiCoachEnhanced: true,
      selectedStartupId: 'start-1',
      selectedStartupName: 'CleanRoute Technologies',
      pilotId: 'pilot-1',
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
    },
    {
      id: 'chal-2',
      title: 'AI Acoustic Leakage Detection in Urban Water Distribution Pipelines',
      departmentName: 'Bengaluru Water Supply & Sewerage Board (BWSSB)',
      postedBy: 'Director (Water Supply Operations)',
      officerId: 'usr-govt-2',
      locationState: 'Karnataka',
      locationDistrict: 'Bengaluru',
      sector: 'Water Infrastructure',
      status: 'open',
      budgetAmount: 1800000,
      durationWeeks: 14,
      applicationDeadline: '2026-10-25',
      problemStatement: 'Aging underground trunk mains suffer heavy unrecorded water loss (NRW). Traditional excavation and manual listening sticks take days to locate deep subsurface fractures, wasting potable water.',
      outcomeRequirement: 'Deploy non-invasive acoustic sensors and machine learning to localize leaks within 1-meter accuracy and reduce non-revenue water loss from 35% baseline down to 15%.',
      baselineKpi: {
        metric: 'Non-Revenue Water Loss (NRW)',
        unit: '%',
        value: 35,
        description: '35% of pumped potable water is lost underground before reaching household meters.'
      },
      targetKpi: {
        metric: 'Non-Revenue Water Loss (NRW)',
        unit: '%',
        value: 15,
        targetOperator: '<=',
        description: 'Achieve NRW under 15% across pilot zone of 12km pipeline corridor.'
      },
      eligibilityRules: {
        dpiitRequired: true,
        minTrl: 5,
        noPriorTurnoverRestriction: true,
        noYearsOfExperienceBar: true,
        requiredCapabilities: ['Acoustic Signal Processing', 'Non-invasive clamp sensors', 'GIS Map Integration']
      },
      supportingDocuments: [
        { name: 'BWSSB_Pilot_Corridor_Schematic.pdf', size: '3.8 MB' }
      ],
      aiCoachEnhanced: true,
      selectedStartupId: 'start-2',
      selectedStartupName: 'AquaSense Labs',
      pilotId: 'pilot-2',
      createdAt: new Date(Date.now() - 12 * 86400000).toISOString()
    },
    {
      id: 'chal-3',
      title: 'Real-Time Edge-AI Adaptive Traffic Control for Emergency Vehicle Corridors',
      departmentName: 'Directorate of Traffic Management & Urban Mobility',
      postedBy: 'Special Commissioner of Police (Traffic)',
      officerId: 'usr-govt-1',
      locationState: 'Delhi',
      locationDistrict: 'Central Delhi',
      sector: 'Mobility & Public Safety',
      status: 'pilot_active',
      budgetAmount: 1600000,
      durationWeeks: 16,
      applicationDeadline: '2026-10-05',
      problemStatement: 'Ambulances and emergency response vehicles face an average transit delay of 18 minutes on critical hospital arterial junctions due to fixed-timer traffic signals.',
      outcomeRequirement: 'Demonstrate automated green-light preemption for verified emergency vehicles reducing transit delay from 18 mins to under 10 mins without causing gridlock on cross-streets.',
      baselineKpi: {
        metric: 'Emergency Corridor Transit Delay',
        unit: 'Minutes',
        value: 18,
        description: '18 minutes average transit delay for ambulances navigating the 6km AIIMS-Safdarjung corridor.'
      },
      targetKpi: {
        metric: 'Emergency Corridor Transit Delay',
        unit: 'Minutes',
        value: 10,
        targetOperator: '<=',
        description: 'Reduce transit delay to 10 minutes or under during peak morning & evening hours.'
      },
      eligibilityRules: {
        dpiitRequired: true,
        minTrl: 6,
        noPriorTurnoverRestriction: true,
        noYearsOfExperienceBar: true,
        requiredCapabilities: ['Computer Vision at Edge', 'Traffic Controller Interfacing', 'Encrypted Emergency Beacon Auth']
      },
      supportingDocuments: [
        { name: 'AIIMS_Corridor_Signal_Timing_Logs.pdf', size: '1.9 MB' }
      ],
      aiCoachEnhanced: true,
      selectedStartupId: 'start-3',
      selectedStartupName: 'SignalSetu',
      pilotId: 'pilot-3',
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString()
    },
    {
      id: 'chal-4',
      title: 'Solar-Powered Telemedicine Microgrid for Remote Mountain Health Centres',
      departmentName: 'Department of Health & Family Welfare',
      postedBy: 'Mission Director (NHM)',
      officerId: 'usr-govt-1',
      locationState: 'Himachal Pradesh',
      locationDistrict: 'Shimla & Kinnaur',
      sector: 'Renewable Energy & Healthcare',
      status: 'pilot_active',
      budgetAmount: 1000000,
      durationWeeks: 10,
      applicationDeadline: '2026-11-01',
      problemStatement: 'Sub-zero temperatures and frequent grid breakdowns cause up to 9 hours of daily blackout in high-altitude PHCs, disrupting vaccine refrigeration and telemedicine equipment.',
      outcomeRequirement: 'Deploy ruggedized hybrid solar-lithium microgrids achieving 99.5% continuous power uptime for vaccine storage and diagnostic equipment under -15°C conditions.',
      baselineKpi: {
        metric: 'Average Daily Power Outage at PHC',
        unit: 'Hours',
        value: 9,
        description: '9 hours daily power interruption causing vaccine spoilage risk and offline diagnostic consoles.'
      },
      targetKpi: {
        metric: 'Continuous Clean Power Uptime',
        unit: '%',
        value: 99.5,
        targetOperator: '>=',
        description: 'Achieve >= 99.5% uninterrupted power supply 24x7 throughout sub-zero winter pilot.'
      },
      eligibilityRules: {
        dpiitRequired: true,
        minTrl: 6,
        noPriorTurnoverRestriction: true,
        noYearsOfExperienceBar: true,
        requiredCapabilities: ['Cold-Climate Lithium Microgrids', 'Remote IoT Telemetry', 'Automatic Genset/Grid Bypass']
      },
      supportingDocuments: [
        { name: 'Himachal_PHC_Energy_Audit_Summary.pdf', size: '4.1 MB' }
      ],
      aiCoachEnhanced: true,
      selectedStartupId: 'start-4',
      selectedStartupName: 'SunHealth Power',
      pilotId: 'pilot-4',
      createdAt: new Date(Date.now() - 8 * 86400000).toISOString()
    },
    {
      id: 'chal-5',
      title: 'Broken streetlights take too long to fix',
      departmentName: 'Indore Municipal Corporation',
      postedBy: 'Executive Engineer (Electrical)',
      officerId: 'usr-govt-1',
      locationState: 'Madhya Pradesh',
      locationDistrict: 'Indore',
      sector: 'Smart Cities & CleanTech',
      status: 'evaluating',
      budgetAmount: 800000,
      durationWeeks: 10,
      applicationDeadline: '2026-10-12',
      problemStatement: 'Citizen complaints about broken streetlights take an average of 6 days to fix due to slow manual tracking and unoptimized field crews.',
      outcomeRequirement: 'Automate fault detection and reduce resolution turnaround time from 6 days to 2 days or fewer.',
      baselineKpi: {
        metric: 'Streetlight Repair Turnaround Time',
        unit: 'Days',
        value: 6,
        description: '6 days average turnaround from citizen report to restoration.'
      },
      targetKpi: {
        metric: 'Streetlight Repair Turnaround Time',
        unit: 'Days',
        value: 2,
        targetOperator: '<=',
        description: 'Restore lights in 2 days or fewer.'
      },
      eligibilityRules: {
        dpiitRequired: true,
        minTrl: 5,
        noPriorTurnoverRestriction: true,
        noYearsOfExperienceBar: true,
        requiredCapabilities: ['IoT Lighting Sensors', 'Automated Dispatch']
      },
      supportingDocuments: [
        { name: 'Indore_Streetlight_Complaint_Logs.pdf', size: '1.2 MB' }
      ],
      aiCoachEnhanced: true,
      createdAt: new Date(Date.now() - 14 * 86400000).toISOString()
    },
    {
      id: 'chal-6',
      title: 'Pothole complaints are fixed too slowly',
      departmentName: 'Jaipur Municipal Corporation',
      postedBy: 'Chief Engineer (Roads)',
      officerId: 'usr-govt-1',
      locationState: 'Rajasthan',
      locationDistrict: 'Jaipur',
      sector: 'Roads & Infrastructure',
      status: 'stopped',
      budgetAmount: 700000,
      durationWeeks: 8,
      applicationDeadline: '2026-08-15',
      problemStatement: 'Monsoon road damage takes 30 days on average to repair, causing traffic disruption and safety hazards.',
      outcomeRequirement: 'Map and prioritize repair crews to reduce average fix turnaround from 30 days to 10 days.',
      baselineKpi: {
        metric: 'Pothole Repair Turnaround Time',
        unit: 'Days',
        value: 30,
        description: '30 days average fix time during monsoon.'
      },
      targetKpi: {
        metric: 'Pothole Repair Turnaround Time',
        unit: 'Days',
        value: 10,
        targetOperator: '<=',
        description: '10 days or fewer.'
      },
      eligibilityRules: {
        dpiitRequired: true,
        minTrl: 5,
        noPriorTurnoverRestriction: true,
        noYearsOfExperienceBar: true,
        requiredCapabilities: ['Road AI', 'GIS Mapping']
      },
      supportingDocuments: [
        { name: 'Jaipur_Pothole_Audit_Data.pdf', size: '2.1 MB' }
      ],
      aiCoachEnhanced: true,
      selectedStartupId: 'start-6',
      selectedStartupName: 'RoadWatch AI Technologies',
      pilotId: 'pilot-6',
      createdAt: new Date(Date.now() - 60 * 86400000).toISOString()
    }
  ];

  // 4. Startup Applications & Proposals
  const applications = [
    {
      id: 'app-1',
      challengeId: 'chal-1',
      startupId: 'start-1',
      startupName: 'CleanRoute Technologies',
      founderName: 'Priya Patel',
      proposalTitle: 'CleanRoute Dynamic AI Routing & IoT Bin Telemetry Pilot for Pune Wards 4 & 7',
      proposalSummary: 'We propose deploying 45 in-cab driver navigation devices powered by our dynamic Traveling Salesperson Optimization AI, paired with 60 ultrasonic fill-level sensors at high-density bin locations. Our system ingests Pune traffic feeds to eliminate bottleneck routes, targeting a delay reduction from 40% to 22%.',
      technicalApproach: '1. Fit 45 PMC garbage trucks with our ruggedized Android telemetry units.\n2. Install 60 ultrasonic solar bin-level sensors transmitting over LoRaWAN.\n3. Dynamic route computation refreshed every 15 minutes based on live traffic.\n4. Real-time municipal dashboard for Pune sanitation superintendents.',
      requestedBudget: 1250000,
      proposedWeeks: 12,
      eligibilityChecklist: {
        isDpiitRecognized: true,
        dpiitCertNumber: 'DIPP-84920',
        hasRequiredTrl: true,
        trlLevel: 7,
        hasTeamCapacity: true,
        relevantSolutionFit: true,
        agreesToSandboxTerms: true
      },
      status: 'selected', // 'submitted' | 'under_evaluation' | 'shortlisted' | 'selected' | 'rejected'
      pitchDeckUrl: 'https://cleanroute.demo.sih.gov.in/pitch-deck.pdf',
      expertScoreAvg: 82,
      createdAt: new Date(Date.now() - 25 * 86400000).toISOString()
    },
    {
      id: 'app-2',
      challengeId: 'chal-1',
      startupId: 'start-5',
      startupName: 'EcoTrack Analytics',
      founderName: 'Sanjay Deshpande',
      proposalTitle: 'RFID & GPS Waste Fleet Monitoring Suite',
      proposalSummary: 'Deploy passive RFID tags on 2000 community bins and GPS dongles on collection trucks to log arrival timestamps.',
      technicalApproach: 'Passive RFID checkpoint logging at bin pickup points.',
      requestedBudget: 1200000,
      proposedWeeks: 12,
      eligibilityChecklist: {
        isDpiitRecognized: true,
        dpiitCertNumber: 'DIPP-71239',
        hasRequiredTrl: true,
        trlLevel: 5,
        hasTeamCapacity: true,
        relevantSolutionFit: true,
        agreesToSandboxTerms: true
      },
      status: 'under_evaluation',
      pitchDeckUrl: 'https://ecotrack.demo.sih.gov.in/deck.pdf',
      expertScoreAvg: 68,
      createdAt: new Date(Date.now() - 24 * 86400000).toISOString()
    },
    {
      id: 'app-3',
      challengeId: 'chal-3',
      startupId: 'start-3',
      startupName: 'UrbanFlow Computer Vision',
      founderName: 'Neha Gupta',
      proposalTitle: 'Zero-Latency Edge Vision Signal Controller for Delhi Emergency Corridors',
      proposalSummary: 'Deploy 8 Edge-AI video processing units at key AIIMS corridor intersections to detect oncoming sirens and switch traffic lights to green 40 seconds prior to ambulance arrival.',
      technicalApproach: 'Multi-modal optical AI + acoustic siren recognition with fail-safe fallback to standard signal cycles.',
      requestedBudget: 2200000,
      proposedWeeks: 16,
      eligibilityChecklist: {
        isDpiitRecognized: true,
        dpiitCertNumber: 'DIPP-78311',
        hasRequiredTrl: true,
        trlLevel: 7,
        hasTeamCapacity: true,
        relevantSolutionFit: true,
        agreesToSandboxTerms: true
      },
      status: 'under_evaluation',
      pitchDeckUrl: 'https://urbanflow.demo.sih.gov.in/deck.pdf',
      expertScoreAvg: 88,
      createdAt: new Date(Date.now() - 15 * 86400000).toISOString()
    },
    {
      id: 'app-4',
      challengeId: 'chal-3',
      startupId: 'start-4',
      startupName: 'UrjaGrid Remote Power',
      founderName: 'Rajesh Nair',
      proposalTitle: 'Joint UrjaGrid & UrbanFlow High-Availability Microgrid & Edge-AI Traffic Preemption Corridor',
      proposalSummary: 'A cross-domain consortium proposal combining UrjaGrid battery microgrid power units with UrbanFlow Edge-AI cameras to guarantee 100% signal preemption uptime for Delhi emergency corridors.',
      technicalApproach: '1. Deploy 8 ruggedized hybrid lithium micro-UPS consoles.\n2. Power 8 UrbanFlow Edge-AI vision cameras.\n3. Fail-safe traffic signal controller interface with sub-10ms response.',
      requestedBudget: 2400000,
      proposedWeeks: 16,
      isJointApplication: true,
      partnerStartupId: 'start-3',
      partnerStartupName: 'UrbanFlow Computer Vision',
      applicantRole: 'UrjaGrid: Micro-UPS Hardware, Power Resilience & Fail-Safe Inverters',
      partnerRole: 'UrbanFlow: Edge Computer Vision, Siren Audio Recognition & Controller Interfacing',
      requiresExpertApproval: true,
      expertApprovalStatus: 'pending',
      specialReviewReason: 'Joint cross-domain application review (Energy + Mobility)',
      eligibilityChecklist: {
        isDpiitRecognized: true,
        dpiitCertNumber: 'DIPP-65239',
        hasRequiredTrl: true,
        trlLevel: 8,
        hasTeamCapacity: true,
        relevantSolutionFit: true,
        agreesToSandboxTerms: true
      },
      status: 'submitted',
      pitchDeckUrl: 'https://urjagrid.demo.sih.gov.in/joint-deck.pdf',
      expertScoreAvg: null,
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
    },
    {
      id: 'app-5-1',
      challengeId: 'chal-5',
      startupId: 'start-5',
      startupName: 'LightLoop Innovations',
      founderName: 'Rajesh Nair',
      proposalTitle: 'Automated Photocell & Fault Reporting Streetlight Mesh',
      proposalSummary: 'Deploy LoRaWAN mesh photocell nodes across 300 streetlights in Indore. Automatically detects lamp failures and routes work orders to municipal crews, targeting 2-day repair turnaround.',
      requestedBudget: 800000,
      proposedWeeks: 10,
      eligibilityChecklist: {
        isDpiitRecognized: true,
        dpiitCertNumber: 'DIPP-66120',
        hasRequiredTrl: true,
        trlLevel: 6,
        hasTeamCapacity: true,
        relevantSolutionFit: true,
        agreesToSandboxTerms: true
      },
      status: 'under_evaluation',
      pitchDeckUrl: 'https://lightloop.demo.sih.gov.in/deck.pdf',
      expertScoreAvg: null,
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString()
    },
    {
      id: 'app-5-2',
      challengeId: 'chal-5',
      startupId: 'start-5-2',
      startupName: 'LumenGrid Systems',
      founderName: 'Kunal Patil',
      proposalTitle: 'Zigbee Substation Lighting Remote Monitor',
      proposalSummary: 'Centralized current monitoring at feeder pillars to detect blown fuses and unlit segments.',
      requestedBudget: 820000,
      proposedWeeks: 12,
      eligibilityChecklist: {
        isDpiitRecognized: true,
        dpiitCertNumber: 'DIPP-49102',
        hasRequiredTrl: true,
        trlLevel: 5,
        hasTeamCapacity: true,
        relevantSolutionFit: true,
        agreesToSandboxTerms: true
      },
      status: 'under_evaluation',
      createdAt: new Date(Date.now() - 9 * 86400000).toISOString()
    },
    {
      id: 'app-5-3',
      challengeId: 'chal-5',
      startupId: 'start-5-3',
      startupName: 'SmartPole Telematics',
      founderName: 'Deepa Rao',
      proposalTitle: 'Smart Pole LoRa Node with Ambient Light Sensor',
      proposalSummary: 'NEMA socket smart photocell controllers with GPS positioning and power metering.',
      requestedBudget: 780000,
      proposedWeeks: 10,
      eligibilityChecklist: {
        isDpiitRecognized: true,
        dpiitCertNumber: 'DIPP-38190',
        hasRequiredTrl: true,
        trlLevel: 6,
        hasTeamCapacity: true,
        relevantSolutionFit: true,
        agreesToSandboxTerms: true
      },
      status: 'under_evaluation',
      createdAt: new Date(Date.now() - 8 * 86400000).toISOString()
    },
    {
      id: 'app-5-4',
      challengeId: 'chal-5',
      startupId: 'start-5-4',
      startupName: 'SparkSense IoT',
      founderName: 'Aditya Mehta',
      proposalTitle: 'Cloud Managed Current Transducer Streetlight Monitor',
      proposalSummary: 'Non-invasive split-core CT sensors reporting line currents via 4G-LTE Cat-M1 gateway.',
      requestedBudget: 790000,
      proposedWeeks: 11,
      eligibilityChecklist: {
        isDpiitRecognized: true,
        dpiitCertNumber: 'DIPP-55201',
        hasRequiredTrl: true,
        trlLevel: 5,
        hasTeamCapacity: true,
        relevantSolutionFit: true,
        agreesToSandboxTerms: true
      },
      status: 'under_evaluation',
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString()
    }
  ];

  // 5. Expert Evaluations
  const evaluations = [
    {
      id: 'eval-1',
      challengeId: 'chal-1',
      applicationId: 'app-1',
      startupName: 'CleanRoute Technologies',
      expertId: 'usr-expert-1',
      expertName: 'Dr. K. R. Ramanujan',
      criteriaScores: {
        innovation: {
          score: 22,
          max: 25,
          weight: 25,
          label: 'Innovation & Novelty of Approach',
          comment: 'Strong proprietary TSP routing algorithm combined with affordable LoRaWAN bin sensors. Distinct edge over static GPS trackers.'
        },
        feasibility: {
          score: 21,
          max: 25,
          weight: 25,
          label: 'Technical Feasibility & TRL Maturity',
          comment: 'Prototype has already been lab-tested in 5 vehicles. TRL 7 readiness is credible with working driver apps.'
        },
        security: {
          score: 20,
          max: 25,
          weight: 25,
          label: 'Cybersecurity, Data Privacy & Interoperability',
          comment: 'System complies with Open Geospatial Consortium (OGC) standards and TLS 1.3 encrypted telemetry.'
        },
        costViability: {
          score: 19,
          max: 25,
          weight: 25,
          label: 'Cost Efficiency & Commercial Scalability',
          comment: 'Milestone tranches are logically divided (30%/40%/30%). Equipment unit cost is sustainable for municipal budget scale-up.'
        }
      },
      totalScore: 82, // Auto calculated (22 + 21 + 20 + 19)
      maxTotal: 100,
      recommendation: 'RECOMMEND_FOR_PILOT',
      advisoryNote: 'This evaluation represents an expert technical advisory score designed to assist the Department Officer. Final pilot selection rests with the Officer.',
      generalComments: 'CleanRoute presents a practical, measurable solution directly targeting the 40% delay problem. Recommended for pilot sandbox deployment in Wards 4 & 7.',
      submittedAt: new Date(Date.now() - 22 * 86400000).toISOString()
    }
  ];

  // 6. Active Pilots
  const pilots = [
    {
      id: 'pilot-1',
      challengeId: 'chal-1',
      applicationId: 'app-1',
      startupId: 'start-1',
      startupName: 'CleanRoute Technologies',
      departmentName: 'Pune Municipal Corporation & Dept of Urban Infrastructure',
      officerId: 'usr-govt-1',
      officerName: 'Dr. Sunita Verma',
      validatorId: 'usr-validator-1',
      validatorName: 'Quality & Standards Certification Bureau',
      startDate: '2026-09-01',
      targetEndDate: '2026-11-25',
      totalGrantBudget: 1250000,
      status: 'active', // 'active' | 'completed' | 'procured' | 'scaled'
      kpiTracking: {
        metric: 'Average Waste Collection Route Delay',
        unit: '%',
        baselineValue: 40,
        targetValue: 25,
        currentActualValue: 22, // Target exceeded! 22% delay achieved
        status: 'TARGET_ACHIEVED',
        trendData: [
          { week: 'Baseline', value: 40, label: 'Pre-pilot Baseline' },
          { week: 'Week 2', value: 38, label: 'Sensor Setup' },
          { week: 'Week 4', value: 33, label: 'Pilot Phase 1' },
          { week: 'Week 6', value: 28, label: 'Dynamic Routing Active' },
          { week: 'Week 8', value: 24, label: 'Traffic Integration' },
          { week: 'Week 10 (Current)', value: 22, label: 'Verified Telemetry (Current)' }
        ]
      },
      procurementDecision: {
        isRecorded: true,
        pathway: 'Rule 194 Direct Innovation Procurement / GeM Startup Runway',
        decision: 'PROCEED_TO_DIRECT_PROCUREMENT_AND_MULTI_DISTRICT_SCALE',
        rationale: 'CleanRoute successfully demonstrated 22% collection delay (beating the 25% target from a 40% baseline) over 45 municipal vehicles. Independent validator confirmed 99.4% GPS telemetry data integrity with zero missed collection zones. Approved for city-wide scale-up and recommendation to 3 adjacent municipal corporations.',
        scaleDistricts: ['Pune Municipal Corporation (All 15 Wards)', 'Pimpri-Chinchwad Municipal Corporation (PCMC)', 'Nagpur Smart City'],
        recommendedScaleBudget: '₹ 1,45,00,000 (Annual City-Wide Service Contract)',
        signedBy: 'Dr. Sunita Verma (Director of Urban Innovation)',
        signedAt: new Date(Date.now() - 1 * 86400000).toISOString()
      },
      createdAt: new Date(Date.now() - 21 * 86400000).toISOString()
    },
    {
      id: 'pilot-2',
      challengeId: 'chal-2',
      applicationId: 'app-2-1',
      startupId: 'start-2',
      startupName: 'AquaSense Labs',
      departmentName: 'Bengaluru Water Supply Board',
      officerId: 'usr-govt-1',
      officerName: 'Dr. Sunita Verma',
      validatorId: 'usr-validator-1',
      validatorName: 'IISc Urban Water Lab',
      startDate: '2026-07-01',
      targetEndDate: '2026-10-30',
      totalGrantBudget: 1800000,
      status: 'active',
      agreementRef: 'SBoT-2026-KA-019',
      kpiTracking: {
        metric: 'Non-Revenue Water Loss (NRW)',
        unit: '% lost',
        baselineValue: 32,
        targetValue: 15,
        currentActualValue: 19,
        status: 'IN_PROGRESS'
      },
      createdAt: new Date(Date.now() - 65 * 86400000).toISOString()
    },
    {
      id: 'pilot-3',
      challengeId: 'chal-3',
      applicationId: 'app-3',
      startupId: 'start-3',
      startupName: 'SignalSetu',
      departmentName: 'Traffic Management Directorate',
      officerId: 'usr-govt-1',
      officerName: 'Dr. Sunita Verma',
      validatorId: 'usr-validator-1',
      validatorName: 'IIT Delhi Transport Lab',
      startDate: '2026-06-01',
      targetEndDate: '2026-10-15',
      totalGrantBudget: 1600000,
      status: 'active',
      agreementRef: 'SBoT-2026-DL-044',
      kpiTracking: {
        metric: 'Emergency Corridor Transit Delay',
        unit: 'minutes',
        baselineValue: 18,
        targetValue: 10,
        currentActualValue: 12.5,
        status: 'PARTIAL'
      },
      createdAt: new Date(Date.now() - 80 * 86400000).toISOString()
    },
    {
      id: 'pilot-4',
      challengeId: 'chal-4',
      applicationId: 'app-4',
      startupId: 'start-4',
      startupName: 'SunHealth Power',
      departmentName: 'Health Department, Himachal Pradesh',
      officerId: 'usr-govt-1',
      officerName: 'Dr. Sunita Verma',
      validatorId: 'usr-validator-1',
      validatorName: 'NIT Hamirpur Energy Lab',
      startDate: '2026-08-15',
      targetEndDate: '2026-11-30',
      totalGrantBudget: 1000000,
      status: 'active',
      agreementRef: 'SBoT-2026-HP-012',
      kpiTracking: {
        metric: 'Average Daily Power Outage at PHC',
        unit: 'hours/day',
        baselineValue: 9,
        targetValue: 2,
        currentActualValue: null,
        status: 'RUNNING'
      },
      createdAt: new Date(Date.now() - 25 * 86400000).toISOString()
    },
    {
      id: 'pilot-6',
      challengeId: 'chal-6',
      applicationId: 'app-6-1',
      startupId: 'start-6',
      startupName: 'RoadWatch AI',
      departmentName: 'Jaipur Municipal Corporation',
      officerId: 'usr-govt-1',
      officerName: 'Dr. Sunita Verma',
      validatorId: 'usr-validator-1',
      validatorName: 'MNIT Jaipur Civil Lab',
      startDate: '2026-06-01',
      targetEndDate: '2026-09-08',
      totalGrantBudget: 700000,
      status: 'stopped',
      agreementRef: 'SBoT-2026-RJ-009',
      kpiTracking: {
        metric: 'Pothole Repair Turnaround Time',
        unit: 'days',
        baselineValue: 30,
        targetValue: 10,
        currentActualValue: 27,
        status: 'GOAL_NOT_MET'
      },
      createdAt: new Date(Date.now() - 90 * 86400000).toISOString()
    }
  ];

  // 7. Staged Pilot Milestones (With strict 100% total payment allocation)
  const milestones = [
    {
      id: 'ms-1',
      pilotId: 'pilot-1',
      title: 'Milestone 1: IoT Hardware Telemetry & Vehicle Sensor Deployment',
      description: 'Deploy 45 in-cab driver navigation consoles and 60 ultrasonic LoRaWAN bin fill-level sensors across Wards 4 & 7. Verify live telemetry data transmission to Pune City Data Platform.',
      targetDate: '2026-09-20',
      paymentPercentage: 30, // 30%
      paymentAmount: 375000, // ₹3,75,000
      status: 'released', // 'pending' | 'in_progress' | 'evidence_submitted' | 'validator_approved' | 'ready_for_release' | 'released'
      evidenceSubmission: {
        submittedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
        description: 'Completed full physical deployment of 45 in-cab driver tablets and 60 bin sensors. Telemetry streaming verified at 30-second intervals.',
        telemetrySummary: '45/45 Vehicles Online • 60/60 Bin Sensors Active • 100% Telemetry Heartbeat',
        documents: ['CleanRoute_M1_Installation_Signoff.pdf', 'LoRaWAN_Telemetry_Raw_Logs.csv'],
        demoDashboardUrl: 'https://cleanroute.demo.sih.gov.in/telemetry-live'
      },
      validatorReview: {
        verifiedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
        validatorName: 'TechAudit & Standards Certification Bureau',
        decision: 'Achieved',
        remarks: 'Physical spot check of 12 vehicles and 15 bin sensors verified. Data telemetry is transmitting in real-time with zero packet loss.',
        verificationReportUrl: 'https://cert-bureau.gov.in/reports/M1-PMC-CleanRoute-Signoff.pdf'
      },
      paymentRelease: {
        releasedAt: new Date(Date.now() - 13 * 86400000).toISOString(),
        releasedBy: 'Dr. Sunita Verma (Officer)',
        releaseNotes: 'Milestone 1 tranche of ₹3,75,000 (30%) approved and released following validator endorsement.'
      }
    },
    {
      id: 'ms-2',
      pilotId: 'pilot-1',
      title: 'Milestone 2: Dynamic Routing Pilot & KPI Delay Reduction Demonstration',
      description: 'Run 30 consecutive operational days of dynamic route optimization. Demonstrate verifiable reduction in route delay from baseline 40% to <= 25% across 45 collection vehicles.',
      targetDate: '2026-10-20',
      paymentPercentage: 40, // 40%
      paymentAmount: 500000, // ₹5,00,000
      status: 'ready_for_release', // Validator approved -> Ready for officer payment release button!
      evidenceSubmission: {
        submittedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        description: 'CleanRoute dynamic TSP algorithm operated for 30 consecutive days. Average collection delay dropped to 22.0% (target was <=25%, baseline was 40%). Fuel savings of 18.4% recorded across the 45 test vehicles.',
        telemetrySummary: 'Baseline Delay: 40% • Target: 25% • Actual Achieved: 22.0% • 1,350 Completed Trips',
        documents: ['CleanRoute_M2_Performance_KPI_Report.pdf', '30_Day_GPS_Timestamp_Analytics.xlsx'],
        demoDashboardUrl: 'https://cleanroute.demo.sih.gov.in/kpi-dashboard'
      },
      validatorReview: {
        verifiedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        validatorName: 'TechAudit & Standards Certification Bureau',
        decision: 'Achieved',
        remarks: 'Audit Bureau independently cross-checked GPS timestamp logs against Pune Municipal complaint registry. Confirmed actual route delay achieved is 22.0%, comfortably exceeding the 25% target. Milestone verified as fully Achieved.',
        verificationReportUrl: 'https://cert-bureau.gov.in/reports/M2-PMC-CleanRoute-Audit.pdf'
      }
    },
    {
      id: 'ms-3',
      pilotId: 'pilot-1',
      title: 'Milestone 3: City-Wide Scaling Package, Security Audit & GeM Catalog Integration',
      description: 'Deliver comprehensive municipal API integration documentation, vulnerability audit report (STQC/CERT-In certified), and GeM Government e-Marketplace procurement catalog onboarding package.',
      targetDate: '2026-11-20',
      paymentPercentage: 30, // 30% (30 + 40 + 30 = 100%)
      paymentAmount: 375000, // ₹3,75,000
      status: 'in_progress',
      evidenceSubmission: null,
      validatorReview: null
    },
    // Pilot 2 (AquaSense Labs - P2)
    {
      id: 'ms-p2-1',
      pilotId: 'pilot-2',
      title: 'Milestone 1: Acoustic Pipeline Sensor Deployment',
      description: 'Install 50 hydrophone clamp sensors along the 12km Bengaluru trunk water line and verify telemetry feed.',
      targetDate: '2026-07-27',
      paymentPercentage: 30,
      paymentAmount: 540000,
      status: 'released',
      paymentRelease: { releasedAt: '2026-07-27', ref: 'UTR2607270033' }
    },
    {
      id: 'ms-p2-2',
      pilotId: 'pilot-2',
      title: 'Milestone 2: Subsurface Leak Pinpointing & NRW Demonstration',
      description: 'Run 60 days of acoustic leak logging. Demonstrate reduction in non-revenue water loss from 32% baseline.',
      targetDate: '2026-09-29',
      paymentPercentage: 40,
      paymentAmount: 720000,
      status: 'ready_for_release',
      evidenceSubmission: {
        submittedAt: '2026-09-27',
        description: 'Isolated 18 subsurface leaks. Verified NRW reduced to 19% across the testbed corridor.',
        currentAchievedKpi: 19
      },
      validatorReview: {
        verifiedAt: '2026-09-29',
        validatorName: 'IISc Urban Water Lab',
        decision: 'Achieved',
        remarks: 'Acoustic testing verified NRW down to 19% from 32% baseline. Goal met.',
        verifiedKpiValue: '19%'
      }
    },
    {
      id: 'ms-p2-3',
      pilotId: 'pilot-2',
      title: 'Milestone 3: City-Wide Water Telemetry & Final Dossier',
      description: 'Deliver final municipal water telemetry integration and scaling plan.',
      targetDate: '2026-10-30',
      paymentPercentage: 30,
      paymentAmount: 540000,
      status: 'pending'
    },
    // Pilot 3 (SignalSetu - P3)
    {
      id: 'ms-p3-1',
      pilotId: 'pilot-3',
      title: 'Milestone 1: Camera AI & Beacon Setup at 10 Junctions',
      description: 'Equip 10 traffic signals with Edge-AI cameras and test ambulance beacon receivers.',
      targetDate: '2026-06-10',
      paymentPercentage: 30,
      paymentAmount: 480000,
      status: 'released',
      paymentRelease: { releasedAt: '2026-06-10', ref: 'UTR2606100052' }
    },
    {
      id: 'ms-p3-2',
      pilotId: 'pilot-3',
      title: 'Milestone 2: Emergency Preemption Green Wave Trial',
      description: 'Demonstrate automated green light preemption reducing transit delay from 18 min to 10 min.',
      targetDate: '2026-09-28',
      paymentPercentage: 40,
      paymentAmount: 640000,
      status: 'hold',
      evidenceSubmission: {
        submittedAt: '2026-09-25',
        description: 'Completed 50 simulated ambulance runs. Transit time reduced from 18 to 12.5 minutes.',
        currentAchievedKpi: 12.5
      },
      validatorReview: {
        verifiedAt: '2026-09-28',
        validatorName: 'IIT Delhi Transport Lab',
        decision: 'Partial',
        remarks: 'Transit time 12.5 min against 10 min goal. Goal partly met. Payment on hold for officer decision.',
        verifiedKpiValue: '12.5 min'
      }
    },
    {
      id: 'ms-p3-3',
      pilotId: 'pilot-3',
      title: 'Milestone 3: Municipal Traffic Control Room Integration',
      description: 'Integrate with Central Delhi police traffic control room console.',
      targetDate: '2026-10-15',
      paymentPercentage: 30,
      paymentAmount: 480000,
      status: 'pending'
    },
    // Pilot 4 (SunHealth Power - P4)
    {
      id: 'ms-p4-1',
      pilotId: 'pilot-4',
      title: 'Milestone 1: Hybrid Solar-Lithium Microgrid Commissioning',
      description: 'Deploy cold-climate hybrid solar microgrid at Kinnaur PHC and verify vaccine cold-chain power.',
      targetDate: '2026-09-08',
      paymentPercentage: 30,
      paymentAmount: 300000,
      status: 'released',
      paymentRelease: { releasedAt: '2026-09-08', ref: 'UTR2609080064' }
    },
    {
      id: 'ms-p4-2',
      pilotId: 'pilot-4',
      title: 'Milestone 2: Continuous 24x7 Winter Operational Trial',
      description: 'Demonstrate continuous 99.5% power uptime under sub-zero mountain winter conditions.',
      targetDate: '2026-10-25',
      paymentPercentage: 40,
      paymentAmount: 400000,
      status: 'in_progress'
    },
    {
      id: 'ms-p4-3',
      pilotId: 'pilot-4',
      title: 'Milestone 3: Health Directorate Remote SCADA Handover',
      description: 'Hand over remote telemetry monitoring console to HP Health Directorate.',
      targetDate: '2026-11-30',
      paymentPercentage: 30,
      paymentAmount: 300000,
      status: 'pending'
    },
    // Pilot 6 (RoadWatch AI - P6)
    {
      id: 'ms-p6-1',
      pilotId: 'pilot-6',
      title: 'Milestone 1: Smartphone Sensor Calibration on 15 Trucks',
      description: 'Mount accelerometer smartphones on 15 Jaipur municipal garbage trucks.',
      targetDate: '2026-06-22',
      paymentPercentage: 30,
      paymentAmount: 210000,
      status: 'released',
      paymentRelease: { releasedAt: '2026-06-22', ref: 'UTR2606220028' }
    },
    {
      id: 'ms-p6-2',
      pilotId: 'pilot-6',
      title: 'Milestone 2: Pothole Resolution Speedup Demonstration',
      description: 'Reduce repair turnaround from 30 days to 10 days.',
      targetDate: '2026-09-05',
      paymentPercentage: 40,
      paymentAmount: 280000,
      status: 'stopped',
      validatorReview: {
        verifiedAt: '2026-09-05',
        validatorName: 'MNIT Jaipur Civil Lab',
        decision: 'Not achieved',
        remarks: 'Turnaround was 27 days against 10 day target. Goal not met. Pilot stopped under GFR rules.',
        verifiedKpiValue: '27 days'
      }
    },
    {
      id: 'ms-p6-3',
      pilotId: 'pilot-6',
      title: 'Milestone 3: City-Wide Ward Expansion',
      description: 'Cancelled due to Milestone 2 failure.',
      targetDate: '2026-09-20',
      paymentPercentage: 30,
      paymentAmount: 210000,
      status: 'stopped'
    }
  ];

  // 8. Validation Reports
  const validationReports = [
    {
      id: 'val-1',
      pilotId: 'pilot-1',
      milestoneId: 'ms-2',
      validatorId: 'usr-validator-1',
      validatorName: 'Quality & Standards Certification Bureau',
      kpiMetric: 'Average Waste Collection Route Delay',
      baselineValue: '40.0%',
      targetValue: '25.0%',
      startupClaimValue: '22.0%',
      verifiedValue: '22.0%',
      decision: 'Achieved', // 'Achieved' | 'Partial' | 'Not achieved'
      testMethodology: 'Independent sampling of 450 vehicle trips using automated GPS geofencing & bin RFID verification logs.',
      remarks: 'All test criteria met. Delay reduced by 18 percentage points from baseline. No safety or operational anomalies detected.',
      reportPdfUrl: 'https://cert-bureau.gov.in/reports/M2-PMC-CleanRoute-Audit.pdf',
      verifiedAt: new Date(Date.now() - 1 * 86400000).toISOString()
    },
    {
      id: 'val-2',
      pilotId: 'pilot-2',
      milestoneId: 'ms-p2-2',
      validatorId: 'usr-validator-1',
      validatorName: 'IISc Urban Water Lab',
      kpiMetric: 'Non-Revenue Water Loss (NRW)',
      baselineValue: '32%',
      targetValue: '15%',
      startupClaimValue: '19%',
      verifiedValue: '19%',
      decision: 'Achieved',
      testMethodology: 'Ultrasonic flow meter measurement and acoustic correlation over 12km main.',
      remarks: 'Goal met. 18 pipe fractures pinpointed and sealed. NRW reduced from 32% to 19%.',
      verifiedAt: '2026-09-29'
    },
    {
      id: 'val-3',
      pilotId: 'pilot-3',
      milestoneId: 'ms-p3-2',
      validatorId: 'usr-validator-1',
      validatorName: 'IIT Delhi Transport Lab',
      kpiMetric: 'Emergency Corridor Transit Delay',
      baselineValue: '18 min',
      targetValue: '10 min',
      startupClaimValue: '12.5 min',
      verifiedValue: '12.5 min',
      decision: 'Partial',
      testMethodology: 'GPS timestamp logging on 50 simulated ambulance runs along AIIMS-Safdarjung corridor.',
      remarks: 'Goal partly met. Transit reduced from 18 to 12.5 mins, but missed <=10 min target.',
      verifiedAt: '2026-09-28'
    },
    {
      id: 'val-6',
      pilotId: 'pilot-6',
      milestoneId: 'ms-p6-2',
      validatorId: 'usr-validator-1',
      validatorName: 'MNIT Jaipur Civil Lab',
      kpiMetric: 'Pothole Repair Turnaround Time',
      baselineValue: '30 days',
      targetValue: '10 days',
      startupClaimValue: '27 days',
      verifiedValue: '27 days',
      decision: 'Not achieved',
      testMethodology: 'Audit of 120 citizen complaints across 4 Jaipur zones.',
      remarks: 'Turnaround was 27 days against 10 day target. Goal not met. Pilot stopped under GFR rules.',
      verifiedAt: '2026-09-05'
    }
  ];

  // 9. Audit Logs (Transparent Lifecycle Timeline)
  const auditLogs = [
    {
      id: 'log-1',
      timestamp: new Date(Date.now() - 30 * 86400000).toISOString(),
      action: 'CHALLENGE_CREATED',
      actor: 'Dr. Sunita Verma (Officer)',
      details: 'Created outcome-based challenge: Municipal Solid Waste Collection Route Optimization (Baseline: 40%, Target: 25%).'
    },
    {
      id: 'log-2',
      timestamp: new Date(Date.now() - 25 * 86400000).toISOString(),
      action: 'APPLICATION_SUBMITTED',
      actor: 'CleanRoute Technologies (Startup)',
      details: 'CleanRoute submitted proposal and completed fair eligibility checklist (DPIIT #DIPP-84920).'
    },
    {
      id: 'log-3',
      timestamp: new Date(Date.now() - 22 * 86400000).toISOString(),
      action: 'EXPERT_EVALUATION_RECORDED',
      actor: 'Dr. K. R. Ramanujan (Expert)',
      details: 'Scored CleanRoute application 82/100 across Innovation, Feasibility, Security, and Cost.'
    },
    {
      id: 'log-4',
      timestamp: new Date(Date.now() - 21 * 86400000).toISOString(),
      action: 'PILOT_INITIATED',
      actor: 'Dr. Sunita Verma (Officer)',
      details: 'Officer approved CleanRoute for sandbox pilot with 3 staged milestones (30%/40%/30% = 100%).'
    },
    {
      id: 'log-5',
      timestamp: new Date(Date.now() - 13 * 86400000).toISOString(),
      action: 'MILESTONE_1_PAYMENT_RELEASED',
      actor: 'Dr. Sunita Verma (Officer)',
      details: 'Released Milestone 1 payment tranche of ₹3,75,000 (30%) after independent validation.'
    },
    {
      id: 'log-6',
      timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
      action: 'EVIDENCE_SUBMITTED',
      actor: 'CleanRoute Technologies (Startup)',
      details: 'Startup submitted Milestone 2 completion deliverables demonstrating 22% route delay.'
    },
    {
      id: 'log-7',
      timestamp: new Date(Date.now() - 1 * 86400000).toISOString(),
      action: 'VALIDATOR_APPROVAL_RECORDED',
      actor: 'Quality & Standards Certification Bureau (Validator)',
      details: 'Validator verified 22% delay reduction (Target: 25%). Decision: Achieved. Milestone 2 status changed to Ready for release.'
    }
  ];

  // 10. Startup Collaborations (Cross-Domain Joint Applications)
  const collaborations = [
    {
      id: 'collab-1',
      fromStartupId: 'start-1',
      fromStartupName: 'CleanRoute Technologies',
      toStartupId: 'start-2',
      toStartupName: 'HydroSense Acoustics',
      challengeId: 'chal-2',
      challengeTitle: 'AI Acoustic Leakage Detection in Urban Water Distribution Pipelines',
      challengeSector: 'Water Infrastructure',
      status: 'accepted', // 'pending' | 'accepted' | 'declined'
      proposedRole: 'CleanRoute provides municipal GIS mapping, telemetry gateway, and mobile technician navigation; HydroSense provides acoustic pipe sensors & leak AI.',
      notes: 'Joint Cross-Domain Sandbox Pilot for BWSSB Pipeline Corridor under SIH26136 relaxed procurement.',
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 4 * 86400000).toISOString()
    },
    {
      id: 'collab-2',
      fromStartupId: 'start-3',
      fromStartupName: 'UrbanFlow Computer Vision',
      toStartupId: 'start-1',
      toStartupName: 'CleanRoute Technologies',
      challengeId: 'chal-3',
      challengeTitle: 'Real-Time Edge-AI Adaptive Traffic Control for Emergency Vehicle Corridors',
      challengeSector: 'Mobility & Public Safety',
      status: 'pending',
      proposedRole: 'UrbanFlow provides edge camera AI for signal preemption; CleanRoute integrates municipal fleet transponder beacons and telemetry logs.',
      notes: 'Invitation to partner on the AIIMS-Safdarjung emergency corridor sandbox pilot.',
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 86400000).toISOString()
    }
  ];

  // 11. Startup-to-Startup Private Messaging Threads
  const messages = [
    {
      id: 'msg-1',
      collabId: 'collab-1',
      senderStartupId: 'start-1',
      senderStartupName: 'CleanRoute Technologies',
      senderFounder: 'Priya Patel',
      recipientStartupId: 'start-2',
      recipientStartupName: 'HydroSense Acoustics',
      text: 'Hi Aman! We reviewed BWSSB’s acoustic leak detection challenge (chal-2). Because our primary domain is Smart Cities & Waste Logistics, we require a cross-domain collaboration with a verified water infrastructure startup. Your acoustic sensors and TRL 6 stack are an ideal fit.',
      timestamp: new Date(Date.now() - 5 * 86400000).toISOString()
    },
    {
      id: 'msg-2',
      collabId: 'collab-1',
      senderStartupId: 'start-2',
      senderStartupName: 'HydroSense Acoustics',
      senderFounder: 'Aman Verma',
      recipientStartupId: 'start-1',
      recipientStartupName: 'CleanRoute Technologies',
      text: 'Hello Priya! That sounds like an excellent synergy. Our acoustic loggers pinpoint subsurface pipe fractures within 0.5m, but we lack the GIS fleet routing and field crew dispatch layer that CleanRoute already deployed in Pune.',
      timestamp: new Date(Date.now() - 4.5 * 86400000).toISOString()
    },
    {
      id: 'msg-3',
      collabId: 'collab-1',
      senderStartupId: 'start-1',
      senderStartupName: 'CleanRoute Technologies',
      senderFounder: 'Priya Patel',
      recipientStartupId: 'start-2',
      recipientStartupName: 'HydroSense Acoustics',
      text: 'Wonderful! I have submitted a formal collaboration invite for chal-2. Once you accept, we can prepare the joint proposal with both our contributions clearly demarcated.',
      timestamp: new Date(Date.now() - 4.2 * 86400000).toISOString()
    },
    {
      id: 'msg-4',
      collabId: 'collab-1',
      senderStartupId: 'start-2',
      senderStartupName: 'HydroSense Acoustics',
      senderFounder: 'Aman Verma',
      recipientStartupId: 'start-1',
      recipientStartupName: 'CleanRoute Technologies',
      text: 'Accepted the collaboration invite! Both of our teams are well within the 2 active challenge ceiling. Ready to submit our joint application.',
      timestamp: new Date(Date.now() - 4 * 86400000).toISOString()
    },
    {
      id: 'msg-5',
      collabId: 'collab-2',
      senderStartupId: 'start-3',
      senderStartupName: 'UrbanFlow Computer Vision',
      senderFounder: 'Neha Gupta',
      recipientStartupId: 'start-1',
      recipientStartupName: 'CleanRoute Technologies',
      text: 'Hi Priya, Neha from UrbanFlow here. We are drafting a proposal for the Delhi Emergency Vehicle Green Corridor challenge (chal-3) and sent an invite to collaborate on in-cab telemetry beacons. Let us know if you have bandwidth!',
      timestamp: new Date(Date.now() - 1 * 86400000).toISOString()
    },
    // 12. Persistent Multi-Participant Pilot Command Center Messages (pilot-1: CleanRoute)
    {
      id: 'pmsg-1',
      pilotId: 'pilot-1',
      challengeId: 'chal-1',
      senderId: 'usr-govt-1',
      senderName: 'Dr. Sunita Verma',
      senderRole: 'government',
      senderOrg: 'Department of Urban Infrastructure & Smart Cities Mission',
      text: 'Welcome everyone to the CleanRoute Pilot Command Center. Milestone 1 (IoT sensor deployment) has been verified and released. CleanRoute team, please proceed with the 30-day dynamic routing demonstration across Wards 4 and 7.',
      timestamp: new Date(Date.now() - 10 * 86400000).toISOString()
    },
    {
      id: 'pmsg-2',
      pilotId: 'pilot-1',
      challengeId: 'chal-1',
      senderId: 'usr-startup-1',
      senderName: 'Priya Patel',
      senderRole: 'startup',
      senderOrg: 'CleanRoute Technologies',
      text: 'Thank you Dr. Verma. All 45 in-cab driver consoles are operational and receiving dynamic route updates. We have attached the live telemetry dashboard link: https://cleanroute.demo.sih.gov.in/telemetry-live',
      attachment: {
        name: 'CleanRoute Live Telemetry Feed',
        url: 'https://cleanroute.demo.sih.gov.in/telemetry-live',
        type: 'link'
      },
      timestamp: new Date(Date.now() - 8 * 86400000).toISOString()
    },
    {
      id: 'pmsg-3',
      pilotId: 'pilot-1',
      challengeId: 'chal-1',
      senderId: 'usr-validator-1',
      senderName: 'Quality & Standards Certification Bureau',
      senderRole: 'validator',
      senderOrg: 'Quality & Standards Certification Bureau (IIT Delhi Mobility Lab)',
      text: 'Our team completed the independent audit of 450 vehicle trips. The verified route collection delay is 22.0%, outperforming the target of 25.0% (baseline 40%). Milestone 2 validation report is certified and filed.',
      attachment: {
        name: 'M2 Independent Validation Report (PDF)',
        url: 'https://cert-bureau.gov.in/reports/M2-PMC-CleanRoute-Audit.pdf',
        type: 'pdf'
      },
      timestamp: new Date(Date.now() - 2 * 86400000).toISOString()
    },
    {
      id: 'pmsg-4',
      pilotId: 'pilot-1',
      challengeId: 'chal-1',
      senderId: 'usr-expert-1',
      senderName: 'Dr. K. R. Ramanujan',
      senderRole: 'expert',
      senderOrg: 'National Innovation Review Panel (IIT Bombay)',
      text: 'Expert panel reviewed the verified telemetry and fuel savings logs (18.4% reduction). The outcomes clearly justify proceeding with the city-wide rollout under GFR Rule 194.',
      timestamp: new Date(Date.now() - 1 * 86400000).toISOString()
    }
  ];

  const dbState = {
    users,
    startups,
    challenges,
    applications,
    evaluations,
    pilots,
    milestones,
    validationReports,
    procurementDecisions: pilots.map(p => p.procurementDecision).filter(Boolean),
    auditLogs,
    collaborations,
    messages
  };

  resetDB(dbState);
  console.log('[Seed] SIH26136 Database seeded successfully with complete Waste Collection demo journey & realistic challenges.');
}

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };

