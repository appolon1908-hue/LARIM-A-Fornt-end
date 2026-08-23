<script setup lang="ts">
const api = useLarimiaApi()
const { data: board } = await useAsyncData('dispatch-board', () => api.dispatchBoard())
const metrics = computed(() => [
  ['Unassigned', (board.value as any)?.unassigned?.length ?? 0],
  ['Late risk', (board.value as any)?.late_risk?.length ?? 0],
  ['Active', (board.value as any)?.active?.length ?? 0],
  ['Recovery', (board.value as any)?.recovery?.length ?? 0],
])
</script>
<template><section class="page"><h1>Operations Control Center</h1><div class="grid"><div v-for="[k,v] in metrics" :key="k" class="card"><small>{{k}}</small><h2>{{v}}</h2></div></div><div class="card" style="margin-top:16px"><h2>Live dispatch</h2><p>WebSocket: /v1/ws/ops/dispatch</p></div></section></template>
