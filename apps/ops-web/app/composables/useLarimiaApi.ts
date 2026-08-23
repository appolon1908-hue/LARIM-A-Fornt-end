import { LarimiaApi } from '@larimia/api-client'
export function useLarimiaApi() {
  const config = useRuntimeConfig()
  // Production should supply access token via OIDC session composable.
  return new LarimiaApi(config.public.apiBaseUrl as string)
}
