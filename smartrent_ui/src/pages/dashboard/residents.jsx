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
import { useAuth } from "@/smartrent/auth";
import { getResidents, deleteResident } from "@/api/resident";
import { ResidentModal } from "./resident-form";
import { showToast } from "@/lib/swal";

export function Residents() {
  const { setNavbarHeader } = useNavbarHeader();
  const { user } = useAuth();
  const isGuard = user?.role === "GUARD";
  const [residents, setResidents] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [residentToDelete, setResidentToDelete] = React.useState(null);

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedResidentId, setSelectedResidentId] = React.useState(null);

  const [page, setPage] = React.useState(1);
  const [size, setSize] = React.useState(10);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalElements, setTotalElements] = React.useState(0);

  const loadResidents = React.useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getResidents({ page: page - 1, size, search: searchTerm });
      setResidents(response.content || []);
      setTotalPages(response.totalPages || 1);
      setTotalElements(response.totalElements || 0);
    } catch (err) {
      console.error("Error loading residents:", err);
      setError(err.message || "Không thể tải danh sách cư dân.");
    } finally {
      setLoading(false);
    }
  }, [page, size, searchTerm]);

  React.useEffect(() => { loadResidents(); }, [loadResidents]);
  React.useEffect(() => { setPage(1); }, [size, searchTerm]);

  const handleAdd = () => { setSelectedResidentId(null); setIsModalOpen(true); };

  React.useEffect(() => {
    setNavbarHeader(
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 w-full">
        <div className="min-w-0">
          <Typography variant="h6" color="blue-gray" className="font-bold truncate">Quản lý Cư dân</Typography>
          <Typography color="gray" className="font-normal text-xs">Danh sách người thuê trọ</Typography>
        </div>
        <div className="flex shrink-0 gap-2 items-center">
          <div className="w-48">
            <Input label="Tìm kiếm tên, sdt..." size="md" icon={<MagnifyingGlassIcon className="h-4 w-4" />} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} containerProps={{ className: "!min-w-0" }} />
          </div>
          {!isGuard && (
            <Button variant="gradient" color="indigo" size="sm" className="flex items-center gap-2 whitespace-nowrap" onClick={handleAdd}>
              <PlusIcon strokeWidth={2.5} className="h-4 w-4" /> Thêm Cư dân
            </Button>
          )}
        </div>
      </div>
    );
  }, [searchTerm, setNavbarHeader, isGuard]);

  const handleEdit = (id) => { setSelectedResidentId(id); setIsModalOpen(true); };
  const handleModalClose = () => { setIsModalOpen(false); setSelectedResidentId(null); };
  const handleModalSuccess = () => { setPage(1); loadResidents(); };

  const handleDelete = async () => {
    if (!residentToDelete) return;
    try {
      await deleteResident(residentToDelete.id);
      showToast(`Đã xóa cư dân "${residentToDelete.fullName}" thành công`, "success");
      setDeleteDialogOpen(false);
      setResidentToDelete(null);
      loadResidents();
    } catch (err) {
      showToast(err.message || "Không thể xóa cư dân", "error");
    }
  };

  const getStatusColor = (s) => { switch(s) { case "ACTIVE": return "green"; case "INACTIVE": return "gray"; case "TEMPORARY": return "orange"; default: return "blue-gray"; } };
  const getStatusLabel = (s) => { switch(s) { case "ACTIVE": return "Đang ở"; case "INACTIVE": return "Đã rời"; case "TEMPORARY": return "Tạm trú"; default: return s; } };

  return (
    <div className="h-full flex flex-col">
      <Card className="h-full flex flex-col overflow-hidden">
        <CardBody className="overflow-auto p-0 flex-1">
          {error && <Alert color="red" className="mb-4 mx-4">{error}</Alert>}
          {loading ? (
            <div className="flex justify-center py-8"><Typography>Đang tải...</Typography></div>
          ) : residents.length === 0 ? (
            <div className="flex justify-center py-8"><Typography>Không có dữ liệu cư dân</Typography></div>
          ) : (
              <table className="w-full min-w-max table-auto text-left">
                <thead>
                  <tr>
                    {["Họ tên", "Số điện thoại", "Phòng", "CMND/CCCD", "Trạng thái", "Thao tác"].map((head) => (
                      <th key={head} className="border-b border-blue-gray-50 py-3 px-5">
                        <Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">{head}</Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {residents.map((res, key) => {
                    const isLast = key === residents.length - 1;
                    const className = `py-3 px-5 ${isLast ? "" : "border-b border-blue-gray-50"}`;
                    return (
                      <tr key={res.id}>
                        <td className={className}>
                          <Typography variant="small" color="blue-gray" className="font-bold">{res.fullName}</Typography>
                          <Typography className="text-xs font-normal text-blue-gray-500">{res.email}</Typography>
                        </td>
                        <td className={className}><Typography variant="small" color="blue-gray">{res.phone || "-"}</Typography></td>
                        <td className={className}>
                          {res.rooms && res.rooms.length > 0 ? (
                            <div className="flex gap-1 flex-wrap">
                              {res.rooms.map((r) => (<Chip key={r.id} size="sm" variant="gradient" value={r.roomNumber} color="blue" className="py-0.5 px-2 text-[10px] font-medium w-fit" />))}
                            </div>
                          ) : (<Typography variant="small" color="gray" className="text-xs italic">Chưa xếp phòng</Typography>)}
                        </td>
                        <td className={className}><Typography variant="small" color="blue-gray">{res.idCard || "-"}</Typography></td>
                        <td className={className}>
                          <Chip variant="gradient" size="sm" value={getStatusLabel(res.status)} color={getStatusColor(res.status)} className="py-0.5 px-2 text-[11px] font-medium w-fit" />
                        </td>
                        <td className={className}>
                          <div className="flex gap-2">
                            <IconButton size="sm" variant="text" color="blue-gray" title="Chi tiết" onClick={() => handleEdit(res.id)}>
                              <PencilIcon className="h-4 w-4 text-blue-gray-500" />
                            </IconButton>
                            {!isGuard && (
                              <IconButton size="sm" variant="text" color="red" title="Xóa" onClick={() => { setResidentToDelete(res); setDeleteDialogOpen(true); }}>
                                <TrashIcon className="h-4 w-4 text-red-500" />
                              </IconButton>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
          )}
        </CardBody>
        {!loading && residents.length > 0 && (
          <div className="shrink-0 px-4 py-2 flex items-center justify-between border-t border-blue-gray-50 bg-blue-gray-50/20">
            <div className="flex items-center gap-4">
              <Typography variant="small" color="blue-gray" className="font-normal opacity-70">Hiển thị {residents.length} trong {totalElements} cư dân</Typography>
              <Typography variant="small" color="blue-gray" className="font-normal opacity-70">Trang {page} / {totalPages || 1}</Typography>
            </div>
            <div className="flex gap-2">
              <Button variant="outlined" color="blue-gray" size="sm" disabled={page <= 1 || loading} onClick={() => setPage(p => p - 1)}>Trước</Button>
              <Button variant="outlined" color="blue-gray" size="sm" disabled={page >= totalPages || loading} onClick={() => setPage(p => p + 1)}>Sau</Button>
            </div>
          </div>
        )}
      </Card>

      <ResidentModal open={isModalOpen} onClose={handleModalClose} residentId={selectedResidentId} onSuccess={handleModalSuccess} />
      <Dialog open={deleteDialogOpen} handler={setDeleteDialogOpen}>
        <DialogHeader>Xác nhận xóa</DialogHeader>
        <DialogBody>Bạn có chắc muốn xóa cư dân "{residentToDelete?.fullName}"?</DialogBody>
        <DialogFooter>
          <Button variant="text" color="red" onClick={() => setDeleteDialogOpen(false)} className="mr-1">Hủy</Button>
          <Button variant="gradient" color="red" onClick={handleDelete}>Xóa</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default Residents;
