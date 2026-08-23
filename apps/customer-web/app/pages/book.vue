<script setup lang="ts">
const api=useLarimiaApi();const flow=useBookingFlow()
const serviceCode=ref('MASSAGE_60');const addressId=ref('');const loading=ref(false);const error=ref('')
async function getQuote(){
  loading.value=true;error.value=''
  try {
    const key=flow.value.quoteKey||crypto.randomUUID();flow.value.quoteKey=key
    flow.value.quote=await api.quote({
      market_code:'DO-SDQ',service_code:serviceCode.value,address_id:addressId.value,
      scheduled_start:new Date(Date.now()+86400000).toISOString()
    },{idempotencyKey:key})
  } catch(e:any){error.value=e?.message||'Quote failed'} finally{loading.value=false}
}
</script>
<template><section class="page"><div class="card">
<span class="pill">Step 1 of 3</span><h1>Book your service</h1>
<label>Service</label><select v-model="serviceCode"><option value="MASSAGE_60">Massage · 60 min</option><option value="HAIRCUT">Haircut</option><option value="MAKEUP">Makeup</option><option value="TRAINING_60">Personal training</option></select>
<label>Saved address ID</label><input v-model="addressId" />
<p v-if="error" style="color:#8e2424">{{error}}</p>
<button class="button" :disabled="loading||!addressId" @click="getQuote">{{loading?'Calculating…':'Get quote'}}</button>
<div v-if="flow.quote" class="quote"><h2>{{(flow.quote.total_minor/100).toLocaleString()}} {{flow.quote.currency}}</h2><p>Price locked until {{new Date(flow.quote.expires_at).toLocaleTimeString()}}</p><NuxtLink class="button" to="/checkout">Continue</NuxtLink></div>
</div></section></template>
