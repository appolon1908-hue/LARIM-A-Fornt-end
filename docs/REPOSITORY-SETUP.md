# Repository Setup

## Stable identity and rename state

```text
STABLE_GITHUB_REPOSITORY_ID=1343962199
CURRENT_OPERATIONAL_REPOSITORY=appolon1908-hue/LARIM-A-Fornt-end
APPROVED_TARGET_AFTER_CONTROLLED_RENAME=appolon1908-hue/LARIM-A-Frontend
RENAME_STATUS=PREPARED_NOT_RENAMED
```

The current repository is still the valid clone and push destination. Do not configure the approved target name until the GitHub owner/admin rename has occurred and readback proves repository ID `1343962199`, the default branch, protected SHA, history, rules, pull requests, releases, and build integrations are unchanged.

## Clone the current repository

```bash
git clone https://github.com/appolon1908-hue/LARIM-A-Fornt-end.git
cd LARIM-A-Fornt-end
```

For an existing local checkout, confirm the current remote:

```bash
git remote -v
git fetch --prune origin
git rev-parse HEAD
```

Do not initialize a second repository or push this history to a newly created repository with the target name. The correction must be an in-place GitHub rename of the same stable repository ID.

## Post-cutover remote update

Only after the controlled rename is verified:

```bash
git remote set-url origin https://github.com/appolon1908-hue/LARIM-A-Frontend.git
git fetch --prune origin
git rev-parse HEAD
```

The pre-change and post-change commit must match unless a separately reviewed source PR was merged. Updating a remote does not authorize a mobile build, package publication, deployment, database migration, provider call, booking, dispatch, payment, or production traffic change.

See [`../REPOSITORY_NAME_MIGRATION.md`](../REPOSITORY_NAME_MIGRATION.md) for the complete dependency inventory, cutover checks, and rollback requirements.