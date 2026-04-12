import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Input,
  IconButton,
  Tooltip,
} from "@material-tailwind/react";
import { Cog6ToothIcon, IdentificationIcon, ArrowPathIcon } from "@heroicons/react/24/solid";
import { getRooms } from "@/api/room";
import { getMeterReadings, recordMeterReading, generateCombinedBill } from "@/api/service";
import FeeSettingsModal from "./fee-settings";
import { showToast } from "@/lib/swal";

export function Services() {
  const [loading, setLoading] = React.useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  
  const [rooms, setRooms] = React.useState([]);
  const [readings, setReadings] = React.useState([]);
  const [editingIndexes, setEditingIndexes] = React.useState({});
  
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = React.useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = React.useState(currentDate.getFullYear());

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      // Fetch all rooms and readings for current filter parallelly
      const [roomsRes, readingsRes] = await Promise.all([
        getRooms({ size: 100 }), // Fetching all rooms
        getMeterReadings(selectedMonth, selectedYear)
      ]);
      
      const allRooms = roomsRes.content || [];
      const allReadings = readingsRes.content || [];
      
      setRooms(allRooms);
      setReadings(allReadings);
      
      // Initialize edit state mapping
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

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleIndexChange = (roomId, field, value) => {
    setEditingIndexes(prev => ({
      ...prev,
      [roomId]: {
        ...prev[roomId],
        [field]: value
      }
    }));
  };

  const handleSaveAndBill = async (roomId) => {
    try {
      const data = editingIndexes[roomId];
      if (data.elecNew !== "") {
        await recordMeterReading({
          roomId,
          type: "ELECTRICITY",
          readingMonth: selectedMonth,
          readingYear: selectedYear,
          newIndex: Number(data.elecNew)
        });
      }
      if (data.waterNew !== "") {
        await recordMeterReading({
          roomId,
          type: "WATER",
          readingMonth: selectedMonth,
          readingYear: selectedYear,
          newIndex: Number(data.waterNew)
        });
      }
      
      // Generate Combined Bill
      await generateCombinedBill(roomId, selectedMonth, selectedYear);
      showToast("Đã chốt sổ và sinh Hóa đơn gộp thành công!", "success");
      loadData();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  return (
    <div className="mt-[2px] mb-8 flex flex-col gap-4">
      <Card>
        <CardHeader floated={false} shadow={false} className="rounded-none">
          <div className="flex items-center justify-between gap-8 mb-1">
            <div>
              <Typography variant="h5" color="blue-gray">Quản lý Điện - Nước</Typography>
              <Typography color="gray" className="mt-1 font-normal">
                Ghi chỉ số đồng hồ hàng tháng và chốt hóa đơn.
              </Typography>
            </div>
            <div className="flex gap-2">
              <Button className="flex items-center gap-3" variant="outlined" size="sm" onClick={() => setIsSettingsOpen(true)}>
                <Cog6ToothIcon className="h-4 w-4" /> Cấu hình Giá
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-4 mt-4 w-full md:w-96">
            <Input 
              type="number" 
              label="Tháng" 
              value={selectedMonth} 
              onChange={e => setSelectedMonth(Number(e.target.value))} 
              min={1} max={12} 
            />
            <Input 
              type="number" 
              label="Năm" 
              value={selectedYear} 
              onChange={e => setSelectedYear(Number(e.target.value))} 
            />
            <IconButton variant="text" onClick={loadData}>
              <ArrowPathIcon className="h-5 w-5" />
            </IconButton>
          </div>
        </CardHeader>
        
        <CardBody className="overflow-x-auto p-0">
          <table className="mt-4 w-full min-w-max table-auto text-left">
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
                    <td className="py-2 px-4 border-r border-blue-gray-50 text-center font-bold">
                      {room.roomNumber}
                    </td>
                    <td className="py-2 px-4 border-r border-blue-gray-50 text-center">
                      <span className={`text-xs font-bold ${room.status === "VACANT" ? "text-gray-500" : "text-green-500"}`}>
                        {room.status}
                      </span>
                    </td>
                    
                    {/* ELECTRICITY */}
                    <td className="py-1 px-2 text-center w-24">
                      <Input variant="static" disabled value={edits.elecOld} className="text-center bg-gray-100" />
                    </td>
                    <td className="py-1 px-2 text-center w-24 border-r border-blue-gray-50">
                      <Input variant="static" type="number" value={edits.elecNew} onChange={e => handleIndexChange(room.id, "elecNew", e.target.value)} className="text-center font-bold text-blue-600" placeholder="Nhập" />
                    </td>

                    {/* WATER */}
                    <td className="py-1 px-2 text-center w-24">
                      <Input variant="static" disabled value={edits.waterOld} className="text-center bg-gray-100" />
                    </td>
                    <td className="py-1 px-2 text-center w-24 border-r border-blue-gray-50">
                      <Input variant="static" type="number" value={edits.waterNew} onChange={e => handleIndexChange(room.id, "waterNew", e.target.value)} className="text-center font-bold text-blue-600" placeholder="Nhập" />
                    </td>

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
