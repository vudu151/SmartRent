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
} from "@material-tailwind/react";
import { getContractById, createContract, updateContract } from "@/api/contract";
import { getRooms } from "@/api/room";
import { getResidents } from "@/api/resident";
import { showToast } from "@/lib/swal";
import ReactSelect from "react-select";

export function ContractModal({ open, onClose, contractId, onSuccess }) {
  const isEdit = Boolean(contractId);
  const [loading, setLoading] = React.useState(false);
  const [loadingData, setLoadingData] = React.useState(false);
  
  const [rooms, setRooms] = React.useState([]);
  const [residents, setResidents] = React.useState([]);

  const [formData, setFormData] = React.useState({
    roomId: "",
    residentId: "",
    startDate: "",
    endDate: "",
    monthlyRent: "",
    depositAmount: "",
    status: "ACTIVE",
    notes: ""
  });
  const [errors, setErrors] = React.useState({});

  // Load complementary data (Rooms & Residents)
  React.useEffect(() => {
    if (open) {
      fetchOptions();
    }
  }, [open]);

  const fetchOptions = async () => {
    try {
      const [roomsData, residentsData] = await Promise.all([
        getRooms({ size: 100, status: isEdit ? undefined : "VACANT" }),
        getResidents({ size: 100, status: "ACTIVE" })
      ]);
      setRooms(roomsData.content || []);
      setResidents(residentsData.content || []);
    } catch (err) {
      console.error("Error fetching options:", err);
    }
  };

  React.useEffect(() => {
    if (open) {
      if (isEdit && contractId) {
        loadContract();
      } else {
        const today = new Date().toISOString().split('T')[0];
        const nextYear = new Date();
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        const endDate = nextYear.toISOString().split('T')[0];
        
        setFormData({
          roomId: "",
          residentId: "",
          startDate: today,
          endDate: endDate,
          monthlyRent: "",
          depositAmount: "",
          status: "ACTIVE",
          notes: ""
        });
        setErrors({});
      }
    }
  }, [open, isEdit, contractId]);

  const loadContract = async () => {
    try {
      setLoadingData(true);
      const data = await getContractById(Number(contractId));
      setFormData({
        roomId: data.roomId?.toString() || "",
        residentId: data.residentId?.toString() || "",
        startDate: data.startDate || "",
        endDate: data.endDate || "",
        monthlyRent: data.monthlyRent?.toString() || "",
        depositAmount: data.depositAmount?.toString() || "",
        status: data.status || "ACTIVE",
        notes: data.notes || ""
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
    
    if (name === "depositAmount" || name === "monthlyRent") {
      if (Number(value) < 0) {
        setErrors(prev => ({ ...prev, [name]: "Không được nhập số âm" }));
      } else {
        setErrors(prev => ({ ...prev, [name]: null }));
      }
    }

    if (name === "startDate" || name === "endDate") {
      const start = name === "startDate" ? value : formData.startDate;
      const end = name === "endDate" ? value : formData.endDate;
      if (start && end) {
        const startDate = new Date(start);
        const endDate = new Date(end);
        startDate.setMonth(startDate.getMonth() + 1);
        if (endDate < startDate) {
          setErrors(prev => ({ ...prev, date: "Ngày kết thúc phải sau ngày bắt đầu ít nhất 1 tháng" }));
        } else {
          setErrors(prev => ({ ...prev, date: null }));
        }
      }
    }
    
    // Auto-fill price if room changes
    if (name === "roomId" && !isEdit) {
      const selectedRoom = rooms.find(r => r.id.toString() === value);
      if (selectedRoom) {
        setFormData(prev => ({ 
          ...prev, 
          monthlyRent: selectedRoom.price?.toString() || "",
          depositAmount: selectedRoom.price?.toString() || "" // Default deposit = 1 month
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (errors.depositAmount || errors.monthlyRent || errors.date) {
      showToast("Vui lòng sửa các thông tin chưa hợp lệ", "error");
      return;
    }
    if (Number(formData.depositAmount) < 0 || Number(formData.monthlyRent) < 0) {
      showToast("Số tiền không hợp lệ", "error");
      return;
    }
    try {
      setLoading(true);
      const payload = {
        ...formData,
        roomId: Number(formData.roomId),
        residentId: Number(formData.residentId),
        monthlyRent: Number(formData.monthlyRent),
        depositAmount: Number(formData.depositAmount),
      };

      if (isEdit && contractId) {
        await updateContract(Number(contractId), payload);
        showToast("Cập nhật hợp đồng thành công!", "success");
      } else {
        await createContract(payload);
        showToast("Tạo hợp đồng thành công!", "success");
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
    { value: "", label: "Chọn phòng trống", isDisabled: true },
    ...rooms.map(r => ({ value: String(r.id), label: `Phòng ${r.roomNumber} - ${r.price?.toLocaleString()}đ` }))
  ];

  const residentOptions = [
    { value: "", label: "Người đại diện", isDisabled: true },
    ...residents.map(r => ({ value: String(r.id), label: `${r.fullName} - ${r.phone}` }))
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
      <DialogHeader>
        <Typography variant="h5" color="blue-gray">
          {isEdit ? "Chi tiết Hợp đồng" : "Tạo Hợp đồng Mới"}
        </Typography>
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
                <Typography variant="small" color="blue-gray" className="mb-1 font-medium">Chọn Phòng *</Typography>
                <ReactSelect
                  options={roomOptions}
                  styles={selectStyles}
                  value={roomOptions.find(o => o.value === String(formData.roomId)) || null}
                  onChange={(option) => handleChange({ target: { name: "roomId", value: option.value } })}
                  isDisabled={loading || isEdit}
                  placeholder="Chọn phòng trống..."
                  isSearchable={true}
                  noOptionsMessage={() => "Không tìm thấy phòng"}
                />
              </div>

              <div className="flex flex-col gap-1">
                <Typography variant="small" color="blue-gray" className="mb-1 font-medium">Chọn Cư dân *</Typography>
                <ReactSelect
                  options={residentOptions}
                  styles={selectStyles}
                  value={residentOptions.find(o => o.value === String(formData.residentId)) || null}
                  onChange={(option) => handleChange({ target: { name: "residentId", value: option.value } })}
                  isDisabled={loading || isEdit}
                  placeholder="Người đại diện..."
                  isSearchable={true}
                  noOptionsMessage={() => "Không tìm thấy cư dân"}
                />
              </div>

              <div className="flex flex-col gap-1">
                <Input
                  label="Ngày bắt đầu *"
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  error={!!errors.date}
                  required
                  disabled={loading}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Input
                  label="Ngày kết thúc *"
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  error={!!errors.date}
                  required
                  disabled={loading}
                />
                {errors.date && <Typography variant="small" color="red" className="mt-1 text-[11px] font-medium">{errors.date}</Typography>}
              </div>

              <div className="flex flex-col gap-1">
                <Input
                  label="Giá thuê hàng tháng (VNĐ) *"
                  type="number"
                  name="monthlyRent"
                  value={formData.monthlyRent}
                  onChange={handleChange}
                  error={!!errors.monthlyRent}
                  required
                  disabled={loading}
                />
                {errors.monthlyRent && <Typography variant="small" color="red" className="mt-1 text-[11px] font-medium">{errors.monthlyRent}</Typography>}
              </div>
              <div className="flex flex-col gap-1">
                <Input
                  label="Tiền cọc (VNĐ) *"
                  type="number"
                  name="depositAmount"
                  value={formData.depositAmount}
                  onChange={handleChange}
                  error={!!errors.depositAmount}
                  required
                  disabled={loading}
                />
                {errors.depositAmount && <Typography variant="small" color="red" className="mt-1 text-[11px] font-medium">{errors.depositAmount}</Typography>}
              </div>

              {isEdit && (
                <div className="flex flex-col gap-1">
                  <Typography variant="small" color="blue-gray" className="mb-1 font-medium">Trạng thái</Typography>
                  <Select
                    value={formData.status}
                    onChange={(val) => setFormData(p => ({...p, status: val}))}
                    disabled={loading}
                  >
                    <Option value="ACTIVE">Hiệu lực</Option>
                    <Option value="EXPIRED">Hết hạn</Option>
                  </Select>
                </div>
              )}
            </div>

            <Textarea
              label="Ghi chú điều khoản"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              disabled={loading}
            />

            <div className="flex gap-4 justify-end mt-4">
              <Button variant="text" color="red" onClick={onClose} disabled={loading}>
                Hủy
              </Button>
              <Button type="submit" variant="gradient" disabled={loading}>
                {loading ? "Đang lưu..." : isEdit ? "Cập nhật" : "Kích hoạt Hợp đồng"}
              </Button>
            </div>
          </form>
        )}
      </DialogBody>
    </Dialog>
  );
}

export default ContractModal;
