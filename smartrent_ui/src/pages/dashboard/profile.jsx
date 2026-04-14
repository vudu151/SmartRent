import React from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Typography,
  Input,
  Button,
  Avatar,
} from "@material-tailwind/react";
import { CameraIcon } from "@heroicons/react/24/solid";
import { getTenantProfile, updateTenantProfile } from "@/api/tenant";
import { uploadAvatar } from "@/api/user";
import { showToast } from "@/lib/swal";
import { useAuth } from "@/smartrent/auth";
import { getUserInfo, saveTokens } from "@/lib/token";
import { getAccessToken, getRefreshToken } from "@/lib/token";
import { env } from "@/config/env";

// Helper to resolve avatar URL
function getAvatarSrc(avatarUrl) {
  if (!avatarUrl) return null;
  if (avatarUrl.startsWith("http")) return avatarUrl;
  const base = env.apiBaseUrl?.replace(/\/+$/, "");
  return base ? `${base}${avatarUrl}` : avatarUrl;
}

export function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [avatarUrl, setAvatarUrl] = React.useState(user?.avatarUrl || null);
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef(null);
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

  React.useEffect(() => {
    if (user?.avatarUrl) {
      setAvatarUrl(user.avatarUrl);
    }
  }, [user?.avatarUrl]);

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

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate on client side
    if (!file.type.startsWith("image/")) {
      showToast("Chỉ chấp nhận file ảnh (JPG, PNG, GIF...)", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("File ảnh tối đa 5MB", "error");
      return;
    }

    try {
      setUploading(true);
      const result = await uploadAvatar(file);

      // Update avatar URL in state
      setAvatarUrl(result.avatarUrl);

      // Update user info in localStorage so navbar reflects change immediately
      const currentUser = getUserInfo();
      if (currentUser) {
        currentUser.avatarUrl = result.avatarUrl;
        const accessToken = getAccessToken();
        const refreshToken = getRefreshToken();
        if (accessToken && refreshToken) {
          saveTokens(accessToken, refreshToken, currentUser);
        }
      }

      showToast("Cập nhật ảnh đại diện thành công!", "success");

      // Force reload to update navbar avatar
      window.location.reload();
    } catch (err) {
      showToast(err.message || "Upload ảnh thất bại", "error");
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const avatarSrc = getAvatarSrc(avatarUrl);

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

            {/* Cột trái: Avatar + Thông tin Cá nhân */}
            <div className="flex flex-col gap-5 border-b lg:border-b-0 lg:border-r border-blue-gray-100 pb-6 lg:pb-0 lg:pr-12">
              
              {/* Avatar Upload Section */}
              <div className="flex items-center gap-5 mb-4">
                <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                  {avatarSrc ? (
                    <Avatar
                      src={avatarSrc}
                      alt={user?.fullName || user?.username || "User"}
                      size="xxl"
                      variant="circular"
                      className="border-4 border-blue-gray-100 shadow-lg w-24 h-24 object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold text-3xl shadow-lg border-4 border-blue-gray-100">
                      {(user?.fullName || user?.username || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <CameraIcon className="h-7 w-7 text-white" />
                  </div>
                  {uploading && (
                    <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <div>
                  <Typography variant="h6" color="blue-gray" className="font-bold">
                    {user?.fullName || user?.username}
                  </Typography>
                  <Typography variant="small" className="text-blue-gray-500">
                    {user?.role}
                  </Typography>
                  <Typography
                    variant="small"
                    className="text-indigo-500 cursor-pointer hover:text-indigo-700 mt-1 font-medium"
                    onClick={handleAvatarClick}
                  >
                    {uploading ? "Đang tải lên..." : "Đổi ảnh đại diện"}
                  </Typography>
                </div>
              </div>

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
