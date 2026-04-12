import { apiFetch } from "@/lib/http";
import { getTenantId } from "@/api/auth";

export interface RoomAssetResponse {
  id: number;
  roomId: number;
  roomNumber: string;
  name: string;
  quantity: number;
  condition: string;
  compensationValue: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoomAssetRequest {
  roomId: number;
  name: string;
  quantity: number;
  condition: string;
  compensationValue: number;
  description: string;
}

export const getAssetsByRoom = async (roomId: number) => {
  const tenantId = getTenantId();
  const response = await apiFetch(`/api/assets?roomId=${roomId}&tenantId=${tenantId}`);
  if (!response.success) throw new Error(response.message);
  return response.data;
};

export const createAsset = async (asset: RoomAssetRequest) => {
  const tenantId = getTenantId();
  const response = await apiFetch(`/api/assets?tenantId=${tenantId}`, {
    method: "POST",
    body: asset,
  });
  if (!response.success) throw new Error(response.message);
  return response.data;
};

export const updateAsset = async (id: number, asset: RoomAssetRequest) => {
  const tenantId = getTenantId();
  const response = await apiFetch(`/api/assets/${id}?tenantId=${tenantId}`, {
    method: "PUT",
    body: asset,
  });
  if (!response.success) throw new Error(response.message);
  return response.data;
};

export const deleteAsset = async (id: number) => {
  const tenantId = getTenantId();
  const response = await apiFetch(`/api/assets/${id}?tenantId=${tenantId}`, {
    method: "DELETE",
  });
  if (!response.success) throw new Error(response.message);
  return response.data;
};
