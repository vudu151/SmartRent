import {
  HomeIcon,
  UserCircleIcon,
  TableCellsIcon,
  InformationCircleIcon,
  ServerStackIcon,
  RectangleStackIcon,
  HeartIcon,
  BuildingOfficeIcon,
  BoltIcon,
  WrenchScrewdriverIcon,
  CalculatorIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/solid";
import { Home, Profile, Tables, Notifications, Health, Tenants, Rooms, Residents, Bills, Users, Contracts, Services, Tickets, MeterReading } from "@/pages/dashboard";
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
        name: "Tổng quan",
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
        icon: <UserCircleIcon {...icon} />,
        name: "Cư dân",
        path: "/residents",
        element: <Residents />,
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
        icon: <BoltIcon {...icon} />,
        name: "Dịch vụ",
        path: "/services",
        element: <Services />,
        hidden: true, // Ẩn vì trùng lặp với Điện nước - gộp vào trang Điện nước
      },
      {
        icon: <WrenchScrewdriverIcon {...icon} />,
        name: "Sự cố",
        path: "/tickets",
        element: <Tickets />,
        allowedRoles: ["SUPER_ADMIN", "TENANT_MANAGER", "GUARD"],
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
        icon: <TableCellsIcon {...icon} />,
        name: "tables",
        path: "/tables",
        element: <Tables />,
        hidden: true,
      },
      {
        icon: <InformationCircleIcon {...icon} />,
        name: "notifications",
        path: "/notifications",
        element: <Notifications />,
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
