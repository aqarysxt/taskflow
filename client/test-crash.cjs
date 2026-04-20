const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER ERROR:', msg.text());
    }
  });

  page.on('pageerror', err => {
    console.log('PAGE ERROR:', err.toString());
  });

  try {
    console.log('Navigating to http://localhost:5173/calendar...');
    await page.goto('http://localhost:5173/calendar', { waitUntil: 'domcontentloaded', timeout: 5000 });
    console.log('Navigation complete. Waiting a bit to catch errors...');
    await new Promise(r => setTimeout(r, 2000));
  } catch (err) {
    console.log('Goto error:', err);
  } finally {
    await browser.close();
  }
})();
