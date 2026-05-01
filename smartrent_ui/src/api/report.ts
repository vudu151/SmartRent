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

export async function exportRevenueReportExcel(params?: { month?: number; year?: number }): Promise<void> {
  const tenantId = getTenantId()
  const searchParams = new URLSearchParams()
  searchParams.append('tenantId', tenantId.toString())
  if (params?.month !== undefined) searchParams.append('month', params.month.toString())
  if (params?.year !== undefined) searchParams.append('year', params.year.toString())

  const token = localStorage.getItem('token') // Use the token directly from local storage if available
  const url = `http://localhost:8080/api/reports/revenue/export?${searchParams.toString()}`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  if (!response.ok) throw new Error('Không thể tải file Excel báo cáo')

  const blob = await response.blob()
  const downloadUrl = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = downloadUrl
  a.download = `BaoCaoDoanhThu${params?.month ? '_T' + params.month : ''}_${params?.year}.xlsx`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(downloadUrl)
}
