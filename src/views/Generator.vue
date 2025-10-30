<template>
  <div class="generator">
    <div class="header">
      <h1>AI Generator</h1>
      <p>Generate professional application-related text using AI with your context files</p>
    </div>

    <!-- User Section -->
    <div class="user-section">
      <div class="user-info">
        <h3>Welcome, {{ authStore.currentUsername }}</h3>
        <button @click="loadUserFiles" :disabled="loading" class="load-btn">
        Load Files
        </button>
      </div>
    </div>

    <!-- Generator Section -->
    <div v-if="authStore.isAuthenticated && availableFiles.length > 0" class="generator-section">
      <!-- Question Input -->
      <div class="question-section">
        <h3>Ask Your Question</h3>
        <div class="form-group">
          <label for="questionInput">Professional Application Question:</label>
          <textarea
            id="questionInput"
            v-model="question"
            placeholder="Enter your professional application-related question..."
            rows="3"
            class="question-input"
          ></textarea>
        </div>
      </div>

      <!-- File Selection -->
      <div class="files-section">
        <h3>Select Context Files</h3>
        <div class="files-grid">
          <div 
            v-for="file in availableFiles" 
            :key="file.name" 
            class="file-card"
            :class="{ selected: selectedFiles.includes(file.name) }"
            @click="toggleFileSelection(file.name)"
          >
            <div class="file-header">
              <h4>{{ file.name }}</h4>
              <div class="selection-indicator">
                <span v-if="selectedFiles.includes(file.name)" class="selected">✓</span>
              </div>
            </div>
            <div class="file-preview">
              {{ truncateContent(file.content) }}
            </div>
          </div>
        </div>
        <p class="files-info">
          Selected {{ selectedFiles.length }} of {{ availableFiles.length }} files
        </p>
      </div>

      <!-- Generate Button -->
      <div class="generation-section">
        <button 
          @click="generateDraft" 
          :disabled="!question || selectedFiles.length === 0 || loading"
          class="generate-btn"
        >
          {{ loading ? 'Generating...' : 'Generate Draft' }}
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !draft" class="loading">
      <p>Loading...</p>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="clearError" class="close-error"></button>
    </div>

    <!-- Success Message -->
    <div v-if="success" class="success">
      <p>{{ success }}</p>
      <button @click="clearSuccess" class="close-success"></button>
    </div>

    <!-- Draft Section -->
    <div v-if="draft" class="draft-section">
      <div class="draft-header">
        <h3>Generated Draft</h3>
        <div class="draft-actions">
          <button @click="acceptDraft" :disabled="accepted" class="accept-btn" v-if="!accepted">
            {{ accepted ? 'Accepted' : 'Accept Draft' }}
          </button>
          <span v-if="accepted" class="accepted-badge">✓ Accepted</span>
        </div>
      </div>

      <div class="draft-content">
        <textarea
          v-model="editableDraft"
          @blur="saveDraft"
          rows="15"
          class="draft-textarea"
          placeholder="Generated draft will appear here..."
        ></textarea>
      </div>

      <!-- Feedback Section -->
      <div class="feedback-section">
        <h4>Provide Feedback</h4>
        <div class="feedback-form">
          <textarea
            v-model="feedbackComment"
            placeholder="Enter your feedback to improve the draft..."
            rows="3"
            class="feedback-input"
          ></textarea>
          <button 
            @click="submitFeedback" 
            :disabled="!feedbackComment.trim() || loading"
            class="feedback-btn"
          >
            Apply Feedback
          </button>
        </div>

        <!-- Feedback History -->
        <div v-if="feedbackHistory.length > 0" class="feedback-history">
          <h5>Feedback History</h5>
          <div v-for="(feedback, index) in feedbackHistory" :key="index" class="feedback-item">
            <span class="feedback-number">#{{ index + 1 }}</span>
            <span class="feedback-text">{{ feedback }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty Files State -->
    <div v-if="authStore.isAuthenticated && availableFiles.length === 0 && !loading" class="empty-files">
      <p>No files found for this user. Please upload some context files first.</p>
      <router-link to="/file-storage" class="link-to-filestorage">
        Go to File Storage
      </router-link>
    </div>

    <!-- Not Authenticated State -->
    <div v-if="!authStore.isAuthenticated" class="not-authenticated">
      <p>Please log in to access the AI generator.</p>
      <router-link to="/auth" class="login-link">
        Sign In
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { fileStorageApi } from '../services/fileStorageApi'
import { generatorApi } from '../services/generatorApi'
import { useAuthStore } from '../stores/auth'
import type { File } from '../types/fileStorage'

const authStore = useAuthStore()
const currentUser = computed(() => authStore.currentId)
const availableFiles = ref<File[]>([])
const selectedFiles = ref<string[]>([])
const question = ref('')
const draft = ref('')
const editableDraft = ref('')
const feedbackComment = ref('')
const feedbackHistory = ref<string[]>([])
const loading = ref(false)
const error = ref('')
const success = ref('')
const accepted = ref(false)

// Watch for draft changes to update editable draft
watch(draft, (newDraft) => {
  editableDraft.value = newDraft
})

const truncateContent = (content: string, maxLength = 150) => {
  return content.length > maxLength ? content.substring(0, maxLength) + '...' : content
}

const loadUserFiles = async () => {
  console.log('loadUserFiles called', currentUser.value)
  if (!currentUser.value) return

  loading.value = true
  error.value = ''

  const response = await fileStorageApi.getFiles({ user: currentUser.value })
  
  if (response.error) {
    error.value = response.error
  } else {
    availableFiles.value = response.data || []
    selectedFiles.value = []
    success.value = 'Files loaded successfully'
    setTimeout(() => clearSuccess(), 3000)
  }

  loading.value = false
}

const toggleFileSelection = (fileName: string) => {
  const index = selectedFiles.value.indexOf(fileName)
  if (index > -1) {
    selectedFiles.value.splice(index, 1)
  } else {
    selectedFiles.value.push(fileName)
  }
}

const generateDraft = async () => {
  if (!question.value) return
  console.log('question', question.value);
  if (selectedFiles.value.length === 0) {
    error.value = 'Please select at least one file!'
    return
  }

  loading.value = true
  error.value = ''

  // Get the selected files content
  const selectedFilesContent = availableFiles.value.filter(file => 
    selectedFiles.value.includes(file.name)
  )
  console.log('files', selectedFilesContent)

  const response = await generatorApi.generate({
    question: question.value,
    files: selectedFilesContent
  })
  console.log('response', response);

  if (response.error) {
    error.value = response.error
  } else {
    draft.value = response.data?.draft || ''
    editableDraft.value = draft.value
    success.value = 'Draft generated successfully!'
    feedbackHistory.value = []
    accepted.value = false
    setTimeout(() => clearSuccess(), 3000)
  }

  loading.value = false
}

const saveDraft = async () => {
  if (editableDraft.value === draft.value) return

  loading.value = true
  error.value = ''

  const response = await generatorApi.edit({
    newDraft: editableDraft.value
  })

  if (response.error) {
    error.value = response.error
  } else {
    draft.value = editableDraft.value
    success.value = 'Draft updated successfully'
    setTimeout(() => clearSuccess(), 2000)
  }

  loading.value = false
}

const submitFeedback = async () => {
  if (!feedbackComment.value.trim() || !draft.value) return

  loading.value = true
  error.value = ''

  const response = await generatorApi.feedback({
    comment: feedbackComment.value.trim()
  })

  if (response.error) {
    error.value = response.error
  } else {
    draft.value = response.data?.draft || ''
    editableDraft.value = draft.value
    feedbackHistory.value.push(feedbackComment.value.trim())
    feedbackComment.value = ''
    success.value = 'Feedback applied successfully'
    setTimeout(() => clearSuccess(), 3000)
  }

  loading.value = false
}

const acceptDraft = async () => {
  loading.value = true
  error.value = ''

  const response = await generatorApi.accept({})

  if (response.error) {
    error.value = response.error
  } else {
    accepted.value = true
    success.value = 'Draft accepted successfully'
    setTimeout(() => clearSuccess(), 3000)
  }

  loading.value = false
}

const clearError = () => {
  error.value = ''
}

const clearSuccess = () => {
  success.value = ''
}

// Auto-load files when component mounts and user is authenticated
onMounted(() => {
  if (authStore.isAuthenticated) {
    loadUserFiles()
  }
})
</script>

<style scoped>
.generator {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.header h1 {
  color: white;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.header p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
}

.user-section {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.user-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.user-info h3 {
  color: white;
  margin: 0;
  font-size: 1.2rem;
}

.load-btn {
  padding: 0.75rem 1.5rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.load-btn:hover:not(:disabled) {
  background: #059669;
}

.load-btn:disabled {
  background: rgba(255, 255, 255, 0.2);
  cursor: not-allowed;
}

.generator-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.question-section,
.files-section,
.generation-section,
.draft-section,
.feedback-section {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1.5rem;
}

.question-section h3,
.files-section h3,
.draft-section h3 {
  color: white;
  margin-bottom: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: white;
  font-weight: 500;
}

.question-input {
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  resize: vertical;
  font-family: inherit;
}

.question-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.files-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.file-card {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.file-card:hover {
  border-color: rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.1);
}

.file-card.selected {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
}

.file-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.file-header h4 {
  color: white;
  margin: 0;
  font-size: 1rem;
}

.selection-indicator {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.selection-indicator .selected {
  color: #3b82f6;
  font-weight: bold;
}

.file-preview {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
  line-height: 1.4;
}

.files-info {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
  margin: 0;
}

.generate-btn {
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.generate-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.generate-btn:disabled {
  background: rgba(255, 255, 255, 0.2);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.draft-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.draft-header h3 {
  color: white;
  margin: 0;
}

.draft-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.accept-btn {
  padding: 0.5rem 1rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
}

.accept-btn:hover:not(:disabled) {
  background: #059669;
}

.accept-btn:disabled {
  background: rgba(255, 255, 255, 0.2);
  cursor: not-allowed;
}

.accepted-badge {
  color: #10b981;
  font-weight: 600;
  font-size: 0.9rem;
}

.draft-content {
  margin-bottom: 2rem;
}

.draft-textarea {
  width: 100%;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  font-family: inherit;
  line-height: 1.6;
  resize: vertical;
}

.draft-textarea::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.feedback-section h4 {
  color: white;
  margin-bottom: 1rem;
}

.feedback-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.feedback-input {
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  resize: vertical;
}

.feedback-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.feedback-btn {
  align-self: flex-start;
  padding: 0.75rem 1.5rem;
  background: #f59e0b;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
}

.feedback-btn:hover:not(:disabled) {
  background: #d97706;
}

.feedback-btn:disabled {
  background: rgba(255, 255, 255, 0.2);
  cursor: not-allowed;
}

.feedback-history {
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: 1rem;
}

.feedback-history h5 {
  color: white;
  margin-bottom: 1rem;
}

.feedback-item {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.feedback-number {
  color: #3b82f6;
  font-weight: 600;
  min-width: 30px;
}

.feedback-text {
  color: rgba(255, 255, 255, 0.9);
  flex: 1;
}

.loading {
  text-align: center;
  color: white;
  padding: 2rem;
}

.error,
.success {
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.error {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.5);
  color: #fca5a5;
}

.success {
  background: rgba(34, 197, 94, 0.2);
  border: 1px solid rgba(34, 197, 94, 0.5);
  color: #86efac;
}

.close-error,
.close-success {
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

.empty-files,
.not-authenticated {
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  padding: 3rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px dashed rgba(255, 255, 255, 0.2);
}

.link-to-filestorage {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 500;
}

.link-to-filestorage:hover {
  background: #2563eb;
}

.login-link {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.login-link:hover {
  background: #2563eb;
}

@media (max-width: 768px) {
  .files-grid {
    grid-template-columns: 1fr;
  }
  
  .draft-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .feedback-form {
    gap: 1rem;
  }
}
</style>
