import { apiFetch } from '../lib/http';

export const getPortalContractInfo = async (token: string) => {
  const res = await apiFetch<ApiResponse<any>>(`/api/portal/contract/${token}`);
  if (!res.success) throw new Error(res.message);
  return res.data;
};

export const notifyPortalPayment = async (token: string) => {
  const res = await apiFetch<ApiResponse<any>>(`/api/portal/contract/${token}/notify-payment`, {
    method: 'POST',
  });
  if (!res.success) throw new Error(res.message);
  return res.data;
};

export const getPortalTickets = async (token: string) => {
  const res = await apiFetch<ApiResponse<any>>(`/api/portal/contract/${token}/tickets`);
  if (!res.success) throw new Error(res.message);
  return res.data;
};

export const createPortalTicket = async (token: string, data: any) => {
  const res = await apiFetch<ApiResponse<any>>(`/api/portal/contract/${token}/tickets`, {
    method: 'POST',
    body: data,
  });
  if (!res.success) throw new Error(res.message);
  return res.data;
};

export const getPortalAssets = async (token: string) => {
  const res = await apiFetch<ApiResponse<any>>(`/api/portal/contract/${token}/assets`);
  if (!res.success) throw new Error(res.message);
  return res.data;
};
