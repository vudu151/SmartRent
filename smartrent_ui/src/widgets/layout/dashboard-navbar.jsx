import { useLocation, Link } from "react-router-dom";
import {
  Navbar,
  Typography,
  Button,
  IconButton,
  Breadcrumbs,
  Input,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Avatar,
} from "@material-tailwind/react";
import {
  UserCircleIcon,
  Cog6ToothIcon,
  BellIcon,
  ClockIcon,
  CreditCardIcon,
  Bars3Icon,
  ArrowRightOnRectangleIcon,
  SunIcon,
  MoonIcon,
} from "@heroicons/react/24/solid";
import {
  useMaterialTailwindController,
  setOpenConfigurator,
  setOpenSidenav,
  setDarkMode,
} from "@/context";
import { useAuth } from "@/smartrent/auth";

export function DashboardNavbar() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { fixedNavbar, openSidenav, darkMode } = controller;
  const { pathname } = useLocation();
  const [layout, page] = pathname.split("/").filter((el) => el !== "");
  const { user, logout, isLoading } = useAuth();

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <Navbar
      color={fixedNavbar ? (darkMode ? "blue-gray" : "white") : "transparent"}
      className={`rounded-xl transition-all ${
        fixedNavbar
          ? "sticky top-4 z-40 py-3 shadow-md shadow-blue-gray-500/5"
          : "px-0 py-1"
      } ${darkMode ? "bg-blue-gray-900 border-none" : ""}`}
      fullWidth
      blurred={fixedNavbar && !darkMode}
    >
      <div className="flex flex-col-reverse justify-between gap-6 md:flex-row md:items-center md:gap-4">
        <div className="capitalize">
          <Breadcrumbs
            className={`bg-transparent p-0 transition-all ${
              fixedNavbar ? "mt-1" : ""
            }`}
          >
            <Link to={`/${layout}`}>
              <Typography
                variant="small"
                color={darkMode ? "white" : "blue-gray"}
                className="font-normal opacity-50 transition-all hover:text-indigo-500 hover:opacity-100 dark:hover:text-indigo-400"
              >
                {layout}
              </Typography>
            </Link>
            <Typography
              variant="small"
              color={darkMode ? "white" : "blue-gray"}
              className="font-normal"
            >
              {page}
            </Typography>
          </Breadcrumbs>
          <Typography variant="h6" color={darkMode ? "white" : "blue-gray"}>
            {page}
          </Typography>
        </div>
        <div className="flex items-center">
          <IconButton
            variant="text"
            color="blue-gray"
            className="grid xl:hidden"
            onClick={() => setOpenSidenav(dispatch, !openSidenav)}
          >
            <Bars3Icon strokeWidth={3} className={`h-6 w-6 ${darkMode ? "text-white" : "text-blue-gray-500"}`} />
          </IconButton>
          
          {user ? (
            <Menu>
              <MenuHandler>
                <Button
                  variant="text"
                  color="blue-gray"
                  className="hidden items-center gap-2 px-4 xl:flex normal-case"
                >
                  <Avatar
                    src="/img/team-1.jpg"
                    alt={user.fullName || user.username}
                    size="sm"
                    variant="circular"
                  />
                  <div className="flex flex-col items-start text-left">
                    <Typography variant="small" className={`font-medium ${darkMode ? "text-white" : ""}`}>
                      {user.fullName || user.username}
                    </Typography>
                    <Typography variant="small" className={`text-xs ${darkMode ? "text-blue-gray-200" : "text-blue-gray-500"}`}>
                      {user.role}
                    </Typography>
                  </div>
                </Button>
              </MenuHandler>
              <MenuList className={darkMode ? "bg-blue-gray-900 border-blue-gray-800 text-white" : ""}>
                <Link to="/dashboard/profile">
                  <MenuItem className={darkMode ? "hover:bg-blue-gray-800 focus:bg-blue-gray-800" : ""}>
                    <div className="flex items-center gap-2">
                      <UserCircleIcon className="h-5 w-5" />
                      <Typography variant="small">Profile</Typography>
                    </div>
                  </MenuItem>
                </Link>
                <MenuItem className={darkMode ? "hover:bg-blue-gray-800 focus:bg-blue-gray-800" : ""}>
                  <div className="flex items-center gap-2">
                    <Cog6ToothIcon className="h-5 w-5" />
                    <Typography variant="small">Settings</Typography>
                  </div>
                </MenuItem>
                <hr className={`my-2 ${darkMode ? "border-blue-gray-800" : "border-blue-gray-200"}`} />
                <MenuItem onClick={handleLogout} className={darkMode ? "hover:bg-blue-gray-800 focus:bg-blue-gray-800" : ""}>
                  <div className="flex items-center gap-2 text-red-500">
                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                    <Typography variant="small">Logout</Typography>
                  </div>
                </MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <Link to="/auth/sign-in">
              <Button
                variant="text"
                color="blue-gray"
                className="hidden items-center gap-1 px-4 xl:flex normal-case"
              >
                <UserCircleIcon className={`h-5 w-5 ${darkMode ? "text-white" : "text-blue-gray-500"}`} />
                Sign In
              </Button>
            </Link>
          )}
          
          <IconButton
             variant="text"
             color="blue-gray"
             onClick={() => setDarkMode(dispatch, !darkMode)}
           >
             {darkMode ? (
               <SunIcon className="h-5 w-5 text-white" />
             ) : (
               <MoonIcon className="h-5 w-5 text-blue-gray-500" />
             )}
          </IconButton>

          <Menu>
            <MenuHandler>
              <IconButton variant="text" color="blue-gray">
                <BellIcon className={`h-5 w-5 ${darkMode ? "text-white" : "text-blue-gray-500"}`} />
              </IconButton>
            </MenuHandler>
            <MenuList className={darkMode ? "bg-blue-gray-900 border-blue-gray-800 text-white" : ""}>
              <MenuItem className={darkMode ? "hover:bg-blue-gray-800 focus:bg-blue-gray-800" : ""}>
                <div className="flex items-center gap-2">
                  <ClockIcon className="h-5 w-5" />
                  <Typography variant="small">Recent Activity</Typography>
                </div>
              </MenuItem>
              <MenuItem className={darkMode ? "hover:bg-blue-gray-800 focus:bg-blue-gray-800" : ""}>
                <div className="flex items-center gap-2">
                  <CreditCardIcon className="h-5 w-5" />
                  <Typography variant="small">Billing</Typography>
                </div>
              </MenuItem>
            </MenuList>
          </Menu>
          <IconButton
            variant="text"
            color="blue-gray"
            onClick={() => setOpenConfigurator(dispatch, true)}
          >
            <Cog6ToothIcon className={`h-5 w-5 ${darkMode ? "text-white" : "text-blue-gray-500"}`} />
          </IconButton>
        </div>
      </div>
    </Navbar>
  );
}

DashboardNavbar.displayName = "/src/widgets/layout/dashboard-navbar.jsx";

export default DashboardNavbar;
