import type { 
  GenerateRequest, 
  GenerateResponse,
  EditRequest,
  FeedbackRequest,
  FeedbackResponse,
  ApiResponse 
} from '../types/generator'
import { API_BASE_URL } from './api'

class GeneratorApi {
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

  async generate(request: GenerateRequest): Promise<ApiResponse<GenerateResponse>> {
    return this.makeRequest('/api/Generator/generate', 'POST', request)
  }

  async edit(request: EditRequest): Promise<ApiResponse<{}>> {
    return this.makeRequest('/api/Generator/edit', 'POST', request)
  }

  async feedback(request: FeedbackRequest): Promise<ApiResponse<FeedbackResponse>> {
    return this.makeRequest('/api/Generator/feedback', 'POST', request)
  }
}

export const generatorApi = new GeneratorApi()
