# Repository-name migration record

```text
REPOSITORY_ID=1343962199
CURRENT_FULL_NAME=appolon1908-hue/LARIM-A-Fornt-end
TARGET_FULL_NAME=appolon1908-hue/LARIM-A-Frontend
STATUS=PREPARED_NOT_RENAMED
RUNTIME_CRITICAL=YES
CURRENT_RUNTIME_STATE=REQUIRES_PRE_CUTOVER_DISCOVERY
```

## Authority decision

The approved target corrects `Fornt-end` while preserving the LARIM-A product identity. This repository remains the frontend authority for Customer Web, Customer Mobile, Pro Mobile, and Operations Web.

The current repository name remains operational until GitHub readback proves repository ID `1343962199` at the target full name with unchanged visibility, history, default branch and protected SHA, issues, pull requests, releases, rulesets, environments, workflows, packages, mobile-build integrations, and downstream consumers.

## Dependencies that must be inventoried

Before cutover, capture without secret values:

- default-branch SHA and open pull-request base and head references;
- branch protection, rulesets, required checks, CODEOWNERS, and Environments;
- Actions workflows, reusable workflows, and the exact merge and dispatch state before the temporary freeze;
- deploy-key fingerprints, GitHub Apps, and webhook bindings;
- npm, package, container, and provenance identities;
- Capacitor, Android, iOS, signing-workflow, and mobile-release references without signing secrets;
- Middleware, Grafana, Prometheus, infrastructure, and documentation authority registries;
- developer, CI, staging, and server Git remotes;
- current source locks, deployment manifests, and rollback targets.

Discover runtime and release-artifact state immediately before cutover:

- when Customer Web or Operations Web is deployed, record each workload's immutable running image digest and its selected rollback image digest separately;
- when Customer Mobile or Pro Mobile has an approved distributed build, record each current build digest and selected rollback build digest separately;
- when an application is not deployed or distributed, record its corresponding current and rollback digest as `N/A`;
- when no application is deployed or distributed, record `CURRENT_RUNTIME_STATE=NOT_DEPLOYED`, every workload digest as `N/A`, `RUNNING_ARTIFACTS_UNCHANGED=N/A`, and `ROLLBACK_ARTIFACTS_UNCHANGED=N/A`;
- do not fabricate runtime or rollback evidence.

## Controlled cutover

1. Merge stable-ID alias awareness into Middleware, Grafana, Prometheus, infrastructure, documentation, and release consumers.
2. Record the exact prechange state of repository merges, release dispatches, workflow dispatches, mobile builds, mobile releases, and deployment dispatches; then temporarily freeze only the operations that are currently enabled and must be paused for the cutover.
3. Rename only this repository through an authorized GitHub owner or administrator operation.
4. Before updating consumers, require repository ID and exact default SHA continuity and verify visibility, history, protection, CODEOWNERS, required checks, issues, pull requests, tags, releases, Actions, reusable workflows, Environments, packages, containers, deploy keys, GitHub Apps, webhooks, Capacitor/mobile build integrations, and downstream consumers.
5. Stop and roll back if any inventoried integration is missing, weakened, or unresolved.
6. Update only mutable URLs, action references, package metadata, badges, build pipelines, mobile-build references, server remotes, current source locks, and deployment manifests. Keep dated evidence and release manifests unchanged.
7. Re-run frontend CI, all four application test suites and builds, browser and mobile builds, API contract tests, identity tests, package resolution, workflow resolution, and deployment preflight.
8. Prove every running and rollback image/build digest recorded for Customer Web, Operations Web, Customer Mobile, and Pro Mobile is unchanged or explicitly `N/A`.
9. Verify no LARIMÍA booking, payment, dispatch, notification, provider capability, mobile release, deployment, or production traffic changed.
10. Rehearse rename rollback.
11. After success or validated rollback, restore every merge, release-dispatch, workflow-dispatch, mobile-build, mobile-release, and deployment-dispatch mechanism to its exact recorded prechange state. Do not enable a mechanism that was already disabled, and do not leave an originally enabled mechanism paused.

## Rollback

Rollback restores the prior slug when safe, restores mutable references and remotes from the checksum-bound pre-change packet, repeats the complete repository, workflow, package, mobile-build, integration, downstream-consumer, running-artifact, rollback-artifact, and runtime readback, confirms no application or provider capability changed, and then restores every controlled operation to its exact recorded prechange state.

Required metadata-only result:

```text
POST_RENAME_INTEGRATION_READBACK=PASS
ACTIONS_REQUIRED_CHECKS=PASS
PACKAGES_CONTAINERS=PASS|N/A
DEPLOY_KEYS_APPS_WEBHOOKS=PASS|N/A
MOBILE_BUILD_REFERENCES=PASS|N/A
DOWNSTREAM_CONSUMERS=PASS
CURRENT_RUNTIME_STATE=DEPLOYED|PARTIALLY_DEPLOYED|NOT_DEPLOYED
CUSTOMER_WEB_RUNNING_IMAGE_DIGEST=<immutable-digest>|N/A
CUSTOMER_WEB_ROLLBACK_IMAGE_DIGEST=<immutable-digest>|N/A
OPERATIONS_WEB_RUNNING_IMAGE_DIGEST=<immutable-digest>|N/A
OPERATIONS_WEB_ROLLBACK_IMAGE_DIGEST=<immutable-digest>|N/A
CUSTOMER_MOBILE_CURRENT_BUILD_DIGEST=<immutable-digest>|N/A
CUSTOMER_MOBILE_ROLLBACK_BUILD_DIGEST=<immutable-digest>|N/A
PRO_MOBILE_CURRENT_BUILD_DIGEST=<immutable-digest>|N/A
PRO_MOBILE_ROLLBACK_BUILD_DIGEST=<immutable-digest>|N/A
RUNNING_ARTIFACTS_UNCHANGED=PASS|N/A
ROLLBACK_ARTIFACTS_UNCHANGED=PASS|N/A
PRECHANGE_MERGE_STATE=ENABLED|DISABLED
POSTCHANGE_MERGE_STATE=ENABLED|DISABLED
MERGE_STATE_RESTORED=PASS
PRECHANGE_RELEASE_DISPATCH_STATE=ENABLED|DISABLED|N/A
POSTCHANGE_RELEASE_DISPATCH_STATE=ENABLED|DISABLED|N/A
RELEASE_DISPATCH_STATE_RESTORED=PASS|N/A
PRECHANGE_WORKFLOW_DISPATCH_STATE=ENABLED|DISABLED|N/A
POSTCHANGE_WORKFLOW_DISPATCH_STATE=ENABLED|DISABLED|N/A
WORKFLOW_DISPATCH_STATE_RESTORED=PASS|N/A
PRECHANGE_MOBILE_BUILD_STATE=ENABLED|DISABLED|N/A
POSTCHANGE_MOBILE_BUILD_STATE=ENABLED|DISABLED|N/A
MOBILE_BUILD_STATE_RESTORED=PASS|N/A
PRECHANGE_MOBILE_RELEASE_STATE=ENABLED|DISABLED|N/A
POSTCHANGE_MOBILE_RELEASE_STATE=ENABLED|DISABLED|N/A
MOBILE_RELEASE_STATE_RESTORED=PASS|N/A
PRECHANGE_DEPLOYMENT_DISPATCH_STATE=ENABLED|DISABLED|N/A
POSTCHANGE_DEPLOYMENT_DISPATCH_STATE=ENABLED|DISABLED|N/A
DEPLOYMENT_DISPATCH_STATE_RESTORED=PASS|N/A
ROLLBACK_OPERATION_STATE_RESTORED=PASS|N/A
WORKLOADS_RESTARTED=0
IMAGES_REBUILT=0
MOBILE_RELEASES_PUBLISHED=0
DATABASE_MIGRATIONS=0
EXTERNAL_PROVIDER_EFFECTS=0
PRODUCTION_TRAFFIC_CHANGED=NO
```

The account-wide mapping is governed by `appolon1908-hue/documentaions:repository-name-migration.v1.json` until that documentation repository completes its own controlled rename.
