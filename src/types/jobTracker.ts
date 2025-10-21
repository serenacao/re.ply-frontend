export interface Job {
  user: string
  position: string
  company: string
  status: string
}

export interface ApiResponse<T> {
  data?: T
  error?: string
}

export interface AddJobRequest {
  user: string,
  position: string,
  company: string,
  status: string
}

export interface AddJobResponse {
  job: Job
}

export interface RemoveJobRequest {
  user: string
  job: Job
}

export interface RemoveJobResponse {
  job: Job
}

export interface UpdateJobRequest {
  user: string
  job: Job
  position: string,
  company: string,
  status: string
}

export interface UpdateJobResponse {
  job: Job
}

export interface GetJobsRequest {
  user: string
}

export interface GetJobsResponse {
  jobs: Job[]
}
