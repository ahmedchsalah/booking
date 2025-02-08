<script setup lang="ts">
import { useRouter } from 'vue-router';
import { userStore } from '@/stores/userStore';

const router = useRouter();
const store = userStore;

const logout = () => {
  store.logout();
  router.push('/login');
};
</script>

<template>
  <v-app-bar :elevation="2">
    <!-- Logo/Icon on the left -->
    <template v-slot:prepend>
      <v-icon
          icon="mdi-bed"
          color="primary"
          size="large"
          class="mr-2"
      ></v-icon>
      <v-app-bar-title>Booking App</v-app-bar-title>
    </template>

    <!-- Navigation Buttons and User Profile -->
    <template v-slot:append>
      <!-- Dynamic Links for Navigation -->
      <v-btn
          v-for="link in store.links.value"
          :key="link.text"
          :to="link.to"
          variant="text"
      >
        {{ link.text }}
      </v-btn>

      <!-- User Profile Menu -->
      <v-menu v-if="store.user.value">
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" icon>
            <v-icon>mdi-account</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item
              :to="'/profile'"
          >
            <v-list-item-title>Profile</v-list-item-title>
          </v-list-item>
          <v-list-item @click="logout">
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </template>
  </v-app-bar>
</template>