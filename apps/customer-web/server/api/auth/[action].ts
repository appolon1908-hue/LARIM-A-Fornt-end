import { handleAuthAction } from '@larimia/web-bff'

export default defineEventHandler(event => {
  const config = useRuntimeConfig(event)
  return handleAuthAction(event, {
    apiBaseUrl: String(config.apiBaseUrl),
    oidcIssuer: String(config.oidcIssuer),
    oidcClientId: String(config.oidcClientId),
    oidcRedirectUri: String(config.oidcRedirectUri || ''),
    defaultReturnTo: '/',
    cookieSecure: String(config.sessionCookieSecure) === 'true',
  })
})
