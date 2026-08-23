import type { BookingSummary } from '@larimia/domain'

export interface ApiErrorBody { code?: string; message?: string; [key: string]: unknown }

export class ApiError extends Error {
  constructor(public status: number, public body: ApiErrorBody) {
    super(body.message || body.code || `API ${status}`)
  }
}

export class LarimiaApi {
  constructor(
    private readonly baseUrl: string,
    private readonly getAccessToken?: () => Promise<string | null>,
  ) {}

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const token = await this.getAccessToken?.()
    const headers = new Headers(init.headers)
    headers.set('Accept', 'application/json')
    headers.set('X-Request-Id', crypto.randomUUID())
    if (init.body) headers.set('Content-Type', 'application/json')
    if (token) headers.set('Authorization', `Bearer ${token}`)

    const response = await fetch(`${this.baseUrl}${path}`, { ...init, headers })
    if (!response.ok) {
      let body: ApiErrorBody = {}
      try { body = await response.json() } catch { body = { message: await response.text() } }
      throw new ApiError(response.status, body)
    }
    if (response.status === 204) return undefined as T
    return response.json() as Promise<T>
  }

  private command<T>(path: string, body?: unknown, method = 'POST') {
    return this.request<T>(path, {
      method,
      headers: { 'Idempotency-Key': crypto.randomUUID() },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  }

  health() { return this.request<{ status: string }>('/health/ready') }
  markets() { return this.request<{ markets: unknown[] }>('/markets') }
  catalog(market = 'DO-SDQ') { return this.request<{ services: unknown[] }>(`/catalog?market=${market}`) }
  availability(params: URLSearchParams) { return this.request<{ slots: unknown[] }>(`/availability?${params}`) }
  quote(body: unknown) { return this.command('/quotes', body) }
  createBooking(body: unknown) { return this.command<BookingSummary>('/bookings', body) }
  getBooking(id: string) { return this.request<BookingSummary>(`/bookings/${id}`) }
  confirmBooking(id: string) { return this.command(`/bookings/${id}/confirm`) }
  cancelBooking(id: string) { return this.command(`/bookings/${id}/cancel`) }
  providerMe() { return this.request('/providers/me') }
  providerOffers() { return this.request('/dispatch/offers') }
  acceptOffer(id: string, version: number) { return this.command(`/dispatch/offers/${id}/accept`, { booking_version: version }) }
  declineOffer(id: string) { return this.command(`/dispatch/offers/${id}/decline`) }
  dispatchBoard() { return this.request('/dispatch/ops/board') }
  safetyIncidents() { return this.request('/safety/ops/incidents') }
  supportCases() { return this.request('/support/ops/cases') }
  reconciliationBreaks() { return this.request('/finance/reconciliation-breaks') }
}

export function websocketUrl(httpBase: string, path: string) {
  const url = new URL(httpBase)
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
  url.pathname = `${url.pathname.replace(/\/$/, '')}${path}`
  return url.toString()
}

export * from './realtime'
