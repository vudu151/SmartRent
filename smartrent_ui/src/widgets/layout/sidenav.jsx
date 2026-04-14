import PropTypes from "prop-types";
import { Link, NavLink } from "react-router-dom";
import { XMarkIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import {
  ArrowRightOnRectangleIcon,
  BellIcon,
  Cog6ToothIcon,
  UserCircleIcon,
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
} from "@material-tailwind/react";
import { useMaterialTailwindController, setOpenSidenav } from "@/context";
import { useAuth } from "@/smartrent/auth";
import { env } from "@/config/env";

function getAvatarSrc(avatarUrl) {
  if (!avatarUrl) return null;
  if (avatarUrl.startsWith("http")) return avatarUrl;
  const base = env.apiBaseUrl?.replace(/\/+$/, "");
  return base ? `${base}${avatarUrl}` : avatarUrl;
}

export function Sidenav({ brandImg, brandName, routes }) {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavColor, sidenavType, openSidenav, darkMode } = controller;
  const { user, logout } = useAuth();

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
                <div className="min-w-0 flex-1 text-left">
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
              <MenuItem className={`flex items-center gap-2 ${isDark ? "hover:bg-gray-700 focus:bg-gray-700" : ""}`}>
                <BellIcon className="h-4 w-4" />
                <Typography variant="small">Thông báo</Typography>
              </MenuItem>
              <MenuItem className={`flex items-center gap-2 ${isDark ? "hover:bg-gray-700 focus:bg-gray-700" : ""}`}>
                <Cog6ToothIcon className="h-4 w-4" />
                <Typography variant="small">Cài đặt</Typography>
              </MenuItem>
              <hr className={`my-1.5 ${isDark ? "border-gray-700" : "border-blue-gray-100"}`} />
              <MenuItem onClick={handleLogout} className={`flex items-center gap-2 ${isDark ? "hover:bg-gray-700 focus:bg-gray-700" : ""}`}>
                <ArrowRightOnRectangleIcon className="h-4 w-4 text-red-500" />
                <Typography variant="small" color="red">Đăng xuất</Typography>
              </MenuItem>
            </MenuList>
          </Menu>
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
            {pages.filter(({ hidden }) => !hidden).map(({ icon, name, path }) => (
              <li key={name}>
                <NavLink to={`/${layout}${path}`}>
                  {({ isActive }) => (
                    <Button
                      variant={isActive ? "gradient" : "text"}
                      color={
                        isActive
                          ? sidenavColor
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
