<template>
  <div class="job-tracker">
    <h2>Job Tracker</h2>

    <form @submit.prevent="addNewJob" class="job-form">
      <input v-model="position" placeholder="Position" required />
      <input v-model="company" placeholder="Company" required />
      <select v-model="status">
        <option value="pending">Pending</option>
        <option value="rejected">Rejected</option>
        <option value="accepted">Accepted</option>
      </select>
      <button type="submit">Add Job</button>
    </form>

    <div v-if="error" class="error">{{ error }}</div>
    
    <div v-if="jobs.length > 0" class="job-list">
      <h3>Your Jobs</h3>
      <table>
        <thead>
          <tr>
            <th>Position</th>
            <th>Company</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(job, index) in jobs" :key="index">
            <td>{{ job.position }}</td>
            <td>{{ job.company }}</td>
            <td>{{ job.status }}</td>
            <td>
              <button @click="updateJobStatus(job, 'accepted')">✅</button>
              <button @click="updateJobStatus(job, 'rejected')">❌</button>
              <button @click="removeJob(job)">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-else>No jobs yet. Add one above!</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { jobTrackerApi, type Job } from '../services/jobTrackerApi'
import { useAuthStore } from '../stores/auth'

const jobs = ref<Job[]>([])
const position = ref('')
const company = ref('')
const status = ref('pending')
const error = ref('')
const userStore = useAuthStore()
const user = computed(() => userStore.currentUsername)

async function loadJobs() {
  const res = await jobTrackerApi.getJobs(user.value)
  if (res.data) {
    jobs.value = res.data.jobs || []
  }
  else error.value = res.error || 'Failed to load jobs'
}

async function addNewJob() {
  const res = await jobTrackerApi.addJob({
    user: user.value, position: position.value, company: company.value, status: status.value
  })
  if (res.error) {
    error.value = res.error
  } else {
    position.value = ''
    company.value = ''
    status.value = 'pending'
    await loadJobs()
  }
}

async function removeJob(job: Job) {
  const res = await jobTrackerApi.removeJob(user.value, job.job || `${job.position}-${job.company}`)
  if (res.error) error.value = res.error
  else await loadJobs()
}

async function updateJobStatus(job: Job, newStatus: string) {
  const res = await jobTrackerApi.updateJob({ ...job, status: newStatus, user: user.value })
  if (res.error) error.value = res.error
  else await loadJobs()
}

onMounted(loadJobs)
</script>

<style scoped>
.job-tracker {
  max-width: 800px;
  margin: 2rem auto;
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.job-form {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.job-list table {
  width: 100%;
  border-collapse: collapse;
}

.job-list th, .job-list td {
  border: 1px solid #ccc;
  padding: 0.5rem;
  text-align: center;
}

.error {
  color: red;
  margin-bottom: 1rem;
}
</style>
