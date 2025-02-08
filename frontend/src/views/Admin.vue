<template>
  <div class="admin-dashboard">
    <!-- Sidebar -->
    <v-navigation-drawer
        permanent
        class="sidebar"
        color="blue-grey darken-4"
        app
    >
      <v-list dense>
        <!-- Sidebar Navigation Links -->
        <v-list-item
            v-for="item in navigationLinks"
            :key="item.text"
            :to="item.route"
            class="sidebar-item"
            link
            :class="{ active: $route.path === item.route }"
        >
        <v-icon class="sidebar-icon">{{ item.icon }}</v-icon>
        <span class="sidebar-text">{{ item.text }}</span>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Main Content -->
    <div class="dashboard-content">
      <v-container fluid>
        <router-view/> <!-- Load dynamic admin components here -->
      </v-container>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // Sidebar Navigation Links
      navigationLinks: [
        {text: "Main", route: "/admin", icon: "mdi-home-analytics"},
        {text: "Hotels", route: "/admin/hotels", icon: "mdi-domain"},
        {text: "Users", route: "/admin/users", icon: "mdi-account-group"},
        {text: "Reservations", route: "/admin/reservations", icon: "mdi-calendar-check"},
      ],
    };
  },
};
</script>

<style scoped>
/* Admin Dashboard Layout */
.admin-dashboard {
  display: flex;
  height: 100vh;
  background-color: #f4f5f7;
}

.sidebar {
  width: 240px;
  border-right: 2px solid #76c2e8;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  color: white;
}

.sidebar-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  color: #e0e0e0;
  transition: background-color 0.2s, color 0.2s;
}

.sidebar-item:hover {
  background-color: #455a64;
  color: white;
}

.sidebar-item.active { /* Style for active link */
  background-color: #37474f; /* Highlight the active link */
  color: #ffffff;
  font-weight: bold;
}

.sidebar-icon {
  margin-right: 12px;
  color: #b0bec5;
}

.sidebar-text {
  font-weight: 500;
}

.dashboard-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  background-color: white;
  border-radius: 8px;
}

.dashboard-content h1 {
  font-size: 24px;
  margin-bottom: 16px;
}
</style>
