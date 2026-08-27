# LARIMÍA portal implementation execution

This branch is the coordinated frontend implementation for backend migration head `0005`.

## Implemented boundaries

- Customer Web and Operations Web use a Nuxt backend-for-frontend.
- Web authentication uses Authorization Code + PKCE at `auth.codestra.co`.
- Access tokens are short-lived, HttpOnly, Secure in production and never exposed to browser JavaScript.
- Mutating BFF requests require a same-site CSRF token.
- Native authentication is provided through an injected secure-storage adapter; insecure local-storage or Capacitor Preferences token storage is not allowed.
- Realtime connections obtain one-time tickets and reconnect with durable Redis Stream cursors.
- Customer booking uses catalog, saved addresses, live availability, capacity-backed quotes, processor tokenization, payment authorization and payment-gated confirmation.
- Operations pages display API errors rather than turning failures into fabricated zero values.

## Capability policy

The UI never enables a backend capability. Backend capability gates remain authoritative. Payment, provider, matching, payout, membership, partner, review and other high-risk experiences must surface `CAPABILITY_DISABLED` until the related backend and provider evidence is complete.

## Remaining environment work

- Provision the Keycloak web and native clients.
- Configure the certified payment tokenization SDK.
- Provide native secure-storage and system-browser adapters.
- Configure production BFF and WebSocket URLs.
- Complete role-by-role browser, native, accessibility and security certification.
