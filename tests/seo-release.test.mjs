import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

const origin = 'https://rockcoveragecalculator.com';
const config = JSON.parse(await fs.readFile('vercel.json', 'utf8'));
const aliases = new Set(config.redirects.map(rule => rule.source));
const sitemap = await fs.readFile('dist/sitemap.xml', 'utf8');
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
const attributes = tag => Object.fromEntries([...tag.matchAll(/([\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)].map(m => [m[1].toLowerCase(), m[2] ?? m[3] ?? m[4]]));
const pages = [];
async function walk(directory) {
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) await walk(file);
    else if (entry.name.endsWith('.html')) {
      let route = '/' + path.relative('dist', file).replaceAll('\\', '/').replace(/(?:\/)?index\.html$/, '').replace(/\.html$/, '');
      route = route.replace(/\/$/, '') || '/';
      pages.push({ route, html: await fs.readFile(file, 'utf8') });
    }
  }
}
await walk('dist');

test('all content routes stay indexable with their own canonical and belong in the sitemap', () => {
  assert.equal(new Set(urls).size, urls.length, 'duplicate sitemap entries');
  const expected = new Set(pages.filter(p => !['/embed', '/404'].includes(p.route) && !aliases.has(p.route)).map(p => new URL(p.route, origin).href));
  assert.deepEqual(new Set(urls), expected, 'sitemap must include every indexable content route');
  for (const page of pages) {
    const tags = [...page.html.matchAll(/<(?:meta|link)\b[^>]*>/gi)].map(m => attributes(m[0]));
    const robotTags = tags.filter(a => ['robots', 'googlebot'].includes(a.name?.toLowerCase()));
    const canonical = tags.find(a => a.rel === 'canonical')?.href;
    if (['/embed', '/404'].includes(page.route) || aliases.has(page.route)) {
      assert.ok(robotTags.some(a => /noindex/i.test(a.content)), page.route);
      assert.ok(!urls.includes(new URL(page.route, origin).href), page.route);
    } else {
      assert.ok(robotTags.length > 0, page.route);
      assert.ok(robotTags.every(a => !/noindex|\bnone\b/i.test(a.content)), page.route);
      assert.equal(canonical, new URL(page.route, origin).href, page.route);
      assert.equal([...page.html.matchAll(/<h1\b/g)].length, 1, page.route);
    }
  }
});

test('all sitemap pages are reachable through links starting at the homepage', () => {
  const byRoute = new Map(pages.map(p => [p.route, p]));
  const visited = new Set(['/']), queue = ['/'];
  while (queue.length) {
    const route = queue.shift();
    for (const match of byRoute.get(route).html.matchAll(/<a\b[^>]*>/gi)) {
      const href = attributes(match[0]).href;
      if (!href) continue;
      const url = new URL(href, origin + route);
      const target = url.pathname.replace(/\/$/, '') || '/';
      if (url.origin === origin && byRoute.has(target) && !visited.has(target)) {
        visited.add(target); queue.push(target);
      }
    }
  }
  for (const url of urls) assert.ok(visited.has(new URL(url).pathname), url);
});

test('release configuration preserves crawl access and redirects aliases without a global noindex header', async () => {
  const robots = await fs.readFile('public/robots.txt', 'utf8');
  assert.ok(!/^Disallow:\s*\/\s*$/mi.test(robots));
  assert.match(robots, /^Sitemap: https:\/\/rockcoveragecalculator\.com\/sitemap\.xml$/m);
  for (const rule of config.redirects) {
    assert.equal(rule.permanent, true);
    assert.ok(pages.some(p => p.route === rule.destination));
  }
  for (const rule of config.headers) {
    for (const header of rule.headers) if (header.key.toLowerCase() === 'x-robots-tag' && /noindex/i.test(header.value)) assert.equal(rule.source, '/embed');
  }
  const layout = await fs.readFile('src/layouts/BaseLayout.astro', 'utf8');
  const publisher = layout.match(/ca-(pub-\d+)/)?.[1];
  assert.ok(publisher);
  assert.match(await fs.readFile('public/ads.txt', 'utf8'), new RegExp('^google\\.com, ' + publisher + ', DIRECT, f08c47fec0942fa0$', 'm'));
});
