import { apiFetch } from '../lib/http';
import { getTenantId } from './auth';

export const getFeeConfig = async () => {
  const tenantId = getTenantId();
  const res = await apiFetch(`/api/services/fees?tenantId=${tenantId}`);
  if (!res.success) throw new Error(res.message);
  return res.data;
};

export const updateFeeConfig = async (data: any) => {
  const tenantId = getTenantId();
  const res = await apiFetch(`/api/services/fees?tenantId=${tenantId}`, {
    method: 'PUT',
    body: data,
  });
  if (!res.success) throw new Error(res.message);
  return res.data;
};

export const getMeterReadings = async (month: number, year: number, search?: string) => {
  const tenantId = getTenantId();
  let url = `/api/services/meters?tenantId=${tenantId}&month=${month}&year=${year}&size=100`;
  if (search) url += `&search=${search}`;
  const res = await apiFetch(url);
  if (!res.success) throw new Error(res.message);
  return res.data;
};

export const recordMeterReading = async (data: any) => {
  const tenantId = getTenantId();
  const res = await apiFetch(`/api/services/meters?tenantId=${tenantId}`, {
    method: 'POST',
    body: data,
  });
  if (!res.success) throw new Error(res.message);
  return res.data;
};

export const generateCombinedBill = async (roomId: number, month: number, year: number) => {
  const tenantId = getTenantId();
  const res = await apiFetch(`/api/services/generate-bill?tenantId=${tenantId}&roomId=${roomId}&month=${month}&year=${year}`, {
    method: 'POST',
  });
  if (!res.success) throw new Error(res.message);
  return res.data;
};
