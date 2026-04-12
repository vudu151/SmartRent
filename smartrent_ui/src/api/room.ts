import { apiFetch } from '../lib/http'
import { getTenantId } from './auth'

export interface RoomResponse {
  id: number
  tenantId: number
  roomNumber: string
  floor: number
  area: number
  status: string
  type: string
  description: string
  price: number
  residentCount: number
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
  error?: any
}

export async function getRooms(params?: {
  page?: number
  size?: number
  status?: string
  type?: string
  floor?: number
  search?: string
}): Promise<PaginatedResponse<RoomResponse>> {
  const tenantId = getTenantId()
  const searchParams = new URLSearchParams()
  searchParams.append('tenantId', tenantId.toString())
  if (params?.page !== undefined) searchParams.append('page', params.page.toString())
  if (params?.size !== undefined) searchParams.append('size', params.size.toString())
  if (params?.status) searchParams.append('status', params.status)
  if (params?.type) searchParams.append('type', params.type)
  if (params?.floor !== undefined) searchParams.append('floor', params.floor.toString())
  if (params?.search) searchParams.append('search', params.search)

  const response = await apiFetch<ApiResponse<PaginatedResponse<RoomResponse>>>(
    `/api/rooms?${searchParams.toString()}`,
    { method: 'GET' }
  )
  if (!response.success || !response.data) throw new Error(response.message)
  return response.data
}

export async function getRoomById(id: number): Promise<RoomResponse> {
  const tenantId = getTenantId()
  const response = await apiFetch<ApiResponse<RoomResponse>>(
    `/api/rooms/${id}?tenantId=${tenantId}`,
    { method: 'GET' }
  )
  if (!response.success || !response.data) throw new Error(response.message)
  return response.data
}

export async function createRoom(data: Partial<RoomResponse>): Promise<RoomResponse> {
  data.tenantId = getTenantId()
  const response = await apiFetch<ApiResponse<RoomResponse>>('/api/rooms', {
    method: 'POST',
    body: data as any,
  })
  if (!response.success || !response.data) throw new Error(response.message)
  return response.data
}

export async function updateRoom(id: number, data: Partial<RoomResponse>): Promise<RoomResponse> {
  const tenantId = getTenantId()
  const response = await apiFetch<ApiResponse<RoomResponse>>(`/api/rooms/${id}?tenantId=${tenantId}`, {
    method: 'PUT',
    body: data as any,
  })
  if (!response.success || !response.data) throw new Error(response.message)
  return response.data
}

export async function deleteRoom(id: number): Promise<void> {
  const tenantId = getTenantId()
  const response = await apiFetch<ApiResponse<void>>(`/api/rooms/${id}?tenantId=${tenantId}`, {
    method: 'DELETE',
  })
  if (!response.success) throw new Error(response.message)
}
