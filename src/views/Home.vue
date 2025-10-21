<template>
  <div class="home">
    <div class="hero">
      <h1>Welcome to re.ply</h1>
      <p>Your frontend application is ready to go!</p>
    </div>
    <div class="features">
      <div class="feature-card">
        <h3>Vue 3</h3>
        <p>Built with the latest Vue.js framework</p>
      </div>
      <div class="feature-card">
        <h3>TypeScript</h3>
        <p>Full TypeScript support for better development experience</p>
      </div>
      <div class="feature-card">
        <h3>Vite</h3>
        <p>Lightning fast build tool and dev server</p>
      </div>
      <div class="feature-card">
        <h3>Router</h3>
        <p>Vue Router for navigation</p>
      </div>
      <div class="feature-card">
        <h3>Pinia</h3>
        <p>State management made simple</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Component logic here
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 2rem;
  min-height: calc(100vh - 80px);
}

.hero {
  text-align: center;
  margin-bottom: 4rem;
  padding: 2rem 0;
}

.hero h1 {
  font-size: 3.5rem;
  color: white;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.hero p {
  font-size: 1.3rem;
  color: rgba(255, 255, 255, 0.9);
  max-width: 600px;
  margin: 0 auto;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.2s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-card h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.feature-card p {
  color: #7f8c8d;
  line-height: 1.6;
}
</style>
