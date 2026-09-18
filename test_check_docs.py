"""Small offline regression check for the adapted documentation gate."""

import tempfile
import unittest
from pathlib import Path

from check_docs import check, slug


class DocumentCheck(unittest.TestCase):
    def test_links_fences_and_instruction_budget(self):
        self.assertEqual(slug("CF-002 — Real events"), "cf-002--real-events")
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "AGENTS.md").write_text("# Instructions\n", encoding="utf-8")
            (root / "CLAUDE.md").write_text("@AGENTS.md\n", encoding="utf-8")
            page = root / "README.md"
            valid = (
                "# Hello\n# Hello\n"
                "[local](AGENTS.md#instructions) [repeat](#hello-1)\n"
                "[external](https://example.com) [task](codex://threads/example)\n"
                "```text\n[example](missing.md)\n```\n"
                "~~~\n[example](missing.md)\n~~~\n"
            )
            page.write_text(valid, encoding="utf-8")
            self.assertEqual(check(root), [])
            page.write_text(valid + "[bad](missing.md) [bad](#no-such-heading)\n", encoding="utf-8")
            errors = check(root)
            self.assertEqual(len(errors), 2)
            self.assertTrue(any("missing file" in error for error in errors))
            self.assertTrue(any("missing heading" in error for error in errors))
            page.write_text(valid, encoding="utf-8")
            (root / "CLAUDE.md").write_text("line\n" * 201, encoding="utf-8")
            self.assertEqual(len(check(root)), 1)
            self.assertIn("exceeds 200", check(root)[0])


if __name__ == "__main__":
    unittest.main()
