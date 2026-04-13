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
import { getRoomById, createRoom, updateRoom } from "@/api/room";
import { showToast } from "@/lib/swal";

export function RoomModal({ open, onClose, roomId, onSuccess }) {
  const isEdit = Boolean(roomId);
  const [loading, setLoading] = React.useState(false);
  const [loadingData, setLoadingData] = React.useState(false);
  const [formData, setFormData] = React.useState({
    roomNumber: "",
    floor: "",
    area: "",
    type: "STANDARD",
    status: "VACANT",
    price: "",
    description: ""
  });

  React.useEffect(() => {
    if (open) {
      if (isEdit && roomId) {
        loadRoom();
      } else {
        setFormData({
          roomNumber: "",
          floor: "",
          area: "",
          type: "STANDARD",
          status: "VACANT",
          price: "",
          description: ""
        });
      }
    }
  }, [open, isEdit, roomId]);

  const loadRoom = async () => {
    try {
      setLoadingData(true);
      const data = await getRoomById(Number(roomId));
      setFormData({
        roomNumber: data.roomNumber || "",
        floor: data.floor?.toString() || "",
        area: data.area?.toString() || "",
        type: data.type || "STANDARD",
        status: data.status || "VACANT",
        price: data.price?.toString() || "",
        description: data.description || ""
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        ...formData,
        floor: formData.floor ? Number(formData.floor) : null,
        area: formData.area ? Number(formData.area) : null,
        price: formData.price ? Number(formData.price) : null,
      };

      if (isEdit && roomId) {
        await updateRoom(Number(roomId), payload);
        showToast("Cập nhật phòng thành công!", "success");
      } else {
        await createRoom(payload);
        showToast("Tạo phòng thành công!", "success");
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
          {isEdit ? "Cập nhật Phòng" : "Thêm Phòng Mới"}
        </Typography>
      </DialogHeader>
      <DialogBody divider className="max-h-[80vh] overflow-y-auto pt-0">
        {loadingData ? (
          <div className="py-12 flex justify-center items-center">
            <Typography>Đang tải dữ liệu...</Typography>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Số phòng *"
                name="roomNumber"
                value={formData.roomNumber}
                onChange={handleChange}
                required
                disabled={loading}
              />
              <Input
                label="Số tầng"
                type="number"
                name="floor"
                value={formData.floor}
                onChange={handleChange}
                disabled={loading}
              />
              <Input
                label="Diện tích (m²)"
                type="number"
                name="area"
                value={formData.area}
                onChange={handleChange}
                disabled={loading}
              />
              <Input
                label="Giá thuê (VNĐ)"
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                disabled={loading}
              />
              
              <div className="flex flex-col gap-1">
                <Typography variant="small" color="blue-gray" className="mb-1 font-medium">Loại phòng</Typography>
                <Select
                  value={formData.type}
                  onChange={(val) => setFormData(p => ({ ...p, type: val }))}
                  disabled={loading}
                >
                  <Option value="STANDARD">Thường</Option>
                  <Option value="KIOT">Ki-ốt</Option>
                  <Option value="PENTHOUSE">Cao cấp</Option>
                </Select>
              </div>

              {isEdit && (
                <div className="flex flex-col gap-1">
                  <Typography variant="small" color="blue-gray" className="mb-1 font-medium">Trạng thái</Typography>
                  <Select
                    value={formData.status}
                    onChange={(val) => setFormData(p => ({...p, status: val}))}
                    disabled={loading}
                  >
                    <Option value="VACANT">Trống</Option>
                    <Option value="OCCUPIED">Đang ở</Option>
                    <Option value="MAINTENANCE">Bảo trì</Option>
                  </Select>
                </div>
              )}
            </div>

            <Textarea
              label="Mô tả"
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
            />

            <div className="flex gap-4 justify-end mt-4">
              <Button variant="text" color="red" onClick={onClose} disabled={loading}>
                Hủy
              </Button>
              <Button type="submit" color="black" disabled={loading}>
                {loading ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo Mới"}
              </Button>
            </div>
          </form>
        )}
      </DialogBody>
    </Dialog>
  );
}

export default RoomModal;

