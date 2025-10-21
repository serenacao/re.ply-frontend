import type { 
  RegisterRequest, 
  LoginRequest,
  RegisterResponse,
  LoginResponse,
  ApiResponse, 
  VerifyTokenRequest,
  VerifyTokenResponse
} from '../types/authentication'
import { API_BASE_URL } from './api'


class AuthApi {
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

  async register(request: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
    return this.makeRequest('/api/UserAuthentication/register', 'POST', request)
  }

  async login(request: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return this.makeRequest('/api/UserAuthentication/authenticate', 'POST', request)
  }

  async verifyToken(request: VerifyTokenRequest): Promise<ApiResponse<VerifyTokenResponse>> {
    return this.makeRequest('/api/UserAuthentication/verifyToken', 'POST', request)
  }
}

export const authApi = new AuthApi()
