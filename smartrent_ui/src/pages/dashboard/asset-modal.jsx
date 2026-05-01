import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Typography,
  Input,
  IconButton,
  Card,
  CardBody,
  Select,
  Option,
} from "@material-tailwind/react";
import { PlusIcon, TrashIcon, ArchiveBoxIcon, XMarkIcon, PencilIcon, CheckIcon } from "@heroicons/react/24/solid";
import { useMaterialTailwindController } from "@/context";
import { getAssetsByRoom, createAsset, updateAsset, deleteAsset } from "@/api/asset";
import { showToast } from "@/lib/swal";

export function AssetModal({ open, onClose, room }) {
  const [controller] = useMaterialTailwindController();
  const { darkMode } = controller;

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newAsset, setNewAsset] = useState({ name: "", quantity: 1, condition: "Tốt", compensationValue: 0 });
  const [editingAssetId, setEditingAssetId] = useState(null);
  const [editAsset, setEditAsset] = useState({ name: "", quantity: 1, condition: "Tốt", compensationValue: 0 });

  useEffect(() => {
    if (open && room) {
      loadAssets();
    }
  }, [open, room]);

  const loadAssets = async () => {
    try {
      setLoading(true);
      const data = await getAssetsByRoom(room.id);
      setAssets(data);
    } catch (err) {
      showToast("Lỗi tải danh sách tài sản", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAsset = async () => {
    if (!newAsset.name) return showToast("Vui lòng nhập tên tài sản", "warning");

    try {
      await createAsset({ ...newAsset, roomId: room.id });
      showToast("Đã thêm tài sản mới", "success");
      setNewAsset({ name: "", quantity: 1, condition: "Tốt", compensationValue: 0 });
      loadAssets();
    } catch (err) {
      showToast(err.message || "Lỗi thao tác", "error");
    }
  };

  const handleEditClick = (asset) => {
    setEditingAssetId(asset.id);
    setEditAsset({
      name: asset.name,
      quantity: asset.quantity,
      condition: asset.condition || "Tốt",
      compensationValue: asset.compensationValue || 0
    });
  };

  const handleSaveInline = async () => {
    try {
      await updateAsset(editingAssetId, editAsset);
      showToast("Đã cập nhật tài sản", "success");
      setEditingAssetId(null);
      loadAssets();
    } catch (err) {
      showToast(err.message || "Lỗi cập nhật", "error");
    }
  };

  const handleCancelInline = () => {
    setEditingAssetId(null);
  };

  const handleDelete = async (id) => {
    try {
      await deleteAsset(id);
      showToast("Đã xóa tài sản", "success");
      loadAssets();
    } catch (err) {
      showToast(err.message || "Lỗi khi xóa", "error");
    }
  };

  const totalValue = assets.reduce((sum, item) => sum + ((item.quantity || 1) * (item.compensationValue || 0)), 0);

  return (
    <Dialog open={open} handler={onClose} size="lg" className={`min-w-[95vw] sm:min-w-[80vw] md:min-w-[60vw] ${darkMode ? "bg-blue-gray-900" : ""}`}>
      <DialogHeader className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-2">
            <Typography variant="h5" color="blue-gray">
                Tài Sản Phòng: {room?.roomNumber}
            </Typography>
        </div>
        <IconButton variant="text" color="red" onClick={onClose}>
            <XMarkIcon className="h-5 w-5" />
        </IconButton>
      </DialogHeader>
      <DialogBody divider className={`flex flex-col h-[70vh] p-0 overflow-hidden ${darkMode ? "border-blue-gray-800" : ""}`}>
        <div className="shrink-0 px-4 pt-4 pb-2 border-b border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-blue-gray-50/50 rounded-xl border border-blue-gray-50">
          <div className="md:col-span-5">
            <Input 
              label="Tên tài sản (Máy lạnh...)" 
              value={newAsset.name} 
              color="black"
              onChange={(e) => setNewAsset({...newAsset, name: e.target.value})} 
              containerProps={{ className: "!min-w-0" }}
            />
          </div>
          <div className="md:col-span-2">
            <Input 
              type="number" 
              label="Số lượng" 
              value={newAsset.quantity} 
              color="black"
              onChange={(e) => setNewAsset({...newAsset, quantity: Number(e.target.value)})} 
              containerProps={{ className: "!min-w-0" }}
            />
          </div>
          <div className="md:col-span-3">
            <Input 
              type="number" 
              label="Giá đền bù (VNĐ)" 
              value={newAsset.compensationValue} 
              color="black"
              onChange={(e) => setNewAsset({...newAsset, compensationValue: Number(e.target.value)})} 
              containerProps={{ className: "!min-w-0" }}
            />
          </div>
          <div className="md:col-span-2">
            <Button variant="gradient" color="indigo" className="w-full flex items-center justify-center gap-2 shadow-none" onClick={handleAddAsset}>
              <PlusIcon strokeWidth={3} className="w-4 h-4" /> Thêm
            </Button>
          </div>
        </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-white relative">
          {loading ? (
          <div className="text-center py-10 text-gray-500">Đang tải tài sản...</div>
        ) : assets.length === 0 ? (
          <div className="text-center py-10 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg m-4">
            Phòng này chưa có tài sản nào được kê khai.
          </div>
        ) : (
            <Card className="shadow-none rounded-none w-full h-full flex flex-col bg-transparent">
              <CardBody className="p-0 flex-1">
                <table className="w-full min-w-max table-auto text-left relative">
                  <thead className="sticky top-0 z-20">
                    <tr>
                    <th className="sticky top-0 z-10 bg-gray-100 dark:bg-blue-gray-800 p-4 border-b border-gray-200"><Typography variant="small" className="font-bold opacity-70 uppercase text-[10px]">Tên vật phẩm</Typography></th>
                    <th className="sticky top-0 z-10 bg-gray-100 dark:bg-blue-gray-800 p-4 border-b border-gray-200"><Typography variant="small" className="font-bold opacity-70 uppercase text-[10px]">SL</Typography></th>
                    <th className="sticky top-0 z-10 bg-gray-100 dark:bg-blue-gray-800 p-4 border-b border-gray-200"><Typography variant="small" className="font-bold opacity-70 uppercase text-[10px]">Trạng thái</Typography></th>
                    <th className="sticky top-0 z-10 bg-gray-100 dark:bg-blue-gray-800 p-4 border-b border-gray-200"><Typography variant="small" className="font-bold opacity-70 uppercase text-[10px]">Giá đền bù</Typography></th>
                    <th className="sticky top-0 z-10 bg-gray-100 dark:bg-blue-gray-800 p-4 border-b border-gray-200"></th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((asset) => {
                    const isEditing = editingAssetId === asset.id;
                    return (
                    <tr key={asset.id} className="hover:bg-blue-gray-50/50 transition-colors">
                      <td className="p-4 border-b border-gray-50">
                        {isEditing ? (
                          <div className="w-40">
                            <Input size="md" value={editAsset.name} onChange={(e) => setEditAsset({...editAsset, name: e.target.value})} containerProps={{ className: "!min-w-0" }} />
                          </div>
                        ) : (
                          <Typography variant="small" className="font-medium text-blue-gray-900">{asset.name}</Typography>
                        )}
                      </td>
                      <td className="p-4 border-b border-gray-50">
                        {isEditing ? (
                          <div className="w-20">
                            <Input type="number" size="md" value={editAsset.quantity} onChange={(e) => setEditAsset({...editAsset, quantity: Number(e.target.value)})} containerProps={{ className: "!min-w-0" }} />
                          </div>
                        ) : (
                          <Typography variant="small">{asset.quantity}</Typography>
                        )}
                      </td>
                      <td className="p-4 border-b border-gray-50">
                        {isEditing ? (
                          <div className="w-36">
                            <Select 
                              size="md" 
                              value={editAsset.condition} 
                              onChange={(val) => setEditAsset({...editAsset, condition: val})}
                              containerProps={{ className: "!min-w-0" }}
                            >
                              <Option value="Tốt">Tốt</Option>
                              <Option value="Trung bình">Trung bình</Option>
                              <Option value="Kém">Kém</Option>
                            </Select>
                          </div>
                        ) : (
                          <Typography variant="small" className="text-[10px] font-bold text-blue-gray-700 bg-blue-gray-50 px-2 py-0.5 rounded-full uppercase inline-block border border-blue-gray-100">{asset.condition || "Tốt"}</Typography>
                        )}
                      </td>
                      <td className="p-4 border-b border-gray-50">
                        {isEditing ? (
                          <div className="w-36">
                            <Input type="number" size="md" value={editAsset.compensationValue} onChange={(e) => setEditAsset({...editAsset, compensationValue: Number(e.target.value)})} containerProps={{ className: "!min-w-0" }} />
                          </div>
                        ) : (
                          <Typography variant="small" className="font-mono text-xs">{asset.compensationValue?.toLocaleString()} đ</Typography>
                        )}
                      </td>
                      <td className="p-4 border-b border-gray-50 dark:border-blue-gray-800 text-right space-x-1 whitespace-nowrap">
                        {isEditing ? (
                          <>
                            <IconButton variant="text" color="green" size="sm" onClick={handleSaveInline}>
                              <CheckIcon strokeWidth={3} className="w-5 h-5" />
                            </IconButton>
                            <IconButton variant="text" color="red" size="sm" onClick={handleCancelInline}>
                              <XMarkIcon strokeWidth={3} className="w-5 h-5" />
                            </IconButton>
                          </>
                        ) : (
                          <>
                            <IconButton variant="text" color="blue" size="sm" onClick={() => handleEditClick(asset)}>
                              <PencilIcon className="w-4 h-4" />
                            </IconButton>
                            <IconButton variant="text" color="red" size="sm" onClick={() => handleDelete(asset.id)}>
                              <TrashIcon className="w-4 h-4" />
                            </IconButton>
                          </>
                        )}
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardBody>
          </Card>
        )}
        </div>

        <div className="shrink-0 bg-blue-gray-50/80 px-6 py-4 border-t border-gray-200 flex justify-between items-center shadow-inner z-10">
          <Typography variant="small" color="blue-gray" className="font-bold uppercase tracking-wider">Tổng giá trị tài sản:</Typography>
          <Typography variant="h5" color="red" className="font-bold">{totalValue.toLocaleString()} đ</Typography>
        </div>
      </DialogBody>
      <DialogFooter>
        <Button variant="outlined" color="blue-gray" onClick={onClose}>Đóng lại</Button>
      </DialogFooter>
    </Dialog>
  );
}
