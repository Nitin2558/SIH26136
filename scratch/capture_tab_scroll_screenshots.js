const puppeteer = require('c:/Users/Nitin/Downloads/SIH 2 - Copy/frontend/node_modules/puppeteer-core');
const path = require('path');
const fs = require('fs');

const chromePath = fs.existsSync('C:/Program Files/Google/Chrome/Application/chrome.exe')
  ? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
  : 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';

const artifactDir = 'C:/Users/Nitin/.gemini/antigravity/brain/60e02cb2-25c7-4d45-8c4e-536dc0137c23';
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function run() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,1100']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1100 });

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

  // 1. CleanRoute Pilot Command Center - Scrolled to Conversation Tab
  console.log('Navigating to #workspace/pilot-1 ...');
  await page.goto('http://localhost:3000/#workspace/pilot-1', { waitUntil: 'networkidle2' });
  await sleep(1500);

  // Click Pilot Conversation tab
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const convBtn = buttons.find(btn => btn.textContent.includes('Pilot Conversation'));
    if (convBtn) {
      convBtn.click();
      convBtn.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
  });
  await sleep(1500);

  const convTabPath = path.join(artifactDir, 'screenshot_pilot_conversation_stream_scrolled.png');
  await page.screenshot({ path: convTabPath, fullPage: false });
  console.log('Saved conversation stream screenshot:', convTabPath);

  // 2. Unauthorized Startup Attempt
  console.log('Testing unauthorized startup view...');
  const pageUnauthorized = await browser.newPage();
  await pageUnauthorized.setViewport({ width: 1440, height: 1100 });
  await pageUnauthorized.evaluateOnNewDocument(() => {
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

  await pageUnauthorized.goto('http://localhost:3000/#workspace/pilot-1', { waitUntil: 'networkidle2' });
  await sleep(1500);

  await pageUnauthorized.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const convBtn = buttons.find(btn => btn.textContent.includes('Pilot Conversation'));
    if (convBtn) {
      convBtn.click();
      convBtn.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
  });
  await sleep(1500);

  const forbiddenScrolledPath = path.join(artifactDir, 'screenshot_unauthorized_startup_403_scrolled.png');
  await pageUnauthorized.screenshot({ path: forbiddenScrolledPath, fullPage: false });
  console.log('Saved forbidden 403 scrolled screenshot:', forbiddenScrolledPath);

  // 3. Officer Dashboard Section D (All Projects list with Command Center buttons)
  console.log('Navigating to #govt-dashboard and scrolling to All Projects...');
  await page.goto('http://localhost:3000/#govt-dashboard', { waitUntil: 'networkidle2' });
  await sleep(1500);
  await page.evaluate(() => {
    const el = document.getElementById('project-P1');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await sleep(1000);

  const dashProjectsPath = path.join(artifactDir, 'screenshot_officer_dashboard_all_projects_scrolled.png');
  await page.screenshot({ path: dashProjectsPath, fullPage: false });
  console.log('Saved dashboard all projects screenshot:', dashProjectsPath);

  await browser.close();
  console.log('Done capturing targeted screenshots!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
