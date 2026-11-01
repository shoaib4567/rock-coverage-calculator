/** @param {number} value @param {string} label @param {boolean} [zero] */
function requireQuantity(value,label,zero=false) {
  if(!Number.isFinite(value)||(zero?value<0:value<=0))throw new RangeError(`${label} must be ${zero?'non-negative':'positive'}.`);
  return value;
}
/** A selected per-vehicle volume and payload are separate constraints. */
export function estimateDeliveryLoads(yards,tons,payload,capacity) {
  requireQuantity(yards,'Order volume',true);requireQuantity(tons,'Order weight',true);
  requireQuantity(payload,'Payload');requireQuantity(capacity,'Vehicle volume');
  return yards===0&&tons===0 ? 0 : Math.max(1,Math.ceil(Math.max(yards/capacity,tons/payload)-1e-10));
}
/** Extra is a loose-order increase, not a percentage loss of the loose material. */
export function estimateBaseLayer({length,width,depth,extra,density}) {
  requireQuantity(length,'Length');requireQuantity(width,'Width');requireQuantity(depth,'Depth');
  requireQuantity(extra,'Extra material',true);requireQuantity(density,'Loose bulk weight');
  if(extra>100)throw new RangeError('Extra material must be at most 100%.');
  const finishedYards=length*width*depth/324;
  const orderYards=finishedYards*(1+extra/100);
  return {finishedYards,orderYards,tons:orderYards*density};
}
