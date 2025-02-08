<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useToast } from 'vue-toastification';
import AddHotelModal from '../../components/hotel/AddHotelModal.vue';
import UpdateHotelModal from '../../components/hotel/UpdateHotelModal.vue';

const toast = useToast();
const hotels = ref([]);
const isModalOpen = ref(false);
const isUpdateModalOpen = ref(false);
const hotelToUpdate = ref(null);

const fetchHotels = async () => {
  try {
    const response = await axios.get('http://localhost:3000/hotels', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    hotels.value = response.data;
  } catch (error) {
    console.error('Error fetching hotels:', error);
    toast.error('Failed to fetch hotels.');
  }
};

onMounted(() => {
  fetchHotels();
});

const handleHotelAdded = () => {
  fetchHotels();
  isModalOpen.value = false;
};

const handleHotelUpdate = (hotel) => {
  hotelToUpdate.value = hotel;
  isUpdateModalOpen.value = true;
};

const handleUpdateModalClose = () => {
  isUpdateModalOpen.value = false;
  hotelToUpdate.value = null;
  fetchHotels();
};

const handleHotelDelete = async (hotelId) => {
  if (confirm('Are you sure you want to delete this hotel?')) {
    try {
      await axios.delete(`http://localhost:3000/hotels/${hotelId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      toast.success('Hotel deleted successfully!');
      fetchHotels();
    } catch (error) {
      console.error('Error deleting hotel:', error);
      toast.error('Failed to delete hotel.');
    }
  }
};

const updateModalVisibility = (value) => {
  isModalOpen.value = value;
};
</script>

<template>
  <v-container>
    <div class="d-flex justify-space-between align-center mb-4">
      <h1 class="text-center">Hotel Listings</h1>
      <v-btn color="primary" @click="isModalOpen = true">Add Hotel</v-btn>
    </div>

    <v-row>
      <v-col v-for="hotel in hotels" :key="hotel.id" cols="12" md="4">
        <v-card class="mb-4 hotel-card" elevation="2">
          <!-- Image section only - with v-if/v-else -->
          <div class="image-section">
            <v-carousel v-if="hotel.images && hotel.images.length > 0" :show-arrows="hotel.images.length > 1" show-arrows-on-hover="true" cycle class="carousel-custom">
              <v-carousel-item v-for="(image, index) in hotel.images" :key="index">
                <v-img :src="'http://localhost:3000' + image.imageUrl" alt="Hotel Image" height="200px" width="100%" contain></v-img>
              </v-carousel-item>
            </v-carousel>

            <v-img v-else src="https://placehold.co/600x400?text=No+Image" alt="No image available" height="200px" width="100%">
              <template #placeholder>
                <v-icon color="grey" size="100">mdi-image-off</v-icon>
              </template>
            </v-img>
          </div>

          <!-- Card content - outside v-if/v-else -->
          <v-card-title>
            <span class="text-h6">{{ hotel.nom }}</span>
          </v-card-title>
          <v-card-subtitle>{{ hotel.location }}</v-card-subtitle>

          <v-card-text>
            <div><strong>Description:</strong> {{ hotel.description }}</div>
            <div><strong>Price:</strong> ${{ hotel.prix_par_nuit }} / Night</div>
            <div><strong>Available Rooms:</strong> {{ Math.round(hotel.res_chambres) }}</div>
          </v-card-text>

          <!-- Buttons - outside v-if/v-else -->
          <v-card-actions>
            <v-btn color="primary" @click="handleHotelUpdate(hotel)">Update</v-btn>
            <v-btn color="error" @click="handleHotelDelete(hotel.id)">Delete</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Add Hotel Modal -->
    <AddHotelModal
        :isModalOpen="isModalOpen"
        :hotel="hotelToUpdate"
        @hotel-added="handleHotelAdded"
        @update-modal="updateModalVisibility"
    />

    <!-- Update Hotel Modal -->
    <UpdateHotelModal
        v-if="hotelToUpdate"
        :isModalOpen="isUpdateModalOpen"
        :hotel="hotelToUpdate"
        :closeModal="handleUpdateModalClose"
    />
  </v-container>
</template>

<style scoped>
h1 {
  font-size: 2rem;
  margin-bottom: 32px;
  color: #424242;
}

.v-card {
  border-radius: 10px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  display: flex;
  flex-direction: column;
  height: 400px;
}

.v-card:hover {
  transform: translateY(-5px);
  box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.2);
}

.v-carousel-item,
.v-img {
  height: 200px !important;
  width: 100%;
}

.v-carousel__prev,
.v-carousel__next {
  background-color: rgba(0, 0, 0, 0.5) !important;
  color: white !important;
  width: 40px !important;
  height: 40px !important;
}

.image-section {
  height: 200px;
  overflow: hidden;
}
</style>