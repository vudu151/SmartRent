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

  return (
    <Dialog open={open} handler={onClose} size="md">
      <DialogHeader>
        <Typography variant="h5" color="blue-gray">Báo Cáo Sự Cố Mới</Typography>
      </DialogHeader>
      <DialogBody divider className="max-h-[80vh] overflow-y-auto pt-0">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select 
              label="Chọn Phòng *" 
              value={formData.roomId} 
              onChange={handleRoomChange}
            >
              {rooms.map(r => (
                <Option key={r.id} value={r.id.toString()}>Phòng {r.roomNumber}</Option>
              ))}
            </Select>

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
