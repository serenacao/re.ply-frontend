
export interface File {
    _id: string; // Unique identifier for the file itself
  userId: string; // The user ID to whom this file belongs
  name: string; // The name of the file (e.g., "resume.txt")
  content: string; // The actual content of the file
}
export interface UploadFileRequest {
  user: string
  name: string
  content: string
}

export interface UploadFileResponse {
  fileId: string
}


export interface RemoveFileRequest {
  user: string
  name: string
}

export interface RemoveFileResponse {
  fileId: string
}

export interface RenameFileRequest {
  user: string
  name: string
  newName: string
}

export interface RenameFileResponse {
  fileId: string
}

export interface FilesRequest {
  user: string
}

export interface FilesResponse {
  files: File[]
}

export interface ApiResponse<T> {
  data?: T
  error?: string
}
