import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Chip,
  Select,
  Option,
  Button
} from "@material-tailwind/react";
import { WrenchScrewdriverIcon, CheckCircleIcon, ExclamationTriangleIcon, PlayIcon } from "@heroicons/react/24/solid";
import { getTickets, updateTicketStatus } from "@/api/ticket";
import { showToast } from "@/lib/swal";

export function Tickets() {
  const [tickets, setTickets] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [filterStr, setFilterStr] = React.useState("");

  React.useEffect(() => {
    loadTickets();
  }, [filterStr]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const res = await getTickets({ page: 0, size: 50, status: filterStr });
      setTickets(res.content || []);
    } catch (err) {
      showToast("Lỗi tải danh sách sự cố", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateTicketStatus(id, newStatus);
      showToast("Đã cập nhật tiến độ!", "success");
      loadTickets(); // Reload
    } catch(err) {
      showToast(err.message, "error");
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "URGENT": return "red";
      case "HIGH": return "orange";
      case "MEDIUM": return "blue";
      case "LOW": return "blue-gray";
      default: return "gray";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING": return "orange";
      case "IN_PROGRESS": return "blue";
      case "RESOLVED": return "green";
      default: return "gray";
    }
  };

  const statusLabels = {
    "PENDING": "MỚI NHẬN",
    "IN_PROGRESS": "ĐANG SỬA",
    "RESOLVED": "HOÀN THÀNH"
  };

  return (
    <div className="mt-4 mb-8 flex flex-col gap-4">
      <Card>
        <CardHeader floated={false} shadow={false} className="rounded-none">
          <div className="flex items-center justify-between gap-8 mb-4">
            <div>
              <Typography variant="h5" color="blue-gray">Quản lý Sự Cố</Typography>
              <Typography color="gray" className="mt-1 font-normal">
                Theo dõi tất cả yêu cầu báo hỏng và bảo trì từ khách thuê
              </Typography>
            </div>
            
            <div className="w-56">
              <Select label="Lọc trạng thái" value={filterStr} onChange={(val) => setFilterStr(val || "")}>
                <Option value="">Tất cả</Option>
                <Option value="PENDING">Mới báo (Đang chờ)</Option>
                <Option value="IN_PROGRESS">Đang sửa</Option>
                <Option value="RESOLVED">Đã xong</Option>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardBody className="overflow-x-auto p-0">
          {loading ? (
            <div className="text-center p-6 text-gray-500">Đang tải biểu dữ liệu...</div>
          ) : tickets.length === 0 ? (
            <div className="text-center p-6 text-gray-500">Khu trọ hiện rất ổn định. Không có sự cố nào.</div>
          ) : (
            <table className="w-full min-w-max table-auto text-left">
              <thead>
                <tr>
                  {["Phòng", "Khách Báo", "Độ Ưu Tiên", "Tóm Tắt Sự Cố", "Trạng Thái", "Thao tác Nhanh"].map((h) => (
                    <th key={h} className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                      <Typography variant="small" color="blue-gray" className="font-bold opacity-70">{h}</Typography>
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
                    <td className="p-4">
                      <Chip size="sm" variant="ghost" color={getPriorityColor(t.priority)} value={t.priority} />
                    </td>
                    <td className="p-4 max-w-xs">
                      <Typography variant="small" className="font-bold text-gray-800">{t.title}</Typography>
                      <Typography variant="small" className="text-gray-600 text-xs truncate max-w-[200px]" title={t.description}>{t.description}</Typography>
                    </td>
                    <td className="p-4">
                      <Chip size="sm" variant="filled" color={getStatusColor(t.status)} value={statusLabels[t.status] || t.status} />
                    </td>
                    <td className="p-4">
                      {t.status === "PENDING" && (
                         <Button size="sm" variant="outlined" color="blue" className="flex items-center gap-1 px-3 py-1.5" onClick={() => handleStatusChange(t.id, 'IN_PROGRESS')}>
                           <PlayIcon className="h-3 w-3" /> Gọi Thợ
                         </Button>
                      )}
                      {t.status === "IN_PROGRESS" && (
                         <Button size="sm" color="green" className="flex items-center gap-1 px-3 py-1.5" onClick={() => handleStatusChange(t.id, 'RESOLVED')}>
                           <CheckCircleIcon className="h-3 w-3" /> Chốt Xong
                         </Button>
                      )}
                      {t.status === "RESOLVED" && (
                          <div className="text-xs text-gray-400 flex items-center gap-1">
                            <CheckCircleIcon className="h-4 w-4" /> Đã hoàn thành
                          </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default Tickets;
