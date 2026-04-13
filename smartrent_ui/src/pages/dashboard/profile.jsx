import React from "react";
import {
  Card,
  CardBody,
  CardHeader,
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
      showToast("Đã cập nhật hồ sơ thành công!", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  if (loading) return <div className="p-8">Đang tải...</div>;

  return (
    <Card className="h-full flex flex-col bg-white">
      <CardHeader floated={false} shadow={false} className="rounded-none border-b border-blue-gray-100 shrink-0 px-6 py-4 m-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Typography variant="h5" color="blue-gray" className="font-bold">Hồ Sơ & Thanh Toán</Typography>
            <Typography color="gray" className="mt-0.5 font-normal text-sm">
              Cấu hình thông tin liên hệ và tài khoản ngân hàng (VietQR) của chủ trọ
            </Typography>
          </div>
        </div>
      </CardHeader>

      <CardBody className="overflow-auto p-6 md:p-8 flex-1 flex flex-col">
        <form onSubmit={handleSave} className="flex flex-col h-full justify-between">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

            {/* Cột trái: Thông tin Cá nhân */}
            <div className="flex flex-col gap-5 border-b lg:border-b-0 lg:border-r border-blue-gray-100 pb-6 lg:pb-0 lg:pr-12">
              <div className="mb-2">
                <Typography variant="h6" color="blue-gray" className="font-bold">
                  Thông tin Liên hệ
                </Typography>
                <Typography variant="small" className="text-gray-600 mt-1">
                  Thông tin liên lạc cơ bản dùng để hiển thị cho khách thuê và in trên các biên bản, hợp đồng.
                </Typography>
              </div>

              <Input size="lg" label="Tên chủ trọ / Tên khu trọ *" name="name" value={formData.name} onChange={handleChange} required />
              <Input size="lg" label="Số điện thoại *" name="phone" value={formData.phone} onChange={handleChange} required />
              <Input size="lg" label="Địa chỉ" name="address" value={formData.address} onChange={handleChange} />
            </div>

            {/* Cột phải: Thông tin Ngân hàng */}
            <div className="flex flex-col gap-5">
              <div className="mb-2">
                <Typography variant="h6" color="blue-gray" className="font-bold">
                  Tài khoản Ngân hàng (VietQR)
                </Typography>
                <Typography variant="small" className="text-gray-600 mt-1">
                  Dùng để sinh mã VietQR thanh toán tự động cho Khách. Vui lòng nhập <span className="font-semibold text-blue-gray-800">Tên viết tắt</span> của Ngân hàng (VD: MB, VCB, TCB, VPB...).
                </Typography>
              </div>

              <Input size="lg" label="Mã/Tên viết tắt ngân hàng *" name="bankName" value={formData.bankName} onChange={handleChange} required />
              <Input size="lg" label="Số tài khoản *" name="bankAccount" value={formData.bankAccount} onChange={handleChange} required />
              <Input size="lg" label="Tên chủ tài khoản *" name="bankOwner" value={formData.bankOwner} onChange={handleChange} required />
            </div>

          </div>

          <div className="mt-8 pt-6 border-t border-blue-gray-100 flex justify-end shrink-0">
            <Button type="submit" variant="gradient" color="indigo" className="flex items-center gap-2 py-2.5 px-8 shadow-md hover:shadow-lg transition-all text-sm">
              Lưu Thay Đổi
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}

export default Profile;
