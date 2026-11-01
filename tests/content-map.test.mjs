import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { CONTENT_PAGES, LEGACY_ROUTES, getBreadcrumbs, getTopicChildren, getNextPages } from '../src/lib/content-map.mjs';

const origin = 'https://rockcoveragecalculator.com';
const clean = text => text.replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
const attr = tag => Object.fromEntries([...tag.matchAll(/([\w-]+)\s*=\s*"([^"]*)"/g)].map(m=>[m[1],m[2]]));
const rendered = new Map(await Promise.all(CONTENT_PAGES.map(async page => [page.route, await fs.readFile(page.route==='/404'?'dist/404.html':`dist${page.route==='/'?'':page.route}/index.html`,'utf8')])));

test('every content source has an explicit purpose and an acyclic route to the homepage', async () => {
  const sourceRoutes = (await fs.readdir('src/pages')).filter(name=>name.endsWith('.astro')).map(name=>name==='index.astro'?'/':'/'+name.slice(0,-6)).filter(route=>!Object.hasOwn(LEGACY_ROUTES,route));
  assert.deepEqual(new Set(CONTENT_PAGES.map(p=>p.route)),new Set(sourceRoutes));
  assert.equal(new Set(CONTENT_PAGES.map(p=>p.route)).size,CONTENT_PAGES.length);
  assert.equal(new Set(CONTENT_PAGES.map(p=>p.title)).size,CONTENT_PAGES.length,'ambiguous page titles');
  for(const page of CONTENT_PAGES){
    assert.ok(page.summary.length>60 && page.entity && page.attributes.length>=2,page.route);
    const trail=getBreadcrumbs(page.route);
    assert.equal(trail[0].url,'/',page.route);
    assert.equal(trail.at(-1).url,page.route,page.route);
    assert.equal(new Set(trail.map(c=>c.url)).size,trail.length,page.route);
    for(const link of page.links) assert.ok(CONTENT_PAGES.some(p=>p.route===link),page.route+' → '+link);
  }
});

test('rendered titles, descriptions and structured page entities match the page purpose', () => {
  const titles = new Set();
  for(const page of CONTENT_PAGES){
    const html=rendered.get(page.route);
    assert.ok(html.includes(`<title>${page.title.replaceAll('&','&amp;')}</title>`) || clean(html.match(/<title>(.*?)<\/title>/s)?.[1]??'')===page.title,page.route);
    const nodes=[...html.matchAll(/<script type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)].flatMap(m=>{const value=JSON.parse(m[1]);return value['@graph']??[value];});
    const root=nodes.find(n=>n['@id']===new URL(page.route,origin).href+'#webpage');
    assert.equal(root?.name,page.title,page.route);
    assert.equal(root?.description,page.summary,page.route);
    assert.equal(root?.about?.name,page.entity,page.route);
    if(page.indexable){assert.ok(!titles.has(root.name));titles.add(root.name);}
    if(page.indexable && page.route!=='/'){
      const breadcrumb=nodes.filter(n=>n['@type']==='BreadcrumbList');
      assert.equal(breadcrumb.length,1,page.route+' duplicated breadcrumbs');
      assert.deepEqual(breadcrumb[0].itemListElement.map(n=>new URL(n.item).pathname),getBreadcrumbs(page.route).map(c=>c.url),page.route);
      const visible=html.match(/<nav\b[^>]*aria-label="Breadcrumb"[\s\S]*?<\/nav>/)?.[0];
      assert.ok(visible,page.route+' missing visible breadcrumbs');
      for(const crumb of getBreadcrumbs(page.route).slice(0,-1)) assert.ok([...visible.matchAll(/<a\b[^>]*>/g)].some(m=>attr(m[0]).href===crumb.url),page.route+' missing ancestor '+crumb.url);
    }
  }
});

test('rendered topic navigation contains its real parent, children and curated next steps', () => {
  for(const page of CONTENT_PAGES.filter(p=>p.indexable)){
    const html=rendered.get(page.route), links=[...html.matchAll(/<a\b[^>]*>/g)].map(m=>attr(m[0]));
    if(['/','/calculators'].includes(page.route)){
      for(const child of getTopicChildren(page.route)) assert.ok(links.some(a=>a.href===child.route),page.route+' missing child '+child.route);
      continue;
    }
    assert.ok(links.some(a=>a.href===page.parent && a['data-topic-relation']==='parent'),page.route+' missing parent');
    for(const child of getTopicChildren(page.route)) assert.ok(links.some(a=>a.href===child.route && a['data-topic-relation']==='child'),page.route+' missing child '+child.route);
    for(const next of getNextPages(page.route)) assert.ok(links.some(a=>a.href===next.route && a['data-topic-relation']==='next'),page.route+' missing next step '+next.route);
  }
});
