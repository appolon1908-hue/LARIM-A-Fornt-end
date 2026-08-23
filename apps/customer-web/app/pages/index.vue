<script setup lang="ts">
const api = useLarimiaApi()
const { data } = await useAsyncData('catalog', () => api.catalog('DO-SDQ'))
</script>
<template>
<section class="page">
  <div class="hero">
    <span class="pill">LARIMÍA · Santo Domingo</span>
    <h1>Tu bienestar llega a ti.</h1>
    <p>Beauty, massage, grooming and fitness professionals delivered to your home, hotel or villa.</p>
    <NuxtLink class="button" to="/book">Reservar ahora</NuxtLink>
  </div>
  <h2>Servicios</h2>
  <div class="grid">
    <article v-for="s in (data?.services || [])" :key="(s as any).code" class="card">
      <strong>{{ (s as any).name?.['es-DO'] }}</strong>
      <p>{{ (s as any).duration_minutes }} min</p>
    </article>
  </div>
</section>
</template>
