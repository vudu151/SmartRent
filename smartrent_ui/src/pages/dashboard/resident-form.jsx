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
import { getResidentById, createResident, updateResident } from "@/api/resident";
import { getRooms } from "@/api/room";
import { showToast } from "@/lib/swal";
import { useAuth } from "@/smartrent/auth";
import ReactSelect from "react-select";
import { apiFetch } from "@/lib/http";
import { env } from "@/config/env";

const ImageUploadArea = ({ label, id, imageUrl, uploading, onUpload, disabled, aspect }) => (
  <div className="flex flex-col gap-2">
    <Typography variant="small" color="blue-gray" className="font-medium">{label}</Typography>
    <div className="flex items-center gap-4">
      <div 
        className={`${aspect === 'video' ? 'w-32 h-20' : 'w-24 h-24'} border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden relative group ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-indigo-500'} transition-colors bg-gray-50/50`}
        onClick={() => !disabled && document.getElementById(id)?.click()}
      >
        {imageUrl ? (
          <img src={(env?.apiBaseUrl || "") + imageUrl} alt={label} className="w-full h-full object-cover" />
        ) : (
          <div className="text-gray-400 flex flex-col items-center p-2 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mb-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.75 3.75 0 0118 19.5H6.75z" />
            </svg>
            <span className="text-[10px] font-medium leading-tight">Tải ảnh lên</span>
          </div>
        )}
        
        {/* Overlay on hover if image exists */}
        {imageUrl && !disabled && (
          <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center backdrop-blur-[1px] transition-all">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-5 h-5">
               <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
             </svg>
          </div>
        )}

        {/* Loading overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center">
             <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
      <input 
        id={id}
        type="file" 
        accept="image/*" 
        className="hidden" 
        onChange={onUpload}
        disabled={disabled}
      />
      <div className="flex-1 text-[11px] text-gray-500">
        <p>Hỗ trợ: JPG, PNG</p>
        <p>Tối đa: 5MB</p>
        {imageUrl && !uploading && <p className="text-green-500 mt-1 font-medium flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg> Hoàn tất</p>}
      </div>
    </div>
  </div>
);

export function ResidentModal({ open, onClose, residentId, onSuccess }) {
  const { user } = useAuth();
  const isGuard = user?.role === "GUARD";
  const isEdit = Boolean(residentId);
  const [loading, setLoading] = React.useState(false);
  const [loadingData, setLoadingData] = React.useState(false);
  const [availableRooms, setAvailableRooms] = React.useState([]);
  const [uploadingAvatar, setUploadingAvatar] = React.useState(false);
  const [uploadingIdCard, setUploadingIdCard] = React.useState(false);
  const [uploadingImageIdx, setUploadingImageIdx] = React.useState(-1);
  
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
    imageUrls: [],
  });
  const [errors, setErrors] = React.useState({});

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
          avatarUrl: "",
          idCardImageUrl: "",
          status: "ACTIVE",
          notes: "",
          roomIds: [],
          imageUrls: [],
        });
        setErrors({});
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
        avatarUrl: data.avatarUrl || "",
        idCardImageUrl: data.idCardImageUrl || "",
        status: data.status || "ACTIVE",
        notes: data.notes || "",
        roomIds: data.rooms?.map((r) => r.id) || [],
        imageUrls: data.imageUrls || [],
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
    
    // Auto validate
    if (name === "idCard") {
      if (value && !/^\d{12}$/.test(value)) {
        setErrors(prev => ({ ...prev, idCard: "CCCD phải đúng 12 chữ số" }));
      } else {
        setErrors(prev => ({ ...prev, idCard: null }));
      }
    }
    if (name === "phone") {
      if (value && !/^0\d{9}$/.test(value)) {
        setErrors(prev => ({ ...prev, phone: "SĐT không hợp lệ (10 số, bắt đầu bằng 0)" }));
      } else {
        setErrors(prev => ({ ...prev, phone: null }));
      }
    }
  };

  const handleRoomSelect = (option) => {
    setFormData(prev => ({ ...prev, roomIds: [Number(option.value)] }));
  };

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
        if (field === 'avatarUrl') setUploadingAvatar(true);
        if (field === 'idCardImageUrl') setUploadingIdCard(true);

        const uploadData = new FormData();
        uploadData.append('file', file);
        
        const res = await apiFetch('/api/files/upload', {
            method: 'POST',
            body: uploadData
        });

        if (res.success) {
            setFormData(prev => ({ ...prev, [field]: res.data }));
            showToast("Tải ảnh lên thành công", "success");
        }
    } catch (err) {
        showToast(err.message || "Lỗi tải ảnh", "error");
    } finally {
        if (field === 'avatarUrl') setUploadingAvatar(false);
        if (field === 'idCardImageUrl') setUploadingIdCard(false);
    }
  };

  const handleMultiImageUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showToast("Ảnh tối đa 5MB", "error"); return; }
    try {
      setUploadingImageIdx(index);
      const uploadData = new FormData();
      uploadData.append('file', file);
      const res = await apiFetch('/api/files/upload', { method: 'POST', body: uploadData });
      if (res.success) {
        setFormData(prev => {
          const newUrls = [...prev.imageUrls];
          if (index < newUrls.length) { newUrls[index] = res.data; } else { newUrls.push(res.data); }
          return { ...prev, imageUrls: newUrls };
        });
        showToast("Tải ảnh lên thành công", "success");
      }
    } catch (err) { showToast(err.message || "Lỗi tải ảnh", "error"); }
    finally { setUploadingImageIdx(-1); }
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({ ...prev, imageUrls: prev.imageUrls.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (errors.idCard || errors.phone) {
      showToast("Vui lòng sửa các thông tin chưa hợp lệ", "error");
      return;
    }
    if (formData.idCard && !/^\d{12}$/.test(formData.idCard)) {
      showToast("CCCD phải đúng 12 chữ số", "error");
      return;
    }
    if (formData.phone && !/^0\d{9}$/.test(formData.phone)) {
      showToast("SĐT không hợp lệ (10 số, bắt đầu bằng 0)", "error");
      return;
    }
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

  const roomOptions = [
    { value: "0", label: "Chưa xếp phòng" },
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
          {isEdit ? "Cập nhật Cư dân" : "Thêm Cư dân Mới"}
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
              <Input
                label="Họ tên *"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                disabled={loading || isGuard}
              />
              <div>
                <Input
                  label="Số điện thoại"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  error={!!errors.phone}
                  disabled={loading || isGuard}
                />
                {errors.phone && <Typography variant="small" color="red" className="mt-1 text-[11px] font-medium">{errors.phone}</Typography>}
              </div>
              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading || isGuard}
              />
              <div>
                <Input
                  label="CMND/CCCD"
                  name="idCard"
                  value={formData.idCard}
                  onChange={handleChange}
                  error={!!errors.idCard}
                  disabled={loading || isGuard}
                />
                {errors.idCard && <Typography variant="small" color="red" className="mt-1 text-[11px] font-medium">{errors.idCard}</Typography>}
              </div>
              <Input
                label="Ngày sinh"
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                disabled={loading || isGuard}
              />
              
              <Select
                label="Giới tính"
                value={formData.gender}
                onChange={(val) => setFormData(p => ({ ...p, gender: val }))}
                disabled={loading || isGuard}
              >
                <Option value="MALE">Nam</Option>
                <Option value="FEMALE">Nữ</Option>
                <Option value="OTHER">Chưa rõ</Option>
              </Select>
              <ImageUploadArea 
                label="Ảnh chân dung"
                id="upload-avatar"
                imageUrl={formData.avatarUrl}
                uploading={uploadingAvatar}
                onUpload={(e) => handleFileUpload(e, 'avatarUrl')}
                disabled={loading || isGuard}
                aspect="square"
              />
              <ImageUploadArea 
                label="Ảnh CCCD / CMND"
                id="upload-cccd"
                imageUrl={formData.idCardImageUrl}
                uploading={uploadingIdCard}
                onUpload={(e) => handleFileUpload(e, 'idCardImageUrl')}
                disabled={loading || isGuard}
                aspect="video"
              />

              {/* Multi-image gallery (tối đa 3 ảnh) */}
              <div className="md:col-span-2">
                <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                  Ảnh tài liệu bổ sung <span className="text-gray-400 font-normal">(tối đa 3 ảnh)</span>
                </Typography>
                <div className="flex flex-wrap gap-3">
                  {(formData.imageUrls || []).map((url, idx) => (
                    <div key={idx} className="relative group w-28 h-20 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-indigo-400 transition-colors">
                      <img src={(env?.apiBaseUrl || "") + url} alt={`Ảnh ${idx + 1}`} className="w-full h-full object-cover" />
                      {!isGuard && (
                        <button type="button" onClick={() => handleRemoveImage(idx)} className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600" title="Xóa ảnh">✕</button>
                      )}
                      {uploadingImageIdx === idx && (
                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>
                      )}
                      {!isGuard && (
                        <>
                          <input id={`residentImage-${idx}`} type="file" accept="image/*" className="hidden" onChange={(e) => handleMultiImageUpload(e, idx)} />
                          <button type="button" onClick={() => document.getElementById(`residentImage-${idx}`)?.click()} className="absolute bottom-0.5 right-0.5 bg-white/90 text-gray-600 rounded-full w-5 h-5 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white" title="Đổi ảnh">✎</button>
                        </>
                      )}
                    </div>
                  ))}
                  {(formData.imageUrls || []).length < 3 && !isGuard && (
                    <div className="w-28 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-colors bg-gray-50/50" onClick={() => document.getElementById('residentImageNew')?.click()}>
                      {uploadingImageIdx === (formData.imageUrls || []).length ? (
                        <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400 mb-0.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                          <span className="text-[10px] text-gray-400 font-medium">Thêm ảnh</span>
                        </>
                      )}
                      <input id="residentImageNew" type="file" accept="image/*" className="hidden" onChange={(e) => handleMultiImageUpload(e, (formData.imageUrls || []).length)} />
                    </div>
                  )}
                </div>
                <Typography variant="small" className="text-gray-400 mt-1.5 text-[11px]">Hỗ trợ: JPG, PNG. Tối đa 5MB/ảnh.</Typography>
              </div>

              <div className="flex flex-col gap-1">
                <Typography variant="small" color="blue-gray" className="mb-1 font-medium">Phòng thuê hiện tại</Typography>
                <ReactSelect
                  options={roomOptions}
                  styles={selectStyles}
                  value={roomOptions.find(o => o.value === (formData.roomIds.length ? String(formData.roomIds[0]) : "0"))}
                  onChange={handleRoomSelect}
                  isDisabled={loading || isGuard}
                  placeholder="Chọn phòng..."
                  isSearchable={true}
                  noOptionsMessage={() => "Không tìm thấy phòng"}
                />
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
                <Button type="submit" variant="gradient" color="indigo" disabled={loading}>
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

