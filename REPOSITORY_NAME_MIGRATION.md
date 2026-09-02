# Repository-name migration record

```text
REPOSITORY_ID=1343962199
CURRENT_FULL_NAME=appolon1908-hue/LARIM-A-Fornt-end
TARGET_FULL_NAME=appolon1908-hue/LARIM-A-Frontend
STATUS=PREPARED_NOT_RENAMED
RUNTIME_CRITICAL=YES
```

## Authority decision

The approved target corrects `Fornt-end` while preserving the LARIM-A product identity. This repository remains the frontend authority for Customer Web, Customer Mobile, Pro Mobile, and Operations Web.

The current repository name remains operational until GitHub readback proves repository ID `1343962199` at the target full name with unchanged visibility, history, default branch, protected SHA, issues, pull requests, releases, rulesets, and environments.

## Dependencies that must be inventoried

Before cutover, capture:

- default-branch SHA and open PR base/head references;
- branch protection, rulesets, required checks, CODEOWNERS, and Environments;
- Actions and reusable-workflow references;
- deploy-key fingerprints, GitHub Apps, and webhooks without secret values;
- npm/package/container publication names and provenance source URLs;
- Capacitor/mobile build references and release automation;
- Middleware and infrastructure authority registries;
- developer, CI, staging, and server Git remotes;
- deployed frontend image/application versions and rollback targets.

## Controlled cutover

1. Merge alias-awareness into Middleware, Grafana, infrastructure, documentation, and release consumers.
2. Freeze repository merges, mobile builds, and deployments.
3. Rename only this repository through an authorized GitHub owner/admin operation.
4. Require repository ID and exact default SHA continuity.
5. Update mutable URLs, action references, package metadata, badges, build pipelines, server remotes, and deployment manifests.
6. Keep dated evidence, release manifests, and source locks unchanged.
7. Re-run frontend CI, browser/mobile builds, API contract tests, identity tests, package resolution, and deployment preflight.
8. Verify no LARIMÍA booking, payment, dispatch, notification, or provider capability changed.
9. Rehearse rename rollback.

Required metadata-only result:

```text
WORKLOADS_RESTARTED=0
IMAGES_REBUILT=0
MOBILE_RELEASES_PUBLISHED=0
DATABASE_MIGRATIONS=0
EXTERNAL_PROVIDER_EFFECTS=0
PRODUCTION_TRAFFIC_CHANGED=NO
```

The account-wide mapping is governed by `appolon1908-hue/documentaions:repository-name-migration.v1.json` until that documentation repository completes its own controlled rename.