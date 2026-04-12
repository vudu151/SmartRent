import { apiFetch } from '../lib/http'
import { getTenantId } from './auth'

export interface BillResponse {
  id: number
  tenantId: number
  roomId?: number
  roomNumber: string
  billType: string
  amount: number
  description: string
  dueDate: string
  status: string
  paymentDate?: string
  paymentReference?: string
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

export async function getBills(params?: {
  page?: number
  size?: number
  status?: string
  billType?: string
  roomNumber?: string
}): Promise<PaginatedResponse<BillResponse>> {
  const tenantId = getTenantId()
  const searchParams = new URLSearchParams()
  searchParams.append('tenantId', tenantId.toString())
  if (params?.page !== undefined) searchParams.append('page', params.page.toString())
  if (params?.size !== undefined) searchParams.append('size', params.size.toString())
  if (params?.status) searchParams.append('status', params.status)
  if (params?.billType) searchParams.append('billType', params.billType)
  if (params?.roomNumber) searchParams.append('roomNumber', params.roomNumber)

  const response = await apiFetch<ApiResponse<PaginatedResponse<BillResponse>>>(
    `/api/bills?${searchParams.toString()}`,
    { method: 'GET' }
  )
  if (!response.success || !response.data) throw new Error(response.message)
  return response.data
}

export async function getBillById(id: number): Promise<BillResponse> {
  const tenantId = getTenantId()
  const response = await apiFetch<ApiResponse<BillResponse>>(
    `/api/bills/${id}?tenantId=${tenantId}`,
    { method: 'GET' }
  )
  if (!response.success || !response.data) throw new Error(response.message)
  return response.data
}

export async function createBill(data: any): Promise<BillResponse> {
  data.tenantId = getTenantId()
  const response = await apiFetch<ApiResponse<BillResponse>>('/api/bills', {
    method: 'POST',
    body: data,
  })
  if (!response.success || !response.data) throw new Error(response.message)
  return response.data
}

export async function updateBill(id: number, data: any): Promise<BillResponse> {
  const tenantId = getTenantId()
  const response = await apiFetch<ApiResponse<BillResponse>>(`/api/bills/${id}?tenantId=${tenantId}`, {
    method: 'PUT',
    body: data,
  })
  if (!response.success || !response.data) throw new Error(response.message)
  return response.data
}

export const deleteBill = async (id: number) => {
  const tenantId = getTenantId();
  const res = await apiFetch<ApiResponse<void>>(`/api/bills/${id}?tenantId=${tenantId}`, {
    method: 'DELETE',
  });
  if (!res.success) throw new Error(res.message);
  return res.data;
};

export const generateMeterBills = async (readings: any[]) => {
  const tenantId = getTenantId();
  const res = await apiFetch<ApiResponse<any>>(`/api/bills/meter-readings?tenantId=${tenantId}`, {
    method: 'POST',
    body: { readings }
  });
  if (!res.success) throw new Error(res.message);
  return res.data;
};

export async function markBillAsPaid(id: number, paymentReference?: string): Promise<BillResponse> {
  const tenantId = getTenantId()
  const url = `/api/bills/${id}/mark-paid?tenantId=${tenantId}${paymentReference ? `&paymentReference=${encodeURIComponent(paymentReference)}` : ''}`
  const response = await apiFetch<ApiResponse<BillResponse>>(url, {
    method: 'POST',
  })
  if (!response.success || !response.data) throw new Error(response.message)
  return response.data
}
