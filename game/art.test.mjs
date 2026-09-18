import assert from 'node:assert/strict';
import {randomSource,groundHeight} from './landscape.js';
const a=randomSource(18),b=randomSource(18);
for(let i=0;i<100;i++){const value=a();assert.equal(value,b());assert.ok(value>=0&&value<1);}
// Every permitted factory footprint stays on a flat plot. The lake is below its water surface.
for(let x=-12;x<=12;x++)for(let z=-8;z<=8;z++)assert.equal(groundHeight(x,z),-.14);
assert.ok(groundHeight(29,-23)<-.34);
for(let x=-60;x<=60;x+=5)assert.ok(Math.abs(groundHeight(x,13)+.22)<1e-10);
for(let x=-100;x<=100;x+=10)for(let z=-80;z<=80;z+=10)assert.ok(Number.isFinite(groundHeight(x,z)));
console.log('Art checks passed: seeded scenery, flat building land, road height and lake basin.');
