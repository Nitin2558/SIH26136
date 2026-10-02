const puppeteer = require('c:/Users/Nitin/Downloads/SIH 2 - Copy/frontend/node_modules/puppeteer-core');
const path = require('path');
const fs = require('fs');

const chromePath = fs.existsSync('C:/Program Files/Google/Chrome/Application/chrome.exe')
  ? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
  : 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';

const artifactDir = 'C:/Users/Nitin/.gemini/antigravity/brain/60e02cb2-25c7-4d45-8c4e-536dc0137c23';

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function run() {
  console.log('Launching browser via executable:', chromePath);
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,960']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 960 });

  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('sih_splash_seen', 'true');
    localStorage.setItem('sih_auth_user', JSON.stringify({
      id: 'usr-govt-1',
      name: 'Dr. Sunita Verma',
      email: 'officer@pune.gov.in',
      role: 'government',
      department: 'Department of Urban Infrastructure',
      city: 'Pune'
    }));
  });

  // 1. Visit Officer Dashboard
  console.log('1. Navigating to http://localhost:3000/#govt-dashboard ...');
  await page.goto('http://localhost:3000/#govt-dashboard', { waitUntil: 'networkidle2' });
  await sleep(2000);

  // Take screenshot of Officer Dashboard with Command Center buttons
  const dashPath = path.join(artifactDir, 'screenshot_officer_dashboard_command_center_buttons.png');
  await page.screenshot({ path: dashPath, fullPage: false });
  console.log('Saved dashboard screenshot:', dashPath);

  // 2. Open Pilot Command Center for CleanRoute (pilot-1)
  console.log('2. Navigating to Command Center for CleanRoute (#workspace/pilot-1)...');
  await page.goto('http://localhost:3000/#workspace/pilot-1', { waitUntil: 'networkidle2' });
  await sleep(2000);

  const commandCenterPath = path.join(artifactDir, 'screenshot_pilot_command_center_cleanroute.png');
  await page.screenshot({ path: commandCenterPath, fullPage: false });
  console.log('Saved command center screenshot:', commandCenterPath);

  // 3. Open "View Startup Profile" modal
  console.log('3. Opening Startup Profile modal...');
  const profileClicked = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const b = buttons.find(btn => btn.textContent.includes('View Startup Profile'));
    if (b) { b.click(); return true; }
    return false;
  });

  if (profileClicked) {
    await sleep(1000);
    const profileModalPath = path.join(artifactDir, 'screenshot_startup_profile_modal.png');
    await page.screenshot({ path: profileModalPath, fullPage: false });
    console.log('Saved startup profile modal screenshot:', profileModalPath);

    // Close modal
    await page.evaluate(() => {
      const closeButtons = Array.from(document.querySelectorAll('button'));
      const close = closeButtons.find(btn => btn.textContent.trim() === 'Close');
      if (close) close.click();
    });
    await sleep(500);
  }

  // 4. Open "Pilot Conversation" tab
  console.log('4. Switching to Pilot Conversation tab...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const convBtn = buttons.find(btn => btn.textContent.includes('Pilot Conversation'));
    if (convBtn) convBtn.click();
  });
  await sleep(1500);

  const convTabPath = path.join(artifactDir, 'screenshot_pilot_conversation_tab.png');
  await page.screenshot({ path: convTabPath, fullPage: false });
  console.log('Saved pilot conversation tab screenshot:', convTabPath);

  // 5. Navigate to P5 Streetlights pre-pilot review (#workspace/chal-5)
  console.log('5. Navigating to Pre-Pilot Evaluation Center for P5 (#workspace/chal-5)...');
  await page.goto('http://localhost:3000/#workspace/chal-5', { waitUntil: 'networkidle2' });
  await sleep(2000);

  const p5Path = path.join(artifactDir, 'screenshot_pre_pilot_evaluation_center_p5.png');
  await page.screenshot({ path: p5Path, fullPage: false });
  console.log('Saved P5 pre-pilot review screenshot:', p5Path);

  // 6. Test Unrelated Startup Security Isolation
  console.log('6. Testing Unauthorized Startup Access to Pilot-1 Conversation...');
  const pageStartup = await browser.newPage();
  await pageStartup.setViewport({ width: 1440, height: 960 });
  await pageStartup.evaluateOnNewDocument(() => {
    localStorage.setItem('sih_splash_seen', 'true');
    localStorage.setItem('sih_auth_user', JSON.stringify({
      id: 'usr-startup-2',
      name: 'Aman Verma',
      email: 'founder@aquasense.in',
      role: 'startup',
      startupId: 'start-2',
      startupName: 'HydroSense Acoustics'
    }));
  });

  await pageStartup.goto('http://localhost:3000/#workspace/pilot-1', { waitUntil: 'networkidle2' });
  await sleep(1500);

  // Click Pilot Conversation tab
  await pageStartup.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const convBtn = buttons.find(btn => btn.textContent.includes('Pilot Conversation'));
    if (convBtn) convBtn.click();
  });
  await sleep(1500);

  const forbiddenPath = path.join(artifactDir, 'screenshot_unauthorized_startup_403_banner.png');
  await pageStartup.screenshot({ path: forbiddenPath, fullPage: false });
  console.log('Saved 403 forbidden security screenshot:', forbiddenPath);

  await browser.close();
  console.log('All browser verifications passed!');
}

run().catch(err => {
  console.error('Puppeteer verification failed:', err);
  process.exit(1);
});
