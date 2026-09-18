# Completed backlog

Items move here whole with evidence and completion dates. Remaining gaps stay in
[the open backlog](backlog.md). “Done” describes the stated scope, not deployment or product value.

## CF-001 — Observation-only JevAstra prototype

Recorded and completed: 2026-09-18. Scope: standalone triage experiment with private append-only
logs, offline checks and a dated synthetic comparison. Evidence: [initial pilot report](../reports/2026-09-18-initial-pilot.md)
and [usage/accounting contract](../README.md). This retrospective entry records the existing
prototype; it does not fabricate earlier backlog history.

Excludes: automatic game-development integration, independently validated real-event quality,
and realized savings. Those decisions remain open in [CF-002](backlog.md#cf-002--evaluate-jevastra-on-real-development-events).

## CF-004 — Adapt ContentMgmt development commands

Added and completed locally: 2026-09-18. Scope: shared project instructions, `/bro`, `/ship`,
`/backlog`, open/done records, writing rules and an offline document-link check.
Procedures and entry points: [AGENTS.md](../AGENTS.md).

Measured verification on 2026-09-18: `python3 check_docs.py` passed; Python unittest ran 13
passing tests, including the new document-check regression; `npm --prefix game test` ran 22
passing simulation checks. DeepSeek V4.1 Flash through OpenRouter reviewed the adaptation
plan and source commands; its advice was checked before adoption, not treated as authority.
The private delegation ledger retains usage with the dollar charge unknown, not zero.

Initial scope excluded: executing `/ship`, committing/pushing these changes, browser verification of the game,
Vercel setup, and edits to the other task's PRD or game implementation.

Ship follow-up, 2026-09-18: Luis requested publication. Removed workflow links that depended
on the other task's unpublished PRD and made game checks conditional on game inclusion in the
release. The exact staged workflow-only snapshot passed the document check and 13 Python tests;
the separate local game still passed its 22 simulation checks, but is not included or browser-tested
by this task. Independent Codex review found no blocking issues in the checker/regression test.
Review evidence is retained privately in `logs/ship-review-20260918T213016Z-7135acac.json`;
the final document reviews by native Codex and DeepSeek also found no blocking issues.
The unresolved product-principles idea is recorded as [CF-005](backlog.md#cf-005--decide-which-contentmgmt-product-principles-fit-cityfactory),
not adopted as project rules. Vercel remains deferred.

## CF-009 — Document City Factory and the approved Jev team experiment

Recorded and completed: 2026-09-18. Retrospective documentation entry; no earlier backlog history is implied.
Scope: [PRD v0.2](../PRD.md) captures the accepted factory-builder direction, core manufacturing journey, visual references, scope limits, proposed validation targets, and the approved three-character Jev experiment.

Release notes: the PRD now distinguishes accepted direction from proposed details, adds the post-delivery team interaction with six acceptance criteria, and retains source provenance without publishing machine-local paths or internal source documents.

Verification on 2026-09-18: independent native Codex review found no blocking PRD issues and checked the publication-source cleanup. The exact staged documentation snapshot passed `python3 check_docs.py` and all 13 offline Python tests. Game checks and browser checks are not applicable to this documentation-only snapshot; `game/` is excluded. This ship review used native Codex; no additional DeepSeek invocation or paid model call was made for this release.

Excludes: implementing or validating game behavior, proving model quality or player value, and deployment. Remaining core acceptance work is [CF-007](backlog.md#cf-007--validate-the-first-delivery-game-against-the-prd); implementation and evaluation of the team experiment is [CF-008](backlog.md#cf-008--build-and-evaluate-the-approved-jev-team-experiment).

## CF-010 — Playable factory and material-flow challenge

Recorded and completed locally: 2026-09-19. Retrospective entry for this task's implementation;
no earlier backlog history is implied. Publication is handled by the requested ship workflow.

Release notes:

- Build a syrup factory from seven large modules in an interactive 3D landscape with a classic toolbox.
- Fulfil a 300-carton order through real ingredient/packaging inventories, clear material paths,
  three quality-released batches and capacity-limited trucks, including partial shipments.
- Compare delivery and waiting times, pause to relocate modules for free, retry the same order,
  and resume saved progress. Placement checks prevent overlapping buildings and blocked access.

Evidence and coverage: [game README](../game/README.md#material-flow--19-september-2026),
[simulation checks](../game/simulation.test.mjs), and [terrain checks](../game/art.test.mjs).
The 2026-09-19 browser journey covered 300 delivered cartons over three shipments, a partial
93-carton dispatch, all three quality gates, free paused relocation, save/reload, retry, and
an invalid dock rotation. The automated layout comparison changes transport time while
keeping machine rates fixed; measured values and procedure are in the game README.

Excludes: hosted deployment, learner validation, photorealistic concept fidelity, the guided
shortage event, advanced capacity/traffic simulation and the Jev team experiment. Remaining
first-experience acceptance is kept in [CF-007](backlog.md#cf-007--validate-the-first-delivery-game-against-the-prd),
the team experiment in [CF-008](backlog.md#cf-008--build-and-evaluate-the-approved-jev-team-experiment),
and deployment in [CF-003](backlog.md#cf-003--set-up-vercel-when-requested).

Ship verification, 2026-09-19: the independent native Codex review identified a normal-frame-rate
save/reload defect; the counter fix and legacy-save compatibility were independently verified.
The exact staged tree passed document links/instruction limits, 13 Python tests, 23 simulation
checks and terrain checks, with the pinned dependency installed from the offline npm cache.
No existing backlog item was moved: CF-007 retains its unmet acceptance criteria; CF-010
records only the completed scope above.

The additional DeepSeek documentation pass was invoked through DeepAstra with verified model
`deepseek/deepseek-v4.1-flash` on OpenRouter, then stopped before its final review. No findings
from that incomplete pass were used; its dollar charge is unknown. Native Codex provided the
completed independent release review.
