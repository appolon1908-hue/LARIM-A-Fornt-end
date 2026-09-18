import {
  createError,
  deleteCookie,
  getCookie,
  getHeader,
  getMethod,
  getProxyRequestHeaders,
  getQuery,
  getRequestURL,
  getRouterParam,
  proxyRequest,
  sendRedirect,
  setCookie,
  type H3Event,
} from 'h3'

export interface WebBffConfig {
  apiBaseUrl: string
  oidcIssuer: string
  oidcClientId: string
  oidcRedirectUri?: string
  defaultReturnTo?: string
  cookieSecure: boolean
}

interface TokenResponse {
  access_token?: string
  expires_in?: number
  token_type?: string
}

function cookieName(config: WebBffConfig, suffix: string): string {
  return config.cookieSecure
    ? `__Host-larimia-${suffix}`
    : `larimia-${suffix}`
}

function cookieOptions(
  config: WebBffConfig,
  maxAge = 600,
  httpOnly = true,
) {
  return {
    httpOnly,
    secure: config.cookieSecure,
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  }
}

function base64Url(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('base64url').replace(/=+$/, '')
}

function randomValue(bytes = 32): string {
  return base64Url(crypto.getRandomValues(new Uint8Array(bytes)))
}

async function challengeFor(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(verifier),
  )
  return base64Url(new Uint8Array(digest))
}

function redirectUri(event: H3Event, config: WebBffConfig): string {
  return (
    config.oidcRedirectUri ||
    `${getRequestURL(event).origin}/api/auth/callback`
  )
}

function validateConfig(config: WebBffConfig) {
  if (!config.apiBaseUrl || !config.oidcIssuer || !config.oidcClientId) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Authentication is not configured',
      data: { code: 'AUTH_CONFIGURATION_REQUIRED' },
    })
  }
}

function accessToken(event: H3Event, config: WebBffConfig): string | null {
  return getCookie(event, cookieName(config, 'access')) || null
}

function clearAuthCookies(event: H3Event, config: WebBffConfig) {
  for (const suffix of ['access', 'state', 'verifier', 'return', 'csrf']) {
    deleteCookie(event, cookieName(config, suffix), cookieOptions(config, 0))
  }
}

function decodeJwtExpiration(token: string): number | null {
  const payload = token.split('.')[1]
  if (!payload) return null
  try {
    const value = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf8'),
    ) as { exp?: number }
    return typeof value.exp === 'number' ? value.exp : null
  } catch {
    return null
  }
}

export async function handleAuthAction(
  event: H3Event,
  config: WebBffConfig,
) {
  validateConfig(config)
  const action = getRouterParam(event, 'action')
  const method = getMethod(event)

  if (action === 'login' && method === 'GET') {
    const verifier = randomValue(64)
    const state = randomValue(32)
    const challenge = await challengeFor(verifier)
    const returnTo = String(
      getQuery(event).returnTo || config.defaultReturnTo || '/',
    )
    setCookie(
      event,
      cookieName(config, 'verifier'),
      verifier,
      cookieOptions(config),
    )
    setCookie(
      event,
      cookieName(config, 'state'),
      state,
      cookieOptions(config),
    )
    setCookie(
      event,
      cookieName(config, 'return'),
      returnTo,
      cookieOptions(config),
    )

    const url = new URL(
      `${config.oidcIssuer.replace(/\/$/, '')}/protocol/openid-connect/auth`,
    )
    url.searchParams.set('client_id', config.oidcClientId)
    url.searchParams.set('redirect_uri', redirectUri(event, config))
    url.searchParams.set('response_type', 'code')
    url.searchParams.set('scope', 'openid profile email')
    url.searchParams.set('state', state)
    url.searchParams.set('code_challenge', challenge)
    url.searchParams.set('code_challenge_method', 'S256')
    return sendRedirect(event, url.toString(), 302)
  }

  if (action === 'callback' && method === 'GET') {
    const query = getQuery(event)
    const state = typeof query.state === 'string' ? query.state : null
    const code = typeof query.code === 'string' ? query.code : null
    const expectedState = getCookie(event, cookieName(config, 'state'))
    const verifier = getCookie(event, cookieName(config, 'verifier'))
    const returnTo = getCookie(event, cookieName(config, 'return')) || '/'
    if (
      !state ||
      !code ||
      !expectedState ||
      !verifier ||
      state !== expectedState
    ) {
      clearAuthCookies(event, config)
      throw createError({
        statusCode: 400,
        statusMessage: 'OIDC callback validation failed',
        data: { code: 'OIDC_CALLBACK_INVALID' },
      })
    }

    const response = await fetch(
      `${config.oidcIssuer.replace(/\/$/, '')}/protocol/openid-connect/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: config.oidcClientId,
          redirect_uri: redirectUri(event, config),
          code,
          code_verifier: verifier,
        }),
      },
    )
    if (!response.ok) {
      clearAuthCookies(event, config)
      throw createError({
        statusCode: 502,
        statusMessage: 'OIDC token exchange failed',
        data: { code: 'OIDC_TOKEN_EXCHANGE_FAILED' },
      })
    }
    const token = await response.json() as TokenResponse
    if (!token.access_token || !token.expires_in) {
      clearAuthCookies(event, config)
      throw createError({
        statusCode: 502,
        statusMessage: 'OIDC token response was incomplete',
        data: { code: 'OIDC_TOKEN_RESPONSE_INVALID' },
      })
    }

    const csrfToken = randomValue(32)
    setCookie(
      event,
      cookieName(config, 'access'),
      token.access_token,
      cookieOptions(config, Math.min(token.expires_in, 3_600)),
    )
    setCookie(
      event,
      cookieName(config, 'csrf'),
      csrfToken,
      cookieOptions(config, Math.min(token.expires_in, 3_600), false),
    )
    deleteCookie(event, cookieName(config, 'state'), cookieOptions(config, 0))
    deleteCookie(event, cookieName(config, 'verifier'), cookieOptions(config, 0))
    deleteCookie(event, cookieName(config, 'return'), cookieOptions(config, 0))
    return sendRedirect(event, returnTo.startsWith('/') ? returnTo : '/', 302)
  }

  if (action === 'session' && method === 'GET') {
    const token = accessToken(event, config)
    const expiresAt = token ? decodeJwtExpiration(token) : null
    const authenticated = Boolean(
      token && (!expiresAt || expiresAt > Date.now() / 1000 + 15),
    )
    if (!authenticated && token) {
      deleteCookie(event, cookieName(config, 'access'), cookieOptions(config, 0))
    }
    return {
      authenticated,
      expiresAt,
      csrfToken: authenticated
        ? getCookie(event, cookieName(config, 'csrf')) || null
        : null,
    }
  }

  if (action === 'logout' && method === 'POST') {
    const csrfCookie = getCookie(event, cookieName(config, 'csrf'))
    const csrfHeader = getHeader(event, 'x-csrf-token')
    if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
      throw createError({
        statusCode: 403,
        statusMessage: 'CSRF validation failed',
        data: { code: 'CSRF_TOKEN_INVALID' },
      })
    }
    clearAuthCookies(event, config)
    return { loggedOut: true }
  }

  throw createError({ statusCode: 404, statusMessage: 'Auth route not found' })
}

export async function proxyLarimiaRequest(
  event: H3Event,
  config: WebBffConfig,
) {
  validateConfig(config)
  const token = accessToken(event, config)
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required',
      data: { code: 'AUTH_REQUIRED' },
    })
  }

  const method = getMethod(event)
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const csrfCookie = getCookie(event, cookieName(config, 'csrf'))
    const csrfHeader = getHeader(event, 'x-csrf-token')
    if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
      throw createError({
        statusCode: 403,
        statusMessage: 'CSRF validation failed',
        data: { code: 'CSRF_TOKEN_INVALID' },
      })
    }
  }

  const path = getRouterParam(event, 'path') || ''
  const target = `${config.apiBaseUrl.replace(/\/$/, '')}/${path}${getRequestURL(event).search}`
  const headers = getProxyRequestHeaders(event)
  delete headers.cookie
  delete headers.host
  headers.authorization = `Bearer ${token}`
  return proxyRequest(event, target, { headers })
}
