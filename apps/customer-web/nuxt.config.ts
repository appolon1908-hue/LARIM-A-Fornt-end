export default defineNuxtConfig({
  compatibilityDate: '2026-08-01',
  devtools: { enabled: process.env.NODE_ENV !== 'production' },
  runtimeConfig: {
    apiBaseUrl: process.env.NUXT_API_BASE_URL || 'http://localhost:8000/v1',
    oidcIssuer:
      process.env.NUXT_OIDC_ISSUER ||
      'https://auth.codestra.co/realms/larimia',
    oidcClientId: process.env.NUXT_OIDC_CLIENT_ID || 'larimia-customer-web',
    oidcRedirectUri: process.env.NUXT_OIDC_REDIRECT_URI || '',
    sessionCookieSecure:
      process.env.NUXT_SESSION_COOKIE_SECURE ||
      (process.env.NODE_ENV === 'production' ? 'true' : 'false'),
    public: {
      apiBaseUrl: '/api/larimia',
      websocketBaseUrl:
        process.env.NUXT_PUBLIC_WEBSOCKET_BASE_URL ||
        'ws://localhost:8000/v1/ws',
    },
  },
  routeRules: {
    '/**': {
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self)',
      },
    },
  },
  app: {
    head: {
      title: 'LARIMÍA — Tu bienestar llega a ti',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Reserva profesionales verificados de belleza y bienestar a domicilio.',
        },
      ],
    },
  },
  css: ['~/assets/main.css'],
  typescript: { strict: true },
})
