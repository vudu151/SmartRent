import React from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  Typography,
  Button,
  Input,
  Textarea,
  Alert,
} from "@material-tailwind/react";
import {
  getTenantById,
  createTenant,
  updateTenant,
} from "@/api/tenant";
import { ApiError } from "@/lib/apiError";
import { showToast } from "@/lib/swal";

export function TenantModal({ open, onClose, tenantId, onSuccess }) {
  const isEdit = Boolean(tenantId);
  const [loading, setLoading] = React.useState(false);
  const [loadingData, setLoadingData] = React.useState(false);
  const [error, setError] = React.useState("");
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    taxCode: "",
  });
  const [errors, setErrors] = React.useState({});

  React.useEffect(() => {
    if (open) {
      if (isEdit && tenantId) {
        loadTenant();
      } else {
        // Reset form for "Create"
        setFormData({
          name: "",
          email: "",
          phone: "",
          address: "",
          taxCode: "",
        });
        setError("");
        setErrors({});
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isEdit, tenantId]);

  const loadTenant = async () => {
    try {
      setLoadingData(true);
      setError("");
      const tenant = await getTenantById(Number(tenantId));
      setFormData({
        name: tenant.name || "",
        email: tenant.email || "",
        phone: tenant.phone || "",
        address: tenant.address || "",
        taxCode: tenant.taxCode || "",
      });
      setErrors({});
    } catch (err) {
      console.error("Error loading tenant:", err);
      let errorMessage = "Không thể tải thông tin tenant. Vui lòng thử lại.";
      if (err instanceof ApiError) {
        errorMessage = err.message || errorMessage;
      }
      setError(errorMessage);
    } finally {
      setLoadingData(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    let errorMsg = null;
    if (name === "phone" && value && !/^0\d{9}$/.test(value)) {
      errorMsg = "SĐT không hợp lệ (10 số, bắt đầu bằng 0)";
    }
    if (name === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      errorMsg = "Email không đúng định dạng";
    }
    if (name === "taxCode" && value && !/^\d{10,14}$/.test(value)) {
      errorMsg = "Mã số thuế phải từ 10 đến 14 chữ số";
    }
    setErrors(prev => ({ ...prev, [name]: errorMsg }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast("Vui lòng nhập tên chủ trọ!", "error");
      return;
    }
    if (!formData.email.trim()) {
      showToast("Vui lòng nhập email!", "error");
      return;
    }
    if (errors.phone || errors.email || errors.taxCode) {
      showToast("Vui lòng sửa các thông tin chưa hợp lệ", "error");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (isEdit && tenantId) {
        const updateRequest = {
          name: formData.name || undefined,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          address: formData.address || undefined,
          taxCode: formData.taxCode || undefined,
        };
        await updateTenant(Number(tenantId), updateRequest);
        showToast("Cập nhật tenant thành công", "success");
      } else {
        const createRequest = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          address: formData.address || undefined,
          taxCode: formData.taxCode || undefined,
        };
        await createTenant(createRequest);
        showToast("Tạo tenant mới thành công", "success");
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("Error saving tenant:", err);
      let errorMessage = isEdit
        ? "Không thể cập nhật tenant. Vui lòng thử lại."
        : "Không thể tạo tenant. Vui lòng thử lại.";
      if (err instanceof ApiError) {
        errorMessage = err.message || errorMessage;
      }
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} handler={onClose} size="lg">
      <DialogHeader>
        <div>
          <Typography variant="h5" color="blue-gray">
            {isEdit ? "Cập nhật Tenant" : "Tạo Tenant mới"}
          </Typography>
          <Typography color="gray" className="mt-1 font-normal text-sm">
            {isEdit
              ? "Cập nhật thông tin chi tiết của tenant"
              : "Nhập các thông tin cần thiết để đăng ký tenant mới"}
          </Typography>
        </div>
      </DialogHeader>
      <DialogBody divider>
        {error && (
          <Alert color="red" className="mb-4" onClose={() => setError("")}>
            {error}
          </Alert>
        )}
        {loadingData ? (
          <div className="py-12 flex justify-center items-center">
            <Typography>Đang tải dữ liệu...</Typography>
          </div>
        ) : (
          <form id="tenant-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                label="Tên tenant *"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                disabled={loading}
              />
              <div className="flex flex-col gap-1">
                <Input
                  label="Email *"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={!!errors.email}
                  required
                  disabled={loading}
                />
                {errors.email && <Typography variant="small" color="red" className="mt-1 text-[11px] font-medium">{errors.email}</Typography>}
              </div>
              <div className="flex flex-col gap-1">
                <Input
                  label="Số điện thoại"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  error={!!errors.phone}
                  disabled={loading}
                />
                {errors.phone && <Typography variant="small" color="red" className="mt-1 text-[11px] font-medium">{errors.phone}</Typography>}
              </div>
              <div className="flex flex-col gap-1">
                <Input
                  label="Mã số thuế"
                  name="taxCode"
                  value={formData.taxCode}
                  onChange={handleInputChange}
                  error={!!errors.taxCode}
                  disabled={loading}
                />
                {errors.taxCode && <Typography variant="small" color="red" className="mt-1 text-[11px] font-medium">{errors.taxCode}</Typography>}
              </div>
            </div>
            <Textarea
              label="Địa chỉ"
              name="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={3}
              disabled={loading}
            />
            <div className="flex gap-2 justify-end mt-6">
              <Button
                variant="text"
                color="red"
                onClick={onClose}
                disabled={loading}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo mới"}
              </Button>
            </div>
          </form>
        )}
      </DialogBody>
    </Dialog>
  );
}

