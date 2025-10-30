import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '../services/authApi'
import type { User, RegisterRequest, LoginRequest } from '../types/authentication'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed properties
  const isAuthenticated = computed(() => user.value !== null)
  const currentUsername = computed(() => user.value?.username || '')
  const currentId = computed(() => user.value?._id || '')

  // Load user from localStorage on initialization
  const initializeAuth = () => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        user.value = JSON.parse(storedUser)
      } catch (e) {
        console.error('Failed to parse stored user:', e)
        localStorage.removeItem('user')
      }
    }
  }

  // Save user to localStorage
  const saveToStorage = (userData: User) => {
    localStorage.setItem('user', JSON.stringify(userData))
  }

  // Clear user from localStorage
  const clearStorage = () => {
    localStorage.removeItem('user')
  }

  // Register new user
  const register = async (credentials: RegisterRequest): Promise<boolean> => {
    loading.value = true
    error.value = null

    const response = await authApi.register(credentials)
    console.log('authApi response:', response.data)

    if (response.error) {
      error.value = response.error
      loading.value = false
      return false
    }

   
    const userResponse = response.data?.user
    const userData: User = userResponse ? 
    { username: userResponse.username, _id: userResponse._id, password: userResponse.password } : 
    {username: '', _id: '', password: ''}
    user.value = userData
    saveToStorage(userData)
    
    loading.value = false
    return true
  }

  // Login user
  const login = async (credentials: LoginRequest): Promise<boolean> => {
    loading.value = true
    error.value = null

    const response = await authApi.login(credentials)
    console.log('authApi response:', response.data)

    if (response.error) {
      error.value = response.error
      loading.value = false
      return false
    }

    const userResponse = response.data?.user
    const userData: User = userResponse ? 
    { username: userResponse.username, _id: userResponse._id, password: userResponse.password } : 
    {username: '', _id: '', password: ''}
    user.value = userData
    saveToStorage(userData)
    
    loading.value = false
    return true
  }

  // Logout user
  const logout = () => {
    user.value = null
    error.value = null
    clearStorage()
  }

  // Clear error
  const clearError = () => {
    error.value = null
  }

  return {
    // State
    user: user,
    loading: loading,
    error: error,
    
    // Computed
    isAuthenticated,
    currentUsername,
    currentId,
    
    // Actions
    register,
    login,
    logout,
    clearError,
    initializeAuth
  }
})
