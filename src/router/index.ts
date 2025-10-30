import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Home from '../views/Home.vue'
import FileStorage from '../views/FileStorage.vue'
import Generator from '../views/Generator.vue'
import Auth from '../views/Auth.vue'
import JobTracker from '../views/JobTracker.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/auth',
    name: 'Auth',
    component: Auth,
    meta: { requiresGuest: true }
  },
  {
    path: '/file-storage',
    name: 'FileStorage',
    component: FileStorage,
    meta: { requiresAuth: true }
  },
  {
    path: '/generator',
    name: 'Generator',
    component: Generator,
    meta: { requiresAuth: true }
  }, 
  {
  path: '/job-tracker',
  name: 'JobTracker',
  component: JobTracker,
  meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Route guards
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/auth')
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router
