import React from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  Typography,
  Button,
  Input,
  Textarea,
  Select,
  Option,
  IconButton,
} from "@material-tailwind/react";
import { getBillById, createBill, updateBill } from "@/api/bill";
import { getRooms } from "@/api/room";
import { showToast } from "@/lib/swal";
import ReactSelect from "react-select";

export function BillModal({ open, onClose, billId, onSuccess }) {
  const isEdit = Boolean(billId);
  const [loading, setLoading] = React.useState(false);
  const [loadingData, setLoadingData] = React.useState(false);
  const [availableRooms, setAvailableRooms] = React.useState([]);
  
  const [formData, setFormData] = React.useState({
    roomId: "",
    billType: "RENT",
    amount: "",
    description: "",
    dueDate: "",
    status: "UNPAID",
  });
  const [errors, setErrors] = React.useState({});

  React.useEffect(() => {
    if (open) {
      loadRooms();
      if (isEdit && billId) {
        loadBill();
      } else {
        setFormData({
          roomId: "",
          billType: "RENT",
          amount: "",
          description: "",
          dueDate: "",
          status: "UNPAID",
        });
        setErrors({});
      }
    }
  }, [open, isEdit, billId]);

  const loadRooms = async () => {
    try {
      const res = await getRooms({ size: 1000 });
      setAvailableRooms(res.content || []);
    } catch (err) {
      console.error("Error loading rooms:", err);
    }
  };

  const loadBill = async () => {
    try {
      setLoadingData(true);
      const data = await getBillById(Number(billId));
      setFormData({
        roomId: data.roomId ? String(data.roomId) : "",
        billType: data.billType || "RENT",
        amount: data.amount ? String(data.amount) : "",
        description: data.description || "",
        dueDate: data.dueDate?.substring(0, 10) || "",
        status: data.status || "UNPAID",
      });
    } catch (err) {
      showToast(err.message, "error");
      onClose();
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === "amount") {
      if (Number(value) <= 0) {
        setErrors(prev => ({ ...prev, amount: "Số tiền phải lớn hơn 0" }));
      } else {
        setErrors(prev => ({ ...prev, amount: null }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (errors.amount || Number(formData.amount) <= 0) {
      showToast("Số tiền không hợp lệ", "error");
      return;
    }
    try {
      setLoading(true);
      const payload = {
        ...formData,
        roomId: formData.roomId ? Number(formData.roomId) : null,
        amount: formData.amount ? Number(formData.amount) : null,
      };
      
      if (isEdit && billId) {
        await updateBill(Number(billId), payload);
        showToast("Cập nhật hóa đơn thành công!", "success");
      } else {
        await createBill(payload);
        showToast("Tạo hóa đơn thành công!", "success");
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      showToast(err.message || "Có lỗi xảy ra", "error");
    } finally {
      setLoading(false);
    }
  };

  const roomOptions = [
    { value: "", label: "Chọn phòng", isDisabled: true },
    ...availableRooms.map(r => ({ value: String(r.id), label: `Phòng ${r.roomNumber}` }))
  ];

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: '40px',
      borderRadius: '7px',
      borderColor: state.isFocused ? '#263238' : '#b0bec5',
      boxShadow: 'none',
      '&:hover': { borderColor: '#263238' },
      fontSize: '14px',
      backgroundColor: 'transparent'
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999
    }),
    menuList: (base) => ({
      ...base,
      maxHeight: '220px' // Hiển thị khoảng 6 items
    })
  };

  return (
    <Dialog open={open} handler={onClose} size="lg">
      <DialogHeader className="flex justify-between items-center">
        <Typography variant="h5" color="blue-gray">
          {isEdit ? "Cập nhật Phiếu thu" : "Tạo Phiếu thu mới"}
        </Typography>
        <IconButton variant="text" color="blue-gray" onClick={onClose} className="rounded-full flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </IconButton>
      </DialogHeader>
      <DialogBody divider className="max-h-[80vh] overflow-y-auto">
        {loadingData ? (
          <div className="py-12 flex justify-center items-center">
            <Typography>Đang tải dữ liệu...</Typography>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="flex flex-col gap-1">
                <Typography variant="small" color="blue-gray" className="mb-1 font-medium">Phòng thu tiền *</Typography>
                <ReactSelect
                  options={roomOptions}
                  styles={selectStyles}
                  value={roomOptions.find(o => o.value === String(formData.roomId)) || null}
                  onChange={(option) => setFormData(p => ({ ...p, roomId: option.value }))}
                  isDisabled={loading}
                  placeholder="Chọn phòng..."
                  isSearchable={true}
                  noOptionsMessage={() => "Không tìm thấy phòng"}
                />
              </div>

              <div className="flex flex-col gap-1">
                <Typography variant="small" color="blue-gray" className="mb-1 font-medium">Loại phí *</Typography>
                <Select
                  value={formData.billType}
                  onChange={(val) => setFormData(p => ({ ...p, billType: val }))}
                  disabled={loading}
                >
                  <Option value="RENT">Tiền Phòng</Option>
                  <Option value="ELECTRICITY">Tiền Điện</Option>
                  <Option value="WATER">Tiền Nước</Option>
                  <Option value="SERVICE">Phí Dịch Vụ / Rác</Option>
                  <Option value="OTHER">Phí Khác</Option>
                </Select>
              </div>

              <div className="flex flex-col gap-1">
                <Input
                  label="Số tiền (VNĐ) *"
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  error={!!errors.amount}
                  required
                  disabled={loading}
                />
                {errors.amount && <Typography variant="small" color="red" className="mt-1 text-[11px] font-medium">{errors.amount}</Typography>}
              </div>
              <Input
                label="Hạn thanh toán *"
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                required
                disabled={loading}
              />
              
              {isEdit && (
                <div className="flex flex-col gap-1">
                  <Typography variant="small" color="blue-gray" className="mb-1 font-medium">Trạng thái</Typography>
                  <Select
                    value={formData.status}
                    onChange={(val) => setFormData(p => ({...p, status: val }))}
                    disabled={loading}
                  >
                    <Option value="UNPAID">Chưa Thu</Option>
                    <Option value="PAID">Đã Thu</Option>
                    <Option value="OVERDUE">Quá Hạn</Option>
                    <Option value="CANCELLED">Đã Hủy</Option>
                  </Select>
                </div>
              )}
            </div>

            <Textarea
              label="Diễn giải / Ghi chú"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              disabled={loading}
            />

            <div className="flex gap-4 justify-end mt-4">
              <Button variant="text" color="red" onClick={onClose} disabled={loading}>
                Hủy
              </Button>
              <Button type="submit" variant="gradient" color="indigo" disabled={loading}>
                {loading ? "Đang lưu..." : isEdit ? "Lưu lại" : "Tạo Mới"}
              </Button>
            </div>
          </form>
        )}
      </DialogBody>
    </Dialog>
  );
}

export default BillModal;

