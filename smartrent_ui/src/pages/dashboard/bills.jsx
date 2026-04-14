import React from "react";
import {
  Card,
  CardBody,
  Typography,
  Button,
  Input,
  IconButton,
  Chip,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Alert,
  Select,
  Option,
} from "@material-tailwind/react";
import { PlusIcon, PencilIcon, TrashIcon, CheckCircleIcon, MagnifyingGlassIcon, BellIcon } from "@heroicons/react/24/solid";
import { useNavbarHeader } from "@/context/navbar-header";
import { getBills, deleteBill, markBillAsPaid } from "@/api/bill";
import { remindUnpaidBills } from "@/api/notification";
import { BillModal } from "./bill-form";
import { showToast } from "@/lib/swal";

export function Bills() {
  const { setNavbarHeader } = useNavbarHeader();
  const [bills, setBills] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [error, setError] = React.useState("");

  const [roomNumber, setRoomNumber] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("");

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [billToDelete, setBillToDelete] = React.useState(null);
  const [payDialogOpen, setPayDialogOpen] = React.useState(false);
  const [billToPay, setBillToPay] = React.useState(null);
  const [paymentRef, setPaymentRef] = React.useState("");
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedBillId, setSelectedBillId] = React.useState(null);

  const [page, setPage] = React.useState(1);
  const [size, setSize] = React.useState(10);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalElements, setTotalElements] = React.useState(0);

  const loadBills = React.useCallback(async () => {
    try {
      setLoading(true); setError("");
      const response = await getBills({ page: page - 1, size, roomNumber: roomNumber || undefined, status: statusFilter || undefined, billType: typeFilter || undefined });
      setBills(response.content || []);
      setTotalPages(response.totalPages || 1);
      setTotalElements(response.totalElements || 0);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách hóa đơn.");
    } finally { setLoading(false); }
  }, [page, size, roomNumber, statusFilter, typeFilter]);

  React.useEffect(() => { loadBills(); }, [loadBills]);
  React.useEffect(() => { setPage(1); }, [size, roomNumber, statusFilter, typeFilter]);

  const handleRemind = async () => {
    try { setLoading(true); await remindUnpaidBills(); showToast("Đã gửi thông báo nhắc nợ!", "success"); } catch (err) { showToast(err.message || "Không thể gửi nhắc nợ", "error"); } finally { setLoading(false); }
  };

  const handleAdd = () => { setSelectedBillId(null); setIsModalOpen(true); };

  React.useEffect(() => {
    setNavbarHeader(
      <div className="flex items-center justify-between gap-3 w-full">
        <div className="min-w-0 shrink-0">
          <Typography variant="h6" color="blue-gray" className="font-bold truncate">Quản lý Phiếu Thu</Typography>
          <Typography color="gray" className="font-normal text-xs">Theo dõi thanh toán tiền phòng và dịch vụ</Typography>
        </div>
        <div className="flex items-center gap-2 flex-1 justify-end">
          <input
            type="text"
            placeholder="Tìm số phòng..."
            className="text-sm border border-blue-gray-200 rounded-lg px-3 py-1.5 w-32 bg-white text-blue-gray-700 focus:outline-none focus:border-blue-500"
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
          />
          <select
            className="text-sm border border-blue-gray-200 rounded-lg px-2 py-1.5 bg-white text-blue-gray-700 focus:outline-none focus:border-blue-500 cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Trạng thái</option>
            <option value="UNPAID">Chưa Thu</option>
            <option value="PAID">Đã Thu</option>
            <option value="OVERDUE">Quá Hạn</option>
          </select>
          <select
            className="text-sm border border-blue-gray-200 rounded-lg px-2 py-1.5 bg-white text-blue-gray-700 focus:outline-none focus:border-blue-500 cursor-pointer"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">Loại phí</option>
            <option value="RENT">Tiền Phòng</option>
            <option value="ELECTRICITY">Tiền Điện</option>
            <option value="WATER">Tiền Nước</option>
            <option value="SERVICE">Dịch Vụ</option>
          </select>
          <Button variant="outlined" color="blue-gray" size="sm" className="flex items-center gap-1 whitespace-nowrap" onClick={handleRemind} disabled={loading}>
            <BellIcon className="h-3 w-3" /> Nhắc Nợ
          </Button>
          <Button variant="gradient" color="indigo" size="sm" className="flex items-center gap-2 whitespace-nowrap" onClick={handleAdd}>
            <PlusIcon strokeWidth={2.5} className="h-4 w-4" /> Thêm
          </Button>
        </div>
      </div>
    );
  }, [loading, roomNumber, statusFilter, typeFilter, setNavbarHeader]);

  const handleEdit = (id) => { setSelectedBillId(id); setIsModalOpen(true); };
  const handleModalClose = () => { setIsModalOpen(false); setSelectedBillId(null); };
  const handleModalSuccess = () => { setPage(1); loadBills(); };

  const handleDelete = async () => {
    if (!billToDelete) return;
    try { await deleteBill(billToDelete.id); showToast("Đã xóa hóa đơn", "success"); setDeleteDialogOpen(false); setBillToDelete(null); loadBills(); } catch (err) { showToast(err.message, "error"); }
  };

  const handleMarkPaid = async () => {
    if (!billToPay) return;
    try { await markBillAsPaid(billToPay.id, paymentRef); showToast("Đã thanh toán", "success"); setPayDialogOpen(false); setBillToPay(null); setPaymentRef(""); loadBills(); } catch (err) { showToast(err.message, "error"); }
  };

  const getStatusColor = (s) => { switch(s) { case "PAID": return "green"; case "UNPAID": return "red"; case "OVERDUE": return "orange"; case "CANCELLED": return "gray"; default: return "blue-gray"; } };
  const getStatusLabel = (s) => { switch(s) { case "PAID": return "Đã Thu"; case "UNPAID": return "Chưa Thu"; case "OVERDUE": return "Quá Hạn"; case "CANCELLED": return "Đã Hủy"; default: return s; } };
  const getTypeLabel = (t) => { switch(t) { case "RENT": return "Tiền Phòng"; case "ELECTRICITY": return "Tiền Điện"; case "WATER": return "Tiền Nước"; case "SERVICE": return "Dịch Vụ"; case "OTHER": return "Khác"; default: return t; } };

  return (
    <div className="h-full flex flex-col">
      <Card className="h-full flex flex-col overflow-hidden">
        <CardBody className="p-0 overflow-auto flex-1">
          {error && <Alert color="red" className="mb-4 mx-4">{error}</Alert>}
          {loading ? (
            <div className="flex justify-center py-8"><Typography>Đang tải...</Typography></div>
          ) : bills.length === 0 ? (
            <div className="flex justify-center py-8"><Typography>Không có dữ liệu phiếu thu</Typography></div>
          ) : (
              <table className="w-full min-w-max table-auto text-left">
                <thead><tr>
                  {["Phòng", "Loại", "Số Tiền (VNĐ)", "Hạn Thu", "Trạng Thái", "Mô tả", "Thao tác"].map((h) => (
                    <th key={h} className="border-b border-blue-gray-50 py-3 px-5"><Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">{h}</Typography></th>
                  ))}
                </tr></thead>
                <tbody>
                  {bills.map((bill, key) => {
                    const isLast = key === bills.length - 1;
                    const className = `py-3 px-5 ${isLast ? "" : "border-b border-blue-gray-50"}`;
                    return (
                      <tr key={bill.id}>
                        <td className={className}><Typography variant="small" color="blue-gray" className="font-bold">{bill.roomNumber || "-"}</Typography></td>
                        <td className={className}><Typography variant="small" color="blue-gray">{getTypeLabel(bill.billType)}</Typography></td>
                        <td className={className}><Typography variant="small" color="blue-gray" className="font-bold text-blue-800">{bill.amount?.toLocaleString()}</Typography></td>
                        <td className={className}><Typography variant="small" color="blue-gray">{new Date(bill.dueDate).toLocaleDateString("vi-VN")}</Typography></td>
                        <td className={className}><Chip variant="gradient" size="sm" value={getStatusLabel(bill.status)} color={getStatusColor(bill.status)} className="py-0.5 px-2 text-[11px] font-medium w-fit" /></td>
                        <td className={className}><Typography className="text-xs font-normal text-blue-gray-500 max-w-xs truncate" title={bill.description}>{bill.description}</Typography></td>
                        <td className={className}>
                          <div className="flex gap-2">
                            {(bill.status === "UNPAID" || bill.status === "OVERDUE") && (
                              <IconButton size="sm" variant="text" color="green" title="Thu Tiền" onClick={() => { setBillToPay(bill); setPayDialogOpen(true); }}><CheckCircleIcon className="h-5 w-5 text-green-500" /></IconButton>
                            )}
                            <IconButton size="sm" variant="text" color="blue-gray" onClick={() => handleEdit(bill.id)}><PencilIcon className="h-4 w-4 text-blue-gray-500" /></IconButton>
                            <IconButton size="sm" variant="text" color="red" onClick={() => { setBillToDelete(bill); setDeleteDialogOpen(true); }}><TrashIcon className="h-4 w-4 text-red-500" /></IconButton>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
          )}
        </CardBody>
        {!loading && bills.length > 0 && (
          <div className="shrink-0 px-4 py-2 flex items-center justify-between border-t border-blue-gray-50 bg-blue-gray-50/20">
            <div className="flex items-center gap-4">
              <Typography variant="small" color="blue-gray" className="font-normal opacity-70">Hiển thị {bills.length} trong {totalElements} phiếu thu</Typography>
              <Typography variant="small" color="blue-gray" className="font-normal opacity-70">Trang {page} / {totalPages || 1}</Typography>
            </div>
            <div className="flex gap-2">
              <Button variant="outlined" color="blue-gray" size="sm" disabled={page <= 1 || loading} onClick={() => setPage(p => p - 1)}>Trước</Button>
              <Button variant="outlined" color="blue-gray" size="sm" disabled={page >= totalPages || loading} onClick={() => setPage(p => p + 1)}>Sau</Button>
            </div>
          </div>
        )}
      </Card>

      <BillModal open={isModalOpen} onClose={handleModalClose} billId={selectedBillId} onSuccess={handleModalSuccess} />
      <Dialog open={deleteDialogOpen} handler={setDeleteDialogOpen}>
        <DialogHeader>Xác nhận xóa</DialogHeader>
        <DialogBody>Thao tác sẽ xóa phiếu thu vĩnh viễn. Tiếp tục?</DialogBody>
        <DialogFooter>
          <Button variant="text" color="red" onClick={() => setDeleteDialogOpen(false)} className="mr-1">Hủy</Button>
          <Button variant="gradient" color="red" onClick={handleDelete}>Xóa</Button>
        </DialogFooter>
      </Dialog>
      <Dialog open={payDialogOpen} handler={setPayDialogOpen}>
        <DialogHeader>Xác nhận Đã Thu Tiền</DialogHeader>
        <DialogBody>
          <div className="mb-4">
            <Typography variant="paragraph">Phòng: <b>{billToPay?.roomNumber}</b></Typography>
            <Typography variant="paragraph">Số tiền thu: <b>{billToPay?.amount?.toLocaleString()} VNĐ</b></Typography>
          </div>
          <Input label="Mã giao dịch / Ghi chú (VD: CK BIDV)" value={paymentRef} onChange={(e) => setPaymentRef(e.target.value)} />
        </DialogBody>
        <DialogFooter>
          <Button variant="text" color="red" onClick={() => setPayDialogOpen(false)} className="mr-1">Hủy</Button>
          <Button variant="gradient" color="green" onClick={handleMarkPaid}>Xác nhận Thu Tiền</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default Bills;
