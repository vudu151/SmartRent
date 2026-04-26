import { apiFetch } from "@/lib/http";
import { getTenantId } from "@/api/auth";

export interface LiquidationSummary {
  contractId: number;
  contractNumber: string;
  roomNumber: string;
  residentName: string;
  depositAmount: number;
  unpaidBills: { title: string; amount: number }[];
  proRatedRent: number;
  totalDebts: number;
  finalRefund: number;
}

export const getLiquidationSummary = async (contractId: number, stayDays: number = 0) => {
  const tenantId = getTenantId();
  const response = await apiFetch<ApiResponse<any>>(`/api/contracts/${contractId}/liquidation?tenantId=${tenantId}&stayDays=${stayDays}`);
  if (!response.success) throw new Error(response.message);
  return response.data as LiquidationSummary;
};

export const executeLiquidation = async (contractId: number, data: { stayDays: number; otherDeductions: number; notes: string }) => {
  const tenantId = getTenantId();
  const response = await apiFetch<ApiResponse<any>>(`/api/contracts/${contractId}/liquidate?tenantId=${tenantId}`, {
    method: "POST",
    body: data,
  });
  if (!response.success) throw new Error(response.message);
  return response.data;
};
