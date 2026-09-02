export type ProviderAvailability = 'offline' | 'online'

export const SAFETY_ACTIONS = ['Safety Check', 'SOS'] as const

export function providerAvailability(isOnline: boolean): ProviderAvailability {
  return isOnline ? 'online' : 'offline'
}

export function providerStatusLabel(isOnline: boolean): 'Online' | 'Offline' {
  return isOnline ? 'Online' : 'Offline'
}

export function providerStatusAction(isOnline: boolean): 'Go offline' | 'Go online' {
  return isOnline ? 'Go offline' : 'Go online'
}

export function toggleProviderAvailability(isOnline: boolean): boolean {
  return !isOnline
}
