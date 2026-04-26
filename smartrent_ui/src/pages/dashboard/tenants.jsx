import React from "react";
import {
  Card,
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
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { useNavbarHeader } from "@/context/navbar-header";
import { getTenants, deleteTenant } from "@/api/tenant";
import { TenantModal } from "./tenant-form";
import { ApiError } from "@/lib/apiError";
import { showToast } from "@/lib/swal";

export function Tenants() {
  const { setNavbarHeader } = useNavbarHeader();
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
      setLoading(true); setError("");
      const response = await getTenants({ page: currentPage - 1, size: pageSize, sortBy: "id", sortDir: "DESC", search: searchTerm });
      setTenants(response.content || []);
      setTotalPages(response.totalPages || 1);
      setTotalElements(response.totalElements || 0);
    } catch (err) {
      let msg = "Không thể tải danh sách tenant.";
      if (err instanceof ApiError) msg = err.message || msg;
      else if (err?.message) msg = err.message;
      setError(msg);
    } finally { setLoading(false); }
  }, [currentPage, pageSize, searchTerm]);

  React.useEffect(() => { loadTenants(); }, [loadTenants]);
  React.useEffect(() => { setCurrentPage(1); }, [pageSize, searchTerm]);

  const handleAdd = () => { setSelectedTenantId(null); setIsModalOpen(true); };

  React.useEffect(() => {
    setNavbarHeader(
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 w-full">
        <div className="min-w-0">
          <Typography variant="h6" color="blue-gray" className="font-bold truncate">Quản lý Chủ Trọ</Typography>
          <Typography color="gray" className="font-normal text-xs">Thông tin các chủ trọ hệ thống</Typography>
        </div>
        <div className="flex shrink-0 gap-2 items-center">
          <div className="w-48">
            <Input label="Tìm kiếm..." size="md" icon={<MagnifyingGlassIcon className="h-4 w-4" />} value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} containerProps={{ className: "!min-w-0" }} />
          </div>
          <Button variant="gradient" color="indigo" size="sm" className="flex items-center gap-2 whitespace-nowrap" onClick={handleAdd}>
            <PlusIcon strokeWidth={2.5} className="h-4 w-4" /> Thêm
          </Button>
        </div>
      </div>
    );
  }, [searchTerm, setNavbarHeader]);

  const handleDelete = async () => {
    if (!tenantToDelete) return;
    try {
      await deleteTenant(tenantToDelete.id);
      showToast(`Đã xóa tenant "${tenantToDelete.name}"`, "success");
      setDeleteDialogOpen(false); setTenantToDelete(null); loadTenants();
    } catch (err) {
      let msg = "Không thể xóa tenant.";
      if (err instanceof ApiError) msg = err.message || msg;
      else if (err?.message) msg = err.message;
      setError(msg); setDeleteDialogOpen(false); showToast(msg, "error");
    }
  };

  const getStatusColor = (s) => { switch(s) { case "ACTIVE": return "green"; case "SUSPENDED": return "orange"; case "CANCELLED": return "red"; default: return "gray"; } };
  const getStatusLabel = (s) => { switch(s) { case "ACTIVE": return "Hoạt động"; case "SUSPENDED": return "Tạm ngưng"; case "CANCELLED": return "Đã hủy"; default: return s; } };

  const handleEdit = (id) => { setSelectedTenantId(id); setIsModalOpen(true); };
  const handleModalClose = () => { setIsModalOpen(false); setSelectedTenantId(null); };
  const handleModalSuccess = () => { setCurrentPage(1); loadTenants(); };
  const goToPage = (p) => { if (p < 1 || p > totalPages) return; setCurrentPage(p); };

  return (
    <div className="h-full flex flex-col">
      <Card className="h-full flex flex-col overflow-hidden">
        <CardBody className="overflow-auto p-0 flex-1">
          {error && <Alert color="red" className="mb-4 mx-4" onClose={() => setError("")}>{error}</Alert>}
          {loading ? (
            <div className="flex justify-center items-center py-12"><Typography color="gray">Đang tải...</Typography></div>
          ) : tenants.length === 0 ? (
            <div className="flex justify-center items-center py-12"><Typography color="gray">Không có tenant nào</Typography></div>
          ) : (
            <table className="w-full min-w-[640px] table-auto text-left">
              <thead><tr>
                {["STT", "Tên", "Email", "Số điện thoại", "Trạng thái", "Thao tác"].map((el) => (
                  <th key={el} className="border-b border-blue-gray-50 py-3 px-5"><Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">{el}</Typography></th>
                ))}
              </tr></thead>
              <tbody>
                {tenants.map((tenant, key) => {
                  const isLast = key === tenants.length - 1;
                  const className = `py-3 px-5 ${isLast ? "" : "border-b border-blue-gray-50"}`;
                  const stt = (currentPage - 1) * pageSize + key + 1;
                  return (
                    <tr key={tenant.id}>
                      <td className={className}><Typography variant="small" color="blue-gray" className="font-semibold">{stt}</Typography></td>
                      <td className={className}><Typography variant="small" color="blue-gray" className="font-semibold">{tenant.name}</Typography></td>
                      <td className={className}><Typography className="text-xs font-normal text-blue-gray-500">{tenant.email}</Typography></td>
                      <td className={className}><Typography className="text-xs font-normal text-blue-gray-500">{tenant.phone || "-"}</Typography></td>
                      <td className={className}><Chip variant="gradient" size="sm" value={getStatusLabel(tenant.status)} color={getStatusColor(tenant.status)} className="py-0.5 px-2 text-[11px] font-medium w-fit" /></td>
                      <td className={className}>
                        <div className="flex items-center gap-2">
                          <IconButton variant="text" size="sm" color="blue-gray" onClick={() => handleEdit(tenant.id)}><PencilIcon className="h-4 w-4 text-blue-gray-500" /></IconButton>
                          <IconButton variant="text" size="sm" color="red" onClick={() => { setTenantToDelete(tenant); setDeleteDialogOpen(true); }}><TrashIcon className="h-4 w-4 text-red-500" /></IconButton>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardBody>
        {!loading && tenants.length > 0 && (
          <div className="shrink-0 px-4 py-2 flex items-center justify-between border-t border-blue-gray-50 bg-blue-gray-50/20">
            <div className="flex items-center gap-4">
              <Typography variant="small" color="blue-gray" className="font-normal opacity-70">Hiển thị {tenants.length} trong {totalElements} tenant</Typography>
              <Typography variant="small" color="blue-gray" className="font-normal opacity-70">Trang {currentPage} / {totalPages || 1}</Typography>
            </div>
            <div className="flex gap-2">
              <Button variant="outlined" color="blue-gray" size="sm" disabled={currentPage <= 1 || loading} onClick={() => goToPage(currentPage - 1)}>Trước</Button>
              <Button variant="outlined" color="blue-gray" size="sm" disabled={currentPage >= totalPages || loading} onClick={() => goToPage(currentPage + 1)}>Sau</Button>
            </div>
          </div>
        )}
      </Card>

      <Dialog open={deleteDialogOpen} handler={setDeleteDialogOpen}>
        <DialogHeader>Xác nhận xóa</DialogHeader>
        <DialogBody>Bạn có chắc muốn xóa tenant "{tenantToDelete && tenantToDelete.name}"?</DialogBody>
        <DialogFooter>
          <Button variant="text" color="red" onClick={() => { setDeleteDialogOpen(false); setTenantToDelete(null); }} className="mr-1">Hủy</Button>
          <Button variant="gradient" color="red" onClick={handleDelete}>Xóa</Button>
        </DialogFooter>
      </Dialog>

      <TenantModal open={isModalOpen} onClose={handleModalClose} tenantId={selectedTenantId} onSuccess={handleModalSuccess} />
    </div>
  );
}

export default Tenants;
