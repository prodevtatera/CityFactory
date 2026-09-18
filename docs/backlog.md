# Open backlog

Stable IDs are shared with [completed work](backlog_done.md). Priorities guide planning;
they do not override Luis's current request. The [City Factory PRD](../PRD.md) holds detailed
game requirements; this backlog tracks remaining work and evidence rather than duplicating them.

## CF-006 — Block the prohibited legacy Astra route

Added: 2026-09-18. Priority: P0 — the existing live comparator violates Luis's new routing policy.
Status: open; execution is prohibited by project instructions, but no runtime guard exists yet.

Scope: prevent the legacy `--compare-astra` path from invoking `openai/gpt-6-astra` through
OpenRouter. Reject forbidden models, aliases and unsafe fallbacks before any request, with
offline regression coverage. Any replacement must be explicitly permitted and verified.
Done when: a runtime guard blocks prohibited routing before network I/O and its offline test passes.
Excludes: making paid calls to test the restriction or quietly substituting a different model.

## CF-002 — Evaluate JevAstra on real development events

Added: 2026-09-18. Priority: P1 — needed before deciding whether to keep the experiment.
Status: open; the pilot does not automatically observe game-development work.
Blocked for legacy paired runs by [CF-006](#cf-006--block-the-prohibited-legacy-astra-route);
the OpenRouter Astra comparison must not be used under the new routing restriction.

Scope: agree on a minimal way to capture non-sensitive real development events, label them
independently, and assess decisions, actual API charges, missed issues, review/rework effort
and maintenance cost. Compare with always-review and simple rules. Use fresh data to validate
any chosen threshold; do not treat [the synthetic exploration](../reports/2026-09-18-threshold-exploration.md)
as independent validation. Follow the logging/privacy contract in [README.md](../README.md).

Done when: a dated real-event evaluation states coverage, known/unknown costs, quality failures,
effort and the decision to keep, simplify or remove the pilot. Any proposed savings remain
projections until calls are actually avoided and quality is checked.

Excludes: silent monitoring, autonomous suppression of work, or enabling paid calls by default.
Existing prototype evidence: [CF-001](backlog_done.md#cf-001--observation-only-jevastra-prototype).

## CF-003 — Set up Vercel when requested

Added: 2026-09-18. Priority: P2 — explicitly deferred by Luis: “We will have our Vercel environment later. fyi”.
Status: deferred; no environment setup is authorized by the workflow-copy request.

Scope: once requested, verify the project/root/build configuration, create or link the approved
preview environment, check the game there, then update the shipping procedure with verified steps.

Done when: the approved preview URL serves the intended commit and its game journey passes.
Excludes: production deployment, invented environment URLs and adding infrastructure in advance.

## CF-005 — Decide which ContentMgmt product principles fit CityFactory

Added: 2026-09-18. Priority: P2 — potentially useful direction, but adaptation is not yet approved.
Status: awaiting Luis's decision; he called product principles “this is gold!” and the follow-up
question about adapting them remains unanswered.

Scope: if approved, review ContentMgmt's actual principles and propose the relevant CityFactory
versions, separating product decisions from development procedures.
Done when: Luis accepts the selected principles and they are recorded with their rationale.
Excludes: importing video-business restrictions or treating enthusiasm as approval of new rules.

## CF-007 — Validate the first-delivery game against the PRD

Added: 2026-09-18. Priority: P1 — the first useful game milestone and prerequisite for the team experiment.
Status: open; this documentation task does not certify the separate game implementation.

Scope: assess the current prototype against [PRD sections 4–9 and 12](../PRD.md#7-functional-requirements-and-acceptance-criteria), close verified gaps, and record evidence. Resolve syrup identity, recipe quantities/units, production timings, order size, target browsers/hardware, and visual fidelity during prototype review.

Done when: the build-to-delivery journey, correction of placement errors, unmet readiness, packaging-shortage recovery, quality/release gating, pause/restart, and accounting checks pass; the proposed learning/visual playtest is recorded with actual results and remaining gaps.
Excludes: claiming implementation complete from documentation checks, a city-scale economy, advanced manufacturing lessons, or deployment.

## CF-008 — Build and evaluate the approved Jev team experiment

Added: 2026-09-18. Priority: P2 — approved follow-on after the P1 first-delivery experience works.
Status: open; approved scope is documented, not implemented by this task.

Scope: implement [PRD section 10](../PRD.md#10-approved-experiment-talk-to-your-factory-team): one dispatcher panel, three characters, the early-truck situation on a repeat order, bounded Jev decisions, ordinary action-button fallback, and player-controlled release. Resolve provider/model version, action wording, timeout/request budget and character presentation; measure actual interpretation quality, latency and available cost evidence.

Done when: CF-14 through CF-19 pass, including unclear/invalid/late/duplicate responses and release bypass attempts; the comparison with action buttons is recorded against the PRD's proposed continuation gate. Retain, revise or remove the model interaction based on that evidence.
Excludes: the separate JevAstra development-triage pilot, open-ended chat, generated stories, autonomous release, large workforces, and automatic expansion into adaptive events or further manufacturing layers. Those remain candidates for a later product decision after playtesting. Model routing must respect Luis's prohibition on OpenAI/Anthropic through OpenRouter, including fallbacks.
