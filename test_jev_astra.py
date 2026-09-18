"""Offline checks: python3 -m unittest -v. No API key or network needed."""
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import urllib.error

import jev_astra as pilot


class PilotChecks(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.log = Path(self.temp.name) / "events.jsonl"
        self.budget = {"limit": 1, "spent": 0, "unknown": False}
        self.event = {"id": "case", "text": "secret example text", "needs_review": False}

    def jev(self, probability=0.01, cost=0.000021):
        return {"model": pilot.JEV, "answers": {"needs_review": {"type": "noul", "noul": probability}},
                "usage": {"input_tokens": 500, "output_tokens": 10, "cost": cost}}

    def astra(self):
        return {"model": pilot.ASTRA, "choices": [{"finish_reason": "stop", "message": {
            "content": '{"needs_review": false}'}}],
            "usage": {"prompt_tokens": 500, "completion_tokens": 10, "cost": 0.006}}

    def run_event(self, response, **kwargs):
        return pilot.evaluate(self.event, "private-test-key", self.log, "test-run", self.budget,
                              transport=lambda *args: response, **kwargs)

    def test_paired_costs_are_counterfactual_and_log_has_no_text_or_key(self):
        responses = iter([self.jev(), self.astra()])
        def transport(url, payload, key):
            self.assertNotIn("needs_review", payload.get("state", {}))
            return next(responses)
        row = pilot.evaluate(self.event, "private-test-key", self.log, "test-run", self.budget,
                             compare=True, dataset="synthetic", transport=transport)
        summary = pilot.summarize(pilot.read_log(self.log))
        group = summary["groups"]["synthetic"]
        self.assertEqual(row["recommended_action"], "ignore")
        self.assertAlmostEqual(summary["total_api_spend_usd"], 0.006021)
        self.assertAlmostEqual(group["paired_projected_savings_usd"], 0.005979)
        self.assertEqual(summary["actual_savings_usd"], 0)
        self.assertEqual(group["false_skips"], 0)
        self.assertNotIn(self.event["text"], self.log.read_text())
        self.assertNotIn("private-test-key", self.log.read_text())

    def test_probability_validation_and_conservative_threshold(self):
        for value in (None, True, "0", -0.1, 1.1, float("nan"), float("inf")):
            row = self.run_event(self.jev(value))
            self.assertEqual(row["recommended_action"], "review")
            self.assertEqual(row["jev_error"], "invalid_decision")
        self.assertEqual(self.run_event(self.jev(0.05))["recommended_action"], "ignore")
        self.assertEqual(self.run_event(self.jev(0.051))["recommended_action"], "review")

    def test_network_failure_records_unknown_charge_and_stops_further_spend(self):
        def offline(*args):
            raise urllib.error.URLError("private-test-key")
        row = pilot.evaluate(self.event, "key", self.log, "test-run", self.budget,
                             compare=True, transport=offline)
        self.assertEqual(row["recommended_action"], "review")
        self.assertEqual(row["astra_error"], "budget_or_unknown_charge")
        summary = pilot.summarize(pilot.read_log(self.log))
        self.assertIsNone(summary["total_api_spend_usd"])
        self.assertEqual(summary["unknown_charge_requests"], 1)
        self.assertNotIn("private-test-key", self.log.read_text())

    def test_missing_cost_is_unknown_but_zero_cost_is_valid(self):
        response = self.jev(cost=None)
        self.run_event(response)
        self.assertTrue(self.budget["unknown"])
        summary = pilot.summarize(pilot.read_log(self.log))
        self.assertIsNone(summary["total_api_spend_usd"])
        self.assertEqual(pilot.usage_record(self.jev(cost=0), pilot.JEV)["reported_cost_usd"], 0)
        self.assertAlmostEqual(pilot.usage_record(response, pilot.JEV)["estimated_cost_usd"], 0.000021)

    def test_budget_prevents_network_call(self):
        self.budget["limit"] = 0.0000001
        with patch.object(pilot, "http_post", side_effect=AssertionError("Must not call")):
            row = self.run_event(self.jev())
        self.assertIsNone(row["jev_request_id"])
        self.assertEqual(row["jev_error"], "budget_or_unknown_charge")
        self.assertEqual(pilot.summarize(pilot.read_log(self.log))["request_count"], 0)

    def test_feedback_and_repeats_dont_invent_independent_evidence(self):
        row = self.run_event(self.jev())
        self.run_event(self.jev())
        pilot.append_log(self.log, {"type": "feedback", "event_id": row["event_id"], "needs_review": True})
        summary = pilot.summarize(pilot.read_log(self.log), "test-run")
        group = summary["groups"]["real"]
        self.assertEqual(group["false_skips"], 1)
        self.assertEqual(group["evaluations"], 2)
        self.assertEqual(group["unique_input_hashes"], 1)
        self.assertEqual(group["human_labeled"], 1)
        self.assertIsNone(group["paired_projected_savings_usd"])

    def test_pending_requests_make_spending_unknown(self):
        pilot.append_log(self.log, {"type": "request_started", "run_id": "test-run", "request_id": "interrupted"})
        summary = pilot.summarize(pilot.read_log(self.log))
        self.assertEqual(summary["pending_requests"], 1)
        self.assertIsNone(summary["total_api_spend_usd"])

    def test_input_validation(self):
        for events in ([{"id": "x", "text": ""}], [self.event, self.event],
                       [{"id": "x", "text": "ok", "needs_review": "false"}],
                       [{"id": "x", "text": "a" * 24001}]):
            with self.assertRaises(ValueError):
                pilot.validate_events(events)
        pilot.validate_events([json.loads(line) for line in
            (pilot.ROOT / "examples" / "events.jsonl").read_text().splitlines() if line.strip()])

    def test_schema_failure_retains_actual_billed_cost(self):
        self.run_event({"usage": {"cost": 0.1}})
        summary = pilot.summarize(pilot.read_log(self.log))
        self.assertEqual(summary["total_api_spend_usd"], 0.1)
        self.assertEqual(summary["groups"]["real"]["jev_errors"], 1)

    def test_no_redirect_for_credentials(self):
        self.assertIsNone(pilot.NoRedirect().redirect_request(None, None, 302, "", {}, "https://other.invalid"))

    def test_offline_threshold_does_not_rewrite_evidence(self):
        self.run_event(self.jev(0.2))
        before = self.log.read_bytes()
        rows = pilot.read_log(self.log)
        self.assertEqual(pilot.summarize(rows)["groups"]["real"]["potential_calls_avoided"], 0)
        simulated = pilot.summarize(rows, simulate_threshold=0.3)
        self.assertEqual(simulated["groups"]["real"]["potential_calls_avoided"], 1)
        self.assertEqual(simulated["actual_savings_usd"], 0)
        self.assertEqual(self.log.read_bytes(), before)
        self.assertEqual(pilot.summarize(rows)["groups"]["real"]["potential_calls_avoided"], 0)

    def test_truncated_astra_is_not_a_valid_baseline(self):
        response = self.astra()
        response["choices"][0]["finish_reason"] = "length"
        with self.assertRaises(ValueError):
            pilot.astra_verdict(response)


if __name__ == "__main__":
    unittest.main()
