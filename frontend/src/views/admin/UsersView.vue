<template>
  <v-container>
    <!-- Page Title and Add Button -->
    <v-row class="mb-4">
      <v-col cols="6">
        <h1>Users Management</h1>
      </v-col>
      <v-col cols="6" class="text-right">
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openAddUserModal">
          Add User
        </v-btn>
      </v-col>
    </v-row>

    <!-- Users Table -->
    <v-card>
      <v-data-table
          :headers="headers"
          :items="users"
          :loading="loading"
          :items-per-page="limit"
          :page="page"
          :server-items-length="totalUsers"
          @update:options="handlePageChange"
      >
        <!-- Actions Column Template -->
        <template v-slot:item.actions="{ item }">
          <v-btn
              icon
              color="primary"
              size="small"
              class="mr-2"
              @click="openUpdateUserModal(item)"
          >
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn
              icon
              color="error"
              size="small"
              @click="confirmDelete(item.id)"
          >
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Add User Modal -->
    <AddUser
        v-if="showAddUserModal"
        v-model="showAddUserModal"
        @user-added="handleUserAdded"
    />

    <!-- Update User Modal -->
    <UpdateUser
        v-if="showUpdateUserModal"
        v-model="showUpdateUserModal"
        :user="selectedUser"
        @user-updated="handleUserUpdated"
    />

    <!-- Confirmation Dialog -->
    <v-dialog v-model="showConfirmDialog" max-width="400">
      <v-card>
        <v-card-title>Confirm Deletion</v-card-title>
        <v-card-text>
          Are you sure you want to delete this user?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" text @click="showConfirmDialog = false">Cancel</v-btn>
          <v-btn color="error" text @click="deleteUser">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, watch } from 'vue';
import axios from 'axios';
import {useToast} from 'vue-toastification';
import AddUser from '@/components/user/AddUser.vue';
import UpdateUser from '@/components/user/UpdateUser.vue';

const toast = useToast();
const users = ref([]);
const loading = ref(false);
const totalUsers = ref(0);
const page = ref(1);
const limit = ref(10);
const selectedUser = ref(null);

const showAddUserModal = ref(false);
const showUpdateUserModal = ref(false);
const showConfirmDialog = ref(false);

const headers = [
  {title: 'ID', key: 'id', sortable: true},
  {title: 'Last Name', key: 'nom', sortable: true},
  {title: 'First Name', key: 'prenom', sortable: true},
  {title: 'Email', key: 'email', sortable: true},
  {title: 'Role', key: 'role', sortable: true},
  {title: 'Actions', key: 'actions', sortable: false}
];

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
);

const fetchUsers = async () => {
  loading.value = true;
  try {
    const response = await api.get('/users', {
      params: {
        page: page.value,
        limit: limit.value,
      },
    });

    if (response.data) {
      users.value = response.data.data;
      totalUsers.value = response.data.total;
    }
  } catch (error) {
    console.error('Fetch error:', error);
    showToast('Error fetching users', 'error');
  } finally {
    loading.value = false;
  }
};

const handlePageChange = (options) => {
  page.value = options.page;
  limit.value = options.itemsPerPage;
};

const handleUserAdded = () => {
  showToast('User added successfully');
  fetchUsers();
};

const handleUserUpdated = () => {
  showToast('User updated successfully');
  fetchUsers();
};

watch([page, limit], fetchUsers, {immediate: true});

const openAddUserModal = () => {
  showAddUserModal.value = true;
};

const openUpdateUserModal = (user) => {
  selectedUser.value = user;
  showUpdateUserModal.value = true;
};

const confirmDelete = (userId) => {
  selectedUser.value = {id: userId};
  showConfirmDialog.value = true;
};

const deleteUser = async () => {
  try {
    await api.delete(`/users/${selectedUser.value.id}`);
    showToast('User deleted successfully');
    fetchUsers();
  } catch (error) {
    console.error('Delete error:', error);
    showToast('Error deleting user', 'error');
  } finally {
    showConfirmDialog.value = false;
    selectedUser.value = null;
  }
};

const showToast = (message, type = 'success') => {
  if (type === 'error') {
    toast.error(message);
  } else {
    toast.success(message);
  }
};

// Cleanup on modal close
watch(showUpdateUserModal, (newValue) => {
  if (!newValue) {
    selectedUser.value = null;
  }
});
</script>