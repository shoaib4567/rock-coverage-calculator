import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
test('each public page has one main landmark and a skip target before JavaScript',async()=>{
 const sitemap=await fs.readFile('dist/sitemap.xml','utf8');
 const paths=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>new URL(m[1]).pathname);
 for(const pathname of [...paths,'/embed']){
  const html=await fs.readFile('dist'+(pathname==='/'?'':pathname)+'/index.html','utf8');
  assert.equal([...html.matchAll(/<main\b/g)].length,1,pathname);
  assert.ok(/<main\b[^>]*id="main-content"/.test(html),pathname);
 }
});
