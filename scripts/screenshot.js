/**
 * screenshot.js — Playwright full-page website screenshotter
 *
 * Usage (single site):
 *   node scripts/screenshot.js --url https://example.com --out screenshots/example.png
 *
 * Dependencies:
 *   npm install playwright
 *   npx playwright install chromium
 */

import { chromium } from 'playwright';
import { parseArgs } from 'node:util';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const { values } = parseArgs({
  options: {
    url: { type: 'string' },
    out: { type: 'string' },
    width: { type: 'string', default: '1280' },
    timeout: { type: 'string', default: '15000' },
  },
});

if (!values.url || !values.out) {
  console.error('Usage: node scripts/screenshot.js --url <url> --out <path.png>');
  process.exit(1);
}

async function screenshot(url, outPath, width, timeout) {
  // Ensure output directory exists
  mkdirSync(dirname(outPath), { recursive: true });

  // Prefer the locally installed Google Chrome. Playwright's bundled
  // chrome-headless-shell is fingerprinted by common WAFs and gets served a bare
  // 403 page — which screenshots "successfully" and silently poisons the audit.
  // Fall back to bundled chromium only when Chrome isn't installed.
  const launchArgs = ['--disable-blink-features=AutomationControlled'];
  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true, args: launchArgs });
  } catch {
    console.warn('  Google Chrome not found, falling back to bundled chromium (some sites will 403)...');
    browser = await chromium.launch({ headless: true, args: launchArgs });
  }
  const context = await browser.newContext({
    viewport: { width: parseInt(width), height: 900 },
    locale: 'en-US',
    timezoneId: 'America/Chicago',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    extraHTTPHeaders: { 'Accept-Language': 'en-US,en;q=0.9' },
  });

  const page = await context.newPage();

  // Block heavy third-party widgets that can crash the browser
  await page.route('**/*', (route) => {
    const url = route.request().url();
    const blocked = [
      'tiktok.com', 'klaviyo.com', 'hotjar.com',
      'livechat', 'crisp.chat', 'intercom.io',
      'zdassets.com', 'tidio.co',
    ];
    if (blocked.some(domain => url.includes(domain))) {
      return route.abort();
    }
    return route.continue();
  });

  try {
    try {
      const resp = await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: parseInt(timeout),
      });
      // A blocked request still renders and screenshots cleanly. Say so loudly
      // rather than handing the auditor a picture of an error page.
      if (resp && resp.status() >= 400) {
        console.warn(`  WARNING: ${url} returned HTTP ${resp.status()} — the capture is of an error page, not the site.`);
      }
    } catch (e) {
      // If networkidle times out, try domcontentloaded as fallback
      console.warn(`  networkidle timeout, falling back to domcontentloaded...`);
      try {
        await page.goto(url, {
          waitUntil: 'domcontentloaded',
          timeout: parseInt(timeout),
        });
      } catch (e2) {
        console.warn(`  domcontentloaded also failed, capturing whatever rendered...`);
      }
      await page.waitForTimeout(2000);
    }

    // Scroll in stages to trigger lazy-loaded and dynamically rendered content
    // Many modern sites only load sections as you scroll to them
    try {
      const pageHeight = await page.evaluate(() => document.body.scrollHeight);
      const steps = 5;
      for (let i = 1; i <= steps; i++) {
        await page.evaluate((y) => window.scrollTo(0, y), (pageHeight / steps) * i);
        await page.waitForTimeout(1500);
      }
      // Scroll back to top and let everything settle
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(2000);
    } catch (scrollErr) {
      console.warn(`  scroll failed (page may have crashed), capturing current state...`);
    }

    await page.screenshot({
      path: outPath,
      fullPage: true,
    });
  } catch (captureErr) {
    // Last resort — try a viewport-only screenshot (not full page)
    console.warn(`  full-page screenshot failed, trying viewport capture...`);
    try {
      await page.screenshot({ path: outPath, fullPage: false });
    } catch (finalErr) {
      console.error(`  could not capture any screenshot: ${finalErr.message}`);
      await browser.close();
      throw finalErr;
    }
  }

  await browser.close();
  return outPath;
}

// Run
screenshot(values.url, values.out, values.width, values.timeout)
  .then(path => console.log(`Screenshot saved: ${path}`))
  .catch(err => {
    console.error('Screenshot failed:', err.message);
    process.exit(1);
  });
