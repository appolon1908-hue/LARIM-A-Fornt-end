#!/usr/bin/env python3
"""Validate the controlled LARIMÍA frontend repository-name migration."""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "repository-name-migration.v1.json"
README = ROOT / "README.md"
RUNBOOK = ROOT / "REPOSITORY_NAME_MIGRATION.md"
SETUP = ROOT / "docs" / "REPOSITORY-SETUP.md"
WORKFLOW = ROOT / ".github" / "workflows" / "ci.yml"
CURRENT = "appolon1908-hue/LARIM-A-Fornt-end"
TARGET = "appolon1908-hue/LARIM-A-Frontend"


def fail(message: str) -> None:
    print(f"ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)


def load() -> dict[str, Any]:
    try:
        value = json.loads(MANIFEST.read_text(encoding="utf-8"))
    except Exception as exc:
        fail(f"invalid repository migration JSON: {exc}")
    if not isinstance(value, dict):
        fail("repository migration root must be an object")
    return value


def validate() -> None:
    document = load()
    expected = {
        "schema_version": "1.0",
        "repository_id": 1343962199,
        "current_repository": CURRENT,
        "target_repository_after_cutover": TARGET,
        "status": "PREPARED_NOT_RENAMED",
        "runtime_critical": True,
        "authority_role": "LARIMIA customer, professional, and operations frontend",
        "account_authority": (
            "appolon1908-hue/documentaions:repository-name-migration.v1.json"
        ),
    }
    for key, value in expected.items():
        if document.get(key) != value:
            fail(f"repository migration field {key} is incorrect")

    policy = document.get("policy")
    if not isinstance(policy, dict):
        fail("repository migration policy is missing")
    for key in (
        "current_repository_remains_operational",
        "target_repository_forbidden_in_automation_before_cutover",
        "same_repository_id_required_after_cutover",
        "historical_evidence_immutable",
        "runtime_digest_must_remain_unchanged",
    ):
        if policy.get(key) is not True:
            fail(f"required fail-closed migration policy is not true: {key}")
    for key in (
        "rename_authorizes_deployment",
        "rename_authorizes_mobile_release",
        "rename_authorizes_provider_effects",
    ):
        if policy.get(key) is not False:
            fail(f"repository rename must not authorize operation: {key}")

    readme = README.read_text(encoding="utf-8")
    for required in (
        "STABLE_GITHUB_REPOSITORY_ID=1343962199",
        f"CURRENT_OPERATIONAL_REPOSITORY={CURRENT}",
        f"APPROVED_TARGET_AFTER_CONTROLLED_RENAME={TARGET}",
        "RENAME_STATUS=PREPARED_NOT_RENAMED",
        "real tests in all four application packages",
    ):
        if required not in readme:
            fail(f"README is missing stable repository evidence: {required}")

    runbook = RUNBOOK.read_text(encoding="utf-8")
    for required in (
        "WORKLOADS_RESTARTED=0",
        "IMAGES_REBUILT=0",
        "MOBILE_RELEASES_PUBLISHED=0",
        "DATABASE_MIGRATIONS=0",
        "EXTERNAL_PROVIDER_EFFECTS=0",
        "PRODUCTION_TRAFFIC_CHANGED=NO",
    ):
        if required not in runbook:
            fail(f"rename runbook is missing zero-change evidence: {required}")

    setup = SETUP.read_text(encoding="utf-8")
    if f"git clone https://github.com/{CURRENT}.git" not in setup:
        fail("pre-cutover setup no longer clones the current repository")
    if f"git remote set-url origin https://github.com/{TARGET}.git" not in setup:
        fail("post-cutover remote procedure is missing the approved target")
    if "Only after the controlled rename is verified" not in setup:
        fail("post-cutover remote update is not gated")

    workflow = WORKFLOW.read_text(encoding="utf-8")
    if "persist-credentials: false" not in workflow:
        fail("CI checkout must not persist credentials")
    if "python3 scripts/validate_repository_name_migration.py" not in workflow:
        fail("CI does not execute the repository-name authority validator")
    if "pnpm test" not in workflow or "pnpm build" not in workflow:
        fail("CI lost application test or build gates")


def main() -> None:
    validate()
    print("LARIMIA frontend repository-name migration authority: PASS")


if __name__ == "__main__":
    main()
