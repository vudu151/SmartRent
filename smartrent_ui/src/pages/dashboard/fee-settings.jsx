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
    servicePrice: "",
    parkingPrice: "",
    waterPrice: "",
    electricityPrice: "",
    internetPrice: "",
    meterRecordingStartDay: "",
    meterRecordingEndDay: "",
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
        servicePrice: data.servicePrice || 0,
        parkingPrice: data.parkingPrice || 0,
        waterPrice: data.waterPrice || 0,
        electricityPrice: data.electricityPrice || 0,
        internetPrice: data.internetPrice || 0,
        meterRecordingStartDay: data.meterRecordingStartDay || 1,
        meterRecordingEndDay: data.meterRecordingEndDay || 31,
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
        servicePrice: Number(formData.servicePrice),
        parkingPrice: Number(formData.parkingPrice),
        waterPrice: Number(formData.waterPrice),
        electricityPrice: Number(formData.electricityPrice),
        internetPrice: Number(formData.internetPrice),
        meterRecordingStartDay: Number(formData.meterRecordingStartDay),
        meterRecordingEndDay: Number(formData.meterRecordingEndDay),
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

        <Input label="Tiền điện (VNĐ / kWh)" type="number" name="electricityPrice" value={formData.electricityPrice} onChange={handleChange} disabled={loading} />
        <Input label="Tiền nước (VNĐ / khối)" type="number" name="waterPrice" value={formData.waterPrice} onChange={handleChange} disabled={loading} />
        <Input label="Phí Rác / Dịch vụ (VNĐ / tháng)" type="number" name="servicePrice" value={formData.servicePrice} onChange={handleChange} disabled={loading} />
        <Input label="Internet / Wifi (VNĐ / tháng)" type="number" name="internetPrice" value={formData.internetPrice} onChange={handleChange} disabled={loading} />
        <Input label="Gửi xe (VNĐ / xe / tháng)" type="number" name="parkingPrice" value={formData.parkingPrice} onChange={handleChange} disabled={loading} />
        <div className="flex gap-4">
          <Input label="Ngày bắt đầu chốt (1-31)" type="number" name="meterRecordingStartDay" value={formData.meterRecordingStartDay} onChange={handleChange} disabled={loading} min={1} max={31} />
          <Input label="Ngày kết thúc chốt (1-31)" type="number" name="meterRecordingEndDay" value={formData.meterRecordingEndDay} onChange={handleChange} disabled={loading} min={1} max={31} />
        </div>
        
      </DialogBody>
      <DialogFooter>
        <Button variant="text" color="red" onClick={onClose} className="mr-1">Hủy</Button>
        <Button variant="gradient" color="blue" onClick={handleSave} disabled={loading}>Lưu lại</Button>
      </DialogFooter>
    </Dialog>
  );
}

export default FeeSettingsModal;
