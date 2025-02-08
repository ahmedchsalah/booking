<template>
  <div class="animated-background">
    <v-container fluid>
      <!-- Hero Section -->
      <div class="hero-section mb-8">
        <div class="h-[400px] flex items-center justify-center">
          <div class="text-center text-white z-10">
            <h1 class="text-5xl font-bold mb-4">Find Your Perfect Stay</h1>
            <p class="text-xl mb-6">Discover amazing hotels and book your next adventure</p>
          </div>
        </div>
      </div>

      <!-- Hotels Grid Section -->
      <v-container>
        <!-- Search and Filter Bar -->
        <v-row class="mb-6">
          <v-col cols="12" md="4">
            <v-text-field
                v-model="searchQuery"
                prepend-inner-icon="mdi-magnify"
                label="Search hotels by name or location"
                variant="outlined"
                density="comfortable"
                bg-color="white"
                class="search-field"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="2">
            <v-text-field
                v-model="minPrice"
                type="number"
                label="Min Price"
                variant="outlined"
                density="comfortable"
                bg-color="white"
                class="filter-field"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="2">
            <v-text-field
                v-model="maxPrice"
                type="number"
                label="Max Price"
                variant="outlined"
                density="comfortable"
                bg-color="white"
                class="filter-field"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="2">
            <v-select
                v-model="availabilityFilter"
                :items="['All', 'Available Only']"
                label="Availability"
                variant="outlined"
                density="comfortable"
                bg-color="white"
                class="filter-field"
            ></v-select>
          </v-col>
        </v-row>

        <!-- Hotels Grid -->
        <v-row>
          <v-col v-for="hotel in filteredHotels" :key="hotel.id" cols="12" md="4" lg="4">
            <v-card class="hotel-card d-flex flex-column">
              <v-carousel
                  v-if="hotel.images && hotel.images.length > 0"
                  height="200"
                  hide-delimiters
                  show-arrows="hover"
                  class="flex-shrink-0"
              >
                <v-carousel-item
                    v-for="image in hotel.images"
                    :key="image.id"
                    :src="`http://localhost:3000${image.imageUrl}`"
                    cover
                ></v-carousel-item>
              </v-carousel>
              <v-img
                  v-else
                  src="https://via.placeholder.com/300x200?text=No+Image"
                  height="200"
                  cover
                  class="flex-shrink-0"
              ></v-img>

              <v-card-title class="text-h6 text-truncate py-4 flex-shrink-0 hotel-title">
                {{ hotel.nom }}
              </v-card-title>

              <v-card-text class="flex-grow-1 d-flex flex-column hotel-content">
                <div class="mt-2">
                  <div class="flex items-center gap-2 mb-2 flex-shrink-0">
                    <v-icon color="primary">mdi-map-marker</v-icon>
                    <span class="text-gray-600">{{ hotel.location }}</span>
                  </div>
                  <div class="description-container">
                    <p class="text-gray-700 mb-2 description-text">
                      {{ hotel.description }}
                    </p>
                  </div>
                  <div class="flex justify-between items-center mt-auto flex-shrink-0">
                    <p class="font-bold text-primary">${{ parseInt(hotel.prix_par_nuit) }} / night</p>
                    <p class="text-sm text-gray-600">
                      Available: {{ getAvailableRooms(hotel) }} / {{ parseInt(hotel.tot_chambres) }} rooms
                    </p>
                  </div>
                </div>
              </v-card-text>

              <v-card-actions class="flex-shrink-0 pa-4">
                <v-btn
                    color="primary"
                    variant="elevated"
                    block
                    @click="makeReservation(hotel)"
                    :disabled="getAvailableRooms(hotel) <= 0 || isAdmin()"
                >
                  {{ getAvailableRooms(hotel) <= 0 ? 'Fully Booked' :
                     isAdmin() ? 'Admin Cannot Book' : 'Book Now' }}
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-container>

    <!-- Add Reservation Dialog -->
    <AddReservation
        v-model="showReservationDialog"
        :hotel-id="selectedHotel?.id"
        :hotel-details="selectedHotel"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useToast } from "vue-toastification";
import AddReservation from '@/components/reservation/AddReservation.vue';

const router = useRouter();
const toast = useToast();

const hotels = ref([]);
const searchQuery = ref('');
const minPrice = ref('');
const maxPrice = ref('');
const availabilityFilter = ref('All');
const showReservationDialog = ref(false);
const selectedHotel = ref(null);

const getAvailableRooms = (hotel) => {
  return parseInt(hotel.tot_chambres) - parseInt(hotel.res_chambres);
};

const isAdmin = () => {
  const userString = localStorage.getItem('user');
  if (!userString) return false;
  const userData = JSON.parse(userString);
  return userData.role === 'admin';
};

const filteredHotels = computed(() => {
  return hotels.value.filter(hotel => {
    const price = parseInt(hotel.prix_par_nuit);
    const hasAvailableRooms = getAvailableRooms(hotel) > 0;

    const matchesSearch = hotel.nom.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        hotel.location.toLowerCase().includes(searchQuery.value.toLowerCase());

    const matchesPrice = (!minPrice.value || price >= parseInt(minPrice.value)) &&
        (!maxPrice.value || price <= parseInt(maxPrice.value));

    const matchesAvailability = availabilityFilter.value === 'All' ||
        (availabilityFilter.value === 'Available Only' && hasAvailableRooms);

    return matchesSearch && matchesPrice && matchesAvailability;
  });
});

const fetchHotels = async () => {
  try {
    const response = await axios.get('http://localhost:3000/hotels');
    hotels.value = response.data;
  } catch (error) {
    toast.error('Failed to load hotels');
    console.error('Error fetching hotels:', error);
  }
};

const makeReservation = (hotel) => {
  const token = localStorage.getItem('token');
  if (!token) {
    toast.info('Please login to make a reservation');
    router.push('/login');
    return;
  }
  if (isAdmin()) {
    toast.info('Administrators cannot make reservations');
    return;
  }
  selectedHotel.value = hotel;
  showReservationDialog.value = true;
};

onMounted(() => {
  fetchHotels();
});
</script>

<style scoped>
.animated-background {
  min-height: 100vh;
  background: linear-gradient(0deg, rgba(34,93,195,1) 0%, rgba(49,20,133,1) 100%);
  background-size: 200% 200%;
  animation: gradient 15s ease infinite;
}

@keyframes gradient {
  0% {
    background-position: 50% 0%;
  }
  50% {
    background-position: 50% 100%;
  }
  100% {
    background-position: 50% 0%;
  }
}

.search-field,
.filter-field {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.search-field :deep(.v-field__outline),
.filter-field :deep(.v-field__outline) {
  --v-field-border-opacity: 0.1;
}

.search-field :deep(.v-field__input),
.filter-field :deep(.v-field__input) {
  background-color: white !important;
}

.search-field :deep(.v-label),
.filter-field :deep(.v-label) {
  background-color: white;
  padding: 0 4px;
  margin-top: -8px;
}

.hotel-card {
  height: 580px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin: 0 auto;
  max-width: 450px;
}

.hotel-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
}

.hotel-title {
  height: 72px;
  overflow: hidden;
}

.hotel-content {
  height: 200px;
  overflow: hidden;
}

.description-container {
  height: 100px;
  overflow-y: auto;
  margin-bottom: 1rem;
}

.description-text {
  scrollbar-width: thin;
  scrollbar-color: rgba(155, 155, 155, 0.5) transparent;
}

.description-text::-webkit-scrollbar {
  width: 6px;
}

.description-text::-webkit-scrollbar-track {
  background: transparent;
}

.description-text::-webkit-scrollbar-thumb {
  background-color: rgba(155, 155, 155, 0.5);
  border-radius: 3px;
}
</style>
