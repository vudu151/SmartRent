import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardBody,
  Typography,
  Button,
  Chip,
  IconButton,
  Spinner,
  Timeline,
  TimelineItem,
  TimelineConnector,
  TimelineHeader,
  TimelineIcon,
  TimelineBody,
} from "@material-tailwind/react";
import {
  ArrowLeftIcon,
  UserCircleIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  PrinterIcon,
  HomeIcon,
  PhoneIcon,
  IdentificationIcon,
  ClockIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/solid";
import { useNavbarHeader } from "@/context/navbar-header";
import { getRoomById, getRoomTimeline } from "@/api/room";
import { getBills } from "@/api/bill";
import { showToast } from "@/lib/swal";
import { InvoicePreviewModal } from "./invoice-modal";

// ====== Section Card wrapper ======
function SectionCard({ title, icon, children, className = "" }) {
  return (
    <Card className={`shadow-sm border border-blue-gray-50 ${className}`}>
      <CardBody className="p-5">
        <div className="flex items-center gap-2 mb-4 border-b border-blue-gray-50 pb-3">
          {icon}
          <Typography variant="h6" color="blue-gray" className="font-bold text-sm uppercase">
            {title}
          </Typography>
        </div>
        {children}
      </CardBody>
    </Card>
  );
}

// ====== Info Row ======
function InfoRow({ label, value, bold = false }) {
  return (
    <div className="flex justify-between py-1.5">
      <span className="text-sm text-blue-gray-500">{label}</span>
      <span className={`text-sm ${bold ? "font-bold text-blue-gray-800" : "text-blue-gray-700"}`}>
        {value || "—"}
      </span>
    </div>
  );
}

export function RoomDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setNavbarHeader } = useNavbarHeader();

  const [room, setRoom] = useState(null);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [billsLoading, setBillsLoading] = useState(true);
  const [billPage, setBillPage] = useState(1);
  const [billTotalPages, setBillTotalPages] = useState(1);

  // Timeline
  const [timeline, setTimeline] = useState([]);
  const [timelineLoading, setTimelineLoading] = useState(true);

  // Invoice modal
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [invoiceMonth, setInvoiceMonth] = useState(new Date().getMonth() + 1);
  const [invoiceYear, setInvoiceYear] = useState(new Date().getFullYear());

  // Load room detail
  const loadRoom = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getRoomById(Number(id));
      setRoom(data);
    } catch (err) {
      showToast(err.message || "Không tải được thông tin phòng", "error");
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Load bills for this room
  const loadBills = useCallback(async () => {
    if (!room) return;
    try {
      setBillsLoading(true);
      const res = await getBills({
        page: billPage - 1,
        size: 10,
        roomNumber: room.roomNumber,
      });
      setBills(res.content || []);
      setBillTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error("Error loading bills:", err);
    } finally {
      setBillsLoading(false);
    }
  }, [room, billPage]);

  useEffect(() => { loadRoom(); }, [loadRoom]);
  useEffect(() => { if (room) loadBills(); }, [room, loadBills]);

  // Load timeline
  const loadTimeline = useCallback(async () => {
    if (!id) return;
    try {
      setTimelineLoading(true);
      const data = await getRoomTimeline(Number(id));
      setTimeline(data || []);
    } catch (err) {
      console.error("Error loading timeline:", err);
    } finally {
      setTimelineLoading(false);
    }
  }, [id]);

  useEffect(() => { loadTimeline(); }, [loadTimeline]);

  // Navbar header
  useEffect(() => {
    setNavbarHeader(
      <div className="flex items-center gap-3">
        <IconButton variant="text" color="blue-gray" onClick={() => navigate("/dashboard/rooms")}>
          <ArrowLeftIcon className="h-5 w-5" />
        </IconButton>
        <div>
          <Typography variant="h6" color="blue-gray" className="font-bold">
            Hồ sơ phòng {room?.roomNumber || "..."}
          </Typography>
          <Typography color="gray" className="font-normal text-xs">
            Xem chi tiết, lịch sử hóa đơn và in phiếu thu
          </Typography>
        </div>
      </div>
    );
  }, [room, setNavbarHeader, navigate]);

  const getStatusColor = (s) => {
    switch (s) {
      case "OCCUPIED": return "green";
      case "VACANT": return "blue-gray";
      case "MAINTENANCE": return "orange";
      default: return "blue-gray";
    }
  };
  const getStatusLabel = (s) => {
    switch (s) {
      case "OCCUPIED": return "Đang ở";
      case "VACANT": return "Trống";
      case "MAINTENANCE": return "Bảo trì";
      default: return s;
    }
  };
  const getBillStatusColor = (s) => {
    switch (s) {
      case "PAID": return "green";
      case "UNPAID": return "red";
      case "OVERDUE": return "orange";
      default: return "blue-gray";
    }
  };
  const getBillStatusLabel = (s) => {
    switch (s) {
      case "PAID": return "Đã thu";
      case "UNPAID": return "Chưa thu";
      case "OVERDUE": return "Quá hạn";
      default: return s;
    }
  };

  const handlePrintInvoice = (bill) => {
    const d = new Date(bill.dueDate);
    setInvoiceMonth(d.getMonth() + 1);
    setInvoiceYear(d.getFullYear());
    setInvoiceOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="h-8 w-8" color="indigo" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Typography color="red">Không tìm thấy phòng</Typography>
        <Button variant="text" onClick={() => navigate("/dashboard/rooms")}>Quay lại</Button>
      </div>
    );
  }

  const residents = room.residents ? Array.from(room.residents) : [];
  const unpaidTotal = bills
    .filter(b => b.status === "UNPAID" || b.status === "OVERDUE")
    .reduce((sum, b) => sum + (b.amount || 0), 0);

  return (
    <div className="flex flex-col gap-5 pb-8">
      {/* ===== ROW 1: Thông tin phòng + Cư dân ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Thông tin phòng */}
        <SectionCard
          title="Thông tin phòng"
          icon={<HomeIcon className="h-5 w-5 text-indigo-500" />}
        >
          <div className="flex items-center gap-3 mb-4">
            <Typography variant="h3" color="blue-gray" className="font-black">
              {room.roomNumber}
            </Typography>
            <Chip
              variant="gradient"
              size="sm"
              value={getStatusLabel(room.status)}
              color={getStatusColor(room.status)}
              className="rounded-full"
            />
          </div>
          <div className="space-y-0.5">
            <InfoRow label="Tầng" value={room.floor} />
            <InfoRow label="Diện tích" value={room.area ? `${room.area} m²` : null} />
            <InfoRow label="Loại phòng" value={room.type === "STANDARD" ? "Phòng thường" : room.type === "KIOT" ? "Ki-ốt" : room.type} />
            <InfoRow label="Giá thuê" value={room.price ? `${Number(room.price).toLocaleString()} đ/tháng` : null} bold />
            <InfoRow label="Số cư dân" value={room.residentCount || 0} />
          </div>
        </SectionCard>

        {/* Cư dân hiện tại */}
        <SectionCard
          title="Cư dân hiện tại"
          icon={<UserCircleIcon className="h-5 w-5 text-green-500" />}
        >
          {residents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-blue-gray-300">
              <UserCircleIcon className="h-12 w-12 mb-2" />
              <Typography variant="small">Chưa có cư dân</Typography>
            </div>
          ) : (
            <div className="space-y-3">
              {residents.map((r) => (
                <div key={r.id} className="flex items-center gap-3 p-3 bg-blue-gray-50/50 rounded-lg">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <UserCircleIcon className="h-6 w-6 text-indigo-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Typography variant="small" className="font-bold text-blue-gray-800 truncate">
                      {r.fullName}
                    </Typography>
                    <div className="flex items-center gap-3 text-xs text-blue-gray-500">
                      {r.phone && (
                        <span className="flex items-center gap-1">
                          <PhoneIcon className="h-3 w-3" /> {r.phone}
                        </span>
                      )}
                    </div>
                  </div>
                  <Chip
                    size="sm"
                    variant="ghost"
                    value={r.status === "ACTIVE" ? "Đang ở" : r.status}
                    color={r.status === "ACTIVE" ? "green" : "blue-gray"}
                    className="text-[10px]"
                  />
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {/* ===== ROW 2: Lịch sử Hóa đơn & Timeline ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Cột trái: Lịch sử hóa đơn (chiếm 2 cột) */}
        <div className="lg:col-span-2">
          <SectionCard
            title="Lịch sử hóa đơn"
            icon={<CurrencyDollarIcon className="h-5 w-5 text-amber-500" />}
            className="h-full"
          >
        {unpaidTotal > 0 && (
          <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-4 flex items-center justify-between">
            <Typography variant="small" color="red" className="font-medium">
              💰 Tổng nợ hiện tại:
            </Typography>
            <Typography variant="h6" color="red" className="font-black">
              {unpaidTotal.toLocaleString()} đ
            </Typography>
          </div>
        )}

        {billsLoading ? (
          <div className="flex justify-center py-6">
            <Spinner className="h-6 w-6" color="indigo" />
          </div>
        ) : bills.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-blue-gray-300">
            <DocumentTextIcon className="h-10 w-10 mb-2" />
            <Typography variant="small">Chưa có hóa đơn nào</Typography>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[300px] sm:min-w-[500px] table-auto text-left">
                <thead>
                  <tr>
                    {["Kỳ", "Loại", "Số tiền", "Trạng thái", ""].map((h) => (
                      <th key={h} className={`border-b border-blue-gray-50 py-2.5 px-2 sm:px-3 ${h === "Loại" ? "hidden sm:table-cell" : ""}`}>
                        <Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">
                          {h}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bills.map((bill) => (
                    <tr key={bill.id} className="hover:bg-blue-gray-50/30 transition-colors">
                      <td className="py-2.5 px-2 sm:px-3">
                        <Typography variant="small" className="font-medium text-blue-gray-700">
                          {new Date(bill.dueDate).toLocaleDateString("vi-VN", { month: "2-digit", year: "numeric" })}
                        </Typography>
                      </td>
                      <td className="py-2.5 px-2 sm:px-3 hidden sm:table-cell">
                        <Typography variant="small" color="blue-gray">
                          {bill.billType === "RENT" ? "Tiền phòng" : bill.billType === "ELECTRICITY" ? "Tiền điện" : bill.billType === "WATER" ? "Tiền nước" : bill.billType === "SERVICE" ? "Dịch vụ" : bill.billType}
                        </Typography>
                      </td>
                      <td className="py-2.5 px-2 sm:px-3">
                        <Typography variant="small" className="font-bold text-indigo-600">
                          {bill.amount?.toLocaleString()} đ
                        </Typography>
                      </td>
                      <td className="py-2.5 px-2 sm:px-3">
                        <Chip
                          size="sm"
                          variant="gradient"
                          value={getBillStatusLabel(bill.status)}
                          color={getBillStatusColor(bill.status)}
                          className="py-0.5 px-2 text-[10px] font-medium w-fit"
                        />
                      </td>
                      <td className="py-2.5 px-2 sm:px-3">
                        <IconButton
                          size="sm"
                          variant="text"
                          color="indigo"
                          title="In phiếu thu"
                          onClick={() => handlePrintInvoice(bill)}
                        >
                          <PrinterIcon className="h-4 w-4" />
                        </IconButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-blue-gray-50">
              <Typography variant="small" color="blue-gray" className="opacity-70">
                Trang {billPage} / {billTotalPages}
              </Typography>
              <div className="flex gap-2">
                <Button variant="outlined" color="blue-gray" size="sm" disabled={billPage <= 1} onClick={() => setBillPage(p => p - 1)}>
                  Trước
                </Button>
                <Button variant="outlined" color="blue-gray" size="sm" disabled={billPage >= billTotalPages} onClick={() => setBillPage(p => p + 1)}>
                  Sau
                </Button>
              </div>
            </div>
          </>
        )}
          </SectionCard>
        </div>

        {/* Cột phải: Lịch sử hoạt động (Timeline) */}
        <div className="lg:col-span-1">
          <SectionCard
            title="Nhật ký phòng"
            icon={<ClockIcon className="h-5 w-5 text-blue-500" />}
            className="h-full max-h-[500px] overflow-y-auto"
          >
            {timelineLoading ? (
              <div className="flex justify-center py-6">
                <Spinner className="h-6 w-6" color="indigo" />
              </div>
            ) : timeline.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-blue-gray-300">
                <ClockIcon className="h-10 w-10 mb-2" />
                <Typography variant="small">Chưa có sự kiện nào</Typography>
              </div>
            ) : (
              <div className="px-2">
                <Timeline>
                  {timeline.map((event, index) => {
                    const isLast = index === timeline.length - 1;
                    return (
                      <TimelineItem key={event.id} className="h-28">
                        {!isLast && <TimelineConnector />}
                        <TimelineHeader className="h-3">
                          <TimelineIcon color={event.color} className="p-2">
                            {event.type === 'BILL' ? <CurrencyDollarIcon className="h-3 w-3" /> :
                             event.type === 'TICKET' ? <WrenchScrewdriverIcon className="h-3 w-3" /> :
                             event.type === 'RESIDENT' ? <UserCircleIcon className="h-3 w-3" /> :
                             <DocumentTextIcon className="h-3 w-3" />}
                          </TimelineIcon>
                          <Typography variant="small" color="blue-gray" className="font-bold leading-none">
                            {event.title}
                          </Typography>
                        </TimelineHeader>
                        <TimelineBody className="pb-8">
                          <Typography variant="small" color="gray" className="font-normal text-[11px] mb-1">
                            {new Date(event.timestamp).toLocaleString("vi-VN", {
                              day: '2-digit', month: '2-digit', year: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </Typography>
                          <Typography variant="small" color="blue-gray" className="font-normal text-xs opacity-80 line-clamp-2">
                            {event.description}
                          </Typography>
                        </TimelineBody>
                      </TimelineItem>
                    );
                  })}
                </Timeline>
              </div>
            )}
          </SectionCard>
        </div>
      </div>

      {/* Invoice Print Modal */}
      <InvoicePreviewModal
        open={invoiceOpen}
        onClose={() => setInvoiceOpen(false)}
        roomId={Number(id)}
        month={invoiceMonth}
        year={invoiceYear}
      />
    </div>
  );
}

export default RoomDetail;
