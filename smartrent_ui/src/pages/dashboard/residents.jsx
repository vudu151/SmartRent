import React from "react";
import { useNavigate } from "react-router-dom";
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
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon, ArrowDownTrayIcon } from "@heroicons/react/24/solid";
import Select from "react-select";
import { useNavbarHeader } from "@/context/navbar-header";
import { useAuth } from "@/smartrent/auth";
import { getResidents, deleteResident } from "@/api/resident";
import { getRooms } from "@/api/room";
import { ResidentModal } from "./resident-form";
import { showToast } from "@/lib/swal";
import { exportToExcel } from "@/lib/export-excel";
import { env } from "@/config/env";
import { ImageThumbnail } from "@/components/image-lightbox";
import { ErrorState } from "@/components/error-state";

export function Residents() {
  const { setNavbarHeader } = useNavbarHeader();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isGuard = user?.role === "GUARD";
  const [residents, setResidents] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedRoomId, setSelectedRoomId] = React.useState("");
  const [rooms, setRooms] = React.useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [residentToDelete, setResidentToDelete] = React.useState(null);

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedResidentId, setSelectedResidentId] = React.useState(null);

  const [page, setPage] = React.useState(1);
  const [size, setSize] = React.useState(8);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalElements, setTotalElements] = React.useState(0);

  const loadResidents = React.useCallback(async () => {
    if (searchTerm.trim().length === 1) return;
    try {
      setLoading(true);
      setError("");
      const response = await getResidents({ page: page - 1, size, search: searchTerm, roomId: selectedRoomId || undefined });
      setResidents(response.content || []);
      setTotalPages(response.totalPages || 1);
      setTotalElements(response.totalElements || 0);
    } catch (err) {
      console.error("Error loading residents:", err);
      setError(err.message || "Không thể tải danh sách cư dân.");
    } finally {
      setLoading(false);
    }
  }, [page, size, searchTerm, selectedRoomId]);

  React.useEffect(() => { loadResidents(); }, [loadResidents]);
  React.useEffect(() => { setPage(1); }, [size, searchTerm, selectedRoomId]);

  React.useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await getRooms({ size: 1000 });
        setRooms(res.content || []);
      } catch (err) {
        console.error("Error loading rooms:", err);
      }
    };
    fetchRooms();
  }, []);

  const handleAdd = () => { setSelectedResidentId(null); setIsModalOpen(true); };

  const handleExportExcel = async () => {
    try {
      showToast("Đang xuất Excel...", "info");
      const res = await getResidents({ page: 0, size: 9999, search: searchTerm, roomId: selectedRoomId || undefined });
      const allResidents = res.content || [];
      if (allResidents.length === 0) { showToast("Không có dữ liệu để xuất", "warning"); return; }
      const statusLabel = (s) => { switch(s) { case "DANG_O": return "Đang ở"; case "DA_ROI": return "Đã rời"; default: return s; } };
      exportToExcel(allResidents, [
        { header: "Họ tên", key: "fullName", width: 22 },
        { header: "SĐT", key: "phone", width: 14 },
        { header: "CCCD", key: "idCardNumber", width: 16 },
        { header: "Phòng", key: "roomNumber", width: 12 },
        { header: "Trạng thái", key: "status", width: 12, formatter: (v) => statusLabel(v) },
        { header: "Giới tính", key: "gender", width: 10, formatter: (v) => v === "MALE" ? "Nam" : v === "FEMALE" ? "Nữ" : "Khác" },
        { header: "Ngày sinh", key: "dateOfBirth", width: 14, formatter: (v) => v ? new Date(v).toLocaleDateString("vi-VN") : "" },
        { header: "Biển số xe", key: "vehiclePlate", width: 14 },
      ], `cu-dan_${new Date().toISOString().slice(0,10)}`, "Cư dân");
      showToast(`Đã xuất ${allResidents.length} cư dân!`, "success");
    } catch (err) { showToast("Lỗi xuất Excel: " + err.message, "error"); }
  };

  React.useEffect(() => {
    const roomOptions = [
      { value: "", label: "Tất cả phòng" },
      ...rooms.map(r => ({ value: r.id, label: `P.${r.roomNumber}` }))
    ];

    setNavbarHeader(
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 w-full">
        <div className="min-w-0">
          <Typography variant="h6" color="blue-gray" className="font-bold truncate">Quản lý Cư dân</Typography>
          <Typography color="gray" className="font-normal text-xs">Danh sách người thuê trọ</Typography>
        </div>
        <div className="flex flex-wrap shrink-0 gap-2 items-center">
          <input
            type="text"
            placeholder="Tìm kiếm tên, sdt (>=2 ký tự)..."
            className="text-sm border border-blue-gray-200 rounded-lg px-3 h-10 w-full sm:w-56 bg-white text-blue-gray-700 focus:outline-none focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="w-40 z-50">
            <Select
              options={roomOptions}
              value={selectedRoomId ? roomOptions.find(o => o.value === selectedRoomId) : null}
              onChange={(selected) => setSelectedRoomId(selected ? selected.value : "")}
              placeholder="Tất cả phòng"
              isSearchable
              styles={{
                control: (base, state) => ({
                  ...base,
                  minHeight: '40px',
                  height: '40px',
                  borderRadius: '7px',
                  borderColor: state.isFocused ? '#263238' : '#b0bec5',
                  boxShadow: 'none',
                  '&:hover': { borderColor: state.isFocused ? '#263238' : '#b0bec5' },
                  fontSize: '14px',
                  backgroundColor: 'transparent'
                }),
                valueContainer: (base) => ({ ...base, padding: '0 8px' }),
                input: (base) => ({ ...base, margin: 0, padding: 0 }),
                dropdownIndicator: (base) => ({ ...base, padding: '4px' }),
                clearIndicator: (base) => ({ ...base, padding: '4px' }),
                menu: (base) => ({
                  ...base,
                  zIndex: 9999,
                  borderRadius: '7px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                  padding: '4px'
                }),
                menuList: (base) => ({
                  ...base,
                  padding: 0
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isSelected ? '#eceff1' : state.isFocused ? '#f1f5f9' : 'transparent',
                  color: state.isSelected ? '#263238' : '#455a64',
                  fontWeight: state.isSelected ? 500 : 400,
                  cursor: 'pointer',
                  padding: '8px 12px',
                  borderRadius: '5px',
                  margin: '2px 0',
                  '&:active': { backgroundColor: '#eceff1' }
                }),
                placeholder: (base) => ({ ...base, color: '#607d8b' }),
                singleValue: (base) => ({ ...base, color: '#455a64' })
              }}
            />
          </div>
          {!isGuard && (
            <>
              <Button variant="outlined" color="green" size="sm" className="flex items-center gap-2 whitespace-nowrap" onClick={handleExportExcel}>
                <ArrowDownTrayIcon strokeWidth={2.5} className="h-4 w-4" /> Xuất Excel
              </Button>
              <Button variant="gradient" color="indigo" size="sm" className="flex items-center gap-2 whitespace-nowrap" onClick={handleAdd}>
                <PlusIcon strokeWidth={2.5} className="h-4 w-4" /> Thêm Cư dân
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }, [searchTerm, selectedRoomId, rooms, setNavbarHeader, isGuard]);

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
          {loading ? (
            <div className="flex justify-center py-8"><Typography>Đang tải...</Typography></div>
          ) : error && residents.length === 0 ? (
            <ErrorState message={error} onRetry={loadResidents} />
          ) : residents.length === 0 ? (
            <div className="flex justify-center py-8"><Typography>Không có dữ liệu cư dân</Typography></div>
          ) : (
              <table className="w-full min-w-max table-auto text-left">
                <thead>
                  <tr>
                    {["Ảnh", "Họ tên", "Số điện thoại", "Phòng", "CMND/CCCD", "Trạng thái", !isGuard ? "Thao tác" : null].filter(Boolean).map((head) => (
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
                          {(res.imageUrls && res.imageUrls.length > 0) || res.avatarUrl ? (
                            <ImageThumbnail
                              images={res.imageUrls && res.imageUrls.length > 0 ? res.imageUrls : (res.avatarUrl ? [res.avatarUrl] : [])}
                              alt={res.fullName}
                              shape="circle"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 font-bold text-sm border border-gray-200">
                              {res.fullName?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                          )}
                        </td>
                        <td className={className}>
                          <Typography variant="small" color="blue-gray" className="font-bold">{res.fullName}</Typography>
                          <Typography className="text-xs font-normal text-blue-gray-500">{res.email}</Typography>
                        </td>
                        <td className={className}><Typography variant="small" color="blue-gray">{res.phone || "-"}</Typography></td>
                        <td className={className}>
                          {res.rooms && res.rooms.length > 0 ? (
                            <div className="flex gap-1 flex-wrap">
                              {res.rooms.map((r) => (<Chip key={r.id} size="sm" variant="gradient" value={r.roomNumber} color="indigo" className="py-0.5 px-2 text-[10px] font-medium w-fit cursor-pointer" onClick={() => navigate(`/dashboard/rooms/${r.id}`)} />))}
                            </div>
                          ) : (<Typography variant="small" color="gray" className="text-xs italic">Chưa xếp phòng</Typography>)}
                        </td>
                        <td className={className}><Typography variant="small" color="blue-gray">{res.idCard || "-"}</Typography></td>
                        <td className={className}>
                          <Chip variant="gradient" size="sm" value={getStatusLabel(res.status)} color={getStatusColor(res.status)} className="py-0.5 px-2 text-[11px] font-medium w-fit" />
                        </td>
                        {!isGuard && (
                          <td className={className}>
                            <div className="flex gap-2">
                              <IconButton size="sm" variant="text" color="blue-gray" title="Chi tiết" onClick={() => handleEdit(res.id)}>
                                <PencilIcon className="h-4 w-4 text-blue-gray-500" />
                              </IconButton>
                              <IconButton 
                                size="sm" 
                                variant="text" 
                                color="red" 
                                title={res.status === "ACTIVE" ? "Không thể xóa cư dân đang ở" : "Xóa"}
                                disabled={res.status === "ACTIVE"}
                                onClick={() => { setResidentToDelete(res); setDeleteDialogOpen(true); }}
                              >
                                <TrashIcon className={`h-4 w-4 ${res.status === "ACTIVE" ? "text-gray-400" : "text-red-500"}`} />
                              </IconButton>
                            </div>
                          </td>
                        )}
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
              <Typography variant="small" color="blue-gray" className="font-normal opacity-70">Hiển thị {residents.length} / {totalElements} cư dân</Typography>
              <Typography variant="small" color="blue-gray" className="font-normal opacity-70">Trang {page} / {totalPages || 1}</Typography>
            </div>
            <div className="flex gap-2 items-center">
              <Button variant="outlined" color="blue-gray" size="sm" disabled={page <= 1 || loading} onClick={() => setPage(p => p - 1)}>Trước</Button>
              <div className="flex items-center gap-1">
                {(() => {
                  const pages = [];
                  let startPage = Math.max(1, page - 2);
                  let endPage = Math.min(totalPages || 1, page + 2);
                  
                  if (startPage > 1) {
                    pages.push(<IconButton key={1} variant={page === 1 ? "filled" : "text"} color="blue-gray" size="sm" onClick={() => setPage(1)}>1</IconButton>);
                    if (startPage > 2) pages.push(<span key="ell1" className="px-1 text-gray-500">...</span>);
                  }
                  
                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(<IconButton key={i} variant={page === i ? "filled" : "text"} color="blue-gray" size="sm" onClick={() => setPage(i)}>{i}</IconButton>);
                  }
                  
                  if (endPage < totalPages) {
                    if (endPage < totalPages - 1) pages.push(<span key="ell2" className="px-1 text-gray-500">...</span>);
                    pages.push(<IconButton key={totalPages} variant={page === totalPages ? "filled" : "text"} color="blue-gray" size="sm" onClick={() => setPage(totalPages)}>{totalPages}</IconButton>);
                  }
                  return pages;
                })()}
              </div>
              <Button variant="outlined" color="blue-gray" size="sm" disabled={page >= (totalPages || 1) || loading} onClick={() => setPage(p => p + 1)}>Sau</Button>
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
