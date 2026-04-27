import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Link, NavLink } from "react-router-dom";
import { XMarkIcon, ChevronDownIcon, CheckCircleIcon, ExclamationTriangleIcon, BellAlertIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import {
  ArrowRightOnRectangleIcon,
  BellIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/solid";
import {
  Avatar,
  Button,
  IconButton,
  Typography,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Badge,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
} from "@material-tailwind/react";
import { useMaterialTailwindController, setOpenSidenav } from "@/context";
import { useAuth } from "@/smartrent/auth";
import { env } from "@/config/env";
import { BuildingSelector } from "@/widgets/layout/building-selector";

function getAvatarSrc(avatarUrl) {
  if (!avatarUrl) return null;
  if (avatarUrl.startsWith("http")) return avatarUrl;
  const base = env.apiBaseUrl?.replace(/\/+$/, "");
  return base ? `${base}${avatarUrl}` : avatarUrl;
}

function formatTimeAgo(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return "Vài giây trước";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} giờ trước`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} ngày trước`;
}

import { getSystemUnreadCount, getSystemNotifications, markAllSystemAsRead } from "@/api/notification";
import { updateAutoBillingDay } from "@/api/tenant";
import { showToast } from "@/lib/swal";

export function Sidenav({ brandImg, brandName, routes }) {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavColor, sidenavType, openSidenav, darkMode } = controller;
  const { user, logout } = useAuth();
  const [openNotif, setOpenNotif] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  // Auto Billing Configuration State
  const [openBillingConfig, setOpenBillingConfig] = useState(false);
  const [billingDay, setBillingDay] = useState(1);
  const [billingError, setBillingError] = useState("");
  const [isSavingDay, setIsSavingDay] = useState(false);

  useEffect(() => {
    if (user?.role === "TENANT_MANAGER" || user?.role === "TENANT_STAFF") {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const data = await getSystemUnreadCount();
      setUnreadCount(data || 0);
    } catch (error) {
      console.error("Lỗi lấy số lượng thông báo:", error);
    }
  };

  const fetchNotifications = async () => {
    setLoadingNotifs(true);
    try {
      const data = await getSystemNotifications({ page: 0, size: 20 });
      setNotifications(data?.content || []);
    } catch (error) {
      console.error("Lỗi lấy danh sách thông báo:", error);
    } finally {
      setLoadingNotifs(false);
    }
  };

  const handleOpenNotif = () => {
    setOpenNotif(!openNotif);
    if (!openNotif) {
      fetchNotifications();
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllSystemAsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Lỗi mark read:", error);
    }
  };

  const handleOpenBillingConfig = () => {
    setOpenBillingConfig(!openBillingConfig);
    setBillingError("");
  };

  const handleBillingDayChange = (val) => {
    setBillingDay(val);
    const dayInt = parseInt(val);
    if (isNaN(dayInt) || dayInt < 1 || dayInt > 28) {
      setBillingError("Vui lòng nhập ngày từ 1 đến 28.");
      return;
    }

    const today = new Date().getDate();
    if (dayInt === today) {
      setBillingError("Job tự động của ngày hôm nay (00:00) đã trôi qua. Vui lòng chọn ngày khác (từ ngày mai).");
      return;
    }

    setBillingError("");
  };

  const handleSaveBillingDay = async () => {
    if (billingError) return;
    
    const dayInt = parseInt(billingDay);
    setIsSavingDay(true);
    try {
      await updateAutoBillingDay(dayInt);
      showToast("Đã lưu ngày chốt Hóa đơn", "success");
      setOpenBillingConfig(false);
    } catch (error) {
      showToast(error.message || "Lỗi khi lưu cấu hình", "error");
    } finally {
      setIsSavingDay(false);
    }
  };

  const sidenavTypes = {
    dark: "bg-gradient-to-br from-gray-800 to-gray-900 border-none",
    white: "bg-white shadow-sm border-blue-gray-100",
    transparent: "bg-transparent",
  };

  const activeSidenavType = darkMode ? "dark" : sidenavType;
  const isDark = activeSidenavType === "dark";
  const avatarSrc = getAvatarSrc(user?.avatarUrl);

  const handleLogout = async (e) => {
    e.preventDefault();
    try { await logout(); } catch (err) { console.error("Logout error:", err); }
  };

  return (
    <aside
      className={`${sidenavTypes[activeSidenavType]} ${
        openSidenav ? "translate-x-0" : "-translate-x-80"
      } fixed inset-0 z-50 my-2 ml-2 h-[calc(100vh-16px)] w-72 rounded-xl transition-transform duration-300 xl:translate-x-0 border overflow-y-auto flex flex-col`}
    >
      {/* ===== TOP: User Profile (replaces SmartRent brand) ===== */}
      <div className="relative shrink-0">
        <div className="px-4 h-[72px] flex items-center">
          <Menu placement="bottom-start">
            <MenuHandler>
              <button className="flex items-center gap-2.5 w-full rounded-lg hover:bg-white/10 transition-colors p-1.5 cursor-pointer">
                <Badge invisible={unreadCount === 0} content={unreadCount} color="red" overlap="circular" placement="top-end" className="min-w-[18px] min-h-[18px] text-[10px] border-2 border-white">
                  {avatarSrc ? (
                    <Avatar
                      src={avatarSrc}
                      alt={user?.fullName || user?.username || "User"}
                      size="md"
                      variant="circular"
                      className="ring-2 ring-indigo-400/60 shadow-md shadow-indigo-500/20 w-10 h-10 shrink-0"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold text-sm ring-2 ring-indigo-400/60 shadow-md shadow-indigo-500/20 shrink-0">
                      {(user?.fullName || user?.username || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                </Badge>
                <div className="min-w-0 flex-1 text-left ml-2">
                  <span className={`block text-[13px] font-bold truncate leading-tight ${isDark ? "text-white" : "text-blue-gray-800"}`}>
                    {user?.username || user?.fullName || "User"}
                  </span>
                  {user?.role && (
                    <span className={`block text-[11px] font-normal truncate leading-tight ${isDark ? "text-blue-gray-300" : "text-blue-gray-500"}`}>
                      {user.role}
                    </span>
                  )}
                </div>
                <ChevronDownIcon className={`h-3.5 w-3.5 shrink-0 ${isDark ? "text-blue-gray-300" : "text-blue-gray-400"}`} />
              </button>
            </MenuHandler>
            <MenuList className={isDark ? "bg-gray-800 border-gray-700 text-white" : ""}>
              <Link to="/dashboard/profile">
                <MenuItem className={`flex items-center gap-2 ${isDark ? "hover:bg-gray-700 focus:bg-gray-700" : ""}`}>
                  <UserCircleIcon className="h-4 w-4" />
                  <Typography variant="small">Hồ sơ</Typography>
                </MenuItem>
              </Link>
              <MenuItem onClick={handleOpenNotif} className={`flex items-center justify-between ${isDark ? "hover:bg-gray-700 focus:bg-gray-700" : ""}`}>
                <div className="flex items-center gap-2">
                  <BellIcon className="h-4 w-4" />
                  <Typography variant="small">Thông báo</Typography>
                </div>
                {unreadCount > 0 && (
                  <div className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</div>
                )}
              </MenuItem>
              <MenuItem className={`flex items-center gap-2 ${isDark ? "hover:bg-gray-700 focus:bg-gray-700" : ""}`}>
                <Cog6ToothIcon className="h-4 w-4" />
                <Typography variant="small">Cài đặt</Typography>
              </MenuItem>
              <MenuItem onClick={handleOpenBillingConfig} className={`flex items-center gap-2 ${isDark ? "hover:bg-gray-700 focus:bg-gray-700" : ""}`}>
                <CalendarDaysIcon className="h-4 w-4 text-indigo-400" />
                <Typography variant="small">Cấu hình Ngày chốt HĐ</Typography>
              </MenuItem>
              <hr className={`my-1.5 ${isDark ? "border-gray-700" : "border-blue-gray-100"}`} />
              <MenuItem onClick={handleLogout} className={`flex items-center gap-2 ${isDark ? "hover:bg-gray-700 focus:bg-gray-700" : ""}`}>
                <ArrowRightOnRectangleIcon className="h-4 w-4 text-red-500" />
                <Typography variant="small" color="red">Đăng xuất</Typography>
              </MenuItem>
            </MenuList>
          </Menu>
        </div>

        {/* ===== BUILDING SELECTOR ===== */}
        <div className="px-4 mb-3">
          <BuildingSelector />
        </div>

        <IconButton
          variant="text"
          color="white"
          size="sm"
          ripple={false}
          className="absolute right-0 top-0 grid rounded-br-none rounded-tl-none xl:hidden"
          onClick={() => setOpenSidenav(dispatch, false)}
        >
          <XMarkIcon strokeWidth={2.5} className="h-5 w-5 text-white" />
        </IconButton>
      </div>

      {/* Divider */}
      <div className={`mx-4 border-t ${isDark ? "border-white/10" : "border-blue-gray-100"}`} />

      {/* ===== NAV LINKS ===== */}
      <div className="m-4 flex-1 overflow-y-auto">
        {routes.filter(({ hidden }) => !hidden).map(({ layout, title, pages }, key) => (
          <ul key={key} className="mb-4 flex flex-col gap-1">
            {title && (
              <li className="mx-3.5 mt-4 mb-2">
                <Typography
                  variant="small"
                  color={isDark ? "white" : "blue-gray"}
                  className="font-black uppercase opacity-75"
                >
                  {title}
                </Typography>
              </li>
            )}
            {pages.filter(({ hidden, allowedRoles }) => !hidden && (!allowedRoles || allowedRoles.includes(user?.role))).map(({ icon, name, path }) => (
              <li key={name}>
                <NavLink to={`/${layout}${path}`}>
                  {({ isActive }) => (
                    <Button
                      variant={isActive ? "gradient" : "text"}
                      color={
                        isActive
                          ? "indigo"
                          : isDark
                          ? "white"
                          : "blue-gray"
                      }
                      className="flex items-center gap-4 px-4 capitalize"
                      fullWidth
                    >
                      {icon}
                      <Typography
                        color="inherit"
                        className="font-medium capitalize"
                      >
                        {name}
                      </Typography>
                    </Button>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        ))}
      </div>

      {/* ===== Notification Dialog ===== */}
      <Dialog open={openNotif} handler={handleOpenNotif} size="md">
        <DialogHeader className="flex items-center justify-between border-b border-blue-gray-50">
          <Typography variant="h5" color="blue-gray">
            Thông báo mới
          </Typography>
          <XMarkIcon className="h-5 w-5 cursor-pointer text-blue-gray-500" onClick={handleOpenNotif} />
        </DialogHeader>
        <DialogBody className="h-[400px] overflow-y-auto p-4 flex flex-col gap-2 bg-blue-gray-50/30">
          {loadingNotifs ? (
            <div className="text-center p-4 text-blue-gray-400">Đang tải...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center p-4 text-blue-gray-400">Không có thông báo nào.</div>
          ) : (
            notifications.map((notif) => {
              let Icon = InformationCircleIcon;
              let iconColor = "text-blue-500";
              let bgColor = "bg-blue-50";
              let hoverBorder = "hover:border-blue-500";

              if (notif.type === "SYSTEM_SUCCESS") {
                Icon = CheckCircleIcon;
                iconColor = "text-green-500";
                bgColor = "bg-green-50";
                hoverBorder = "hover:border-green-500";
              } else if (notif.type === "SYSTEM_WARNING") {
                Icon = ExclamationTriangleIcon;
                iconColor = "text-orange-500";
                bgColor = "bg-orange-50";
                hoverBorder = "hover:border-orange-500";
              } else if (notif.type === "SYSTEM_ERROR") {
                Icon = BellAlertIcon;
                iconColor = "text-red-500";
                bgColor = "bg-red-50";
                hoverBorder = "hover:border-red-500";
              }

              return (
                <div key={notif.id} className={`flex items-start gap-4 p-4 rounded-xl shadow-sm border transition-colors cursor-pointer ${notif.isRead ? 'bg-gray-50 border-transparent opacity-80' : `bg-white border-blue-gray-100 ${hoverBorder}`}`}>
                  <div className={`rounded-full ${bgColor} p-2 shrink-0`}>
                    <Icon className={`h-6 w-6 ${iconColor}`} />
                  </div>
                  <div className="flex flex-col gap-1 w-full">
                    <Typography variant="small" color="blue-gray" className={`text-sm ${notif.isRead ? 'font-medium' : 'font-bold'}`}>
                      {notif.title}
                    </Typography>
                    <Typography variant="small" className={`text-[13px] leading-relaxed ${notif.isRead ? 'text-gray-500 font-light' : 'text-gray-600 font-normal'}`}>
                      {notif.content}
                    </Typography>
                    <Typography variant="small" className="text-gray-400 text-[11px] mt-1 font-medium">
                      {formatTimeAgo(notif.createdAt)}
                    </Typography>
                  </div>
                </div>
              );
            })
          )}
        </DialogBody>
        <DialogFooter className="border-t border-blue-gray-50">
          <Button variant="text" color="blue" onClick={handleMarkAllRead} className="mr-1">
            Đánh dấu tất cả đã đọc
          </Button>
          <Button variant="gradient" color="blue-gray" onClick={handleOpenNotif}>
            Đóng
          </Button>
        </DialogFooter>
      </Dialog>

      {/* ===== Billing Config Dialog ===== */}
      <Dialog open={openBillingConfig} handler={handleOpenBillingConfig} size="sm">
        <DialogHeader className="border-b border-blue-gray-50">Cấu hình ngày tự động tạo Hóa Đơn</DialogHeader>
        <DialogBody className="p-6">
          <Typography variant="small" color="blue-gray" className="mb-4 font-normal text-gray-600">
            Hệ thống sẽ tự động quét các phòng và gom tiền (Phòng + Điện + Nước) để tạo thành Hóa Đơn vào lúc <b>00:00</b> của ngày bạn chọn.
          </Typography>
          <div className="flex flex-col gap-4">
            <Input 
              type="number" 
              label="Ngày (1-28)" 
              min={1} 
              max={28} 
              value={billingDay} 
              onChange={(e) => handleBillingDayChange(e.target.value)} 
              containerProps={{ className: "w-full" }}
              error={!!billingError}
            />
            <div className="flex flex-col gap-1">
              {billingError ? (
                <Typography variant="small" color="red" className="text-[13px] font-medium">
                  * {billingError}
                </Typography>
              ) : (
                <Typography variant="small" className="text-[12px] italic text-blue-gray-400">
                  * Chỉ chọn từ ngày 1 đến 28 để tránh lỗi vào tháng 2.
                </Typography>
              )}
            </div>
          </div>
        </DialogBody>
        <DialogFooter className="border-t border-blue-gray-50">
          <Button variant="text" color="gray" onClick={handleOpenBillingConfig} className="mr-2">
            Hủy
          </Button>
          <Button variant="gradient" color="indigo" onClick={handleSaveBillingDay} disabled={isSavingDay || !!billingError}>
            {isSavingDay ? "Đang lưu..." : "Lưu Cấu Hình"}
          </Button>
        </DialogFooter>
      </Dialog>
    </aside>
  );
}

Sidenav.defaultProps = {
  brandImg: "/img/logo-ct.png",
  brandName: "SmartRent",
};

Sidenav.propTypes = {
  brandImg: PropTypes.string,
  brandName: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

Sidenav.displayName = "/src/widgets/layout/sidenav.jsx";

export default Sidenav;
