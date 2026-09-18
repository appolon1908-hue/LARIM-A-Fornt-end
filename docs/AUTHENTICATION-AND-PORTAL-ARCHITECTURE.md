# Authentication and portal architecture

## Web

```text
Browser
  -> Nuxt BFF /api/auth/login
  -> Keycloak Authorization Code + PKCE
  -> Nuxt BFF callback
  -> short-lived HttpOnly access-token cookie
  -> /api/larimia/* server proxy
  -> LARIMÍA API
```

The browser does not receive a refresh token. Expired sessions return `401` and require a new authorization flow. Mutating proxy requests require a CSRF header matching the same-site CSRF cookie.

## Native

```text
Ionic/Capacitor application
  -> system browser
  -> Keycloak Authorization Code + PKCE
  -> application callback URI
  -> injected OS secure-storage adapter
  -> short-lived access token
  -> LARIMÍA API
```

The shared auth package defines the protocol and storage contract but intentionally does not fall back to local storage or unencrypted preferences.

## Realtime

```text
Authenticated HTTP session
  -> POST /v1/ws/tickets
  -> one-time 30-second ticket
  -> WebSocket connect with ticket + last_event_id
  -> Redis Stream replay and live delivery
```

Access tokens are never placed in WebSocket query strings.
