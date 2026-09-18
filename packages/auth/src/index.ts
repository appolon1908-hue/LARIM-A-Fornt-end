export interface AccessTokenSession {
  accessToken: string
  expiresAt: number
}

export interface NativeSecureStore {
  get(key: string): Promise<string | null>
  set(key: string, value: string): Promise<void>
  remove(key: string): Promise<void>
}

export interface NativeOidcConfig {
  issuer: string
  clientId: string
  redirectUri: string
  scope?: string
}

const SESSION_KEY = 'larimia.native.session'
const VERIFIER_KEY = 'larimia.native.pkce.verifier'
const STATE_KEY = 'larimia.native.pkce.state'
let current: AccessTokenSession | null = null

function base64Url(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function randomValue(bytes = 32): string {
  const value = new Uint8Array(bytes)
  globalThis.crypto.getRandomValues(value)
  return base64Url(value)
}

async function challengeFor(verifier: string): Promise<string> {
  const digest = await globalThis.crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(verifier),
  )
  return base64Url(new Uint8Array(digest))
}

export function setSession(session: AccessTokenSession | null): void {
  current = session
}

export async function getAccessToken(): Promise<string | null> {
  if (!current) return null
  const now = Date.now() / 1000
  if (now >= current.expiresAt - 30) return null
  return current.accessToken
}

export function hasActiveSession(): boolean {
  if (!current) return false
  return Date.now() / 1000 < current.expiresAt - 30
}

export function clearSession(): void {
  current = null
}

export async function restoreNativeSession(
  store: NativeSecureStore,
): Promise<boolean> {
  const raw = await store.get(SESSION_KEY)
  if (!raw) return false
  try {
    const session = JSON.parse(raw) as AccessTokenSession
    if (!session.accessToken || session.expiresAt <= Date.now() / 1000 + 30) {
      await store.remove(SESSION_KEY)
      return false
    }
    current = session
    return true
  } catch {
    await store.remove(SESSION_KEY)
    return false
  }
}

export async function beginNativeLogin(
  config: NativeOidcConfig,
  store: NativeSecureStore,
): Promise<string> {
  const verifier = randomValue(64)
  const state = randomValue(32)
  const challenge = await challengeFor(verifier)
  await store.set(VERIFIER_KEY, verifier)
  await store.set(STATE_KEY, state)

  const url = new URL(
    `${config.issuer.replace(/\/$/, '')}/protocol/openid-connect/auth`,
  )
  url.searchParams.set('client_id', config.clientId)
  url.searchParams.set('redirect_uri', config.redirectUri)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', config.scope || 'openid profile email')
  url.searchParams.set('state', state)
  url.searchParams.set('code_challenge', challenge)
  url.searchParams.set('code_challenge_method', 'S256')
  return url.toString()
}

export async function completeNativeLogin(
  callbackUrl: string,
  config: NativeOidcConfig,
  store: NativeSecureStore,
): Promise<AccessTokenSession> {
  const callback = new URL(callbackUrl)
  const code = callback.searchParams.get('code')
  const state = callback.searchParams.get('state')
  const expectedState = await store.get(STATE_KEY)
  const verifier = await store.get(VERIFIER_KEY)
  if (!code || !state || !expectedState || !verifier || state !== expectedState) {
    throw new Error('OIDC callback validation failed')
  }

  const response = await fetch(
    `${config.issuer.replace(/\/$/, '')}/protocol/openid-connect/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
        code,
        code_verifier: verifier,
      }),
    },
  )
  if (!response.ok) throw new Error('OIDC token exchange failed')

  const token = await response.json() as {
    access_token?: string
    expires_in?: number
  }
  if (!token.access_token || !token.expires_in) {
    throw new Error('OIDC token response was incomplete')
  }

  const session = {
    accessToken: token.access_token,
    expiresAt: Math.floor(Date.now() / 1000) + token.expires_in,
  }
  await store.set(SESSION_KEY, JSON.stringify(session))
  await store.remove(STATE_KEY)
  await store.remove(VERIFIER_KEY)
  current = session
  return session
}

export async function logoutNative(store: NativeSecureStore): Promise<void> {
  current = null
  await Promise.all([
    store.remove(SESSION_KEY),
    store.remove(STATE_KEY),
    store.remove(VERIFIER_KEY),
  ])
}
