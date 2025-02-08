<template>
  <v-dialog v-model="localDialog" max-width="500px" persistent>
    <v-card>
      <v-card-title>
        <span class="text-h5">Update User</span>
      </v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid" @submit.prevent="updateUser">
          <v-text-field
              v-model="editedUser.nom"
              label="Last Name"
              :rules="[rules.required]"
              required
              autocomplete="family-name"
          ></v-text-field>
          <v-text-field
              v-model="editedUser.prenom"
              label="First Name"
              :rules="[rules.required]"
              required
              autocomplete="given-name"
          ></v-text-field>
          <v-text-field
              v-model="editedUser.email"
              label="Email"
              :rules="[rules.required, rules.email]"
              required
              autocomplete="email"
          ></v-text-field>
          <v-text-field
              v-model="editedUser.mdp"
              label="New Password (leave empty to keep current)"
              :rules="editedUser.mdp ? [rules.password] : []"
              type="password"
              autocomplete="new-password"
          ></v-text-field>
          <v-select
              v-model="editedUser.role"
              :items="roles"
              label="Role"
              :rules="[rules.required]"
              required
          ></v-select>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
            color="error"
            text
            @click="closeDialog"
            :disabled="loading"
        >
          Cancel
        </v-btn>
        <v-btn
            color="success"
            text
            @click="updateUser"
            :loading="loading"
            :disabled="!valid"
        >
          Update
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import axios from 'axios';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  user: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update:modelValue', 'user-updated']);

const form = ref(null);
const valid = ref(false);
const loading = ref(false);
const localDialog = ref(props.modelValue);

const editedUser = reactive({
  id: '',
  nom: '',
  prenom: '',
  email: '',
  mdp: '',
  role: ''
});

const roles = ['admin', 'user'];

const rules = {
  required: value => !!value || 'This field is required',
  email: value => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(value) || 'Invalid email address';
  },
  password: value => {
    if (!value) return true;

    const hasMinLength = value.length >= 8;
    const hasUppercase = /[A-Z]/.test(value);
    const hasLowercase = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);

    if (!hasMinLength) return 'Password must be at least 8 characters';
    if (!hasUppercase) return 'Password must contain an uppercase letter';
    if (!hasLowercase) return 'Password must contain a lowercase letter';
    if (!hasNumber) return 'Password must contain a number';

    return true;
  }
};

// Watch for user prop changes and update the form
watch(() => props.user, (newUser) => {
  if (newUser) {
    editedUser.id = newUser.id;
    editedUser.nom = newUser.nom;
    editedUser.prenom = newUser.prenom;
    editedUser.email = newUser.email;
    editedUser.role = newUser.role;
    editedUser.mdp = ''; // Reset password field
  }
}, { immediate: true, deep: true });

// Watch for dialog state changes
watch(() => props.modelValue, (newVal) => {
  localDialog.value = newVal;
});

watch(localDialog, (newVal) => {
  emit('update:modelValue', newVal);
});

const closeDialog = () => {
  localDialog.value = false;
  if (form.value) {
    form.value.reset();
  }
};

const updateUser = async () => {
  if (!form.value || !form.value.validate()) return;

  loading.value = true;
  try {
    const token = localStorage.getItem('token');
    const payload = {
      nom: editedUser.nom,
      prenom: editedUser.prenom,
      email: editedUser.email,
      role: editedUser.role
    };

    if (editedUser.mdp) {
      payload.mdp = editedUser.mdp;
    }

    const response = await axios.put(`http://localhost:3000/users/${editedUser.id}`, payload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    emit('user-updated', response.data);
    closeDialog();
  } catch (error) {
    console.error('Error updating user:', error);
  } finally {
    loading.value = false;
  }
};
</script>