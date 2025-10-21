import type { Job, ApiResponse } from '../types/jobTracker'
// src/api/jobTracker.ts
const API_BASE_URL = 'http://localhost:8000'

class JobTrackerApi {
  private async makeRequest<T>(
    endpoint: string,
    body: any
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await response.json()
      if (!response.ok) return { error: data.error || 'Request failed' }
      return { data }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Network error' }
    }
  }

  addJob(job: Job) {
    return this.makeRequest('/api/JobTracker/add', job)
  }

  removeJob(user: string, job: Job) {
    return this.makeRequest('/api/JobTracker/remove', { user, job })
  }

  updateJob(job: Job) {
    return this.makeRequest('/api/JobTracker/update', job)
  }

  getJobs(user: string) {
    return this.makeRequest('/api/JobTracker/getJobs', { user })
  }
}

export const jobTrackerApi = new JobTrackerApi()
export type { Job }
