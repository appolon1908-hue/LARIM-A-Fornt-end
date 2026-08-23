<script setup lang="ts">
const api=useLarimiaApi()
const {data,pending,error,refresh}=await useAsyncData('ops-dispatch',()=>api.dispatchBoard(),{server:false})
</script>
<template><section class="page"><h1>Dispatch</h1><p v-if="pending">Loading…</p><p v-else-if="error">Unable to load dispatch. <button @click="refresh()">Retry</button></p>
<div v-else class="card"><table><thead><tr><th>Booking</th><th>Market</th><th>Status</th><th>Scheduled</th></tr></thead><tbody><tr v-for="b in (data as any)?.items||[]" :key="b.id"><td>{{b.booking_number}}</td><td>{{b.market_code}}</td><td>{{b.status}}</td><td>{{new Date(b.scheduled_start).toLocaleString()}}</td></tr></tbody></table></div></section></template>
