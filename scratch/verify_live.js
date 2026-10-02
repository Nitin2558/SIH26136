async function verifyLive() {
  console.log('=== Starting Live Verification of AI Classification & Extraction ===\n');
  const baseUrl = 'http://localhost:5000';

  // 1. Health check
  const healthRes = await fetch(`${baseUrl}/api/health`);
  const health = await healthRes.json();
  console.log('1. Health Check:', health.status === 'ok' ? '✓ OK' : '✗ FAIL', `(Problems: ${health.problemsCount}, LLM: ${health.llmConfigured})`);

  // 2. Test AI Analyze endpoint with "just kidding"
  const analyzeSpam1 = await (await fetch(`${baseUrl}/api/problems/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description: 'just kidding' })
  })).json();

  console.log('\n2. Analyze "just kidding":');
  console.log('   Status:', analyzeSpam1.status);
  console.log('   IsSpam:', analyzeSpam1.isSpam);
  console.log('   Reason:', analyzeSpam1.aiReason);
  const pass1 = analyzeSpam1.status === 'spam-rejected' && analyzeSpam1.isSpam === true;
  console.log('   Result:', pass1 ? '✓ PASS' : '✗ FAIL');

  // 3. Test AI Analyze endpoint with "just spam"
  const analyzeSpam2 = await (await fetch(`${baseUrl}/api/problems/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description: 'just spam' })
  })).json();

  console.log('\n3. Analyze "just spam":');
  console.log('   Status:', analyzeSpam2.status);
  console.log('   IsSpam:', analyzeSpam2.isSpam);
  const pass2 = analyzeSpam2.status === 'spam-rejected' && analyzeSpam2.isSpam === true;
  console.log('   Result:', pass2 ? '✓ PASS' : '✗ FAIL');

  // 4. Test Submitting "just kidding" via /submit (Must be rejected)
  const submitSpamRes = await fetch(`${baseUrl}/api/problems/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'just kidding',
      description: 'just kidding'
    })
  });
  const submitSpamData = await submitSpamRes.json();
  console.log('\n4. Attempt Submit "just kidding":');
  console.log('   HTTP Status Code:', submitSpamRes.status);
  console.log('   Rejected as Spam:', submitSpamData.isSpam);
  console.log('   Message:', submitSpamData.error);
  const pass3 = submitSpamRes.status === 400 && submitSpamData.isSpam === true;
  console.log('   Result:', pass3 ? '✓ PASS (Correctly blocked from DB)' : '✗ FAIL');

  // 5. Test Analyze with a General Grievance
  const analyzeGrievance = await (await fetch(`${baseUrl}/api/problems/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      description: 'There is a huge pothole and broken streetlight outside my house on MG road for 2 weeks, garbage is dumped everywhere.'
    })
  })).json();

  console.log('\n5. Analyze Local Grievance (Pothole/Streetlight):');
  console.log('   Status:', analyzeGrievance.status);
  console.log('   Category:', analyzeGrievance.category);
  console.log('   Solution Type:', analyzeGrievance.solutionType, `(${analyzeGrievance.solutionTypeLabel})`);
  console.log('   Suggested Title:', analyzeGrievance.suggestedTitle);
  console.log('   Redirect Portal:', analyzeGrievance.redirectPortal?.portalName);
  const pass4 = analyzeGrievance.status === 'general-grievance' && analyzeGrievance.solutionType === 'administrative';
  console.log('   Result:', pass4 ? '✓ PASS' : '✗ FAIL');

  // 6. Test Analyze with an Education Research Challenge
  const analyzeEdu = await (await fetch(`${baseUrl}/api/problems/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      description: 'Schools in remote tribal areas have zero internet connectivity, so teachers cannot access state digital curriculum or sync student attendance records. Need an offline-first mesh network and local micro-server for classroom tablets.'
    })
  })).json();

  console.log('\n6. Analyze Tribal Education Challenge:');
  console.log('   Status:', analyzeEdu.status);
  console.log('   Category:', analyzeEdu.category);
  console.log('   Solution Type:', analyzeEdu.solutionType, `(${analyzeEdu.solutionTypeLabel})`);
  console.log('   Suggested Title:', analyzeEdu.suggestedTitle);
  console.log('   Key Tech:', analyzeEdu.keyTechnologies?.join(', '));
  const pass5 = analyzeEdu.status === 'research-worthy' && analyzeEdu.category === 'Education';
  console.log('   Result:', pass5 ? '✓ PASS' : '✗ FAIL');

  // 7. Test Submitting a Real Research Challenge (Auto-Title & Sector)
  const submitValidRes = await fetch(`${baseUrl}/api/problems/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      description: 'Rising groundwater fluoride levels in rural Nagaur exceed 5.5mg/L causing severe skeletal fluorosis. We need a low-cost solar-powered graphene nanomembrane filtration unit that works off-grid.',
      locationState: 'Rajasthan',
      locationDistrict: 'Nagaur'
    })
  });
  const submitValidData = await submitValidRes.json();
  console.log('\n7. Submit Real Challenge (with AI auto-generated title & category):');
  console.log('   HTTP Status Code:', submitValidRes.status);
  console.log('   Stored Title:', submitValidData.problem?.title);
  console.log('   Stored Category:', submitValidData.problem?.category);
  console.log('   Stored Solution Type:', submitValidData.problem?.solutionType, `(${submitValidData.problem?.solutionTypeLabel})`);
  console.log('   Status:', submitValidData.problem?.status);
  const pass6 = submitValidRes.status === 200 && submitValidData.problem?.status === 'research-worthy';
  console.log('   Result:', pass6 ? '✓ PASS' : '✗ FAIL');

  // 8. Verify Feed doesn't contain spam
  const feedRes = await (await fetch(`${baseUrl}/api/problems/feed`)).json();
  const spamInFeed = feedRes.problems.filter(p => {
    const t = (p.title || '').toLowerCase();
    return t.includes('just kid') || t.includes('just spam');
  });
  console.log('\n8. Checking Public Feed:');
  console.log('   Total Approved Problems in Feed:', feedRes.problems.length);
  console.log('   Spam Items in Feed:', spamInFeed.length);
  const pass7 = spamInFeed.length === 0;
  console.log('   Result:', pass7 ? '✓ PASS (No spam in public feed)' : '✗ FAIL');

  console.log('\n=============================================================');
  const allPass = pass1 && pass2 && pass3 && pass4 && pass5 && pass6 && pass7;
  if (allPass) {
    console.log('🎉 ALL LIVE VERIFICATION CHECKS PASSED PERFECTLY!');
  } else {
    console.error('❌ Some checks failed.');
  }
}

verifyLive();
