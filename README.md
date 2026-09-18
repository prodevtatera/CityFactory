# CityFactory

The playable factory builder is in [game/](game/README.md): build a syrup factory and fulfil
a 300-carton order with material transport, quality release and truck loading. See the
[product requirements](PRD.md) and [remaining acceptance work](docs/backlog.md#cf-007--validate-the-first-delivery-game-against-the-prd).
The game runs locally; no hosted deployment is configured.

## Separate JevAstra pilot

An observation-only experiment: Jev assesses whether a software-project event needs an engineer's attention. Optionally, Astra evaluates the same event so we can compare decisions, latency and actual API charges. Python 3.10+ on macOS/Linux; no pip packages, service, database or UI.

When the pilot was created, this directory had no application or event pipeline. The pilot is a standalone command and importable `evaluate()` function. It does **not** intercept this Codex conversation, automatically route future tasks, write application code, or suppress work. Astra in this pilot produces a triage verdict, not a full coding-agent run.

## Use it

**Routing restriction, 2026-09-18:** never route GPT/OpenAI or Claude/Anthropic through
OpenRouter, including aliases and fallbacks. Native Codex/OpenAI is allowed. The legacy
`--compare-astra` option below targets `openai/gpt-6-astra` through OpenRouter and **must not
be run**. Paired-call examples are retained as historical documentation of the existing
experiment, not permitted commands. This warning does not disable the option in code;
[the backlog](docs/backlog.md#cf-006--block-the-prohibited-legacy-astra-route) records that gap.
Offline reports and mock-based tests do not make model calls.

Run from this directory. The existing `.env` supplies `OPENROUTER_API_KEY`; an environment variable overrides it. Credentials are read as data, never sourced as shell code. `.env` is ignored by Git.

```sh
# Real Jev call. Only the explicitly supplied text is sent.
python3 jev_astra.py run --text 'Deployment is blocked by a failing migration.'

# Paid paired comparison on the 12 synthetic examples.
python3 jev_astra.py run --events examples/events.jsonl --dataset synthetic --compare-astra --budget-usd 0.25 --limit 12

# Read existing evidence, with no new API calls.
python3 jev_astra.py report
python3 jev_astra.py report --json
```

Each decision printed by `run` includes `event_id` and `run_id`. Use these to inspect a particular run or add your own outcome later:

```sh
python3 jev_astra.py report --run-id RUN_ID
python3 jev_astra.py label EVENT_ID review
python3 jev_astra.py label EVENT_ID ignore

# Example only: enter your actual effort and valuation, not these illustrative numbers.
python3 jev_astra.py effort --minutes 15 --hourly-rate-usd 50 --category maintenance
```

Effort categories: `setup`, `maintenance`, `review`, `rework`. Effort entries are project-wide, even when a report selects one run. Feedback is append-only; the latest human label supersedes earlier labels for that event. Provider verdicts never become ground truth automatically.

## Real events

Create a JSONL file with one object per line. Keep the source file so the logged input hash remains auditable. Use stable non-sensitive IDs, and include only material needed for the decision.

```json
{"id":"build-123","text":"All tests passed; no action required.","needs_review":false}
{"id":"issue-456","text":"Login still fails after the patch.","needs_review":true}
```

`needs_review` is an optional independently supplied expected label. It must be a JSON boolean. Labels, rationales and event IDs are not sent to either model. Real events are the default; mark synthetic data explicitly with `--dataset synthetic`. Inputs are limited to 24,000 UTF-8 bytes per event and 20 events per run by default. All input rows are validated before any paid calls; `--limit` sets the maximum number processed, up to 1,000. The log records unprocessed counts.

```sh
python3 jev_astra.py run --events my-events.jsonl --compare-astra --limit 20 --budget-usd 0.25
```

## Decision and failure behavior

- An unresolved defect, blocker, new work request, ambiguous status or unsupported completion claim needs review.
- Only `p_needs_review <= 0.05` suggests ignoring an event. This conservative starting point is a tunable policy, not a calibrated accuracy guarantee.
- API failures and malformed answers recommend review. Non-finite/out-of-range probabilities and truncated Astra replies are rejected.
- Runs always stay in observation mode. `--compare-astra` calls Astra for **every processed event**, including events Jev would skip. Without that flag, only Jev is called and no measured Astra baseline is available.
- Calls have a 45-second timeout and no automatic retries. A missing charge stops further calls in that run; unknown is never recorded as free. Every network attempt is logged before sending, so interrupted calls remain visible as pending.
- `--budget-usd` is a conservative per-run spending guard based on request bytes and pinned published rates, with Astra output capped at 512 tokens. It is not a provider-enforced account cap; other processes, future price changes and separately started runs are outside it. Review the dated rates before prolonged use.

## Evidence and cost accounting

`logs/events.jsonl` is an append-only ledger with file locking, per-record flush/fsync, and owner-only permissions for newly created files/directories. It contains:

- Request/run IDs, policy text/hash, implementation hash, thresholds and actual served model/provider metadata.
- Jev probabilities, both recommendations, expected labels and later human feedback.
- Input hashes and byte counts; raw event text, API keys and raw responses are not stored.
- Reported input/output tokens, latency, provider-reported `usage.cost`, separate token-price estimates, errors and incomplete requests.
- Actual actions and calls avoided, kept at zero because this is observation mode.
- Optional effort and rework time valued at a supplied hourly rate.

Keep the original source events privately for later review: a hash alone cannot reconstruct them. Logs are local and Git-ignored. Supplied event text is sent to OpenRouter and the selected provider. No project scan or background monitoring runs.

The report separates synthetic and real events, shows repeated inputs, missed actionable cases, unnecessary reviews, an always-review baseline, and the paired Astra results. Provider-returned dollar amounts are used for spending; token-price estimates do not silently fill missing receipts. Pending/unknown charges make the total unknown. Costs from failed or orphaned requests stay in the spending total even if no comparison is possible.

For pairs with valid decisions and known costs:

```text
Astra-only baseline = sum of paired Astra charges
Projected routed cost = all paired Jev charges + Astra charges on suggested-review cases
Projected savings = baseline - projected routed cost
```

These are **counterfactual triage savings**, not savings on building an application. A paired experiment pays for both models. Reported projections exclude unpaired/failed cases; coverage is shown explicitly. This Codex development conversation is unmetered here. The separate DeepSeek setup run is recorded in `logs/deepseek-development.json`; its dollar charge was unavailable. Do not interpret missing setup or effort data as zero.

Explore thresholds without paying again or overwriting history:

```sh
python3 jev_astra.py report --run-id RUN_ID --simulate-threshold 0.30
python3 jev_astra.py report --run-id RUN_ID --output reports/new-report.md
```

Report files are created exclusively; choose a new filename for each snapshot. Offline threshold exploration reuses the same data and is **not independent validation**. Keep the conservative default until testing a chosen threshold against fresh, representative, independently labeled real events. Also compare with simple rules before expanding the system. API savings must outweigh maintenance, supervision and the cost of missed issues.

## Initial live result — 2026-09-18

Paired run `f22a11da-2f84-4d41-942f-840e1cf6c775` completed all 12 synthetic cases with no API or schema failures. Jev cost **$0.000198576**; Astra cost **$0.0316**. A separate one-event Jev smoke check cost **$0.000016254**. These figures exclude development/supervision.

At the unchanged 0.05 threshold, Jev recommended review for all 12 events: 8/12 matched the supplied labels, with no missed actionable cases but 4 unnecessary reviews. This is identical to the always-review baseline, with extra API cost. Astra matched 11/12 supplied labels; it marked the explicitly unsupported completion claim as not needing review.

An exploratory 0.30 threshold applied to the same saved probabilities would skip the four routine events, match 12/12 labels and reduce the paired triage cost by roughly 30%. That result was selected after inspecting these examples and **does not establish production savings or accuracy**. No threshold was changed and no real events have been evaluated.

DeepSeek V4.1 Flash via the existing DeepAstra/OpenRouter wrapper drafted the synthetic cases and their critique. The supervising agent inspected and adopted the cases. These are AI-authored labels, not independent human ground truth.

## Checks

### Development workflow

Project instructions are in [AGENTS.md](AGENTS.md). Adapted from ContentMgmt:

- `/bro` restates the last answer plainly without redoing work.
- `/backlog` lists open priorities; `/backlog add …` records work; `/backlog done ID` moves
  verified completed work with its history intact. `/backlog done` shows completed items.
- `/ship` checks and reviews the scoped work, updates the backlog, commits and pushes main.
  It does not deploy: Vercel setup is deferred until requested.

The procedures live in [.claude/commands](.claude/commands); Codex follows their mapping in
AGENTS.md (this does not install global slash-command autocomplete). See [open work](docs/backlog.md)
and [completed work](docs/backlog_done.md). Copying these files does not execute `/ship`.

### Offline verification

```sh
python3 check_docs.py
python3 -m unittest -v
```

Also run `npm --prefix game test` for the browser game. The earlier workflow-only release
excluded it; the initial playable game is now included, with evidence in [its README](game/README.md).

Offline checks cover cost accounting, budget stops, invalid responses, network failures, interrupted requests, conservative routing, feedback, threshold simulations and log privacy. They use no credentials or network calls.

References checked 2026-09-18: [OpenRouter Decisions API](https://openrouter.ai/docs/api/api-reference/alphadecisions/submit-a-decisions-questions-and-answers-request), [Jev endpoint metadata](https://openrouter.ai/api/v1/models/typesafe/jev-1.13/endpoints), [Jev model limits](https://docs.typesafe.ai/models), [known weaknesses](https://docs.typesafe.ai/model-jaggedness/jev-1.13).
