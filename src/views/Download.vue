<template>
  <div class="download">
    <h1>Your Accepted Draft</h1>
    <textarea readonly rows="20" class="draft-display">{{ draft }}</textarea>
    <button @click="downloadPDF">Download as PDF</button>
    <router-link to="/generator" class="back-link">Back to Generator</router-link>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { jsPDF } from 'jspdf'

const router = useRouter()

// Retrieve draft from route state
const draft = history.state?.draft || ''

// If no draft provided, redirect back
if (!draft) {
  router.push('/generator')
}

// Function to download as PDF
const downloadPDF = () => {
  const doc = new jsPDF()
  const text = draft || 'No content available'
  const splitText = doc.splitTextToSize(text, 180)
  doc.text(splitText, 15, 20)
  doc.save('draft.pdf')
}
</script>

<style scoped>
.draft-summary {
  max-width: 800px;
  margin: 2rem auto;
  text-align: center;
}

.draft-display {
  width: 100%;
  padding: 1rem;
  margin-bottom: 1.5rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  background: #f8f9fa;
  font-family: monospace;
  font-size: 1rem;
}

button {
  background-color: #10b981;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

button:hover {
  background-color: #059669;
}

.back-link {
  display: block;
  margin-top: 1.5rem;
  color: #3b82f6;
}
</style>
