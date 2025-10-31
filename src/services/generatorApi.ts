import type { 
  GenerateRequest, 
  GenerateResponse,
  EditRequest,
  FeedbackRequest,
  FeedbackResponse,
  ApiResponse 
} from '../types/generator'

const API_BASE_URL = 'http://localhost:8000'

class GeneratorApi {
  private async makeRequest<T>(
    endpoint: string, 
    method: 'GET' | 'POST' | 'PUT' | 'DELETE', 
    body?: any
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      })

      const data = await response.json()

      if (!response.ok) {
        return { error: data.error || 'An error occurred' }
      }

      return { data }
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : 'Network error' 
      }
    }
  }

  async generate(request: GenerateRequest): Promise<ApiResponse<GenerateResponse>> {
    console.log('request', request)
    console.log('request question', request.question)
    console.log('request files,', request.files)
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
