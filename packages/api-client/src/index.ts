export interface ApiErrorBody { code?: string; message?: string; detail?: unknown; [key: string]: unknown }
export class ApiError extends Error {
  constructor(public status:number, public body:ApiErrorBody, public requestId?:string) {
    super(body.message || body.code || `API ${status}`)
  }
}
export interface BookingSummary {
  id:string; booking_number:string; customer_id:string; market_code:string; status:string;
  currency:string; customer_total_minor:number; version:number; scheduled_start:string; scheduled_end:string;
}
export interface CommandOptions { idempotencyKey?:string; ifMatch?:number; timeoutMs?:number }

export class LarimiaApi {
  constructor(
    private readonly baseUrl:string,
    private readonly getAccessToken:()=>Promise<string|null>,
    private readonly refreshAccessToken?:()=>Promise<string|null>,
  ) {}

  private async request<T>(path:string,init:RequestInit={},timeoutMs=15000,retried=false):Promise<T> {
    const token=await this.getAccessToken()
    const headers=new Headers(init.headers)
    headers.set('Accept','application/json')
    headers.set('X-Request-Id',crypto.randomUUID())
    if(init.body) headers.set('Content-Type','application/json')
    if(token) headers.set('Authorization',`Bearer ${token}`)
    const controller=new AbortController()
    const timer=globalThis.setTimeout(()=>controller.abort(),timeoutMs)
    try {
      const response=await fetch(`${this.baseUrl}${path}`,{...init,headers,signal:controller.signal})
      if(response.status===401 && !retried && this.refreshAccessToken) {
        const refreshed=await this.refreshAccessToken()
        if(refreshed) return this.request<T>(path,init,timeoutMs,true)
      }
      if(!response.ok) {
        let body:ApiErrorBody={}
        try {
          const raw=await response.json() as ApiErrorBody & {error?:ApiErrorBody}
          body=raw.error || (typeof raw.detail==='object' && raw.detail ? raw.detail as ApiErrorBody : raw)
        } catch { body={message:await response.text()} }
        throw new ApiError(response.status,body,response.headers.get('X-Request-Id')||undefined)
      }
      if(response.status===204) return undefined as T
      return response.json() as Promise<T>
    } finally { clearTimeout(timer) }
  }

  command<T>(path:string,body:unknown=undefined,options:CommandOptions={},method='POST') {
    const headers:Record<string,string>={'Idempotency-Key':options.idempotencyKey||crypto.randomUUID()}
    if(options.ifMatch!==undefined) headers['If-Match']=String(options.ifMatch)
    return this.request<T>(path,{method,headers,body:body===undefined?undefined:JSON.stringify(body)},options.timeoutMs||15000)
  }

  me(){return this.request('/customers/me')}
  addresses(){return this.request('/customers/me/addresses')}
  catalog(market='DO-SDQ'){return this.request(`/catalog?market=${encodeURIComponent(market)}`)}
  availability(params:URLSearchParams){return this.request(`/availability?${params}`)}
  quote(body:unknown,options?:CommandOptions){return this.command('/quotes',body,options)}
  createBookingFromQuote(id:string,options?:CommandOptions){return this.command<BookingSummary>(`/bookings/from-quote/${id}`,undefined,options)}
  listBookings(){return this.request<{items:BookingSummary[]}>('/bookings')}
  confirmBooking(id:string,version:number,options?:CommandOptions){return this.command<BookingSummary>(`/bookings/${id}/confirm`,undefined,{...options,ifMatch:version})}
  cancelBooking(id:string,version:number,options?:CommandOptions){return this.command<BookingSummary>(`/bookings/${id}/cancel`,undefined,{...options,ifMatch:version})}
  authorizePayment(body:unknown,options?:CommandOptions){return this.command('/payments/authorize',body,options)}
  dispatchBoard(){return this.request('/dispatch/ops/board')}
  createIncident(body:unknown,options?:CommandOptions){return this.command('/safety/incidents',body,options)}
}
