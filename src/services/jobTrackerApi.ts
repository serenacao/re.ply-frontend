import type { Job, ApiResponse, AddJobRequest, AddJobResponse, RemoveJobResponse, UpdateJobResponse, GetJobsResponse, RemoveJobRequest, UpdateJobRequest, GetJobsRequest } from '../types/jobTracker'
// src/api/jobTracker.ts
import { API_BASE_URL } from './api'

class JobTrackerApi {
  private async makeRequest<T>(
      endpoint: string, 
      method: 'GET' | 'POST' | 'PUT' | 'DELETE', 
      body?: any
    ): Promise<ApiResponse<T>> {
      try {
      const token = localStorage.getItem('authToken') // or sessionStorage / Pinia store
      const bodyWithToken = {
        ...body,
        token: token,
      };
  
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: bodyWithToken ? JSON.stringify(bodyWithToken) : undefined,
      })
  
      const data = await response.json()
  
      if (!response.ok) {
        return { error: data.error || 'An error occurred' }
      }
  
      return { data }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Network error' }
    }
    }

  addJob(request: AddJobRequest): Promise<ApiResponse<AddJobResponse>> {
    return this.makeRequest('/api/JobTracker/add', "POST", request)
  }

  removeJob(request: RemoveJobRequest): Promise<ApiResponse<RemoveJobResponse>> {
    return this.makeRequest('/api/JobTracker/remove', "POST", request)
  }

  updateJob(request: UpdateJobRequest): Promise<ApiResponse<UpdateJobResponse>> {
    return this.makeRequest('/api/JobTracker/update',  "POST",request)
  }

  getJobs(request: GetJobsRequest): Promise<ApiResponse<GetJobsResponse>> {
    return this.makeRequest('/api/JobTracker/getJobs', "POST", request)
  }
}

export const jobTrackerApi = new JobTrackerApi()
export type { Job }
