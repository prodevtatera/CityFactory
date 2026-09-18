# City Factory — Product Requirements Document

Version 0.2 · 18 September 2026 · Owner: Luis

Status: working PRD grounded in the existing concept discussion. Luis approved the product direction, visual ambition, and the Jev-powered “talk to your factory team” experiment. Detailed mechanics and validation targets remain proposed defaults. A prototype is being built in a separate task. This document defines the intended experience and does not claim that any requirement is implemented or tested.

### Implementation update — 19 September 2026

After v0.2, Luis approved material transport and layout efficiency as the next playable lesson.
The current [game](game/README.md#material-flow--19-september-2026) uses a fixed 300-carton order,
100-carton batches and 200-carton trucks, with actual inventory, partial shipments, automatic
clear-path routing, free paused relocation and retries. These tuning values supersede the
provisional 100-carton mission quantity below. Machine rates stay constant; distance affects
transport and waiting. This update also brings layout-related waiting forward from the later
lessons mentioned below; capacity upgrades remain deferred.

This is a scoped implementation milestone, not completion of this PRD. The guided packaging
shortage, learning/visual playtest and Jev team experiment remain open in
[CF-007](docs/backlog.md#cf-007--validate-the-first-delivery-game-against-the-prd) and
[CF-008](docs/backlog.md#cf-008--build-and-evaluate-the-approved-jev-team-experiment).

## 1. Product vision

**Build a beautiful little factory, bring it to life, and learn how manufacturing works by fulfilling your first order.**

City Factory is a manufacturing builder inspired by the experience of starting with land and a toolbox in Cities: Skylines II. The player places large, understandable factory modules, prepares a production flow, opens the business, and watches material become a product that trucks collect.

The MVP is one syrup factory. Its purpose is to make the main manufacturing blocks understandable and enjoyable before introducing detailed equipment, process configuration, or business management. The factory itself is the learning interface: tanks work, bottles move, goods wait for release, and a truck leaves with the player's output.

## 2. Confirmed direction and working assumptions

### Requirements stated by Luis

- Begin with a plot of land and a classic toolbox for building a factory.
- Use syrup production as the first factory scenario.
- Start with big manufacturing blocks; add granular detail later.
- Let the player open the business after building, with trucks arriving to collect produced material.
- Help the player understand the big blocks of a manufacturing system through a simplified experience.
- Make the game visually appealing, fun, and satisfying to play.
- Use the supplied manufacturing lifecycle only as domain context; keep the game independent of vendors and the source document's customer-specific scope.
- Follow the generated concept images. Luis explicitly approved their direction and requested a playable result resembling them.
- Add a small “talk to your factory team” experiment after the first guided delivery: one dispatcher panel, three characters, and a handful of permitted actions interpreted by Jev. Compare the experience with ordinary action buttons before expanding it.

### Proposed defaults for this PRD

| Topic | MVP default | Reason |
|---|---|---|
| Audience | Curious beginners with no manufacturing background | Matches learning through simplified building |
| Platform | Single-player desktop browser, mouse and keyboard | Matches the prototype direction already underway |
| First session | Approximately 10–15 minutes | Long enough for a complete build-to-delivery loop |
| Content | One plot, one syrup product, one fixed recipe, one customer order | Keeps attention on the manufacturing flow |
| Mission quantity | 100 cartons, as illustrated in the concept | Provisional balancing value; not an established simulation constant |
| Difficulty | Guided and recoverable, with one material shortage | Teaches cause and effect without punishing experimentation |
| Business simulation | Order progress and a delivery reward | A detailed economy is unnecessary for the first learning goal |

The syrup formulation is intentionally fictional and illustrative. The MVP does not prescribe a real production recipe. Maple imagery in the artwork is a visual reference, not a decision to simulate maple harvesting or a specific industrial process.

## 3. Player outcome

The player should finish thinking: **“I built this factory, I know what each part does, and I understand why making something is only part of delivering it.”**

After the first delivery, the player should be able to:

1. Identify what receiving, production, packaging, quality, and shipping contribute.
2. Explain how a product, its recipe, and an order guide production.
3. Follow input materials into a named batch and then into packaged goods.
4. Recognize why a missing input stops a stage and how to recover.
5. Distinguish production completion, quality release, and dispatch.

## 4. Core game loop and first mission

**Build → open → produce → review and release → dispatch → celebrate.**

| Step | Player action | Visible consequence |
|---|---|---|
| Arrive | Explore the empty plot and select the first toolbox item | A placement preview appears on the ground |
| Build | Place the required modules and connect road access | The site grows into a readable factory; a checklist shows what remains |
| Prepare | Inspect the simple product/recipe card and first order | Ingredients, packaging needs, planned output, and production sequence are clear |
| Open | Select **Open Factory** once the site is ready | The site becomes active and the first supply delivery arrives |
| Produce | Start the order's batch | Inputs decrease, tanks animate, and batch progress becomes visible |
| Recover | Resolve the guided packaging-material shortage | Bottling resumes from its existing progress |
| Review | Inspect completed output and the quality result, then release the batch | Finished goods change from **Awaiting release** to **Ready to ship** |
| Dispatch | Allow the collection truck to load released goods | Stock transfers to the truck; departure completes the order |
| Celebrate | View the short delivery summary | The game highlights the player's factory and recaps the manufacturing flow |

The first departure is the core MVP's completion moment. Afterward, the player can inspect the factory, restart, or try the approved team experiment on another order using the same product, recipe, and factory. An endless campaign is not required.

## 5. Toolbox and manufacturing blocks

Keep the seven recognizable categories from the concept art. Each needs a clear name, distinctive silhouette, short purpose, and immediate placement feedback.

| Toolbox block | Player-facing purpose | Minimum behavior |
|---|---|---|
| Roads | “Bring materials in and send products out.” | Connect the outside road to receiving and shipping; show disconnected access |
| Utilities | “Give your factory water and power.” | One combined support module enables operation; no pipe or electrical network editor |
| Receiving | “Store the ingredients and packaging you need.” | Receive deliveries and expose available versus required input quantities |
| Syrup Kitchen | “Turn ingredients into a batch of syrup.” | Consume the fixed recipe's ingredients, run a timed batch, and display output |
| Quality | “Check the batch before it can leave.” | A visible quality module opens the batch's checks and release controls |
| Bottling | “Turn syrup into packaged products.” | Consume bulk syrup and packaging materials to create countable finished goods |
| Shipping | “Load released products for the customer.” | Hold finished stock and load a collection truck only when the batch is released |

Quality is represented by a building for discoverability, but it is a status and decision across the batch. It must not appear as a physical conveyor station through which every bottle travels. The displayed material flow is **Receiving → Syrup Kitchen → Bottling → Shipping**, with quality checks and release associated with that flow.

Road connectivity has a simple operational purpose. Interior pipes, conveyors, and transfer arrows may be automatically visualized; manual transport-network design is deferred. Placement must still affect site readiness, and material movement must correspond to simulation state.

## 6. Manufacturing lifecycle translated into play

The source lifecycle contains more concepts than the physical toolbox. Represent planning and records in small contextual cards instead of adding a building for every concept.

| Lifecycle concept | MVP representation |
|---|---|
| Plan | One order with a visible quantity and completion objective |
| Define product | A single syrup product card with its output unit |
| Define materials | A fixed recipe showing ingredients and packaging requirements |
| Define process | A visible sequence connecting the factory's main activities |
| Create order | A customer order linked to a production batch |
| Prepare material | Receiving inventory and readiness checks before consumption |
| Execute | Timed production and bottling with visible progress |
| Control quality | Simple checks associated with the batch, separate from shipping permission |
| Handle exceptions | A recoverable packaging shortage with a clear corrective action |
| Reconcile | Planned output versus actual packaged output and any remaining material |
| Review and release | A deliberate release action after required work and checks are complete |
| Dispatch | Released stock loaded into a truck and counted as delivered when it departs |

Dispatch extends the source lifecycle to deliver Luis's requested business payoff. The first mission need not introduce random defects, yield losses, or detailed reconciliation rules. Planned and actual quantities can match while still making the distinction visible.

## 7. Functional requirements and acceptance criteria

All requirements below define the proposed MVP baseline.

| ID | Requirement | Observable acceptance criterion |
|---|---|---|
| CF-01 | Start on an empty buildable plot | A new session shows the plot, outside access road, toolbox, and first objective |
| CF-02 | Place and correct modules | A ghost preview shows the footprint; overlap and out-of-bounds placement are rejected with a reason; the player can cancel or remove a mistaken placement before opening |
| CF-03 | Explain readiness | Open Factory remains unavailable until required modules, utilities, and access are ready; the checklist names each missing condition |
| CF-04 | Explain the order | A card shows product, recipe inputs, target quantity, and delivered quantity using consistent units |
| CF-05 | Operate a real production flow | Production consumes available inputs and creates downstream stock; no stage creates output without its required inputs |
| CF-06 | Expose state and cause | Selecting a module shows whether it is idle, working, waiting, or blocked, with the relevant reason |
| CF-07 | Preserve batch identity | The same visible batch identifier links production, packaging, quality, and shipment |
| CF-08 | Teach one recoverable exception | A controlled packaging shortage pauses bottling; a clearly named replenishment action restores supply and allows progress without restarting |
| CF-09 | Gate release and shipment | Release is unavailable until required work and checks pass; a truck can wait but cannot load held or unreleased goods |
| CF-10 | Make delivery tangible | The collection truck arrives, visibly loads actual stock, and departs; order progress cannot exceed the target |
| CF-11 | Support inspection | The player can pan/zoom, pause, and choose normal or faster simulation speed; pausing stops production and truck progress |
| CF-12 | End with a learning payoff | Departure triggers a concise completion summary containing the output delivered and the main manufacturing sequence |
| CF-13 | Allow replay | Restart returns to the initial plot and quantities; resetting an active run requires confirmation |

The shortage is a **supply problem**, not a throughput bottleneck. Bottling may have a visible production rate, but diagnosing or upgrading constrained capacity is a later lesson.

## 8. Simulation boundaries

- Use simple, deterministic rules so the same player actions produce understandable outcomes.
- Maintain distinct quantities for ingredients, bulk syrup, packaging, packaged goods, loaded goods, and delivered goods. Display units and the recipe's conversion consistently; litres and cartons are not interchangeable.
- Keep the customer order, production batch, and truck shipment distinct but visibly linked.
- Separate “production complete,” “quality passed,” “released,” and “delivered.” A progress bar reaching 100% cannot silently satisfy all four.
- Prevent negative inventory, duplicate consumption, duplicate loading, and duplicate completion rewards.
- If shipment takes time, transfer stock into the truck when loaded and mark it delivered once the truck departs. Do not count the same goods both on the dock and in the truck.
- Keep checks and timings deliberately simplified. Do not introduce real-world compliance claims, equipment control, or production-system integrations.
- Provide enough input supply and a replenishment path to finish the mission. Building mistakes and the teaching exception must not create an unexplained dead end.

## 9. Visual and interaction direction

**The visual experience is a core requirement.** The approved artwork depicts a warm, inviting miniature industrial world: green terrain, water and trees, bright buildings, metal tanks, amber syrup, readable machinery, and moving trucks.

Use an angled/isometric-style camera and cutaway buildings so players can understand what happens inside. The scene should communicate a working factory even before opening a panel. Aim to capture the composition, clarity, and atmosphere of the concept images; those images are the art-direction target, not evidence of implemented rendering quality.

The interface should stay focused:

- **Top left:** current objective and order progress.
- **Top right:** factory state, pause, and speed.
- **Bottom:** seven large toolbox items with icons and labels.
- **Context panel:** selected module's purpose, inputs, output, status, and next useful action.
- **World overlays:** optional flow arrows and short status labels tied to actual state.

Reward placement with a clear snap and completion feedback. Show production through tank activity, bottle motion, and accumulating goods. Let the truck departure and finished factory provide the main celebration. Avoid long introductory text and repeated modal interruptions.

Use readable labels, sufficient contrast, visible keyboard focus, and status icons/text in addition to color. Expose controls to keyboard use, including a documented way to select and place modules. Respect reduced-motion preferences for decorative effects and retain pause for the simulation.

## 10. Approved experiment: talk to your factory team

**Purpose:** let players express an intention and see understandable reactions from people in their factory. The added fun comes from agency, anticipation, and personality; the learning goal is to distinguish preparing a shipment, reviewing a batch, and authorizing release.

Unlock the experiment after the first guided delivery. Offer it as an optional next activity, with the ordinary controls still available. Start with one dispatcher panel and three visible characters:

| Character | Permitted activity | Visible response |
|---|---|---|
| Warehouse worker | Prepare the loading area or wait | Walk to the dock and mark the area prepared; do not load unreleased goods |
| Quality supervisor | Request a batch review or wait for eligibility | Approach Quality and surface the existing review action when the batch is ready |
| Collection driver | Wait at the collection point | Stand beside the truck and acknowledge the plan |

These are role-based characters, not a staffing economy. Use a small set of authored acknowledgements and animations. Their movement follows ordinary game logic; Jev chooses permitted intentions and reactions rather than controlling every step.

### First playable situation

Illustrative authored scenario, not observed player feedback:

1. On the next order, the collection truck arrives before the batch is ready. The driver says, “I'm a little early. Can we get ready to load?”
2. The player types, “Prepare the loading area. Ask quality to review the batch before anything leaves.”
3. Jev maps that instruction and the current situation to permitted actions: prepare the dock, request review when eligible, and have the driver wait.
4. The panel shows the interpreted actions and each character's status. The worker prepares the dock; the supervisor acknowledges the review request; the driver waits.
5. The player reviews and explicitly releases the eligible batch using the existing control. Only then can loading and departure occur.

Preparations must have visible state that the player can inspect; speech bubbles must not claim actions happened when they did not. Requesting review early records a pending request without completing the review or authorizing release.

### Decision flow and limits

**Player instruction + compact game state → Jev selects allowed actions → game validates current eligibility → characters react.**

- Send the instruction, relevant role descriptions, current batch state, and allowed choices. Treat player text as data, never as authority to change game rules.
- Include an explicit unclear/unsupported outcome. Ask a short clarification or offer action buttons when intent is ambiguous; do not silently guess.
- Use Jev for interpreting language and selecting bounded responses. Keep quantities, production timing, costs, routes, stock movement, and release rules in game code. Jev must not generate dialogue or directly modify simulation state.
- Revalidate returned actions against the current batch and state. Ignore stale responses after reset or order changes, and prevent repeated responses from scheduling duplicate actions.
- Trigger a request on submission; any later event-driven reactions must be bounded to meaningful events. Never call the model from the animation loop. Keep the simulation responsive while a request is pending.
- Use a small server endpoint to hold the API key, validate input and output, and enforce request limits and a timeout. No credential belongs in browser code. Fall back to ordinary controls on timeout, invalid output, or service failure.
- Record model version, decision latency, available usage/cost evidence, and whether the player corrected the interpretation during evaluation. Unknown charges remain unknown. No price or performance claim is assumed from the transcript.

### Acceptance criteria

| ID | Requirement | Observable acceptance criterion |
|---|---|---|
| CF-14 | Introduce the team after the first success | The experiment is offered only after the first delivery; declining it leaves inspection and replay available |
| CF-15 | Interpret a multi-role instruction | The example above produces understandable per-character actions and matching visible behavior |
| CF-16 | Handle uncertainty | Ambiguous or unsupported instructions produce a clarification or action choices without unintended state changes |
| CF-17 | Preserve player control of release | Instructions such as “ship immediately” cannot release a batch, bypass its checks, or load unreleased stock |
| CF-18 | Remain playable without the model | A simulated timeout or invalid response leaves the normal controls usable; late or duplicate responses cannot affect a different batch or repeat an action |
| CF-19 | Keep reactions truthful | The dispatcher distinguishes requested, waiting, and completed actions; a review request alone never displays the batch as released |

The experiment does not include open-ended chat, generated stories, autonomous production planning, or a large workforce. Adaptive events and personality variations remain later candidates. Use authored events and simple rules where they provide the same player benefit.

## 11. Scope limits

The core MVP does not require multiple products or factories, a full city simulation, terrain editing, detailed staffing, pricing, loans, a financial ledger, multiplayer, accounts, cloud saves, or a campaign system. The three-character experiment in section 10 is the approved, bounded exception to the original exclusion of AI characters.

Detailed recipe editing, equipment phases, cleaning/changeovers, maintenance, traceability graphs, random quality failures, complex logistics, and throughput optimization belong to later iterations. The first mission uses a clean, ready site and a fixed process rather than pretending these topics have already been taught.

Local save/resume is also deferred for the short first mission. State this clearly before play; add persistence when session length or playtesting demonstrates a need.

## 12. Validation and definition of done

### Functional evidence

Demonstrate one complete journey from empty plot to departed truck. Include a misplaced module correction, an unmet opening condition, the packaging shortage and recovery, and an attempted shipment before release. Verify pause and restart as part of the same journey.

Maintain a small runnable simulation check covering material accounting, release gating, and shipment counted exactly once. Verify the browser experience on the agreed desktop target. The PRD's existence does not satisfy these checks.

### Proposed playtest targets

Use five first-time players for an initial directional test, not a statistical claim:

| Question | Initial target |
|---|---|
| Can someone begin without spoken instructions? | At least 4 of 5 place their first module within 60 seconds |
| Can they complete the loop? | At least 4 of 5 finish the first delivery within 15 minutes without facilitator intervention |
| Do they understand the factory? | At least 4 of 5 correctly identify the roles of receiving, production, packaging, quality, and shipping |
| Do they understand release? | At least 4 of 5 explain why completed goods cannot necessarily ship immediately |
| Does the recovery teach cause and effect? | At least 4 of 5 identify the missing packaging and recover without being told the solution |
| Is it enjoyable? | At least 4 of 5 rate the experience 4/5 or better, with qualitative feedback recorded |

Confirm visual quality by reviewing the playable empty-plot and running-factory scenes against the approved concepts. No telemetry service is required for this small test; observation and short interviews are sufficient.

### Team experiment validation

Validate CF-14 through CF-19 separately from the first-delivery journey. Use controlled model responses for offline checks of valid, ambiguous, invalid, duplicate, and late decisions, including an attempted release bypass. Live evaluation establishes interpretation quality and latency; passing offline checks alone does not establish either.

Compare the same early-truck scenario with free-text instructions and with action buttons. Alternate which version players try first. Record interpretation corrections, time to a visible response, whether reactions matched intent, and which version players prefer and why. Also check that players still understand who authorizes release.

The proposed continuation gate is that at least 4 of 5 players can complete the scenario without facilitator help and explain the release boundary, and a majority prefer the language interaction for a concrete reason. This is an initial directional test, not a measured result. If the model adds confusion or no noticeable benefit, retain the characters and action buttons and revise or remove the Jev interaction before expanding it.

## 13. Delivery sequence and unresolved choices

1. **Buildable scene:** empty land, camera, toolbox, placement feedback, correction, readiness checklist.
2. **First working factory:** order, ingredients, batch, bottling, quality release, loading and departure.
3. **Learning and polish:** guided shortage, contextual explanations, animations, accessible controls, completion recap, end-to-end verification and playtest.
4. **Talk to your team experiment:** repeat the familiar order with an early collection truck, three characters, a dispatcher panel, bounded Jev decisions, fallback controls, and the comparison playtest.

No deadline or completion status is inferred from this sequence.

Resolve during prototype review: the final syrup identity, recipe quantities and units, production timings, exact order size, target browsers/hardware, and how closely the current renderer matches the visual target. These are tuning and implementation choices; they do not change the agreed build-to-delivery concept.

For the team experiment, resolve the provider/model version, permitted-action wording, timeout and request budget, and character presentation during implementation. The existing JevAstra triage experiment is not the game integration and must not be treated as one.

After the first mission and team experiment have been evaluated, choose further learning layers from player feedback—such as varied orders, constrained capacity, or cleaning between products—rather than expanding every subsystem at once.

## 14. Source record

- **Revision 0.2 — 18 September 2026:** Luis accepted the recommendation to prototype “talk to your factory team” and requested this PRD update. This adds the bounded post-delivery experiment and supersedes version 0.1's blanket exclusion of AI characters. It does not mark the feature implemented.
- **Jev inspiration:** `62-We-need-to-talk-about-Jev.txt` (local transcript retained in the originating task), supplied by Luis. The town-character demonstration inspired the interaction; claims in the transcript are reference material, not product instructions or verified performance guarantees.
- **Technical references checked during the recommendation on 18 September 2026:** [TypeSafe API](https://docs.typesafe.ai/api) for structured decisions, and [Jev limitations](https://docs.typesafe.ai/model-jaggedness/jev-1.13) for the boundaries around generation, numerical reasoning, and untrusted inputs. Verify the selected provider's current interface before implementation.

- **Primary discussion:** [Plan syrup factory builder MVP](codex://threads/01a0b654-0942-7290-9117-51cc4dfbc027), 18 September 2026. Luis's initial request establishes land, toolbox, syrup, large manufacturing blocks, trucks, learning, and visual quality. His follow-up—“I want to see the result like in the image... I loved it.”—approves the visual direction and authorizes the prototype. The implementation turn was still active when this PRD was researched.
- **Manufacturing context:** Manufacturing Map V4 (local reference retained in the originating task), lifecycle stage definitions at lines 1399–1410. Only the generic lifecycle is used; source-specific coverage assessments and draft business requirements are not game requirements.
- **Approved concept direction — empty plot:** image `exec-7cba544b-4b77-4b82-9ca1-ecee426d8745.png` in the primary discussion.
- **Approved concept direction — working factory:** image `exec-1d58e1a2-215e-457b-af90-b1cdc4084438.png` in the primary discussion.
- **Workspace separation:** the root README describes a separate model-triage experiment. Its routing, API-cost tracking, and reports are not part of the City Factory game scope. The current prototype work is under `game/`.

Publication note, 18 September 2026: machine-local source paths were replaced with source titles and image identifiers. The original references remain in the originating Codex task; internal reference documents and concept artwork are not distributed with this PRD. The Codex task link requires access to that task.
