import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import fs from 'node:fs/promises';
import http from 'node:http';
import { createStaticServer } from '../server.js';

const server = createStaticServer();
let base;
before(async () => { server.listen(0, '127.0.0.1'); await once(server, 'listening'); base = 'http://127.0.0.1:' + server.address().port; });
after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));

test('every sitemap page serves HTML with status 200 and no noindex header', async () => {
  const sitemap = await fs.readFile('dist/sitemap.xml', 'utf8');
  for (const match of sitemap.matchAll(/<loc>(.*?)<\/loc>/g)) {
    const response = await fetch(base + new URL(match[1]).pathname);
    assert.equal(response.status, 200, match[1]);
    assert.match(response.headers.get('content-type'), /text\/html/, match[1]);
    assert.ok(!/noindex/i.test(response.headers.get('x-robots-tag') || ''), match[1]);
    await response.body.cancel();
  }
});

test('missing pages and assets return genuine 404s and never the homepage', async () => {
  for (const route of ['/missing-release-test', '/missing-release-test.js', '/404']) {
    const response = await fetch(base + route);
    assert.equal(response.status, 404, route);
    const body = await response.text();
    assert.match(body, /We couldn’t find that page/);
    assert.doesNotMatch(body, /<title>Rock Coverage Calculator<\/title>/);
  }
});

test('aliases permanently redirect with their query string and embed is noindex', async () => {
  const config = JSON.parse(await fs.readFile('vercel.json', 'utf8'));
  for (const rule of config.redirects) for (const suffix of ['', '/']) {
    const response = await fetch(base + rule.source + suffix + '?ref=test', { redirect: 'manual' });
    assert.equal(response.status, 308);
    assert.equal(response.headers.get('location'), rule.destination + '?ref=test');
    await response.body.cancel();
  }
  const embed = await fetch(base + '/embed');
  assert.equal(embed.status, 200);
  assert.match(embed.headers.get('x-robots-tag'), /noindex/);
  await embed.body.cancel();
});

test('crawl files have correct types and HEAD does not return a body', async () => {
  for (const [route, type] of [['/robots.txt', /text\/plain/], ['/ads.txt', /text\/plain/], ['/sitemap.xml', /application\/xml/]]) {
    const response = await fetch(base + route, { method: 'HEAD' });
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type'), type);
    assert.equal(await response.text(), '');
  }
});

test('malformed paths, encoded traversal and POST cannot expose source files', async () => {
  const request = route => new Promise((resolve, reject) => {
    const req = http.get(base + route, response => { response.resume(); resolve(response.statusCode); });
    req.on('error', reject);
  });
  assert.equal(await request('/%E0%A4%A'), 400);
  assert.equal(await request('/..%2fpackage.json'), 404);
  assert.equal(await request('/..%5cpackage.json'), 400);
  const response = await fetch(base + '/contact', { method: 'POST', body: 'test-only' });
  assert.equal(response.status, 405);
  await response.body.cancel();
});
