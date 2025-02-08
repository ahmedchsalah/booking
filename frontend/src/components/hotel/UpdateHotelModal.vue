<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useToast } from 'vue-toastification';
import { defineProps } from 'vue';

const toast = useToast();
const props = defineProps({
  hotel: Object,
  isModalOpen: Boolean,
  closeModal: Function,
});
const form = ref({
  nom: props.hotel.nom,
  location: props.hotel.location,
  ville: props.hotel.ville,
  description: props.hotel.description,
  prix_par_nuit: props.hotel.prix_par_nuit,
  tot_chambres: props.hotel.tot_chambres,
  res_chambres: props.hotel.res_chambres,
  images: [], // Store new images
});
const existingImages = ref(props.hotel.images); // Store existing images

const validateForm = () => {
  if (!form.value.nom || !form.value.location || !form.value.ville || !form.value.description ||
      !form.value.prix_par_nuit || !form.value.tot_chambres || !form.value.res_chambres) {
    toast.error('Please fill in all required fields.');
    return false;
  }
  return true;
};

const submitHotelUpdate = async () => {
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

    // Add existing images that weren't removed
    existingImages.value.forEach(image => {
      formData.append('existingImages', image.id);
    });
    console.log(existingImages);

    // Add new images if any
    if (form.value.images.length > 0) {
      form.value.images.forEach(image => {
        formData.append('images', image);
      });
    }

    const response = await axios.put(`http://localhost:3000/hotels/${props.hotel.id}`, formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    toast.success('Hotel updated successfully!');
    props.closeModal();
  } catch (error) {
    console.error('Error updating hotel:', error);
    toast.error('Failed to update hotel.');
  }
};

const removeImage = (imageId) => {
  existingImages.value = existingImages.value.filter(image => image.id !== imageId); // Remove image from the array
};

</script>

<template>
  <v-dialog v-model="props.isModalOpen" max-width="600px">
    <v-card>
      <v-card-title>
        <span class="text-h6">Update Hotel</span>
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

          <!-- Display existing images with delete option -->
          <div v-if="existingImages.length > 0">
            <h3>Existing Images:</h3>
            <v-row>
              <v-col v-for="(image, index) in existingImages" :key="index" cols="12" md="4">
                <v-img :src="'http://localhost:3000' + image.imageUrl" alt="Hotel Image" height="100px" />
                <v-btn small color="red" @click="removeImage(image.id)">Remove</v-btn>
              </v-col>
            </v-row>
          </div>

          <v-file-input label="Upload New Images" accept="image/*" multiple v-model="form.images"></v-file-input>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" @click="submitHotelUpdate">Submit</v-btn>
        <v-btn text @click="props.closeModal">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
