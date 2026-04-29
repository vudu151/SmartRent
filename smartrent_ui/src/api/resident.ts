import { apiFetch } from '../lib/http'
import { getTenantId } from './auth'


export interface ResidentResponse {
  id: number
  tenantId: number
  fullName: string
  email: string
  phone: string
  idCard: string
  dateOfBirth: string
  gender: string
  status: string
  notes: string
  rooms?: any[]
  createdAt: string
  updatedAt: string
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

export async function getResidents(params?: {
  page?: number
  size?: number
  search?: string
  status?: string
  roomId?: number | string
}): Promise<PaginatedResponse<ResidentResponse>> {
  const tenantId = getTenantId()
  if (!tenantId) throw new Error("Tenant ID not found")

  const searchParams = new URLSearchParams()
  searchParams.append('tenantId', tenantId.toString())
  if (params?.page !== undefined) searchParams.append('page', params.page.toString())
  if (params?.size !== undefined) searchParams.append('size', params.size.toString())
  if (params?.search) searchParams.append('search', params.search)
  if (params?.status) searchParams.append('status', params.status)
  if (params?.roomId) searchParams.append('roomId', params.roomId.toString())

  const response = await apiFetch<ApiResponse<PaginatedResponse<ResidentResponse>>>(
    `/api/residents?${searchParams.toString()}`,
    { method: 'GET' }
  )
  if (!response.success || !response.data) throw new Error(response.message)
  return response.data
}

export async function getResidentById(id: number): Promise<ResidentResponse> {
  const tenantId = getTenantId()
  const response = await apiFetch<ApiResponse<ResidentResponse>>(
    `/api/residents/${id}?tenantId=${tenantId}`,
    { method: 'GET' }
  )
  if (!response.success || !response.data) throw new Error(response.message)
  return response.data
}

export async function createResident(data: any): Promise<ResidentResponse> {
  const tenantId = getTenantId()
  const response = await apiFetch<ApiResponse<ResidentResponse>>(`/api/residents?tenantId=${tenantId}`, {
    method: 'POST',
    body: { ...data, tenantId },
  })
  if (!response.success || !response.data) throw new Error(response.message)
  return response.data
}

export async function updateResident(id: number, data: any): Promise<ResidentResponse> {
  const tenantId = getTenantId()
  const response = await apiFetch<ApiResponse<ResidentResponse>>(`/api/residents/${id}?tenantId=${tenantId}`, {
    method: 'PUT',
    body: data,
  })
  if (!response.success || !response.data) throw new Error(response.message)
  return response.data
}

export async function deleteResident(id: number): Promise<void> {
  const tenantId = getTenantId()
  const response = await apiFetch<ApiResponse<void>>(`/api/residents/${id}?tenantId=${tenantId}`, {
    method: 'DELETE',
  })
  if (!response.success) throw new Error(response.message)
}
