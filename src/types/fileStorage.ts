<<<<<<< HEAD

export interface File {
    _id: string; // Unique identifier for the file itself
  userId: string; // The user ID to whom this file belongs
  name: string; // The name of the file (e.g., "resume.txt")
  content: string; // The actual content of the file
}
=======
export interface File {
  name: string
  content: string
}

>>>>>>> 476b389ac99b9569e494840ca70e14c42779d987
export interface UploadFileRequest {
  user: string
  name: string
  content: string
}

<<<<<<< HEAD
export interface UploadFileResponse {
  fileId: string
}


=======
>>>>>>> 476b389ac99b9569e494840ca70e14c42779d987
export interface RemoveFileRequest {
  user: string
  name: string
}

<<<<<<< HEAD
export interface RemoveFileResponse {
  fileId: string
}

=======
>>>>>>> 476b389ac99b9569e494840ca70e14c42779d987
export interface RenameFileRequest {
  user: string
  name: string
  newName: string
}

<<<<<<< HEAD
export interface RenameFileResponse {
  fileId: string
}

=======
>>>>>>> 476b389ac99b9569e494840ca70e14c42779d987
export interface FilesRequest {
  user: string
}

<<<<<<< HEAD
export interface FilesResponse {
  files: File[]
}

=======
>>>>>>> 476b389ac99b9569e494840ca70e14c42779d987
export interface ApiResponse<T> {
  data?: T
  error?: string
}
