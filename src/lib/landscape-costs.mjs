/** Illustrative ten-year comparison; every rate is supplied by the caller. */
export function calculateLandscapeCosts(input) {
 const get=(key)=>{const n=Number(input[key]);if(!Number.isFinite(n)||n<0)throw new RangeError('Enter a nonnegative '+key);return n;};
 const area=get('area'), depth=get('rockDepth'), density=get('density');
 if(!area||!depth||!density)throw new RangeError('Area, rock depth and density must be positive.');
 const rockYards=area*depth/324*1.10, rockTons=rockYards*density;
 const initialMulchYards=area*get('mulchDepth')/324*1.05;
 const annualMulchYards=area*get('annualMulch')/324*1.05;
 const rockInitial=rockTons*(get('rockRate')+(input.diy?0:get('rockLabor')))+get('rockDelivery')+Math.ceil(area*1.15)*get('fabricRate');
 const mulchInitial=initialMulchYards*(get('mulchRate')+(input.diy?0:get('mulchLabor')))+get('mulchDelivery');
 const annualRock=get('rockUpkeep');
 const annualMulch=annualMulchYards*(get('mulchRate')+(input.diy?0:get('mulchLabor')))+(annualMulchYards>0?get('annualTrip'):0);
 const years=Array.from({length:10},(_,i)=>({year:i+1,rock:rockInitial+annualRock*i,mulch:mulchInitial+annualMulch*i}));
 if(!years.every(y=>Number.isFinite(y.rock)&&Number.isFinite(y.mulch)))throw new RangeError('These values exceed the supported calculation range.');
 const first=years.find(y=>y.rock<=y.mulch);
 return {rockYards,rockTons,initialMulchYards,rockInitial,mulchInitial,years,firstRockCheaperYear:first?.year??null,savings:years[9].mulch-years[9].rock};
}
