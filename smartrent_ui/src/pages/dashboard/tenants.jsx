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
import { TenantModal } from "./tenant-form";
import { ApiError } from "@/lib/apiError";
import { showToast } from "@/lib/swal";

export function Tenants() {
  const [tenants, setTenants] = React.useState([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedTenantId, setSelectedTenantId] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [tenantToDelete, setTenantToDelete] = React.useState(null);
  const [pageSize, setPageSize] = React.useState(10);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalElements, setTotalElements] = React.useState(0);

  const loadTenants = React.useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getTenants({
        page: currentPage - 1,
        size: pageSize,
        sortBy: "id",
        sortDir: "DESC",
        search: searchTerm,
      });

      setTenants(response.content || []);
      setTotalPages(response.totalPages || 1);
      setTotalElements(response.totalElements || 0);
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
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm]);

  React.useEffect(() => {
    loadTenants();
  }, [loadTenants]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [pageSize, searchTerm]);

  // Scroll load


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

  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const pageData = tenants; // Data is already paginated from server

  const handleAdd = () => {
    setSelectedTenantId(null);
    setIsModalOpen(true);
  };

  const handleEdit = (id) => {
    setSelectedTenantId(id);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedTenantId(null);
  };

  const handleModalSuccess = () => {
    setCurrentPage(1);
    loadTenants();
  };

  const handleChangePageSize = (e) => {
    const newSize = Number(e.target.value) || 10;
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const renderFooter = () => (
    <div className="mt-2 px-4 py-2 flex items-center justify-between border-t border-blue-gray-50 bg-blue-gray-50/20">
      <div className="flex items-center gap-4">
        <Typography variant="small" color="blue-gray" className="font-normal opacity-70">
          Hiển thị {tenants.length} trong {totalElements} tenant
        </Typography>
        <Typography variant="small" color="blue-gray" className="font-normal opacity-70">
          Trang {currentPage} / {totalPages || 1}
        </Typography>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outlined"
          color="blue-gray"
          size="sm"
          disabled={currentPage <= 1 || loading}
          onClick={() => goToPage(currentPage - 1)}
        >
          Trước
        </Button>
        <Button
          variant="outlined"
          color="blue-gray"
          size="sm"
          disabled={currentPage >= totalPages || loading}
          onClick={() => goToPage(currentPage + 1)}
        >
          Sau
        </Button>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      <Card className="h-full flex flex-col overflow-hidden">
        <CardHeader floated={false} shadow={false} className="rounded-none border-b border-blue-gray-100 shrink-0 px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <Typography variant="h5" color="blue-gray" className="font-bold">
                Quản lý Tenant
              </Typography>
              <Typography color="gray" className="mt-0.5 font-normal text-sm">
                Thông tin các chủ trọ hệ thống
              </Typography>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
              <div className="w-full sm:w-64">
                <Input
                  label="Tìm kiếm..."
                  icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <Button
                color="black"
                className="flex items-center gap-2 uppercase py-2.5 px-5 shadow-none hover:shadow-md hover:shadow-gray-300 transition-all"
                onClick={handleAdd}
              >
                <PlusIcon strokeWidth={2.5} className="h-4 w-4" />
                Thêm Tenant
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardBody className="overflow-auto p-0 flex-1">
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
              <thead className="sticky top-0 z-20 bg-blue-gray-50 shadow-sm">
                <tr>
                  {["ID", "Tên", "Email", "Số điện thoại", "Trạng thái", "Thao tác"].map((el) => (
                    <th
                      key={el}
                      className="border-b border-blue-gray-100 py-0.5 px-4 text-left bg-blue-gray-50"
                    >
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal leading-none opacity-70"
                      >
                        {el}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageData.map((tenant) => (
                  <tr key={tenant.id} className="even:bg-blue-gray-50/50">
                    <td className="py-0.5 px-4">
                      <Typography variant="small" color="blue-gray">{tenant.id}</Typography>
                    </td>
                    <td className="py-0.5 px-4">
                      <Typography variant="small" color="blue-gray" className="font-bold">{tenant.name}</Typography>
                    </td>
                    <td className="py-0.5 px-4">
                      <Typography variant="small" color="blue-gray">{tenant.email}</Typography>
                    </td>
                    <td className="py-0.5 px-4">
                      <Typography variant="small" color="blue-gray">{tenant.phone || "-"}</Typography>
                    </td>
                    <td className="py-0.5 px-4">
                      <Chip
                        variant="ghost"
                        size="sm"
                        value={getStatusLabel(tenant.status)}
                        color={getStatusColor(tenant.status)}
                      />
                    </td>
                    <td className="py-0.5 px-4">
                      <div className="flex items-center gap-2">
                        <IconButton
                          variant="text"
                          size="sm"
                          color="blue-gray"
                          onClick={() => handleEdit(tenant.id)}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </IconButton>
                        <IconButton
                          variant="text"
                          size="sm"
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

          {renderFooter()}
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

      <TenantModal
        open={isModalOpen}
        onClose={handleModalClose}
        tenantId={selectedTenantId}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}
