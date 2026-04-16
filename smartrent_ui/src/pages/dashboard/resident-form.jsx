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
import { getResidentById, createResident, updateResident } from "@/api/resident";
import { getRooms } from "@/api/room";
import { showToast } from "@/lib/swal";
import { useAuth } from "@/smartrent/auth";

export function ResidentModal({ open, onClose, residentId, onSuccess }) {
  const { user } = useAuth();
  const isGuard = user?.role === "GUARD";
  const isEdit = Boolean(residentId);
  const [loading, setLoading] = React.useState(false);
  const [loadingData, setLoadingData] = React.useState(false);
  const [availableRooms, setAvailableRooms] = React.useState([]);
  
  const [formData, setFormData] = React.useState({
    fullName: "",
    email: "",
    phone: "",
    idCard: "",
    dateOfBirth: "",
    gender: "MALE",
    status: "ACTIVE",
    notes: "",
    roomIds: [],
  });

  React.useEffect(() => {
    if (open) {
      loadRooms();
      if (isEdit && residentId) {
        loadResident();
      } else {
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          idCard: "",
          dateOfBirth: "",
          gender: "MALE",
          status: "ACTIVE",
          notes: "",
          roomIds: [],
        });
      }
    }
  }, [open, isEdit, residentId]);

  const loadRooms = async () => {
    try {
      const res = await getRooms({ size: 1000 });
      setAvailableRooms(res.content || []);
    } catch (err) {
      console.error("Error loading rooms:", err);
    }
  };

  const loadResident = async () => {
    try {
      setLoadingData(true);
      const data = await getResidentById(Number(residentId));
      setFormData({
        fullName: data.fullName || "",
        email: data.email || "",
        phone: data.phone || "",
        idCard: data.idCard || "",
        dateOfBirth: data.dateOfBirth || "",
        gender: data.gender || "MALE",
        status: data.status || "ACTIVE",
        notes: data.notes || "",
        roomIds: data.rooms?.map((r) => r.id) || [],
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
  };

  const handleRoomSelect = (val) => {
    setFormData(prev => ({ ...prev, roomIds: [Number(val)] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = { ...formData };
      if (!payload.dateOfBirth) payload.dateOfBirth = null;
      
      if (isEdit && residentId) {
        await updateResident(Number(residentId), payload);
        showToast("Cập nhật cư dân thành công!", "success");
      } else {
        await createResident(payload);
        showToast("Tạo cư dân thành công!", "success");
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
          {isEdit ? "Cập nhật Cư dân" : "Thêm Cư dân Mới"}
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
              <Input
                label="Họ tên *"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                disabled={loading || isGuard}
              />
              <Input
                label="Số điện thoại"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={loading || isGuard}
              />
              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading || isGuard}
              />
              <Input
                label="CMND/CCCD"
                name="idCard"
                value={formData.idCard}
                onChange={handleChange}
                disabled={loading || isGuard}
              />
              <Input
                label="Ngày sinh"
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                disabled={loading || isGuard}
              />
              
              <div className="flex flex-col gap-1">
                <Typography variant="small" color="blue-gray" className="mb-1 font-medium">Giới tính</Typography>
                <Select
                  value={formData.gender}
                  onChange={(val) => setFormData(p => ({ ...p, gender: val }))}
                  disabled={loading || isGuard}
                >
                  <Option value="MALE">Nam</Option>
                  <Option value="FEMALE">Nữ</Option>
                  <Option value="OTHER">Chưa rõ</Option>
                </Select>
              </div>

              <div className="flex flex-col gap-1">
                <Typography variant="small" color="blue-gray" className="mb-1 font-medium">Phòng thuê hiện tại</Typography>
                <Select
                  label="Chọn phòng"
                  value={formData.roomIds.length ? String(formData.roomIds[0]) : "0"}
                  onChange={(val) => handleRoomSelect(val)}
                  disabled={loading || isGuard}
                >
                  <Option value="0">Chưa xếp phòng</Option>
                  {availableRooms.map((room) => (
                    <Option key={room.id} value={String(room.id)}>Phòng {room.roomNumber}</Option>
                  ))}
                </Select>
              </div>

              {isEdit && (
                <div className="flex flex-col gap-1">
                  <Typography variant="small" color="blue-gray" className="mb-1 font-medium">Trạng thái</Typography>
                  <Select
                    value={formData.status}
                    onChange={(val) => setFormData(p => ({...p, status: val}))}
                    disabled={loading || isGuard}
                  >
                    <Option value="ACTIVE">Đang ở</Option>
                    <Option value="INACTIVE">Đã rời</Option>
                    <Option value="TEMPORARY">Tạm trú</Option>
                  </Select>
                </div>
              )}
            </div>

            <Textarea
              label="Ghi chú thêm"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              disabled={loading || isGuard}
            />

            <div className="flex gap-4 justify-end mt-4">
              <Button variant="text" color={isGuard ? "black" : "red"} onClick={onClose} disabled={loading}>
                {isGuard ? "Đóng" : "Hủy"}
              </Button>
              {!isGuard && (
                <Button type="submit" color="black" disabled={loading}>
                  {loading ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo Mới"}
                </Button>
              )}
            </div>
          </form>
        )}
      </DialogBody>
    </Dialog>
  );
}

export default ResidentModal;

