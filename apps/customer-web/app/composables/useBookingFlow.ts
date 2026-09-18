import type {
  BookingSummary,
  PaymentIntentSummary,
  QuoteSummary,
} from '@larimia/api-client'

export interface BookingFlowState {
  quote: QuoteSummary | null
  booking: BookingSummary | null
  payment: PaymentIntentSummary | null
  quoteKey: string | null
  bookingKey: string | null
  paymentKey: string | null
  confirmKey: string | null
}

export function useBookingFlow() {
  return useState<BookingFlowState>('booking-flow', () => ({
    quote: null,
    booking: null,
    payment: null,
    quoteKey: null,
    bookingKey: null,
    paymentKey: null,
    confirmKey: null,
  }))
}
