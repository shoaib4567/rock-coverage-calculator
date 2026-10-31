import {test} from 'node:test';
import assert from 'node:assert/strict';
import {calculateLandscapeCosts} from '../src/lib/landscape-costs.mjs';

const example={area:400,rockDepth:3,density:1.35,mulchDepth:3,annualMulch:1.5,rockRate:65,mulchRate:38,rockDelivery:75,mulchDelivery:50,annualTrip:15,rockUpkeep:7.5,fabricRate:0.18,rockLabor:35,mulchLabor:25,diy:true};
test('ten-year comparison includes one install and nine annual cycles',()=>{
 const result=calculateLandscapeCosts(example);
 assert.ok(Math.abs(result.rockTons-5.5)<1e-10);
 assert.ok(Math.abs(result.rockInitial-515.3)<1e-10);
 assert.ok(Math.abs(result.years[9].rock-582.8)<1e-10);
 assert.ok(Math.abs(result.years[9].mulch-997.7777777777778)<1e-10);
 assert.equal(result.firstRockCheaperYear,5);
});
test('zero mulch replenishment stays zero and no crossover is invented',()=>{
 const result=calculateLandscapeCosts({...example,annualMulch:0});
 assert.equal(result.firstRockCheaperYear,null);
 assert.equal(result.years[9].mulch,result.mulchInitial);
 assert.ok(result.savings<0);
});
test('rock can be cheaper initially and later become more expensive',()=>{
 const result=calculateLandscapeCosts({...example,rockRate:0,rockDelivery:0,fabricRate:0,rockUpkeep:1000,annualMulch:0});
 assert.equal(result.firstRockCheaperYear,1);
 assert.ok(result.savings<0);
});
test('DIY excludes entered labor and paid placement includes both rates',()=>{
 const diy=calculateLandscapeCosts(example),paid=calculateLandscapeCosts({...example,diy:false});
 assert.ok(Math.abs((paid.rockInitial-diy.rockInitial)-diy.rockTons*35)<1e-10);
 assert.ok(paid.years[9].mulch>diy.years[9].mulch);
});
test('invalid quantities or rates cannot produce a misleading cost result',()=>{
 for(const input of [{area:0},{density:0},{rockDepth:-1},{rockRate:-1},{annualMulch:NaN},{mulchRate:Infinity},{area:1e308,rockRate:1e308}])assert.throws(()=>calculateLandscapeCosts({...example,...input}),RangeError);
});
