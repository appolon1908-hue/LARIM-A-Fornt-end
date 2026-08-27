export interface ApiErrorBody {
  code?: string
  message?: string
  detail?: unknown
  retryable?: boolean
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

export interface CapacityHoldSummary {
  id: string
  status: string
  expires_at: string
  version: number
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
  quote_id?: string | null
  capacity_hold_id?: string | null
  payment_intent_id?: string | null
  confirmed_at?: string | null
  cancelled_at?: string | null
  cancellation_reason?: string | null
}

export interface AddressSummary {
  id: string
  label: string
  place_type: string
  address_line_1: string
  city: string
  country_code: string
  latitude: number
  longitude: number
  access_notes?: string | null
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

export interface AvailabilitySlot {
  start: string
  end: string
  provider_capacity: number
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
  price_policy_version: number
  capacity_hold: CapacityHoldSummary
}

export interface PaymentIntentSummary {
  id: string
  status: string
  amount_minor: number
  currency: string
}

export interface DispatchOfferSummary {
  id: string
  booking_id: string
  provider_id: string
  rank: number
  score: number
  expires_at: string
  status: string
  booking_version?: number
}

export interface ProviderSummary {
  id: string
  display_name: string
  status: string
  market_code: string
  version: number
}

export interface RealtimeTicket {
  ticket: string
  expires_in: number
}

export interface CommandOptions {
  idempotencyKey?: string
  ifMatch?: number
  timeoutMs?: number
}

export interface LarimiaApiOptions {
  credentials?: RequestCredentials
  defaultTimeoutMs?: number
  getCsrfToken?: () => string | null
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
  private readonly credentials: RequestCredentials
  private readonly defaultTimeoutMs: number
  private readonly getCsrfToken?: () => string | null

  constructor(
    private readonly baseUrl: string,
    private readonly getAccessToken: () => Promise<string | null> = async () => null,
    private readonly refreshAccessToken?: () => Promise<string | null>,
    options: LarimiaApiOptions = {},
  ) {
    this.credentials = options.credentials ?? 'same-origin'
    this.defaultTimeoutMs = options.defaultTimeoutMs ?? 15_000
    this.getCsrfToken = options.getCsrfToken
  }

  private async request<T>(
    path: string,
    init: RequestInit = {},
    timeoutMs = this.defaultTimeoutMs,
    retried = false,
  ): Promise<T> {
    const token = await this.getAccessToken()
    const headers = new Headers(init.headers)
    headers.set('Accept', 'application/json')
    headers.set('X-Request-Id', requestId())
    if (init.body !== undefined) headers.set('Content-Type', 'application/json')
    if (token) headers.set('Authorization', `Bearer ${token}`)

    const controller = new AbortController()
    const timer = globalThis.setTimeout(() => controller.abort(), timeoutMs)
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...init,
        headers,
        credentials: this.credentials,
        signal: controller.signal,
      })

      if (response.status === 401 && !retried && this.refreshAccessToken) {
        const refreshed = await this.refreshAccessToken()
        if (refreshed) {
          return this.request<T>(path, init, timeoutMs, true)
        }
      }

      if (!response.ok) {
        const rawText = await response.text()
        let body: ApiErrorBody = {}
        if (rawText) {
          try {
            body = normalizeError(JSON.parse(rawText) as ApiErrorBody)
          } catch {
            body = { message: rawText }
          }
        }
        throw new ApiError(
          response.status,
          body,
          response.headers.get('X-Request-Id') || undefined,
        )
      }

      if (response.status === 204) return undefined as T
      const rawText = await response.text()
      if (!rawText) return undefined as T
      return JSON.parse(rawText) as T
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
    const csrfToken = this.getCsrfToken?.()
    if (csrfToken) headers['X-CSRF-Token'] = csrfToken
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
      options.timeoutMs || this.defaultTimeoutMs,
    )
  }

  me() {
    return this.request<{
      id: string
      market_code: string
      preferred_language: string
      status: string
    }>('/customers/me')
  }

  addresses() {
    return this.request<{ items: AddressSummary[] }>('/customers/me/addresses')
  }

  addAddress(body: Omit<AddressSummary, 'id'>, options?: CommandOptions) {
    return this.command<{ id: string }>('/customers/me/addresses', body, options)
  }

  catalog(market = 'DO-SDQ') {
    return this.request<{ services: CatalogServiceSummary[] }>(
      `/catalog?market=${encodeURIComponent(market)}`,
    )
  }

  availability(params: URLSearchParams) {
    return this.request<{
      market: string
      service_code: string
      slots: AvailabilitySlot[]
    }>(`/availability?${params.toString()}`)
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

  getBooking(id: string) {
    return this.request<BookingSummary>(`/bookings/${encodeURIComponent(id)}`)
  }

  bookingTimeline(id: string) {
    return this.request<{
      items: Array<{ action: string; at: string; metadata: unknown }>
    }>(`/bookings/${encodeURIComponent(id)}/timeline`)
  }

  confirmBooking(id: string, version: number, options?: CommandOptions) {
    return this.command<BookingSummary>(
      `/bookings/${encodeURIComponent(id)}/confirm`,
      undefined,
      { ...options, ifMatch: version },
    )
  }

  cancelBooking(
    id: string,
    version: number,
    reason = 'CUSTOMER_REQUEST',
    options?: CommandOptions,
  ) {
    return this.command<BookingSummary>(
      `/bookings/${encodeURIComponent(id)}/cancel`,
      { reason },
      { ...options, ifMatch: version },
    )
  }

  startMatching(id: string, version: number, options?: CommandOptions) {
    return this.command<BookingSummary>(
      `/bookings/${encodeURIComponent(id)}/start-matching`,
      undefined,
      { ...options, ifMatch: version },
    )
  }

  authorizePayment(body: unknown, options?: CommandOptions) {
    return this.command<PaymentIntentSummary>('/payments/authorize', body, options)
  }

  paymentIntent(id: string) {
    return this.request<PaymentIntentSummary>(`/payments/${encodeURIComponent(id)}`)
  }

  createRealtimeTicket(topic: string, options?: CommandOptions) {
    return this.command<RealtimeTicket>('/ws/tickets', { topic }, options)
  }

  dispatchBoard() {
    return this.request<{ items: BookingSummary[] }>('/dispatch/ops/board')
  }

  createDispatchOffers(bookingId: string, options?: CommandOptions) {
    return this.command<{ items: DispatchOfferSummary[] }>(
      `/dispatch/ops/bookings/${encodeURIComponent(bookingId)}/offers`,
      undefined,
      options,
    )
  }

  providerMe() {
    return this.request<ProviderSummary>('/providers/me')
  }

  providerOffers() {
    return this.request<{ items: DispatchOfferSummary[] }>('/dispatch/offers')
  }

  acceptOffer(
    offerId: string,
    bookingVersion: number,
    options?: CommandOptions,
  ) {
    return this.command<{
      assignment_id: string
      booking_id: string
      status: string
    }>(
      `/dispatch/offers/${encodeURIComponent(offerId)}/accept`,
      { booking_version: bookingVersion },
      options,
    )
  }

  declineOffer(offerId: string, options?: CommandOptions) {
    return this.command<{ offer_id: string; status: string }>(
      `/dispatch/offers/${encodeURIComponent(offerId)}/decline`,
      undefined,
      options,
    )
  }

  updateProviderAvailability(rules: unknown[], options?: CommandOptions) {
    return this.command<{ updated: boolean; count: number }>(
      '/providers/me/availability',
      rules,
      options,
      'PUT',
    )
  }

  transitionVisit(
    bookingId: string,
    action: 'en-route' | 'arrive' | 'start' | 'complete',
    body: unknown = undefined,
    options?: CommandOptions,
  ) {
    return this.command<{
      booking_id: string
      visit_id: string
      status: string
      version: number
    }>(
      `/visits/${encodeURIComponent(bookingId)}/${action}`,
      body,
      options,
    )
  }

  createIncident(body: unknown, options?: CommandOptions) {
    return this.command<{ id: string; status: string; severity: string }>(
      '/safety/incidents',
      body,
      options,
    )
  }

  createSupportCase(body: unknown, options?: CommandOptions) {
    return this.command<{ id: string; status: string }>(
      '/support/cases',
      body,
      options,
    )
  }

  financeReconciliation() {
    return this.request<{ breaks: unknown[] }>('/finance/reconciliation-breaks')
  }

  financePayoutBatches() {
    return this.request<{ batches: unknown[] }>('/finance/payout-batches')
  }
}
