# Open backlog

Stable IDs are shared with [completed work](backlog_done.md). Priorities guide planning;
they do not override Luis's current request. Game requirements are being developed separately
in local `PRD.md`, not included in this workflow-only release or duplicated here.

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
