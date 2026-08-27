<script setup lang="ts">
import type {
  AddressSummary,
  AvailabilitySlot,
  CatalogServiceSummary,
} from '@larimia/api-client'

const api = useLarimiaApi()
const flow = useBookingFlow()
const marketCode = ref('DO-SDQ')
const serviceCode = ref('')
const addressId = ref('')
const selectedDate = ref(
  new Date(Date.now() + 86_400_000).toISOString().slice(0, 10),
)
const slots = ref<AvailabilitySlot[]>([])
const loadingSlots = ref(false)
const loadingQuote = ref(false)
const error = ref('')

const { data: catalogData, pending: catalogPending } = await useAsyncData(
  'customer-catalog',
  () => api.catalog(marketCode.value),
  { server: false },
)
const { data: addressData, pending: addressesPending } = await useAsyncData(
  'customer-addresses',
  () => api.addresses(),
  { server: false },
)

const services = computed<CatalogServiceSummary[]>(
  () => catalogData.value?.services || [],
)
const addresses = computed<AddressSummary[]>(
  () => addressData.value?.items || [],
)

watchEffect(() => {
  if (!serviceCode.value && services.value[0]) {
    serviceCode.value = services.value[0].code
  }
  if (!addressId.value && addresses.value[0]) {
    addressId.value = addresses.value[0].id
  }
})

async function loadSlots() {
  if (!serviceCode.value || !selectedDate.value) return
  loadingSlots.value = true
  error.value = ''
  try {
    const fromTime = new Date(
      `${selectedDate.value}T00:00:00`,
    ).toISOString()
    const params = new URLSearchParams({
      market: marketCode.value,
      service_code: serviceCode.value,
      from_time: fromTime,
      days: '1',
    })
    const result = await api.availability(params)
    slots.value = result.slots
  } catch (cause: any) {
    slots.value = []
    error.value = cause?.message || 'Unable to load availability.'
  } finally {
    loadingSlots.value = false
  }
}

watch([serviceCode, selectedDate], () => {
  void loadSlots()
})
onMounted(() => {
  void loadSlots()
})

async function selectSlot(slot: AvailabilitySlot) {
  if (!addressId.value || !serviceCode.value) return
  loadingQuote.value = true
  error.value = ''
  try {
    const key = crypto.randomUUID()
    flow.value.quoteKey = key
    flow.value.quote = await api.quote(
      {
        market_code: marketCode.value,
        service_code: serviceCode.value,
        address_id: addressId.value,
        scheduled_start: slot.start,
      },
      { idempotencyKey: key },
    )
    flow.value.booking = null
    flow.value.payment = null
    flow.value.bookingKey = null
    flow.value.paymentKey = null
    flow.value.confirmKey = null
  } catch (cause: any) {
    error.value = cause?.message || 'Unable to reserve the selected time.'
  } finally {
    loadingQuote.value = false
  }
}
</script>

<template>
  <section class="page">
    <div class="section-heading">
      <div>
        <span class="pill">Step 1 of 3</span>
        <h1>Choose your service</h1>
      </div>
      <p>
        Live availability is calculated from approved professionals, existing
        assignments, confirmed demand and active checkout holds.
      </p>
    </div>

    <div class="booking-layout">
      <div class="card form-card">
        <label for="service">Service</label>
        <select id="service" v-model="serviceCode" :disabled="catalogPending">
          <option
            v-for="service in services"
            :key="service.id"
            :value="service.code"
          >
            {{ service.name['es-DO'] || service.name.es || service.code }} ·
            {{ service.duration_minutes }} min
          </option>
        </select>

        <label for="address">Service address</label>
        <select
          id="address"
          v-model="addressId"
          :disabled="addressesPending"
        >
          <option value="" disabled>Select an address</option>
          <option
            v-for="address in addresses"
            :key="address.id"
            :value="address.id"
          >
            {{ address.label }} · {{ address.address_line_1 }},
            {{ address.city }}
          </option>
        </select>
        <p
          v-if="!addressesPending && !addresses.length"
          class="notice warning"
        >
          Add a verified service address to your profile before booking.
        </p>

        <label for="date">Date</label>
        <input id="date" v-model="selectedDate" type="date" />
        <button
          class="button secondary"
          type="button"
          :disabled="loadingSlots"
          @click="loadSlots"
        >
          {{ loadingSlots ? 'Refreshing…' : 'Refresh availability' }}
        </button>
      </div>

      <div class="card">
        <div class="card-heading">
          <h2>Available times</h2>
          <span>{{ slots.length }} options</span>
        </div>
        <p v-if="loadingSlots">Checking live capacity…</p>
        <div v-else-if="slots.length" class="slot-grid">
          <button
            v-for="slot in slots"
            :key="slot.start"
            class="slot"
            type="button"
            :disabled="loadingQuote || !addressId"
            @click="selectSlot(slot)"
          >
            <strong>
              {{
                new Date(slot.start).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              }}
            </strong>
            <small>
              {{ slot.provider_capacity }} professional{{
                slot.provider_capacity === 1 ? '' : 's'
              }}
            </small>
          </button>
        </div>
        <p v-else>
          No appointment times are currently available for this date.
        </p>
      </div>
    </div>

    <p v-if="error" class="notice danger-text">{{ error }}</p>

    <div v-if="flow.quote" class="card quote-card">
      <div>
        <span class="pill">Time held</span>
        <h2>
          {{ (flow.quote.total_minor / 100).toLocaleString() }}
          {{ flow.quote.currency }}
        </h2>
        <p>{{ new Date(flow.quote.scheduled_start).toLocaleString() }}</p>
        <small>
          Capacity hold expires
          {{ new Date(flow.quote.capacity_hold.expires_at).toLocaleTimeString() }}
        </small>
      </div>
      <NuxtLink class="button" to="/checkout">
        Continue to secure payment
      </NuxtLink>
    </div>
  </section>
</template>
