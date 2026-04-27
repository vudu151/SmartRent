import React, { useState, useEffect } from "react";
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
import { getRooms } from "@/api/room";
import { getResidents } from "@/api/resident";
import { createTicket, updateTicket } from "@/api/ticket";
import { showToast } from "@/lib/swal";
import { apiFetch } from "@/lib/http";
import { env } from "@/config/env";
import ReactSelect from "react-select";

const MultiImageUploadArea = ({ label, images, onUpload, onRemove, uploading, disabled, maxImages = 3 }) => (
  <div className="flex flex-col gap-2 col-span-full">
    <Typography variant="small" color="blue-gray" className="font-medium">{label} ({images.length}/{maxImages})</Typography>
    <div className="flex flex-wrap items-center gap-4">
      {images.map((url, idx) => (
        <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border group">
          <img src={(env?.apiBaseUrl || "") + url} alt="Incident" className="w-full h-full object-cover" />
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
          onClick={() => !disabled && document.getElementById('upload-ticket-img').click()}
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
        id="upload-ticket-img"
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

export function TicketModal({ open, onClose, onSuccess, ticket }) {
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [formData, setFormData] = useState({
    roomId: "",
    residentId: "",
    residentName: "",
    title: "",
    description: "",
    priority: "MEDIUM",
    category: "REPAIR",
    status: "PENDING",
    imageUrls: []
  });

  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    if (open) {
      loadRooms();
      if (ticket) {
        setFormData({
          roomId: String(ticket.roomId || ""),
          residentId: ticket.residentId || "",
          residentName: ticket.residentName || "",
          title: ticket.title || "",
          description: ticket.description || "",
          priority: ticket.priority || "MEDIUM",
          category: ticket.category || "REPAIR",
          status: ticket.status || "PENDING",
          imageUrls: ticket.imageUrls || []
        });
      } else {
        setFormData({
          roomId: "",
          residentId: "",
          residentName: "",
          title: "",
          description: "",
          priority: "MEDIUM",
          category: "REPAIR",
          status: "PENDING",
          imageUrls: []
        });
      }
    }
  }, [open, ticket]);

  const loadRooms = async () => {
    try {
      const res = await getRooms({ page: 0, size: 100 });
      // Chỉ hiện các phòng đang có người ở (OCCUPIED) để báo sự cố
      setRooms(res.content.filter(r => r.status === "OCCUPIED"));
    } catch (err) {
      showToast("Lỗi tải danh sách phòng", "error");
    }
  };

  const handleRoomChange = async (roomId) => {
    setFormData(prev => ({ ...prev, roomId }));
    
    // Tìm cư dân đang ở phòng này
    try {
      // Vì hệ thống hiện tại mỗi phòng 1 cư dân chính, 
      // ta fetch residents theo roomId (giả định API hỗ trợ hoặc lọc từ list)
      const res = await getResidents({ page: 0, size: 100, roomId: Number(roomId) });
      const mainResident = res.content[0];
      if (mainResident) {
        setFormData(prev => ({
          ...prev,
          residentId: mainResident.id,
          residentName: mainResident.fullName
        }));
      }
    } catch (err) {
      console.error("Lỗi tìm cư dân", err);
    }
  };

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
    if (!formData.roomId) {
      showToast("Vui lòng chọn phòng!", "warning");
      return;
    }
    
    if (!formData.title.trim()) {
      showToast("Vui lòng nhập tiêu đề sự cố!", "warning");
      return;
    }

    if (!formData.residentId) {
      showToast("Phòng chưa có cư dân, không thể báo sự cố!", "warning");
      return;
    }
    
    try {
      setLoading(true);
      const payload = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        category: formData.category,
        status: formData.status,
        roomId: Number(formData.roomId),
        residentId: Number(formData.residentId),
        imageUrls: formData.imageUrls
      };

      if (ticket) {
        await updateTicket(ticket.id, payload);
        showToast("Cập nhật sự cố thành công!", "success");
      } else {
        await createTicket(payload);
        showToast("Gửi báo cáo sự cố thành công!", "success");
      }
      onSuccess();
      onClose();
    } catch (err) {
      showToast(err.message || "Lỗi xử lý sự cố", "error");
    } finally {
      setLoading(false);
    }
  };

  const roomOptions = [
    { value: "", label: "Chọn phòng", isDisabled: true },
    ...rooms.map(r => ({ value: String(r.id), label: `Phòng ${r.roomNumber}` }))
  ];

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: '40px',
      borderRadius: '7px',
      borderColor: state.isFocused ? '#263238' : '#b0bec5',
      boxShadow: 'none',
      '&:hover': { borderColor: state.isFocused ? '#263238' : '#b0bec5' },
      fontSize: '14px',
      backgroundColor: 'transparent'
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
      borderRadius: '7px',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      padding: '4px'
    }),
    menuList: (base) => ({
      ...base,
      padding: 0,
      maxHeight: '220px'
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? '#eceff1' : state.isFocused ? '#f1f5f9' : 'transparent',
      color: state.isSelected ? '#263238' : '#455a64',
      fontWeight: state.isSelected ? 500 : 400,
      cursor: 'pointer',
      padding: '8px 12px',
      borderRadius: '5px',
      margin: '2px 0',
      '&:active': { backgroundColor: '#eceff1' }
    }),
    placeholder: (base) => ({ ...base, color: '#607d8b' }),
    singleValue: (base) => ({ ...base, color: '#455a64' })
  };

  return (
    <Dialog open={open} handler={onClose} size="md" className="z-[9999] overflow-hidden" overlayProps={{ className: "z-[9998]" }}>
      <DialogHeader className="pb-2 flex justify-between items-center">
        <Typography variant="h5" color="blue-gray">{ticket ? "Cập Nhật Sự Cố" : "Báo Cáo Sự Cố Mới"}</Typography>
        <IconButton variant="text" color="blue-gray" onClick={onClose} className="rounded-full flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </IconButton>
      </DialogHeader>
      <DialogBody divider className="max-h-[80vh] overflow-y-auto overflow-x-hidden pt-4 px-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Phòng + Cư dân */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div className="flex flex-col gap-1">
              <Typography variant="small" color="blue-gray" className="font-medium">Chọn Phòng <span className="text-red-500">*</span></Typography>
              <ReactSelect
                options={roomOptions}
                styles={selectStyles}
                value={roomOptions.find(o => o.value === String(formData.roomId)) || null}
                onChange={(option) => handleRoomChange(option.value)}
                placeholder="Chọn phòng..."
                isSearchable={true}
                noOptionsMessage={() => "Không tìm thấy phòng"}
              />
            </div>
            <Input 
              label="Cư dân (Gán tự động)" 
              value={formData.residentName} 
              readOnly 
              disabled 
            />
          </div>

          {/* Tiêu đề */}
          <Input 
            label="Tiêu đề sự cố *" 
            required 
            value={formData.title}
            onChange={(e) => setFormData(p => ({...p, title: e.target.value}))}
          />

          {/* Độ ưu tiên + Trạng thái + Loại sự cố */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select 
                label="Độ ưu tiên" 
                value={formData.priority}
                onChange={(val) => setFormData(p => ({...p, priority: val}))}
                containerProps={{ className: "!min-w-0" }}
            >
              <Option value="URGENT">Khẩn cấp</Option>
              <Option value="HIGH">Cao</Option>
              <Option value="MEDIUM">Trung bình</Option>
              <Option value="LOW">Thấp</Option>
            </Select>

            <Select 
                label="Trạng thái" 
                value={formData.status}
                onChange={(val) => setFormData(p => ({...p, status: val}))}
                containerProps={{ className: "!min-w-0" }}
            >
              <Option value="PENDING">Đang chờ</Option>
              <Option value="IN_PROGRESS">Đang sửa</Option>
              <Option value="RESOLVED">Hoàn thành</Option>
            </Select>

            <Select 
                label="Loại sự cố" 
                value={formData.category}
                onChange={(val) => setFormData(p => ({...p, category: val}))}
                containerProps={{ className: "!min-w-0" }}
            >
              <Option value="PLUMBING">Ống nước</Option>
              <Option value="ELECTRICAL">Điện</Option>
              <Option value="APPLIANCE">Thiết bị gia dụng</Option>
              <Option value="SECURITY">An ninh</Option>
              <Option value="OTHER">Khác</Option>
            </Select>
          </div>

          <MultiImageUploadArea 
            label="Hình ảnh hiện trường"
            images={formData.imageUrls}
            onUpload={handleImageUpload}
            onRemove={handleRemoveImage}
            uploading={uploadingImages}
            disabled={loading}
            maxImages={3}
          />

          {/* Chi tiết */}
          <Textarea 
            label="Chi tiết sự cố" 
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData(p => ({...p, description: e.target.value}))}
          />

          {/* Buttons */}
          <div className="flex gap-3 justify-end mt-2">
            <Button variant="text" color="red" onClick={onClose} disabled={loading}>Hủy</Button>
            <Button type="submit" variant="gradient" color="indigo" disabled={loading}>
              {loading ? "Đang xử lý..." : (ticket ? "Cập Nhật" : "Gửi Báo Cáo")}
            </Button>
          </div>
        </form>
      </DialogBody>
    </Dialog>
  );
}

export default TicketModal;
