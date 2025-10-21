<template>
  <div class="auth">
    <div class="auth-container">
      <div class="auth-header">
        <h1>Welcome to re.ply</h1>
        <p>Sign in to access your files and AI generator</p>
      </div>

      <div class="auth-tabs">
        <button 
          @click="activeTab = 'login'"
          :class="{ active: activeTab === 'login' }"
          class="tab-button"
        >
          Sign In
        </button>
        <button 
          @click="activeTab = 'register'"
          :class="{ active: activeTab === 'register' }"
          class="tab-button"
        >
          Sign Up
        </button>
      </div>

      <!-- Login Form -->
      <form v-if="activeTab === 'login'" @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label for="loginUsername">Username</label>
          <input
            id="loginUsername"
            v-model="loginForm.username"
            type="text"
            required
            placeholder="Enter your username"
            class="form-input"
          />
        </div>
        <div class="form-group">
          <label for="loginPassword">Password</label>
          <input
            id="loginPassword"
            v-model="loginForm.password"
            type="password"
            required
            placeholder="Enter your password"
            class="form-input"
          />
        </div>
        <button 
          type="submit" 
          :disabled="authStore.loading || !loginForm.username || !loginForm.password"
          class="auth-button"
        >
          {{ authStore.loading ? 'Signing In...' : 'Sign In' }}
        </button>
      </form>

      <!-- Register Form -->
      <form v-if="activeTab === 'register'" @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <label for="registerUsername">Username</label>
          <input
            id="registerUsername"
            v-model="registerForm.username"
            type="text"
            required
            placeholder="Choose a username"
            class="form-input"
          />
        </div>
        <div class="form-group">
          <label for="registerPassword">Password</label>
          <input
            id="registerPassword"
            v-model="registerForm.password"
            type="password"
            required
            placeholder="Choose a password"
            class="form-input"
          />
        </div>
        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            v-model="registerForm.confirmPassword"
            type="password"
            required
            placeholder="Confirm your password"
            class="form-input"
          />
        </div>
        <button 
          type="submit" 
          :disabled="authStore.loading || !isRegisterFormValid"
          class="auth-button"
        >
          {{ authStore.loading ? 'Creating Account...' : 'Sign Up' }}
        </button>
      </form>

      <!-- Error Message -->
      <div v-if="authStore.error" class="error-message">
        <p>{{ authStore.error }}</p>
        <button @click="authStore.clearError" class="close-error">×</button>
      </div>

      <!-- Success Message -->
      <div v-if="successMessage" class="success-message">
        <p>{{ successMessage }}</p>
      </div>

      <!-- Demo Users Info -->
      <div class="demo-info">
        <h3>Quick Start</h3>
        <p>Create an account to start using file storage and AI generation features.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const activeTab = ref<'login' | 'register'>('login')

const loginForm = ref({
  username: '',
  password: ''
})

const registerForm = ref({
  username: '',
  password: '',
  confirmPassword: ''
})

const successMessage = ref('')

const isRegisterFormValid = computed(() => {
  return registerForm.value.username && 
         registerForm.value.password && 
         registerForm.value.confirmPassword &&
         registerForm.value.password === registerForm.value.confirmPassword &&
         registerForm.value.password.length >= 3
})

// Watch for successful authentication
watch(() => authStore.isAuthenticated, (isAuth) => {
  if (isAuth) {
    successMessage.value = `Welcome ${authStore.currentUsername}!`
    setTimeout(() => {
      router.push('/')
    }, 1500)
  }
})

const handleLogin = async () => {
  const success = await authStore.login({
    username: loginForm.value.username,
    password: loginForm.value.password
  })
  
  if (success) {
    // Navigation will happen via watcher
  }
}

const handleRegister = async () => {
  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    authStore.error = 'Passwords do not match'
    return
  }

  if (registerForm.value.password.length < 3) {
    authStore.error = 'Password must be at least 3 characters'
    return
  }

  const success = await authStore.register({
    username: registerForm.value.username,
    password: registerForm.value.password
  })

  if (success) {
    successMessage.value = 'Account created successfully! Redirecting...'
    setTimeout(() => {
      router.push('/')
    }, 1500)
  }
}

// Clear forms when switching tabs
watch(activeTab, () => {
  loginForm.value = { username: '', password: '' }
  registerForm.value = { username: '', password: '', confirmPassword: '' }
  authStore.clearError()
  successMessage.value = ''
})
</script>

<style scoped>
.auth {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.auth-container {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 3rem;
  max-width: 450px;
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-header h1 {
  color: white;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.auth-header p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
}

.auth-tabs {
  display: flex;
  margin-bottom: 2rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  padding: 4px;
}

.tab-button {
  flex: 1;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.tab-button.active {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.tab-button:hover:not(.active) {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: white;
  font-weight: 500;
  font-size: 0.9rem;
}

.form-input {
  padding: 0.875rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.6);
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.auth-button {
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 0.5rem;
}

.auth-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.auth-button:disabled {
  background: rgba(255, 255, 255, 0.2);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.error-message,
.success-message {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.error-message {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.5);
  color: #fca5a5;
}

.success-message {
  background: rgba(34, 197, 94, 0.2);
  border: 1px solid rgba(34, 197, 94, 0.5);
  color: #86efac;
}

.close-error {
  background: none;
  border: none;
  color: inherit;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.demo-info {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.demo-info h3 {
  color: white;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.demo-info p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  line-height: 1.5;
}

@media (max-width: 480px) {
  .auth {
    padding: 1rem;
  }
  
  .auth-container {
    padding: 2rem;
  }
  
  .auth-header h1 {
    font-size: 2rem;
  }
}
</style>
