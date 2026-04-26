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
import { WrenchScrewdriverIcon, CheckCircleIcon, ExclamationTriangleIcon, PlayIcon, PlusIcon } from "@heroicons/react/24/solid";
import { useNavbarHeader } from "@/context/navbar-header";
import { getTickets, updateTicketStatus } from "@/api/ticket";
import { TicketModal } from "./ticket-modal";
import { showToast } from "@/lib/swal";

export function Tickets() {
  const { setNavbarHeader } = useNavbarHeader();
  const [tickets, setTickets] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [filterStr, setFilterStr] = React.useState("");
  const [openModal, setOpenModal] = React.useState(false);

  React.useEffect(() => { loadTickets(); }, [filterStr]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const res = await getTickets({ page: 0, size: 50, status: filterStr });
      setTickets(res.content || []);
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
                  {["Phòng", "Khách Báo", "Độ Ưu Tiên", "Tóm Tắt Sự Cố", "Trạng Thái", "Thao tác Nhanh"].map((h) => (
                    <th key={h} className="border-b border-blue-gray-50 py-3 px-5">
                      <Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">{h}</Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t.id} className="even:bg-blue-gray-50/50">
                    <td className="p-4"><Typography variant="small" className="font-bold text-blue-600">{t.roomNumber}</Typography></td>
                    <td className="p-4 flex flex-col">
                      <Typography variant="small" className="font-medium text-gray-800">{t.residentName}</Typography>
                      <Typography variant="small" className="text-gray-500 text-xs">{t.residentPhone}</Typography>
                    </td>
                    <td className="p-4"><Chip size="sm" variant="ghost" color={getPriorityColor(t.priority)} value={t.priority} /></td>
                    <td className="p-4 max-w-xs">
                      <Typography variant="small" className="font-bold text-gray-800">{t.title}</Typography>
                      <Typography variant="small" className="text-gray-600 text-xs truncate max-w-[200px]" title={t.description}>{t.description}</Typography>
                    </td>
                    <td className="p-4"><Chip size="sm" variant="filled" color={getStatusColor(t.status)} value={statusLabels[t.status] || t.status} /></td>
                    <td className="p-4">
                      {t.status === "PENDING" && (<Button size="sm" variant="outlined" color="blue" className="flex items-center gap-1 px-3 py-1.5" onClick={() => handleStatusChange(t.id, 'IN_PROGRESS')}><PlayIcon className="h-3 w-3" /> Gọi Thợ</Button>)}
                      {t.status === "IN_PROGRESS" && (<Button size="sm" color="green" className="flex items-center gap-1 px-3 py-1.5" onClick={() => handleStatusChange(t.id, 'RESOLVED')}><CheckCircleIcon className="h-3 w-3" /> Chốt Xong</Button>)}
                      {t.status === "RESOLVED" && (<div className="text-xs text-gray-400 flex items-center gap-1"><CheckCircleIcon className="h-4 w-4" /> Đã hoàn thành</div>)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
      <TicketModal open={openModal} onClose={() => setOpenModal(false)} onSuccess={loadTickets} />
    </div>
  );
}

export default Tickets;
