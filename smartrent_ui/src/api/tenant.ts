import { apiFetch } from '../lib/http'

export interface CreateTenantRequest {
  name: string
  email: string
  phone?: string
  address?: string
  taxCode?: string
}

export interface UpdateTenantRequest {
  name?: string
  email?: string
  phone?: string
  address?: string
  taxCode?: string
}

export interface TenantResponse {
  id: number
  name: string
  email: string
  phone: string | null
  address: string | null
  taxCode: string | null
  status: string
  createdAt: string
  updatedAt: string
}

export interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: {
    code?: string
    message?: string
    details?: unknown
  }
}

/**
 * Get all tenants with pagination
 */
export async function getTenants(params?: {
  page?: number
  size?: number
  sortBy?: string
  sortDir?: 'ASC' | 'DESC'
}): Promise<PaginatedResponse<TenantResponse>> {
  const searchParams = new URLSearchParams()
  if (params?.page !== undefined) searchParams.append('page', params.page.toString())
  if (params?.size !== undefined) searchParams.append('size', params.size.toString())
  if (params?.sortBy) searchParams.append('sortBy', params.sortBy)
  if (params?.sortDir) searchParams.append('sortDir', params.sortDir)

  const queryString = searchParams.toString()
  const url = `/api/tenants${queryString ? `?${queryString}` : ''}`

  const response = await apiFetch<ApiResponse<PaginatedResponse<TenantResponse>>>(url, {
    method: 'GET',
  })

  if (!response.success || !response.data) {
    const error = new Error(response.error?.message || response.message || 'Failed to fetch tenants')
    ;(error as any).error = response.error
    ;(error as any).response = { data: response }
    throw error
  }

  return response.data
}

/**
 * Get tenant by ID
 */
export async function getTenantById(id: number): Promise<TenantResponse> {
  const response = await apiFetch<ApiResponse<TenantResponse>>(`/api/tenants/${id}`, {
    method: 'GET',
  })

  if (!response.success || !response.data) {
    const error = new Error(response.error?.message || response.message || 'Failed to fetch tenant')
    ;(error as any).error = response.error
    ;(error as any).response = { data: response }
    throw error
  }

  return response.data
}

/**
 * Create new tenant
 */
export async function createTenant(request: CreateTenantRequest): Promise<TenantResponse> {
  const response = await apiFetch<ApiResponse<TenantResponse>>('/api/tenants', {
    method: 'POST',
    body: request as any,
  })

  if (!response.success || !response.data) {
    const error = new Error(response.error?.message || response.message || 'Failed to create tenant')
    ;(error as any).error = response.error
    ;(error as any).response = { data: response }
    throw error
  }

  return response.data
}

/**
 * Update tenant
 */
export async function updateTenant(id: number, request: UpdateTenantRequest): Promise<TenantResponse> {
  const response = await apiFetch<ApiResponse<TenantResponse>>(`/api/tenants/${id}`, {
    method: 'PUT',
    body: request as any,
  })

  if (!response.success || !response.data) {
    const error = new Error(response.error?.message || response.message || 'Failed to update tenant')
    ;(error as any).error = response.error
    ;(error as any).response = { data: response }
    throw error
  }

  return response.data
}

/**
 * Delete tenant
 */
export async function deleteTenant(id: number): Promise<void> {
  const response = await apiFetch<ApiResponse<void>>(`/api/tenants/${id}`, {
    method: 'DELETE',
  })

  if (!response.success) {
    const error = new Error(response.error?.message || response.message || 'Failed to delete tenant')
    ;(error as any).error = response.error
    ;(error as any).response = { data: response }
    throw error
  }
}

/**
 * Update tenant status
 */
export async function updateTenantStatus(id: number, status: 'ACTIVE' | 'SUSPENDED' | 'CANCELLED'): Promise<TenantResponse> {
  const response = await apiFetch<ApiResponse<TenantResponse>>(`/api/tenants/${id}/status?status=${status}`, {
    method: 'PATCH',
  })

  if (!response.success || !response.data) {
    const error = new Error(response.error?.message || response.message || 'Failed to update tenant status')
    ;(error as any).error = response.error
    ;(error as any).response = { data: response }
    throw error
  }

  return response.data
}
