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
} from "@material-tailwind/react";
import { getRooms } from "@/api/room";
import { getResidents } from "@/api/resident";
import { createTicket } from "@/api/ticket";
import { showToast } from "@/lib/swal";
import ReactSelect from "react-select";

export function TicketModal({ open, onClose, onSuccess }) {
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
    status: "PENDING"
  });

  useEffect(() => {
    if (open) {
      loadRooms();
    }
  }, [open]);

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
    
    try {
      setLoading(true);
      await createTicket({
        ...formData,
        roomId: Number(formData.roomId),
        residentId: Number(formData.residentId)
      });
      showToast("Gửi báo cáo sự cố thành công!", "success");
      onSuccess();
      onClose();
    } catch (err) {
      showToast(err.message || "Có lỗi xảy ra", "error");
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
    <Dialog open={open} handler={onClose} size="md" className="z-[9999]" overlayProps={{ className: "z-[9998]" }}>
      <DialogHeader>
        <Typography variant="h5" color="blue-gray">Báo Cáo Sự Cố Mới</Typography>
      </DialogHeader>
      <DialogBody divider className="max-h-[80vh] overflow-y-auto pt-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1">
              <Typography variant="small" color="blue-gray" className="mb-1 font-medium">Chọn Phòng *</Typography>
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

          <Input 
            label="Tiêu đề sự cố *" 
            required 
            value={formData.title}
            onChange={(e) => setFormData(p => ({...p, title: e.target.value}))}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Select 
                label="Độ ưu tiên" 
                value={formData.priority}
                onChange={(val) => setFormData(p => ({...p, priority: val}))}
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
            >
              <Option value="PENDING">Mới báo (Đang chờ)</Option>
              <Option value="IN_PROGRESS">Đang sửa</Option>
              <Option value="RESOLVED">Hoàn thành</Option>
            </Select>

            <Select 
                label="Loại sự cố" 
                value={formData.category}
                onChange={(val) => setFormData(p => ({...p, category: val}))}
            >
              <Option value="REPAIR">Sửa chữa</Option>
              <Option value="CLEANING">Vệ sinh</Option>
              <Option value="SECURITY">An ninh</Option>
              <Option value="OTHER">Khác</Option>
            </Select>
          </div>

          <Textarea 
            label="Chi tiết sự cố" 
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData(p => ({...p, description: e.target.value}))}
          />

          <div className="flex gap-4 justify-end mt-4">
            <Button variant="text" color="red" onClick={onClose} disabled={loading}>Hủy</Button>
            <Button type="submit" color="black" disabled={loading}>
              {loading ? "Đang gửi..." : "Gửi Báo Cáo"}
            </Button>
          </div>
        </form>
      </DialogBody>
    </Dialog>
  );
}

export default TicketModal;
