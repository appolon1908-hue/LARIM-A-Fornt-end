<script setup lang="ts">
import type { BookingSummary } from '@larimia/api-client'

const api = useLarimiaApi()
const actionId = ref<string | null>(null)
const errorMessage = ref('')
const { data, pending, error, refresh } = await useAsyncData(
  'bookings',
  () => api.listBookings(),
  { server: false },
)

const cancellable = new Set([
  'DRAFT',
  'QUOTED',
  'CONFIRMED',
  'MATCHING',
  'ASSIGNED',
  'EN_ROUTE',
  'ARRIVED',
])

async function cancel(booking: BookingSummary) {
  if (!cancellable.has(booking.status)) return
  actionId.value = booking.id
  errorMessage.value = ''
  try {
    await api.cancelBooking(
      booking.id,
      booking.version,
      'CUSTOMER_REQUEST',
      { idempotencyKey: crypto.randomUUID() },
    )
    await refresh()
  } catch (cause: any) {
    errorMessage.value =
      cause?.message || 'Unable to cancel this appointment.'
  } finally {
    actionId.value = null
  }
}
</script>

<template>
  <section class="page">
    <div class="section-heading">
      <div>
        <span class="pill">Customer portal</span>
        <h1>My appointments</h1>
      </div>
    </div>
    <p v-if="pending">Loading appointments…</p>
    <p v-else-if="error" class="notice danger-text">
      Could not load appointments.
      <button class="text-button" @click="refresh()">Retry</button>
    </p>
    <p v-if="errorMessage" class="notice danger-text">
      {{ errorMessage }}
    </p>
    <div v-if="data?.items?.length" class="grid">
      <article
        v-for="booking in data.items"
        :key="booking.id"
        class="card appointment-card"
      >
        <div class="card-heading">
          <span class="pill">{{ booking.status }}</span>
          <small>v{{ booking.version }}</small>
        </div>
        <h2>{{ booking.booking_number }}</h2>
        <p>{{ new Date(booking.scheduled_start).toLocaleString() }}</p>
        <strong>
          {{ (booking.customer_total_minor / 100).toLocaleString() }}
          {{ booking.currency }}
        </strong>
        <div class="button-row">
          <NuxtLink
            class="button secondary"
            :to="`/bookings/${booking.id}`"
          >
            View details
          </NuxtLink>
          <button
            v-if="cancellable.has(booking.status)"
            class="button ghost-danger"
            type="button"
            :disabled="actionId === booking.id"
            @click="cancel(booking)"
          >
            {{ actionId === booking.id ? 'Cancelling…' : 'Cancel' }}
          </button>
        </div>
      </article>
    </div>
    <div v-else-if="!pending" class="card empty-state">
      <h2>No appointments yet</h2>
      <p>Choose a service and see live availability.</p>
      <NuxtLink class="button" to="/book">Book a service</NuxtLink>
    </div>
  </section>
</template>
