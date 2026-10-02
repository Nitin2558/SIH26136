const http = require('http');
const app = require('./app');
const { getDB } = require('./db/store');
const { seedDatabase } = require('./seed');

// Reset DB with seed first
seedDatabase();

const server = http.createServer(app);

server.listen(0, async () => {
  const port = server.address().port;
  const baseUrl = 'http://localhost:' + port;

  async function request(path, options = {}) {
    const url = baseUrl + path;
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }
    return { status: res.status, ok: res.ok, data };
  }

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log('  PASS: ' + message);
      passed++;
    } else {
      console.error('  FAIL: ' + message);
      failed++;
    }
  }

  console.log('=== STARTUP EXPERIENCE AUTOMATED VERIFICATION ===\n');

  try {
    // 1. Active Challenge Status & Limit
    console.log('1. Testing Active Challenge Status & 2-Limit Counter...');
    const r1 = await request('/api/startups/start-1/active-status');
    assert(r1.ok, 'Active status endpoint returns 200');
    assert(r1.data.activeCount === 1, `CleanRoute has 1 active challenge (CleanRoute Pune Waste #chal-1, got ${r1.data.activeCount})`);
    assert(r1.data.maxLimit === 2, 'Max allowed is 2 active challenges');
    assert(r1.data.limitReached === false, 'Limit is not reached (1/2)');

    // 2. Matching Challenges & In-Domain vs Cross-Domain
    console.log('\n2. Testing In-Domain vs Cross-Domain Matching...');
    const r2 = await request('/api/startups/start-1/matching-challenges');
    assert(r2.ok, 'Matching challenges endpoint returns 200');
    const chal1Match = r2.data.matchingChallenges.find(c => c.challengeId === 'chal-1');
    const chal2Match = r2.data.matchingChallenges.find(c => c.challengeId === 'chal-2');
    assert(chal1Match && chal1Match.isInDomain === true, 'chal-1 (Smart Cities) is In-Domain (isInDomain = true)');
    assert(chal2Match && chal2Match.isInDomain === false, 'chal-2 (Water Infra) is Cross-Domain (isInDomain = false)');

    // 3. Profile Update
    console.log('\n3. Testing Startup Profile Update...');
    const r3 = await request('/api/startups/profile', {
      method: 'POST',
      body: JSON.stringify({
        startupId: 'start-1',
        name: 'CleanRoute Technologies Pvt Ltd',
        dpiitNumber: 'DIPP-84920',
        domains: ['Smart Cities & CleanTech', 'Public Service Innovation & Governance'],
        teamSize: 18,
        workforceSkills: ['Geospatial AI', 'LoRaWAN Edge', 'Full-Stack Fleet GIS'],
        achievements: ['PMC Waste Pilot Achieved 22.0% delay', 'NABL IP67 Sensor'],
        pastProjects: ['Ward 4 Smart Bins', 'Thane Municipal Telemetry']
      })
    });
    assert(r3.ok, 'Profile update returns 200');
    assert(r3.data.startup.teamSize === 18, 'Team size updated to 18');
    assert(r3.data.startup.domains.length === 2, 'Domains updated to 2 entries');

    // 4. Collaborations Retrieval & Invite
    console.log('\n4. Testing Cross-Domain Collaborations & Invites...');
    const r4 = await request('/api/startups/start-1/collaborations');
    assert(r4.ok, 'Collaborations retrieval returns 200');
    assert(Array.isArray(r4.data.all), 'Collaborations returned as array in all');
    const acceptedCollab1 = r4.data.accepted.find(c => c.id === 'collab-1');
    assert(acceptedCollab1 && acceptedCollab1.status === 'accepted', 'collab-1 between CleanRoute & HydroSense is accepted');

    // 5. Send Collaboration Invite
    const r5 = await request('/api/startups/collaborations/invite', {
      method: 'POST',
      body: JSON.stringify({
        fromStartupId: 'start-1',
        toStartupId: 'start-4',
        challengeId: 'chal-4',
        proposedRole: 'CleanRoute provides IoT telemetry console; UrjaGrid provides solar microgrid',
        notes: 'Remote mountain telemedicine pilot'
      })
    });
    assert(r5.ok, 'Send collaboration invite returns 200');
    assert(r5.data.collaboration.status === 'pending', 'New invite has status pending');

    // 6. Respond to Collaboration Invite (Accept)
    const r6 = await request('/api/startups/collaborations/' + r5.data.collaboration.id + '/respond', {
      method: 'POST',
      body: JSON.stringify({
        startupId: 'start-4',
        action: 'accept'
      })
    });
    assert(r6.ok, 'Respond to invite returns 200');
    assert(r6.data.collaboration.status === 'accepted', 'Invite status changed to accepted');

    // 7. Messages & Conversations
    console.log('\n7. Testing Startup-to-Startup Private Messaging...');
    const r7 = await request('/api/startups/start-1/messages');
    assert(r7.ok, 'Messages endpoint returns 200');
    assert(r7.data.conversations.length > 0, 'Conversations list is populated');

    const r8 = await request('/api/startups/messages', {
      method: 'POST',
      body: JSON.stringify({
        senderStartupId: 'start-1',
        recipientStartupId: 'start-2',
        text: 'Testing coordination for BWSSB acoustic leak detection sandbox.'
      })
    });
    assert(r8.ok, 'Send message returns 200');
    assert((r8.data.msg?.text || r8.data.messageRecord?.text || '').includes('Testing coordination'), 'Message stored correctly');

    // 8. Cross-Domain Application Rules
    console.log('\n8. Testing Cross-Domain Joint Application Rules...');
    // Attempt applying to chal-2 without collaboration (should fail)
    const r9 = await request('/api/challenges/chal-2/apply', {
      method: 'POST',
      body: JSON.stringify({
        startupId: 'start-1',
        title: 'Solo attempt at water challenge',
        summary: 'Attempting without partner',
        isJointApplication: false
      })
    });
    assert(r9.status === 400, 'Solo application outside domain rejected with 400 (Cross-domain required)');

    // Attempt applying with unverified / non-partner (should fail)
    const r10 = await request('/api/challenges/chal-2/apply', {
      method: 'POST',
      body: JSON.stringify({
        startupId: 'start-1',
        title: 'Joint attempt with wrong partner',
        summary: 'Attempting with start-3',
        isJointApplication: true,
        partnerStartupId: 'start-3'
      })
    });
    assert(r10.status === 400, 'Application with non-partner rejected with 400');

    // Apply with verified partner HydroSense (start-2) for chal-2
    // CleanRoute has 1 active challenge (chal-1), so this becomes its 2nd active challenge.
    // It should succeed and flag requiresExpertApproval: true!
    const r11 = await request('/api/challenges/chal-2/apply', {
      method: 'POST',
      body: JSON.stringify({
        startupId: 'start-1',
        title: 'CleanRoute & HydroSense Joint Telemetry Array',
        summary: 'Cross-domain consortium proposal for water distribution leak detection',
        approach: 'Deploy hydrophones + municipal LoRaWAN gateway',
        isJointApplication: true,
        partnerStartupId: 'start-2',
        partnerStartupName: 'HydroSense Acoustics',
        applicantRole: 'CleanRoute: GIS Gateway & Telemetry',
        partnerRole: 'HydroSense: Calibrated Acoustic Sensors'
      })
    });
    if (!r11.ok) {
      console.error('r11 failed with status:', r11.status, 'data:', r11.data);
    }
    assert(r11.ok, 'Valid joint application succeeds (200)');
    assert(r11.data.requiresExpertApproval === true, 'Application flags requiresExpertApproval = true');
    const jointAppId = r11.data.application?.id;

    // 9. Enforce 2-Active-Challenge Limit
    console.log('\n9. Testing Strict 2-Active-Challenge Limit Enforcement...');
    // CleanRoute now has 2 active challenges: chal-1 and chal-2!
    const r12 = await request('/api/startups/start-1/active-status');
    assert(r12.data.activeCount === 2, 'CleanRoute active count is now 2/2');
    assert(r12.data.limitReached === true, 'limitReached is now TRUE');

    // Attempting a 3rd application MUST be blocked!
    const r13 = await request('/api/challenges/chal-3/apply', {
      method: 'POST',
      body: JSON.stringify({
        startupId: 'start-1',
        title: '3rd Challenge Attempt',
        summary: 'Should be blocked by 2-active limit'
      })
    });
    assert(r13.status === 400, '3rd challenge application BLOCKED with 400 (Max 2 active limit)');
    assert(r13.data.error.includes('Active challenge limit reached (2/2)'), 'Error explicitly mentions 2/2 active challenge limit');

    // 10. Officer Winner Selection Blocked Prior to Expert Approval
    console.log('\n10. Testing Officer Selection Blocked Prior to Expert Approval...');
    const r14 = await request('/api/challenges/chal-2/select-winner', {
      method: 'POST',
      body: JSON.stringify({
        applicationId: jointAppId,
        officerName: 'Director Water Ops',
        selectionRationale: 'Premature selection before expert review'
      })
    });
    assert(r14.status === 400, 'Officer selection is BLOCKED (400) when requiresExpertApproval is pending');

    // 11. Expert Panel Review & Approval Flow
    console.log('\n11. Testing Expert Panel Special Review & Approval...');
    const r15 = await request('/api/challenges/chal-2/applications/' + jointAppId + '/expert-approval', {
      method: 'POST',
      body: JSON.stringify({
        expertId: 'usr-expert-1',
        expertName: 'Prof. Arvind Nambiar',
        decision: 'approved',
        comments: 'Technical consortium validated. Domain complementarity confirmed and both startups are compliant with 2-challenge ceiling.'
      })
    });
    assert(r15.ok, 'Expert approval recorded successfully (200)');
    assert(r15.data.application.expertApprovalStatus === 'approved', 'Status is approved');

    // 12. Officer Winner Selection Succeeds Post Expert Approval
    console.log('\n12. Testing Officer Selection Succeeds Post Expert Approval...');
    const r16 = await request('/api/challenges/chal-2/select-winner', {
      method: 'POST',
      body: JSON.stringify({
        applicationId: jointAppId,
        officerName: 'Director Water Ops',
        selectionRationale: 'Approved after positive technical committee recommendation.',
        milestones: [
          { title: 'Milestone 1: Acoustic Logger Deployment', paymentPercentage: 35 },
          { title: 'Milestone 2: Pipeline Leak Verification', paymentPercentage: 40 },
          { title: 'Milestone 3: Municipal SCADA Handover', paymentPercentage: 25 }
        ]
      })
    });
    assert(r16.ok, 'Officer selection SUCCEEDS once expert has approved (200)');

    // 13. Test Pre-Seeded Special Approval in NeedsReview
    console.log('\n13. Testing Pre-Seeded Special Approval Review on app-4...');
    const r17 = await request('/api/challenges/chal-3/applications/app-4/expert-approval', {
      method: 'POST',
      body: JSON.stringify({
        expertId: 'usr-expert-1',
        expertName: 'Prof. Arvind Nambiar',
        decision: 'approved',
        comments: 'UrjaGrid & UrbanFlow cross-domain battery & edge vision setup approved.'
      })
    });
    assert(r17.ok, 'Pre-seeded special approval on app-4 succeeds (200)');

    console.log('\n=========================================');
    console.log(`SUMMARY: ${passed} passed, ${failed} failed.`);
    console.log('=========================================');

    server.close();
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test execution error:', err);
    server.close();
    process.exit(1);
  }
});
