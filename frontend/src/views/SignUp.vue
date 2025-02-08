<template>
  <div class="signup-container">
    <div class="form-container">
      <v-card class="mx-auto pa-12 pb-8" elevation="8" max-width="448" rounded="lg">
        <div class="text-subtitle-1 text-medium-emphasis">Sign up for an account</div>

        <v-form ref="form" @submit.prevent="register" class="mt-6">
          <v-text-field
              v-model="formData.nom"
              density="compact"
              placeholder="First Name"
              prepend-inner-icon="mdi-account-outline"
              variant="outlined"
              :rules="[rules.required]"
          ></v-text-field>

          <v-text-field
              v-model="formData.prenom"
              density="compact"
              placeholder="Last Name"
              prepend-inner-icon="mdi-account-outline"
              variant="outlined"
              :rules="[rules.required]"
          ></v-text-field>

          <v-text-field
              v-model="formData.email"
              density="compact"
              placeholder="Email address"
              prepend-inner-icon="mdi-email-outline"
              variant="outlined"
              :rules="[rules.required, rules.email]"
          ></v-text-field>

          <v-text-field
              v-model="formData.password"
              :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
              :type="visible ? 'text' : 'password'"
              density="compact"
              placeholder="Enter your password"
              prepend-inner-icon="mdi-lock-outline"
              variant="outlined"
              :rules="[rules.required, rules.min]"
              @click:append-inner="visible = !visible"
          ></v-text-field>

          <v-text-field
              v-model="formData.confirmPassword"
              :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
              :type="visible ? 'text' : 'password'"
              density="compact"
              placeholder="Confirm your password"
              prepend-inner-icon="mdi-lock-outline"
              variant="outlined"
              :rules="[rules.required, rules.passwordMatch]"
              @click:append-inner="visible = !visible"
          ></v-text-field>

          <v-btn
              block
              class="mb-8"
              color="blue"
              size="large"
              type="submit"
              variant="elevated"
              :loading="loading"
          >
            Sign Up
          </v-btn>

          <v-card-text class="text-center">
            <router-link class="text-blue text-decoration-none" to="/login">
              Already have an account? Sign in
            </router-link>
          </v-card-text>
        </v-form>
      </v-card>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { userStore } from '@/stores/userStore'
import axios from 'axios'

export default {
  setup() {
    const router = useRouter()
    const form = ref(null)
    const visible = ref(false)
    const loading = ref(false)

    const formData = ref({
      nom: '',
      prenom: '',
      email: '',
      password: '',
      confirmPassword: ''
    })

    const rules = {
      required: value => !!value || 'Field is required',
      min: value => {
        if (!value) return 'Password is required'
        if (value.length < 8) return 'Password must be at least 8 characters'
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/.test(value) ||
            'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      },
      email: value => {
        if (!value) return 'Email is required'
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return pattern.test(value) || 'Invalid email format'
      },
      passwordMatch: value => value === formData.value.password || 'Passwords do not match'
    }



    const register = async () => {
      const { valid } = await form.value.validate()

      if (!valid) return

      try {
        loading.value = true
        const response = await axios.post('http://localhost:3000/auth/signup', {
          nom: formData.value.nom,
          prenom: formData.value.prenom,
          email: formData.value.email,
          mdp: formData.value.password
        })

        if (response.data) {
          userStore.signup(response.data.user, response.data.access_token)
          router.push('/')
        }
      } catch (error) {
        console.error('Registration failed:', error)
        alert(error.response?.data?.message || 'Registration failed')
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      formData,
      visible,
      loading,
      rules,
      register
    }
  }
}
</script>

<style scoped>
.signup-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(-45deg, #ee7752, #682f85, #23a6d5, #23d5ab);
  background-size: 400% 400%;
  animation: gradient 15s ease infinite;
}

.form-container {
  width: 100%;
  max-width: 448px;
  padding: 20px;
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style>
