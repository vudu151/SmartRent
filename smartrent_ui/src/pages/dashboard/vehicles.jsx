import React from "react";
import {
  Card,
  CardBody,
  Typography,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Alert,
} from "@material-tailwind/react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import Select from "react-select";
import { useNavbarHeader } from "@/context/navbar-header";
import { useAuth } from "@/smartrent/auth";
import { getVehicles, deleteVehicle } from "@/api/vehicle";
import { getRooms } from "@/api/room";
import { VehicleModal } from "./vehicle-modal";
import { showToast } from "@/lib/swal";
import { env } from "@/config/env";
import { ImageThumbnail } from "@/components/image-lightbox";
import { ErrorState } from "@/components/error-state";

export function Vehicles() {
  const { setNavbarHeader } = useNavbarHeader();
  const { user } = useAuth();
  const isGuard = user?.role === "GUARD";
  const [vehicles, setVehicles] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedRoomId, setSelectedRoomId] = React.useState("");
  const [rooms, setRooms] = React.useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [vehicleToDelete, setVehicleToDelete] = React.useState(null);

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = React.useState(null);

  const [page, setPage] = React.useState(1);
  const [size, setSize] = React.useState(8);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalElements, setTotalElements] = React.useState(0);

  const loadVehicles = React.useCallback(async () => {
    if (searchTerm.trim().length === 1) return;
    try {
      setLoading(true);
      setError("");
      const response = await getVehicles({ page: page - 1, size, search: searchTerm, roomId: selectedRoomId || undefined });
      setVehicles(response.content || []);
      setTotalPages(response.totalPages || 1);
      setTotalElements(response.totalElements || 0);
    } catch (err) {
      console.error("Error loading vehicles:", err);
      setError(err.message || "Không thể tải danh sách xe.");
    } finally {
      setLoading(false);
    }
  }, [page, size, searchTerm, selectedRoomId]);

  React.useEffect(() => { loadVehicles(); }, [loadVehicles]);
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

  const handleAdd = () => { setSelectedVehicleId(null); setIsModalOpen(true); };

  React.useEffect(() => {
    const roomOptions = [
      { value: "", label: "Tất cả phòng" },
      ...rooms.map(r => ({ value: r.id, label: `P.${r.roomNumber}` }))
    ];

    setNavbarHeader(
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 w-full">
        <div className="min-w-0">
          <Typography variant="h6" color="blue-gray" className="font-bold truncate">Quản lý Xe</Typography>
          <Typography color="gray" className="font-normal text-xs">Danh sách phương tiện cư dân</Typography>
        </div>
        <div className="flex flex-wrap shrink-0 gap-2 items-center">
          <input
            type="text"
            placeholder="Tìm biển số, tên (>=2 ký tự)..."
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
            <Button variant="gradient" color="indigo" size="sm" className="flex items-center gap-2 whitespace-nowrap" onClick={handleAdd}>
              <PlusIcon strokeWidth={2.5} className="h-4 w-4" /> Thêm Xe
            </Button>
          )}
        </div>
      </div>
    );
  }, [searchTerm, selectedRoomId, rooms, setNavbarHeader, isGuard]);

  const handleEdit = (id) => { setSelectedVehicleId(id); setIsModalOpen(true); };
  const handleModalClose = () => { setIsModalOpen(false); setSelectedVehicleId(null); };
  const handleModalSuccess = () => { setPage(1); loadVehicles(); };

  const handleDelete = async () => {
    if (!vehicleToDelete) return;
    try {
      await deleteVehicle(vehicleToDelete.id);
      showToast(`Đã xóa xe "${vehicleToDelete.licensePlate}" thành công`, "success");
      setDeleteDialogOpen(false);
      setVehicleToDelete(null);
      loadVehicles();
    } catch (err) {
      showToast(err.message || "Không thể xóa xe", "error");
    }
  };

  const getTypeColor = (type) => { 
    switch(type) { 
      case "MOTORBIKE": return "blue"; 
      case "CAR": return "red"; 
      case "BICYCLE": return "green"; 
      case "ELECTRIC_BICYCLE": return "orange"; 
      default: return "gray"; 
    } 
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  return (
    <div className="h-full flex flex-col">
      <Card className="h-full flex flex-col overflow-hidden">
        <CardBody className="overflow-auto p-0 flex-1">
          {loading ? (
            <div className="flex justify-center py-8"><Typography>Đang tải...</Typography></div>
          ) : error && vehicles.length === 0 ? (
            <ErrorState message={error} onRetry={loadVehicles} />
          ) : vehicles.length === 0 ? (
            <div className="flex justify-center py-8"><Typography>Không có dữ liệu xe</Typography></div>
          ) : (
              <table className="w-full min-w-max table-auto text-left">
                <thead>
                  <tr>
                    {["Ảnh", "Biển số", "Loại xe", "Hãng / Màu", "Cư dân", "Phòng", !isGuard ? "Phí/tháng" : null, !isGuard ? "Thao tác" : null].filter(Boolean).map((head) => (
                      <th key={head} className="border-b border-blue-gray-50 py-3 px-5">
                        <Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">{head}</Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((vh, key) => {
                    const isLast = key === vehicles.length - 1;
                    const className = `py-3 px-5 ${isLast ? "" : "border-b border-blue-gray-50"}`;
                    return (
                      <tr key={vh.id}>
                        <td className={className}>
                          <ImageThumbnail images={vh.imageUrls} alt={vh.licensePlate} />
                        </td>
                        <td className={className}>
                          <Typography variant="small" color="blue-gray" className="font-bold">{vh.licensePlate}</Typography>
                        </td>
                        <td className={className}>
                          <Chip variant="gradient" size="sm" value={vh.vehicleTypeName} color={getTypeColor(vh.vehicleType)} className="py-0.5 px-2 text-[11px] font-medium w-fit" />
                        </td>
                        <td className={className}>
                          <Typography variant="small" color="blue-gray" className="font-medium">{vh.brand || "-"}</Typography>
                          <Typography className="text-xs font-normal text-blue-gray-500">{vh.color || ""}</Typography>
                        </td>
                        <td className={className}>
                          <Typography variant="small" color="blue-gray" className="font-medium">{vh.residentName}</Typography>
                        </td>
                        <td className={className}>
                          {vh.roomNumbers && vh.roomNumbers.length > 0 ? (
                            <div className="flex gap-1 flex-wrap">
                              {vh.roomNumbers.map((r, i) => (<Chip key={i} size="sm" variant="outlined" value={r} color="gray" className="py-0.5 px-2 text-[10px] font-medium w-fit border-gray-300" />))}
                            </div>
                          ) : (<Typography variant="small" color="gray" className="text-xs italic">-</Typography>)}
                        </td>
                        {!isGuard && (
                          <td className={className}>
                            <Typography variant="small" color="blue-gray" className="font-medium">{formatMoney(vh.monthlyFee)}</Typography>
                          </td>
                        )}
                        {!isGuard && (
                          <td className={className}>
                            <div className="flex items-center gap-2">
                              <IconButton variant="text" color="blue-gray" size="sm" onClick={() => handleEdit(vh.id)}>
                                <PencilIcon className="h-4 w-4" />
                              </IconButton>
                              <IconButton variant="text" color="red" size="sm" onClick={() => { setVehicleToDelete(vh); setDeleteDialogOpen(true); }}>
                                <TrashIcon className="h-4 w-4" />
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

        {!loading && vehicles.length > 0 && (
          <div className="flex items-center justify-between border-t border-blue-gray-50 p-4 shrink-0 bg-white">
            <div className="flex items-center gap-4">
              <Typography variant="small" color="blue-gray" className="font-normal opacity-70">Hiển thị {vehicles.length} / {totalElements} xe</Typography>
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

      <VehicleModal 
        open={isModalOpen} 
        onClose={handleModalClose} 
        vehicleId={selectedVehicleId} 
        onSuccess={handleModalSuccess} 
      />

      <Dialog open={deleteDialogOpen} handler={() => setDeleteDialogOpen(false)} size="xs">
        <DialogHeader>Xác nhận xóa</DialogHeader>
        <DialogBody divider>
          Bạn có chắc chắn muốn xóa xe biển số <span className="font-bold text-red-500">{vehicleToDelete?.licensePlate}</span> không? Hành động này không thể hoàn tác.
        </DialogBody>
        <DialogFooter>
          <Button variant="text" color="blue-gray" onClick={() => setDeleteDialogOpen(false)} className="mr-1">Hủy</Button>
          <Button variant="gradient" color="red" onClick={handleDelete}>Xóa</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default Vehicles;
