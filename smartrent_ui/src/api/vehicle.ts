import { apiFetch } from '../lib/http'

export interface VehicleResponse {
  id: number
  licensePlate: string
  vehicleType: string
  vehicleTypeName: string
  brand: string
  color: string
  imageUrls: string[]
  monthlyFee: number
  residentId: number
  residentName: string
  roomNumbers: string[]
  notes: string
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

/**
 * Lấy buildingId từ building-selector trên sidebar (selectedBuildingId trong localStorage).
 * KHÔNG dùng getTenantId() vì tenantId != buildingId.
 */
function getSelectedBuildingId(): string | null {
  return localStorage.getItem('selectedBuildingId')
}

export async function getVehicles(params?: {
  page?: number
  size?: number
  search?: string
  vehicleType?: string
  roomId?: number | string
}): Promise<PaginatedResponse<VehicleResponse>> {
  const buildingId = getSelectedBuildingId()
  if (!buildingId) throw new Error("Vui lòng chọn khu trọ trước")

  const searchParams = new URLSearchParams()
  searchParams.append('buildingId', buildingId)
  if (params?.page !== undefined) searchParams.append('page', params.page.toString())
  if (params?.size !== undefined) searchParams.append('size', params.size.toString())
  if (params?.search) searchParams.append('search', params.search)
  if (params?.vehicleType) searchParams.append('vehicleType', params.vehicleType)
  if (params?.roomId) searchParams.append('roomId', params.roomId.toString())

  const response = await apiFetch<ApiResponse<PaginatedResponse<VehicleResponse>>>(
    `/api/vehicles?${searchParams.toString()}`,
    { method: 'GET' }
  )
  if (!response.success || !response.data) throw new Error(response.message || "Có lỗi xảy ra")
  return response.data
}

export async function getVehicleById(id: number): Promise<VehicleResponse> {
  const response = await apiFetch<ApiResponse<VehicleResponse>>(
    `/api/vehicles/${id}`,
    { method: 'GET' }
  )
  if (!response.success || !response.data) throw new Error(response.message)
  return response.data
}

export async function createVehicle(data: any): Promise<VehicleResponse> {
  const buildingId = getSelectedBuildingId()
  if (!buildingId) throw new Error("Vui lòng chọn khu trọ trước")

  const response = await apiFetch<ApiResponse<VehicleResponse>>(`/api/vehicles?buildingId=${buildingId}`, {
    method: 'POST',
    body: data,
  })
  if (!response.success || !response.data) throw new Error(response.message || "Có lỗi xảy ra")
  return response.data
}

export async function updateVehicle(id: number, data: any): Promise<VehicleResponse> {
  const response = await apiFetch<ApiResponse<VehicleResponse>>(`/api/vehicles/${id}`, {
    method: 'PUT',
    body: data,
  })
  if (!response.success || !response.data) throw new Error(response.message)
  return response.data
}

export async function deleteVehicle(id: number): Promise<void> {
  const response = await apiFetch<ApiResponse<void>>(`/api/vehicles/${id}`, {
    method: 'DELETE',
  })
  if (!response.success) throw new Error(response.message)
}
