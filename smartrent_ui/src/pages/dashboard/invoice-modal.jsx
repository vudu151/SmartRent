import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  Typography,
  IconButton,
  Spinner,
} from "@material-tailwind/react";
import { PrinterIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { getRoomInvoice } from "@/api/room";
import { showToast } from "@/lib/swal";
import { env } from "@/config/env";

export function InvoicePreviewModal({ open, onClose, roomId, month, year }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && roomId && month && year) {
      loadInvoice();
    }
  }, [open, roomId, month, year]);

  const loadInvoice = async () => {
    try {
      setLoading(true);
      const res = await getRoomInvoice(roomId, month, year);
      setData(res);
    } catch (err) {
      showToast(err.message || "Không tải được phiếu", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (!data) return;

    const qr = getVietQRUrl();
    const rows = [];

    // Tiền phòng
    rows.push(`<tr><td style="border:1px solid #ccc;padding:8px 12px;">Tiền phòng</td><td style="border:1px solid #ccc;padding:8px 12px;text-align:right;color:#78909c;">—</td><td style="border:1px solid #ccc;padding:8px 12px;text-align:right;font-weight:700;">${Number(data.monthlyRent).toLocaleString()} đ</td></tr>`);

    // Tiền điện
    rows.push(`<tr><td style="border:1px solid #ccc;padding:8px 12px;">Tiền điện</td><td style="border:1px solid #ccc;padding:8px 12px;text-align:right;color:#78909c;font-size:11px;">${Number(data.electricOldIndex)} → ${Number(data.electricNewIndex)} = ${Number(data.electricUsage)} kWh × ${Number(data.electricUnitPrice).toLocaleString()}đ</td><td style="border:1px solid #ccc;padding:8px 12px;text-align:right;font-weight:700;">${Number(data.electricAmount).toLocaleString()} đ</td></tr>`);

    // Tiền nước
    rows.push(`<tr><td style="border:1px solid #ccc;padding:8px 12px;">Tiền nước</td><td style="border:1px solid #ccc;padding:8px 12px;text-align:right;color:#78909c;font-size:11px;">${Number(data.waterOldIndex)} → ${Number(data.waterNewIndex)} = ${Number(data.waterUsage)} m³ × ${Number(data.waterUnitPrice).toLocaleString()}đ</td><td style="border:1px solid #ccc;padding:8px 12px;text-align:right;font-weight:700;">${Number(data.waterAmount).toLocaleString()} đ</td></tr>`);

    // Phí dịch vụ
    if (Number(data.serviceAmount) > 0) rows.push(`<tr><td style="border:1px solid #ccc;padding:8px 12px;">Phí dịch vụ / Rác</td><td style="border:1px solid #ccc;padding:8px 12px;text-align:right;color:#78909c;">—</td><td style="border:1px solid #ccc;padding:8px 12px;text-align:right;font-weight:700;">${Number(data.serviceAmount).toLocaleString()} đ</td></tr>`);
    if (Number(data.internetAmount) > 0) rows.push(`<tr><td style="border:1px solid #ccc;padding:8px 12px;">Internet</td><td style="border:1px solid #ccc;padding:8px 12px;text-align:right;color:#78909c;">—</td><td style="border:1px solid #ccc;padding:8px 12px;text-align:right;font-weight:700;">${Number(data.internetAmount).toLocaleString()} đ</td></tr>`);
    if (Number(data.parkingAmount) > 0) rows.push(`<tr><td style="border:1px solid #ccc;padding:8px 12px;">Gửi xe</td><td style="border:1px solid #ccc;padding:8px 12px;text-align:right;color:#78909c;">—</td><td style="border:1px solid #ccc;padding:8px 12px;text-align:right;font-weight:700;">${Number(data.parkingAmount).toLocaleString()} đ</td></tr>`);

    const qrSection = qr ? `
      <div style="text-align:center;border-top:1px solid #ddd;padding-top:16px;margin-top:8px;">
        <p style="font-weight:700;font-size:11px;text-transform:uppercase;color:#546e7a;margin-bottom:8px;">Quét QR để chuyển khoản</p>
        <img src="${qr}" style="width:180px;height:180px;object-fit:contain;border:1px solid #ddd;border-radius:8px;padding:4px;" />
        ${data.bankOwner ? `<p style="font-size:12px;color:#78909c;margin-top:8px;">${data.bankName} — ${data.bankAccount}<br/>CTK: ${data.bankOwner}</p>` : ""}
      </div>
    ` : "";

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Phiếu thu T${month}/${year} - P.${data.roomNumber}</title>
    <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Tahoma,sans-serif;padding:24px;color:#333;font-size:14px}table{width:100%;border-collapse:collapse}@media print{body{padding:16px}}</style>
    </head><body>
      <div style="text-align:center;border-bottom:2px solid #ccc;padding-bottom:16px;margin-bottom:20px;">
        <h2 style="font-weight:900;text-transform:uppercase;letter-spacing:1px;color:#263238;">${data.buildingName || "Nhà trọ"}</h2>
        ${data.buildingAddress ? `<p style="color:#78909c;margin-top:4px;font-size:13px;">📍 ${data.buildingAddress}</p>` : ""}
        ${data.tenantPhone ? `<p style="color:#78909c;font-size:13px;">📞 ${data.tenantPhone}</p>` : ""}
        <div style="margin-top:12px;display:inline-block;background:#eef2ff;padding:4px 20px;border-radius:999px;">
          <span style="font-weight:700;color:#4338ca;font-size:13px;">PHIẾU THU TIỀN PHÒNG — Tháng ${String(month).padStart(2,"0")}/${year}</span>
        </div>
      </div>

      <div style="display:flex;justify-content:space-between;margin-bottom:16px;font-size:14px;">
        <div><span style="color:#78909c;">Phòng: </span><strong>${data.roomNumber}</strong></div>
        <div><span style="color:#78909c;">Khách thuê: </span><strong>${data.residentName}</strong></div>
      </div>

      <table style="margin-bottom:20px;">
        <thead><tr style="background:#f5f5f5;">
          <th style="border:1px solid #ccc;padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;font-weight:700;">Khoản mục</th>
          <th style="border:1px solid #ccc;padding:8px 12px;text-align:right;font-size:11px;text-transform:uppercase;font-weight:700;">Chi tiết</th>
          <th style="border:1px solid #ccc;padding:8px 12px;text-align:right;font-size:11px;text-transform:uppercase;font-weight:700;">Thành tiền</th>
        </tr></thead>
        <tbody>${rows.join("")}</tbody>
        <tfoot><tr style="background:#eef2ff;">
          <td colspan="2" style="border:1px solid #ccc;padding:12px;font-weight:900;text-transform:uppercase;color:#312e81;">Tổng cộng</td>
          <td style="border:1px solid #ccc;padding:12px;text-align:right;font-weight:900;font-size:18px;color:#4338ca;">${Number(data.totalAmount).toLocaleString()} đ</td>
        </tr></tfoot>
      </table>

      <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:20px;">
        <div><span style="color:#78909c;">Ngày lập phiếu: </span><span>${new Date(data.invoiceDate).toLocaleDateString("vi-VN")}</span></div>
        <div><span style="color:#78909c;">Hạn thanh toán: </span><strong style="color:#dc2626;">${new Date(data.dueDate).toLocaleDateString("vi-VN")}</strong></div>
      </div>

      ${qrSection}
    </body></html>`;

    const printWindow = window.open("", "_blank", "width=800,height=600");
    if (!printWindow) {
      showToast("Trình duyệt chặn popup. Vui lòng cho phép popup để in.", "error");
      return;
    }
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 400);
  };

  // VietQR dynamic URL
  const getVietQRUrl = () => {
    if (!data?.bankAccount || !data?.bankName) return data?.bankQrUrl || null;
    const bankBin = getBankBin(data.bankName);
    if (!bankBin) return data?.bankQrUrl || null;
    const amount = Math.round(data.totalAmount || 0);
    const info = encodeURIComponent(`PHONG ${data.roomNumber} T${month}/${year}`);
    return `https://img.vietqr.io/image/${bankBin}-${data.bankAccount}-compact.png?amount=${amount}&addInfo=${info}&accountName=${encodeURIComponent(data.bankOwner || "")}`;
  };

  // Map tên ngân hàng -> BIN code (phổ biến nhất)
  const getBankBin = (bankName) => {
    if (!bankName) return null;
    const name = bankName.toUpperCase();
    const map = {
      "VIETCOMBANK": "970436", "VCB": "970436",
      "TECHCOMBANK": "970407", "TCB": "970407",
      "MBBANK": "970422", "MB": "970422",
      "BIDV": "970418",
      "VIETINBANK": "970415", "CTG": "970415",
      "AGRIBANK": "970405",
      "SACOMBANK": "970403", "STB": "970403",
      "TPBANK": "970423",
      "VPBANK": "970432",
      "ACB": "970416",
      "HDBANK": "970437",
      "SHINHANBANK": "970424",
      "OCBBANK": "970448", "OCB": "970448",
      "MSBANK": "970426",
    };
    for (const [key, val] of Object.entries(map)) {
      if (name.includes(key)) return val;
    }
    return null;
  };

  const qrUrl = data ? getVietQRUrl() : null;

  return (
    <Dialog open={open} handler={onClose} size="md" className="z-[9999] overflow-hidden max-h-[95vh]" overlayProps={{ className: "z-[9998]" }}>
      <DialogHeader className="flex justify-between items-center border-b pb-3 no-print">
        <Typography variant="h6" color="blue-gray">
          Phiếu thu tháng {month}/{year}
        </Typography>
        <div className="flex items-center gap-1">
          <IconButton variant="text" color="indigo" onClick={handlePrint} title="In phiếu" disabled={loading || !data}>
            <PrinterIcon className="w-5 h-5" />
          </IconButton>
          <IconButton variant="text" color="blue-gray" onClick={onClose} className="rounded-full">
            <XMarkIcon className="h-5 w-5" />
          </IconButton>
        </div>
      </DialogHeader>

      <DialogBody className="overflow-y-auto max-h-[80vh] p-0">
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner className="h-8 w-8" color="indigo" />
          </div>
        ) : !data ? (
          <div className="flex justify-center py-12">
            <Typography color="gray">Không có dữ liệu</Typography>
          </div>
        ) : (
          <div id="invoice-receipt" className="p-6 bg-white print:p-4">
            {/* ===== HEADER ===== */}
            <div className="text-center mb-5 border-b-2 border-blue-gray-100 pb-4">
              <Typography variant="h5" className="font-black text-blue-gray-800 uppercase tracking-wide">
                {data.buildingName || "Nhà trọ"}
              </Typography>
              {data.buildingAddress && (
                <Typography variant="small" className="text-blue-gray-500 mt-1">
                  📍 {data.buildingAddress}
                </Typography>
              )}
              {data.tenantPhone && (
                <Typography variant="small" className="text-blue-gray-500">
                  📞 {data.tenantPhone}
                </Typography>
              )}
              <div className="mt-3 bg-indigo-50 inline-block px-4 py-1 rounded-full">
                <Typography variant="h6" color="indigo" className="font-bold text-sm">
                  PHIẾU THU TIỀN PHÒNG — Tháng {String(month).padStart(2, "0")}/{year}
                </Typography>
              </div>
            </div>

            {/* ===== THÔNG TIN PHÒNG ===== */}
            <div className="grid grid-cols-2 gap-x-4 mb-5 text-sm">
              <div className="flex gap-1">
                <span className="text-blue-gray-500">Phòng:</span>
                <span className="font-bold text-blue-gray-800">{data.roomNumber}</span>
              </div>
              <div className="flex gap-1">
                <span className="text-blue-gray-500">Khách thuê:</span>
                <span className="font-bold text-blue-gray-800">{data.residentName}</span>
              </div>
            </div>

            {/* ===== BẢNG KÊ CHI TIẾT ===== */}
            <table className="w-full text-sm border-collapse mb-5">
              <thead>
                <tr className="bg-blue-gray-50">
                  <th className="border border-blue-gray-100 px-3 py-2 text-left font-bold text-blue-gray-700 text-xs uppercase">Khoản mục</th>
                  <th className="border border-blue-gray-100 px-3 py-2 text-right font-bold text-blue-gray-700 text-xs uppercase">Chi tiết</th>
                  <th className="border border-blue-gray-100 px-3 py-2 text-right font-bold text-blue-gray-700 text-xs uppercase">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {/* Tiền phòng */}
                <tr>
                  <td className="border border-blue-gray-100 px-3 py-2 font-medium">Tiền phòng</td>
                  <td className="border border-blue-gray-100 px-3 py-2 text-right text-blue-gray-500">—</td>
                  <td className="border border-blue-gray-100 px-3 py-2 text-right font-bold">{Number(data.monthlyRent).toLocaleString()} đ</td>
                </tr>

                {/* Tiền điện */}
                <tr>
                  <td className="border border-blue-gray-100 px-3 py-2 font-medium">Tiền điện</td>
                  <td className="border border-blue-gray-100 px-3 py-2 text-right text-blue-gray-500 text-xs">
                    {Number(data.electricOldIndex)} → {Number(data.electricNewIndex)} = {Number(data.electricUsage)} kWh × {Number(data.electricUnitPrice).toLocaleString()}đ
                  </td>
                  <td className="border border-blue-gray-100 px-3 py-2 text-right font-bold">{Number(data.electricAmount).toLocaleString()} đ</td>
                </tr>

                {/* Tiền nước */}
                <tr>
                  <td className="border border-blue-gray-100 px-3 py-2 font-medium">Tiền nước</td>
                  <td className="border border-blue-gray-100 px-3 py-2 text-right text-blue-gray-500 text-xs">
                    {Number(data.waterOldIndex)} → {Number(data.waterNewIndex)} = {Number(data.waterUsage)} m³ × {Number(data.waterUnitPrice).toLocaleString()}đ
                  </td>
                  <td className="border border-blue-gray-100 px-3 py-2 text-right font-bold">{Number(data.waterAmount).toLocaleString()} đ</td>
                </tr>

                {/* Dịch vụ */}
                {Number(data.serviceAmount) > 0 && (
                  <tr>
                    <td className="border border-blue-gray-100 px-3 py-2 font-medium">Phí dịch vụ / Rác</td>
                    <td className="border border-blue-gray-100 px-3 py-2 text-right text-blue-gray-500">—</td>
                    <td className="border border-blue-gray-100 px-3 py-2 text-right font-bold">{Number(data.serviceAmount).toLocaleString()} đ</td>
                  </tr>
                )}
                {Number(data.internetAmount) > 0 && (
                  <tr>
                    <td className="border border-blue-gray-100 px-3 py-2 font-medium">Internet</td>
                    <td className="border border-blue-gray-100 px-3 py-2 text-right text-blue-gray-500">—</td>
                    <td className="border border-blue-gray-100 px-3 py-2 text-right font-bold">{Number(data.internetAmount).toLocaleString()} đ</td>
                  </tr>
                )}
                {Number(data.parkingAmount) > 0 && (
                  <tr>
                    <td className="border border-blue-gray-100 px-3 py-2 font-medium">Gửi xe</td>
                    <td className="border border-blue-gray-100 px-3 py-2 text-right text-blue-gray-500">—</td>
                    <td className="border border-blue-gray-100 px-3 py-2 text-right font-bold">{Number(data.parkingAmount).toLocaleString()} đ</td>
                  </tr>
                )}
              </tbody>
              {/* TỔNG CỘNG */}
              <tfoot>
                <tr className="bg-indigo-50">
                  <td colSpan={2} className="border border-blue-gray-100 px-3 py-3 font-black text-indigo-800 uppercase">
                    Tổng cộng
                  </td>
                  <td className="border border-blue-gray-100 px-3 py-3 text-right font-black text-lg text-indigo-700">
                    {Number(data.totalAmount).toLocaleString()} đ
                  </td>
                </tr>
              </tfoot>
            </table>

            {/* ===== HẠN THANH TOÁN ===== */}
            <div className="flex justify-between items-center text-sm mb-5">
              <div>
                <span className="text-blue-gray-500">Ngày lập phiếu: </span>
                <span className="font-medium">{new Date(data.invoiceDate).toLocaleDateString("vi-VN")}</span>
              </div>
              <div>
                <span className="text-blue-gray-500">Hạn thanh toán: </span>
                <span className="font-bold text-red-600">{new Date(data.dueDate).toLocaleDateString("vi-VN")}</span>
              </div>
            </div>

            {/* ===== QR CHUYỂN KHOẢN ===== */}
            {qrUrl && (
              <div className="flex flex-col items-center border-t border-blue-gray-100 pt-4">
                <Typography variant="small" className="font-bold text-blue-gray-600 mb-2 uppercase text-xs">
                  Quét QR để chuyển khoản
                </Typography>
                <img
                  src={qrUrl}
                  alt="QR Chuyển khoản"
                  className="w-48 h-48 object-contain rounded-lg border border-blue-gray-100 p-1"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                {data.bankOwner && (
                  <Typography variant="small" className="text-blue-gray-500 mt-2 text-center">
                    {data.bankName} — {data.bankAccount}<br />
                    CTK: {data.bankOwner}
                  </Typography>
                )}
              </div>
            )}
          </div>
        )}
      </DialogBody>

    </Dialog>
  );
}

export default InvoicePreviewModal;
