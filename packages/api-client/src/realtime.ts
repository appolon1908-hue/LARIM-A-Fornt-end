export class RealtimeChannel {
  private socket: WebSocket | null = null
  private retries = 0
  private closedByUser = false

  constructor(
    private readonly url: string,
    private readonly onEvent: (event: unknown) => void,
  ) {}

  connect() {
    this.closedByUser = false
    this.socket = new WebSocket(this.url)
    this.socket.onopen = () => { this.retries = 0 }
    this.socket.onmessage = event => {
      try { this.onEvent(JSON.parse(event.data)) } catch { /* ignore malformed frame */ }
    }
    this.socket.onclose = () => {
      if (this.closedByUser) return
      const delay = Math.min(30_000, 1000 * 2 ** this.retries++)
      window.setTimeout(() => this.connect(), delay)
    }
  }

  close() {
    this.closedByUser = true
    this.socket?.close()
  }
}
