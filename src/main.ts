import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { pinia } from './stores'
import { useAuthStore } from './stores/auth'

const app = createApp(App)

app.use(router)
app.use(pinia)

// Initialize auth store after Pinia is set up
const authStore = useAuthStore()
authStore.initializeAuth()

app.mount('#app')
