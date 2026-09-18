# CityFactory development

The browser game is in `game/`; [its README](game/README.md) describes the implemented
learning challenge. [PRD.md](PRD.md) also includes requirements not yet implemented.
The root Python code is a separate, observation-only JevAstra experiment; see
[README.md](README.md). Do not connect it to game development or claim savings
without an explicit implementation request and measured evidence.

## Working rules

- Never route GPT/OpenAI or Claude/Anthropic models through OpenRouter, including tests,
  retries, aliases, auto-routing or fallback chains. Verify an explicitly permitted model
  before each request; otherwise stop. Native Codex/OpenAI is permitted. Include this restriction
  in every delegated brief. The legacy pilot's `--compare-astra` option is prohibited because
  it targets OpenAI through OpenRouter; do not run it. This rule is not a runtime code guard.
- Read the files you change. Preserve unrelated work, especially changes from other tasks.
- Before substantial implementation, read [the open backlog](docs/backlog.md). Its priorities
  are advisory; the user's requested work wins. Do not turn backlog inspection into a blocker.
- Keep changes small; reuse existing code and the standard library. Add a runnable check for
  non-trivial logic. No speculative services or tooling.
- Keep `.env`, credentials, raw events, private logs, and dependency directories out of Git.
  Offline tests must not call paid APIs. Respect the user's current delegation instructions;
  report the provider actually invoked, and unknown cost as unknown, never zero.
- For Markdown changes, read [the writing rules](.claude/rules/documents.md).
- Run `python3 check_docs.py` and `python3 -m unittest -q` for root changes.
  Run `npm --prefix game test` for game changes. A game UI change also needs a browser check
  of the affected journey; automated simulation tests alone do not prove the UI works.
- Keep this file and root `CLAUDE.md` at no more than 200 lines each. Put procedures in commands.

## Commands

When asked for these commands (including plain `bro`, `ship`, `backlog`, or `backlog done`),
read and follow the matching file. This maps requests in Codex; it does not install a global
slash-command menu. Claude can use the project command files directly.

| Request | Procedure |
| --- | --- |
| `/bro` | [Restate the last answer plainly](.claude/commands/bro.md) |
| `/ship [scope]` | [Check, reconcile backlog, commit and push](.claude/commands/ship.md) |
| `/backlog [add … / done ID / done]` | [Maintain open and completed work](.claude/commands/backlog.md) |

Copying or reviewing a command is not permission to execute it. Only an actual ship request
authorizes its Git publication steps, and any narrower user instructions take precedence.

## Deployment

Vercel is planned **later**, not configured by this workflow. Do not create Vercel projects,
link environments, add deployment configuration, or deploy as part of the current `/ship`.
When setup is requested, verify the project, build/root settings and preview environment first,
then update the shipping procedure. Production always needs an explicit production request.
