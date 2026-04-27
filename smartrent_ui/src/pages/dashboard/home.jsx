import React from "react";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  Chip,
  Select,
  Option,
} from "@material-tailwind/react";
import { 
  BuildingOfficeIcon, 
  BanknotesIcon, 
  ExclamationTriangleIcon, 
  CalendarDaysIcon,
  CheckBadgeIcon
} from "@heroicons/react/24/solid";
import { StatisticsCard } from "@/widgets/cards";
import { StatisticsChart } from "@/widgets/charts";
import { getDashboardSummary } from "@/api/dashboard";
import { useNavbarHeader } from "@/context/navbar-header";

export function Home() {
  const { setNavbarHeader } = useNavbarHeader();
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState(null);
  const [months, setMonths] = React.useState(6); // Default 6 months

  React.useEffect(() => {
    setNavbarHeader(
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 w-full">
        <div className="min-w-0">
          <Typography variant="h6" color="blue-gray" className="font-bold truncate">Tổng quan Dự án</Typography>
          <Typography color="gray" className="font-normal text-xs">Báo cáo tổng hợp hoạt động kinh doanh</Typography>
        </div>
        <div className="flex shrink-0 gap-2 items-center">
          <div className="w-48 shrink-0 bg-white rounded-lg">
            <Select 
              label="Thời gian" 
              className="!min-w-0"
              value={months.toString()} 
              onChange={(val) => setMonths(Number(val))}
              containerProps={{ className: "!min-w-0" }}
            >
              <Option value="3">3 tháng gần đây</Option>
              <Option value="6">6 tháng gần đây</Option>
              <Option value="12">1 năm</Option>
              <Option value="24">2 năm</Option>
            </Select>
          </div>
        </div>
      </div>
    );
  }, [setNavbarHeader, months]);

  const loadDashboard = React.useCallback(async () => {
    try {
      setLoading(true);
      const summary = await getDashboardSummary(months);
      const chronologicalChartData = [...(summary?.chartData || [])];
      
      setData({
        ...summary,
        chartData: chronologicalChartData
      });
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  }, [months]);

  React.useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading && !data) {
    return <div className="p-8 text-center"><Typography>Đang tải dữ liệu báo cáo...</Typography></div>;
  }

  const { summary, chartData, recentTransactions } = data;

  // Chart configs
  const revSeries = chartData?.map(d => d.revenue) || [];
  const debtSeries = chartData?.map(d => d.debt) || [];
  const categories = chartData?.map(d => d.month) || [];

  const revenueChartConfig = {
    type: "bar",
    height: 280,
    series: [
      { name: "Doanh thu", data: revSeries },
    ],
    options: {
      chart: { toolbar: { show: false } },
      title: { show: false },
      dataLabels: { enabled: false },
      colors: ["#fff"],
      plotOptions: { bar: { columnWidth: "16%", borderRadius: 5 } },
      xaxis: {
        axisTicks: { show: false },
        axisBorder: { show: false },
        labels: { style: { colors: "#fff", fontSize: "12px", fontFamily: "inherit", fontWeight: 400 } },
        categories: categories,
      },
      yaxis: { labels: { style: { colors: "#fff", fontSize: "12px", fontFamily: "inherit", fontWeight: 400 } } },
      grid: {
        show: true,
        borderColor: "#ffffff40",
        strokeDashArray: 5,
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: true } },
      },
    },
  };

  const debtChartConfig = {
    type: "line",
    height: 280,
    series: [
      { name: "Dư nợ", data: debtSeries },
    ],
    options: {
      chart: { toolbar: { show: false } },
      title: { show: false },
      dataLabels: { enabled: false },
      colors: ["#fff"],
      stroke: { lineCap: "round", curve: "smooth" },
      markers: { size: 0 },
      xaxis: {
        axisTicks: { show: false },
        axisBorder: { show: false },
        labels: { style: { colors: "#fff", fontSize: "12px", fontFamily: "inherit", fontWeight: 400 } },
        categories: categories,
      },
      yaxis: { labels: { style: { colors: "#fff", fontSize: "12px", fontFamily: "inherit", fontWeight: 400 } } },
      grid: {
        show: true,
        borderColor: "#ffffff40",
        strokeDashArray: 5,
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: true } },
      },
    },
  };

  return (
    <div className="mt-4 pb-8">

      <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4">
        <StatisticsCard
          title="Tỷ lệ Lấp đầy"
          icon={<BuildingOfficeIcon className="w-6 h-6 text-white" />}
          value={`${summary?.occupiedRooms || 0} / ${summary?.totalRooms || 0} Phòng`}
          color="blue"
          footer={<Typography className="font-normal text-blue-gray-600">Còn trống {summary?.vacantRooms} phòng</Typography>}
        />
        <StatisticsCard
          title="Doanh thu Tháng này"
          icon={<BanknotesIcon className="w-6 h-6 text-white" />}
          value={`${(summary?.currentMonthRevenue || 0).toLocaleString()} ₫`}
          color="green"
          footer={<Typography className="font-normal text-blue-gray-600">Tổng hóa đơn đã thu</Typography>}
        />
        <StatisticsCard
          title="Tổng Dư nợ"
          icon={<ExclamationTriangleIcon className="w-6 h-6 text-white" />}
          value={`${(summary?.totalDebt || 0).toLocaleString()} ₫`}
          color="red"
          footer={<Typography className="font-normal text-blue-gray-600">Cần đốc thúc thu hồi</Typography>}
        />
        <StatisticsCard
          title="Hợp đồng Sắp hết hạn"
          icon={<CalendarDaysIcon className="w-6 h-6 text-white" />}
          value={summary?.expiringContracts || 0}
          color="orange"
          footer={<Typography className="font-normal text-blue-gray-600">Trong vòng 30 ngày tới</Typography>}
        />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-y-12 gap-x-6 md:grid-cols-2">
        <StatisticsChart
          color="blue"
          chart={revenueChartConfig}
          title={`Tiến trình Doanh thu (${months} tháng)`}
          description="Biến động tổng tiền thu được qua từng tháng"
        />
        <StatisticsChart
          color="red"
          chart={debtChartConfig}
          title={`Biểu đồ Dư nợ (${months} tháng)`}
          description="Tình trạng nợ đọng chưa thanh toán cần lưu ý"
        />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-6">
        <Card className="overflow-hidden border border-blue-gray-100 shadow-sm">
          <CardHeader floated={false} shadow={false} color="transparent" className="m-0 p-6 flex justify-between items-center">
            <div>
              <Typography variant="h6" color="blue-gray" className="mb-1">Giao dịch Gần nhất</Typography>
              <Typography variant="small" className="flex items-center gap-1 font-normal text-blue-gray-600">
                <CheckBadgeIcon strokeWidth={3} className="h-4 w-4 text-green-500" />
                <strong>{recentTransactions?.length || 0}</strong> hóa đơn mới được thanh toán
              </Typography>
            </div>
          </CardHeader>
          <CardBody className="overflow-x-auto px-0 pt-0 pb-2">
            <table className="w-full min-w-[640px] table-auto">
              <thead>
                <tr>
                  {["Phòng", "Loại phí", "Số tiền (VNĐ)", "Thời gian TT", "Tham chiếu"].map((el) => (
                    <th key={el} className="border-b border-blue-gray-50 py-3 px-6 text-left">
                      <Typography variant="small" className="text-[11px] font-medium uppercase text-blue-gray-400">
                        {el}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentTransactions?.map(({ billId, roomNumber, billType, amount, paymentDate, paymentReference }, key) => {
                  const className = `py-3 px-6 ${key === recentTransactions.length - 1 ? "" : "border-b border-blue-gray-50"}`;
                  return (
                    <tr key={billId}>
                      <td className={className}>
                        <Typography variant="small" color="blue-gray" className="font-bold">{roomNumber}</Typography>
                      </td>
                      <td className={className}>
                        <Chip size="sm" variant="ghost" color="blue" value={billType === "OTHER" ? "TỔNG HỢP" : billType} />
                      </td>
                      <td className={className}>
                        <Typography variant="small" color="green" className="font-bold">+{amount?.toLocaleString()}</Typography>
                      </td>
                      <td className={className}>
                        <Typography variant="small" className="text-xs font-medium text-blue-gray-600">
                          {new Date(paymentDate).toLocaleString("vi-VN")}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Typography variant="small" className="text-xs font-medium text-blue-gray-600">
                          {paymentReference || "-"}
                        </Typography>
                      </td>
                    </tr>
                  );
                })}
                {recentTransactions?.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-8">
                      <Typography>Chưa có giao dịch nào được ghi nhận</Typography>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default Home;
