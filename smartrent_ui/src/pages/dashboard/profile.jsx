import React from "react";
import {
  Card,
  CardBody,
  Typography,
  Input,
  Button,
} from "@material-tailwind/react";
import { getTenantProfile, updateTenantProfile } from "@/api/tenant";
import { showToast } from "@/lib/swal";

export function Profile() {
  const [loading, setLoading] = React.useState(true);
  const [formData, setFormData] = React.useState({
    name: "",
    phone: "",
    address: "",
    bankName: "",
    bankAccount: "",
    bankOwner: "",
  });

  React.useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getTenantProfile();
      setFormData({
        name: data.name || "",
        phone: data.phone || "",
        address: data.address || "",
        bankName: data.bankName || "",
        bankAccount: data.bankAccount || "",
        bankOwner: data.bankOwner || "",
      });
    } catch (err) {
      showToast("Không tải được hồ sơ", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await updateTenantProfile(formData);
      showToast("Đã lưu cấu hình ngân hàng!", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  if (loading) return <div className="p-8">Đang tải...</div>;

  return (
    <div className="mt-12">
      <Card>
        <CardBody className="p-8">
          <Typography variant="h5" color="blue-gray" className="mb-6">
            Cấu hình Hồ Sơ & Thanh Toán
          </Typography>
          <Typography variant="small" className="text-gray-600 mb-8 max-w-2xl">
            Thông tin ngân hàng bên dưới cực kỳ quan trọng. Hệ thống sẽ sử dụng Tài khoản ngân hàng này 
            để tự động sinh mã VietQR trên Cổng thông tin của Khách thuê (Tenant Portal). 
            Vui lòng nhập chính xác Tên viết tắt của Ngân hàng (VD: MB, VCB, TCB, VPB...).
          </Typography>

          <form onSubmit={handleSave} className="flex flex-col gap-6 max-w-xl">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Tên chủ trọ / Tên khu trọ" name="name" value={formData.name} onChange={handleChange} required />
              <Input label="Số điện thoại" name="phone" value={formData.phone} onChange={handleChange} />
            </div>
            
            <Input label="Địa chỉ" name="address" value={formData.address} onChange={handleChange} />

            <Typography variant="h6" color="blue-gray" className="mt-4 mb-2">
              Thông tin Ngân hàng (VietQR)
            </Typography>
            
            <Input label="Mã ngân hàng (VD: MB, VCB, TPB)" name="bankName" value={formData.bankName} onChange={handleChange} required />
            <Input label="Số tài khoản" name="bankAccount" value={formData.bankAccount} onChange={handleChange} required />
            <Input label="Tên chủ tài khoản" name="bankOwner" value={formData.bankOwner} onChange={handleChange} required />

            <div className="mt-4">
              <Button type="submit" variant="gradient" color="blue">
                Lưu Thay Đổi
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

export default Profile;
