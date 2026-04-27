import { apiFetch } from '../lib/http';
import { getTenantId } from './auth';
import type { ApiResponse } from './auth';


export const getDashboardSummary = async (months: number = 6) => {
  const tenantId = getTenantId();
  const res = await apiFetch<ApiResponse<any>>(`/api/dashboard/summary?tenantId=${tenantId}&months=${months}`);
  if (!res.success) throw new Error(res.message);
  return res.data;
};
