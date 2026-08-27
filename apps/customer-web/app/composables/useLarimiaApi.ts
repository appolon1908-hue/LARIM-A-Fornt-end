import { LarimiaApi } from '@larimia/api-client'

function csrfToken(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie
    .split('; ')
    .find(
      value =>
        value.startsWith('larimia-csrf=') ||
        value.startsWith('__Host-larimia-csrf='),
    )
  return match ? decodeURIComponent(match.split('=', 2)[1] || '') : null
}

export function useLarimiaApi() {
  const config = useRuntimeConfig()
  return new LarimiaApi(
    config.public.apiBaseUrl as string,
    async () => null,
    undefined,
    { credentials: 'include', getCsrfToken: csrfToken },
  )
}
