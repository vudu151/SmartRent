import { apiFetch } from '../lib/http';
import { getTenantId } from './auth';

export const getDashboardSummary = async (months: number = 6) => {
  const tenantId = getTenantId();
  const res = await apiFetch(`/api/dashboard/summary?tenantId=${tenantId}&months=${months}`);
  if (!res.success) throw new Error(res.message);
  return res.data;
};
