<template>
  <div class="file-storage">
    <div class="header">
      <h1>File Storage</h1>
      <p>Manage your context files for the generator</p>
    </div>

    <!-- User Section -->
    <div class="user-section">
      <div class="user-info">
        <h3>Welcome, {{ authStore.currentUsername }}</h3>
        <button @click="loadFiles" :disabled="loading" class="load-btn">
          Load Files
        </button>
      </div>
    </div>

    <!-- Upload Section -->
    <div class="upload-section" v-if="authStore.isAuthenticated">
      <h3>Upload New File</h3>
      <div class="upload-form">
        <div class="form-group">
          <label for="fileName">File Name:</label>
          <input
            id="fileName"
            v-model="newFile.name"
            type="text"
            placeholder="Enter file name"
            class="file-input"
          />
        </div>
        <div class="form-group">
          <label for="fileContent">File Content:</label>
          <textarea
            id="fileContent"
            v-model="newFile.content"
            placeholder="Enter file content"
            rows="5"
            class="content-textarea"
          ></textarea>
        </div>
        <button 
          @click="uploadFile" 
          :disabled="!newFile.name || !newFile.content || loading"
          class="upload-btn"
        >
          Upload File
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading">
      <p>Loading...</p>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="clearError" class="close-error">×</button>
    </div>

    <!-- Success Message -->
    <div v-if="success" class="success">
      <p>{{ success }}</p>
      <button @click="clearSuccess" class="close-success">×</button>
    </div>

    <!-- Files List -->
    <div v-if="files.length > 0" class="files-section">
      <h3>Your Files ({{ files.length }})</h3>
      <div class="files-grid">
        <div v-for="file in files" :key="file.name" class="file-card">
          <div class="file-header">
            <h4>{{ file.name }}</h4>
            <div class="file-actions">
              <button @click="startRename(file.name)" class="rename-btn">Rename</button>
              <button @click="deleteFile(file.name)" class="delete-btn">Delete</button>
            </div>
          </div>
          <div class="file-content">
            <pre>{{ file.content }}</pre>
          </div>
        </div>
      </div>
    </div>

    <!-- Rename Modal -->
    <div v-if="showRenameModal" class="modal-overlay" @click="closeRenameModal">
      <div class="modal" @click.stop>
        <h3>Rename File</h3>
        <p>Rename: <strong>{{ fileToRename }}</strong></p>
        <input
          v-model="newFileName"
          type="text"
          placeholder="Enter new name"
          class="rename-input"
          @keyup.enter="confirmRename"
          @keyup.escape="closeRenameModal"
        />
        <div class="modal-actions">
          <button @click="closeRenameModal" class="cancel-btn">Cancel</button>
          <button @click="confirmRename" :disabled="!newFileName" class="confirm-btn">
            Rename
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="authStore.isAuthenticated && files.length === 0 && !loading" class="empty-state">
      <p>No files uploaded yet. Upload your first file above!</p>
    </div>

    <!-- Not Authenticated State -->
    <div v-if="!authStore.isAuthenticated" class="not-authenticated">
      <p>Please log in to access your files.</p>
      <router-link to="/auth" class="login-link">
        Sign In
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { fileStorageApi } from '../services/fileStorageApi'
import { useAuthStore } from '../stores/auth'
import type { File } from '../types/fileStorage'

const authStore = useAuthStore()
const currentUser = computed(() => authStore.currentId)
const files = ref<File[]>([])
const loading = ref(false)
const error = ref('')
const success = ref('')

const newFile = reactive({
  name: '',
  content: ''
})

const showRenameModal = ref(false)
const fileToRename = ref('')
const newFileName = ref('')

const loadFiles = async () => {
  if (!currentUser.value) return

  loading.value = true
  error.value = ''

  const response = await fileStorageApi.getFiles({ user: currentUser.value })
  
  if (response.error) {
    error.value = response.error
  } else {
    files.value = response.data || []
    success.value = 'Files loaded successfully'
    setTimeout(() => clearSuccess(), 3000)
  }

  loading.value = false
}

const uploadFile = async () => {
  if (!currentUser.value || !newFile.name || !newFile.content) return

  loading.value = true
  error.value = ''

  const response = await fileStorageApi.uploadFile({
    user: currentUser.value,
    name: newFile.name,
    content: newFile.content
  })

  if (response.error) {
    error.value = response.error
  } else {
    success.value = 'File uploaded successfully'
    newFile.name = ''
    newFile.content = ''
    await loadFiles() // Refresh the files list
  }

  loading.value = false
}

const deleteFile = async (fileName: string) => {
  if (!currentUser.value || !confirm(`Are you sure you want to delete "${fileName}"?`)) return

  loading.value = true
  error.value = ''

  const response = await fileStorageApi.removeFile({
    user: currentUser.value,
    name: fileName
  })

  if (response.error) {
    error.value = response.error
  } else {
    success.value = 'File deleted successfully'
    await loadFiles() // Refresh the files list
  }

  loading.value = false
}

const startRename = (fileName: string) => {
  fileToRename.value = fileName
  newFileName.value = fileName
  showRenameModal.value = true
}

const closeRenameModal = () => {
  showRenameModal.value = false
  fileToRename.value = ''
  newFileName.value = ''
}

const confirmRename = async () => {
  if (!currentUser.value || !fileToRename.value || !newFileName.value) return

  loading.value = true
  error.value = ''

  const response = await fileStorageApi.renameFile({
    user: currentUser.value,
    name: fileToRename.value,
    newName: newFileName.value
  })

  if (response.error) {
    error.value = response.error
  } else {
    success.value = 'File renamed successfully'
    closeRenameModal()
    await loadFiles() // Refresh the files list
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
    loadFiles()
  }
})
</script>

<style scoped>
.file-storage {
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

.upload-section {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.upload-section h3 {
  color: white;
  margin-bottom: 1rem;
}

.upload-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
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

.file-input,
.content-textarea {
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  resize: vertical;
}

.content-textarea {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.file-input::placeholder,
.content-textarea::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.upload-btn {
  align-self: flex-start;
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.upload-btn:hover:not(:disabled) {
  background: #2563eb;
}

.upload-btn:disabled {
  background: rgba(255, 255, 255, 0.2);
  cursor: not-allowed;
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

.files-section h3 {
  color: white;
  margin-bottom: 1rem;
}

.files-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.file-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.file-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
}

.file-header h4 {
  color: white;
  margin: 0;
  word-break: break-all;
}

.file-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.rename-btn,
.delete-btn {
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.rename-btn {
  background: #f59e0b;
  color: white;
}

.rename-btn:hover {
  background: #d97706;
}

.delete-btn {
  background: #ef4444;
  color: white;
}

.delete-btn:hover {
  background: #dc2626;
}

.file-content {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  padding: 1rem;
  max-height: 200px;
  overflow-y: auto;
}

.file-content pre {
  color: rgba(255, 255, 255, 0.9);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.4;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  color: #1f2937;
}

.modal h3 {
  margin-bottom: 1rem;
  color: #1f2937;
}

.modal p {
  margin-bottom: 1rem;
  color: #6b7280;
}

.rename-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 1rem;
  margin-bottom: 1.5rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.cancel-btn,
.confirm-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
}

.cancel-btn {
  background: #6b7280;
  color: white;
}

.confirm-btn {
  background: #3b82f6;
  color: white;
}

.confirm-btn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

.empty-state {
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  padding: 3rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px dashed rgba(255, 255, 255, 0.2);
}

.not-authenticated {
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  padding: 3rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px dashed rgba(255, 255, 255, 0.2);
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
  
  .file-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .file-actions {
    align-self: flex-start;
  }
  
  .input-group {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
