import {
  IconButton,
} from "@material-tailwind/react";
import {
  Bars3Icon,
} from "@heroicons/react/24/solid";
import {
  useMaterialTailwindController,
  setOpenSidenav,
} from "@/context";
import { useNavbarHeaderContent } from "@/context/navbar-header";

export function DashboardNavbar() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { fixedNavbar, openSidenav, darkMode } = controller;
  const headerContent = useNavbarHeaderContent();

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
    </div>
  );
}

DashboardNavbar.displayName = "/src/widgets/layout/dashboard-navbar.jsx";

export default DashboardNavbar;
