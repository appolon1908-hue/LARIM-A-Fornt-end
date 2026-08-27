import type { LarimiaApi } from './index'

export interface RealtimeEvent {
  id?: string
  type: string
  cursor?: string
  occurred_at?: string
  aggregate_id?: string
  data?: unknown
  [key: string]: unknown
}

export type RealtimeState = 'idle' | 'connecting' | 'open' | 'closed' | 'error'

export interface RealtimeChannelOptions {
  api: LarimiaApi
  wsBaseUrl: string
  topic: string
  path: string
  onEvent: (event: RealtimeEvent) => void
  onStateChange?: (state: RealtimeState) => void
  initialCursor?: string
  persistCursor?: (cursor: string) => void
}

export class RealtimeChannel {
  private socket: WebSocket | null = null
  private retries = 0
  private closedByUser = false
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private cursor: string

  constructor(private readonly options: RealtimeChannelOptions) {
    this.cursor = options.initialCursor || '$'
  }

  private state(value: RealtimeState) {
    this.options.onStateChange?.(value)
  }

  async connect(): Promise<void> {
    if (
      this.socket?.readyState === WebSocket.OPEN ||
      this.socket?.readyState === WebSocket.CONNECTING
    ) {
      return
    }
    this.closedByUser = false
    this.state('connecting')

    try {
      const ticket = await this.options.api.createRealtimeTicket(this.options.topic)
      const base = this.options.wsBaseUrl.replace(/\/$/, '')
      const path = this.options.path.startsWith('/')
        ? this.options.path
        : `/${this.options.path}`
      const url = new URL(`${base}${path}`)
      url.searchParams.set('ticket', ticket.ticket)
      url.searchParams.set('last_event_id', this.cursor)

      this.socket = new WebSocket(url)
      this.socket.onopen = () => {
        this.retries = 0
        this.state('open')
      }
      this.socket.onmessage = event => {
        try {
          const parsed = JSON.parse(event.data) as RealtimeEvent
          if (parsed.cursor) {
            this.cursor = parsed.cursor
            this.options.persistCursor?.(parsed.cursor)
          }
          this.options.onEvent(parsed)
        } catch {
          // Malformed frames are ignored; the durable cursor remains unchanged.
        }
      }
      this.socket.onerror = () => this.state('error')
      this.socket.onclose = () => {
        this.socket = null
        if (this.closedByUser) {
          this.state('closed')
          return
        }
        this.scheduleReconnect()
      }
    } catch {
      this.state('error')
      this.scheduleReconnect()
    }
  }

  private scheduleReconnect() {
    if (this.closedByUser || this.reconnectTimer) return
    const baseDelay = Math.min(30_000, 1_000 * 2 ** this.retries++)
    const jitter = Math.floor(Math.random() * 500)
    this.reconnectTimer = globalThis.setTimeout(() => {
      this.reconnectTimer = null
      void this.connect()
    }, baseDelay + jitter)
  }

  close(): void {
    this.closedByUser = true
    if (this.reconnectTimer) {
      globalThis.clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.socket?.close()
    this.socket = null
    this.state('closed')
  }
}
