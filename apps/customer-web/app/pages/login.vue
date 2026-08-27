<script setup lang="ts">
const route = useRoute()
const auth = useWebAuth()

function signIn() {
  const returnTo =
    typeof route.query.returnTo === 'string' ? route.query.returnTo : '/'
  auth.login(returnTo)
}
</script>

<template>
  <section class="page auth-page">
    <div class="card auth-card">
      <span class="pill">Secure account</span>
      <h1>Welcome to LARIMÍA</h1>
      <p>
        Sign in through the protected Codestra identity service. Passwords and
        refresh tokens are never stored in browser JavaScript.
      </p>
      <button class="button" type="button" @click="signIn">
        Sign in securely
      </button>
    </div>
  </section>
</template>
