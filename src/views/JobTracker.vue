<template>
  <div class="job-tracker">
    <!-- Header -->
    <div class="header">
      <h1>Job Tracker</h1>
      <p>Keep track of your job applications and manage their progress</p>
    </div>

    <!-- User Section -->
    <div class="user-section" v-if="authStore.isAuthenticated">
      <div class="user-info">
        <h3>Welcome, {{ authStore.currentUsername }}</h3>
        <button @click="loadJobs" :disabled="loading" class="load-btn">
          Load Jobs
        </button>
      </div>
    </div>

    <!-- Job List -->
    <div v-if="authStore.isAuthenticated" class="job-section">
      <h3>Your Applications</h3>

      <div v-if="jobs.length > 0" class="job-grid">
        <div v-for="(job, index) in jobs" :key="user" class="job-card">
          
          <!-- EDIT MODE -->
          <div v-if="editingIndex === index" class="edit-job">
            <input v-model="editPosition" placeholder="Job Title" class="job-input"/>
            <input v-model="editCompany" placeholder="Company Name" class="job-input"/>
            <select v-model="editStatus" class="job-input">
              <option>Applied</option>
              <option>Interviewing</option>
              <option>Offer</option>
              <option>Rejected</option>
            </select>
            <div class="job-actions">
              <button @click="saveEdit(job)" class="save-btn">Save</button>
              <button @click="cancelEdit" class="cancel-btn">Cancel</button>
            </div>
          </div>

          <!-- VIEW MODE -->
          <div v-else>
            <div class="job-header">
              <h4>{{ job.position }}</h4>
              <span class="company">{{ job.company }}</span>
            </div>
            <p class="status">Status: {{ job.status }}</p>

            <div class="job-actions">
              <button @click="startEdit(index, job)" class="edit-btn">Edit</button>
              <button @click="removeJob(job)" class="delete-btn">Delete</button>
            </div>
          </div>

        </div>
      </div>

      <div v-else class="empty-jobs">
        <p>No jobs found. Add one below!</p>
      </div>
    </div>

    <!-- Add Job Section -->
    <div v-if="authStore.isAuthenticated" class="add-job-section">
      <h3>Add a New Job</h3>
      <div class="form-group">
        <input
          v-model="position"
          placeholder="Job Title"
          class="job-input"
        />
        <input
          v-model="company"
          placeholder="Company Name"
          class="job-input"
        />
        <select v-model="status" class="job-input">
          <option value="">Select Status</option>
          <option>Applied</option>
          <option>Interviewing</option>
          <option>Offer</option>
          <option>Rejected</option>
        </select>
        <button
          @click="addNewJob"
          :disabled="!position || !company"
          class="add-btn"
        >
          Add Job
        </button>
      </div>
      <p v-if="error" class="error">{{ error }}</p>
    </div>

    <!-- Not Authenticated -->
    <div v-if="!authStore.isAuthenticated" class="not-authenticated">
      <p>Please log in to view your job tracker.</p>
      <router-link to="/auth" class="login-link">Sign In</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue' 
import { jobTrackerApi, type Job } from '../services/jobTrackerApi' 
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const jobs = ref<Job[]>([])
const position = ref('')
const company = ref('')
const status = ref('')
const error = ref('')
const loading = ref(false)

const userStore = useAuthStore()
const user = computed(() => userStore.currentId)

// editing state
const editingIndex = ref<number | null>(null)
const editPosition = ref('')
const editCompany = ref('')
const editStatus = ref('')

async function loadJobs() {
  const res = await jobTrackerApi.getJobs({ user: user.value })
  console.log(user.value)
  console.log('api response:', res)

  if (res.data) {
    jobs.value = res.data.jobs || []
    console.log('Loaded jobs:', jobs.value)
  } else {
    error.value = res.error || 'Failed to load jobs'
  }
}

async function addNewJob() {
  error.value = ''

  const duplicate = jobs.value.some(
    j =>
      j.position.toLowerCase() === position.value.toLowerCase() &&
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
    status: status.value,
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
  const res = await jobTrackerApi.removeJob({ user: user.value, job })
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
    job,
    position: editPosition.value,
    company: editCompany.value,
    status: editStatus.value, 
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  font-family: "Georgia", serif;
  font-weight: 400;
  background: #ED6B8650;
}

.header p {
  font-size: 1.1rem;
  color: #3f4334ff;
}

.user-section {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.user-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info h3 {
font-weight: 400;
font-style: italic;

}

.load-btn {
  padding: 0.75rem 1.5rem;
  background: #10b981;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
}

.load-btn:hover:not(:disabled) {
  background: #059669;
}

.load-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.job-section {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.job-section h3 {
  margin-bottom: 1rem;
}

.job-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.job-card {
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.2s ease;
  position: relative;
}

.job-card:hover {
  background: rgba(255, 255, 255, 0.7);
  transform: translateY(-2px);
}

.job-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.job-header h4 {
  font-size: 1.1rem;
  margin: 0;
}

.company {
  font-size: 0.9rem;
  font-style: italic;
  color: #6b7280;
}

.status {
  margin: 0.5rem 0 1rem;
  font-size: 0.95rem;
}

.job-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.edit-btn {
  padding: 0.5rem 1rem;
  background: #31c889ff;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
}

.edit-btn:hover {
  background: #199d7aff;
}

.save-btn {
  padding: 0.5rem 1rem;
  background: #10b981;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
}

.save-btn:hover {
  background: #059669;
}

.cancel-btn {
  padding: 0.5rem 1rem;
  background: #e25d96ff;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
}

.cancel-btn:hover {
  background: #974061ff;
}

.delete-btn {
  padding: 0.5rem 1rem;
  background: #e25d96ff;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
}

.delete-btn:hover {
  background: #974061ff;
}

.add-job-section {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 1.5rem;
}

.add-job-section h3 {
  margin-bottom: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.job-input {
  padding: 0.2rem;
  
  margin: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  background: rgba(32, 32, 32, 0.1);
  font-size: 1rem;
}

.add-btn {
  padding: 0.75rem 1.5rem;
  background: #e26a92ff;
  border: none;
  border-radius: 4px;
  color: white;
  font-weight: 500;
  cursor: pointer;
}

.add-btn:hover:not(:disabled) {
  background: #d6286f;
}

.error {
  color: red;
  margin-top: 0.5rem;
}

.not-authenticated {
  text-align: center;
  padding: 3rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px dashed rgba(255, 255, 255, 0.2);
}

.login-link {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #f63b9fff;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 500;
}

.login-link:hover {
  background: #eb2599ff;
}

.empty-jobs {
  text-align: center;
  color: #6b7280;
}
</style>
