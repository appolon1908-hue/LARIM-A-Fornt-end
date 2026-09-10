# LARIMÍA Frontend — Production Portal Baseline

Vue and TypeScript application workspace for Customer Web, Customer Mobile, Pro Mobile, and Operations Web.

## Repository identity

```text
STABLE_GITHUB_REPOSITORY_ID=1343962199
CURRENT_OPERATIONAL_REPOSITORY=appolon1908-hue/LARIM-A-Fornt-end
APPROVED_TARGET_AFTER_CONTROLLED_RENAME=appolon1908-hue/LARIM-A-Frontend
RENAME_STATUS=PREPARED_NOT_RENAMED
```

The current GitHub full name remains authoritative for cloning, Actions, packages, mobile builds, source locks, and deployment automation until an authorized in-place rename is completed and readback proves the same repository ID, history, protected default SHA, pull requests, releases, rulesets, Environments, GitHub Apps, and package identities.

Do not create a new repository with the target name. Do not publish a mobile release, rebuild an image, change a deployment, or alter a provider capability merely because repository metadata changes.

See:

- [`repository-name-migration.v1.json`](repository-name-migration.v1.json)
- [`REPOSITORY_NAME_MIGRATION.md`](REPOSITORY_NAME_MIGRATION.md)
- [`docs/REPOSITORY-SETUP.md`](docs/REPOSITORY-SETUP.md)

## Applications

- **Customer Web** — Nuxt 4
- **Customer Mobile** — Ionic Vue and Capacitor
- **Pro Mobile** — Ionic Vue and Capacitor
- **Operations Web** — Nuxt 4

## Included

- branded responsive customer portal;
- booking, quote, and checkout route structure;
- membership and safety surfaces;
- operations control center;
- dispatch, provider, safety, finance, catalog, and partner portals;
- professional mobile dashboard and safety shell;
- customer mobile service shell;
- shared typed API client;
- bilingual package;
- shared domain types and brand tokens;
- GitHub CI.

## Start

```bash
corepack enable
pnpm install
cp .env.example .env
pnpm dev:customer
```

Operations:

```bash
pnpm dev:ops
```

Mobile:

```bash
pnpm dev:customer-mobile
pnpm dev:pro
```

## Validate

```bash
pnpm typecheck
pnpm test
pnpm build
```

The repository now requires real tests in all four application packages. CI must not use `passWithNoTests` to hide an empty test suite.

See `docs/PORTALS.md` for production integration gates.