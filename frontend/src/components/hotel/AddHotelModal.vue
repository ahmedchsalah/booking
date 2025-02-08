<script setup>
import { ref } from 'vue';
import { useToast } from 'vue-toastification';
import axios from 'axios';

const toast = useToast();
const props = defineProps({
  isModalOpen: Boolean, // Modal visibility passed as a prop
});

const emit = defineEmits(['hotel-added', 'update-modal']); // Emit event to close the modal

const form = ref({
  nom: '',
  location: '',
  ville: '',
  description: '',
  prix_par_nuit: null,
  tot_chambres: null,
  res_chambres: null,
  images: [],
});
const resetForm = () => {
  form.value = {
    nom: '',
    location: '',
    ville: '',
    description: '',
    prix_par_nuit: null,
    tot_chambres: null,
    res_chambres: null,
    images: [],
  };
};


const validateForm = () => {
  if (!form.value.nom || !form.value.location || !form.value.ville || !form.value.description ||
      !form.value.prix_par_nuit || !form.value.tot_chambres || !form.value.res_chambres) {
    toast.error('Please fill in all required fields.');
    return false;
  }

  if (form.value.prix_par_nuit <= 0 || form.value.tot_chambres <= 0 || form.value.res_chambres <= 0) {
    toast.error('Price per night and room counts must be positive numbers.');
    return false;
  }

  if (form.value.images.length === 0) {
    toast.error('Please upload at least one image.');
    return false;
  }

  for (let image of form.value.images) {
    if (!image.type.startsWith('image/')) {
      toast.error('Only image files are allowed.');
      return false;
    }
  }

  return true;
};

const submitHotel = async () => {
  if (!validateForm()) {
    return;
  }

  try {
    const formData = new FormData();
    formData.append('nom', form.value.nom);
    formData.append('location', form.value.location);
    formData.append('ville', form.value.ville);
    formData.append('description', form.value.description);
    formData.append('prix_par_nuit', form.value.prix_par_nuit.toString());
    formData.append('tot_chambres', form.value.tot_chambres.toString());
    formData.append('res_chambres', form.value.res_chambres.toString());

    if (form.value.images.length > 0) {
      form.value.images.forEach(image => {
        formData.append('images', image);
      });
    }

    const response = await axios.post('http://localhost:3000/hotels', formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    toast.success('Hotel added successfully!');
    resetForm();
    emit('hotel-added'); // Emit event to parent component
  } catch (error) {
    console.error('Error submitting hotel:', error);
    toast.error('Failed to add hotel.');
  }
};

// Close modal when cancel button is clicked
const closeModal = () => {
  emit('update-modal', false); // Emit event to update modal visibility
};
</script>

<template>
  <v-dialog v-model="props.isModalOpen" max-width="500px">
    <v-card>
      <v-card-title>
        <span class="text-h6">Add New Hotel</span>
      </v-card-title>
      <v-card-text>
        <v-form>
          <v-text-field label="Hotel Name" v-model="form.nom" required></v-text-field>
          <v-text-field label="Location" v-model="form.location" required></v-text-field>
          <v-text-field label="City" v-model="form.ville" required></v-text-field>
          <v-textarea label="Description" v-model="form.description" rows="3" required></v-textarea>
          <v-text-field label="Price Per Night" type="number" v-model="form.prix_par_nuit" required></v-text-field>
          <v-text-field label="Total Rooms" type="number" v-model="form.tot_chambres" required></v-text-field>
          <v-text-field label="Available Rooms" type="number" v-model="form.res_chambres" required></v-text-field>
          <v-file-input label="Upload Images" accept="image/*" multiple v-model="form.images"></v-file-input>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="submitHotel">Submit</v-btn>
        <v-btn text @click="closeModal">Cancel</v-btn> <!-- Close the modal here -->
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.v-file-input {
  margin-top: 10px;
}
</style>
