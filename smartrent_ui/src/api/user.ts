import { apiFetch } from '../lib/http'
import { getTenantId } from './auth'

export interface UserResponse {
  id: number
  username: string
  fullName: string
  email: string
  phone: string
  role: string
  status: string
  createdAt: string
}

export interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

export async function getUsers(params?: {
  page?: number
  size?: number
  search?: string
}): Promise<PaginatedResponse<UserResponse>> {
  const tenantId = getTenantId()
  const searchParams = new URLSearchParams()
  if (tenantId) searchParams.append('tenantId', tenantId.toString())
  if (params?.page !== undefined) searchParams.append('page', params.page.toString())
  if (params?.size !== undefined) searchParams.append('size', params.size.toString())
  if (params?.search) searchParams.append('search', params.search)

  const response = await apiFetch<ApiResponse<PaginatedResponse<UserResponse>>>(
    `/api/users?${searchParams.toString()}`,
    { method: 'GET' }
  )
  if (!response.success || !response.data) throw new Error(response.message)
  return response.data
}

export async function getCurrentUser(): Promise<UserResponse> {
  const response = await apiFetch<ApiResponse<UserResponse>>('/api/users/me', {
    method: 'GET'
  })
  if (!response.success || !response.data) throw new Error(response.message)
  return response.data
}

export async function changePassword(data: any): Promise<void> {
  const response = await apiFetch<ApiResponse<void>>('/api/users/change-password', {
    method: 'POST',
    body: data,
  })
  if (!response.success) throw new Error(response.message || 'Lỗi đổi mật khẩu')
}

export async function createUser(data: any): Promise<UserResponse> {
  const response = await apiFetch<ApiResponse<UserResponse>>('/api/users', {
    method: 'POST',
    body: data,
  })
  if (!response.success || !response.data) throw new Error(response.message || 'Lỗi khi tạo tài khoản')
  return response.data
}

export async function activateUser(id: number): Promise<void> {
  const response = await apiFetch<ApiResponse<void>>(`/api/users/${id}/activate`, {
    method: 'PATCH'
  })
  if (!response.success) throw new Error(response.message)
}

export async function deactivateUser(id: number): Promise<void> {
  const response = await apiFetch<ApiResponse<void>>(`/api/users/${id}/deactivate`, {
    method: 'PATCH'
  })
  if (!response.success) throw new Error(response.message)
}

export async function deleteUser(id: number): Promise<void> {
  const response = await apiFetch<ApiResponse<void>>(`/api/users/${id}`, {
    method: 'DELETE'
  })
  if (!response.success) throw new Error(response.message)
}

export async function uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
  const formData = new FormData()
  formData.append('file', file)
  const response = await apiFetch<ApiResponse<{ avatarUrl: string }>>('/api/users/me/avatar', {
    method: 'POST',
    body: formData,
  })
  if (!response.success || !response.data) throw new Error(response.message)
  return response.data
}

export async function getMyPortalToken(): Promise<{ portalToken: string }> {
  const response = await apiFetch<ApiResponse<{ portalToken: string }>>('/api/users/me/portal', {
    method: 'GET'
  })
  if (!response.success || !response.data) throw new Error(response.message || 'Không thể lấy thông tin portal')
  return response.data
}
