<script setup lang="ts">
const api=useLarimiaApi();const flow=useBookingFlow();const config=useRuntimeConfig();const busy=ref(false);const error=ref('')
async function confirm(){
  if(!flow.value.quote)return
  if(!config.public.paymentSandboxEnabled){error.value='Checkout is unavailable until the payment provider SDK is configured.';return}
  busy.value=true;error.value=''
  try{
    const bookingKey=flow.value.bookingKey||crypto.randomUUID();flow.value.bookingKey=bookingKey
    const booking:any=await api.createBookingFromQuote(flow.value.quote.id,{idempotencyKey:bookingKey})
    flow.value.booking=booking
    const paymentKey=flow.value.paymentKey||crypto.randomUUID();flow.value.paymentKey=paymentKey
    await api.authorizePayment({booking_id:booking.id,payment_method_token:'sandbox_tok'},{idempotencyKey:paymentKey})
    const confirmKey=flow.value.confirmKey||crypto.randomUUID();flow.value.confirmKey=confirmKey
    flow.value.booking=await api.confirmBooking(booking.id,booking.version,{idempotencyKey:confirmKey})
    await navigateTo('/bookings')
  }catch(e:any){error.value=e?.message||'Unable to confirm appointment'}finally{busy.value=false}
}
</script>
<template><section class="page"><div class="card"><span class="pill">Secure checkout</span><h1>Confirm your appointment</h1>
<div v-if="flow.quote"><h2>{{(flow.quote.total_minor/100).toLocaleString()}} {{flow.quote.currency}}</h2></div>
<p>Production checkout must replace the sandbox token with the configured processor SDK tokenization.</p>
<p v-if="error" style="color:#8e2424">{{error}}</p><button class="button" :disabled="busy||!flow.quote" @click="confirm">{{busy?'Confirming…':'Authorize & confirm'}}</button>
</div></section></template>
