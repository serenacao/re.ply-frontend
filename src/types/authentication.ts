export interface User {
  username: string
  password: string
  _id: string // Assuming the backend returns an ID, will adjust based on actual response
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
  user: User  
}

export interface LoginResponse {
  user: User 
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
