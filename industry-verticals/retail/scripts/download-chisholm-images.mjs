/**
 * One-off: crawl chisholm.edu.au (bounded), collect image URLs, download to disk.
 * Run from retail/: node scripts/download-chisholm-images.mjs
 */
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'fs/promises';
import { createHash } from 'crypto';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const START = 'https://www.chisholm.edu.au/';
const MAX_PAGES = 40;
const OUT_DIR = join(__dirname, '..', '.tmp-chisholm-images');

function normalizeHost(u) {
  const x = new URL(u);
  if (x.hostname === 'chisholm.edu.au') x.hostname = 'www.chisholm.edu.au';
  return x.href.split('#')[0];
}

async function collectImageUrls(page) {
  return page.evaluate(() => {
    const urls = new Set();

    const add = (u) => {
      if (!u || u.startsWith('data:')) return;
      try {
        urls.add(new URL(u, document.baseURI).href);
      } catch {
        /* ignore */
      }
    };

    for (const el of document.querySelectorAll('img[src], img[srcset]')) {
      if (el.src) add(el.src);
      if (el.srcset) {
        el.srcset.split(',').forEach((part) => {
          const u = part.trim().split(/\s+/)[0];
          if (u) add(u);
        });
      }
    }
    for (const el of document.querySelectorAll('picture source[src], picture source[srcset]')) {
      if (el.src) add(el.src);
      if (el.srcset) {
        el.srcset.split(',').forEach((part) => {
          const u = part.trim().split(/\s+/)[0];
          if (u) add(u);
        });
      }
    }
    for (const el of document.querySelectorAll('link[rel~=icon], link[rel~=apple-touch-icon]')) {
      if (el.href) add(el.href);
    }

    return [...urls];
  });
}

async function collectSameOriginLinks(page) {
  return page.evaluate(() => {
    const allowed = new Set(['www.chisholm.edu.au', 'chisholm.edu.au']);
    const out = [];
    const base = document.baseURI;
    for (const a of document.querySelectorAll('a[href]')) {
      try {
        const u = new URL(a.getAttribute('href'), base);
        if (!allowed.has(u.hostname)) continue;
        u.hash = '';
        if (u.pathname && !u.pathname.match(/\.(pdf|zip|docx?|xlsx?)$/i)) out.push(u.href);
      } catch {
        /* ignore */
      }
    }
    return [...new Set(out)];
  });
}

function safeFilename(url) {
  const u = new URL(url);
  const base = u.pathname.split('/').filter(Boolean).pop() || 'image';
  const extMatch = base.match(/\.(jpg|jpeg|png|gif|webp|svg|ico|avif)$/i);
  const ext = extMatch ? extMatch[0].toLowerCase() : '';
  const stem = ext ? base.slice(0, -ext.length) : base;
  const hash = createHash('sha256').update(url).digest('hex').slice(0, 12);
  const clean = stem.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 80);
  return `${clean || 'img'}_${hash}${ext || '.bin'}`;
}

async function downloadFile(url, destPath) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; ImageMirror/1.0; +educational)',
      Accept: 'image/*,*/*;q=0.8',
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(destPath, buf);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();

  const toVisit = [normalizeHost(START)];
  const visited = new Set();
  const allImages = new Set();

  while (toVisit.length && visited.size < MAX_PAGES) {
    const raw = toVisit.shift();
    const url = normalizeHost(raw);
    if (visited.has(url)) continue;
    visited.add(url);

    try {
      const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45_000 });
      if (!resp || resp.status() >= 400) continue;
    } catch (e) {
      console.warn('Skip (load failed):', url, e.message);
      continue;
    }

    const imgs = await collectImageUrls(page);
    for (const i of imgs) {
      try {
        const abs = new URL(i).href;
        if (abs.startsWith('data:')) continue;
        allImages.add(abs);
      } catch {
        /* ignore */
      }
    }

    if (visited.size < MAX_PAGES) {
      const links = await collectSameOriginLinks(page);
      for (const l of links) {
        const n = normalizeHost(l);
        if (!visited.has(n) && !toVisit.includes(n)) toVisit.push(n);
      }
    }

    console.log(`Page ${visited.size}/${MAX_PAGES}: ${url} — ${imgs.length} images on page`);
  }

  await browser.close();

  console.log(`\nUnique image URLs: ${allImages.size}\nDownloading to ${OUT_DIR}\n`);

  let ok = 0;
  let fail = 0;
  for (const imageUrl of allImages) {
    const name = safeFilename(imageUrl);
    const dest = join(OUT_DIR, name);
    try {
      await downloadFile(imageUrl, dest);
      ok++;
      console.log('OK', name);
    } catch (e) {
      fail++;
      console.warn('FAIL', imageUrl, e.message);
    }
  }

  console.log(`\nDone. Saved: ${ok}, failed: ${fail}, folder: ${OUT_DIR}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
