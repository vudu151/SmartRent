import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Typography,
  Input,
  Button,
} from "@material-tailwind/react";
import { CalculatorIcon, BoltIcon, BeakerIcon, CheckCircleIcon } from "@heroicons/react/24/solid";
import { useMaterialTailwindController } from "@/context";
import { useNavbarHeader } from "@/context/navbar-header";
import { getRooms } from "@/api/room";
import { generateMeterBills } from "@/api/bill";
import { showToast } from "@/lib/swal";
import { FeeSettingsModal } from "@/pages/dashboard/fee-settings";
import { Cog6ToothIcon } from "@heroicons/react/24/solid";

export function MeterReading() {
  const [controller] = useMaterialTailwindController();
  const { darkMode } = controller;
  const { setNavbarHeader } = useNavbarHeader();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [feeSettingsOpen, setFeeSettingsOpen] = useState(false);
  const [isRecordingAllowed, setIsRecordingAllowed] = useState(true);
  const [recordingDayInfo, setRecordingDayInfo] = useState("");
  
  // State to hold dynamic grid inputs
  // Format: { [roomId]: { eOld, eNew, wOld, wNew } }
  const [readings, setReadings] = useState({});
  const [editModes, setEditModes] = useState({});

  useEffect(() => {
    setNavbarHeader(
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 w-full">
        <div className="min-w-0">
          <Typography variant="h6" color="blue-gray" className="font-bold truncate">Cửa sổ Chốt Điện Nước</Typography>
          <Typography color="gray" className="font-normal text-xs">Nhập số đầu - số cuối nhanh chóng. Hệ thống sẽ tự động tính hóa đơn.</Typography>
        </div>
        <div className="flex shrink-0 gap-2 items-center">
          <Button variant="outlined" color="blue-gray" size="sm" className="flex items-center gap-1.5 whitespace-nowrap" onClick={() => document.getElementById('btn-open-settings')?.click()}>
            <Cog6ToothIcon className="w-4 h-4" /> CẤU HÌNH GIÁ
          </Button>
          <Button variant="gradient" color="indigo" size="sm" className="flex items-center gap-1.5 whitespace-nowrap" onClick={() => document.getElementById('btn-submit-meter')?.click()}>
            <CheckCircleIcon className="w-4 h-4" /> CHỐT ĐỒNG LOẠT
          </Button>
        </div>
      </div>
    );
  }, [setNavbarHeader]);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      setLoading(true);
      
      try {
        const { getFeeConfig } = await import("@/api/service");
        const config = await getFeeConfig();
        const currentDay = new Date().getDate();
        const startDay = config.meterRecordingStartDay || 1;
        const endDay = config.meterRecordingEndDay || 31;
        const allowed = currentDay >= startDay && currentDay <= endDay;
        setIsRecordingAllowed(allowed);
        if (!allowed) {
          setRecordingDayInfo(`Chỉ cho phép chốt điện nước từ ngày ${startDay} đến ngày ${endDay} hàng tháng.`);
        } else {
          setRecordingDayInfo("");
        }
      } catch(e) {
        // ignore
      }

      const res = await getRooms({ page: 0, size: 100 });
      // Filter out only OCCUPIED rooms
      const activeRooms = (res.content || []).filter(r => r.status === "OCCUPIED");
      setRooms(activeRooms);
      
      // Init empty state
      const initialReadings = {};
      const initialEditModes = {};
      activeRooms.forEach(r => {
        initialReadings[r.id] = { eOld: "Tự động", eNew: "", wOld: "Tự động", wNew: "" };
        initialEditModes[r.id] = false; // Mặc định không cho sửa, phải bấm "Sửa" mới được nhập
      });
      setReadings(initialReadings);
      setEditModes(initialEditModes);
    } catch (err) {
      showToast("Lỗi tải danh sách phòng", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (roomId, field, value) => {
    setReadings(prev => ({
      ...prev,
      [roomId]: {
        ...prev[roomId],
        [field]: value
      }
    }));
  };

  const handleToggleEdit = (roomId) => {
    if (!isRecordingAllowed) {
      showToast("Hiện không trong thời gian được phép chốt điện nước", "warning");
      return;
    }
    setEditModes(prev => ({
      ...prev,
      [roomId]: !prev[roomId]
    }));
  };

  const handleSingleSubmit = async (roomId) => {
    const data = readings[roomId];
    if (data.eNew === "" && data.wNew === "") {
      showToast("Vui lòng nhập chỉ số mới!", "warning");
      return;
    }

    try {
      setProcessing(true);
      await generateMeterBills([{
        roomId: Number(roomId),
        oldElectricity: null,
        newElectricity: data.eNew !== "" ? Number(data.eNew) : null,
        oldWater: null,
        newWater: data.wNew !== "" ? Number(data.wNew) : null,
      }]);
      showToast(`Đã chốt xong Điện Nước cho phòng ${rooms.find(r => r.id === roomId)?.roomNumber}!`, "success");
      
      // Khóa lại input sau khi chốt
      setEditModes(prev => ({ ...prev, [roomId]: false }));
      
      // Load lại để có số mới nhất nếu cần, tạm thời để nguyên state mới
    } catch (err) {
      showToast(err.message || "Lỗi tự động chốt hóa đơn", "error");
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmit = async () => {
    let hasError = false;
    // Bỏ qua validate eNew < eOld vì eOld giờ là "Tự động"

    if (hasError) {
      showToast("Vui lòng kiểm tra lại các chỉ số điện/nước báo đỏ", "error");
      return;
    }

    // Build payload
    const payloadArray = [];
    Object.keys(readings).forEach(roomId => {
      const data = readings[roomId];
      // Only attach if new values are inputted
      if (data.eNew !== "" || data.wNew !== "") {
        payloadArray.push({
          roomId: Number(roomId),
          oldElectricity: null, // Backend sẽ tự lấy
          newElectricity: data.eNew !== "" ? Number(data.eNew) : null,
          oldWater: null, // Backend sẽ tự lấy
          newWater: data.wNew !== "" ? Number(data.wNew) : null,
        });
      }
    });

    if (payloadArray.length === 0) {
      showToast("Chưa có chỉ số Khối Lượng mới nào được nhập!", "warning");
      return;
    }

    try {
      setProcessing(true);
      await generateMeterBills(payloadArray);
      showToast("Đã chốt xong Toàn Bộ hóa đơn Điện Nước!", "success");
      // Could reset form here if needed
      loadRooms();
    } catch (err) {
      showToast(err.message || "Lỗi tự động chốt hóa đơn", "error");
    } finally {
      setProcessing(false);
    }
  };

  const hasGlobalError = false; // Bỏ validate eNew < eOld vì eOld là tự động

  return (
    <div className="h-full flex flex-col">
      {/* Hidden buttons for navbar trigger */}
      <button id="btn-submit-meter" className="hidden" onClick={handleSubmit} disabled={processing || loading || hasGlobalError || !isRecordingAllowed} />
      <button id="btn-open-settings" className="hidden" onClick={() => setFeeSettingsOpen(true)} />
      
      <FeeSettingsModal open={feeSettingsOpen} onClose={() => setFeeSettingsOpen(false)} />

      <Card className="h-full flex flex-col overflow-hidden">
        {recordingDayInfo && (
          <div className="bg-orange-50 border-b border-orange-100 p-3 text-orange-800 text-sm text-center font-medium">
            ⚠️ {recordingDayInfo} Hiện tại chỉ xem được dữ liệu, không thể sửa hay chốt mới!
          </div>
        )}
        <CardBody className="p-4 md:p-6 dark:bg-blue-gray-900/50 overflow-auto flex-1">
          {loading ? (
            <div className="text-center p-12 text-gray-500 dark:text-blue-gray-300">Đang tải danh sách phòng...</div>
          ) : rooms.length === 0 ? (
            <div className="text-center p-12 text-gray-500 border-2 border-dashed rounded-xl dark:border-blue-gray-800 dark:text-blue-gray-300">
                Khu trọ hiện đang Trống hoặc chưa cho thuê phòng nào.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {rooms.map((room) => {
                  const data = readings[room.id] || {};
                  return (
                    <Card key={room.id} className="border border-blue-gray-50 dark:border-blue-gray-800 shadow-sm hover:shadow-md transition-shadow dark:bg-blue-gray-900">
                      <CardBody className="p-4">
                        <div className="flex justify-between items-center mb-4 border-b dark:border-blue-gray-800 pb-2">
                            <div className="flex items-center gap-2">
                                <div className="px-3 py-1.5 rounded-md bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-sm border border-indigo-100 dark:border-indigo-800">
                                    {room.roomNumber}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button 
                                    variant={editModes[room.id] ? "text" : "outlined"} 
                                    color={editModes[room.id] ? "red" : "blue"} 
                                    size="sm" 
                                    className="px-3 py-1 text-xs h-7 min-w-[60px]"
                                    onClick={() => handleToggleEdit(room.id)}
                                >
                                    {editModes[room.id] ? "Hủy" : "Sửa"}
                                </Button>
                                <Button 
                                    variant="gradient" 
                                    color="indigo" 
                                    size="sm" 
                                    className="px-3 py-1 text-xs h-7 min-w-[60px]"
                                    disabled={processing || !editModes[room.id] || (data.eNew === "" && data.wNew === "")}
                                    onClick={() => handleSingleSubmit(room.id)}
                                >
                                    Chốt
                                </Button>
                            </div>
                        </div>
                        
                        <div className="space-y-6">
                            {/* SECTION: ELECTRICITY */}
                            <div className="p-3 rounded-lg bg-orange-50/30 dark:bg-orange-900/10 border border-orange-50 dark:border-orange-900/20">
                                <div className="flex items-center gap-2 mb-3 text-orange-700 dark:text-orange-300">
                                    <BoltIcon className="w-4 h-4" />
                                    <Typography variant="small" className="font-bold uppercase text-[10px]">ĐIỆN (KWh)</Typography>
                                </div>
                                <div className="grid grid-cols-2 gap-3 overflow-hidden">
                                    <Input 
                                        type="text" 
                                        label="Số cũ (Auto)" 
                                        size="sm" 
                                        color="orange"
                                        className="dark:text-white"
                                        containerProps={{ className: "min-w-[0]" }}
                                        value={data.eOld} 
                                        disabled={true}
                                    />
                                    <div>
                                      <Input 
                                          type="number" 
                                          label="Số mới" 
                                          size="sm" 
                                          color="orange"
                                          className="dark:text-white"
                                          containerProps={{ className: "min-w-[0]" }}
                                          value={data.eNew} 
                                          disabled={!isRecordingAllowed || !editModes[room.id]}
                                          onChange={(e) => handleInputChange(room.id, "eNew", e.target.value)} 
                                      />
                                    </div>
                                </div>
                            </div>

                            {/* SECTION: WATER */}
                            <div className="p-3 rounded-lg bg-blue-50/30 dark:bg-blue-900/10 border border-blue-50 dark:border-blue-900/20">
                                <div className="flex items-center gap-2 mb-3 text-blue-700 dark:text-blue-300">
                                    <BeakerIcon className="w-4 h-4" />
                                    <Typography variant="small" className="font-bold uppercase text-[10px]">NƯỚC (m³)</Typography>
                                </div>
                                <div className="grid grid-cols-2 gap-3 overflow-hidden">
                                    <Input 
                                        type="text" 
                                        label="Số cũ (Auto)" 
                                        size="sm" 
                                        color="blue"
                                        className="dark:text-white"
                                        containerProps={{ className: "min-w-[0]" }}
                                        value={data.wOld} 
                                        disabled={true}
                                    />
                                    <div>
                                      <Input 
                                          type="number" 
                                          label="Số mới" 
                                          size="sm" 
                                          color="blue"
                                          className="dark:text-white"
                                          containerProps={{ className: "min-w-[0]" }}
                                          value={data.wNew} 
                                          disabled={!isRecordingAllowed || !editModes[room.id]}
                                          onChange={(e) => handleInputChange(room.id, "wNew", e.target.value)} 
                                      />
                                    </div>
                                </div>
                            </div>
                        </div>
                      </CardBody>
                    </Card>
                  )
                })}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default MeterReading;
