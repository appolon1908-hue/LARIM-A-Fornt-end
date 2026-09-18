<script setup lang="ts">
const route = useRoute()
const api = useLarimiaApi()
const bookingId = computed(() => String(route.params.id))
const realtime = useBookingRealtime()
const { data: booking, pending, error, refresh } = await useAsyncData(
  () => `booking-${bookingId.value}`,
  () => api.getBooking(bookingId.value),
  { server: false },
)
const { data: timeline } = await useAsyncData(
  () => `booking-timeline-${bookingId.value}`,
  () => api.bookingTimeline(bookingId.value),
  { server: false },
)

onMounted(() => {
  realtime.connect(bookingId.value, event => {
    if (event.type?.startsWith('booking.')) void refresh()
  })
})
</script>

<template>
  <section class="page narrow-page">
    <p v-if="pending">Loading appointment…</p>
    <p v-else-if="error" class="notice danger-text">
      Unable to load this appointment.
    </p>
    <template v-else-if="booking">
      <div class="card">
        <div class="card-heading">
          <span class="pill">{{ booking.status }}</span>
          <small>Live: {{ realtime.state }}</small>
        </div>
        <h1>{{ booking.booking_number }}</h1>
        <div class="summary-row">
          <span>Scheduled</span>
          <strong>
            {{ new Date(booking.scheduled_start).toLocaleString() }}
          </strong>
        </div>
        <div class="summary-row">
          <span>Total</span>
          <strong>
            {{ (booking.customer_total_minor / 100).toLocaleString() }}
            {{ booking.currency }}
          </strong>
        </div>
        <div class="summary-row">
          <span>Version</span><strong>{{ booking.version }}</strong>
        </div>
      </div>
      <div class="card timeline-card">
        <h2>Appointment timeline</h2>
        <ol class="timeline">
          <li
            v-for="item in timeline?.items || []"
            :key="`${item.action}-${item.at}`"
          >
            <strong>{{ item.action }}</strong>
            <small>{{ new Date(item.at).toLocaleString() }}</small>
          </li>
        </ol>
      </div>
    </template>
  </section>
</template>
