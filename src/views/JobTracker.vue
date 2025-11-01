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
            <!-- Edit mode -->
            <template v-if="editingIndex === index">
              <td>
                <input v-model="editPosition" />
              </td>
              <td>
                <input v-model="editCompany" />
              </td>
              <td>
                <select v-model="editStatus">
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                  <option value="accepted">Accepted</option>
                </select>
              </td>
              <td>
                <button @click="saveEdit(job)">💾</button>
                <button @click="cancelEdit">❌</button>
              </td>
            </template>

            <!-- Normal mode -->
            <template v-else>
              <td>{{ job.position }}</td>
              <td>{{ job.company }}</td>
              <td>{{ job.status }}</td>
              <td>
                <button @click="startEdit(index, job)">✏️</button>
                <button @click="updateJobStatus(job, 'accepted')">✅</button>
                <button @click="updateJobStatus(job, 'rejected')">❌</button>
                <button @click="removeJob(job)">🗑️</button>
              </td>
            </template>
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
const user = computed(() => userStore.currentId)

// editing state
const editingIndex = ref<number | null>(null)
const editPosition = ref('')
const editCompany = ref('')
const editStatus = ref('')

async function loadJobs() {
  const res = await jobTrackerApi.getJobs({user: user.value})
  console.log(user.value)
  console.log('api response:', res)
  if (res.data) {
    jobs.value = res.data.jobs || []
    console.log('Loaded jobs:', jobs.value)
  } else error.value = res.error || 'Failed to load jobs'
}

async function addNewJob() {
  error.value = ''
  const duplicate = jobs.value.some(
    j => j.position.toLowerCase() === position.value.toLowerCase() &&
         j.company.toLowerCase() === company.value.toLowerCase()
  )
  if (duplicate) {
    error.value = 'This position-company pair already exists.'
    return
  }

  const res = await jobTrackerApi.addJob({
    user: user.value,
    position: position.value,
    company: company.value,
    status: status.value
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
  const res = await jobTrackerApi.removeJob({
    user: user.value,
    job: job
  })
  if (res.error) error.value = res.error
  else await loadJobs()
}

async function updateJobStatus(job: Job, newStatus: string) {
  const res = await jobTrackerApi.updateJob({
    user: user.value,
    job: job,
    position: job.position,
    company: job.company,
    status: newStatus
  })
  if (res.error) error.value = res.error
  else await loadJobs()
}

function startEdit(index: number, job: Job) {
  editingIndex.value = index
  editPosition.value = job.position
  editCompany.value = job.company
  editStatus.value = job.status
}

function cancelEdit() {
  editingIndex.value = null
  editPosition.value = ''
  editCompany.value = ''
  editStatus.value = ''
}

async function saveEdit(job: Job) {
  error.value = ''

  const duplicate = jobs.value.some(
    (j, i) =>
      i !== editingIndex.value &&
      j.position.toLowerCase() === editPosition.value.toLowerCase() &&
      j.company.toLowerCase() === editCompany.value.toLowerCase()
  )
  if (duplicate) {
    error.value = 'This position-company pair already exists.'
    return
  }

  const res = await jobTrackerApi.updateJob({
    user: user.value,
    job: job,
    position: editPosition.value,
    company: editCompany.value,
    status: editStatus.value
  })

  if (res.error) {
    error.value = res.error
  } else {
    cancelEdit()
    await loadJobs()
  }
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

.job-tracker h2 {
  font-weight: 400;
  font-family: "Georgia", serif;
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
