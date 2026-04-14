// Core auth module (defines ApiResponse interface used by others)
export * from './auth';
export * from './health';

// Feature modules - use named exports to avoid duplicate interface conflicts
export { getRooms, getRoomById, createRoom, updateRoom, deleteRoom } from './room';
export type { RoomResponse } from './room';

export { getResidents, getResidentById, createResident, updateResident, deleteResident } from './resident';

export { getContracts, getContractById, createContract, updateContract, deleteContract } from './contract';

export { getBills, getBillById, createBill, updateBill, deleteBill, generateMeterBills, markBillAsPaid } from './bill';

export { getUsers, getCurrentUser, changePassword, activateUser, deactivateUser, deleteUser, uploadAvatar } from './user';

export { getAssetsByRoom, createAsset, updateAsset, deleteAsset } from './asset';

export { getLiquidationSummary, executeLiquidation } from './liquidation';

export { getNotifications, sendNotification, remindUnpaidBills } from './notification';

export { getFeeConfig, updateFeeConfig, getMeterReadings, recordMeterReading, generateCombinedBill } from './service';

export { getTenants, getTenantById, createTenant, updateTenant, deleteTenant, getTenantProfile, updateTenantProfile } from './tenant';

export { getTickets, updateTicketStatus, deleteTicket } from './ticket';

export { getDashboardSummary } from './dashboard';

export { getPortalContractInfo, notifyPortalPayment, getPortalTickets, createPortalTicket, getPortalAssets } from './portal';
