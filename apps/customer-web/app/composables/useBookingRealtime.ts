import {
  RealtimeChannel,
  type RealtimeEvent,
  type RealtimeState,
} from '@larimia/api-client/realtime'

export function useBookingRealtime() {
  const api = useLarimiaApi()
  const config = useRuntimeConfig()
  const state = ref<RealtimeState>('idle')
  const lastEvent = ref<RealtimeEvent | null>(null)
  let channel: RealtimeChannel | null = null

  function connect(
    bookingId: string,
    onEvent?: (event: RealtimeEvent) => void,
  ) {
    channel?.close()
    const cursorKey = `larimia.booking.${bookingId}.cursor`
    channel = new RealtimeChannel({
      api,
      wsBaseUrl: config.public.websocketBaseUrl as string,
      topic: `booking:${bookingId}`,
      path: `/bookings/${encodeURIComponent(bookingId)}`,
      initialCursor:
        typeof localStorage === 'undefined'
          ? '$'
          : localStorage.getItem(cursorKey) || '$',
      persistCursor: cursor => localStorage.setItem(cursorKey, cursor),
      onStateChange: value => {
        state.value = value
      },
      onEvent: event => {
        lastEvent.value = event
        onEvent?.(event)
      },
    })
    void channel.connect()
  }

  function close() {
    channel?.close()
    channel = null
  }

  onBeforeUnmount(close)
  return { state, lastEvent, connect, close }
}
