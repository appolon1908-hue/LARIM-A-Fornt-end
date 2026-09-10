import { describe, expect, it } from 'vitest'

import { CUSTOMER_REGION, CUSTOMER_SERVICES, CUSTOMER_TAGLINE } from './app-contract'

describe('LARIMÍA customer mobile contract', () => {
  it('keeps the approved launch region and customer promise', () => {
    expect(CUSTOMER_REGION).toBe('DO · Santo Domingo')
    expect(CUSTOMER_TAGLINE).toBe('Tu bienestar llega a ti.')
  })

  it('offers the complete initial service set without duplicates', () => {
    expect(CUSTOMER_SERVICES).toEqual([
      'Massage',
      'Haircut',
      'Makeup',
      'Personal Training',
    ])
    expect(new Set(CUSTOMER_SERVICES).size).toBe(CUSTOMER_SERVICES.length)
  })

  it('does not embed credentials or provider endpoints in customer labels', () => {
    const publicCopy = [CUSTOMER_REGION, CUSTOMER_TAGLINE, ...CUSTOMER_SERVICES]
      .join(' ')
      .toLowerCase()

    for (const prohibited of ['secret', 'token', 'password', 'private_key', 'database_url']) {
      expect(publicCopy).not.toContain(prohibited)
    }
  })
})
