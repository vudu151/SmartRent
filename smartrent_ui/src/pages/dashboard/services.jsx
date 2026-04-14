import React from "react";
import {
  Card,
  CardBody,
  Typography,
  Button,
  Input,
  IconButton,
  Tooltip,
} from "@material-tailwind/react";
import { Cog6ToothIcon, IdentificationIcon, ArrowPathIcon } from "@heroicons/react/24/solid";
import { useNavbarHeader } from "@/context/navbar-header";
import { getRooms } from "@/api/room";
import { getMeterReadings, recordMeterReading, generateCombinedBill } from "@/api/service";
import FeeSettingsModal from "./fee-settings";
import { showToast } from "@/lib/swal";

export function Services() {
  const { setNavbarHeader } = useNavbarHeader();
  const [loading, setLoading] = React.useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  
  const [rooms, setRooms] = React.useState([]);
  const [readings, setReadings] = React.useState([]);
  const [editingIndexes, setEditingIndexes] = React.useState({});
  
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = React.useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = React.useState(currentDate.getFullYear());

  React.useEffect(() => {
    setNavbarHeader(
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 w-full">
        <div className="min-w-0">
          <Typography variant="h6" color="blue-gray" className="font-bold truncate">Quản lý Điện - Nước</Typography>
          <Typography color="gray" className="font-normal text-xs">Ghi chỉ số đồng hồ hàng tháng và chốt hóa đơn</Typography>
        </div>
        <div className="flex shrink-0 gap-2 items-center">
          <Button variant="outlined" color="blue-gray" size="sm" className="flex items-center gap-1 whitespace-nowrap" onClick={() => setIsSettingsOpen(true)}>
            <Cog6ToothIcon className="h-3 w-3" /> Cấu hình Giá
          </Button>
        </div>
      </div>
    );
  }, [setNavbarHeader]);

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [roomsRes, readingsRes] = await Promise.all([
        getRooms({ size: 100 }),
        getMeterReadings(selectedMonth, selectedYear)
      ]);
      
      const allRooms = roomsRes.content || [];
      const allReadings = readingsRes.content || [];
      
      setRooms(allRooms);
      setReadings(allReadings);
      
      const initialEdits = {};
      allRooms.forEach(room => {
        const elec = allReadings.find(r => r.roomId === room.id && r.type === "ELECTRICITY");
        const water = allReadings.find(r => r.roomId === room.id && r.type === "WATER");
        initialEdits[room.id] = {
          elecOld: elec?.oldIndex || 0,
          elecNew: elec?.newIndex || "",
          waterOld: water?.oldIndex || 0,
          waterNew: water?.newIndex || "",
        };
      });
      setEditingIndexes(initialEdits);
    } catch (err) {
      console.error(err);
      showToast("Lỗi khi tải dữ liệu dịch vụ", "error");
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  React.useEffect(() => { loadData(); }, [loadData]);

  const handleIndexChange = (roomId, field, value) => {
    setEditingIndexes(prev => ({ ...prev, [roomId]: { ...prev[roomId], [field]: value } }));
  };

  const handleSaveAndBill = async (roomId) => {
    try {
      const data = editingIndexes[roomId];
      if (data.elecNew !== "") {
        await recordMeterReading({ roomId, type: "ELECTRICITY", readingMonth: selectedMonth, readingYear: selectedYear, newIndex: Number(data.elecNew) });
      }
      if (data.waterNew !== "") {
        await recordMeterReading({ roomId, type: "WATER", readingMonth: selectedMonth, readingYear: selectedYear, newIndex: Number(data.waterNew) });
      }
      await generateCombinedBill(roomId, selectedMonth, selectedYear);
      showToast("Đã chốt sổ và sinh Hóa đơn gộp thành công!", "success");
      loadData();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  return (
    <div className="h-full flex flex-col">
      <Card className="h-full flex flex-col overflow-hidden">
        <CardBody className="overflow-auto p-0 flex-1">
          {/* Month/Year filter */}
          <div className="px-6 py-3 flex items-center gap-4 border-b border-blue-gray-50 bg-blue-gray-50/30">
            <div className="w-24">
              <Input type="number" label="Tháng" size="sm" value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))} min={1} max={12} />
            </div>
            <div className="w-24">
              <Input type="number" label="Năm" size="sm" value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} />
            </div>
            <IconButton variant="text" onClick={loadData} size="sm">
              <ArrowPathIcon className="h-4 w-4" />
            </IconButton>
          </div>

          <table className="w-full min-w-max table-auto text-left">
            <thead>
              <tr>
                <th rowSpan={2} className="border-b border-r border-blue-gray-100 bg-blue-gray-50 py-0.5 px-4 text-center">Phòng</th>
                <th rowSpan={2} className="border-b border-r border-blue-gray-100 bg-blue-gray-50 py-0.5 px-4 text-center">Trạng thái</th>
                <th colSpan={2} className="border-b border-light-blue-100 bg-light-blue-50 py-0.5 px-4 text-center">ĐIỆN (kWh)</th>
                <th colSpan={2} className="border-b border-blue-100 bg-blue-50 py-0.5 px-4 text-center">NƯỚC (m³)</th>
                <th rowSpan={2} className="border-b border-blue-gray-100 bg-blue-gray-50 py-0.5 px-4 text-center">Thao tác</th>
              </tr>
              <tr>
                <th className="border-b border-blue-gray-100 bg-blue-gray-50 py-0.5 px-4 text-xs font-semibold text-center text-gray-500">Số Cũ</th>
                <th className="border-b border-blue-gray-100 bg-blue-gray-50 py-0.5 px-4 text-xs font-semibold text-center text-blue-gray-800">SỐ MỚI</th>
                <th className="border-b border-blue-gray-100 bg-blue-gray-50 py-0.5 px-4 text-xs font-semibold text-center text-gray-500">Số Cũ</th>
                <th className="border-b border-blue-gray-100 bg-blue-gray-50 py-0.5 px-4 text-xs font-semibold text-center text-blue-gray-800">SỐ MỚI</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center py-4">Đang tải...</td></tr>
              ) : rooms.map((room) => {
                const edits = editingIndexes[room.id] || { elecOld: 0, elecNew: "", waterOld: 0, waterNew: "" };
                return (
                  <tr key={room.id} className="even:bg-blue-gray-50/50">
                    <td className="py-2 px-4 border-r border-blue-gray-50 text-center font-bold">{room.roomNumber}</td>
                    <td className="py-2 px-4 border-r border-blue-gray-50 text-center">
                      <span className={`text-xs font-bold ${room.status === "VACANT" ? "text-gray-500" : "text-green-500"}`}>{room.status}</span>
                    </td>
                    <td className="py-1 px-2 text-center w-24"><Input variant="static" disabled value={edits.elecOld} className="text-center bg-gray-100" /></td>
                    <td className="py-1 px-2 text-center w-24 border-r border-blue-gray-50"><Input variant="static" type="number" value={edits.elecNew} onChange={e => handleIndexChange(room.id, "elecNew", e.target.value)} className="text-center font-bold text-blue-600" placeholder="Nhập" /></td>
                    <td className="py-1 px-2 text-center w-24"><Input variant="static" disabled value={edits.waterOld} className="text-center bg-gray-100" /></td>
                    <td className="py-1 px-2 text-center w-24 border-r border-blue-gray-50"><Input variant="static" type="number" value={edits.waterNew} onChange={e => handleIndexChange(room.id, "waterNew", e.target.value)} className="text-center font-bold text-blue-600" placeholder="Nhập" /></td>
                    <td className="py-2 px-4 text-center">
                      <Tooltip content="Chốt Số & Sinh Hóa Đơn">
                        <IconButton size="sm" variant="gradient" color="blue" onClick={() => handleSaveAndBill(room.id)}>
                          <IdentificationIcon className="h-4 w-4" />
                        </IconButton>
                      </Tooltip>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardBody>
      </Card>
      
      <FeeSettingsModal open={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}

export default Services;
