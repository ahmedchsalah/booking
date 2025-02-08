<template>
  <div class="profile-background min-h-screen py-8">
    <v-container>
      <v-row justify="center">
        <v-col cols="12" md="8" lg="6">
          <v-card class="profile-card">
            <div class="profile-header pa-6 text-center">
              <v-avatar size="120" color="primary">
                <v-icon size="64" color="white">mdi-account-circle</v-icon>
              </v-avatar>
              <h1 class="text-h4 mt-4 text-white">{{ fullName }}</h1>
              <p class="text-subtitle-1 text-white-darken-1">{{ userData.email }}</p>
            </div>

            <v-card-text>
              <v-row>
                <v-col cols="12">
                  <h2 class="text-h5 mb-4">Profile Information</h2>
                  <v-list>
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon color="primary">mdi-account</v-icon>
                      </template>
                      <v-list-item-title>First Name</v-list-item-title>
                      <v-list-item-subtitle>{{ userData.nom }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon color="primary">mdi-account</v-icon>
                      </template>
                      <v-list-item-title>Last Name</v-list-item-title>
                      <v-list-item-subtitle>{{ userData.prenom }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon color="primary">mdi-email</v-icon>
                      </template>
                      <v-list-item-title>Email</v-list-item-title>
                      <v-list-item-subtitle>{{ userData.email }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon color="primary">mdi-shield-account</v-icon>
                      </template>
                      <v-list-item-title>Role</v-list-item-title>
                      <v-list-item-subtitle>{{ userData.role }}</v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-col>
              </v-row>

              <v-divider class="my-4"></v-divider>

              <v-row>
                <v-col cols="12">
                  <h2 class="text-h5 mb-4">Update Profile</h2>
                  <v-form @submit.prevent="updateProfile" ref="form">
                    <v-text-field
                        v-model="updateForm.nom"
                        label="First Name"
                        variant="outlined"
                    ></v-text-field>
                    <v-text-field
                        v-model="updateForm.prenom"
                        label="Last Name"
                        variant="outlined"
                    ></v-text-field>
                    <v-text-field
                        v-model="updateForm.email"
                        label="Email"
                        variant="outlined"
                        type="email"
                        :rules="[v => !v || /.+@.+\..+/.test(v) || 'Email must be valid']"
                    ></v-text-field>
                    <v-text-field
                        v-model="updateForm.password"
                        label="New Password (leave empty to keep current)"
                        variant="outlined"
                        type="password"
                        :rules="[v => !v || v.length >= 6 || 'Password must be at least 6 characters']"
                    ></v-text-field>

                    <div class="d-flex gap-4 mt-4">
                      <v-btn
                        color="primary"
                        type="submit"
                        block
                        :loading="loading"
                      >
                        Update Profile
                      </v-btn>
                      <v-btn
                        color="error"
                        variant="outlined"
                        block
                        @click="logout"
                      >
                        Logout
                      </v-btn>
                    </div>
                  </v-form>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from "vue-toastification";
import axios from 'axios';

const router = useRouter();
const toast = useToast();
const form = ref(null);
const loading = ref(false);

const userData = ref({
  nom: '',
  prenom: '',
  email: '',
  role: ''
});

const updateForm = ref({
  nom: '',
  prenom: '',
  email: '',
  password: ''
});

const fullName = computed(() => {
  return `${userData.value.nom} ${userData.value.prenom}`;
});

const loadUserData = () => {
  const userString = localStorage.getItem('user');
  if (!userString) {
    router.push('/login');
    return;
  }
  const user = JSON.parse(userString);
  userData.value = user;
  updateForm.value.nom = user.nom;
  updateForm.value.prenom = user.prenom;
  updateForm.value.email = user.email;
};

const updateProfile = async () => {
  if (!form.value.validate()) return;

  loading.value = true;
  try {
    const token = localStorage.getItem('token');
    const updateData = {};

    if (updateForm.value.nom !== userData.value.nom) {
      updateData.nom = updateForm.value.nom;
    }
    if (updateForm.value.prenom !== userData.value.prenom) {
      updateData.prenom = updateForm.value.prenom;
    }
    if (updateForm.value.email !== userData.value.email) {
      updateData.email = updateForm.value.email;
    }
    if (updateForm.value.password) {
      updateData.password = updateForm.value.password;
    }

    const response = await axios.put(
        'http://localhost:3000/auth/profile',
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
    );

    userData.value = response.data.user;
    localStorage.setItem('user', JSON.stringify(response.data.user));
    toast.success(response.data.message);
    updateForm.value.password = '';
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to update profile');
  } finally {
    loading.value = false;
  }
};


const logout = () => {
  localStorage.clear();
  router.push('/');
  toast.success('Logged out successfully');
};

onMounted(() => {
  loadUserData();
});
</script>

<style scoped>
.profile-background {
  background: linear-gradient(135deg, rgba(34,93,195,1) 0%, rgba(49,20,133,1) 100%);
}

.profile-card {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.profile-header {
  background: linear-gradient(45deg, rgba(34,93,195,0.95) 0%, rgba(49,20,133,0.95) 100%);
  border-radius: 16px 16px 0 0;
}
</style>
