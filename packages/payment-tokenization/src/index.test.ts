import { describe, expect, it } from 'vitest'

import {
  PaymentIntegrationUnavailableError,
  tokenizePayment,
} from './index'


describe('payment tokenization boundary', () => {
  it('fails closed when a certified SDK is not configured', async () => {
    await expect(
      tokenizePayment({ amountMinor: 1000, currency: 'DOP' }),
    ).rejects.toBeInstanceOf(PaymentIntegrationUnavailableError)
  })
})
