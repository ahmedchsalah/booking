<template>
  <v-app>
    <!-- Appbar always at the top -->
    <Appbar />

    <!-- Main content -->
    <v-main>
      <router-view v-slot="{ Component }">
        <component
            :is="Component"
            @login-success="handleLoginSuccess"
        />
      </router-view>
    </v-main>
  </v-app>
</template>

<script setup>
import { userStore } from '@/stores/userStore';
import Appbar from "@/components/Appbar.vue";

// Handle login success event from child components
const handleLoginSuccess = (userData) => {
  // Use the userStore login method
  userStore.login(userData.user, userData.token);
};
</script>

<style>
/* Ensure body fills the viewport */
html,
body,
#app {
  margin: 0;
  height: 100%;
}
</style>