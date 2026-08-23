<script setup lang="ts">
import { ref } from 'vue'
import { IonApp, IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardContent, IonButton, IonBadge } from '@ionic/vue'
const online = ref(false)
</script>
<template>
<ion-app>
  <ion-header><ion-toolbar><ion-title>LARIMÍA Pro</ion-title></ion-toolbar></ion-header>
  <ion-content class="ion-padding">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <div><small>Provider status</small><h1 style="margin-top:4px">{{ online ? 'Online' : 'Offline' }}</h1></div>
      <ion-button @click="online = !online">{{ online ? 'Go offline' : 'Go online' }}</ion-button>
    </div>
    <ion-card><ion-card-content><ion-badge color="medium">NEXT JOB</ion-badge><h2>No assignment</h2><p>New eligible job offers will appear in real time.</p></ion-card-content></ion-card>
    <ion-card><ion-card-content><h2>Today</h2><p>0 completed · DOP 0 earned</p></ion-card-content></ion-card>
    <ion-card><ion-card-content><h2>Safety</h2><p>Use Safety Check or SOS during an active visit.</p><ion-button color="danger">SOS</ion-button></ion-card-content></ion-card>
  </ion-content>
</ion-app>
</template>
