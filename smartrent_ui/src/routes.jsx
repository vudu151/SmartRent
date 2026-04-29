import {
  HomeIcon,
  UserCircleIcon,
  InformationCircleIcon,
  ServerStackIcon,
  RectangleStackIcon,
  HeartIcon,
  BuildingOfficeIcon,
  BellAlertIcon,
  WrenchScrewdriverIcon,
  CalculatorIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  UsersIcon,
  TruckIcon,
} from "@heroicons/react/24/solid";
import { Home, Profile, Notifications, Health, Tenants, Rooms, Residents, Bills, Users, Contracts, Tickets, MeterReading, Vehicles } from "@/pages/dashboard";
import { RoomDetail } from "@/pages/dashboard/room-detail";
import { SignIn, SignUp, ForgotPassword } from "@/pages/auth";

const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    layout: "dashboard",
    pages: [
      // ===== SmartRent Core Features (hiển thị trên sidebar) =====
      {
        icon: <HomeIcon {...icon} />,
        name: "Dashboard",
        path: "/home",
        element: <Home />,
        allowedRoles: ["SUPER_ADMIN", "TENANT_MANAGER"],
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "Phòng trọ",
        path: "/rooms",
        element: <Rooms />,
        allowedRoles: ["SUPER_ADMIN", "TENANT_MANAGER"],
      },
      {
        icon: <CurrencyDollarIcon {...icon} />,
        name: "Hóa đơn",
        path: "/bills",
        element: <Bills />,
        allowedRoles: ["SUPER_ADMIN", "TENANT_MANAGER"],
      },
      {
        icon: <CalculatorIcon {...icon} />,
        name: "Điện nước",
        path: "/meter-readings",
        element: <MeterReading />,
        allowedRoles: ["SUPER_ADMIN", "TENANT_MANAGER"],
      },
      {
        icon: <TruckIcon {...icon} />,
        name: "Quản lý Xe",
        path: "/vehicles",
        element: <Vehicles />,
        allowedRoles: ["SUPER_ADMIN", "TENANT_MANAGER", "GUARD"],
      },
      {
        icon: <DocumentTextIcon {...icon} />,
        name: "Hợp đồng",
        path: "/contracts",
        element: <Contracts />,
        allowedRoles: ["SUPER_ADMIN", "TENANT_MANAGER"],
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "Cư dân",
        path: "/residents",
        element: <Residents />,
        allowedRoles: ["SUPER_ADMIN", "TENANT_MANAGER", "GUARD"],
      },
      {
        icon: <WrenchScrewdriverIcon {...icon} />,
        name: "Sự cố",
        path: "/tickets",
        element: <Tickets />,
        allowedRoles: ["SUPER_ADMIN", "TENANT_MANAGER", "GUARD"],
      },
      {
        icon: <BellAlertIcon {...icon} />,
        name: "Thông báo",
        path: "/notifications",
        element: <Notifications />,
        allowedRoles: ["SUPER_ADMIN", "TENANT_MANAGER"],
      },

      // ===== Quản trị hệ thống (hiển thị nhưng nhóm riêng) =====
      {
        icon: <UsersIcon {...icon} />,
        name: "Người dùng",
        path: "/users",
        element: <Users />,
        allowedRoles: ["SUPER_ADMIN", "TENANT_MANAGER"],
      },
      {
        icon: <BuildingOfficeIcon {...icon} />,
        name: "Chủ trọ",
        path: "/tenants",
        element: <Tenants />,
        allowedRoles: ["SUPER_ADMIN"],
      },

      // ===== Ẩn khỏi sidebar (vẫn truy cập được bằng URL) =====
      {
        icon: <HeartIcon {...icon} />,
        name: "backend health",
        path: "/health",
        element: <Health />,
        hidden: true,
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "profile",
        path: "/profile",
        element: <Profile />,
        hidden: true,
      },
      {
        name: "room-detail",
        path: "/rooms/:id",
        element: <RoomDetail />,
        hidden: true,
      },
    ],
  },
  {
    layout: "auth",
    hidden: true, // Ẩn toàn bộ nhóm Auth khỏi sidebar
    pages: [
      {
        icon: <ServerStackIcon {...icon} />,
        name: "sign in",
        path: "/sign-in",
        element: <SignIn />,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "sign up",
        path: "/sign-up",
        element: <SignUp />,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "forgot password",
        path: "/forgot-password",
        element: <ForgotPassword />,
      },
    ],
  },
];

export default routes;
