<template>
  <div class="animated-background">
    <v-container class="py-8">
      <h1 class="text-h4 mb-6 text-white">My Reservations</h1>

      <v-row v-if="loading">
        <v-col cols="12" class="text-center">
          <v-progress-circular indeterminate color="white"></v-progress-circular>
        </v-col>
      </v-row>

      <v-row v-else>
        <v-col v-for="reservation in reservations" :key="reservation.id" cols="12" md="6" lg="4">
          <v-card class="reservation-card">
            <v-card-title class="d-flex justify-space-between align-center">
              {{ reservation.hotel.nom }}
              <v-chip
                  :color="getStatusColor(reservation)"
                  class="ml-2"
              >
                {{ getReservationStatus(reservation) }}
              </v-chip>
            </v-card-title>

            <v-card-text>
              <div class="my-2 d-flex align-center">
                <v-icon color="primary" class="mr-2">mdi-map-marker</v-icon>
                {{ reservation.hotel.location }}
              </div>

              <div class="my-4">
                <div class="d-flex align-center mb-2">
                  <v-icon color="primary" class="mr-2">mdi-calendar-start</v-icon>
                  Check-in: {{ formatDate(reservation.date_debut) }}
                </div>
                <div class="d-flex align-center">
                  <v-icon color="primary" class="mr-2">mdi-calendar-end</v-icon>
                  Check-out: {{ formatDate(reservation.date_fin) }}
                </div>
              </div>

              <div class="font-weight-bold">
                Total Price: ${{ reservation.prix_total }}
              </div>
            </v-card-text>

            <v-card-actions>
              <v-btn
                  color="primary"
                  variant="text"
                  @click="openUpdateDialog(reservation)"
                  :disabled="getReservationStatus(reservation) === 'Completed'"
              >
                Update
              </v-btn>
              <v-btn
                  color="error"
                  variant="text"
                  @click="openDeleteDialog(reservation.id)"
                  :disabled="getReservationStatus(reservation) === 'Completed'"
              >
                Cancel
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>

        <v-col v-if="!loading && reservations.length === 0" cols="12">
          <v-alert
              type="info"
              text="You don't have any reservations yet."
              class="bg-white"
          ></v-alert>
        </v-col>
      </v-row>
    </v-container>

    <!-- Update Reservation Dialog -->
    <v-dialog v-model="showUpdateDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5 bg-primary text-white">
          Update Reservation
        </v-card-title>

        <v-card-text class="pt-4">
          <v-form @submit.prevent="updateReservation">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                    v-model="updateForm.date_debut"
                    type="date"
                    label="Check-in Date"
                    :min="minDate"
                    required
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                    v-model="updateForm.date_fin"
                    type="date"
                    label="Check-out Date"
                    :min="updateForm.date_debut || minDate"
                    required
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="pb-4 px-4">
          <v-spacer></v-spacer>
          <v-btn color="error" variant="text" @click="showUpdateDialog = false">Cancel</v-btn>
          <v-btn
              color="primary"
              :loading="updating"
              @click="updateReservation"
          >
            Update Reservation
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h5">
          Confirm Cancellation
        </v-card-title>
        <v-card-text>
          Are you sure you want to cancel this reservation? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="showDeleteDialog = false">No, Keep it</v-btn>
          <v-btn
              color="error"
              variant="elevated"
              :loading="cancelling === reservationToDelete"
              @click="confirmDelete"
          >
            Yes, Cancel it
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { useToast } from "vue-toastification";

const toast = useToast();
const reservations = ref([]);
const cancelling = ref(null);
const updating = ref(false);
const loading = ref(true);
const showUpdateDialog = ref(false);
const showDeleteDialog = ref(false);
const selectedReservation = ref(null);
const reservationToDelete = ref(null);
const updateForm = ref({
  date_debut: '',
  date_fin: ''
});

const minDate = computed(() => {
  const today = new Date();
  return today.toISOString().split('T')[0];
});

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const getReservationStatus = (reservation) => {
  const now = new Date();
  const checkIn = new Date(reservation.date_debut);
  const checkOut = new Date(reservation.date_fin);

  if (now > checkOut) return 'Completed';
  if (now < checkIn) return 'Upcoming';
  return 'Active';
};

const getStatusColor = (reservation) => {
  const status = getReservationStatus(reservation);
  switch (status) {
    case 'Completed': return 'gray';
    case 'Active': return 'success';
    case 'Upcoming': return 'primary';
    default: return 'gray';
  }
};

const fetchReservations = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:3000/reservations/my-reservations', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    reservations.value = response.data.data;
  } catch (error) {
    toast.error('Failed to load reservations');
  } finally {
    loading.value = false;
  }
};

const openDeleteDialog = (id) => {
  reservationToDelete.value = id;
  showDeleteDialog.value = true;
};

const confirmDelete = async () => {
  await cancelReservation(reservationToDelete.value);
  showDeleteDialog.value = false;
  reservationToDelete.value = null;
};

const cancelReservation = async (id) => {
  try {
    cancelling.value = id;
    const token = localStorage.getItem('token');
    await axios.delete(`http://localhost:3000/reservations/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    toast.success('Reservation cancelled successfully');
    await fetchReservations();
  } catch (error) {
    toast.error('Failed to cancel reservation');
  } finally {
    cancelling.value = null;
  }
};

const openUpdateDialog = (reservation) => {
  selectedReservation.value = reservation;
  updateForm.value = {
    date_debut: reservation.date_debut.split('T')[0],
    date_fin: reservation.date_fin.split('T')[0]
  };
  showUpdateDialog.value = true;
};

const updateReservation = async () => {
  if (!updateForm.value.date_debut || !updateForm.value.date_fin) {
    toast.error('Please fill in all required fields');
    return;
  }

  updating.value = true;
  try {
    const token = localStorage.getItem('token');
    await axios.put(
        `http://localhost:3000/reservations/${selectedReservation.value.id}`,
        updateForm.value,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
    );

    toast.success('Reservation updated successfully');
    showUpdateDialog.value = false;
    await fetchReservations();
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to update reservation');
  } finally {
    updating.value = false;
  }
};

onMounted(() => {
  fetchReservations();
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

.reservation-card {
  transition: transform 0.2s;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
}

.reservation-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.2);
}
</style>
