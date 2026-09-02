<script setup lang="ts">
import {
  IonApp,
  IonButton,
  IonCard,
  IonCardContent,
  IonChip,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/vue'

import { CUSTOMER_REGION, CUSTOMER_SERVICES, CUSTOMER_TAGLINE } from './app-contract'
</script>

<template>
  <ion-app>
    <ion-header>
      <ion-toolbar><ion-title>LARIMÍA</ion-title></ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-chip>{{ CUSTOMER_REGION }}</ion-chip>
      <h1>{{ CUSTOMER_TAGLINE }}</h1>
      <p>Verified beauty and wellness professionals, wherever you are.</p>
      <ion-card v-for="service in CUSTOMER_SERVICES" :key="service">
        <ion-card-content>
          <h2>{{ service }}</h2>
          <ion-button>Book</ion-button>
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-app>
</template>
