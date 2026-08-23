# LARIMÍA Frontend — Production Portal Baseline

Vue/TypeScript application workspace for:

- **Customer Web** — Nuxt 4
- **Customer Mobile** — Ionic Vue + Capacitor
- **Pro Mobile** — Ionic Vue + Capacitor
- **Operations Web** — Nuxt 4

## Included

- branded responsive Customer portal
- booking/quote/checkout route structure
- membership and safety surfaces
- Operations control center
- dispatch/provider/safety/finance/catalog/partner portals
- Pro mobile dashboard and safety shell
- Customer mobile service shell
- shared typed API client
- bilingual package
- shared domain types and brand tokens
- GitHub CI

## Start

```bash
corepack enable
pnpm install
cp .env.example .env
pnpm dev:customer
```

Ops:
```bash
pnpm dev:ops
```

Mobile:
```bash
pnpm dev:customer-mobile
pnpm dev:pro
```

See `docs/PORTALS.md` for production integration gates.
