<template>
  <v-dialog v-model="dialog" max-width="500px">
    <v-card>
      <v-card-title class="text-h5 bg-primary text-white">
        Make a Reservation
      </v-card-title>

      <v-card-text class="pt-4">
        <v-form @submit.prevent="submitReservation">
          <v-row>
            <v-col cols="12">
              <p class="font-bold mb-2">{{ hotelDetails?.nom }}</p>
              <p class="text-gray-600 mb-4">${{ parseInt(hotelDetails?.prix_par_nuit) }} / night</p>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                  v-model="reservation.date_debut"
                  type="date"
                  label="Check-in Date"
                  :min="minDate"
                  :rules="[v => !!v || 'Check-in date is required']"
                  required
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                  v-model="reservation.date_fin"
                  type="date"
                  label="Check-out Date"
                  :min="reservation.date_debut || minDate"
                  :rules="[v => !!v || 'Check-out date is required']"
                  required
              ></v-text-field>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions class="pb-4 px-4">
        <v-spacer></v-spacer>
        <v-btn color="error" variant="text" @click="closeDialog">Cancel</v-btn>
        <v-btn
            color="primary"
            :loading="loading"
            @click="submitReservation"
        >
          Confirm Reservation
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue';
import axios from 'axios';
import { useToast } from "vue-toastification";

const props = defineProps({
  modelValue: Boolean,
  hotelId: Number,
  hotelDetails: Object
});

const emit = defineEmits(['update:modelValue']);

const toast = useToast();
const loading = ref(false);
const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const minDate = computed(() => {
  const today = new Date();
  return today.toISOString().split('T')[0];
});

const reservation = ref({
  hotelId: props.hotelId,
  date_debut: '',
  date_fin: ''
});

const closeDialog = () => {
  dialog.value = false;
  reservation.value = {
    hotelId: props.hotelId,
    date_debut: '',
    date_fin: ''
  };
};

const submitReservation = async () => {
  if (!reservation.value.date_debut || !reservation.value.date_fin) {
    toast.error('Please fill in all required fields');
    return;
  }

  loading.value = true;
  try {
    const token = localStorage.getItem('token');
    await axios.post('http://localhost:3000/reservations',
        {
          hotelId: props.hotelId,
          date_debut: reservation.value.date_debut,
          date_fin: reservation.value.date_fin
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
    );

    toast.success('Reservation created successfully!');
    closeDialog();
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to create reservation');
  } finally {
    loading.value = false;
  }
};
</script>
