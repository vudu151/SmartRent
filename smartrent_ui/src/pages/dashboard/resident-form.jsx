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
import ReactSelect from "react-select";

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
          status: "ACTIVE",
          notes: "",
          roomIds: [],
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

