import type { Job, ApiResponse, AddJobRequest, AddJobResponse, RemoveJobResponse, UpdateJobResponse, GetJobsResponse, RemoveJobRequest, UpdateJobRequest, GetJobsRequest } from '../types/jobTracker'
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

  addJob(request: AddJobRequest): Promise<ApiResponse<AddJobResponse>> {
    return this.makeRequest('/api/JobTracker/add', request)
  }

  removeJob(request: RemoveJobRequest): Promise<ApiResponse<RemoveJobResponse>> {
    return this.makeRequest('/api/JobTracker/remove', request)
  }

  updateJob(request: UpdateJobRequest): Promise<ApiResponse<UpdateJobResponse>> {
    return this.makeRequest('/api/JobTracker/update', request)
  }

  getJobs(request: GetJobsRequest): Promise<ApiResponse<GetJobsResponse>> {
    return this.makeRequest('/api/JobTracker/getJobs', request)
  }
}

export const jobTrackerApi = new JobTrackerApi()
export type { Job }
