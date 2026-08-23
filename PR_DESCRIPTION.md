# Marketplace V2 frontend production review

This remains a **draft review candidate** and is not production-authorized.

## Cleaned and hardened

- Normalizes customer/Operations calls to the backend snake_case contract.
- Preserves caller idempotency keys for logical retries and sends booking versions using `If-Match`.
- Normalizes backend error envelopes and carries request IDs into typed `ApiError` instances.
- Adds explicit request timeout errors and SSR-safe `globalThis` timer/crypto usage.
- Adds typed booking, catalog, quote and payment-intent responses.
- Browser auth state is access-token-only; refresh tokens are not retained by the shared JavaScript auth package.
- API-client tests now verify idempotency headers, bearer authentication and backend error normalization.
- CI no longer fails solely because the uploaded package omitted a lockfile; the draft branch temporarily installs without frozen-lockfile mode.

## Production blockers

- Generate, review and commit `pnpm-lock.yaml`, then restore `pnpm install --frozen-lockfile` in CI.
- Implement the real Authorization Code + PKCE login/callback/logout/session lifecycle against `auth.codestra.co`.
- Move web authentication to a production BFF/server-session model with Secure HttpOnly SameSite cookies rather than browser-owned long-lived credentials.
- Integrate certified payment tokenization; never collect raw card data in application JavaScript.
- Complete provider realtime/native push, offline-safe visit flows and secure visit PIN UX.
- Complete customer, provider and Operations error/empty/loading/accessibility states.
- Add Playwright role-by-role E2E, accessibility, security and production smoke evidence.

`FINAL_STATUS=PR_REVIEW_CANDIDATE`

`PRODUCTION_STATUS=NO-GO`
