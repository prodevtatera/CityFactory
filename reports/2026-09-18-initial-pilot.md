# JevAstra observation report

Generated: 2026-09-18T21:03:04.061434+00:00

Observation only: no events suppressed and no coding work executed.
Actual savings: $0.00000000; actual Astra calls avoided: 0.
Known API spend: $0.03179858.
Total API spend: $0.03179858; unknown charges: 0; pending requests: 0.

Policy versions: 37f8a561f813b7c3; logged thresholds: [0.05].
Use --run-id to inspect one configuration separately.

- openai/gpt-6-astra: 12 calls, median 2143 ms, known spend $0.03160000.
- typesafe/jev-1.13: 12 calls, median 367 ms, known spend $0.00019858.

## synthetic events

Evaluations: 12; unique inputs: 12.
Potential skipped calls: 0; Jev errors: 0; Astra errors: 0.
Correct against supplied labels: 8/12; human feedback labels: 0.
Always-review baseline correct: 8/12 (no classification API required).
Astra correct: 11/12; Astra false skips: 1.
Missed actionable events (false skips): 0; unnecessary reviews: 4.
Astra disagreements: 5/12 paired verdicts. Astra is a comparator, not ground truth.
Paired cost coverage: 12/12 events.
Astra-only baseline for priced pairs: $0.03160000.
Projected Jev + retained Astra calls for those pairs: $0.03179858.
Projected savings for those pairs: $-0.00019858 (counterfactual, not realized).

## Value versus complexity

Project effort cost: unknown; no time/cost entries recorded.
No effort entries means unmeasured effort, not zero development or maintenance cost.
Projected savings exclude setup, supervision, maintenance, mistakes/rework, and unpaired/failed calls.
API spending excludes this Codex conversation and separately logged DeepSeek development work.
Synthetic cases test the integration; they do not establish production accuracy or ROI.
Decision: remain in observation mode until representative labeled real events show acceptable false skips, positive net savings after effort/rework, and an advantage over simple rules.
