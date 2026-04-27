import { apiFetch } from "@/lib/http";
import { getTenantId } from "@/api/auth";
import type { ApiResponse } from "@/api/auth";

export const getContracts = async (params: any) => {
  const tenantId = getTenantId();
  const searchParams = new URLSearchParams();
  searchParams.append('tenantId', tenantId.toString());
  if (params?.page !== undefined) searchParams.append('page', params.page.toString());
  if (params?.size !== undefined) searchParams.append('size', params.size.toString());
  if (params?.search) searchParams.append('search', params.search);
  if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
  if (params?.sortDir) searchParams.append('sortDir', params.sortDir);

  const res = await apiFetch<ApiResponse<any>>(`/api/contracts?${searchParams.toString()}`);
  return res.data; 
};

export const getContractById = async (id: number) => {
  const tenantId = getTenantId();
  const res = await apiFetch<ApiResponse<any>>(`/api/contracts/${id}?tenantId=${tenantId}`);
  return res.data;
};

export const createContract = async (data: any) => {
  const tenantId = getTenantId();
  const res = await apiFetch<ApiResponse<any>>(`/api/contracts?tenantId=${tenantId}`, {
    method: "POST",
    body: data,
  });
  return res.data;
};

export const updateContract = async (id: number, data: any) => {
  const tenantId = getTenantId();
  const res = await apiFetch<ApiResponse<any>>(`/api/contracts/${id}?tenantId=${tenantId}`, {
    method: "PUT",
    body: data,
  });
  return res.data;
};

export const deleteContract = async (id: number) => {
  const tenantId = getTenantId();
  const res = await apiFetch<ApiResponse<any>>(`/api/contracts/${id}?tenantId=${tenantId}`, {
    method: "DELETE",
  });
  return res.data;
};
