import React from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Typography,
  Button,
  Input,
} from "@material-tailwind/react";
import { getFeeConfig, updateFeeConfig } from "@/api/service";
import { showToast } from "@/lib/swal";

export function FeeSettingsModal({ open, onClose }) {
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    rentPerSqm: "",
    servicePerSqm: "",
    parkingFee: "",
    waterPerUnit: "",
    electricityPerUnit: "",
    internetFee: "",
  });

  React.useEffect(() => {
    if (open) {
      loadConfig();
    }
  }, [open]);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const data = await getFeeConfig();
      setFormData({
        rentPerSqm: data.rentPerSqm || 0,
        servicePerSqm: data.servicePerSqm || 0,
        parkingFee: data.parkingFee || 0,
        waterPerUnit: data.waterPerUnit || 0,
        electricityPerUnit: data.electricityPerUnit || 0,
        internetFee: data.internetFee || 0,
      });
    } catch (err) {
      showToast("Không thể tải cấu hình", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await updateFeeConfig({
        rentPerSqm: Number(formData.rentPerSqm),
        servicePerSqm: Number(formData.servicePerSqm),
        parkingFee: Number(formData.parkingFee),
        waterPerUnit: Number(formData.waterPerUnit),
        electricityPerUnit: Number(formData.electricityPerUnit),
        internetFee: Number(formData.internetFee),
      });
      showToast("Cập nhật bảng giá thành công!", "success");
      onClose();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} handler={onClose} size="sm">
      <DialogHeader>Cấu hình Bảng giá Dịch vụ</DialogHeader>
      <DialogBody divider className="flex flex-col gap-4">
        <Typography variant="small" color="gray" className="mb-2 font-normal">
          Bảng giá này sẽ được sử dụng làm mức giá mặc định khi tính toán hóa đơn gộp cuối tháng.
        </Typography>

        <Input label="Tiền điện (VNĐ / kWh)" type="number" name="electricityPerUnit" value={formData.electricityPerUnit} onChange={handleChange} disabled={loading} />
        <Input label="Tiền nước (VNĐ / khối)" type="number" name="waterPerUnit" value={formData.waterPerUnit} onChange={handleChange} disabled={loading} />
        <Input label="Phí Rác / Dịch vụ (VNĐ / tháng)" type="number" name="servicePerSqm" value={formData.servicePerSqm} onChange={handleChange} disabled={loading} />
        <Input label="Internet / Wifi (VNĐ / tháng)" type="number" name="internetFee" value={formData.internetFee} onChange={handleChange} disabled={loading} />
        <Input label="Gửi xe (VNĐ / xe / tháng)" type="number" name="parkingFee" value={formData.parkingFee} onChange={handleChange} disabled={loading} />
        
      </DialogBody>
      <DialogFooter>
        <Button variant="text" color="red" onClick={onClose} className="mr-1">Hủy</Button>
        <Button variant="gradient" color="blue" onClick={handleSave} disabled={loading}>Lưu lại</Button>
      </DialogFooter>
    </Dialog>
  );
}

export default FeeSettingsModal;
