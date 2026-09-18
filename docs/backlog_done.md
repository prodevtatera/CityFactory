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
