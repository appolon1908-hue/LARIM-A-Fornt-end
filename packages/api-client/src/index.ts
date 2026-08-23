export interface ApiErrorBody {
  code?: string
  message?: string
  detail?: unknown
  [key: string]: unknown
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: ApiErrorBody,
    public readonly requestId?: string,
  ) {
    super(body.message || body.code || `API ${status}`)
    this.name = 'ApiError'
  }
}

export class ApiTimeoutError extends Error {
  constructor(public readonly timeoutMs: number) {
    super(`API request timed out after ${timeoutMs}ms`)
    this.name = 'ApiTimeoutError'
  }
}

export interface BookingSummary {
  id: string
  booking_number: string
  customer_id: string
  market_code: string
  status: string
  currency: string
  customer_total_minor: number
  version: number
  scheduled_start: string
  scheduled_end: string
}

export interface CatalogServiceSummary {
  id: string
  code: string
  category: string
  name: Record<string, string>
  duration_minutes: number
  currency: string
  base_price_minor: number
  price_policy_version: number
}

export interface QuoteSummary {
  id: string
  status: string
  market_code: string
  currency: string
  subtotal_minor: number
  tax_minor: number
  total_minor: number
  scheduled_start: string
  scheduled_end: string
  expires_at: string
}

export interface PaymentIntentSummary {
  id: string
  status: string
  amount_minor: number
  currency: string
}

export interface CommandOptions {
  idempotencyKey?: string
  ifMatch?: number
  timeoutMs?: number
}

function requestId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
}

function normalizeError(raw: ApiErrorBody): ApiErrorBody {
  if (raw.error && typeof raw.error === 'object') {
    return raw.error as ApiErrorBody
  }
  if (raw.detail && typeof raw.detail === 'object') {
    return raw.detail as ApiErrorBody
  }
  return raw
}

export class LarimiaApi {
  constructor(
    private readonly baseUrl: string,
    private readonly getAccessToken: () => Promise<string | null>,
    private readonly refreshAccessToken?: () => Promise<string | null>,
  ) {}

  private async request<T>(
    path: string,
    init: RequestInit = {},
    timeoutMs = 15_000,
    retried = false,
  ): Promise<T> {
    const token = await this.getAccessToken()
    const headers = new Headers(init.headers)
    headers.set('Accept', 'application/json')
    headers.set('X-Request-Id', requestId())
    if (init.body) headers.set('Content-Type', 'application/json')
    if (token) headers.set('Authorization', `Bearer ${token}`)

    const controller = new AbortController()
    const timer = globalThis.setTimeout(() => controller.abort(), timeoutMs)
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...init,
        headers,
        signal: controller.signal,
      })

      if (response.status === 401 && !retried && this.refreshAccessToken) {
        const refreshed = await this.refreshAccessToken()
        if (refreshed) {
          return this.request<T>(path, init, timeoutMs, true)
        }
      }

      if (!response.ok) {
        let body: ApiErrorBody = {}
        try {
          body = normalizeError(await response.json() as ApiErrorBody)
        } catch {
          body = { message: await response.text() }
        }
        throw new ApiError(
          response.status,
          body,
          response.headers.get('X-Request-Id') || undefined,
        )
      }

      if (response.status === 204) return undefined as T
      return response.json() as Promise<T>
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ApiTimeoutError(timeoutMs)
      }
      throw error
    } finally {
      globalThis.clearTimeout(timer)
    }
  }

  command<T>(
    path: string,
    body: unknown = undefined,
    options: CommandOptions = {},
    method = 'POST',
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Idempotency-Key': options.idempotencyKey || requestId(),
    }
    if (options.ifMatch !== undefined) {
      headers['If-Match'] = String(options.ifMatch)
    }
    return this.request<T>(
      path,
      {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
      },
      options.timeoutMs || 15_000,
    )
  }

  me() {
    return this.request('/customers/me')
  }

  addresses() {
    return this.request('/customers/me/addresses')
  }

  catalog(market = 'DO-SDQ') {
    return this.request<{ services: CatalogServiceSummary[] }>(
      `/catalog?market=${encodeURIComponent(market)}`,
    )
  }

  availability(params: URLSearchParams) {
    return this.request(`/availability?${params}`)
  }

  quote(body: unknown, options?: CommandOptions) {
    return this.command<QuoteSummary>('/quotes', body, options)
  }

  createBookingFromQuote(id: string, options?: CommandOptions) {
    return this.command<BookingSummary>(
      `/bookings/from-quote/${encodeURIComponent(id)}`,
      undefined,
      options,
    )
  }

  listBookings() {
    return this.request<{ items: BookingSummary[] }>('/bookings')
  }

  confirmBooking(id: string, version: number, options?: CommandOptions) {
    return this.command<BookingSummary>(
      `/bookings/${encodeURIComponent(id)}/confirm`,
      undefined,
      { ...options, ifMatch: version },
    )
  }

  cancelBooking(id: string, version: number, options?: CommandOptions) {
    return this.command<BookingSummary>(
      `/bookings/${encodeURIComponent(id)}/cancel`,
      undefined,
      { ...options, ifMatch: version },
    )
  }

  authorizePayment(body: unknown, options?: CommandOptions) {
    return this.command<PaymentIntentSummary>('/payments/authorize', body, options)
  }

  dispatchBoard() {
    return this.request('/dispatch/ops/board')
  }

  createIncident(body: unknown, options?: CommandOptions) {
    return this.command('/safety/incidents', body, options)
  }
}
