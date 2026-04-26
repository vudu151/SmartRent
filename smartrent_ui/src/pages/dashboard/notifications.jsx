import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import { EyeIcon } from "@heroicons/react/24/solid";
import { getNotifications } from "@/api/notification";
import { useNavbarHeader } from "@/context/navbar-header";

export function Notifications() {
  const { setNavbarHeader } = useNavbarHeader();
  const [notifications, setNotifications] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalElements, setTotalElements] = React.useState(0);
  
  const [selectedNotif, setSelectedNotif] = React.useState(null);
  const [detailOpen, setDetailOpen] = React.useState(false);

  React.useEffect(() => {
    setNavbarHeader(
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 w-full">
        <div className="min-w-0">
          <Typography variant="h6" color="blue-gray" className="font-bold truncate">Trung tâm Thông báo</Typography>
          <Typography color="gray" className="font-normal text-xs">Quản lý và theo dõi các thông báo gửi đến cư dân</Typography>
        </div>
      </div>
    );
  }, [setNavbarHeader]);

  const loadNotifications = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await getNotifications({
        page: page - 1,
        size: 10,
      });
      setNotifications(response.content || []);
      setTotalPages(response.totalPages || 1);
      setTotalElements(response.totalElements || 0);
    } catch (err) {
      console.error("Error loading notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  React.useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleViewDetail = (notif) => {
    setSelectedNotif(notif);
    setDetailOpen(true);
  };

  const getNotifTypeColor = (type) => {
    switch (type) {
      case "BILL": return "orange";
      case "URGENT": return "red";
      case "MAINTENANCE": return "blue";
      default: return "blue-gray";
    }
  };

  const getNotifTypeLabel = (type) => {
    switch (type) {
      case "BILL": return "Hóa đơn";
      case "URGENT": return "Khẩn cấp";
      case "MAINTENANCE": return "Bảo trì";
      default: return "Chung";
    }
  };

  return (
    <div className="h-full flex flex-col mt-4">
      <Card className="h-full flex flex-col overflow-hidden border border-blue-gray-100 shadow-sm">
        <CardBody className="overflow-auto p-0 flex-1">
          {loading ? (
            <div className="flex justify-center py-8"><Typography>Đang tải...</Typography></div>
          ) : notifications.length === 0 ? (
            <div className="flex justify-center py-8"><Typography>Không có thông báo nào</Typography></div>
          ) : (
              <table className="w-full min-w-max table-auto text-left">
                <thead>
                  <tr>
                    {["Loại", "Tiêu đề", "Người gửi", "Ngày gửi", "Thao tác"].map((head) => (
                      <th key={head} className="border-b border-blue-gray-100 bg-blue-gray-50 py-0.5 px-4">
                        <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                          {head}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {notifications.map((notif) => (
                    <tr key={notif.id} className="even:bg-blue-gray-50/50">
                      <td className="py-0.5 px-4">
                        <Chip size="sm" variant="ghost" value={getNotifTypeLabel(notif.type)} color={getNotifTypeColor(notif.type)} />
                      </td>
                      <td className="py-0.5 px-4">
                        <Typography variant="small" color="blue-gray" className="font-bold max-w-[400px] truncate">
                          {notif.title}
                        </Typography>
                      </td>
                      <td className="py-0.5 px-4"><Typography variant="small" color="blue-gray">{notif.senderName}</Typography></td>
                      <td className="py-0.5 px-4"><Typography variant="small" color="blue-gray">{new Date(notif.createdAt).toLocaleString("vi-VN")}</Typography></td>
                      <td className="py-0.5 px-4">
                        <IconButton size="sm" variant="text" color="blue-gray" onClick={() => handleViewDetail(notif)}>
                          <EyeIcon className="h-5 w-5" />
                        </IconButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          )}
        </CardBody>
        {!loading && notifications.length > 0 && (
          <div className="shrink-0 px-4 py-2 flex items-center justify-between border-t border-blue-gray-50 bg-blue-gray-50/20">
            <div className="flex items-center gap-4">
              <Typography variant="small" color="blue-gray" className="font-normal opacity-70">
                Hiển thị {notifications.length} trong {totalElements} thông báo
              </Typography>
              <Typography variant="small" color="blue-gray" className="font-normal opacity-70">
                Trang {page} / {totalPages || 1}
              </Typography>
            </div>
            <div className="flex gap-2">
              <Button variant="outlined" color="blue-gray" size="sm" disabled={page <= 1 || loading} onClick={() => setPage(p => p - 1)}>Trước</Button>
              <Button variant="outlined" color="blue-gray" size="sm" disabled={page >= totalPages || loading} onClick={() => setPage(p => p + 1)}>Sau</Button>
            </div>
          </div>
        )}
      </Card>

      <Dialog open={detailOpen} handler={setDetailOpen} size="md">
        <DialogHeader>{selectedNotif?.title}</DialogHeader>
        <DialogBody divider className="whitespace-pre-wrap max-h-[60vh] overflow-y-auto">
          {selectedNotif?.content}
        </DialogBody>
        <DialogFooter>
          <Button variant="gradient" onClick={() => setDetailOpen(false)}>Đóng</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default Notifications;
