---
description: Verify scoped work, reconcile the backlog, commit and fast-forward main
---

Ship $ARGUMENTS, or this task's changes when no scope is supplied. Run the steps below only
when the user asks to ship, not when asked to copy or explain this command.
Here, shipping means **verified code/documents on GitHub main, not a deployed environment**.
Vercel setup is deferred; no deployment command is currently part of shipping.

1. **Scope and safety.** Record the branch, status, base, worktrees and diff, including this
   task's already committed changes. Identify exactly what belongs to this task; never stage
   with `git add .`, `git add -A`, or `git commit -a` over another task's work. Inspect the
   staged diff for secrets, raw logs,
   generated files and unrelated changes. An unexpected branch switch stops publication.
2. **Documents and evidence.** Apply [the writing rules](../rules/documents.md). Reconcile
   changed figures with their dated sources. Distinguish actual spend/savings from projections,
   unknown cost from free, synthetic examples from independently labeled real events, and
   code completion from tested behavior. Release notes, when relevant, belong in the existing
   README or completed backlog; do not create a release system just for this step.
3. **Backlog, even when publication is blocked.** File unresolved in-scope decisions, defects
   and gaps in [backlog.md](../../docs/backlog.md), deduplicated and prioritized with reasons.
   Follow [the backlog procedure](backlog.md) to move completed items whole into
   [backlog_done.md](../../docs/backlog_done.md), preserving history and updating links.
   If nothing needs filing or moving, say so. Do not invent work to fill the backlog.
4. **Checks.** Run `git diff --check`, `git diff --cached --check`, `python3 check_docs.py`,
   `python3 -m unittest -q`, and `npm --prefix game test` when the release contains the game.
   Missing or failing required checks block publication. For a workflow-only release before
   the game is committed, explicitly report the game check as not applicable to that snapshot.
   Also export the exact staged tree to a private temporary directory and rerun its offline
   checks there: untracked local files must not make an incomplete release appear to pass.
   For game UI changes, verify the affected browser journey and console errors. For changes
   to the production flow, test completion, quality release and dispatch without duplicate
   consumption/reward or negative inventory. Never use paid model calls as offline tests.
5. **Independent review.** Obtain a bounded independent review of the scoped diff using the
   user's authorized provider/agent. Do not send secrets or private logs. Review correctness,
   regressions and security; check PRD fit when the release includes game/product changes.
   Verify findings before fixing them. If no independent
   reviewer is available, report that gap before publication. Rerun affected checks after fixes.
6. **Commit.** Recheck branch and staged scope. Commit only this task's files, with a message
   explaining what changed and why, without model identifiers. Do not mix unfinished work
   from other tasks into a successful commit.
7. **Fast-forward and push.** Fetch origin and verify its URL and default branch before writing.
   Use the main checkout shown by `git worktree list`; do not guess its path. If main advanced,
   integrate it into the task branch without rewriting shared history, resolve only in-scope
   conflicts, and repeat checks/review as needed. Stop for ambiguous conflicts or any integration
   that would touch unrelated dirty files. Unrelated untracked work may stay in place for a
   scoped commit directly on main; never stage or overwrite it. Fast-forward local main when
   working from a branch, then push main normally; no force-push and no PR unless requested.
   Re-fetch and confirm origin/main
   contains the shipped commit. A rejected push requires fetching and rechecking, not forcing.
8. **Cleanup only when safe.** Remove a task branch/worktree only if explicitly disposable,
   clean (including untracked files), fully merged and no other task uses it. Never remove the
   main checkout, force removal, or discard someone else's files. Otherwise leave it intact.
9. **Report precisely.** Give the commit/link, actual checks and review result, backlog moves
   and top priorities. Say **pushed, not deployed**. Partial completion is not a successful ship;
   include the exact blocker and any unverified behavior. Deployment remains a separate request.
