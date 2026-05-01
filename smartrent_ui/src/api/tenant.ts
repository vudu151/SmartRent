import { apiFetch } from '@/lib/http';
import { getTenantId } from '@/api/auth';
import type { ApiResponse } from './auth';


export interface Tenant {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'CANCELLED';
  createdAt?: string;
  updatedAt?: string;
  bankName?: string;
  bankAccount?: string;
  bankOwner?: string;
  bankQrUrl?: string;
  autoBillingDay?: number;
  paymentDeadlineDay?: number;
  reminderDelayDays?: number;
  reminderFrequencyDays?: number;
}

export interface TenantPageResponse {
  content: Tenant[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export const getTenants = async (params: { search?: string; page?: number; size?: number; sortBy?: string; sortDir?: string } = {}) => {
  const { search = "", page = 0, size = 10, sortBy = "id", sortDir = "DESC" } = params;
  const searchParams = new URLSearchParams();
  if (search) searchParams.append('search', search);
  searchParams.append('page', page.toString());
  searchParams.append('size', size.toString());
  searchParams.append('sortBy', sortBy);
  searchParams.append('sortDir', sortDir);
  
  const res = await apiFetch<ApiResponse<TenantPageResponse>>(`/api/tenants?${searchParams.toString()}`);
  if (!res.success) throw new Error(res.message || 'Lỗi khi lấy danh sách tenant');
  return res.data;
};

export const getTenantById = async (id: number) => {
  const res = await apiFetch<ApiResponse<Tenant>>(`/api/tenants/${id}`);
  if (!res.success) throw new Error(res.message || 'Lỗi khi lấy thông tin tenant');
  return res.data;
};

export const createTenant = async (data: Partial<Tenant>) => {
  const res = await apiFetch<ApiResponse<Tenant>>(`/api/tenants`, {
    method: 'POST',
    body: data,
  });
  if (!res.success) throw new Error(res.message || 'Lỗi khi tạo tenant');
  return res.data;
};

export const updateTenant = async (id: number, data: Partial<Tenant>) => {
  const res = await apiFetch<ApiResponse<Tenant>>(`/api/tenants/${id}`, {
    method: 'PUT',
    body: data,
  });
  if (!res.success) throw new Error(res.message || 'Lỗi khi cập nhật tenant');
  return res.data;
};

export const deleteTenant = async (id: number) => {
  const res = await apiFetch<ApiResponse<void>>(`/api/tenants/${id}`, {
    method: 'DELETE',
  });
  if (!res.success) throw new Error(res.message || 'Lỗi khi xóa tenant');
  return res.data;
};

export const getTenantProfile = async () => {
  const tenantId = getTenantId();
  const res = await apiFetch<ApiResponse<Tenant>>(`/api/tenant-profile?tenantId=${tenantId}`);
  if (!res.success) throw new Error(res.message || 'Lỗi khi lấy hồ sơ tenant');
  return res.data;
};

export const updateTenantProfile = async (data: Partial<Tenant>) => {
  const tenantId = getTenantId();
  const res = await apiFetch<ApiResponse<Tenant>>(`/api/tenant-profile?tenantId=${tenantId}`, {
    method: 'PUT',
    body: data,
  });
  if (!res.success) throw new Error(res.message || 'Lỗi khi cập nhật hồ sơ tenant');
  return res.data;
};

export const updateAutomationSettings = async (data: { autoBillingDay: number; paymentDeadlineDay: number; reminderDelayDays: number; reminderFrequencyDays: number; }) => {
  const tenantId = getTenantId();
  const res = await apiFetch<ApiResponse<void>>(`/api/tenants/${tenantId}/automation-settings`, {
    method: 'PUT',
    body: data,
  });
  if (!res.success) throw new Error(res.message || 'Lỗi khi cập nhật cấu hình tự động hóa');
  return res.data;
};

export const uploadBankQr = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await apiFetch<ApiResponse<{ qrUrl: string }>>(`/api/tenant-profile/qr-upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.success) throw new Error(res.message || 'Upload QR thất bại');
  return res.data;
};

export const sendTestEmail = async (email: string) => {
  const res = await apiFetch<ApiResponse<void>>(`/api/tenant-profile/test-email?email=${encodeURIComponent(email)}`, {
    method: 'POST',
  });
  if (!res.success) throw new Error(res.message || 'Lỗi khi gửi email test');
  return res.data;
};
