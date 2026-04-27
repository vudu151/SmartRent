import React from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Typography,
  Button,
  Input,
  Textarea,
  Select,
  Option,
} from "@material-tailwind/react";
import { getVehicleById, createVehicle, updateVehicle } from "@/api/vehicle";
import { getResidents } from "@/api/resident";
import { showToast } from "@/lib/swal";
import { useAuth } from "@/smartrent/auth";
import ReactSelect from "react-select";
import { apiFetch } from "@/lib/http";
import { env } from "@/config/env";

const VEHICLE_TYPES = [
  { value: "MOTORBIKE", label: "Xe máy", fee: 100000 },
  { value: "CAR", label: "Ô tô", fee: 500000 },
  { value: "BICYCLE", label: "Xe đạp", fee: 30000 },
  { value: "ELECTRIC_BICYCLE", label: "Xe đạp điện", fee: 70000 },
];

const MAX_IMAGES = 3;

export function VehicleModal({ open, onClose, vehicleId, onSuccess }) {
  const { user } = useAuth();
  const isGuard = user?.role === "GUARD";
  const isEdit = Boolean(vehicleId);
  const [loading, setLoading] = React.useState(false);
  const [loadingData, setLoadingData] = React.useState(false);
  const [availableResidents, setAvailableResidents] = React.useState([]);
  const [uploadingIndex, setUploadingIndex] = React.useState(-1); // -1 = not uploading
  
  const [formData, setFormData] = React.useState({
    licensePlate: "",
    vehicleType: "MOTORBIKE",
    brand: "",
    color: "",
    monthlyFee: 100000,
    residentId: "",
    imageUrls: [],
    notes: "",
  });

  React.useEffect(() => {
    if (open) {
      loadResidents();
      if (isEdit && vehicleId) {
        loadVehicle();
      } else {
        setFormData({
          licensePlate: "",
          vehicleType: "MOTORBIKE",
          brand: "",
          color: "",
          monthlyFee: 100000,
          residentId: "",
          imageUrls: [],
          notes: "",
        });
      }
    }
  }, [open, isEdit, vehicleId]);

  const loadResidents = async () => {
    try {
      const res = await getResidents({ size: 1000, status: "ACTIVE" });
      setAvailableResidents(res.content || []);
    } catch (err) {
      console.error("Error loading residents:", err);
    }
  };

  const loadVehicle = async () => {
    try {
      setLoadingData(true);
      const data = await getVehicleById(Number(vehicleId));
      setFormData({
        licensePlate: data.licensePlate || "",
        vehicleType: data.vehicleType || "MOTORBIKE",
        brand: data.brand || "",
        color: data.color || "",
        monthlyFee: data.monthlyFee || 0,
        residentId: data.residentId || "",
        imageUrls: data.imageUrls || [],
        notes: data.notes || "",
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

  const handleTypeChange = (val) => {
    const selectedType = VEHICLE_TYPES.find(t => t.value === val);
    setFormData(prev => ({ 
      ...prev, 
      vehicleType: val,
      monthlyFee: selectedType ? selectedType.fee : prev.monthlyFee 
    }));
  };

  const handleResidentSelect = (option) => {
    setFormData(prev => ({ ...prev, residentId: option ? Number(option.value) : "" }));
  };

  const handleFileUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast("Ảnh tối đa 5MB", "error");
      return;
    }

    try {
      setUploadingIndex(index);
      const uploadData = new FormData();
      uploadData.append('file', file);
      
      const res = await apiFetch('/api/files/upload', {
          method: 'POST',
          body: uploadData
      });

      if (res.success) {
        setFormData(prev => {
          const newUrls = [...prev.imageUrls];
          if (index < newUrls.length) {
            newUrls[index] = res.data; // Replace existing
          } else {
            newUrls.push(res.data); // Add new
          }
          return { ...prev, imageUrls: newUrls };
        });
        showToast("Tải ảnh lên thành công", "success");
      }
    } catch (err) {
        showToast(err.message || "Lỗi tải ảnh", "error");
    } finally {
        setUploadingIndex(-1);
    }
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => {
      const newUrls = prev.imageUrls.filter((_, i) => i !== index);
      return { ...prev, imageUrls: newUrls };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.licensePlate || !formData.residentId) {
      showToast("Vui lòng điền đủ Biển số và Cư dân", "error");
      return;
    }
    
    try {
      setLoading(true);
      const payload = { ...formData };
      
      if (isEdit && vehicleId) {
        await updateVehicle(Number(vehicleId), payload);
        showToast("Cập nhật xe thành công!", "success");
      } else {
        await createVehicle(payload);
        showToast("Tạo xe thành công!", "success");
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      showToast(err.message || "Có lỗi xảy ra", "error");
    } finally {
      setLoading(false);
    }
  };

  const residentOptions = availableResidents.map(r => ({ 
    value: String(r.id), 
    label: `${r.fullName} (Phòng: ${r.rooms?.map(rm => rm.roomNumber).join(", ") || "Chưa có"})` 
  }));

  const selectedResidentOption = formData.residentId ? residentOptions.find(o => o.value === String(formData.residentId)) : null;

  const currentImages = formData.imageUrls || [];
  const canAddMore = currentImages.length < MAX_IMAGES;

  return (
    <Dialog open={open} handler={onClose} size="sm" className="bg-white m-4 max-h-[90vh] flex flex-col rounded-xl shadow-2xl">
      <DialogHeader className="border-b border-blue-gray-50 px-6 py-4">
        <Typography variant="h5" color="blue-gray">
          {isEdit ? "Cập nhật Xe" : "Thêm Xe Mới"}
        </Typography>
      </DialogHeader>

      <DialogBody divider className="p-6 overflow-y-auto border-none">
        {loadingData ? (
          <div className="flex justify-center py-8"><Typography>Đang tải...</Typography></div>
        ) : (
          <form id="vehicleForm" onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Typography variant="small" color="blue-gray" className="mb-2 font-medium">Biển số *</Typography>
                <Input size="lg" name="licensePlate" value={formData.licensePlate} onChange={handleChange} placeholder="VD: 59A1-12345" required disabled={isGuard} className="!border-t-blue-gray-200 focus:!border-t-gray-900" labelProps={{ className: "before:content-none after:content-none" }} />
              </div>
              <div>
                <Typography variant="small" color="blue-gray" className="mb-2 font-medium">Loại xe *</Typography>
                <Select size="lg" value={formData.vehicleType} onChange={handleTypeChange} disabled={isGuard} className="!border-t-blue-gray-200 focus:!border-t-gray-900" labelProps={{ className: "before:content-none after:content-none" }}>
                  {VEHICLE_TYPES.map(type => (
                    <Option key={type.value} value={type.value}>{type.label}</Option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Typography variant="small" color="blue-gray" className="mb-2 font-medium">Hãng xe</Typography>
                <Input size="lg" name="brand" value={formData.brand} onChange={handleChange} placeholder="VD: Honda, Toyota..." disabled={isGuard} className="!border-t-blue-gray-200 focus:!border-t-gray-900" labelProps={{ className: "before:content-none after:content-none" }} />
              </div>
              <div>
                <Typography variant="small" color="blue-gray" className="mb-2 font-medium">Màu sắc</Typography>
                <Input size="lg" name="color" value={formData.color} onChange={handleChange} placeholder="VD: Đen, Trắng..." disabled={isGuard} className="!border-t-blue-gray-200 focus:!border-t-gray-900" labelProps={{ className: "before:content-none after:content-none" }} />
              </div>
            </div>

            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">Cư dân *</Typography>
              <ReactSelect
                options={residentOptions}
                value={selectedResidentOption}
                onChange={handleResidentSelect}
                placeholder="Chọn cư dân..."
                isDisabled={isGuard}
                noOptionsMessage={() => "Không tìm thấy cư dân"}
                styles={{
                  control: (base, state) => ({ ...base, minHeight: '44px', borderRadius: '0.5rem', borderColor: state.isFocused ? '#212121' : '#b0bec5', boxShadow: 'none', '&:hover': { borderColor: state.isFocused ? '#212121' : '#b0bec5' } }),
                  menu: (base) => ({ ...base, zIndex: 9999 })
                }}
              />
            </div>

            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">Phí gửi xe/tháng (VNĐ) *</Typography>
              <Input type="number" size="lg" name="monthlyFee" value={formData.monthlyFee} onChange={handleChange} placeholder="0" required disabled={isGuard} className="!border-t-blue-gray-200 focus:!border-t-gray-900" labelProps={{ className: "before:content-none after:content-none" }} />
            </div>

            {/* ===== Ảnh chụp xe (tối đa 3 ảnh) ===== */}
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Ảnh chụp xe <span className="text-gray-400 font-normal">(tối đa {MAX_IMAGES} ảnh)</span>
              </Typography>
              <div className="flex flex-wrap gap-3">
                {/* Hiển thị các ảnh đã upload */}
                {currentImages.map((url, idx) => (
                  <div key={idx} className="relative group w-28 h-20 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-indigo-400 transition-colors">
                    <img 
                      src={(env?.apiBaseUrl || "") + url} 
                      alt={`Ảnh xe ${idx + 1}`} 
                      className="w-full h-full object-cover"
                    />
                    {/* Nút xóa ảnh */}
                    {!isGuard && (
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600"
                        title="Xóa ảnh"
                      >
                        ✕
                      </button>
                    )}
                    {/* Uploading overlay */}
                    {uploadingIndex === idx && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                    {/* Nút đổi ảnh */}
                    {!isGuard && (
                      <>
                        <input
                          id={`vehicleImage-${idx}`}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, idx)}
                        />
                        <button
                          type="button"
                          onClick={() => document.getElementById(`vehicleImage-${idx}`)?.click()}
                          className="absolute bottom-0.5 right-0.5 bg-white/90 text-gray-600 rounded-full w-5 h-5 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white"
                          title="Đổi ảnh"
                        >
                          ✎
                        </button>
                      </>
                    )}
                  </div>
                ))}

                {/* Nút thêm ảnh mới (nếu chưa đủ 3) */}
                {canAddMore && !isGuard && (
                  <div
                    className="w-28 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-colors bg-gray-50/50"
                    onClick={() => document.getElementById('vehicleImageNew')?.click()}
                  >
                    {uploadingIndex === currentImages.length ? (
                      <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400 mb-0.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        <span className="text-[10px] text-gray-400 font-medium">Thêm ảnh</span>
                      </>
                    )}
                    <input
                      id="vehicleImageNew"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, currentImages.length)}
                    />
                  </div>
                )}
              </div>
              <Typography variant="small" className="text-gray-400 mt-1.5 text-[11px]">
                Hỗ trợ: JPG, PNG. Tối đa 5MB/ảnh.
              </Typography>
            </div>

            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">Ghi chú</Typography>
              <Textarea rows={3} name="notes" value={formData.notes} onChange={handleChange} placeholder="Ghi chú thêm..." disabled={isGuard} className="!border-t-blue-gray-200 focus:!border-t-gray-900" labelProps={{ className: "before:content-none after:content-none" }} />
            </div>
          </form>
        )}
      </DialogBody>

      <DialogFooter className="border-t border-blue-gray-50 px-6 py-4 justify-between">
        <Button variant="text" color="gray" onClick={onClose} className="px-6">Hủy</Button>
        {!isGuard && (
          <Button variant="gradient" color="indigo" type="submit" form="vehicleForm" disabled={loading || loadingData || uploadingIndex >= 0} className="px-6 flex items-center gap-2">
            {loading ? <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></span> : null}
            {isEdit ? "Cập nhật" : "Lưu lại"}
          </Button>
        )}
      </DialogFooter>
    </Dialog>
  );
}
