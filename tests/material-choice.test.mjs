import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getMaterialCandidate} from '../src/lib/material-choice.mjs';
import {getContentPage} from '../src/lib/content-map.mjs';
const defaults={project:'garden',traffic:'none',slope:'flat',aesthetic:'budget-utility'};
test('selection helper distinguishes an active channel from a pipe trench and a driveway',()=>{
  assert.equal(getMaterialCandidate({...defaults,project:'drainage'}).calcUrl,'/drain-rock-calculator');
  assert.equal(getMaterialCandidate({...defaults,project:'drainage',slope:'water-channel'}).calcUrl,'/riprap-calculator');
  assert.equal(getMaterialCandidate({...defaults,project:'driveway'}).calcUrl,'/driveway-rock-calculator');
});
test('selection helper does not recommend landscape stone as fire-appliance media',()=>{
  const choice=getMaterialCandidate({...defaults,project:'firepit',aesthetic:'volcanic'});
  assert.equal(choice.calcUrl,'/decorative-rock-calculator');
  assert.match(choice.summary,/manufacturer/);
  assert.match(choice.pitfalls,/approved media/);
});
test('all complete answer combinations lead to an existing relevant page without promised construction dimensions',()=>{
  for(const project of ['driveway','walkway','drainage','garden','firepit','dogrun'])
  for(const traffic of ['vehicular','pedestrian','barefoot','none'])
  for(const slope of ['flat','moderate-slope','water-channel'])
  for(const aesthetic of ['natural-earth','modern-crisp','budget-utility','volcanic']) {
    const choice=getMaterialCandidate({project,traffic,slope,aesthetic});
    assert.ok(getContentPage(choice.calcUrl),choice.calcUrl);
    assert.ok(Object.values(choice).every(value=>typeof value==='string'&&value.length>0));
    assert.doesNotMatch(choice.depth,/\d/, 'the helper must not invent a design thickness');
    assert.doesNotMatch(choice.density,/\d/, 'the helper must not invent a supplier density');
  }
});
