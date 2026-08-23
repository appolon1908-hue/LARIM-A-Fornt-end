export type Currency = 'DOP' | 'USD'
export type Locale = 'es-DO' | 'en-US'

export type BookingStatus =
  | 'DRAFT'
  | 'QUOTED'
  | 'CONFIRMED'
  | 'MATCHING'
  | 'ASSIGNED'
  | 'EN_ROUTE'
  | 'ARRIVED'
  | 'IN_SERVICE'
  | 'COMPLETED'
  | 'SETTLING'
  | 'SETTLED'
  | 'CANCELLED'
  | 'DISPUTED'

export interface Money {
  amountMinor: number
  currency: Currency
}

export interface BookingSummary {
  id: string
  bookingNumber: string
  status: BookingStatus
  scheduledStart: string
  total: Money
}

export * from './permissions'
