<template>
  <v-dialog v-model="localDialog" max-width="500px" persistent>
    <v-card>
      <v-card-title>
        <span class="text-h5">Add User</span>
      </v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid" @submit.prevent="saveUser">
          <v-text-field
              v-model="user.nom"
              label="Last Name"
              :rules="[rules.required]"
              required
              autocomplete="family-name"
          ></v-text-field>
          <v-text-field
              v-model="user.prenom"
              label="First Name"
              :rules="[rules.required]"
              required
              autocomplete="given-name"
          ></v-text-field>
          <v-text-field
              v-model="user.email"
              label="Email"
              :rules="[rules.required, rules.email]"
              required
              autocomplete="email"
          ></v-text-field>
          <v-text-field
              v-model="user.mdp"
              label="Password"
              :rules="[rules.required, rules.password]"
              required
              type="password"
              autocomplete="new-password"
          ></v-text-field>
          <v-select
              v-model="user.role"
              :items="roles"
              label="Role"
              :rules="[rules.required]"
              required
              persistent-hint
              hint="Select the user's role in the system"
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
            @click="saveUser"
            :loading="loading"
            :disabled="!valid"
        >
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { ref, reactive, watch } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

export default {
  name: 'AddUser',

  props: {
    modelValue: {
      type: Boolean,
      required: true
    }
  },

  emits: ['update:modelValue', 'user-added'],

  setup(props, { emit }) {
    const router = useRouter()
    const form = ref(null)
    const valid = ref(false)
    const loading = ref(false)
    const localDialog = ref(props.modelValue)

    const user = reactive({
      nom: '',
      prenom: '',
      email: '',
      mdp: '',
      role: ''
    })

    const roles = ['admin', 'user']

    const rules = {
      required: value => !!value || 'This field is required',
      email: value => {
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return pattern.test(value) || 'Invalid email address'
      },
      password: value => {
        const hasMinLength = value.length >= 8
        const hasUppercase = /[A-Z]/.test(value)
        const hasLowercase = /[a-z]/.test(value)
        const hasNumber = /[0-9]/.test(value)

        if (!hasMinLength) return 'Password must be at least 8 characters'
        if (!hasUppercase) return 'Password must contain an uppercase letter'
        if (!hasLowercase) return 'Password must contain a lowercase letter'
        if (!hasNumber) return 'Password must contain a number'

        return true
      }
    }

    // Create axios instance with authorization header
    const api = axios.create({
      baseURL: 'http://localhost:3000', // Adjust based on your API URL
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Add request interceptor for auth token
    api.interceptors.request.use(
        (config) => {
          const token = localStorage.getItem('token')
          if (token) {
            config.headers.Authorization = `Bearer ${token}`
          }
          return config
        },
        (error) => {
          return Promise.reject(error)
        }
    )

    // Add response interceptor for auth errors
    api.interceptors.response.use(
        (response) => response,
        (error) => {
          if (error.response?.status === 401) {
            localStorage.removeItem('token')
            router.push('/login')
          }
          return Promise.reject(error)
        }
    )

    watch(() => props.modelValue, (newVal) => {
      localDialog.value = newVal
    })

    watch(localDialog, (newVal) => {
      emit('update:modelValue', newVal)
      if (!newVal) {
        resetForm()
      }
    })

    const resetForm = () => {
      if (form.value) {
        form.value.reset()
        Object.keys(user).forEach(key => user[key] = '')
      }
    }

    const closeDialog = () => {
      localDialog.value = false
    }

    const saveUser = async () => {
      if (!form.value || !form.value.validate()) return

      loading.value = true
      try {
        const userData = {
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          mdp: user.mdp,
          role: user.role
        }

        const response = await api.post('/users/create', userData)
        emit('user-added', response.data)
        closeDialog()
      } catch (error) {
        console.error('Error adding user:', error)
        if (error.response?.status === 401) {
          // Handle unauthorized access
          localStorage.removeItem('token')
          router.push('/login')
        }
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      valid,
      loading,
      localDialog,
      user,
      roles,
      rules,
      closeDialog,
      saveUser
    }
  }
}
</script>