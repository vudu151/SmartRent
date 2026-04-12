import { apiFetch } from "@/lib/http";
import { getTenantId } from "@/api/auth";

export const getContracts = async (params: any) => {
  const tenantId = getTenantId();
  const res = await apiFetch(`/api/contracts?tenantId=${tenantId}`, {
    method: "GET",
    params: params
  });
  // Note: apiFetch already returns response.data
  return res.data; 
};

export const getContractById = async (id: number) => {
  const tenantId = getTenantId();
  const res = await apiFetch(`/api/contracts/${id}?tenantId=${tenantId}`);
  return res.data;
};

export const createContract = async (data: any) => {
  const tenantId = getTenantId();
  const res = await apiFetch(`/api/contracts?tenantId=${tenantId}`, {
    method: "POST",
    body: data,
  });
  return res.data;
};

export const updateContract = async (id: number, data: any) => {
  const tenantId = getTenantId();
  const res = await apiFetch(`/api/contracts/${id}?tenantId=${tenantId}`, {
    method: "PUT",
    body: data,
  });
  return res.data;
};

export const deleteContract = async (id: number) => {
  const tenantId = getTenantId();
  const res = await apiFetch(`/api/contracts/${id}?tenantId=${tenantId}`, {
    method: "DELETE",
  });
  return res.data;
};
