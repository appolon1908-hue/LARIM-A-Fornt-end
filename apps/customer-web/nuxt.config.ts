export default defineNuxtConfig({
  compatibilityDate: '2026-08-01',
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/v1',
      paymentSandboxEnabled: process.env.NUXT_PUBLIC_PAYMENT_SANDBOX_ENABLED === 'true',
    },
  },
  app: {
    head: {
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
    },
  },
  css: ['~/assets/main.css'],
  typescript: { strict: true },
})
