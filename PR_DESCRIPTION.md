# Connect customer and Ops portals to authoritative marketplace contracts

- Normalizes booking contract to backend snake_case fields.
- Reuses idempotency keys within retried booking-flow operations.
- Sends booking versions through `If-Match`.
- Keeps quote state across Nuxt navigation.
- Wires quote -> booking -> payment-intent -> confirmation.
- Loads customer booking history from API.
- Wires Safety Center SOS.
- Loads Ops dispatch state from API.
- Adds auth package boundary and request timeout/refresh hooks.
- Keeps sandbox checkout disabled unless explicitly enabled for development.

Follow-up before production: complete Keycloak callback/session flow, real payment SDK tokenization, Pro realtime/native push, and full Playwright accessibility/E2E suite.

This frontend PR depends on the backend production-core branch at migration head `0003`.
The repository still needs a reviewed `pnpm-lock.yaml`; CI intentionally uses a non-frozen install until that artifact is added.
