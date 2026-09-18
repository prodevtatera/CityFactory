# CityFactory — Syrup Valley

A playable browser prototype: start with land, place seven large factory modules, open the factory, fulfil a 300-carton order in three syrup batches, release each batch, and watch trucks collect actual stock.

```sh
cd game
npm install
npm start
```

Open http://127.0.0.1:4173. The server serves only this game directory. No accounts, keys, backend or external asset requests are needed.

## Play

Choose a toolbox module, then click the plot. R rotates. Arrow keys move the placement preview; Enter places it. Existing modules can be inspected and removed for a refund during construction. Roads occupy a fixed entrance lane. Utilities serve the whole site.

“Give me a starter layout” fills the missing modules while preserving what you built. “Open factory” starts the first order. Each batch requires quality release before its cartons can load. Trucks hold 200 cartons; you can dispatch a partial load. Pause and inspect a module to move it for free. Retry the same order to compare delivery times; progress saves locally in this browser.

Right-drag to orbit, scroll to zoom, or use camera buttons. The mission card can collapse. Pause and 2× controls change the simulation. Space pauses when the scene has focus. Reduced-motion preferences suppress decorative animation.

## Big manufacturing blocks

| Block | In the game |
| --- | --- |
| Plan, define product/materials/process, create order | One prepared syrup recipe and a 300-carton customer order, made in 100-carton batches |
| Infrastructure | Roads and utilities |
| Prepare materials | Receiving with ingredient and packaging storage |
| Execute | Syrup Kitchen, then Bottling |
| Quality and release | Lab, automatic introductory checks, explicit release decision |
| Reconcile and trace | Planned vs packed quantities, persistent batch identity, delivery total |
| Dispatch | Shipping storage, loading forklift and customer truck |

Next depth: a guided recoverable material shortage, yield losses and capacity upgrades. Those are not simulated yet. Staffing, cleaning and detailed recipes are abstracted; checks always pass in this first mission. The production timer is illustrative, not a real syrup process. One module of each kind fits the introductory mission. This is a stylized 3D prototype, not the photorealistic concept illustration.

## Check

```sh
npm test
```

The simulation checks cover placement, boundaries, rotations, budget, required modules, pause/speed, production quantities, quality gating and repeat deliveries. Browser verification also covers construction, starter layout, save/reload, release and a completed delivery.

Three.js is the sole runtime dependency. The world and models are procedural geometry, with no image-generation API at runtime. DeepSeek via DeepAstra implemented the original timer-based simulation; the parent agent replaced it with the material-flow simulation described below. DeepSeek also provided a read-only invariant review for this revision (verified provider: OpenRouter; model: deepseek/deepseek-v4.1-flash; dollar cost unavailable).

## Visual pass — 18 September 2026

The playable world now uses textured ground and asphalt, instanced foliage, sculpted terrain, reflective materials, contact shading, detailed tanks and cutaway buildings, loading aprons, and more detailed trucks. The white-and-blue HUD has larger toolbox labels and previews. [Generated texture and prompt](assets/README.md).

These are real-time scene changes, not a replacement of the game with a concept image. The result remains stylized; the reference image's photorealistic detail is still an art-direction target. The test command also checks deterministic scenery and flat placement/road surfaces.

## Material flow — 19 September 2026

The supplier delivers 300 ingredient units and 300 packaging kits. The learning recipe consumes one of each per carton; it is not a real formulation. Actual 100-unit lots travel along obstacle-avoiding paths. Ingredients go to the kitchen, packaging directly to Bottling, syrup from the kitchen to Bottling, and released cartons to Shipping. Quality is a release gate rather than a material transport station.

Longer routes increase transport time. Mixing stays at 12 seconds per batch and bottling/loading at 10 cartons per second. Truck travel also depends on dock position. Held stock cannot load, loaded stock is removed from Shipping, and only a departed shipment increases delivered quantity. The order ends at 300 delivered cartons. The next truck collects any remainder after a partial departure.

The UI previews routes and transfer times, prevents blocked dock approaches and material routes, reports current stock, and measures elapsed order time, truck waiting and shipment count. Pause permits free relocation; active transfers retain their completion fraction on the updated route. Retry clears order materials and deliveries, preserves the layout, and retains the best completed time. Paused time and time spent in a review dialog are excluded; waiting for the player to open the review is included.

Old saves retain their valid building layout and start the new challenge with clean inventory. A backup of the prior save is kept under `cityfactory.syrup.v1.before-flow`. New saves validate ingredient, packaging, syrup and carton balances before resuming, including partially loaded or departing trucks.

Automated check on 19 September 2026: the compact starter layout completed the same order in 123.1 simulated seconds; moving Bottling to (5, -5) took 132.6 seconds. Both tests release each batch at the next half-second check. This is a deterministic test result, not a user-performance claim. Run [the simulation checks](simulation.test.mjs) with `npm test` to reproduce it and the accounting, pause, partial shipment, route, relocation, retry and save validation checks.

Limits: one fixed order and recipe; dedicated transport lots share paths without congestion; fixed public/access road; no shared forklift scheduling, spoilage, capacity upgrades or guided shortage event. Receiving is limited to this order's 300 units of each input, production to one 100-carton batch, and Shipping to the order total. These choices keep the lesson focused on layout and material accounting.

Browser verification on 19 September 2026 completed all 300 cartons over three shipments after manually sending a 93-carton partial load. It also covered all three quality releases, a free paused move, save/reload, retry preserving the best time, and rejection of a dock facing away from the road. No browser errors were recorded during that check.

Ship review — 19 September 2026: independent native Codex review found and verified a floating-point save bug at normal frame rates. Both progress-counter residuals now clamp to zero, and restoration tolerates only tiny negative rounding residuals in older saves. The new fractional-frame regression passes alongside all 23 simulation checks and terrain checks. The reviewer separately verified consecutive 60-FPS save/resume snapshots through a complete 300-carton order without a rejected save.
