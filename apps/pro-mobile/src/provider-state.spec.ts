import { describe, expect, it } from 'vitest'

import {
  providerAvailability,
  providerStatusAction,
  providerStatusLabel,
  SAFETY_ACTIONS,
  toggleProviderAvailability,
} from './provider-state'

describe('LARIMÍA professional mobile availability', () => {
  it('starts fail-closed and requires an explicit transition online', () => {
    const initial = false

    expect(providerAvailability(initial)).toBe('offline')
    expect(providerStatusLabel(initial)).toBe('Offline')
    expect(providerStatusAction(initial)).toBe('Go online')
    expect(toggleProviderAvailability(initial)).toBe(true)
  })

  it('offers the inverse action while online', () => {
    expect(providerAvailability(true)).toBe('online')
    expect(providerStatusLabel(true)).toBe('Online')
    expect(providerStatusAction(true)).toBe('Go offline')
    expect(toggleProviderAvailability(true)).toBe(false)
  })

  it('keeps both approved safety actions visible', () => {
    expect(SAFETY_ACTIONS).toEqual(['Safety Check', 'SOS'])
    expect(new Set(SAFETY_ACTIONS).size).toBe(SAFETY_ACTIONS.length)
  })
})
