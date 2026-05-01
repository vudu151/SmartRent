import { Routes, Route } from "react-router-dom";
import { Cog6ToothIcon } from "@heroicons/react/24/solid";
import { IconButton } from "@material-tailwind/react";
import {
  Sidenav,
  DashboardNavbar,
  Configurator,
  Footer,
} from "@/widgets/layout";
import routes from "@/routes";
import { useMaterialTailwindController, setOpenConfigurator, setOpenSidenav } from "@/context";
import { NavbarHeaderProvider } from "@/context/navbar-header";
import { useAuth } from "@/smartrent/auth";

export function Dashboard() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavType } = controller;
  const { user } = useAuth();

  return (
    <NavbarHeaderProvider>
      <div className="h-screen overflow-hidden bg-blue-gray-50/50">
        <Sidenav
          routes={routes}
          brandImg={
            sidenavType === "dark" ? "/img/logo-ct.png" : "/img/logo-ct-dark.png"
          }
        />
        <div className="p-2 md:p-4 xl:ml-[304px] h-screen flex flex-col">
          <DashboardNavbar />
          <Configurator />
          <IconButton
            size="lg"
            color="white"
            className="fixed bottom-8 right-8 z-40 rounded-full shadow-blue-gray-900/10"
            ripple={false}
            onClick={() => setOpenConfigurator(dispatch, true)}
          >
            <Cog6ToothIcon className="h-5 w-5" />
          </IconButton>



          {/* Mobile overlay backdrop */}
          <div
            className={`fixed inset-0 z-40 bg-black/50 xl:hidden transition-opacity duration-300 ${
              controller.openSidenav ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
            onClick={() => setOpenSidenav(dispatch, false)}
          />

          <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 mt-2 pr-1">
            <Routes>
              {routes.map(
                ({ layout, pages }) =>
                  layout === "dashboard" &&
                  pages.map(({ path, element, allowedRoles }) => {
                    if (allowedRoles && !allowedRoles.includes(user?.role)) {
                      return null; // or return a Not Authorized component
                    }
                    return <Route key={path} exact path={path} element={element} />;
                  })
              )}
            </Routes>
          </div>

        </div>
      </div>
    </NavbarHeaderProvider>
  );
}

Dashboard.displayName = "/src/layout/dashboard.jsx";

export default Dashboard;
