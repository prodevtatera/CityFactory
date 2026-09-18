// Runnable with: node simulation.test.mjs
import assert from 'node:assert/strict';
import {
  TYPES,
  TYPE_KEYS,
  BUDGET,
  BATCH_SIZE,
  PHASE_SECONDS,
  createGame,
  canPlace,
  place,
  remove,
  readiness,
  openFactory,
  tick,
  releaseBatch,
  nextOrder, moveBuilding, routeBetween, layoutIssues, dispatchTruck, restoreGame, retryOrder, refreshRoutes,
} from './simulation.js';

let passed = 0;
function test(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    console.error(error && error.stack ? error.stack : error);
    process.exitCode = 1;
  }
}

// Layout from the brief. Roads are normalized to (0, 6.5, rot 0) by the module.
const LAYOUT = [
  ['roads', 0, 6.5, 0],
  ['utilities', -8, -5, 0],
  ['receiving', -8, 0, 0],
  ['kitchen', -2.5, 0, 0],
  ['quality', -2.5, -5, 0],
  ['bottling', 3.5, 0, 0],
  ['shipping', 9, 0, 0],
];

function buildAll(state) {
  const already = new Set(state.buildings.map((b) => b.type));
  for (const [type, x, z, rot] of LAYOUT) {
    if (already.has(type)) continue;
    const result = place(state, type, x, z, rot);
    assert.equal(result.ok, true, `placing ${type}: ${result.reason}`);
  }
  return state;
}

function openGame() {
  const state = buildAll(createGame());
  const result = openFactory(state);
  assert.equal(result.ok, true, result.reason);
  return state;
}

function runToQuality(state) {
  tick(state, PHASE_SECONDS.receiving);
  tick(state, PHASE_SECONDS.mixing);
  tick(state, PHASE_SECONDS.bottling);
}

test('TYPES exposes the seven modules with valid dimensions', () => {
  assert.deepEqual(TYPE_KEYS, [
    'roads',
    'utilities',
    'receiving',
    'kitchen',
    'quality',
    'bottling',
    'shipping',
  ]);
  const dims = {
    roads: [24, 3],
    utilities: [4, 4],
    receiving: [4, 4],
    kitchen: [5, 4],
    quality: [3, 3],
    bottling: [5, 4],
    shipping: [4, 4],
  };
  for (const [type, [w, d]] of Object.entries(dims)) {
    const def = TYPES[type];
    assert.equal(def.w, w, `${type} width`);
    assert.equal(def.d, d, `${type} depth`);
    for (const field of ['name', 'cost', 'description', 'lesson']) {
      assert.ok(def[field], `${type}.${field} present`);
    }
    assert.ok(def.cost > 0, `${type}.cost positive`);
  }
});

test('module costs total below the 50000 budget', () => {
  const total = TYPE_KEYS.reduce((sum, type) => sum + TYPES[type].cost, 0);
  assert.ok(total < BUDGET, `total ${total} < ${BUDGET}`);
  assert.equal(BUDGET, 50000);
});

test('createGame returns the documented initial state', () => {
  const state = createGame();
  assert.deepEqual(state.buildings, []);
  assert.equal(state.money, 50000);
  assert.equal(state.phase, 'build');
  assert.equal(state.elapsed, 0);
  assert.equal(state.progress, 0);
  assert.equal(state.cartons, 0);
  assert.equal(state.batchId, 'SYR-001');
  assert.equal(state.released, false);
  assert.equal(state.paused, false);
  assert.equal(state.speed, 1);
  assert.equal(state.delivered, 0);
  assert.equal(typeof state.message, 'string');
  assert.ok(state.message.length > 0);
  assert.ok(Array.isArray(state.log));
});

test('bounds: placements outside the world are rejected', () => {
  const state = createGame();
  assert.equal(canPlace(state, 'utilities', 11, 0).ok, false);
  assert.equal(canPlace(state, 'utilities', -11, 0).ok, false);
  assert.equal(canPlace(state, 'utilities', 0, 7).ok, false);
  assert.equal(canPlace(state, 'utilities', 0, -7).ok, false);
  // Exactly on the edge is legal for a 4x4 module.
  assert.equal(canPlace(state, 'utilities', 10, 6).ok, true);
});

test('collision: overlapping modules are rejected, touching edges allowed', () => {
  const state = createGame();
  assert.equal(place(state, 'kitchen', 0, 0).ok, true); // x[-2.5,2.5] z[-2,2]
  const overlap = canPlace(state, 'quality', 0, 0);
  assert.equal(overlap.ok, false);
  assert.match(overlap.reason, /overlaps/i);
  // quality is 3x3; centered at 4 it spans x[2.5,5.5] and only touches the kitchen.
  assert.equal(canPlace(state, 'quality', 4, 0).ok, true);
});

test('rotation swaps width and depth for rot 1 only', () => {
  const state = createGame();
  // kitchen rot0 is 5 wide: x=-10 would reach x=-12.5 and fail.
  assert.equal(canPlace(state, 'kitchen', -10, 0, 0).ok, false);
  // kitchen rot1 is 4 wide: x=-10 spans [-12,-8] and fits.
  assert.equal(canPlace(state, 'kitchen', -10, 0, 1).ok, true);
  assert.equal(place(state, 'kitchen', -10, 0, 1).ok, true);
  assert.equal(state.buildings[0].rot, 1);
  // Rotated footprint must be used for collision too.
  const touching = canPlace(state, 'quality', -8, 0, 0); // spans x[-9.5,-6.5]
  assert.equal(touching.ok, false, 'quality would overlap the rotated kitchen');
  assert.equal(canPlace(state, 'quality', -6, 0, 0).ok, true); // spans x[-7.5,-4.5]
});

test('invalid inputs: unknown type, bad rotation, non-finite positions', () => {
  const state = createGame();
  assert.match(canPlace(state, 'warehouse', 0, 0).reason, /unknown type/i);
  assert.equal(canPlace(state, '__proto__', 0, 0).ok, false);
  assert.equal(canPlace(state, 'constructor', 0, 0).ok, false);
  assert.match(canPlace(state, 'kitchen', 0, 0, 2).reason, /rotation/i);
  assert.match(canPlace(state, 'kitchen', 0, 0, -1).reason, /rotation/i);
  assert.match(canPlace(state, 'kitchen', NaN, 0).reason, /finite/i);
  assert.match(canPlace(state, 'kitchen', 0, Infinity).reason, /finite/i);
  assert.match(canPlace(state, 'kitchen', '0', 0).reason, /finite/i);
  assert.equal(place(state, 'kitchen', NaN, 0).ok, false);
  assert.equal(state.buildings.length, 0);
  assert.equal(state.money, 50000);
});

test('insufficient budget blocks placement without charging', () => {
  const state = createGame();
  state.money = NaN;
  assert.equal(place(state, 'kitchen', 0, 0).ok, false);
  state.money = Infinity;
  assert.equal(place(state, 'kitchen', 0, 0).ok, false);
  state.money = TYPES.kitchen.cost - 1;
  const result = place(state, 'kitchen', 0, 0);
  assert.equal(result.ok, false);
  assert.match(result.reason, /insufficient budget/i);
  assert.equal(state.buildings.length, 0);
  assert.equal(state.money, TYPES.kitchen.cost - 1);
  state.money = TYPES.kitchen.cost;
  assert.equal(place(state, 'kitchen', 0, 0).ok, true);
  assert.equal(state.money, 0);
});

test('duplicate modules are rejected and only charged once', () => {
  const state = createGame();
  assert.equal(place(state, 'kitchen', 0, 0).ok, true);
  const moneyAfterFirst = state.money;
  const duplicate = place(state, 'kitchen', 8, 0);
  assert.equal(duplicate.ok, false);
  assert.match(duplicate.reason, /already placed/i);
  assert.equal(state.buildings.length, 1);
  assert.equal(state.money, moneyAfterFirst);
});

test('roads are always normalized to x0 z6.5 rot0', () => {
  const state = createGame();
  assert.equal(place(state, 'roads', 5, -3, 1).ok, true);
  assert.deepEqual(
    { x: state.buildings[0].x, z: state.buildings[0].z, rot: state.buildings[0].rot },
    { x: 0, z: 6.5, rot: 0 },
  );
  assert.equal(state.money, 50000 - TYPES.roads.cost);
});

test('remove refunds in build phase and is rejected afterwards', () => {
  const state = createGame();
  place(state, 'kitchen', 0, 0);
  const id = state.buildings[0].id;
  assert.equal(remove(state, 'nope').ok, false);
  const removed = remove(state, id);
  assert.equal(removed.ok, true);
  assert.equal(state.buildings.length, 0);
  assert.equal(state.money, 50000);

  buildAll(state);
  openFactory(state);
  const late = remove(state, state.buildings[0].id);
  assert.equal(late.ok, false);
  assert.match(late.reason, /build phase|cannot edit/i);
  assert.equal(state.buildings.length, TYPE_KEYS.length);
});

test('readiness reports missing keys in TYPES order', () => {
  const state = createGame();
  assert.deepEqual(readiness(state), TYPE_KEYS);
  place(state, 'kitchen', -2.5, 0);
  place(state, 'roads', 0, 6.5);
  assert.deepEqual(readiness(state), ['utilities', 'receiving', 'quality', 'bottling', 'shipping']);
  buildAll(state);
  assert.deepEqual(readiness(state), []);
});

test('openFactory requires all seven modules', () => {
  const state = createGame();
  place(state, 'roads', 0, 6.5);
  const early = openFactory(state);
  assert.equal(early.ok, false);
  assert.match(early.reason, /missing/i);
  assert.equal(state.phase, 'build');

  buildAll(state);
  assert.equal(openFactory(state).ok, true);
  assert.equal(state.phase, 'receiving');
  assert.equal(state.elapsed, 0);
  assert.equal(openFactory(state).ok, false, 'cannot reopen');
  assert.equal(canPlace(state, 'kitchen', 8, -5).ok, false, 'no edits after build');
});


function until(state,predicate,limit=800){for(let i=0;i<limit&&!predicate(state);i++)tick(state,.5);assert.ok(predicate(state),`Timed out at ${state.phase}`);}
function finish(state){until(state,s=>{if(s.phase==='awaitingQuality')assert.ok(releaseBatch(s).ok);return s.phase==='complete';});return state;}
function balance(s){
 const t=k=>s.transfers.filter(t=>t.key===k).reduce((n,t)=>n+t.amount,0),v=s.stock,total=s.supplied?300:0;
 assert.equal(v.raw+v.kitchenRaw+t('raw')+s.consumed.raw,total);
 assert.equal(v.packs+v.bottlePacks+t('packs')+s.consumed.packs,total);
 assert.equal(v.held+v.ready+t('goods')+s.truck.load+s.delivered,s.totalPacked);
 assert.equal(v.bottleSyrup+v.kitchenSyrup+t('syrup')+s.totalPacked+(s.phase==='mixing'?100:0),s.consumed.raw);
 for(const n of Object.values(v))assert.ok(Number.isInteger(n)&&n>=0);
}
test('pause freezes suppliers, transfers, production and loading; invalid dt is rejected',()=>{
 const s=openGame();tick(s,5);s.paused=true;const before=structuredClone(s);tick(s,60);assert.deepEqual(s,before);
 for(const dt of [-1,NaN,Infinity,'1',61])assert.equal(tick(s,dt).ok,false);
 s.paused=false;s.speed=2;tick(s,1);assert.ok(Math.abs(s.time-7)<1e-6);
});
test('all stock is conserved, release is explicit, and 300 cartons ship exactly once',()=>{
 const s=openGame();assert.equal(releaseBatch(s).ok,false);assert.equal(dispatchTruck(s).ok,false);
 for(let i=0;i<400&&s.phase!=='complete';i++){
  tick(s,.5);balance(s);
  if(s.phase==='awaitingQuality'){
   assert.equal(s.stock.held,100);const held=s.stock.held;tick(s,2);assert.equal(s.stock.held,held);
   assert.ok(releaseBatch(s).ok);assert.equal(releaseBatch(s).ok,false);
  }
 }
 assert.equal(s.phase,'complete');assert.equal(s.delivered,300);assert.equal(s.trips,2);assert.equal(s.totalPacked,300);
 assert.deepEqual(Object.values(s.stock),Array(8).fill(0));balance(s);
 tick(s,60);assert.equal(s.delivered,300);assert.ok(s.best.time>0);
});
test('held goods cannot load, and partial departure credits only actual load after exit',()=>{
 const s=openGame();until(s,s=>s.phase==='awaitingQuality');tick(s,30);assert.equal(s.truck.load,0);assert.equal(s.stock.ready,0);
 releaseBatch(s);until(s,s=>s.truck.load>=25);const load=s.truck.load;assert.ok(load<200);assert.ok(dispatchTruck(s).ok);assert.equal(dispatchTruck(s).ok,false);assert.equal(s.delivered,0);
 const resumed=restoreGame(JSON.parse(JSON.stringify(s)));until(resumed,s=>s.delivered>0);assert.equal(resumed.delivered,load);balance(resumed);
 until(s,s=>s.delivered>0);assert.equal(s.delivered,load);balance(s);finish(s);assert.equal(s.delivered,300);assert.equal(s.trips,3);
});
test('unavailable packaging stops bottling without consuming syrup or inventing cartons',()=>{
 const s=openGame();until(s,s=>s.phase==='bottling'&&s.stock.bottleSyrup>0);const kits=s.stock.bottlePacks;s.stock.bottlePacks=0;const syrup=s.stock.bottleSyrup,cartons=s.cartons;
 tick(s,3);assert.equal(s.cartons,cartons);assert.equal(s.stock.bottleSyrup,syrup);s.stock.bottlePacks=kits;finish(s);balance(s);
});
test('dock access and disconnected ports are rejected; routes avoid building interiors',()=>{
 const s=createGame();assert.ok(place(s,'receiving',0,-3).ok);
 assert.equal(place(s,'quality',0,1).ok,false);assert.equal(place(createGame(),'shipping',0,0,1).ok,false);
 const full=buildAll(createGame());const route=routeBetween(full,'receiving','bottling');assert.ok(route.distance>0);
 for(const [x,z]of route.path)for(const b of full.buildings.filter(b=>b.type!=='roads')){const w=b.rot?TYPES[b.type].d:TYPES[b.type].w,d=b.rot?TYPES[b.type].w:TYPES[b.type].d;assert.ok(!(Math.abs(x-b.x)<w/2&&Math.abs(z-b.z)<d/2));}
 const broken=structuredClone(full);broken.buildings.find(b=>b.type==='kitchen').z=3;assert.ok(layoutIssues(broken).length);assert.equal(openFactory(broken).ok,false);
});
test('a longer usable layout measurably slows the same order',()=>{
 const fast=buildAll(createGame()),slow=buildAll(createGame());const id=slow.buildings.find(b=>b.type==='bottling').id;
 assert.ok(moveBuilding(slow,id,5,-5).ok);refreshRoutes(fast);assert.ok(slow.routes.syrup.distance>fast.routes.syrup.distance);
 openFactory(fast);openFactory(slow);finish(fast);finish(slow);assert.equal(fast.delivered,slow.delivered);assert.ok(slow.time>fast.time+5,`${slow.time} vs ${fast.time}`);
 console.log(`  measured: compact ${fast.time.toFixed(1)}s / longer layout ${slow.time.toFixed(1)}s`);
});
test('free paused moves preserve in-flight stock; invalid moves leave everything unchanged',()=>{
 const s=openGame(),id=s.buildings.find(b=>b.type==='bottling').id;assert.equal(moveBuilding(s,id,5,-5).ok,false);
 until(s,s=>s.transfers.length>0);s.paused=true;const before=structuredClone(s);assert.equal(moveBuilding(s,id,-8,0).ok,false);assert.deepEqual(s,before);
 assert.ok(moveBuilding(s,id,5,-5).ok);assert.equal(s.money,before.money);balance(s);s.paused=false;finish(s);balance(s);
});
test('save/reload resumes each state, migration preserves layout, and forged stock is rejected',()=>{
 const s=openGame();const phases=new Set();
 for(let i=0;i<400&&s.phase!=='complete';i++){
  tick(s,.5);if(!phases.has(s.phase)){phases.add(s.phase);const restored=restoreGame(JSON.parse(JSON.stringify(s)));balance(restored);assert.equal(restored.phase,s.phase);assert.equal(restored.truck.load,s.truck.load);}
  if(s.phase==='awaitingQuality')releaseBatch(s);
 }
 const resumed=restoreGame(JSON.parse(JSON.stringify(s)));assert.equal(resumed.delivered,300);tick(resumed,2);assert.equal(resumed.delivered,300);
 const forged=structuredClone(s);forged.stock.ready++;assert.throws(()=>restoreGame(forged));
 const oldBlocked=structuredClone(s.buildings);oldBlocked.find(b=>b.type==='shipping').rot=1;assert.equal(restoreGame({buildings:oldBlocked}).buildings.length,7);assert.ok(layoutIssues(restoreGame({buildings:oldBlocked})).length);
 const legacy={buildings:s.buildings};assert.equal(restoreGame(legacy).buildings.length,7);assert.equal(restoreGame(legacy).phase,'build');
});
test('retry preserves layout and best time but resets material accounting',()=>{
 const s=finish(openGame()),layout=structuredClone(s.buildings),best=s.best.time;assert.ok(retryOrder(s).ok);assert.deepEqual(s.buildings,layout);assert.equal(s.best.time,best);assert.equal(s.phase,'build');assert.equal(s.delivered,0);balance(s);
 assert.ok(openFactory(s).ok);assert.equal(retryOrder(s).ok,false);s.paused=true;assert.ok(retryOrder(s).ok);
});
test('fractional frame counters stay nonnegative and old rounding residual saves recover',()=>{
 let s=openGame(),lastPacked=-1,lastLoad=-1,resumed=0;
 for(let frame=0;frame<16000&&s.phase!=='complete';frame++){
  tick(s,1/60);assert.ok(s.elapsed>=0);assert.ok(s.truck.credit>=0);
  if(s.totalPacked!==lastPacked||s.truck.load!==lastLoad){lastPacked=s.totalPacked;lastLoad=s.truck.load;s=restoreGame(JSON.parse(JSON.stringify(s)));balance(s);resumed++;}
  if(s.phase==='awaitingQuality')releaseBatch(s);
 }
 assert.equal(s.delivered,300);assert.ok(resumed>300);
 const old=structuredClone(s);old.elapsed=-1.4e-15;old.truck.credit=-1.2e-14;
 const fixed=restoreGame(old);assert.equal(fixed.elapsed,0);assert.equal(fixed.truck.credit,0);assert.equal(fixed.delivered,300);
 old.elapsed=-.01;assert.throws(()=>restoreGame(old));
});
console.log(`\n${passed} tests passed${process.exitCode?' (with failures)':''}`);
