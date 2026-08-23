<script setup lang="ts">
import { ref } from 'vue'
const api = useLarimiaApi()
const serviceCode = ref('MASSAGE_60')
const addressId = ref('demo-address')
const marketCode = ref('DO-SDQ')
const quote = ref<any>(null)
const loading = ref(false)

async function getQuote() {
  loading.value = true
  try {
    quote.value = await api.quote({
      market_code: marketCode.value,
      currency: 'DOP',
      service_code: serviceCode.value,
      address_id: addressId.value,
      scheduled_start: new Date(Date.now() + 86400000).toISOString(),
      add_ons: []
    })
  } finally { loading.value = false }
}
</script>
<template>
<section class="page">
  <div class="card">
    <span class="pill">Step 1 of 3</span>
    <h1>Book your service</h1>
    <label>Service</label>
    <select v-model="serviceCode">
      <option value="MASSAGE_60">Massage · 60 min</option>
      <option value="HAIRCUT">Haircut</option>
      <option value="MAKEUP">Makeup</option>
      <option value="TRAINING_60">Personal training</option>
    </select>
    <label>Location</label>
    <input v-model="addressId" />
    <button class="button" :disabled="loading" @click="getQuote">{{ loading ? 'Calculating…' : 'Get quote' }}</button>
    <div v-if="quote" class="quote">
      <h2>{{ (quote.total_minor / 100).toLocaleString() }} {{ quote.currency }}</h2>
      <p>Price locked for 10 minutes.</p>
      <NuxtLink class="button" to="/checkout">Continue</NuxtLink>
    </div>
  </div>
</section>
</template>
