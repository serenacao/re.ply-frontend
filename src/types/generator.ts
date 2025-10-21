import type { File } from './fileStorage'

export interface GenerateRequest {
  question: string
  files: File[]
}

export interface GenerateResponse {
  draft: string
}

export interface EditRequest {
  newDraft: string
}

export interface AcceptRequest {
  // Empty request body
}

export interface FeedbackRequest {
  comment: string
}

export interface FeedbackResponse {
  draft: string
}

export interface ApiResponse<T> {
  data?: T
  error?: string
}

export interface GeneratorState {
  question: string
  draft: string
  accepted: boolean
  feedbackHistory: string[]
}
