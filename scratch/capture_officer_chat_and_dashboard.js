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
    localStorage.setItem('civic_user', JSON.stringify({
      id: 'usr-govt-1',
      name: 'Dr. Sunita Verma',
      email: 'sunita.verma@gov.in',
      role: 'government',
      departmentName: 'Department of Urban Infrastructure & Smart Cities, Maharashtra',
      designation: 'Director of Urban Modernization',
      locationState: 'Maharashtra',
      isDemo: true
    }));
  });

  // 1. CleanRoute Pilot Command Center - Conversation Tab with Officer signed in
  console.log('Navigating to #workspace/pilot-1 as Officer...');
  await page.goto('http://localhost:3000/#workspace/pilot-1', { waitUntil: 'networkidle2' });
  await sleep(2000);

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

  // Type and submit a new message in the composer
  console.log('Sending a message in Pilot Conversation...');
  await page.type('textarea[placeholder*="Type an update"]', 'Officer review update: 3rd-party lab audit verified by IIT Delhi. Payment authorization approved in system.');
  await sleep(500);

  const postBtnClicked = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent.includes('Post Message'));
    if (btn) { btn.click(); return true; }
    return false;
  });
  console.log('Clicked post message button:', postBtnClicked);
  await sleep(2000);

  const officerConvPath = path.join(artifactDir, 'screenshot_pilot_conversation_stream_officer_verified.png');
  await page.screenshot({ path: officerConvPath, fullPage: false });
  console.log('Saved officer conversation stream screenshot:', officerConvPath);

  // 2. Officer Dashboard Section D (All Projects list with Command Center buttons)
  console.log('Navigating to #govt-dashboard and scrolling to All Projects...');
  await page.goto('http://localhost:3000/#govt-dashboard', { waitUntil: 'networkidle2' });
  await sleep(2000);
  await page.evaluate(() => {
    const el = document.getElementById('project-P1');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await sleep(1000);

  const dashProjectsPath = path.join(artifactDir, 'screenshot_officer_dashboard_all_projects_scrolled.png');
  await page.screenshot({ path: dashProjectsPath, fullPage: false });
  console.log('Saved dashboard all projects screenshot:', dashProjectsPath);

  await browser.close();
  console.log('Done capturing all screenshots successfully!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
