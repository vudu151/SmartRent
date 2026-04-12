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
                <Select
                  value={formData.roomId}
                  onChange={(val) => handleChange({ target: { name: "roomId", value: val } })}
                  disabled={loading || isEdit}
                  label="Chọn phòng trống"
                >
                  {rooms.map(r => (
                    <Option key={r.id} value={r.id.toString()}>
                      Phòng {r.roomNumber} - {r.price?.toLocaleString()}đ
                    </Option>
                  ))}
                </Select>
              </div>

              <div className="flex flex-col gap-1">
                <Typography variant="small" color="blue-gray" className="mb-1 font-medium">Chọn Cư dân *</Typography>
                <Select
                  value={formData.residentId}
                  onChange={(val) => handleChange({ target: { name: "residentId", value: val } })}
                  disabled={loading || isEdit}
                  label="Người đại diện"
                >
                  {residents.map(r => (
                    <Option key={r.id} value={r.id.toString()}>
                      {r.fullName} - {r.phone}
                    </Option>
                  ))}
                </Select>
              </div>

              <Input
                label="Ngày bắt đầu *"
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                disabled={loading}
              />
              <Input
                label="Ngày kết thúc *"
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
                disabled={loading}
              />

              <Input
                label="Giá thuê hàng tháng (VNĐ) *"
                type="number"
                name="monthlyRent"
                value={formData.monthlyRent}
                onChange={handleChange}
                required
                disabled={loading}
              />
              <Input
                label="Tiền cọc (VNĐ) *"
                type="number"
                name="depositAmount"
                value={formData.depositAmount}
                onChange={handleChange}
                required
                disabled={loading}
              />

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
