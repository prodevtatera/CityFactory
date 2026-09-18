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
