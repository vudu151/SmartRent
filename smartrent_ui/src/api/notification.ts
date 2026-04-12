import { apiFetch } from "@/lib/http";
import { getTenantId } from "@/api/auth";

export const getNotifications = async (params: any) => {
  const tenantId = getTenantId();
  const res = await apiFetch(`/api/notifications?tenantId=${tenantId}`, {
    method: "GET",
    params: params
  });
  return res.data;
};

export const sendNotification = async (data: any) => {
  const tenantId = getTenantId();
  const res = await apiFetch(`/api/notifications/send?tenantId=${tenantId}`, {
    method: "POST",
    body: data,
  });
  return res.data;
};

export const remindUnpaidBills = async () => {
  const tenantId = getTenantId();
  const res = await apiFetch(`/api/notifications/remind-unpaid?tenantId=${tenantId}`, {
    method: "POST"
  });
  return res.data;
};
