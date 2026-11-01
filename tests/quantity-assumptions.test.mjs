import {test} from 'node:test';
import assert from 'node:assert/strict';
import {estimateDeliveryLoads,estimateBaseLayer} from '../src/lib/quantity-assumptions.mjs';
test('delivery counts honor both volume-limited and weight-limited vehicles',()=>{
  assert.equal(estimateDeliveryLoads(20,10,15,8),3);
  assert.equal(estimateDeliveryLoads(10,30,12,20),3);
  assert.equal(estimateDeliveryLoads(10,15,15,10),1);
  assert.equal(estimateDeliveryLoads(0,0,15,10),0);
  assert.equal(estimateDeliveryLoads(1e-12,1e-12,15,10),1);
});
test('unusable delivery assumptions cannot produce an invented load count',()=>{
  for(const args of [[5,7,0,10],[5,7,15,0],[5,NaN,15,10],[-1,7,15,10]])assert.throws(()=>estimateDeliveryLoads(...args),RangeError);
});
test('base-layer ordering permits zero extra and changes weight independently of volume',()=>{
  const noExtra=estimateBaseLayer({length:12,width:24,depth:4,extra:0,density:1.45});
  assert.ok(Math.abs(noExtra.orderYards-32/9)<1e-10);
  const withExtra=estimateBaseLayer({length:12,width:24,depth:4,extra:20,density:1.45});
  assert.equal(withExtra.orderYards,noExtra.orderYards*1.2);
  const heavier=estimateBaseLayer({length:12,width:24,depth:4,extra:20,density:1.6});
  assert.equal(heavier.orderYards,withExtra.orderYards);
  assert.ok(heavier.tons>withExtra.tons);
});
