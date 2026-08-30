# Repository Profile — `LARIM-A-Fornt-end`

## Identity

- **Repository:** `appolon1908-hue/LARIM-A-Fornt-end`
- **Category:** Product frontend — LARIMÍA marketplace
- **Visibility:** `public`
- **Default branch:** `main`
- **Authority:** Primary LARIMÍA frontend workspace
- **Status:** Nuxt/Ionic/Vue baseline for customer, provider, and operations portals.

## Purpose

Provides customer web/mobile, professional mobile, and operations web experiences for the LARIMÍA home-services marketplace.

## Owns

- Customer booking, quote, checkout, membership, and safety interfaces
- Professional mobile work, availability, offer, visit, and safety experiences
- Operations dispatch, provider, finance, catalog, and partner portals

## Does not own

- Authoritative booking, dispatch, payment, provider, or safety state
- Production identity policy
- Direct external-provider credentials or writes

## Key integrations

- `LARIM-A-Backend`
- OIDC/Keycloak
- Maps, payments, communications, and realtime APIs through backend contracts

## Current priorities

1. Replace development authentication assumptions with real OIDC
2. Complete booking, dispatch, safety, provider, and operations workflows
3. Add typed API clients, offline/error handling, and realtime recovery
4. Run cross-platform, accessibility, browser, and mobile build gates

## Governance and safety

- Promotion model: `feature/docs/fix/security/upgrade -> development -> test -> staging -> production -> main`.
- Use pull requests with exact-head and merge-result validation; merge never authorizes deployment.
- Never place secrets, authoritative payment logic, customer records, or provider credentials in frontend configuration.
- Production applications and mobile builds must be immutable and backend-authoritative.
- This document does not book, dispatch, charge, notify, or activate production.

## Account-wide catalog

See `appolon1908-hue/documentaions/REPOSITORY_CATALOG.md`.
