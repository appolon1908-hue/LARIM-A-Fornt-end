export interface PaymentTokenizationRequest {
  amountMinor: number
  currency: string
  customerReference?: string
  bookingReference?: string
}

export interface PaymentTokenizationResult {
  token: string
  displayLabel?: string
}

export interface LarimiaPaymentSdk {
  tokenize(request: PaymentTokenizationRequest): Promise<PaymentTokenizationResult>
}

export class PaymentIntegrationUnavailableError extends Error {
  constructor() {
    super('The certified payment tokenization integration is not configured.')
    this.name = 'PaymentIntegrationUnavailableError'
  }
}

declare global {
  interface Window {
    LarimiaPaymentSDK?: LarimiaPaymentSdk
  }
}

export function paymentIntegrationReady(): boolean {
  return typeof window !== 'undefined' && Boolean(window.LarimiaPaymentSDK)
}

export async function tokenizePayment(
  request: PaymentTokenizationRequest,
): Promise<PaymentTokenizationResult> {
  if (typeof window === 'undefined' || !window.LarimiaPaymentSDK) {
    throw new PaymentIntegrationUnavailableError()
  }
  const result = await window.LarimiaPaymentSDK.tokenize(request)
  if (!result.token) throw new Error('Payment tokenization returned no token')
  return result
}
