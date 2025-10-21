export interface User {
  username: string
  id: string // Assuming the backend returns an ID, will adjust based on actual response
}

export interface RegisterRequest {
  username: string
  password: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterResponse {
  user: string | User  // Can be string (username) or User object
}

export interface LoginResponse {
  user: string | User  // Can be string (username) or User object
}

export interface ApiResponse<T> {
  data?: T
  error?: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  token?: string // In case we need JWT tokens later
}
