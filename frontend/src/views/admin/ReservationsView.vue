<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useToast } from 'vue-toastification';

const toast = useToast();
const reservations = ref([]);
const loading = ref(true);
const search = ref('');

const headers = [
  { title: 'Hotel', key: 'hotel.nom', sortable: true, align: 'start' },
  { title: 'Location', key: 'hotel.location', sortable: true },
  { title: 'City', key: 'hotel.ville', sortable: true },
  { title: 'Guest Email', key: 'user.email', sortable: true },
  { title: 'Check-in', key: 'date_debut', sortable: true },
  { title: 'Check-out', key: 'date_fin', sortable: true },
  { title: 'Total Price', key: 'prix_total', sortable: true },
  { title: 'Created At', key: 'creeLe', sortable: true },
];

const fetchReservations = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:3000/reservations', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    reservations.value = response.data.data;
  } catch (error) {
    if (error.response?.status === 401) {
      toast.error('Unauthorized access');
    } else if (error.response?.status === 403) {
      toast.error('Access forbidden - Admin rights required');
    } else {
      toast.error('Failed to fetch reservations');
    }
  } finally {
    loading.value = false;
  }
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
};

onMounted(() => {
  fetchReservations();
});
</script>

<template>
  <v-container class="reservations-container">
    <v-card class="custom-card">
      <v-card-title class="d-flex align-center py-4 px-4 custom-header">
        <h2 class="text-h4 font-weight-bold text-primary">
          <v-icon large color="primary" class="mr-2">mdi-calendar-check</v-icon>
          Reservations Management
        </h2>
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search reservations..."
          single-line
          hide-details
          density="compact"
          class="search-field"
          bg-color="grey-lighten-4"
        ></v-text-field>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="reservations"
        :loading="loading"
        :search="search"
        class="custom-table"
        hover
      >
        <template v-slot:item.date_debut="{ item }">
          <span class="date-cell">{{ formatDate(item.date_debut) }}</span>
        </template>

        <template v-slot:item.date_fin="{ item }">
          <span class="date-cell">{{ formatDate(item.date_fin) }}</span>
        </template>

        <template v-slot:item.prix_total="{ item }">
          <span class="price-cell">{{ formatPrice(item.prix_total) }}</span>
        </template>

        <template v-slot:item.creeLe="{ item }">
          <span class="date-cell">{{ formatDate(item.creeLe) }}</span>
        </template>

        <template v-slot:no-data>
          <div class="empty-state">
            <v-icon size="40" color="grey">mdi-calendar-blank</v-icon>
            <p>No reservations found</p>
          </div>
        </template>

        <template v-slot:loading>
          <div class="loading-state">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
            <p>Loading reservations...</p>
          </div>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<style scoped>
.reservations-container {
  padding: 24px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.custom-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

.custom-header {
  background-color: white;
  border-bottom: 2px solid #f0f0f0;
}

.search-field {
  max-width: 300px;
  margin-left: 16px;
}

.custom-table {
  padding: 16px;
}

.date-cell {
  color: #666;
  font-weight: 500;
}

.price-cell {
  color: #2196F3;
  font-weight: 600;
}

.empty-state, .loading-state {
  text-align: center;
  padding: 40px;
  color: #666;
}

.empty-state p, .loading-state p {
  margin-top: 16px;
  font-size: 16px;
}

:deep(.v-data-table) {
  background: white;
}

:deep(.v-data-table-header) {
  background-color: #f8f9fa;
}

:deep(.v-data-table-header th) {
  font-weight: 600 !important;
  text-transform: uppercase;
  font-size: 0.875rem;
  letter-spacing: 0.5px;
}

:deep(.v-data-table-row:hover) {
  background-color: #f5f9ff !important;
}
</style>