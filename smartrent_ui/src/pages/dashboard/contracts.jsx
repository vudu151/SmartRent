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
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon, LinkIcon, CheckBadgeIcon } from "@heroicons/react/24/solid";
import {
  useMaterialTailwindController,
} from "@/context";
import { getContracts, deleteContract } from "@/api/contract";
import { ContractModal } from "./contract-form";
import { LiquidationModal } from "./liquidation-modal";
import { showToast } from "@/lib/swal";

export function Contracts() {
  const [contracts, setContracts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [contractToDelete, setContractToDelete] = React.useState(null);

  const [controller] = useMaterialTailwindController();
  const { darkMode } = controller;

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedContractId, setSelectedContractId] = React.useState(null);

  const [liquidationOpen, setLiquidationOpen] = React.useState(false);
  const [contractToLiquidate, setContractToLiquidate] = React.useState(null);

  const [page, setPage] = React.useState(1);
  const [size, setSize] = React.useState(10);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalElements, setTotalElements] = React.useState(0);

  const loadContracts = React.useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getContracts({
        page: page - 1,
        size,
        search: searchTerm,
      });

      setContracts(response.content || []);
      setTotalPages(response.totalPages || 1);
      setTotalElements(response.totalElements || 0);
    } catch (err) {
      console.error("Error loading contracts:", err);
      setError(err.message || "Không thể tải danh sách hợp đồng.");
    } finally {
      setLoading(false);
    }
  }, [page, size, searchTerm]);

  React.useEffect(() => {
    loadContracts();
  }, [loadContracts]);

  React.useEffect(() => {
    setPage(1);
  }, [size, searchTerm]);

  const handleAdd = () => {
    setSelectedContractId(null);
    setIsModalOpen(true);
  };

  const handleEdit = (id) => {
    setSelectedContractId(id);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedContractId(null);
  };

  const handleModalSuccess = () => {
    setPage(1);
    loadContracts();
  };

  const handleLiquidateSuccess = () => {
    loadContracts();
  };

  const handleDelete = async () => {
    if (!contractToDelete) return;
    try {
      await deleteContract(contractToDelete.id);
      showToast(`Đã xóa hợp đồng "${contractToDelete.contractNumber}" thành công`, "success");
      setDeleteDialogOpen(false);
      setContractToDelete(null);
      loadContracts();
    } catch (err) {
      showToast(err.message || "Không thể xóa hợp đồng", "error");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE": return "green";
      case "EXPIRED": return "gray";
      default: return "blue-gray";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "ACTIVE": return "Hiệu lực";
      case "EXPIRED": return "Hết hạn";
      default: return status;
    }
  };

  const handleCopyPortalLink = (portalToken) => {
    const url = `${window.location.origin}/portal/${portalToken}`;
    navigator.clipboard.writeText(url).then(() => {
      showToast("Đã copy link thanh toán!", "success");
    }).catch(() => {
      showToast("Lỗi copy link", "error");
    });
  };

  return (
    <div className="h-full flex flex-col">
      <Card className="h-full flex flex-col overflow-hidden">
        <CardHeader floated={false} shadow={false} className="rounded-none border-b border-blue-gray-100 dark:border-blue-gray-700 shrink-0 px-6 py-4 dark:bg-blue-gray-900">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <Typography variant="h5" color="blue-gray" className="font-bold dark:text-white">Quản lý Hợp đồng</Typography>
              <Typography color="gray" className="mt-0.5 font-normal text-sm dark:text-blue-gray-200">
                Danh sách hợp đồng thuê phòng
              </Typography>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
              <div className="w-full sm:w-64">
                <Input
                  label="Tìm số HĐ, Tên, Phòng..."
                  size="sm"
                  icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button color="black" className="flex items-center gap-2 uppercase py-2.5 px-5 shadow-none hover:shadow-md hover:shadow-gray-300 transition-all" onClick={handleAdd}>
                <PlusIcon strokeWidth={2.5} className="h-4 w-4" /> Thêm Hợp đồng
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardBody className="overflow-auto p-0 flex-1">
          {error && <Alert color="red" className="mb-4 mx-4">{error}</Alert>}

          {loading ? (
            <div className="flex justify-center py-8"><Typography>Đang tải...</Typography></div>
          ) : contracts.length === 0 ? (
            <div className="flex justify-center py-8"><Typography>Không có dữ liệu hợp đồng</Typography></div>
          ) : (
            <>
              <table className="mt-4 w-full min-w-max table-auto text-left">
                <thead className="sticky top-0 z-20 bg-blue-gray-50 shadow-sm">
                  <tr>
                    {["Mã HĐ", "Phòng", "Cư dân", "Bắt đầu", "Kết thúc", "Giá thuê", "Trạng thái", "Thao tác"].map((head) => (
                      <th key={head} className="border-b border-blue-gray-100 bg-blue-gray-50/50 dark:bg-blue-gray-800 dark:border-blue-gray-700 py-3 px-4">
                        <Typography variant="small" color="blue-gray" className="font-bold leading-none dark:text-blue-gray-100">
                          {head}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {contracts.map((contract) => (
                    <tr key={contract.id} className="border-b border-blue-gray-50 dark:border-blue-gray-800 hover:bg-indigo-50/20 dark:hover:bg-indigo-900/10 transition-colors">
                      <td className="py-3 px-4">
                        <Typography variant="small" color="blue-gray" className="font-bold dark:text-white">
                          {contract.contractNumber}
                        </Typography>
                      </td>
                      <td className="py-3 px-4"><Typography variant="small" color="blue-gray" className="dark:text-blue-gray-200">{contract.roomNumber}</Typography></td>
                      <td className="py-3 px-4"><Typography variant="small" color="blue-gray" className="dark:text-blue-gray-200">{contract.residentName}</Typography></td>
                      <td className="py-3 px-4"><Typography variant="small" color="blue-gray" className="dark:text-blue-gray-200">{new Date(contract.startDate).toLocaleDateString("vi-VN")}</Typography></td>
                      <td className="py-3 px-4"><Typography variant="small" color="blue-gray" className="dark:text-blue-gray-200">{new Date(contract.endDate).toLocaleDateString("vi-VN")}</Typography></td>
                      <td className="py-3 px-4 text-right"><Typography variant="small" color="blue-gray" className="dark:text-blue-gray-200">{contract.monthlyRent?.toLocaleString()} VNĐ</Typography></td>
                      <td className="py-3 px-4">
                        <Chip size="sm" variant="ghost" value={getStatusLabel(contract.status)} color={getStatusColor(contract.status)} className="dark:bg-opacity-20" />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <IconButton size="sm" variant="text" color="indigo" onClick={() => handleCopyPortalLink(contract.portalToken)} title="Copy link Portal giao khách" className="text-indigo-600 dark:text-indigo-400">
                            <LinkIcon className="h-4 w-4" />
                          </IconButton>
                          <IconButton size="sm" variant="text" color="blue-gray" className="dark:text-white" onClick={() => handleEdit(contract.id)}>
                            <PencilIcon className="h-4 w-4" />
                          </IconButton>
                          <IconButton size="sm" variant="text" color="red" onClick={() => { setContractToDelete(contract); setDeleteDialogOpen(true); }}>
                            <TrashIcon className="h-4 w-4" />
                          </IconButton>
                          {contract.status === "ACTIVE" && (
                            <IconButton size="sm" variant="text" color="green" title="Thanh lý / Trả phòng" onClick={() => { setContractToLiquidate(contract); setLiquidationOpen(true); }}>
                              <CheckBadgeIcon className="h-4 w-4" />
                            </IconButton>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-2 px-4 py-4 flex items-center justify-between border-t border-blue-gray-50 dark:border-blue-gray-800 bg-blue-gray-50/10 dark:bg-blue-gray-900/50">
                <div className="flex items-center gap-4">
                  <Typography variant="small" color="blue-gray" className="font-normal dark:text-blue-gray-200">
                    Hiển thị {contracts.length} trong {totalElements} hợp đồng
                  </Typography>
                  <Typography variant="small" color="blue-gray" className="font-normal dark:text-blue-gray-200">
                    Trang {page} / {totalPages || 1}
                  </Typography>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outlined"
                    color={darkMode ? "white" : "blue-gray"}
                    size="sm"
                    disabled={page <= 1 || loading}
                    onClick={() => setPage(p => p - 1)}
                  >
                    Trước
                  </Button>
                  <Button
                    variant="outlined"
                    color={darkMode ? "white" : "blue-gray"}
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

      <ContractModal
        open={isModalOpen}
        onClose={handleModalClose}
        contractId={selectedContractId}
        onSuccess={handleModalSuccess}
      />

      <LiquidationModal
        open={liquidationOpen}
        onClose={() => setLiquidationOpen(false)}
        contract={contractToLiquidate}
        onSuccess={handleLiquidateSuccess}
      />

      <Dialog open={deleteDialogOpen} handler={setDeleteDialogOpen}>
        <DialogHeader>Xác nhận xóa</DialogHeader>
        <DialogBody>Bạn có chắc muốn xóa hợp đồng "{contractToDelete?.contractNumber}"?</DialogBody>
        <DialogFooter>
          <Button variant="text" color="red" onClick={() => setDeleteDialogOpen(false)} className="mr-1">Hủy</Button>
          <Button variant="gradient" color="red" onClick={handleDelete}>Xóa</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default Contracts;
