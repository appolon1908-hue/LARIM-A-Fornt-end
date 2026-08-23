<script setup lang="ts">
import { IonApp, IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardContent, IonButton, IonChip } from '@ionic/vue'
const services = ['Massage','Haircut','Makeup','Personal Training']
</script>
<template>
<ion-app>
  <ion-header><ion-toolbar><ion-title>LARIMÍA</ion-title></ion-toolbar></ion-header>
  <ion-content class="ion-padding">
    <ion-chip>DO · Santo Domingo</ion-chip>
    <h1>Tu bienestar llega a ti.</h1>
    <p>Verified beauty and wellness professionals, wherever you are.</p>
    <ion-card v-for="service in services" :key="service">
      <ion-card-content><h2>{{service}}</h2><ion-button>Book</ion-button></ion-card-content>
    </ion-card>
  </ion-content>
</ion-app>
</template>
