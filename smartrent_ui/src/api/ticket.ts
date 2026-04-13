import { apiFetch } from '../lib/http';
import { getTenantId } from './auth';

export const getTickets = async (params: { page: number; size: number; status?: string; search?: string }) => {
  const tenantId = getTenantId();
  let url = `/api/tickets?tenantId=${tenantId}&page=${params.page}&size=${params.size}&sort=createdAt,desc`;
  if (params.status) url += `&status=${params.status}`;
  if (params.search) url += `&search=${encodeURIComponent(params.search)}`;

  const res = await apiFetch(url);
  if (!res.success) throw new Error(res.message);
  return res.data;
};

export const updateTicketStatus = async (id: number, status: string) => {
  const tenantId = getTenantId();
  const res = await apiFetch(`/api/tickets/${id}/status?tenantId=${tenantId}&status=${status}`, {
    method: 'PUT',
  });
  if (!res.success) throw new Error(res.message);
  return res.data;
};

export const createTicket = async (data: any) => {
  const tenantId = getTenantId();
  const res = await apiFetch(`/api/tickets?tenantId=${tenantId}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!res.success) throw new Error(res.message);
  return res.data;
};

export const deleteTicket = async (id: number) => {
  const tenantId = getTenantId();
  const res = await apiFetch(`/api/tickets/${id}?tenantId=${tenantId}`, {
    method: 'DELETE',
  });
  if (!res.success) throw new Error(res.message);
  return res.data;
};
