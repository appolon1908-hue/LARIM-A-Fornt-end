import { LarimiaApi } from '@larimia/api-client'
import { getAccessToken } from '@larimia/auth'
export function useLarimiaApi(){
  const config=useRuntimeConfig()
  return new LarimiaApi(config.public.apiBaseUrl as string,getAccessToken)
}
