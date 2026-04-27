import React from "react";
import {
  Card,
  CardBody,
  Typography,
  Chip,
  Select,
  Option,
  Button
} from "@material-tailwind/react";
import { WrenchScrewdriverIcon, CheckCircleIcon, ExclamationTriangleIcon, PlayIcon, PlusIcon, PencilIcon } from "@heroicons/react/24/solid";
import { useNavbarHeader } from "@/context/navbar-header";
import { getTickets, updateTicketStatus } from "@/api/ticket";
import { TicketModal } from "./ticket-modal";
import { showToast } from "@/lib/swal";
import { ImageThumbnail } from "@/components/image-lightbox";

export function Tickets() {
  const { setNavbarHeader } = useNavbarHeader();
  const [tickets, setTickets] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [filterStr, setFilterStr] = React.useState("");
  const [openModal, setOpenModal] = React.useState(false);
  const [editingTicket, setEditingTicket] = React.useState(null);
  const [page, setPage] = React.useState(1);
  const [size] = React.useState(8);
  const [totalElements, setTotalElements] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(0);

  // Khi filter thay đổi, reset về trang 1
  React.useEffect(() => {
    setPage(1);
  }, [filterStr]);

  React.useEffect(() => { loadTickets(); }, [filterStr, page]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const res = await getTickets({ page: page - 1, size: size, status: filterStr });
      setTickets(res.content || []);
      setTotalElements(res.totalElements || 0);
      setTotalPages(res.totalPages || 0);
    } catch (err) { showToast("Lỗi tải danh sách sự cố", "error"); }
    finally { setLoading(false); }
  };

  const handleStatusChange = async (id, newStatus) => {
    try { await updateTicketStatus(id, newStatus); showToast("Đã cập nhật tiến độ!", "success"); loadTickets(); }
    catch(err) { showToast(err.message, "error"); }
  };

  React.useEffect(() => {
    setNavbarHeader(
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 w-full">
        <div className="min-w-0">
          <Typography variant="h6" color="blue-gray" className="font-bold truncate">Quản lý Sự cố/Yêu cầu</Typography>
          <Typography color="gray" className="font-normal text-xs">Danh sách vấn đề từ cư dân và trạng thái xử lý</Typography>
        </div>
        <div className="flex shrink-0 gap-2 items-center">
          <div className="w-52">
            <Select label="Lọc trạng thái" size="md" value={filterStr} onChange={(val) => setFilterStr(val || "")} containerProps={{ className: "min-w-[0]" }}>
              <Option value="">Tất cả</Option>
              <Option value="PENDING">Mới báo (Đang chờ)</Option>
              <Option value="IN_PROGRESS">Đang sửa</Option>
              <Option value="RESOLVED">Đã xong</Option>
            </Select>
          </div>
          <Button variant="gradient" color="indigo" size="sm" className="flex items-center gap-2 whitespace-nowrap" onClick={() => setOpenModal(true)}>
            <PlusIcon strokeWidth={2.5} className="h-4 w-4" /> Báo sự cố
          </Button>
        </div>
      </div>
    );
  }, [filterStr, setNavbarHeader]);

  const getPriorityColor = (p) => { switch(p) { case "URGENT": return "red"; case "HIGH": return "orange"; case "MEDIUM": return "blue"; case "LOW": return "blue-gray"; default: return "gray"; } };
  const getStatusColor = (s) => { switch(s) { case "PENDING": return "orange"; case "IN_PROGRESS": return "blue"; case "RESOLVED": return "green"; default: return "gray"; } };
  const statusLabels = { "PENDING": "MỚI NHẬN", "IN_PROGRESS": "ĐANG SỬA", "RESOLVED": "HOÀN THÀNH" };
  const priorityLabels = { "URGENT": "KHẨN CẤP", "HIGH": "CAO", "MEDIUM": "TRUNG BÌNH", "LOW": "THẤP" };

  return (
    <div className="h-full flex flex-col">
      <Card className="h-full flex flex-col overflow-hidden">
        <CardBody className="overflow-auto p-0 flex-1">
          {loading ? (
            <div className="text-center p-6 text-gray-500">Đang tải...</div>
          ) : tickets.length === 0 ? (
            <div className="text-center p-6 text-gray-500">Khu trọ hiện rất ổn định. Không có sự cố nào.</div>
          ) : (
            <table className="w-full min-w-max table-auto text-left">
              <thead>
                <tr>
                  {["Ảnh", "Phòng", "Khách Báo", "Độ Ưu Tiên", "Tóm Tắt Sự Cố", "Thời gian Tạo", "Hoàn thành", "Trạng Thái", "Thao tác"].map((h) => (
                    <th key={h} className="border-b border-blue-gray-50 py-2 px-2">
                      <Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">{h}</Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t.id} className="even:bg-blue-gray-50/50">
                    <td className="px-2 py-3">
                      <ImageThumbnail images={t.imageUrls} alt={t.title || "Sự cố"} />
                    </td>
                    <td className="px-2 py-3"><Typography variant="small" className="font-bold text-blue-600">{t.roomNumber}</Typography></td>
                    <td className="px-2 py-3">
                      <div className="flex flex-col">
                        <Typography variant="small" className="font-medium text-gray-800">{t.residentName}</Typography>
                        <Typography variant="small" className="text-gray-500 text-[11px]">{t.residentPhone}</Typography>
                      </div>
                    </td>
                    <td className="px-2 py-3">
                      <div className="w-24">
                        <Chip size="sm" variant="ghost" color={getPriorityColor(t.priority)} value={priorityLabels[t.priority] || t.priority} className="text-center justify-center px-1" />
                      </div>
                    </td>
                    <td className="px-2 py-3 max-w-[180px]">
                      <Typography variant="small" className="font-bold text-gray-800 truncate" title={t.title}>{t.title}</Typography>
                      <Typography variant="small" className="text-gray-600 text-[11px] truncate" title={t.description}>{t.description}</Typography>
                    </td>
                    <td className="px-2 py-3">
                      {t.createdAt ? (
                        <div className="flex flex-col">
                          <Typography variant="small" className="text-blue-gray-800 font-medium">{new Date(t.createdAt).toLocaleDateString("vi-VN")}</Typography>
                          <Typography variant="small" className="text-gray-500 text-[11px]">{new Date(t.createdAt).toLocaleTimeString("vi-VN")}</Typography>
                        </div>
                      ) : "-"}
                    </td>
                    <td className="px-2 py-3">
                      {t.resolvedAt ? (
                        <div className="flex flex-col">
                          <Typography variant="small" className="text-blue-gray-800 font-medium">{new Date(t.resolvedAt).toLocaleDateString("vi-VN")}</Typography>
                          <Typography variant="small" className="text-gray-500 text-[11px]">{new Date(t.resolvedAt).toLocaleTimeString("vi-VN")}</Typography>
                        </div>
                      ) : "-"}
                    </td>
                    <td className="px-2 py-3">
                      <div className="w-24">
                        <Chip size="sm" variant="filled" color={getStatusColor(t.status)} value={statusLabels[t.status] || t.status} className="text-center justify-center px-1" />
                      </div>
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-28 flex items-center">
                          {t.status === "PENDING" && (<Button size="sm" variant="outlined" color="blue" className="flex items-center justify-center gap-1 w-full px-3 py-1.5" onClick={() => handleStatusChange(t.id, 'IN_PROGRESS')}><PlayIcon className="h-3 w-3" /> Gọi Thợ</Button>)}
                          {t.status === "IN_PROGRESS" && (<Button size="sm" color="green" className="flex items-center justify-center gap-1 w-full px-3 py-1.5" onClick={() => handleStatusChange(t.id, 'RESOLVED')}><CheckCircleIcon className="h-3 w-3" /> Chốt Xong</Button>)}
                          {t.status === "RESOLVED" && (<div className="text-sm text-gray-400 flex items-center justify-center gap-1 w-full"><CheckCircleIcon className="h-4 w-4" /> Hoàn thành</div>)}
                        </div>
                        <Button size="sm" variant="text" color="gray" className="px-2 py-1.5 shrink-0" onClick={() => { setEditingTicket(t); setOpenModal(true); }}>
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
        {!loading && tickets.length > 0 && (
          <div className="shrink-0 px-4 py-2 flex items-center justify-between border-t border-blue-gray-50 bg-blue-gray-50/20">
            <div className="flex items-center gap-4">
              <Typography variant="small" color="blue-gray" className="font-normal opacity-70">
                Hiển thị {tickets.length} / {totalElements} sự cố
              </Typography>
              <Typography variant="small" color="blue-gray" className="font-normal opacity-70">
                Trang {page} / {totalPages || 1}
              </Typography>
            </div>
            <div className="flex gap-2">
              <Button variant="outlined" color="blue-gray" size="sm" disabled={page <= 1 || loading} onClick={() => setPage(p => p - 1)}>
                Trước
              </Button>
              <Button variant="outlined" color="blue-gray" size="sm" disabled={page >= totalPages || loading} onClick={() => setPage(p => p + 1)}>
                Sau
              </Button>
            </div>
          </div>
        )}
      </Card>
      <TicketModal open={openModal} onClose={() => { setOpenModal(false); setEditingTicket(null); }} onSuccess={loadTickets} ticket={editingTicket} />
    </div>
  );
}

export default Tickets;
