import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Input,
  IconButton,
  Chip,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Alert,
} from "@material-tailwind/react";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/solid";
import { getTenants, deleteTenant } from "@/api/tenant";
import { useNavigate } from "react-router-dom";
import { ApiError } from "@/lib/apiError";
import { showToast } from "@/lib/swal";

export function Tenants() {
  const navigate = useNavigate();
  const [tenants, setTenants] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [tenantToDelete, setTenantToDelete] = React.useState(null);
  const [pageSize, setPageSize] = React.useState(10);
  const [currentPage, setCurrentPage] = React.useState(1);

  const loadTenants = React.useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getTenants({
        page: 0,
        size: 1000,
        sortBy: "id",
        sortDir: "DESC",
      });
      setTenants(response.content || []);
    } catch (err) {
      console.error("Error loading tenants:", err);
      let errorMessage = "Không thể tải danh sách tenant. Vui lòng thử lại.";
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
  }, []);

  React.useEffect(() => {
    loadTenants();
  }, [loadTenants]);

  const handleDelete = async () => {
    if (!tenantToDelete) return;

    try {
      await deleteTenant(tenantToDelete.id);
      showToast(`Đã xóa tenant "${tenantToDelete.name}" thành công`, "success");
      setDeleteDialogOpen(false);
      setTenantToDelete(null);
      loadTenants();
    } catch (err) {
      console.error("Error deleting tenant:", err);
      let errorMessage = "Không thể xóa tenant. Vui lòng thử lại.";
      if (err instanceof ApiError) {
        errorMessage = err.message || errorMessage;
      } else if (err && err.error && err.error.message) {
        errorMessage = err.error.message;
      } else if (err && err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      setDeleteDialogOpen(false);
      showToast(errorMessage, "error");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE":
        return "green";
      case "SUSPENDED":
        return "orange";
      case "CANCELLED":
        return "red";
      default:
        return "gray";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "ACTIVE":
        return "Hoạt động";
      case "SUSPENDED":
        return "Tạm ngưng";
      case "CANCELLED":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const filteredTenants = tenants.filter((tenant) =>
    tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRows = filteredTenants.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const pageData = filteredTenants.slice(startIndex, startIndex + pageSize);

  const handleChangePageSize = (e) => {
    const newSize = Number(e.target.value) || 10;
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= totalPages; i += 1) {
      pages.push(
        <button
          key={i}
          type="button"
          onClick={() => goToPage(i)}
          className={`min-w-[32px] rounded border px-2 py-1 text-sm ${
            i === safeCurrentPage
              ? "border-blue-500 bg-blue-500 text-white"
              : "border-blue-gray-100 text-blue-gray-700 hover:bg-blue-gray-50"
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="mt-4 flex items-center justify-between px-4">
        <Typography variant="small" color="blue-gray" className="font-normal">
          Hiển thị {totalRows === 0 ? 0 : startIndex + 1}–{Math.min(startIndex + pageSize, totalRows)} trong {totalRows} tenant
        </Typography>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => goToPage(safeCurrentPage - 1)}
            disabled={safeCurrentPage === 1}
            className="rounded border border-blue-gray-100 px-2 py-1 text-sm text-blue-gray-700 disabled:opacity-50"
          >
            Trước
          </button>
          {pages}
          <button
            type="button"
            onClick={() => goToPage(safeCurrentPage + 1)}
            disabled={safeCurrentPage === totalPages}
            className="rounded border border-blue-gray-100 px-2 py-1 text-sm text-blue-gray-700 disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader floated={false} shadow={false} className="rounded-none">
          <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <Typography variant="h5" color="blue-gray">
                Quản lý Tenant
              </Typography>
              <Typography color="gray" className="mt-1 font-normal">
                Quản lý thông tin các chủ trọ
              </Typography>
            </div>
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
              <div className="flex items-center gap-2">
                <Typography variant="small" color="blue-gray">
                  Hiển thị
                </Typography>
                <select
                  value={pageSize}
                  onChange={handleChangePageSize}
                  className="rounded border border-blue-gray-200 px-2 py-1 text-sm outline-none"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <Typography variant="small" color="blue-gray">
                  dòng
                </Typography>
              </div>
              <div className="w-full md:w-72">
                <Input
                  label="Tìm kiếm"
                  icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <Button
                className="flex items-center gap-3"
                size="sm"
                onClick={() => navigate("/dashboard/tenants/new")}
              >
                <PlusIcon strokeWidth={2} className="h-4 w-4" />
                Thêm Tenant
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardBody className="overflow-x-auto px-0">
          {error && (
            <Alert color="red" className="mb-4 mx-4" onClose={() => setError("")}>
              {error}
            </Alert>
          )}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Typography color="gray">Đang tải...</Typography>
            </div>
          ) : pageData.length === 0 ? (
            <div className="flex justify-center items-center py-12">
              <Typography color="gray">Không có tenant nào</Typography>
            </div>
          ) : (
            <table className="mt-2 w-full min-w-[640px] table-auto">
              <thead>
                <tr>
                  {["ID", "Tên", "Email", "Số điện thoại", "Trạng thái", "Thao tác"].map((el) => (
                    <th
                      key={el}
                      className="border-b border-blue-gray-50 py-3 px-5 text-left bg-blue-gray-50/50"
                    >
                      <Typography
                        variant="small"
                        className="text-[11px] font-bold uppercase text-blue-gray-400"
                      >
                        {el}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageData.map((tenant) => (
                  <tr key={tenant.id}>
                    <td className="border-b border-blue-gray-50 py-3 px-5 text-sm text-blue-gray-700">
                      {tenant.id}
                    </td>
                    <td className="border-b border-blue-gray-50 py-3 px-5 text-sm text-blue-gray-700">
                      {tenant.name}
                    </td>
                    <td className="border-b border-blue-gray-50 py-3 px-5 text-sm text-blue-gray-700">
                      {tenant.email}
                    </td>
                    <td className="border-b border-blue-gray-50 py-3 px-5 text-sm text-blue-gray-700">
                      {tenant.phone || "-"}
                    </td>
                    <td className="border-b border-blue-gray-50 py-3 px-5">
                      <Chip
                        variant="ghost"
                        size="sm"
                        value={getStatusLabel(tenant.status)}
                        color={getStatusColor(tenant.status)}
                      />
                    </td>
                    <td className="border-b border-blue-gray-50 py-3 px-5">
                      <div className="flex items-center gap-2">
                        <IconButton
                          variant="text"
                          color="blue-gray"
                          onClick={() => navigate(`/dashboard/tenants/${tenant.id}`)}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </IconButton>
                        <IconButton
                          variant="text"
                          color="red"
                          onClick={() => {
                            setTenantToDelete(tenant);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {renderPagination()}
        </CardBody>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} handler={setDeleteDialogOpen}>
        <DialogHeader>Xác nhận xóa</DialogHeader>
        <DialogBody>
          Bạn có chắc chắn muốn xóa tenant "{tenantToDelete && tenantToDelete.name}"? Hành động này không thể hoàn tác.
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={() => {
              setDeleteDialogOpen(false);
              setTenantToDelete(null);
            }}
            className="mr-1"
          >
            Hủy
          </Button>
          <Button variant="gradient" color="red" onClick={handleDelete}>
            Xóa
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
