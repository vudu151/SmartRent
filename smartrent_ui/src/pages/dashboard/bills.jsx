import React from "react";
import {
  Card,
  CardHeader,
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
import { getBills, deleteBill, markBillAsPaid } from "@/api/bill";
import { remindUnpaidBills } from "@/api/notification";
import { BillModal } from "./bill-form";
import { showToast } from "@/lib/swal";

export function Bills() {
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
      setLoading(true);
      setError("");
      const response = await getBills({
        page: page - 1,
        size,
        roomNumber: roomNumber || undefined,
        status: statusFilter || undefined,
        billType: typeFilter || undefined,
      });

      setBills(response.content || []);
      setTotalPages(response.totalPages || 1);
      setTotalElements(response.totalElements || 0);
    } catch (err) {
      console.error("Error loading bills:", err);
      setError(err.message || "Không thể tải danh sách hóa đơn.");
    } finally {
      setLoading(false);
    }
  }, [page, size, roomNumber, statusFilter, typeFilter]);

  React.useEffect(() => {
    loadBills();
  }, [loadBills]);

  React.useEffect(() => {
    setPage(1);
  }, [size, roomNumber, statusFilter, typeFilter]);



  const handleRemind = async () => {
    try {
      setLoading(true);
      await remindUnpaidBills();
      showToast("Đã gửi thông báo nhắc nợ đến các cư dân chưa thanh toán!", "success");
    } catch (err) {
      showToast(err.message || "Không thể gửi nhắc nợ", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedBillId(null);
    setIsModalOpen(true);
  };

  const handleEdit = (id) => {
    setSelectedBillId(id);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedBillId(null);
  };

  const handleModalSuccess = () => {
    setPage(1);
    loadBills();
  };

  const handleDelete = async () => {
    if (!billToDelete) return;
    try {
      await deleteBill(billToDelete.id);
      showToast("Đã xóa hóa đơn thành công", "success");
      setDeleteDialogOpen(false);
      setBillToDelete(null);
      loadBills();
    } catch (err) {
      showToast(err.message || "Không thể xóa hóa đơn", "error");
    }
  };

  const handleMarkPaid = async () => {
    if (!billToPay) return;
    try {
      await markBillAsPaid(billToPay.id, paymentRef);
      showToast("Đã thanh toán hóa đơn", "success");
      setPayDialogOpen(false);
      setBillToPay(null);
      setPaymentRef("");
      loadBills();
    } catch (err) {
      showToast(err.message || "Lỗi khi xử lý", "error");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PAID": return "green";
      case "UNPAID": return "red";
      case "OVERDUE": return "orange";
      case "CANCELLED": return "gray";
      default: return "blue-gray";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "PAID": return "Đã Thu";
      case "UNPAID": return "Chưa Thu";
      case "OVERDUE": return "Quá Hạn";
      case "CANCELLED": return "Đã Hủy";
      default: return status;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "RENT": return "Tiền Phòng";
      case "ELECTRICITY": return "Tiền Điện";
      case "WATER": return "Tiền Nước";
      case "SERVICE": return "Dịch Vụ";
      case "OTHER": return "Khác";
      default: return type;
    }
  };

  return (
    <div className="mt-[2px] mb-8 flex flex-col gap-4">
      <Card>
        <CardHeader floated={false} shadow={false} className="rounded-none">
          <div className="flex items-center justify-between gap-8 mb-1">
            <div>
              <Typography variant="h5" color="blue-gray">Quản lý Phiếu Thu</Typography>
              <Typography color="gray" className="mt-1 font-normal">
                Theo dõi các thanh toán tiền phòng và dịch vụ
              </Typography>
            </div>
            <div className="flex gap-2">
              <Button className="flex items-center gap-3" variant="outlined" size="sm" onClick={handleRemind} disabled={loading}>
                <BellIcon className="h-4 w-4" /> Nhắc Nợ
              </Button>
              <Button className="flex items-center gap-3" size="sm" onClick={handleAdd}>
                <PlusIcon strokeWidth={2} className="h-4 w-4" /> Thêm Phiếu Thu
              </Button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-2">
            <div className="w-full md:w-64">
              <Input
                label="Tìm số phòng..."
                size="sm"
                value={roomNumber}
                onChange={(e) => { setRoomNumber(e.target.value); }}
              />
            </div>
            <div className="w-full md:w-48">
              <Select label="Trạng thái" size="sm" value={statusFilter} onChange={(v) => { setStatusFilter(v || ""); }}>
                <Option value="">Tất cả</Option>
                <Option value="UNPAID">Chưa Thu</Option>
                <Option value="PAID">Đã Thu</Option>
                <Option value="OVERDUE">Quá Hạn</Option>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Select label="Loại phí" size="sm" value={typeFilter} onChange={(v) => { setTypeFilter(v || ""); }}>
                <Option value="">Tất cả</Option>
                <Option value="RENT">Tiền Phòng</Option>
                <Option value="ELECTRICITY">Tiền Điện</Option>
                <Option value="WATER">Tiền Nước</Option>
                <Option value="SERVICE">Dịch Vụ</Option>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardBody className="overflow-x-auto p-0">
          {error && <Alert color="red" className="mb-4 mx-4">{error}</Alert>}

          {loading ? (
            <div className="flex justify-center py-8"><Typography>Đang tải...</Typography></div>
          ) : bills.length === 0 ? (
            <div className="flex justify-center py-8"><Typography>Không có dữ liệu phiếu thu</Typography></div>
          ) : (
            <>
              <table className="mt-4 w-full min-w-max table-auto text-left">
                <thead>
                  <tr>
                    {["Phòng", "Loại", "Số Tiền (VNĐ)", "Hạn Thu", "Trạng Thái", "Mô tả", "Thao tác"].map((head) => (
                      <th key={head} className="border-b border-blue-gray-100 bg-blue-gray-50 py-0.5 px-4">
                        <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                          {head}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bills.map((bill) => (
                    <tr key={bill.id} className="even:bg-blue-gray-50/50">
                      <td className="py-0.5 px-4"><Typography variant="small" color="blue-gray" className="font-bold">{bill.roomNumber || "-"}</Typography></td>
                      <td className="py-0.5 px-4"><Typography variant="small" color="blue-gray">{getTypeLabel(bill.billType)}</Typography></td>
                      <td className="py-0.5 px-4"><Typography variant="small" color="blue-gray" className="font-bold text-blue-800">{bill.amount?.toLocaleString()}</Typography></td>
                      <td className="py-0.5 px-4"><Typography variant="small" color="blue-gray">{new Date(bill.dueDate).toLocaleDateString("vi-VN")}</Typography></td>
                      <td className="py-0.5 px-4">
                        <Chip size="sm" variant="ghost" value={getStatusLabel(bill.status)} color={getStatusColor(bill.status)} />
                      </td>
                      <td className="py-0.5 px-4 text-xs max-w-xs truncate" title={bill.description}>{bill.description}</td>
                      <td className="py-0.5 px-4">
                        <div className="flex gap-2">
                          {bill.status === "UNPAID" || bill.status === "OVERDUE" ? (
                            <IconButton size="sm" variant="text" color="green" title="Thu Tiền" onClick={() => { setBillToPay(bill); setPayDialogOpen(true); }}>
                              <CheckCircleIcon className="h-5 w-5" />
                            </IconButton>
                          ) : null}
                          <IconButton size="sm" variant="text" color="blue-gray" onClick={() => handleEdit(bill.id)}>
                            <PencilIcon className="h-4 w-4" />
                          </IconButton>
                          <IconButton size="sm" variant="text" color="red" onClick={() => { setBillToDelete(bill); setDeleteDialogOpen(true); }}>
                            <TrashIcon className="h-4 w-4" />
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-2 px-4 py-2 flex items-center justify-between border-t border-blue-gray-50 bg-blue-gray-50/20">
                <div className="flex items-center gap-4">
                  <Typography variant="small" color="blue-gray" className="font-normal opacity-70">
                    Hiển thị {bills.length} trong {totalElements} phiếu thu
                  </Typography>
                  <Typography variant="small" color="blue-gray" className="font-normal opacity-70">
                    Trang {page} / {totalPages || 1}
                  </Typography>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outlined"
                    color="blue-gray"
                    size="sm"
                    disabled={page <= 1 || loading}
                    onClick={() => setPage(p => p - 1)}
                  >
                    Trước
                  </Button>
                  <Button
                    variant="outlined"
                    color="blue-gray"
                    size="sm"
                    disabled={page >= totalPages || loading}
                    onClick={() => setPage(p => p + 1)}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardBody>
      </Card>

      <BillModal
        open={isModalOpen}
        onClose={handleModalClose}
        billId={selectedBillId}
        onSuccess={handleModalSuccess}
      />

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
          <Input
            label="Mã giao dịch / Ghi chú (VD: CK BIDV)"
            value={paymentRef}
            onChange={(e) => setPaymentRef(e.target.value)}
          />
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
