import { apiFetch } from "@/lib/http";
import { getTenantId } from "@/api/auth";

export const getNotifications = async (params?: { page?: number; size?: number }) => {
  const tenantId = getTenantId();
  const searchParams = new URLSearchParams();
  searchParams.append('tenantId', tenantId.toString());
  if (params?.page !== undefined) searchParams.append('page', params.page.toString());
  if (params?.size !== undefined) searchParams.append('size', params.size.toString());

  const res = await apiFetch<ApiResponse<any>>(`/api/notifications?${searchParams.toString()}`);
  return res.data;
};

export const sendNotification = async (data: any) => {
  const tenantId = getTenantId();
  const res = await apiFetch<ApiResponse<any>>(`/api/notifications/send`, {
    method: "POST",
    body: { ...data, tenantId },
  });
  return res.data;
};

export const remindUnpaidBills = async () => {
  const tenantId = getTenantId();
  const res = await apiFetch<ApiResponse<any>>(`/api/notifications/remind-unpaid?tenantId=${tenantId}`, {
    method: "POST"
  });
  return res.data;
};
