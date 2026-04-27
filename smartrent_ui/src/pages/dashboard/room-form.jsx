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
import { getRoomById, createRoom, updateRoom } from "@/api/room";
import { showToast } from "@/lib/swal";
import { apiFetch } from "@/lib/http";
import { env } from "@/config/env";
import { useNavbarHeader } from "@/context/navbar-header";

const MultiImageUploadArea = ({ label, images, onUpload, onRemove, uploading, disabled, maxImages = 3 }) => (
  <div className="flex flex-col gap-2 col-span-full">
    <Typography variant="small" color="blue-gray" className="font-medium">{label} ({images.length}/{maxImages})</Typography>
    <div className="flex flex-wrap items-center gap-4">
      {images.map((url, idx) => (
        <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border group">
          <img src={(env?.apiBaseUrl || "") + url} alt="Room" className="w-full h-full object-cover" />
          {!disabled && (
            <button 
              type="button"
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onRemove(idx)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      ))}
      
      {images.length < maxImages && (
        <div 
          className={`w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center relative bg-gray-50/50 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-indigo-500'} transition-colors`}
          onClick={() => !disabled && document.getElementById('upload-room-img').click()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-400 mb-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span className="text-[10px] text-gray-500 font-medium leading-tight">Thêm ảnh</span>
          
          {uploading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      )}
      
      <input 
        id="upload-room-img"
        type="file" 
        accept="image/*" 
        multiple
        className="hidden" 
        onChange={onUpload}
        disabled={disabled || uploading}
      />
    </div>
  </div>
);

export function RoomModal({ open, onClose, roomId, onSuccess }) {
  const { buildings, activeBuildingId } = useNavbarHeader();
  const selectedBuilding = buildings?.find(b => String(b.id) === String(activeBuildingId));
  const selectedBuildingName = selectedBuilding ? selectedBuilding.name : "";

  const generatePrefix = (name) => {
    if (!name) return "";
    let cleanName = name.replace(/^(Khu |Nhà |Trọ |Chung cư )/i, "");
    let words = cleanName.trim().split(/\s+/);
    let prefix = words.map(w => {
      if (/^\d+$/.test(w)) return w;
      return w.charAt(0).toUpperCase();
    }).join('');
    return prefix ? prefix + "-" : "";
  };
  const currentPrefix = generatePrefix(selectedBuildingName);

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
    description: "",
    imageUrls: []
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
          description: "",
          imageUrls: []
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
        description: data.description || "",
        imageUrls: data.imageUrls || []
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
      } else if (String(value).trim().length > 20) {
        error = "Số phòng không được vượt quá 20 ký tự";
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

  const [uploadingImages, setUploadingImages] = React.useState(false);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (formData.imageUrls.length + files.length > 3) {
      showToast("Chỉ được tải tối đa 3 ảnh", "warning");
      return;
    }

    try {
      setUploadingImages(true);
      const newUrls = [...formData.imageUrls];
      
      for (const file of files) {
        const uploadData = new FormData();
        uploadData.append('file', file);
        
        const res = await apiFetch('/api/files/upload', {
          method: 'POST',
          body: uploadData
        });

        if (res.success) {
          newUrls.push(res.data);
        }
      }
      
      setFormData(prev => ({ ...prev, imageUrls: newUrls }));
      showToast("Tải ảnh lên thành công", "success");
    } catch (err) {
      showToast(err.message || "Lỗi tải ảnh", "error");
    } finally {
      setUploadingImages(false);
      // Reset file input
      e.target.value = null;
    }
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => {
      const newUrls = [...prev.imageUrls];
      newUrls.splice(index, 1);
      return { ...prev, imageUrls: newUrls };
    });
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
      
      let finalRoomNumber = String(formData.roomNumber).trim();
      const prefix = currentPrefix;
      if (prefix && !finalRoomNumber.toUpperCase().startsWith(prefix.toUpperCase())) {
        finalRoomNumber = prefix + finalRoomNumber;
      }
      
      if (finalRoomNumber.length > 20) {
        setErrors({ ...newErrors, roomNumber: "Mã phòng sau khi nối tiền tố vượt quá 20 ký tự (" + finalRoomNumber + ")" });
        setLoading(false);
        return;
      }

      const payload = {
        ...formData,
        roomNumber: finalRoomNumber,
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
      <DialogHeader className="flex justify-between items-center">
        <Typography variant="h5" color="blue-gray">
          {isEdit ? "Cập nhật Phòng" : "Thêm Phòng Mới"}
        </Typography>
        <IconButton variant="text" color="blue-gray" onClick={onClose} className="rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </IconButton>
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
                  type="text"
                  maxLength={20}
                  placeholder={currentPrefix ? `VD: nhập "101" sẽ tự thành "${currentPrefix}101"` : "VD: 101"}
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

              <MultiImageUploadArea 
                label="Hình ảnh phòng"
                images={formData.imageUrls}
                onUpload={handleImageUpload}
                onRemove={handleRemoveImage}
                uploading={uploadingImages}
                disabled={loading}
                maxImages={3}
              />
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
              <Button type="submit" variant="gradient" color="indigo" disabled={loading}>
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

