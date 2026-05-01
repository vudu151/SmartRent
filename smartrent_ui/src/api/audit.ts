import { apiFetch } from '../lib/http';
import type { ApiResponse } from './auth';
import { getUserInfo } from '@/lib/token';

export interface AuditLog {
  id: number;
  username: string;
  action: string;
  entityName: string;
  entityId: number | null;
  details: string;
  timestamp: string;
}

export const getAuditLogs = async () => {
  const tenantId = getUserInfo()?.tenantId || '';
  const res = await apiFetch<ApiResponse<AuditLog[]>>(`/api/audit-logs?tenantId=${tenantId}`);
  if (!res.success) throw new Error(res.message || 'Lỗi khi lấy lịch sử thao tác');
  return res.data;
};
