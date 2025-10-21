import { createPinia } from 'pinia'

export const pinia = createPinia()

// Export stores here as they are created
export { useAuthStore } from './auth'
