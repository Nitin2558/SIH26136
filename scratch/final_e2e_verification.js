const http = require('http');

async function makeRequest(path, method = 'GET', headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch (e) { json = data; }
        resolve({ status: res.statusCode, headers: res.headers, data: json });
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runFinalE2EVerification() {
  console.log('================================================================');
  console.log(' FINAL END-TO-END VERIFICATION: PRIVACY & GRANULAR SHARING');
  console.log('================================================================\n');

  const failedTests = [];

  const univA = { role: 'university', universityName: 'IIT Bombay', name: 'Dr. Sharma (IITB)' };
  const univB = { role: 'university', universityName: 'IIT Delhi', name: 'Prof. Gupta (IITD)' };
  const indAuth = { role: 'industry', orgName: 'TechCorp Innovations', name: 'TechCorp Analyst' };
  const citizen = { role: 'citizen', name: 'Public Citizen' };

  let univPrivacy = 'FAIL';
  let industryGranularSharing = 'FAIL';
  let crossUnivIsolation = 'FAIL';
  let directStorageProtection = 'FAIL';
  let revocationStatus = 'FAIL';
  let publicFeedStatus = 'FAIL';

  // 1. Application health check
  console.log('Step 1: Checking application on localhost:5000...');
  const healthRes = await makeRequest('/api/health');
  if (healthRes.status !== 200) {
    failedTests.push('Step 1: App health check failed');
  }

  // 2 & 3. Create Research Evidence in University Portal
  console.log('Step 2 & 3: Creating test research record in University Portal...');
  const createRes = await makeRequest('/api/teams/evidence', 'POST', {
    'x-user-role': univA.role,
    'x-user-university': univA.universityName,
    'x-user-name': univA.name
  }, {
    title: 'E2E Secret Microgrid Controller Firmware',
    evidenceType: 'lab_report',
    description: 'Proprietary firmware source code and test logs for microgrid load balancing.',
    metricsSummary: '99.98% Efficiency • 15ms Response Time',
    fileUrlOrLink: 'https://github.com/iitb-private/microgrid-firmware',
    progressStage: 'TESTING',
    progressPercentage: 80
  });

  const evidId = createRes.data.evidence ? createRes.data.evidence.id : null;
  if (!evidId) {
    failedTests.push('Step 3: Failed to create test research record');
  }

  // Upload private evidence file
  const uploadRes = await makeRequest(`/api/teams/evidence/${evidId}/files`, 'POST', {
    'x-user-role': univA.role,
    'x-user-university': univA.universityName
  }, {
    files: [{
      fileName: 'firmware-assembly-v2.pdf',
      fileType: 'document',
      fileSize: 20480,
      mimeType: 'application/pdf',
      fileData: 'data:application/pdf;base64,QUJDREVGR0g='
    }]
  });

  const fileId = uploadRes.data.files ? uploadRes.data.files[0].id : null;

  // 4. Confirm record is PRIVATE — UNIVERSITY ONLY
  console.log('Step 4: Confirming record visibility state...');
  const univAGet = await makeRequest(`/api/teams/evidence/${evidId}`, 'GET', {
    'x-user-role': univA.role,
    'x-user-university': univA.universityName
  });

  if (univAGet.status === 200 && univAGet.data.evidence.sharingState === 'PRIVATE') {
    univPrivacy = 'PASS';
    console.log('✓ Step 4: Record confirmed as PRIVATE — UNIVERSITY ONLY: PASS');
  } else {
    failedTests.push('Step 4: Record is not marked PRIVATE');
  }

  // 5. Cross-University Isolation Check
  console.log('Step 5: Testing University B access isolation...');
  const univBGet = await makeRequest(`/api/teams/evidence/${evidId}`, 'GET', {
    'x-user-role': univB.role,
    'x-user-university': univB.universityName
  });

  if (univBGet.status === 403) {
    crossUnivIsolation = 'PASS';
    console.log('✓ Step 5: University B access denied (403 Forbidden): PASS');
  } else {
    failedTests.push('Step 5: University B was able to access University A private research');
  }

  // 6. Citizen/Public Access Check
  console.log('Step 6: Testing Citizen/Public access isolation...');
  const citizenGet = await makeRequest(`/api/teams/evidence/${evidId}`, 'GET', {
    'x-user-role': citizen.role
  });

  if (citizenGet.status === 403) {
    console.log('✓ Step 6: Citizen/Public access denied (403 Forbidden): PASS');
  } else {
    failedTests.push('Step 6: Citizen/Public caller accessed private research');
  }

  // 7. Granular Share configuration (Share Title, Progress Stage ONLY. Keep description, metrics, repo, and files UNCHECKED)
  console.log('Step 7: Configured granular share with TechCorp Innovations...');
  const shareRes = await makeRequest(`/api/teams/evidence/${evidId}/share-partner`, 'POST', {
    'x-user-role': univA.role,
    'x-user-university': univA.universityName
  }, {
    partnerName: indAuth.orgName,
    sharedFields: {
      share_title: true,
      share_description: false,     // UNCHECKED
      share_progress_stage: true,   // CHECKED
      share_metrics: false,         // UNCHECKED
      share_tech_findings: false,   // UNCHECKED
      share_demo_info: false,       // UNCHECKED
      share_files: false            // UNCHECKED
    }
  });

  // 8 & 9 & 10 & 11. Open Industry Portal & Confirm Granular Access & Read-Only Status
  console.log('Step 8-11: Fetching shared research as Industry Partner...');
  const indSharedList = await makeRequest('/api/teams/evidence-shared-with-us', 'GET', {
    'x-user-role': indAuth.role,
    'x-user-org': indAuth.orgName
  });

  const indItem = indSharedList.data.evidence ? indSharedList.data.evidence.find(e => e.id === evidId) : null;
  const indFileSignedUrl = await makeRequest(`/api/teams/evidence/files/${fileId}/signed-url`, 'GET', {
    'x-user-role': indAuth.role,
    'x-user-org': indAuth.orgName
  });

  if (
    indItem &&
    indItem.title === 'E2E Secret Microgrid Controller Firmware' &&
    indItem.progressStage === 'TESTING' &&
    indItem.description.includes('Not Shared') &&
    indItem.metricsSummary.includes('Not Shared') &&
    indItem.fileUrlOrLink === null &&
    indItem.files.length === 0 &&
    indItem.isIndustryReadOnly === true &&
    indFileSignedUrl.status === 403
  ) {
    industryGranularSharing = 'PASS';
    console.log('✓ Step 8-11: Granular Industry Sharing & Read-Only Enforcement: PASS');
  } else {
    failedTests.push('Step 8-11: Industry received unshared fields or file signed URLs');
  }

  // 12 & 13. Revoke Industry Access
  console.log('Step 12 & 13: Revoking Industry access...');
  await makeRequest(`/api/teams/evidence/${evidId}/revoke-share`, 'POST', {
    'x-user-role': univA.role,
    'x-user-university': univA.universityName
  }, { partnerName: indAuth.orgName });

  const indListAfterRevoke = await makeRequest('/api/teams/evidence-shared-with-us', 'GET', {
    'x-user-role': indAuth.role,
    'x-user-org': indAuth.orgName
  });
  const indGetDetailAfterRevoke = await makeRequest(`/api/teams/evidence/${evidId}`, 'GET', {
    'x-user-role': indAuth.role,
    'x-user-org': indAuth.orgName
  });

  const foundPostRevoke = indListAfterRevoke.data.evidence ? indListAfterRevoke.data.evidence.find(e => e.id === evidId) : null;

  if (!foundPostRevoke && indGetDetailAfterRevoke.status === 403) {
    revocationStatus = 'PASS';
    console.log('✓ Step 12 & 13: Industry Revocation immediate block (403 Forbidden): PASS');
  } else {
    failedTests.push('Step 12-13: Industry still accessed research post revocation');
  }

  // 14. Direct API / Raw Storage Access Protection
  console.log('Step 14: Testing direct API/storage bypass protection...');
  const directStorageRes = await makeRequest('/storage/v1/object/public/research-evidence/test.pdf', 'GET');
  const directSignedUrlRes = await makeRequest(`/api/teams/evidence/files/${fileId}/signed-url`, 'GET', {
    'x-user-role': citizen.role
  });

  if (directStorageRes.status === 403 && directSignedUrlRes.status === 403) {
    directStorageProtection = 'PASS';
    console.log('✓ Step 14: Direct API/Storage protection (403 Forbidden): PASS');
  } else {
    failedTests.push('Step 14: Direct API or storage bypass succeeded');
  }

  // 15. Verify Public Feed, University Vault & Industry Portal integrity
  console.log('Step 15: Verifying Public Feed & Portal integrity...');
  const feedRes = await makeRequest('/api/problems/feed', 'GET');
  const vaultList = await makeRequest('/api/teams/evidence', 'GET', {
    'x-user-role': univA.role,
    'x-user-university': univA.universityName
  });

  if (feedRes.status === 200 && Array.isArray(feedRes.data.problems) && vaultList.status === 200) {
    publicFeedStatus = 'PASS';
    console.log('✓ Step 15: Public Feed & Portals Operating Normally: PASS');
  } else {
    failedTests.push('Step 15: Public Feed or Vault listing failed');
  }

  // Cleanup test record
  await makeRequest(`/api/teams/evidence/${evidId}`, 'DELETE', {
    'x-user-role': univA.role,
    'x-user-university': univA.universityName
  });

  const finalStatus = (failedTests.length === 0) ? 'PASS' : 'FAIL';

  console.log('\n================================================================');
  console.log(' FINAL VERIFICATION REPORT OUTPUT');
  console.log('================================================================\n');

  console.log(`FINAL END-TO-END STATUS:\n${finalStatus}\n`);
  console.log(`UNIVERSITY PRIVACY:\n${univPrivacy}\n`);
  console.log(`INDUSTRY GRANULAR SHARING:\n${industryGranularSharing}\n`);
  console.log(`CROSS-UNIVERSITY ISOLATION:\n${crossUnivIsolation}\n`);
  console.log(`DIRECT API/STORAGE PROTECTION:\n${directStorageProtection}\n`);
  console.log(`REVOCATION:\n${revocationStatus}\n`);
  console.log(`PUBLIC FEED:\n${publicFeedStatus}\n`);

  console.log('FAILED TESTS:');
  if (failedTests.length === 0) {
    console.log('None');
  } else {
    failedTests.forEach(f => console.log(`- ${f}`));
  }
}

runFinalE2EVerification().catch(console.error);
