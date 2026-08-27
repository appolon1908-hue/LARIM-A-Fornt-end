import { afterEach, describe, expect, it, vi } from 'vitest'

import { LarimiaApi } from './index'


afterEach(() => {
  vi.restoreAllMocks()
})

describe('LarimiaApi', () => {
  it('preserves caller idempotency keys and BFF credentials', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ id: 'q1' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    const api = new LarimiaApi(
      'https://api.example.test/v1',
      async () => 'token',
      undefined,
      { credentials: 'include' },
    )

    await api.quote({ market_code: 'DO-SDQ' }, { idempotencyKey: 'idem-123' })

    const request = fetchMock.mock.calls[0]?.[1]
    const headers = new Headers(request?.headers)
    expect(headers.get('Idempotency-Key')).toBe('idem-123')
    expect(headers.get('Authorization')).toBe('Bearer token')
    expect(request?.credentials).toBe('include')
  })

  it('sends optimistic concurrency and cancellation reason', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ id: 'b1', version: 4 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    const api = new LarimiaApi('/api/larimia')

    await api.cancelBooking('b1', 3, 'CUSTOMER_REQUEST', {
      idempotencyKey: 'cancel-1',
    })

    const request = fetchMock.mock.calls[0]?.[1]
    const headers = new Headers(request?.headers)
    expect(headers.get('If-Match')).toBe('3')
    expect(headers.get('Idempotency-Key')).toBe('cancel-1')
    expect(request?.body).toBe(JSON.stringify({ reason: 'CUSTOMER_REQUEST' }))
  })

  it('normalizes the backend error envelope', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          error: { code: 'CAPABILITY_DISABLED', message: 'Disabled' },
        }),
        {
          status: 503,
          headers: {
            'Content-Type': 'application/json',
            'X-Request-Id': 'req-1',
          },
        },
      ),
    )
    const api = new LarimiaApi('https://api.example.test/v1')

    await expect(api.quote({})).rejects.toMatchObject({
      status: 503,
      requestId: 'req-1',
      body: { code: 'CAPABILITY_DISABLED' },
    })
  })
})
