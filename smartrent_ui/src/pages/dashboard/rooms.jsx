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
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon, ArchiveBoxIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/solid";
import { useMaterialTailwindController } from "@/context";
import { getRooms, deleteRoom, updateRoom } from "@/api/room";
import { getContracts } from "@/api/contract";
import { RoomModal } from "./room-form";
import { AssetModal } from "./asset-modal";
import { LiquidationModal } from "./liquidation-modal";
import { showToast } from "@/lib/swal";

export function Rooms() {
  const [controller] = useMaterialTailwindController();
  const { darkMode } = controller;

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
  const [size, setSize] = React.useState(10);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalElements, setTotalElements] = React.useState(0);

  const [liquidationOpen, setLiquidationOpen] = React.useState(false);
  const [selectedContract, setSelectedContract] = React.useState(null);
  const [liquidating, setLiquidating] = React.useState(false);

  const loadRooms = React.useCallback(async () => {
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
      // Tìm hợp đồng đang hoạt động cho phòng này
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
        <CardHeader floated={false} shadow={false} className="rounded-none border-b border-blue-gray-100 shrink-0 px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <Typography variant="h5" color="blue-gray" className="font-bold">Quản lý Phòng</Typography>
              <Typography color="gray" className="mt-0.5 font-normal text-sm">
                Danh sách phòng và trạng thái hiện tại
              </Typography>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
              <div className="w-full sm:w-64">
                <Input
                  label="Tìm kiếm số phòng..."
                  icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button color="black" className="flex items-center gap-2 uppercase py-2.5 px-5 shadow-none hover:shadow-md hover:shadow-gray-300 transition-all" onClick={handleAdd}>
                <PlusIcon strokeWidth={2.5} className="h-4 w-4" /> Thêm Phòng
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardBody className="overflow-auto p-0 flex-1">
          {error && <Alert color="red" className="mb-4 mx-4">{error}</Alert>}

          {loading ? (
            <div className="flex justify-center py-8"><Typography>Đang tải...</Typography></div>
          ) : rooms.length === 0 ? (
            <div className="flex justify-center py-8"><Typography>Không có dữ liệu phòng</Typography></div>
          ) : (
            <>
              <table className="mt-4 w-full min-w-max table-auto text-left">
                <thead className="sticky top-0 z-20 bg-blue-gray-50 shadow-sm">
                  <tr>
                    {["Số Phòng", "Tầng", "Loại", "Diện tích (m²)", "Giá (VNĐ)", "Trạng thái", "Thao tác"].map((head) => (
                      <th key={head} className="border-b border-blue-gray-100 bg-blue-gray-50 py-0.5 px-4">
                        <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                          {head}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((room) => (
                    <tr key={room.id} className="border-b border-blue-gray-50 dark:border-blue-gray-800 hover:bg-indigo-50/20 dark:hover:bg-indigo-900/10 transition-colors">
                      <td className="py-3 px-4">
                        <Typography variant="small" color="blue-gray" className="font-bold dark:text-white">
                          {room.roomNumber}
                        </Typography>
                      </td>
                      <td className="py-3 px-4 text-right"><Typography variant="small" color="blue-gray" className="dark:text-blue-gray-200">{room.floor || "-"}</Typography></td>
                      <td className="py-3 px-4"><Typography variant="small" color="blue-gray" className="dark:text-blue-gray-200">{getTypeLabel(room.type)}</Typography></td>
                      <td className="py-3 px-4 text-right"><Typography variant="small" color="blue-gray" className="dark:text-blue-gray-200">{room.area || "-"}</Typography></td>
                      <td className="py-3 px-4 text-right"><Typography variant="small" color="blue-gray" className="dark:text-blue-gray-200">{room.price != null ? Number(room.price).toLocaleString() : "-"}</Typography></td>
                      <td className="py-3 px-4">
                        <Chip size="sm" variant="ghost" value={getStatusLabel(room.status)} color={getStatusColor(room.status)} className="dark:bg-opacity-20" />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <IconButton size="sm" variant="text" color="blue-gray" className="dark:text-white" title="Chỉnh sửa thông tin phòng" onClick={() => handleEdit(room.id)}>
                            <PencilIcon className="h-4 w-4" />
                          </IconButton>
                          <IconButton size="sm" variant="text" color="indigo" className="text-indigo-600 dark:text-indigo-400" title="Xem/Quản lý tài sản phòng" onClick={() => { setRoomForAsset(room); setAssetModalOpen(true); }}>
                            <ArchiveBoxIcon className="h-4 w-4" />
                          </IconButton>
                          <IconButton size="sm" variant="text" color="red" title="Xóa phòng này" onClick={() => { setRoomToDelete(room); setDeleteDialogOpen(true); }}>
                            <TrashIcon className="h-4 w-4" />
                          </IconButton>
                          {room.status === "OCCUPIED" && (
                            <IconButton
                              size="sm"
                              variant="filled"
                              color="red"
                              className="bg-red-500 shadow-none hover:shadow-red-200"
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
                  ))}
                </tbody>
              </table>

              <div className="mt-2 px-4 py-2 flex items-center justify-between border-t border-blue-gray-50 bg-blue-gray-50/20">
                <div className="flex items-center gap-4">
                  <Typography variant="small" color="blue-gray" className="font-normal opacity-70">
                    Hiển thị {rooms.length} trong {totalElements} phòng
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
            </>
          )}
        </CardBody>
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
