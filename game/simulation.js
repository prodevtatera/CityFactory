// simulation.js — deterministic, dependency-free syrup-bottling factory simulation.
// Educational simplification of a manufacturing line; not a real production recipe.
// Public API is consumed by the parent renderer: TYPES, createGame, canPlace, place,
// remove, readiness, openFactory, tick, releaseBatch, nextOrder.

export const BUDGET = 50000;
export const WORLD = { minX: -12, maxX: 12, minZ: -8, maxZ: 8 };
export const ROAD_FIXED = { x: 0, z: 6.5, rot: 0 };
export const BATCH_SIZE = 100;

export const ORDER_SIZE = 300;
export const TRUCK_CAPACITY = 200;
export const PHASE_SECONDS = { receiving: 6, mixing: 12, bottling: 10 };
export const LINKS = [
  ['raw','receiving','kitchen','Ingredients'],
  ['packs','receiving','bottling','Packaging'],
  ['syrup','kitchen','bottling','Bulk syrup'],
  ['goods','bottling','shipping','Released cartons'],
];

// Module catalogue. Costs total 49,000, below the 50,000 budget.
export const TYPES = {
  roads: {
    name: 'Roads',
    cost: 4000,
    w: 24,
    d: 3,
    description: 'Fixed 24x3 access road that trucks use to reach the dock.',
    lesson: 'Layout starts with logistics: without road access nothing else can move.',
  },
  utilities: {
    name: 'Utilities',
    cost: 6000,
    w: 4,
    d: 4,
    description: 'Water, power and steam plant feeding the whole line.',
    lesson: 'Every process needs utilities sized before production starts.',
  },
  receiving: {
    name: 'Receiving',
    cost: 8000,
    w: 4,
    d: 4,
    description: 'Dock where the supply truck unloads ingredients.',
    lesson: 'Production needs available ingredients and packaging before a batch can start.',
  },
  kitchen: {
    name: 'Syrup Kitchen',
    cost: 12000,
    w: 5,
    d: 4,
    description: 'Mixing vessel where the simplified syrup is blended.',
    lesson: 'A recipe turns measured ingredients into a repeatable batch.',
  },
  quality: {
    name: 'Quality',
    cost: 5000,
    w: 3,
    d: 3,
    description: 'Lab bench that inspects and releases the finished batch.',
    lesson: 'Checks support production throughout. Final release authorizes shipment.',
  },
  bottling: {
    name: 'Bottling',
    cost: 9000,
    w: 5,
    d: 4,
    description: 'Filler consuming one syrup unit and one packaging kit per carton.',
    lesson: 'Packaging turns bulk syrup into counted, labelled goods ready for an order.',
  },
  shipping: {
    name: 'Shipping',
    cost: 5000,
    w: 4,
    d: 4,
    description: 'Load-out bay that dispatches released cartons to customers.',
    lesson: 'Only released stock can load. Trucks hold 200 cartons; this order needs 300.',
  },
};

export const TYPE_KEYS = Object.keys(TYPES);

function fail(reason) {
  return { ok: false, reason };
}

function ok(reason = '') {
  return { ok: true, reason };
}

// Footprint rectangle for a module at a center position; rot 1 swaps w/d.
function rectFor(type, x, z, rot) {
  const def = TYPES[type];
  const w = rot === 1 ? def.d : def.w;
  const d = rot === 1 ? def.w : def.d;
  return {
    minX: x - w / 2,
    maxX: x + w / 2,
    minZ: z - d / 2,
    maxZ: z + d / 2,
  };
}

function withinWorld(rect) {
  return (
    rect.minX >= WORLD.minX &&
    rect.maxX <= WORLD.maxX &&
    rect.minZ >= WORLD.minZ &&
    rect.maxZ <= WORLD.maxZ
  );
}

// Strict overlap: rectangles that only touch on an edge are allowed.
function rectsOverlap(a, b) {
  return a.minX < b.maxX && b.minX < a.maxX && a.minZ < b.maxZ && b.minZ < a.maxZ;
}

function placedTypes(state) {
  return new Set(state.buildings.map((b) => b.type));
}

function placedCount(state) {
  return placedTypes(state).size;
}

export function createGame() {
  return { schema:2, buildings:[], money:BUDGET, phase:'build', elapsed:0, progress:0,
    cartons:0, mixed:0, batchId:'SYR-001', batchNumber:1, released:false, paused:false, speed:1,
    delivered:0, orderSize:ORDER_SIZE, totalPacked:0, time:0, truckWait:0, trips:0,
    stock:{raw:0,packs:0,kitchenRaw:0,kitchenSyrup:0,bottleSyrup:0,bottlePacks:0,held:0,ready:0},
    consumed:{raw:0,packs:0}, supplied:false, transfers:[], routes:{},
    truck:{status:'approaching',elapsed:0,load:0,credit:0}, supply:{status:'approaching',elapsed:0},
    message:'Place the seven essentials. Keep dock approaches and transfer paths clear.',
    log:[],_idSeq:0, _transferSeq:0, best:null, previous:null };
}

export function canPlace(state, type, x, z, rot = 0) {
  if (!state || typeof state !== 'object' || !Array.isArray(state.buildings)) {
    return fail('invalid state');
  }
  const def = Object.hasOwn(TYPES, type) ? TYPES[type] : undefined;
  if (!def) return fail(`unknown type: ${String(type)}`);
  if (state.phase !== 'build') return fail(`cannot edit during ${state.phase} phase`);
  if (rot !== 0 && rot !== 1) return fail('rotation must be 0 or 1');
  if (typeof x !== 'number' || !Number.isFinite(x) || typeof z !== 'number' || !Number.isFinite(z)) {
    return fail('position must be finite numbers');
  }

  // Roads are fixed infrastructure: always normalized to the road slot.
  const px = type === 'roads' ? ROAD_FIXED.x : x;
  const pz = type === 'roads' ? ROAD_FIXED.z : z;
  const prot = type === 'roads' ? ROAD_FIXED.rot : rot;

  if (placedTypes(state).has(type)) return fail(`${def.name} already placed`);
  if (typeof state.money !== 'number' || !Number.isFinite(state.money) || state.money < def.cost) {
    return fail(`insufficient budget: ${def.name} costs ${def.cost}`);
  }

  const rect = rectFor(type, px, pz, prot);
  if (!withinWorld(rect)) return fail(`${def.name} would extend outside the world bounds`);

  const hit = state.buildings.find((b) =>
    rectsOverlap(rect, rectFor(b.type, b.x, b.z, b.rot)),
  );
  if (hit) return fail(`${def.name} overlaps ${TYPES[hit.type].name}`);

  const draft = {...state, buildings:[...state.buildings,{type,x:px,z:pz,rot:prot}]};
  const issues = layoutIssues(draft);
  return issues.length ? fail(issues[0]) : ok();
}

export function place(state, type, x, z, rot = 0) {
  const check = canPlace(state, type, x, z, rot);
  if (!check.ok) return check;

  const def = TYPES[type];
  const px = type === 'roads' ? ROAD_FIXED.x : x;
  const pz = type === 'roads' ? ROAD_FIXED.z : z;
  const prot = type === 'roads' ? ROAD_FIXED.rot : rot;

  state._idSeq = (state._idSeq || 0) + 1;
  const id = `${type}-${state._idSeq}`;
  state.buildings.push({ id, type, x: px, z: pz, rot: prot });
  state.money -= def.cost;
  state.log.push({ message: `Placed ${def.name} at (${px}, ${pz}) rot ${prot} for $${def.cost}.` });
  state.message = `${def.name} placed. ${placedCount(state)} of ${TYPE_KEYS.length} modules built.`;
  return ok();
}

export function remove(state, id) {
  if (!state || typeof state !== 'object' || !Array.isArray(state.buildings)) {
    return fail('invalid state');
  }
  if (state.phase !== 'build') return fail(`cannot edit during ${state.phase} phase`);
  const index = state.buildings.findIndex((b) => b.id === id);
  if (index === -1) return fail(`no building with id ${String(id)}`);

  const [building] = state.buildings.splice(index, 1);
  const def = TYPES[building.type];
  state.money += def.cost;
  state.log.push({ message: `Removed ${def.name} (${building.id}); refunded $${def.cost}.` });
  state.message = `${def.name} removed. ${placedCount(state)} of ${TYPE_KEYS.length} modules built.`;
  return ok();
}

// Missing module keys, in TYPES order.
export function readiness(state) {
  if (!state || typeof state !== 'object' || !Array.isArray(state.buildings)) {
    return [...TYPE_KEYS];
  }
  const placed = placedTypes(state);
  return TYPE_KEYS.filter((type) => !placed.has(type));
}

// A half-unit walking grid is enough for this single small plot.
// ponytail: independent transport lots do not queue at crossings; add shared lanes if traffic becomes a lesson.
function port(b) {
  return b.rot === 1 ? [b.x + TYPES[b.type].d/2 + .5,b.z] : [b.x,b.z + TYPES[b.type].d/2 + .5];
}
export function routeBetween(state, from, to) {
  const a=state.buildings.find(b=>b.type===from), b=state.buildings.find(b=>b.type===to);
  if(!a||!b)return null;
  const start=port(a).map(v=>Math.round(v*2)), end=port(b).map(v=>Math.round(v*2));
  const obstacles=state.buildings.filter(b=>b.type!=='roads').map(b=>rectFor(b.type,b.x,b.z,b.rot));
  const clear=([x,z])=>x>=-23&&x<=23&&z>=-15&&z<=9&&!obstacles.some(r=>x/2>r.minX-.15&&x/2<r.maxX+.15&&z/2>r.minZ-.15&&z/2<r.maxZ+.15);
  if(!clear(start)||!clear(end))return null;
  const key=p=>p.join(','), target=key(end), queue=[start], prev=new Map([[key(start),null]]);
  for(let i=0;i<queue.length;i++){
    const p=queue[i];if(key(p)===target){const path=[];let k=target;while(k!==null){path.push(k.split(',').map(Number).map(v=>v/2));k=prev.get(k);}path.reverse();return {path,distance:(path.length-1)/2,duration:Math.max(.5,(path.length-1)/4)};}
    for(const [dx,dz]of [[1,0],[0,1],[-1,0],[0,-1]]){const n=[p[0]+dx,p[1]+dz],k=key(n);if(!prev.has(k)&&clear(n)){prev.set(k,key(p));queue.push(n);}}
  }
  return null;
}
export function layoutIssues(state){
  const issues=[];
  for(const dock of state.buildings.filter(b=>['receiving','shipping'].includes(b.type))){
    if(dock.rot!==0){issues.push(`${TYPES[dock.type].name}: face the dock toward the road (R to rotate).`);continue;}
    const front=dock.z+TYPES[dock.type].d/2;
    const lane={minX:dock.x-1.2,maxX:dock.x+1.2,minZ:front,maxZ:5};
    if(state.buildings.some(b=>b!==dock&&b.type!=='roads'&&rectsOverlap(lane,rectFor(b.type,b.x,b.z,b.rot))))issues.push(`${TYPES[dock.type].name}: leave a clear truck approach to the road.`);
  }
  for(const [key,from,to,label]of LINKS)if(state.buildings.some(b=>b.type===from)&&state.buildings.some(b=>b.type===to)&&!routeBetween(state,from,to))issues.push(`${label}: leave a clear path between ${TYPES[from].name} and ${TYPES[to].name}.`);
  return issues;
}
export function refreshRoutes(state){state.routes=Object.fromEntries(LINKS.map(([key,a,b])=>[key,routeBetween(state,a,b)]));}
export function truckDuration(state,type){const b=state.buildings.find(b=>b.type===type);return b?(36.5+Math.abs(b.x)+Math.abs(6.5-(b.z+3.8)))/5:10;}
export function moveBuilding(state,id,x,z,rot=0){
  if(state.phase!=='build'&&!state.paused)return fail('Pause before moving a module.');
  const b=state.buildings.find(b=>b.id===id);if(!b)return fail('Module not found.');
  const draft={...state,phase:'build',money:state.money+TYPES[b.type].cost,buildings:state.buildings.filter(o=>o.id!==id)};
  const check=canPlace(draft,b.type,x,z,rot);if(!check.ok)return check;
  const oldRoutes=state.routes;
  Object.assign(b,b.type==='roads'?{x:0,z:6.5,rot:0}:{x,z,rot});refreshRoutes(state);
  for(const t of state.transfers){const old=oldRoutes[t.key]?.duration||1;t.elapsed=t.elapsed/old*state.routes[t.key].duration;}
  state.message='Module moved for free. Active transfers follow the updated paths.';return ok();
}
export function openFactory(state){
  if(state.phase!=='build')return fail('Factory is already open.');
  const missing=readiness(state);if(missing.length)return fail(`Missing: ${missing.map(k=>TYPES[k].name).join(', ')}`);
  const issues=layoutIssues(state);if(issues.length)return fail(issues[0]);
  refreshRoutes(state);state.phase='receiving';state.paused=false;state.message='Supplier approaching with 300 ingredient units and 300 packaging kits.';return ok();
}
function transfer(state,key,amount,source,destination){
  if(state.stock[source]<amount||!state.routes[key])return false;
  state.stock[source]-=amount;
  state.transfers.push({id:++state._transferSeq,key,amount,destination,elapsed:0});return true;
}
function startBatch(state){
  state.elapsed=0;state.cartons=0;state.mixed=0;state.released=false;state.phase='transferring';
  state.batchId=`SYR-${String(state.batchNumber).padStart(3,'0')}`;
  transfer(state,'raw',BATCH_SIZE,'raw','kitchenRaw');transfer(state,'packs',BATCH_SIZE,'packs','bottlePacks');
}
export function releaseBatch(state){
  if(state.phase!=='awaitingQuality'||state.stock.held!==BATCH_SIZE)return fail('A complete checked batch is required before release.');
  if(!transfer(state,'goods',BATCH_SIZE,'held','ready'))return fail('Shipping needs a clear material path.');
  state.released=true;
  if(state.batchNumber<state.orderSize/BATCH_SIZE){state.batchNumber++;startBatch(state);}else{state.phase='dispatching';state.progress=1;}
  return ok();
}
export function dispatchTruck(state){
  if(!['waiting','loading'].includes(state.truck.status)||state.truck.load<=0)return fail('Load some released cartons before dispatching.');
  state.truck.status='departing';state.truck.elapsed=0;state.truck.credit=0;return ok();
}
function step(state,dt){
  state.time+=dt;
  const supply=state.supply;
  if(supply.status==='approaching'){
    supply.elapsed+=dt;if(supply.elapsed>=truckDuration(state,'receiving')){supply.status='unloading';supply.elapsed=0;}
  }else if(supply.status==='unloading'){
    supply.elapsed+=dt;if(supply.elapsed>=PHASE_SECONDS.receiving){state.stock.raw=state.orderSize;state.stock.packs=state.orderSize;state.supplied=true;supply.status='departing';supply.elapsed=0;startBatch(state);}
  }else if(supply.status==='departing'){supply.elapsed+=dt;if(supply.elapsed>=truckDuration(state,'receiving'))supply.status='gone';}
  for(const t of state.transfers)t.elapsed+=dt;
  state.transfers=state.transfers.filter(t=>{if(t.elapsed+1e-8<state.routes[t.key].duration)return true;state.stock[t.destination]+=t.amount;return false;});
  if(state.phase==='transferring'&&state.stock.kitchenRaw>=BATCH_SIZE){state.stock.kitchenRaw-=BATCH_SIZE;state.consumed.raw+=BATCH_SIZE;state.phase='mixing';state.elapsed=0;}
  else if(state.phase==='mixing'){
    state.elapsed+=dt;state.progress=Math.min(1,state.elapsed/PHASE_SECONDS.mixing);state.mixed=Math.floor(BATCH_SIZE*state.progress);
    if(state.elapsed+1e-8>=PHASE_SECONDS.mixing){state.stock.kitchenSyrup+=BATCH_SIZE;transfer(state,'syrup',BATCH_SIZE,'kitchenSyrup','bottleSyrup');state.phase='bottling';state.elapsed=0;state.progress=0;}
  }else if(state.phase==='bottling'){
    if(state.stock.bottleSyrup>0&&state.stock.bottlePacks>0){
      state.elapsed+=dt;const n=Math.min(state.stock.bottleSyrup,state.stock.bottlePacks,BATCH_SIZE-state.cartons,Math.floor(state.elapsed*10+1e-8));
      state.elapsed=Math.max(0,state.elapsed-n/10);state.stock.bottleSyrup-=n;state.stock.bottlePacks-=n;state.consumed.packs+=n;state.stock.held+=n;state.cartons+=n;state.totalPacked+=n;
    }
    state.progress=state.cartons/BATCH_SIZE;if(state.cartons===BATCH_SIZE){state.phase='awaitingQuality';state.elapsed=0;}
  }
  const t=state.truck,duration=truckDuration(state,'shipping');
  if(t.status==='approaching'){t.elapsed+=dt;if(t.elapsed>=duration){t.status='waiting';t.elapsed=0;}}
  else if(['waiting','loading'].includes(t.status)){
    if(state.stock.ready>0){t.status='loading';t.credit+=dt*10;const n=Math.min(Math.floor(t.credit+1e-8),state.stock.ready,TRUCK_CAPACITY-t.load,state.orderSize-state.delivered-t.load);t.credit=Math.max(0,t.credit-n);state.stock.ready-=n;t.load+=n;}
    else {t.status='waiting';t.credit=0;state.truckWait+=dt;}
    if(t.load===TRUCK_CAPACITY||t.load+state.delivered===state.orderSize)dispatchTruck(state);
  }else if(t.status==='departing'){
    t.elapsed+=dt;if(t.elapsed>=duration){state.delivered+=t.load;state.trips++;t.load=0;t.elapsed=0;t.status=state.delivered===state.orderSize?'gone':'approaching';
      if(state.delivered===state.orderSize){state.phase='complete';state.progress=1;const result={time:state.time,wait:state.truckWait,trips:state.trips};state.previous=result;if(!state.best||result.time<state.best.time)state.best=result;}}
  }
}
export function tick(state,dt){
  if(!Number.isFinite(dt)||dt<0||dt>60)return fail('Time step must be between 0 and 60 seconds.');
  if(state.paused||['build','complete'].includes(state.phase))return ok();
  let left=dt*(state.speed===2?2:1);
  while(left>1e-9&&state.phase!=='complete'){const stepSize=Math.min(.05,left);step(state,stepSize);left-=stepSize;}
  return ok();
}
export function retryOrder(state){
  if(!['build','complete'].includes(state.phase)&&!state.paused)return fail('Pause before retrying this order.');
  const fresh=createGame();Object.assign(fresh,{buildings:structuredClone(state.buildings),money:state.money,_idSeq:state._idSeq,best:state.best,previous:state.previous});
  Object.assign(state,fresh);refreshRoutes(state);state.message='Same order, clean inventory. Improve the layout and open again.';return ok();
}
export const nextOrder=retryOrder;

// Saves are resumed only if their quantities and material balances are consistent.
export function restoreGame(saved){
  // Earlier saves may contain negative rounding dust from fractional frame ticks.
  const residual=n=>typeof n==='number'&&n<0&&n>=-1e-8?0:n;
  if(saved?.schema===2)saved={...saved,elapsed:residual(saved.elapsed),truck:{...saved.truck,credit:residual(saved.truck?.credit)}};
  const fresh=createGame();if(!saved||!Array.isArray(saved.buildings))throw Error('Invalid save');
  if(saved.buildings.length>TYPE_KEYS.length)throw Error('Too many modules');
  for(const b of saved.buildings){
    if(!Object.hasOwn(TYPES,b.type)||!Number.isFinite(b.x)||!Number.isFinite(b.z)||![0,1].includes(b.rot)||fresh.buildings.some(o=>o.type===b.type))throw Error('Invalid module');
    const rect=rectFor(b.type,b.x,b.z,b.rot);
    if(!withinWorld(rect)||fresh.buildings.some(o=>rectsOverlap(rect,rectFor(o.type,o.x,o.z,o.rot))))throw Error('Invalid footprint');
    if(b.type==='roads'&&(b.x!==0||b.z!==6.5||b.rot!==0))throw Error('Invalid road');
    fresh.buildings.push({id:`${b.type}-${++fresh._idSeq}`,type:b.type,x:b.x,z:b.z,rot:b.rot});fresh.money-=TYPES[b.type].cost;
  }
  if(saved.schema!==2){fresh.message='Fulfil 300 cartons. Preview your transfer paths, then open the factory.';return fresh;} // Preserve old layouts, start the new material challenge with clean inventory.
  for(const k of ['time','truckWait','delivered','totalPacked','cartons','mixed','elapsed','progress','trips','batchNumber'])if(!Number.isFinite(saved[k])||saved[k]<0)throw Error('Invalid progress');
  for(const k of Object.keys(fresh.stock))if(!Number.isInteger(saved.stock?.[k])||saved.stock[k]<0)throw Error('Invalid stock');
  if(saved.orderSize!==ORDER_SIZE||saved.delivered>ORDER_SIZE||saved.totalPacked>ORDER_SIZE||saved.cartons>BATCH_SIZE||saved.progress>1||![1,2,3].includes(saved.batchNumber))throw Error('Invalid order');
  if(!['build','receiving','transferring','mixing','bottling','awaitingQuality','dispatching','complete'].includes(saved.phase))throw Error('Invalid phase');
  if(!['approaching','waiting','loading','departing','gone'].includes(saved.truck?.status)||!Number.isInteger(saved.truck.load)||saved.truck.load<0||saved.truck.load>TRUCK_CAPACITY||!Number.isFinite(saved.truck.elapsed)||saved.truck.elapsed<0||!Number.isFinite(saved.truck.credit)||saved.truck.credit<0)throw Error('Invalid truck');
  if(!['approaching','unloading','departing','gone'].includes(saved.supply?.status)||!Number.isFinite(saved.supply.elapsed)||saved.supply.elapsed<0)throw Error('Invalid supplier');
  const destinations={raw:'kitchenRaw',packs:'bottlePacks',syrup:'bottleSyrup',goods:'ready'};
  if(!Array.isArray(saved.transfers)||saved.transfers.some(t=>destinations[t.key]!==t.destination||t.amount!==BATCH_SIZE||!Number.isFinite(t.elapsed)||t.elapsed<0))throw Error('Invalid transfer');
  for(const k of ['raw','packs'])if(!Number.isInteger(saved.consumed?.[k])||saved.consumed[k]<0||saved.consumed[k]>ORDER_SIZE)throw Error('Invalid consumption');
  const inTransit=k=>saved.transfers.filter(t=>t.key===k).reduce((n,t)=>n+t.amount,0),s=saved.stock,total=saved.supplied?ORDER_SIZE:0;
  if(s.raw+s.kitchenRaw+inTransit('raw')+saved.consumed.raw!==total||s.packs+s.bottlePacks+inTransit('packs')+saved.consumed.packs!==total)throw Error('Material balance mismatch');
  if(saved.consumed.packs!==saved.totalPacked||s.held+s.ready+inTransit('goods')+saved.truck.load+saved.delivered!==saved.totalPacked)throw Error('Carton balance mismatch');
  if(s.kitchenSyrup+s.bottleSyrup+inTransit('syrup')+saved.totalPacked+(saved.phase==='mixing'?BATCH_SIZE:0)!==saved.consumed.raw)throw Error('Syrup balance mismatch');
  if(saved.phase==='build'&&(saved.supplied||saved.transfers.length||saved.totalPacked||saved.delivered))throw Error('Invalid build stock');
  if(saved.phase==='complete'&&saved.delivered!==ORDER_SIZE)throw Error('Incomplete order');
  if(saved.phase==='awaitingQuality'&&(saved.stock.held!==BATCH_SIZE||saved.cartons!==BATCH_SIZE))throw Error('Incomplete quality batch');
  if(saved.phase!=='build'&&(readiness(fresh).length||layoutIssues(fresh).length))throw Error('Invalid running layout');
  Object.assign(fresh,saved,{buildings:fresh.buildings,money:fresh.money,_idSeq:fresh._idSeq,_transferSeq:saved.transfers.length,transfers:saved.transfers.map((t,i)=>({...t,id:i+1})),batchId:`SYR-${String(saved.batchNumber).padStart(3,'0')}`,log:[],speed:saved.speed===2?2:1,paused:saved.paused===true});refreshRoutes(fresh);return fresh;
}
