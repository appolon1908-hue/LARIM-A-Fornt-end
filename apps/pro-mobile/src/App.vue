<script setup lang="ts">
import {
  IonApp,
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/vue'
import { computed, ref } from 'vue'

import {
  providerStatusAction,
  providerStatusLabel,
  toggleProviderAvailability,
} from './provider-state'

const online = ref(false)
const statusLabel = computed(() => providerStatusLabel(online.value))
const statusAction = computed(() => providerStatusAction(online.value))

function toggleOnline(): void {
  online.value = toggleProviderAvailability(online.value)
}
</script>

<template>
  <ion-app>
    <ion-header>
      <ion-toolbar><ion-title>LARIMÍA Pro</ion-title></ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div style="display: flex; justify-content: space-between; align-items: center">
        <div>
          <small>Provider status</small>
          <h1 style="margin-top: 4px">{{ statusLabel }}</h1>
        </div>
        <ion-button @click="toggleOnline">{{ statusAction }}</ion-button>
      </div>
      <ion-card>
        <ion-card-content>
          <ion-badge color="medium">NEXT JOB</ion-badge>
          <h2>No assignment</h2>
          <p>New eligible job offers will appear in real time.</p>
        </ion-card-content>
      </ion-card>
      <ion-card>
        <ion-card-content>
          <h2>Today</h2>
          <p>0 completed · DOP 0 earned</p>
        </ion-card-content>
      </ion-card>
      <ion-card>
        <ion-card-content>
          <h2>Safety</h2>
          <p>Use Safety Check or SOS during an active visit.</p>
          <ion-button color="danger">SOS</ion-button>
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-app>
</template>
