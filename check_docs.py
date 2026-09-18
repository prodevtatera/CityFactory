"""Check repository-local inline Markdown links/headings and root instruction size.

Adapted from ContentMgmt. No network or dependencies. External URLs and paths outside
the repository are not checked; neither are factual claims or deployment status.
"""

import re
import sys
from pathlib import Path
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parent


def slug(heading):
    return re.sub(r"\s", "-", re.sub(r"[^\w\s-]", "", heading.strip().lower()))


def strip_fences(text):
    result, fence = [], None
    for line in text.splitlines():
        marker = re.match(r"^\s{0,3}(`{3,}|~{3,})(.*)$", line)
        if marker and fence is None:
            fence = marker[1]
            result.append("")
        elif marker and fence and marker[1][0] == fence[0] and len(marker[1]) >= len(fence) and not marker[2].strip():
            fence = None
            result.append("")
        else:
            result.append("" if fence else line)
    return "\n".join(result)


def check(root=ROOT):
    root = root.resolve()
    files = set(root.glob("*.md"))
    for folder in ("docs", "reports", ".claude", "game"):
        files.update(root.glob(f"{folder}/**/*.md"))
    files = sorted(p for p in files if not {"node_modules", "worktrees"} & set(p.relative_to(root).parts))
    bodies = {p: strip_fences(p.read_text(encoding="utf-8")) for p in files}
    anchors = {}
    for path, body in bodies.items():
        used = set()
        for heading in re.findall(r"^ {0,3}#{1,6}\s+(.+?)(?:\s+#+)?\s*$", body, re.M):
            base = anchor = slug(heading)
            suffix = 0
            while anchor in used:
                suffix += 1
                anchor = f"{base}-{suffix}"
            used.add(anchor)
        anchors[path] = used

    errors = []
    # ponytail: inline links and ATX headings only; adopt a Markdown parser if reference
    # links, HTML anchors or more elaborate Markdown become part of the project docs.
    for path, body in bodies.items():
        for match in re.finditer(r"\[[^\]\n]*\]\((?:<([^>\n]+)>|([^\s)]+))\)", body):
            target = match[1] or match[2]
            if re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*:", target):
                continue
            name, _, anchor = target.partition("#")
            dest = (path.parent / unquote(name)).resolve() if name else path
            if not dest.is_relative_to(root):
                continue
            where = f"{path.relative_to(root)}:{body[:match.start()].count(chr(10)) + 1}"
            if not dest.exists():
                errors.append(f"{where}: missing file: {target}")
            elif anchor and dest in anchors and unquote(anchor) not in anchors[dest]:
                errors.append(f"{where}: missing heading: {target}")
    for name in ("AGENTS.md", "CLAUDE.md"):
        path = root / name
        if not path.is_file():
            errors.append(f"{name}: missing root instructions")
        elif len(path.read_text(encoding="utf-8").splitlines()) > 200:
            errors.append(f"{name}: exceeds 200 lines; move detailed procedures into commands")
    return errors


if __name__ == "__main__":
    errors = check()
    print("\n".join(errors) if errors else "check_docs ok (local inline links, headings, instruction size)")
    sys.exit(bool(errors))
