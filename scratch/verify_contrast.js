import * as puppeteerModule from '../frontend/node_modules/puppeteer-core/lib/puppeteer/index.js';
const puppeteer = puppeteerModule.default || puppeteerModule.puppeteer || puppeteerModule;
import fs from 'fs';
import path from 'path';

function getLuminance(r, g, b) {
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function parseRgb(colorStr) {
  const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return [0, 0, 0];
  return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
}

function contrastRatio(rgb1, rgb2) {
  const lum1 = getLuminance(...rgb1);
  const lum2 = getLuminance(...rgb2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

async function run() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('--- Testing Light Mode (Government Dashboard) ---');
  await page.goto('http://localhost:4173/#govt-dashboard', { waitUntil: 'networkidle0' });
  
  // Set demo user persona if not logged in
  await page.evaluate(() => {
    localStorage.setItem('samadhan_theme', 'light');
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');
    const demoGovt = {
      id: 'usr-govt-1',
      name: 'Dr. Sunita Verma',
      email: 'sunita.verma@gov.in',
      role: 'government',
      departmentName: 'Department of Urban Infrastructure & Smart Cities, Maharashtra',
      designation: 'Director of Urban Modernization',
      locationState: 'Maharashtra',
      isDemo: true
    };
    localStorage.setItem('civic_user', JSON.stringify(demoGovt));
    localStorage.setItem('civic_token', 'demo-token');
  });

  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  const lightHeading = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    const cs = window.getComputedStyle(h1);
    const bodyCs = window.getComputedStyle(document.body);
    const card = document.querySelector('.lg\\:col-span-7');
    const cardCs = card ? window.getComputedStyle(card) : null;
    return {
      h1Text: h1?.innerText,
      h1Color: cs.color,
      bodyBg: bodyCs.backgroundColor,
      cardBg: cardCs?.backgroundColor,
      cardColor: cardCs?.color
    };
  });
  console.log('Light Mode Styles:', lightHeading);

  const outDir = 'C:\\Users\\Nitin\\Downloads\\SIH 2 - Copy\\scratch';
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  await page.screenshot({ path: path.join(outDir, 'officer_dashboard_light.png'), fullPage: false });

  console.log('--- Testing Dark Mode (Government Dashboard) ---');
  // Toggle theme to dark
  await page.evaluate(() => {
    const themeBtn = document.querySelector('button[title*="Dark"], button[title*="Light"]');
    if (themeBtn) {
      themeBtn.click();
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('samadhan_theme', 'dark');
    }
  });

  await new Promise(r => setTimeout(r, 600));

  const darkHeading = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    const cs = window.getComputedStyle(h1);
    const bodyCs = window.getComputedStyle(document.body);
    const card = document.querySelector('.lg\\:col-span-7');
    const cardCs = card ? window.getComputedStyle(card) : null;
    const taskItem = document.querySelector('.lg\\:col-span-7 p');
    const taskCs = taskItem ? window.getComputedStyle(taskItem) : null;
    const metricCard = document.querySelector('.grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-4 > div');
    const metricCs = metricCard ? window.getComputedStyle(metricCard) : null;
    const metricLabel = metricCard?.querySelector('span');
    const metricLabelCs = metricLabel ? window.getComputedStyle(metricLabel) : null;
    const isDark = document.documentElement.classList.contains('dark');
    return {
      isDark,
      h1Text: h1?.innerText,
      h1Color: cs.color,
      bodyBg: bodyCs.backgroundColor,
      cardBg: cardCs?.backgroundColor,
      taskColor: taskCs?.color,
      metricCardBg: metricCs?.backgroundColor,
      metricLabelColor: metricLabelCs?.color
    };
  });
  console.log('Dark Mode Styles:', darkHeading);

  const darkH1Ratio = contrastRatio(parseRgb(darkHeading.h1Color), parseRgb(darkHeading.bodyBg));
  const darkTaskRatio = contrastRatio(parseRgb(darkHeading.taskColor), parseRgb(darkHeading.cardBg));
  console.log(`Contrast Ratios in Dark Mode: H1 = ${darkH1Ratio.toFixed(2)}, Task = ${darkTaskRatio.toFixed(2)}`);

  await page.screenshot({ path: path.join(outDir, 'officer_dashboard_dark.png'), fullPage: false });

  console.log('--- Testing Refresh Theme Persistence in Dark Mode ---');
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  const afterRefreshIsDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
  console.log('After reload isDark:', afterRefreshIsDark);

  console.log('--- Testing Pilot Command Center Navigation ---');
  await page.evaluate(() => {
    window.location.hash = '#workspace/pilot-1';
  });
  await new Promise(r => setTimeout(r, 1000));

  const commandCenterStyles = await page.evaluate(() => {
    const isDark = document.documentElement.classList.contains('dark');
    const h1 = document.querySelector('h1') || document.querySelector('h2');
    const cs = h1 ? window.getComputedStyle(h1) : null;
    const bodyCs = window.getComputedStyle(document.body);
    return {
      isDark,
      headingText: h1?.innerText,
      headingColor: cs?.color,
      bodyBg: bodyCs.backgroundColor
    };
  });
  console.log('Pilot Command Center Dark Mode Styles:', commandCenterStyles);
  await page.screenshot({ path: path.join(outDir, 'pilot_command_center_dark.png'), fullPage: false });

  // Switch to light mode in Pilot Command Center
  await page.evaluate(() => {
    const themeBtn = document.querySelector('button[title*="Light"], button[title*="Dark"]');
    if (themeBtn) themeBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  const commandCenterLightStyles = await page.evaluate(() => {
    const isDark = document.documentElement.classList.contains('dark');
    const h1 = document.querySelector('h1') || document.querySelector('h2');
    const cs = h1 ? window.getComputedStyle(h1) : null;
    const bodyCs = window.getComputedStyle(document.body);
    return {
      isDark,
      headingText: h1?.innerText,
      headingColor: cs?.color,
      bodyBg: bodyCs.backgroundColor
    };
  });
  console.log('Pilot Command Center Light Mode Styles:', commandCenterLightStyles);
  await page.screenshot({ path: path.join(outDir, 'pilot_command_center_light.png'), fullPage: false });

  await browser.close();
  console.log('Verification completed successfully!');
}

run().catch(err => {
  console.error('Error running verification:', err);
  process.exit(1);
});
