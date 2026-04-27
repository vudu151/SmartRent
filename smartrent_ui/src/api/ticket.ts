import { apiFetch } from '../lib/http';
import { getTenantId } from './auth';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export const getTickets = async (params: { page: number; size: number; status?: string; search?: string }) => {
  const tenantId = getTenantId();
  let url = `/api/tickets?tenantId=${tenantId}&page=${params.page}&size=${params.size}&sort=createdAt,desc`;
  if (params.status) url += `&status=${params.status}`;
  if (params.search) url += `&search=${encodeURIComponent(params.search)}`;

  const res = await apiFetch<ApiResponse<any>>(url);
  if (!res.success) throw new Error(res.message);
  return res.data;
};

export const updateTicketStatus = async (id: number, status: string) => {
  const tenantId = getTenantId();
  const res = await apiFetch<ApiResponse<any>>(`/api/tickets/${id}/status?tenantId=${tenantId}&status=${status}`, {
    method: 'PUT',
  });
  if (!res.success) throw new Error(res.message);
  return res.data;
};

export const createTicket = async (data: any) => {
  const tenantId = getTenantId();
  const { residentName, ...payload } = data; // loại bỏ field FE-only
  const res = await apiFetch<ApiResponse<any>>(`/api/tickets?tenantId=${tenantId}`, {
    method: 'POST',
    body: payload,
  });
  if (!res.success) throw new Error(res.message);
  return res.data;
};

export const deleteTicket = async (id: number) => {
  const tenantId = getTenantId();
  const res = await apiFetch<ApiResponse<any>>(`/api/tickets/${id}?tenantId=${tenantId}`, {
    method: 'DELETE',
  });
  if (!res.success) throw new Error(res.message);
  return res.data;
};

export const updateTicket = async (id: number, data: any) => {
  const tenantId = getTenantId();
  const { residentName, ...payload } = data;
  const res = await apiFetch<ApiResponse<any>>(`/api/tickets/${id}?tenantId=${tenantId}`, {
    method: 'PUT',
    body: payload,
  });
  if (!res.success) throw new Error(res.message);
  return res.data;
};
