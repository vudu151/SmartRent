import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Input,
  Textarea,
  Alert,
} from "@material-tailwind/react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getTenantById,
  createTenant,
  updateTenant,
} from "@/api/tenant";
import { ApiError } from "@/lib/apiError";
import { showToast } from "@/lib/swal";

export function TenantForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = React.useState(false);
  const [loadingData, setLoadingData] = React.useState(isEdit);
  const [error, setError] = React.useState("");
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    taxCode: "",
  });

  React.useEffect(() => {
    if (isEdit && id) {
      loadTenant();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, id]);

  const loadTenant = async () => {
    if (!id) return;
    try {
      setLoadingData(true);
      setError("");
      const tenant = await getTenantById(Number(id));
      setFormData({
        name: tenant.name || "",
        email: tenant.email || "",
        phone: tenant.phone || "",
        address: tenant.address || "",
        taxCode: tenant.taxCode || "",
      });
    } catch (err) {
      console.error("Error loading tenant:", err);
      let errorMessage = "Không thể tải thông tin tenant. Vui lòng thử lại.";
      if (err instanceof ApiError) {
        errorMessage = err.message || errorMessage;
      } else if (err && err.error && err.error.message) {
        errorMessage = err.error.message;
      } else if (err && err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isEdit && id) {
        const updateRequest = {
          name: formData.name || undefined,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          address: formData.address || undefined,
          taxCode: formData.taxCode || undefined,
        };
        await updateTenant(Number(id), updateRequest);
        showToast("Cập nhật tenant thành công", "success");
        navigate("/dashboard/tenants");
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
        navigate("/dashboard/tenants");
      }
    } catch (err) {
      console.error("Error saving tenant:", err);
      let errorMessage = isEdit
        ? "Không thể cập nhật tenant. Vui lòng thử lại."
        : "Không thể tạo tenant. Vui lòng thử lại.";
      if (err instanceof ApiError) {
        errorMessage = err.message || errorMessage;
      } else if (err && err.error && err.error.message) {
        errorMessage = err.error.message;
      } else if (err && err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="mt-12 mb-8 flex flex-col gap-12">
        <Card>
          <CardBody>
            <Typography color="gray">Đang tải...</Typography>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader floated={false} shadow={false} className="rounded-none">
          <div className="mb-4 flex items-center justify-between gap-8">
            <div>
              <Typography variant="h5" color="blue-gray">
                {isEdit ? "Cập nhật Tenant" : "Tạo Tenant mới"}
              </Typography>
              <Typography color="gray" className="mt-1 font-normal">
                {isEdit
                  ? "Cập nhật thông tin tenant"
                  : "Nhập thông tin để tạo tenant mới"}
              </Typography>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          {error && (
            <Alert color="red" className="mb-4" onClose={() => setError("")}>
              {error}
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                label="Tên tenant *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={loading}
              />
              <Input
                label="Email *"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={loading}
              />
              <Input
                label="Số điện thoại"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={loading}
              />
              <Input
                label="Mã số thuế"
                value={formData.taxCode}
                onChange={(e) => setFormData({ ...formData, taxCode: e.target.value })}
                disabled={loading}
              />
            </div>
            <Textarea
              label="Địa chỉ"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={3}
              disabled={loading}
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outlined"
                color="gray"
                onClick={() => navigate("/dashboard/tenants")}
                disabled={loading}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo mới"}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
