import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Select,
  Option,
  Spinner,
} from "@material-tailwind/react";
import Chart from "react-apexcharts";
import { getRevenueReport } from "@/api/report";
import { useNavbarHeader } from "@/context/navbar-header";
import { showToast } from "@/lib/swal";

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

export function Reports() {
  const { setNavbarHeader } = useNavbarHeader();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  
  const [selectedMonth, setSelectedMonth] = useState(currentMonth.toString());
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());

  useEffect(() => {
    setNavbarHeader(
      <div>
        <Typography variant="h6" color="blue-gray" className="font-bold">
          Báo cáo doanh thu
        </Typography>
        <Typography color="gray" className="font-normal text-xs">
          Phân tích doanh thu và các khoản thu chi tiết
        </Typography>
      </div>
    );
  }, [setNavbarHeader]);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const data = await getRevenueReport({
          month: selectedMonth === "ALL" ? undefined : parseInt(selectedMonth),
          year: parseInt(selectedYear),
        });
        setReportData(data);
      } catch (error) {
        showToast("Không thể tải báo cáo doanh thu", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [selectedMonth, selectedYear]);

  // Translate BillType
  const getTypeLabel = (type) => {
    const map = {
      RENT: "Tiền phòng",
      ELECTRICITY: "Tiền điện",
      WATER: "Tiền nước",
      SERVICE: "Dịch vụ",
      PARKING: "Giữ xe",
      INTERNET: "Internet",
      CONTRIBUTION: "Đóng góp",
      OTHER: "Khác",
    };
    return map[type] || type;
  };

  const pieChartConfig = {
    type: "pie",
    height: 350,
    series: reportData?.revenueByType?.map(r => Number(r.amount)) || [],
    options: {
      labels: reportData?.revenueByType?.map(r => getTypeLabel(r.type)) || [],
      colors: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"],
      legend: {
        position: "bottom",
      },
      dataLabels: {
        enabled: true,
        formatter: (val) => `${val.toFixed(1)}%`
      },
      tooltip: {
        y: {
          formatter: (value) => value.toLocaleString("vi-VN") + " đ"
        }
      }
    },
  };

  const barChartConfig = {
    type: "bar",
    height: 350,
    series: [
      {
        name: "Doanh thu",
        data: reportData?.revenueByRoom?.slice(0, 10).map(r => Number(r.amount)) || [],
      },
    ],
    options: {
      chart: {
        toolbar: {
          show: false,
        },
      },
      title: {
        show: false,
      },
      dataLabels: {
        enabled: false,
      },
      colors: ["#3b82f6"],
      plotOptions: {
        bar: {
          columnWidth: "40%",
          borderRadius: 4,
        },
      },
      xaxis: {
        axisTicks: {
          show: false,
        },
        axisBorder: {
          show: false,
        },
        labels: {
          style: {
            colors: "#9ca3af",
            fontSize: "12px",
            fontFamily: "inherit",
            fontWeight: 400,
          },
        },
        categories: reportData?.revenueByRoom?.slice(0, 10).map(r => `P.${r.roomNumber}`) || [],
      },
      yaxis: {
        labels: {
          style: {
            colors: "#9ca3af",
            fontSize: "12px",
            fontFamily: "inherit",
            fontWeight: 400,
          },
          formatter: (value) => {
            if (value >= 1000000) return (value / 1000000).toFixed(1) + "M";
            if (value >= 1000) return (value / 1000).toFixed(0) + "k";
            return value;
          }
        },
      },
      grid: {
        show: true,
        borderColor: "#f3f4f6",
        strokeDashArray: 4,
        xaxis: {
          lines: {
            show: true,
          },
        },
      },
      tooltip: {
        y: {
          formatter: (value) => value.toLocaleString("vi-VN") + " đ"
        }
      }
    },
  };

  return (
    <div className="mt-6 flex flex-col gap-6">
      {/* FILTER PANEL */}
      <Card className="shadow-sm border border-blue-gray-50">
        <CardBody className="p-4 flex flex-wrap gap-4 items-center justify-between">
          <div>
            <Typography variant="h6" color="blue-gray" className="font-bold">
              Tổng doanh thu:{" "}
              {loading ? (
                <Spinner className="inline w-5 h-5 ml-2" />
              ) : (
                <span className="text-blue-600">
                  {reportData?.totalRevenue?.toLocaleString("vi-VN")} đ
                </span>
              )}
            </Typography>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-40">
              <Select
                label="Tháng"
                value={selectedMonth}
                onChange={(val) => setSelectedMonth(val)}
              >
                <Option value="ALL">Cả năm</Option>
                {[...Array(12).keys()].map(m => (
                  <Option key={m + 1} value={(m + 1).toString()}>Tháng {m + 1}</Option>
                ))}
              </Select>
            </div>
            <div className="w-32">
              <Select
                label="Năm"
                value={selectedYear}
                onChange={(val) => setSelectedYear(val)}
              >
                {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map(y => (
                  <Option key={y} value={y.toString()}>{y}</Option>
                ))}
              </Select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* CHARTS */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner className="h-10 w-10 text-indigo-500" />
        </div>
      ) : reportData?.totalRevenue === 0 || reportData?.totalRevenue === "0.00" ? (
        <Card className="shadow-sm border border-blue-gray-50 text-center py-20">
          <Typography color="blue-gray" className="text-xl font-bold opacity-50">
            Không có dữ liệu doanh thu trong thời gian này
          </Typography>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Pie Chart */}
          <Card className="shadow-sm border border-blue-gray-50">
            <CardHeader floated={false} shadow={false} color="transparent" className="m-0 p-5 pb-0">
              <Typography variant="h6" color="blue-gray" className="font-bold uppercase text-sm">
                Cơ cấu doanh thu
              </Typography>
            </CardHeader>
            <CardBody className="pt-0 pb-5 flex justify-center">
              <Chart {...pieChartConfig} width={400} />
            </CardBody>
          </Card>

          {/* Bar Chart */}
          <Card className="shadow-sm border border-blue-gray-50">
            <CardHeader floated={false} shadow={false} color="transparent" className="m-0 p-5 pb-0">
              <Typography variant="h6" color="blue-gray" className="font-bold uppercase text-sm">
                Top 10 phòng doanh thu cao nhất
              </Typography>
            </CardHeader>
            <CardBody className="pt-0 pb-5">
              <Chart {...barChartConfig} />
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}

export default Reports;
