import type { 
  UploadFileRequest, 
  RemoveFileRequest, 
  RenameFileRequest, 
  FilesRequest,
  ApiResponse, 
  UploadFileResponse,
  RemoveFileResponse,
  RenameFileResponse,
  FilesResponse
} from '../types/fileStorage'
import { API_BASE_URL } from './api'


class FileStorageApi {
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

  async uploadFile(request: UploadFileRequest): Promise<ApiResponse<UploadFileResponse>> {
    return this.makeRequest('/api/FileStorage/upload', 'POST', request)
  }

  async removeFile(request: RemoveFileRequest): Promise<ApiResponse<RemoveFileResponse>> {
    return this.makeRequest('/api/FileStorage/remove', 'POST', request)
  }

  async renameFile(request: RenameFileRequest): Promise<ApiResponse<RenameFileResponse>> {
    return this.makeRequest('/api/FileStorage/rename', 'POST', request)
  }

  async getFiles(request: FilesRequest): Promise<ApiResponse<FilesResponse>> {
    return this.makeRequest('/api/FileStorage/files', 'POST', request)
  }
}

export const fileStorageApi = new FileStorageApi()
