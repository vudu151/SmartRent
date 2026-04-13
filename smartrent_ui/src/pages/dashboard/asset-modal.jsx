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
} from "@material-tailwind/react";
import { PlusIcon, TrashIcon, ArchiveBoxIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { useMaterialTailwindController } from "@/context";
import { getAssetsByRoom, createAsset, updateAsset, deleteAsset } from "@/api/asset";
import { showToast } from "@/lib/swal";

export function AssetModal({ open, onClose, room }) {
  const [controller] = useMaterialTailwindController();
  const { darkMode } = controller;

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newAsset, setNewAsset] = useState({ name: "", quantity: 1, condition: "Tốt", compensationValue: 0 });

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
      showToast(err.message || "Lỗi khi thêm tài sản", "error");
    }
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

  return (
    <Dialog open={open} handler={onClose} size="lg" className={`min-w-[80%] md:min-w-[60%] ${darkMode ? "bg-blue-gray-900" : ""}`}>
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
      <DialogBody divider className={`h-[60vh] overflow-y-auto px-4 py-4 ${darkMode ? "border-blue-gray-800" : ""}`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-6 p-4 bg-blue-gray-50/50 rounded-xl border border-blue-gray-50">
          <Input 
            label="Tên tài sản (Máy lạnh...)" 
            value={newAsset.name} 
            color="black"
            onChange={(e) => setNewAsset({...newAsset, name: e.target.value})} 
          />
          <Input 
            type="number" 
            label="Số lượng" 
            value={newAsset.quantity} 
            color="black"
            onChange={(e) => setNewAsset({...newAsset, quantity: Number(e.target.value)})} 
          />
          <Input 
            type="number" 
            label="Giá đền bù (VNĐ)" 
            value={newAsset.compensationValue} 
            color="black"
            onChange={(e) => setNewAsset({...newAsset, compensationValue: Number(e.target.value)})} 
          />
          <Button color="black" className="flex items-center justify-center gap-2 shadow-none" onClick={handleAddAsset}>
            <PlusIcon strokeWidth={3} className="w-4 h-4" /> Thêm
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-500">Đang tải tài sản...</div>
        ) : assets.length === 0 ? (
          <div className="text-center py-10 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
            Phòng này chưa có tài sản nào được kê khai.
          </div>
        ) : (
          <Card className="shadow-none border border-gray-200 dark:bg-blue-gray-900/50 dark:border-blue-gray-800">
            <CardBody className="p-0">
              <table className="w-full min-w-max table-auto text-left">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-blue-gray-800">
                    <th className="p-4 border-b border-gray-100 dark:border-blue-gray-800"><Typography variant="small" className="font-bold opacity-70 dark:text-blue-gray-100 uppercase text-[10px]">Tên vật phẩm</Typography></th>
                    <th className="p-4 border-b border-gray-100 dark:border-blue-gray-800"><Typography variant="small" className="font-bold opacity-70 dark:text-blue-gray-100 uppercase text-[10px]">SL</Typography></th>
                    <th className="p-4 border-b border-gray-100 dark:border-blue-gray-800"><Typography variant="small" className="font-bold opacity-70 dark:text-blue-gray-100 uppercase text-[10px]">Trạng thái</Typography></th>
                    <th className="p-4 border-b border-gray-100 dark:border-blue-gray-800"><Typography variant="small" className="font-bold opacity-70 dark:text-blue-gray-100 uppercase text-[10px]">Giá đền bù</Typography></th>
                    <th className="p-4 border-b border-gray-100 dark:border-blue-gray-800"></th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((asset) => (
                    <tr key={asset.id} className="hover:bg-blue-gray-50/50 transition-colors">
                      <td className="p-4 border-b border-gray-50">
                        <Typography variant="small" className="font-medium text-blue-gray-900">{asset.name}</Typography>
                      </td>
                      <td className="p-4 border-b border-gray-50"><Typography variant="small">{asset.quantity}</Typography></td>
                      <td className="p-4 border-b border-gray-50">
                        <Typography variant="small" className="text-[10px] font-bold text-blue-gray-700 bg-blue-gray-50 px-2 py-0.5 rounded-full uppercase inline-block border border-blue-gray-100">{asset.condition || "Tốt"}</Typography>
                      </td>
                      <td className="p-4 border-b border-gray-50">
                        <Typography variant="small" className="font-mono text-xs">{asset.compensationValue?.toLocaleString()} đ</Typography>
                      </td>
                      <td className="p-4 border-b border-gray-50 dark:border-blue-gray-800 text-right">
                        <IconButton variant="text" color="red" size="sm" onClick={() => handleDelete(asset.id)}>
                          <TrashIcon className="w-4 h-4" />
                        </IconButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardBody>
          </Card>
        )}
      </DialogBody>
      <DialogFooter>
        <Button variant="outlined" color="blue-gray" onClick={onClose}>Đóng lại</Button>
      </DialogFooter>
    </Dialog>
  );
}
