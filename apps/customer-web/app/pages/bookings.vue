<script setup lang="ts">
const api=useLarimiaApi()
const {data,pending,error,refresh}=await useAsyncData('bookings',()=>api.listBookings(),{server:false})
</script>
<template><section class="page"><h1>My appointments</h1>
<p v-if="pending">Loading…</p><p v-else-if="error">Could not load appointments. <button @click="refresh()">Retry</button></p>
<div v-else class="grid"><div v-for="b in data?.items||[]" :key="b.id" class="card"><span class="pill">{{b.status}}</span><h2>{{b.booking_number}}</h2><p>{{new Date(b.scheduled_start).toLocaleString()}}</p><strong>{{(b.customer_total_minor/100).toLocaleString()}} {{b.currency}}</strong></div></div>
</section></template>
