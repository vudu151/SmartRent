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
import { getContractById, createContract, updateContract } from "@/api/contract";
import { getRooms } from "@/api/room";
import { getResidents } from "@/api/resident";
import { showToast } from "@/lib/swal";
import { apiFetch } from "@/lib/http";
import { env } from "@/config/env";
import ReactSelect from "react-select";

const MultiImageUploadArea = ({ label, images, onUpload, onRemove, uploading, disabled, maxImages = 5 }) => (
  <div className="flex flex-col gap-2 col-span-full">
    <Typography variant="small" color="blue-gray" className="font-medium">{label} ({images.length}/{maxImages})</Typography>
    <div className="flex flex-wrap items-center gap-4">
      {images.map((url, idx) => (
        <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border group">
          <img src={(env?.apiBaseUrl || "") + url} alt="Contract" className="w-full h-full object-cover" />
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
          onClick={() => !disabled && document.getElementById('upload-contract-img').click()}
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
        id="upload-contract-img"
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
    notes: "",
    imageUrls: []
  });
  const [errors, setErrors] = React.useState({});
  const [uploadingImages, setUploadingImages] = React.useState(false);

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
          notes: "",
          imageUrls: []
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
        notes: data.notes || "",
        imageUrls: data.imageUrls || []
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

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (formData.imageUrls.length + files.length > 5) {
      showToast("Chỉ được tải tối đa 5 ảnh", "warning");
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
        imageUrls: formData.imageUrls,
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
      <DialogHeader className="flex justify-between items-center">
        <Typography variant="h5" color="blue-gray">
          {isEdit ? "Chi tiết Hợp đồng" : "Tạo Hợp đồng Mới"}
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

            <MultiImageUploadArea 
              label="Ảnh chụp hợp đồng"
              images={formData.imageUrls}
              onUpload={handleImageUpload}
              onRemove={handleRemoveImage}
              uploading={uploadingImages}
              disabled={loading}
              maxImages={5}
            />

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
              <Button type="submit" variant="gradient" color="indigo" disabled={loading}>
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
