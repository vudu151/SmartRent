import React from "react";
import {
  IconButton,
  Badge,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Typography,
  Chip,
  Button,
} from "@material-tailwind/react";
import {
  Bars3Icon,
  BellIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/solid";
import {
  useMaterialTailwindController,
  setOpenSidenav,
} from "@/context";
import { useNavbarHeaderContent } from "@/context/navbar-header";
import { useNavigate } from "react-router-dom";
import { getSystemNotifications, getSystemUnreadCount, markAllSystemAsRead } from "@/api/notification";

export function DashboardNavbar() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { fixedNavbar, openSidenav, darkMode } = controller;
  const headerContent = useNavbarHeaderContent();
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = React.useState(0);
  const [notifications, setNotifications] = React.useState([]);
  const [loadingNotifs, setLoadingNotifs] = React.useState(false);

  // Poll unread count every 30s
  const loadUnreadCount = React.useCallback(async () => {
    try {
      const count = await getSystemUnreadCount();
      setUnreadCount(count || 0);
    } catch { /* silent */ }
  }, []);

  React.useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [loadUnreadCount]);

  // Load recent notifications when dropdown opens
  const handleMenuOpen = async () => {
    try {
      setLoadingNotifs(true);
      const res = await getSystemNotifications({ page: 0, size: 5 });
      setNotifications(res?.content || []);
    } catch { /* silent */ }
    finally { setLoadingNotifs(false); }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllSystemAsRead();
      setUnreadCount(0);
      loadUnreadCount();
    } catch { /* silent */ }
  };

  const getNotifColor = (type) => {
    switch (type) {
      case "BILL": return "orange";
      case "URGENT": return "red";
      case "MAINTENANCE": return "blue";
      default: return "blue-gray";
    }
  };

  const getNotifLabel = (type) => {
    switch (type) {
      case "BILL": return "Hóa đơn";
      case "URGENT": return "Khẩn cấp";
      case "MAINTENANCE": return "Bảo trì";
      default: return "Chung";
    }
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Vừa xong";
    if (mins < 60) return `${mins} phút trước`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} giờ trước`;
    const days = Math.floor(hrs / 24);
    return `${days} ngày trước`;
  };

  return (
    <div
      className={`shrink-0 min-h-[72px] py-2 flex items-center px-4 rounded-xl transition-all ${
        fixedNavbar
          ? "sticky top-2 z-40 shadow-md shadow-blue-gray-500/5"
          : ""
      } ${darkMode ? "bg-blue-gray-900" : fixedNavbar ? "bg-white border border-blue-gray-100" : "bg-transparent"}`}
    >
      {/* Mobile hamburger */}
      <IconButton
        variant="text"
        color="blue-gray"
        className="grid xl:hidden shrink-0 mr-3"
        onClick={() => setOpenSidenav(dispatch, !openSidenav)}
      >
        <Bars3Icon strokeWidth={3} className={`h-6 w-6 ${darkMode ? "text-white" : "text-blue-gray-500"}`} />
      </IconButton>

      {/* Full-width page header content */}
      <div className="navbar-controls flex-1 min-w-0">
        {headerContent || null}
      </div>

      {/* 🔔 Notification Bell */}
      <div className="shrink-0 ml-3">
        <Menu placement="bottom-end">
          <MenuHandler>
            <div className="relative cursor-pointer" onClick={handleMenuOpen}>
              <IconButton variant="text" color="blue-gray" className="rounded-full">
                <BellIcon className={`h-5 w-5 ${darkMode ? "text-white" : "text-blue-gray-500"}`} />
              </IconButton>
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold px-1 shadow-sm animate-pulse">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </div>
          </MenuHandler>
          <MenuList className="w-80 max-h-[400px] overflow-y-auto p-0">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-blue-gray-50">
              <Typography variant="small" className="font-bold text-blue-gray-800">
                Thông báo
              </Typography>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 text-[11px] text-indigo-500 hover:text-indigo-700 font-medium transition-colors"
                >
                  <CheckCircleIcon className="w-3.5 h-3.5" />
                  Đã đọc tất cả
                </button>
              )}
            </div>

            {/* List */}
            {loadingNotifs ? (
              <div className="py-6 text-center">
                <Typography variant="small" color="gray">Đang tải...</Typography>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center">
                <BellIcon className="w-8 h-8 text-blue-gray-200 mx-auto mb-2" />
                <Typography variant="small" color="gray">Không có thông báo mới</Typography>
              </div>
            ) : (
              notifications.map((notif) => (
                <MenuItem key={notif.id} className="flex flex-col gap-1 px-4 py-3 border-b border-blue-gray-50 last:border-0 hover:bg-indigo-50/50">
                  <div className="flex items-center gap-2">
                    <Chip size="sm" variant="ghost" value={getNotifLabel(notif.type)} color={getNotifColor(notif.type)} className="text-[9px] py-0 px-1.5" />
                    <Typography variant="small" className="text-[10px] text-blue-gray-400 ml-auto">
                      {timeAgo(notif.createdAt)}
                    </Typography>
                  </div>
                  <Typography variant="small" className="font-bold text-blue-gray-800 text-xs leading-tight line-clamp-1">
                    {notif.title}
                  </Typography>
                  <Typography variant="small" className="text-blue-gray-500 text-[11px] leading-tight line-clamp-2">
                    {notif.content}
                  </Typography>
                </MenuItem>
              ))
            )}

            {/* Footer */}
            <div className="border-t border-blue-gray-50 p-2">
              <Button
                variant="text"
                color="indigo"
                size="sm"
                fullWidth
                className="text-xs font-medium"
                onClick={() => navigate("/dashboard/notifications")}
              >
                Xem tất cả thông báo →
              </Button>
            </div>
          </MenuList>
        </Menu>
      </div>
    </div>
  );
}

DashboardNavbar.displayName = "/src/widgets/layout/dashboard-navbar.jsx";

export default DashboardNavbar;
