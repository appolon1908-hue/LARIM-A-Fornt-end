<script setup lang="ts">
import {
  paymentIntegrationReady,
  tokenizePayment,
} from '@larimia/payment-tokenization'

const api = useLarimiaApi()
const flow = useBookingFlow()
const busy = ref(false)
const error = ref('')
const paymentReady = ref(false)

onMounted(() => {
  paymentReady.value = paymentIntegrationReady()
  if (!flow.value.quote) void navigateTo('/book')
})

async function confirm() {
  const quote = flow.value.quote
  if (!quote || !paymentReady.value) return
  busy.value = true
  error.value = ''
  try {
    const bookingKey = flow.value.bookingKey || crypto.randomUUID()
    flow.value.bookingKey = bookingKey
    const booking =
      flow.value.booking ||
      (await api.createBookingFromQuote(quote.id, {
        idempotencyKey: bookingKey,
      }))
    flow.value.booking = booking

    const tokenized = await tokenizePayment({
      amountMinor: booking.customer_total_minor,
      currency: booking.currency,
      bookingReference: booking.id,
      customerReference: booking.customer_id,
    })

    const paymentKey = flow.value.paymentKey || crypto.randomUUID()
    flow.value.paymentKey = paymentKey
    const payment =
      flow.value.payment ||
      (await api.authorizePayment(
        {
          booking_id: booking.id,
          payment_method_token: tokenized.token,
        },
        { idempotencyKey: paymentKey, timeoutMs: 30_000 },
      ))
    flow.value.payment = payment

    const confirmKey = flow.value.confirmKey || crypto.randomUUID()
    flow.value.confirmKey = confirmKey
    flow.value.booking = await api.confirmBooking(
      booking.id,
      booking.version,
      { idempotencyKey: confirmKey },
    )
    await navigateTo(`/bookings/${encodeURIComponent(booking.id)}`)
  } catch (cause: any) {
    error.value = cause?.message || 'Unable to confirm the appointment.'
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <section class="page narrow-page">
    <div class="card checkout-card">
      <span class="pill">Secure checkout</span>
      <h1>Review and confirm</h1>
      <template v-if="flow.quote">
        <div class="summary-row">
          <span>Appointment</span>
          <strong>
            {{ new Date(flow.quote.scheduled_start).toLocaleString() }}
          </strong>
        </div>
        <div class="summary-row">
          <span>Subtotal</span>
          <strong>
            {{ (flow.quote.subtotal_minor / 100).toLocaleString() }}
            {{ flow.quote.currency }}
          </strong>
        </div>
        <div class="summary-row">
          <span>Tax</span>
          <strong>
            {{ (flow.quote.tax_minor / 100).toLocaleString() }}
            {{ flow.quote.currency }}
          </strong>
        </div>
        <div class="summary-row total">
          <span>Total</span>
          <strong>
            {{ (flow.quote.total_minor / 100).toLocaleString() }}
            {{ flow.quote.currency }}
          </strong>
        </div>
      </template>

      <div v-if="!paymentReady" class="notice warning">
        The certified payment tokenization SDK is not configured. Checkout
        remains disabled rather than accepting a fake or raw card token.
      </div>
      <p v-if="error" class="notice danger-text">{{ error }}</p>
      <button
        class="button full"
        type="button"
        :disabled="busy || !flow.quote || !paymentReady"
        @click="confirm"
      >
        {{
          busy
            ? 'Authorizing and confirming…'
            : 'Authorize payment and confirm'
        }}
      </button>
      <NuxtLink class="text-link" to="/book">Choose another time</NuxtLink>
    </div>
  </section>
</template>
