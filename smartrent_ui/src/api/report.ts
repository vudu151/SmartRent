import { apiFetch } from '../lib/http'
import { getTenantId } from './auth'
import type { ApiResponse } from './room'

export interface ReportData {
  totalRevenue: number;
  revenueByType: {
    type: string;
    amount: number;
  }[];
  revenueByRoom: {
    roomNumber: string;
    amount: number;
  }[];
}

export async function getRevenueReport(params?: { month?: number; year?: number }): Promise<ReportData> {
  const tenantId = getTenantId()
  const searchParams = new URLSearchParams()
  searchParams.append('tenantId', tenantId.toString())
  if (params?.month !== undefined) searchParams.append('month', params.month.toString())
  if (params?.year !== undefined) searchParams.append('year', params.year.toString())

  const response = await apiFetch<ApiResponse<ReportData>>(
    `/api/reports/revenue?${searchParams.toString()}`,
    { method: 'GET' }
  )
  if (!response.success || !response.data) throw new Error(response.message)
  return response.data
}
