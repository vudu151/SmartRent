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
  Chip,
} from "@material-tailwind/react";
import { CheckBadgeIcon, PrinterIcon, CalculatorIcon, ReceiptRefundIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { useMaterialTailwindController } from "@/context";
import { getLiquidationSummary, executeLiquidation } from "@/api/liquidation";
import { showToast } from "@/lib/swal";

export function LiquidationModal({ open, onClose, contract, onSuccess }) {
  const [controller] = useMaterialTailwindController();
  const { darkMode } = controller;

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [stayDays, setStayDays] = useState(0);
  const [otherDeductions, setOtherDeductions] = useState(0);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open && contract) {
      loadSummary(0);
    }
  }, [open, contract]);

  const loadSummary = async (days) => {
    try {
      setLoading(true);
      const data = await getLiquidationSummary(contract.id, days);
      setSummary(data);
    } catch (err) {
      showToast("Lỗi tải thông tin quyết toán", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleStayDaysChange = (val) => {
    const days = parseInt(val) || 0;
    setStayDays(days);
    loadSummary(days);
  };

  const handleLiquidate = async () => {
    try {
      setExecuting(true);
      await executeLiquidation(contract.id, { stayDays, otherDeductions, notes });
      showToast("Thanh lý hợp đồng thành công!", "success");
      onSuccess();
      onClose();
    } catch (err) {
      showToast(err.message || "Lỗi khi thực hiện thanh lý", "error");
    } finally {
      setExecuting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Tính số tiền thực lĩnh (UI side calculation for responsiveness)
  const finalRefundAmount = (summary?.depositAmount || 0) - (summary?.totalDebts || 0) - (otherDeductions || 0);

  return (
    <Dialog open={open} handler={onClose} size="lg" className={`min-w-[90%] md:min-w-[70%] ${darkMode ? "bg-blue-gray-900" : ""}`}>
      <DialogHeader className="flex justify-between items-center border-b pb-4">
        <div className="flex items-center gap-2">
          <Typography variant="h5" color="blue-gray">
            Quyết Toán Trả Phòng: {contract?.roomNumber}
          </Typography>
        </div>
        <div className="flex items-center gap-1">
            <IconButton variant="text" color="blue-gray" onClick={handlePrint} title="In biên bản" className="dark:text-white">
                <PrinterIcon className="w-5 h-5" />
            </IconButton>
            <IconButton variant="text" color="blue-gray" onClick={onClose} className="dark:text-white">
                <XMarkIcon className="h-5 w-5" />
            </IconButton>
        </div>
      </DialogHeader>
      
      <DialogBody divider className={`overflow-y-auto max-h-[75vh] px-4 py-6 print:p-0 ${darkMode ? "border-blue-gray-800" : ""}`}>
        <div id="liquidation-receipt" className={`print:m-0 print:shadow-none bg-white p-6 rounded-xl ${darkMode ? "bg-blue-gray-900 border border-blue-gray-800" : ""}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* THÔNG TIN CHUNG */}
                <div>
                    <Typography variant="h6" color="blue-gray" className="mb-4 border-b dark:border-blue-gray-800 pb-1 font-bold dark:text-white uppercase text-xs">1. Thông tin hợp đồng</Typography>
                    <div className="space-y-1">
                        <div className="flex justify-between"><span className="text-gray-500 dark:text-blue-gray-300">Mã HĐ:</span><span className="font-medium dark:text-white">{contract?.contractNumber}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500 dark:text-blue-gray-300">Khách thuê:</span><span className="font-medium dark:text-white">{contract?.residentName}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500 dark:text-blue-gray-300">Ngày bắt đầu:</span><span className="font-medium dark:text-white">{new Date(contract?.startDate).toLocaleDateString()}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500 dark:text-blue-gray-300">Giá thuê/tháng:</span><span className="font-bold text-indigo-600 dark:text-indigo-400">{contract?.monthlyRent?.toLocaleString()} đ</span></div>
                    </div>
                </div>

                {/* TÍNH TOÁN LẺ NGÀY */}
                <div className="bg-blue-gray-50/50 p-4 rounded-xl border border-blue-gray-50">
                    <Typography variant="h6" color="blue-gray" className="mb-4 flex items-center gap-2 font-bold uppercase text-xs">
                        <CalculatorIcon className="w-5 h-5" /> 2. Tiền phòng lẻ ngày
                    </Typography>
                    <div className="space-y-4">
                        <Input 
                            type="number" 
                            label="Số ngày ở thêm trong tháng" 
                            color="indigo"
                            className="dark:text-white"
                            value={stayDays} 
                            onChange={(e) => handleStayDaysChange(e.target.value)} 
                        />
                        <div className="flex justify-between items-center text-indigo-900 dark:text-indigo-200">
                            <span className="text-sm font-medium">Thành tiền (Dự kiến):</span>
                            <span className="text-lg font-bold">{summary?.proRatedRent?.toLocaleString()} đ</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* CHI TIẾT QUYẾT TOÁN */}
            <div className="mb-8">
                <Typography variant="h6" color="blue-gray" className="mb-4 border-b dark:border-blue-gray-800 pb-1 font-bold dark:text-white uppercase text-xs">3. Bảng kê tài chính</Typography>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50 dark:bg-blue-gray-800 border-b dark:border-blue-gray-800">
                            <th className="p-3 font-bold text-[10px] uppercase dark:text-blue-gray-100">Nội dung</th>
                            <th className="p-3 font-bold text-[10px] uppercase text-right dark:text-blue-gray-100">Phát sinh tăng (+)</th>
                            <th className="p-3 font-bold text-[10px] uppercase text-right dark:text-blue-gray-100">Phát sinh giảm (-)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Cọc */}
                        <tr className="border-b dark:border-blue-gray-800">
                            <td className="p-3 text-sm font-medium dark:text-white">Tiền đặt cọc của khách</td>
                            <td className="p-3 text-sm text-right text-green-600 font-bold">+{summary?.depositAmount?.toLocaleString()} đ</td>
                            <td className="p-3 text-sm text-right dark:text-blue-gray-300">0 đ</td>
                        </tr>
                        {/* Tiền lẻ ngày */}
                        {stayDays > 0 && (
                            <tr className="border-b dark:border-blue-gray-800">
                                <td className="p-3 text-sm dark:text-blue-gray-200">Tiền ở lẻ ngày ({stayDays} ngày)</td>
                                <td className="p-3 text-sm text-right dark:text-blue-gray-300">0 đ</td>
                                <td className="p-3 text-sm text-right text-red-600">-{summary?.proRatedRent?.toLocaleString()} đ</td>
                            </tr>
                        )}
                        {/* Hóa đơn chưa đóng */}
                        {summary?.unpaidBills?.map((bill, idx) => (
                            <tr key={idx} className="border-b dark:border-blue-gray-800">
                                <td className="p-3 text-sm dark:text-blue-gray-200">Nợ: {bill.title}</td>
                                <td className="p-3 text-sm text-right dark:text-blue-gray-300">0 đ</td>
                                <td className="p-3 text-sm text-right text-red-600">-{bill.amount?.toLocaleString()} đ</td>
                            </tr>
                        ))}
                        {/* Khấu trừ khác */}
                        <tr>
                            <td className="p-3 text-sm">
                                <Input 
                                    variant="standard" 
                                    label="Khấu trừ khác / Đền bù tài sản" 
                                    type="number" 
                                    color="indigo"
                                    className="dark:text-white"
                                    value={otherDeductions} 
                                    onChange={(e) => setOtherDeductions(Number(e.target.value))} 
                                />
                            </td>
                            <td className="p-3 text-sm text-right dark:text-blue-gray-300">0 đ</td>
                            <td className="p-3 text-sm text-right text-red-600">-{otherDeductions?.toLocaleString()} đ</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* TỔNG KẾT */}
            <div className="flex flex-col items-end gap-2 border-t dark:border-blue-gray-800 pt-4">
                <div className="flex gap-4 items-center">
                    <Typography className="text-gray-600 dark:text-blue-gray-400">Tổng cộng các khoản trừ:</Typography>
                    <Typography className="font-bold text-red-600 text-lg">
                        -{((summary?.totalDebts || 0) + otherDeductions).toLocaleString()} đ
                    </Typography>
                </div>
                <div className="flex gap-4 items-center bg-black text-white p-5 rounded-xl mt-2 w-full md:w-1/2 shadow-lg shadow-gray-200">
                    <Typography variant="h5" className="flex-grow uppercase font-normal text-sm opacity-80">THỰC HOÀN TRẢ:</Typography>
                    <Typography variant="h4" className="font-black text-2xl">
                        {finalRefundAmount?.toLocaleString()} đ
                    </Typography>
                </div>
                {finalRefundAmount < 0 && (
                   <Typography variant="small" color="red" className="italic mt-1">* Lưu ý: Khách thuê cần đóng bù thêm cho phần âm.</Typography>
                )}
            </div>

            <div className="mt-8">
                <Input 
                    label="Ghi chú thanh lý (Lý do trừ tiền, hiện trạng phòng...)" 
                    value={notes} 
                    color="indigo"
                    className="dark:text-white"
                    onChange={(e) => setNotes(e.target.value)} 
                />
            </div>
        </div>
      </DialogBody>
      
      <DialogFooter className="gap-2">
        <Button variant="text" color="red" onClick={onClose} disabled={executing}>Đóng</Button>
        <Button variant="gradient" color="indigo" className="flex items-center gap-2 shadow-none" onClick={handleLiquidate} loading={executing}>
            <CheckBadgeIcon className="w-5 h-5" /> Hoàn Tất Quyết Toán
        </Button>
      </DialogFooter>

      {/* CSS dành riêng cho Print */}
      <style>{`
        @media print {
            body * { visibility: hidden; }
            #liquidation-receipt, #liquidation-receipt * { visibility: visible; }
            #liquidation-receipt { 
              position: absolute; 
              left: 0; 
              top: 0; 
              width: 100%; 
              padding: 20px;
            }
            .no-print { display: none !important; }
        }
      `}</style>
    </Dialog>
  );
}
