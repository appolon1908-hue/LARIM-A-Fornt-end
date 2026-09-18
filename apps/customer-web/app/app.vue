<script setup lang="ts">
const route = useRoute()
const auth = useWebAuth()

onMounted(() => {
  void auth.refresh()
})
</script>

<template>
  <div>
    <header class="brand">
      <NuxtLink class="brand-lockup" to="/">
        <div class="mark">L</div>
        <div><strong>LARIMÍA</strong><p>Tu bienestar llega a ti.</p></div>
      </NuxtLink>
      <nav class="nav" aria-label="Primary navigation">
        <NuxtLink to="/">Home</NuxtLink>
        <NuxtLink to="/book">Book</NuxtLink>
        <NuxtLink to="/bookings">Appointments</NuxtLink>
        <NuxtLink to="/membership">Membership</NuxtLink>
        <NuxtLink to="/safety">Safety</NuxtLink>
      </nav>
      <button
        v-if="auth.session.value.authenticated"
        class="header-action"
        type="button"
        @click="auth.logout()"
      >
        Sign out
      </button>
      <button
        v-else
        class="header-action"
        type="button"
        @click="auth.login(route.fullPath)"
      >
        Sign in
      </button>
    </header>
    <main><NuxtPage /></main>
    <footer class="footer">
      <strong>LARIMÍA</strong>
      <span>
        Beauty and wellness, delivered with safety and accountability.
      </span>
    </footer>
  </div>
</template>
