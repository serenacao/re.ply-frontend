<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = () => {
  authStore.logout()
  router.push('/auth')
}
</script>

<template>
  <div id="app">
    <nav>
      <div class="nav-brand">
        <h2>re.ply</h2>
      </div>
      <div class="nav-links">
        <router-link to="/">Home</router-link>
        <template v-if="authStore.isAuthenticated">
          <router-link to="/file-storage">File Storage</router-link>
          <router-link to="/generator">Generator</router-link>
          <router-link to="/job-tracker">Job Tracker</router-link>
          <div class="user-menu">
            <span class="username">{{ authStore.currentUsername }}</span>
            <button @click="handleLogout" class="logout-btn">Logout</button>
          </div>
        </template>
        <template v-else>
          <router-link to="/auth">Sign In</router-link>
        </template>
      </div>
    </nav>
    <main>
      <RouterView />
    </main>
  </div>
</template>

<style>
#app {
  font-family: "Verdana", "Helvetica", "Arial", sans-serif;
  min-height: 100vh;
  background: linear-gradient(135deg, var(--antiflash-white) , #b7efb972 100%);
}

nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  background-color: var(--raspberry-rose);
  opacity: 0.8;
}

.nav-brand h2 {
  color: white;
  margin: 0;
  font-weight: 600;
}

.nav-links {
  display: flex;
  gap: 1rem;
}

.nav-links a {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  background: rgba(255, 255, 255, 0.2);
}
.nav-links a.router-link-exact-active {
  font-weight: bold;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-left: 1rem;
  padding-left: 1rem;
  border-left: 1px solid rgba(255, 255, 255, 0.2);
}

.username {
  color: white;
  font-weight: 500;
  font-size: 0.9rem;
}

.logout-btn {
  padding: 0.5rem 1rem;
  background: rgba(239, 68, 68, 0.2);
  color: white;
  border: 1px solid rgba(239, 68, 68, 0.5);
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.3);
  border-color: rgba(239, 68, 68, 0.7);
}

main {
  padding: 0;
}
</style>
