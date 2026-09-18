<script setup lang="ts">
const api=useLarimiaApi();const sending=ref(false);const sent=ref(false)
async function sos(){if(!confirm('Contact the LARIMÍA safety desk now?'))return;sending.value=true;try{await api.createIncident({severity:'S1',category:'SOS',description:'Customer initiated SOS from Safety Center'});sent.value=true}finally{sending.value=false}}
</script>
<template><section class="page"><div class="card"><span class="pill">Safety Center</span><h1>Your visit, protected.</h1><p>Verified professional identity, secure arrival PIN, masked communication and incident support.</p><button class="danger" :disabled="sending" @click="sos">{{sent?'Safety alert sent':sending?'Sending…':'Emergency / SOS'}}</button></div></section></template>
