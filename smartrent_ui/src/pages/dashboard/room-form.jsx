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
  const [errors, setErrors] = React.useState({});
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
      setErrors({});
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

  const validateField = (name, value) => {
    let error = "";
    if (name === "roomNumber") {
      if (!value || String(value).trim() === "") {
        error = "Vui lòng nhập số phòng";
      } else {
        const roomPattern = /^[0-9]+$/;
        if (!roomPattern.test(String(value).trim())) {
          error = "Số phòng chỉ được chứa các chữ số (0-9)";
        } else if (Number(value) >= 10000) {
          error = "Số phòng phải nhỏ hơn 10000";
        }
      }
    } else if (name === "floor") {
      if (value !== "") {
        const floorNum = Number(value);
        if (floorNum < 0 || floorNum > 100 || !Number.isInteger(floorNum)) {
          error = "Số tầng phải là số nguyên (0 - 100)";
        }
      }
    } else if (name === "area") {
      if (value !== "") {
        const areaNum = Number(value);
        if (areaNum <= 0 || areaNum > 1000) {
          error = "Diện tích phải hợp lý (0 - 1000m²)";
        }
      }
    } else if (name === "price") {
      if (value !== "") {
        const priceNum = Number(value);
        if (priceNum < 0 || !Number.isInteger(priceNum)) {
          error = "Giá thuê phải là số nguyên dương";
        } else if (priceNum > 100000000) {
          error = "Giá thuê không vượt quá 100 triệu";
        }
      }
    }
    return error;
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // --- VALIDATION NGHIỆP VỤ PHÒNG TRỌ (NÂNG CAO) ---
    const newErrors = {};
    ["roomNumber", "floor", "area", "price"].forEach(field => {
      const err = validateField(field, formData[field]);
      if (err) newErrors[field] = err;
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }
    // ----------------------------------------

    try {
      setLoading(true);
      const payload = {
        ...formData,
        roomNumber: formData.roomNumber.trim(),
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
      if (err.message && err.message.includes("Số phòng đã tồn tại")) {
        setErrors({ roomNumber: err.message });
      } else {
        showToast(err.message || "Có lỗi xảy ra", "error");
      }
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
      <DialogBody divider className="max-h-[80vh] overflow-y-auto pt-4">
        {loadingData ? (
          <div className="py-12 flex justify-center items-center">
            <Typography>Đang tải dữ liệu...</Typography>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1">
                <Input
                  label="Số phòng"
                  type="number"
                  name="roomNumber"
                  value={formData.roomNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  disabled={loading}
                  error={!!errors.roomNumber}
                />
                {errors.roomNumber && <Typography variant="small" color="red" className="text-xs">{errors.roomNumber}</Typography>}
              </div>
              <div className="flex flex-col gap-1">
                <Input
                  label="Số tầng"
                  type="number"
                  name="floor"
                  value={formData.floor}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={loading}
                  error={!!errors.floor}
                />
                {errors.floor && <Typography variant="small" color="red" className="text-xs">{errors.floor}</Typography>}
              </div>
              <div className="flex flex-col gap-1">
                <Input
                  label="Diện tích (m²)"
                  type="number"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={loading}
                  error={!!errors.area}
                />
                {errors.area && <Typography variant="small" color="red" className="text-xs">{errors.area}</Typography>}
              </div>
              <div className="flex flex-col gap-1">
                <Input
                  label="Giá thuê (VNĐ)"
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={loading}
                  error={!!errors.price}
                />
                {errors.price && <Typography variant="small" color="red" className="text-xs">{errors.price}</Typography>}
              </div>
              
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

