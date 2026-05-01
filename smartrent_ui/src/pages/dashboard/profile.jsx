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
import { CameraIcon, QrCodeIcon, ArrowUpTrayIcon } from "@heroicons/react/24/solid";
import { getTenantProfile, updateTenantProfile, uploadBankQr, sendTestEmail } from "@/api/tenant";
import { uploadAvatar } from "@/api/user";
import Swal from "sweetalert2";
import { showToast } from "@/lib/swal";
import { useAuth } from "@/smartrent/auth";
import { getUserInfo, saveTokens } from "@/lib/token";
import { getAccessToken, getRefreshToken } from "@/lib/token";
import { env } from "@/config/env";
import { useNavbarHeader } from "@/context/navbar-header";

// Helper to resolve avatar URL
function getAvatarSrc(avatarUrl) {
  if (!avatarUrl) return null;
  if (avatarUrl.startsWith("http")) return avatarUrl;
  const base = env.apiBaseUrl?.replace(/\/+$/, "");
  return base ? `${base}${avatarUrl}` : avatarUrl;
}

export function Profile() {
  const { user } = useAuth();
  const { setNavbarHeader } = useNavbarHeader();
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
    bankQrUrl: "",
  });
  const [bankNameFocused, setBankNameFocused] = React.useState(false);
  const qrInputRef = React.useRef(null);
  const [uploadingQr, setUploadingQr] = React.useState(false);

  React.useEffect(() => {
    loadProfile();
  }, []);

  React.useEffect(() => {
    setNavbarHeader(
      <div className="flex flex-col">
        <Typography variant="h5" color="blue-gray" className="font-bold">
          Hồ Sơ & Thanh Toán
        </Typography>
        <Typography color="gray" className="mt-0.5 font-normal text-sm">
          Cấu hình thông tin liên hệ và tài khoản ngân hàng (QR Code) của chủ trọ
        </Typography>
      </div>
    );
    return () => setNavbarHeader(null);
  }, [setNavbarHeader]);

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
        bankQrUrl: data.bankQrUrl || "",
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

  const handleTestEmail = async () => {
    const { value: email } = await Swal.fire({
      title: 'Kiểm tra Email (SMTP)',
      input: 'email',
      inputLabel: 'Nhập địa chỉ email để nhận thư test',
      inputPlaceholder: 'example@domain.com',
      showCancelButton: true,
      confirmButtonText: 'Gửi Test',
      cancelButtonText: 'Hủy',
      customClass: {
        popup: 'rounded-xl',
        confirmButton: 'bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-6 rounded-lg',
        cancelButton: 'bg-blue-gray-100 hover:bg-blue-gray-200 text-blue-gray-800 font-medium py-2 px-6 rounded-lg ml-3'
      },
      buttonsStyling: false
    });

    if (email) {
      try {
        Swal.fire({
          title: 'Đang gửi...',
          text: 'Hệ thống đang kết nối SMTP, vui lòng chờ',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        await sendTestEmail(email);
        Swal.close();
        showToast("Đã gửi email test thành công. Vui lòng kiểm tra hộp thư.", "success");
      } catch (err) {
        Swal.close();
        showToast(err.message || "Không thể gửi email test", "error");
      }
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

  const handleQrClick = () => {
    qrInputRef.current?.click();
  };

  const handleQrChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Chỉ chấp nhận file ảnh", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("File ảnh tối đa 5MB", "error");
      return;
    }

    try {
      setUploadingQr(true);
      const result = await uploadBankQr(file);
      setFormData(prev => ({ ...prev, bankQrUrl: result.qrUrl }));
      showToast("Đã tải lên mã QR. Vui lòng bấm Lưu Thay Đổi để áp dụng.", "success");
    } catch (err) {
      showToast(err.message || "Upload QR thất bại", "error");
    } finally {
      setUploadingQr(false);
      if (qrInputRef.current) qrInputRef.current.value = "";
    }
  };

  const avatarSrc = getAvatarSrc(avatarUrl);
  const qrSrc = getAvatarSrc(formData.bankQrUrl); // reusing getAvatarSrc for resolving URL

  if (loading) return <div className="p-8">Đang tải...</div>;

  return (
    <Card className="h-full flex flex-col bg-white">
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
                  Tài khoản Ngân hàng (QR Code)
                </Typography>
                <Typography variant="small" className="text-gray-600 mt-1">
                  Dùng để sinh mã QR Code thanh toán tự động cho Khách.
                </Typography>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  size="lg"
                  label="Tên ngân hàng *"
                  placeholder={bankNameFocused ? "VD: MB Bank, Techcombank..." : ""}
                  onFocus={() => setBankNameFocused(true)}
                  onBlur={() => setBankNameFocused(false)}
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  required
                />
                <Input size="lg" label="Số tài khoản *" name="bankAccount" value={formData.bankAccount} onChange={handleChange} required />
              </div>
              <Input size="lg" label="Tên chủ tài khoản *" name="bankOwner" value={formData.bankOwner} onChange={handleChange} required />

              <div className="mt-4">
                <Typography variant="small" color="blue-gray" className="font-semibold mb-2">
                  Mã QR Thanh Toán
                </Typography>
                <div
                  className={`relative border-2 border-dashed ${qrSrc ? 'border-indigo-100' : 'border-blue-gray-200'} rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-gray-50 transition-colors ${qrSrc ? 'bg-white' : 'bg-gray-50 min-h-[200px]'}`}
                  onClick={handleQrClick}
                >
                  {uploadingQr ? (
                    <div className="flex flex-col items-center gap-2 text-indigo-500">
                      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm font-medium">Đang tải...</span>
                    </div>
                  ) : qrSrc ? (
                    <>
                      <img src={qrSrc} alt="Bank QR" className="max-h-48 object-contain rounded-lg shadow-sm mb-3" />
                      <div className="flex items-center gap-2 text-indigo-500 text-sm font-medium bg-indigo-50 px-3 py-1.5 rounded-full">
                        <ArrowUpTrayIcon className="w-4 h-4" /> Đổi ảnh QR khác
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-blue-gray-400">
                      <QrCodeIcon className="w-12 h-12 text-blue-gray-200" />
                      <span className="text-sm font-medium text-center">Bấm vào đây để tải ảnh QR lên<br /><span className="font-normal text-xs">(JPG, PNG max 5MB)</span></span>
                    </div>
                  )}
                </div>
                <input
                  ref={qrInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleQrChange}
                />
              </div>
            </div>

          </div>

          <div className="mt-8 pt-6 border-t border-blue-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
            <Button type="button" variant="outlined" color="blue-gray" className="flex items-center gap-2 py-2.5 px-6 shadow-sm hover:shadow-md transition-all text-sm w-full sm:w-auto" onClick={handleTestEmail}>
              <svg xmlns="http://www.w3.org/2001/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              Gửi Email Test
            </Button>
            <Button type="submit" variant="gradient" color="indigo" className="flex items-center gap-2 py-2.5 px-8 shadow-md hover:shadow-lg transition-all text-sm w-full sm:w-auto">
              Lưu Thay Đổi
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}

export default Profile;
