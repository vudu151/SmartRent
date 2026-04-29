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
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon, ArchiveBoxIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/solid";
import { useMaterialTailwindController } from "@/context";
import { useNavbarHeader } from "@/context/navbar-header";
import { getRooms, deleteRoom, updateRoom } from "@/api/room";
import { getContracts } from "@/api/contract";
import { RoomModal } from "./room-form";
import { AssetModal } from "./asset-modal";
import { LiquidationModal } from "./liquidation-modal";
import { showToast } from "@/lib/swal";
import { env } from "@/config/env";
import { ImageThumbnail } from "@/components/image-lightbox";

export function Rooms() {
  const [controller] = useMaterialTailwindController();
  const { darkMode } = controller;
  const { setNavbarHeader } = useNavbarHeader();
  const navigate = useNavigate();

  const [rooms, setRooms] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [roomToDelete, setRoomToDelete] = React.useState(null);

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedRoomId, setSelectedRoomId] = React.useState(null);

  const [assetModalOpen, setAssetModalOpen] = React.useState(false);
  const [roomForAsset, setRoomForAsset] = React.useState(null);

  const [page, setPage] = React.useState(1);
  const [size, setSize] = React.useState(8);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalElements, setTotalElements] = React.useState(0);

  const [liquidationOpen, setLiquidationOpen] = React.useState(false);
  const [selectedContract, setSelectedContract] = React.useState(null);
  const [liquidating, setLiquidating] = React.useState(false);

  const searchRef = React.useRef(null);

  const loadRooms = React.useCallback(async () => {
    if (searchTerm.trim().length === 1) return;
    try {
      setLoading(true);
      setError("");
      const response = await getRooms({
        page: page - 1,
        size,
        search: searchTerm,
      });

      setRooms(response.content || []);
      setTotalPages(response.totalPages || 1);
      setTotalElements(response.totalElements || 0);
    } catch (err) {
      console.error("Error loading rooms:", err);
      setError(err.message || "Không thể tải danh sách phòng.");
    } finally {
      setLoading(false);
    }
  }, [page, size, searchTerm]);

  React.useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  React.useEffect(() => {
    setPage(1);
  }, [size, searchTerm]);

  const handleAdd = () => {
    setSelectedRoomId(null);
    setIsModalOpen(true);
  };

  // Set navbar header content
  React.useEffect(() => {
    setNavbarHeader(
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 w-full">
        <div className="min-w-0">
          <Typography variant="h6" color="blue-gray" className="font-bold truncate">
            Quản lý Phòng
          </Typography>
          <Typography color="gray" className="font-normal text-xs">
            Danh sách phòng và trạng thái hiện tại
          </Typography>
        </div>
        <div className="flex shrink-0 gap-2 items-center">
          <input
            type="text"
            placeholder="Tìm số phòng (>=2 ký tự)..."
            className="text-sm border border-blue-gray-200 rounded-lg px-3 py-1.5 w-64 bg-white text-blue-gray-700 focus:outline-none focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button
            variant="gradient"
            color="indigo"
            size="sm"
            className="flex items-center gap-2 whitespace-nowrap"
            onClick={handleAdd}
          >
            <PlusIcon strokeWidth={2.5} className="h-4 w-4" /> Thêm Phòng
          </Button>
        </div>
      </div>
    );
  }, [searchTerm, setNavbarHeader]);

  const handleEdit = (id) => {
    setSelectedRoomId(id);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedRoomId(null);
  };

  const handleModalSuccess = () => {
    setPage(1);
    loadRooms();
  };

  const handleDelete = async () => {
    if (!roomToDelete) return;
    try {
      await deleteRoom(roomToDelete.id);
      showToast(`Đã xóa phòng "${roomToDelete.roomNumber}" thành công`, "success");
      setDeleteDialogOpen(false);
      setRoomToDelete(null);
      loadRooms();
    } catch (err) {
      showToast(err.message || "Không thể xóa phòng", "error");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "VACANT": return "green";
      case "OCCUPIED": return "blue";
      case "MAINTENANCE": return "orange";
      default: return "gray";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "VACANT": return "Trống";
      case "OCCUPIED": return "Đang ở";
      case "MAINTENANCE": return "Bảo trì";
      default: return status;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "STANDARD": return "Thường";
      case "KIOT": return "Ki-ốt";
      case "PENTHOUSE": return "Cao cấp";
      default: return type;
    }
  };

  const handleLiquidationClick = async (room) => {
    try {
      setLiquidating(true);
      const res = await getContracts({ roomId: room.id, status: 'ACTIVE' });
      const contract = res.content ? res.content[0] : null;

      if (!contract) {
        showToast("Không tìm thấy hợp đồng hoạt động cho phòng này!", "warning");
        return;
      }

      setSelectedContract(contract);
      setLiquidationOpen(true);
    } catch (err) {
      showToast("Lỗi khi tải thông tin hợp đồng", "error");
    } finally {
      setLiquidating(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <Card className="h-full flex flex-col overflow-hidden">
        <CardBody className="overflow-auto p-0 flex-1">
          {error && <Alert color="red" className="mb-4 mx-4">{error}</Alert>}

          {loading ? (
            <div className="flex justify-center py-8"><Typography>Đang tải...</Typography></div>
          ) : rooms.length === 0 ? (
            <div className="flex justify-center py-8"><Typography>Không có dữ liệu phòng</Typography></div>
          ) : (
              <table className="w-full min-w-max table-auto text-left">
                <thead>
                  <tr>
                    {[
                      { label: "Ảnh", align: "text-left" },
                      { label: "Số Phòng", align: "text-left" },
                      { label: "Tầng", align: "text-left" },
                      { label: "Loại", align: "text-left" },
                      { label: "Diện tích (m²)", align: "text-left" },
                      { label: "Giá (VNĐ)", align: "text-left" },
                      { label: "Trạng thái", align: "text-left" },
                      { label: "Thao tác", align: "text-left" }
                    ].map(({ label, align }) => (
                      <th
                        key={label}
                        className={`border-b border-blue-gray-50 py-3 px-5 ${align}`}
                      >
                        <Typography
                          variant="small"
                          className="text-[11px] font-bold uppercase text-blue-gray-400"
                        >
                          {label}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((room, key) => {
                    const isLast = key === rooms.length - 1;
                    const className = `py-3 px-5 ${isLast ? "" : "border-b border-blue-gray-50"}`;

                    return (
                      <tr key={room.id}>
                        <td className={className}>
                          <ImageThumbnail images={room.imageUrls} alt={room.roomNumber} />
                        </td>
                        <td className={className}>
                          <Typography
                            variant="small"
                            color="indigo"
                            className="font-bold cursor-pointer hover:underline"
                            onClick={() => navigate(`/dashboard/rooms/${room.id}`)}
                          >
                            {room.roomNumber}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Typography variant="small" color="blue-gray">
                            {room.floor || "-"}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Typography variant="small" color="blue-gray">
                            {getTypeLabel(room.type)}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Typography variant="small" color="blue-gray">
                            {room.area || "-"}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Typography variant="small" color="blue-gray" className="font-semibold">
                            {room.price != null ? Number(room.price).toLocaleString() : "-"}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Chip
                            variant="gradient"
                            size="sm"
                            value={getStatusLabel(room.status)}
                            color={getStatusColor(room.status)}
                            className="py-0.5 px-2 text-[11px] font-medium w-fit"
                          />
                        </td>
                        <td className={className}>
                          <div className="flex gap-2">
                            <IconButton size="sm" variant="text" color="blue-gray" title="Chỉnh sửa thông tin phòng" onClick={() => handleEdit(room.id)}>
                              <PencilIcon className="h-4 w-4 text-blue-gray-500" />
                            </IconButton>
                            <IconButton size="sm" variant="text" color="indigo" title="Xem/Quản lý tài sản phòng" onClick={() => { setRoomForAsset(room); setAssetModalOpen(true); }}>
                              <ArchiveBoxIcon className="h-4 w-4 text-indigo-500" />
                            </IconButton>
                            <IconButton 
                              size="sm" 
                              variant="text" 
                              color="red" 
                              title={room.status !== "VACANT" ? "Chỉ có thể xóa phòng Trống" : "Xóa phòng này"}
                              disabled={room.status !== "VACANT"}
                              onClick={() => { setRoomToDelete(room); setDeleteDialogOpen(true); }}
                            >
                              <TrashIcon className={`h-4 w-4 ${room.status !== "VACANT" ? "text-gray-400" : "text-red-500"}`} />
                            </IconButton>
                            {room.status === "OCCUPIED" && (
                              <IconButton
                                size="sm"
                                variant="gradient"
                                color="red"
                                onClick={() => handleLiquidationClick(room)}
                                disabled={liquidating}
                                title="Thanh lý hợp đồng / Trả phòng"
                              >
                                <ArrowRightOnRectangleIcon className="h-4 w-4" />
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
        {!loading && rooms.length > 0 && (
          <div className="shrink-0 px-4 py-2 flex items-center justify-between border-t border-blue-gray-50 bg-blue-gray-50/20">
            <div className="flex items-center gap-4">
              <Typography variant="small" color="blue-gray" className="font-normal opacity-70">
                Hiển thị {rooms.length} / {totalElements} phòng
              </Typography>
              <Typography variant="small" color="blue-gray" className="font-normal opacity-70">
                Trang {page} / {totalPages || 1}
              </Typography>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outlined"
                color="blue-gray"
                size="sm"
                disabled={page <= 1 || loading}
                onClick={() => setPage(p => p - 1)}
              >
                Trước
              </Button>
              <Button
                variant="outlined"
                color="blue-gray"
                size="sm"
                disabled={page >= totalPages || loading}
                onClick={() => setPage(p => p + 1)}
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </Card>

      <RoomModal
        open={isModalOpen}
        onClose={handleModalClose}
        roomId={selectedRoomId}
        onSuccess={handleModalSuccess}
      />

      <AssetModal
        open={assetModalOpen}
        onClose={() => setAssetModalOpen(false)}
        room={roomForAsset}
      />

      <Dialog open={deleteDialogOpen} handler={setDeleteDialogOpen}>
        <DialogHeader>Xác nhận xóa</DialogHeader>
        <DialogBody>Bạn có chắc muốn xóa phòng "{roomToDelete?.roomNumber}"?</DialogBody>
        <DialogFooter>
          <Button variant="text" color="red" onClick={() => setDeleteDialogOpen(false)} className="mr-1">Hủy</Button>
          <Button variant="gradient" color="red" onClick={handleDelete}>Xóa</Button>
        </DialogFooter>
      </Dialog>

      <LiquidationModal
        open={liquidationOpen}
        onClose={() => setLiquidationOpen(false)}
        contract={selectedContract}
        onSuccess={loadRooms}
      />
    </div>
  );
}

export default Rooms;
