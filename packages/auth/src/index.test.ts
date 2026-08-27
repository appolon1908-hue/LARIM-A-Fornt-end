import { describe, expect, it } from 'vitest'

import {
  clearSession,
  getAccessToken,
  hasActiveSession,
  setSession,
} from './index'


describe('access token session', () => {
  it('keeps short-lived access tokens out of persistent browser storage', async () => {
    setSession({
      accessToken: 'access-token',
      expiresAt: Math.floor(Date.now() / 1000) + 300,
    })
    expect(hasActiveSession()).toBe(true)
    await expect(getAccessToken()).resolves.toBe('access-token')
    clearSession()
    expect(hasActiveSession()).toBe(false)
  })

  it('rejects expired sessions', async () => {
    setSession({
      accessToken: 'expired',
      expiresAt: Math.floor(Date.now() / 1000) - 1,
    })
    await expect(getAccessToken()).resolves.toBeNull()
    clearSession()
  })
})
