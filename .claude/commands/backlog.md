---
description: List, add and close development backlog items without losing their history
---

Use $ARGUMENTS as the requested operation. Read [open work](../../docs/backlog.md)
and [completed work](../../docs/backlog_done.md) before changing either.

- No arguments: summarize the top three open priorities and any deferred items; do not edit.
- `done` with no ID: summarize completed work; do not move or close anything.
- `add <description>`: deduplicate, then add a stable `CF-NNN` ID unused in either file,
  today's date, priority with reason, scope, exclusions, and a verifiable completion condition.
  P0 blocks use or risks data; P1 is needed for the next useful milestone; P2 can wait.
  Do not implement the item merely because it was added.
- `done <ID>`: verify evidence against the item's completion condition. If unfinished,
  leave it open and explain the gap. Otherwise move the entire item to the done file,
  keeping its ID, original heading, dates, corrections and history; append the completion
  date and evidence. Unfinished subparts become separate open items linked to the original.

When moving an item, update repository links pointing to its old location. Never delete
history or label assumptions, proposals or untested behavior as completed. Run
`python3 check_docs.py` after editing. Report what changed; no commit, push or deployment.
