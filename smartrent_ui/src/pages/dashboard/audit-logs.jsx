import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  Typography,
  Chip,
} from "@material-tailwind/react";
import { getAuditLogs } from "@/api/audit";
import { showToast } from "@/lib/swal";
import { useNavbarHeader } from "@/context/navbar-header";

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const pad = (n) => n.toString().padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

export function AuditLogs() {
  const { setNavbarHeader } = useNavbarHeader();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setNavbarHeader(
      <div className="flex flex-col">
        <Typography variant="h5" color="blue-gray" className="font-bold">
          Lịch sử thao tác
        </Typography>
        <Typography color="gray" className="mt-0.5 font-normal text-sm">
          Theo dõi các thay đổi trên hệ thống
        </Typography>
      </div>
    );
    return () => setNavbarHeader(null);
  }, [setNavbarHeader]);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await getAuditLogs();
      setLogs(data);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'CREATE': return 'green';
      case 'UPDATE': return 'blue';
      case 'DELETE': return 'red';
      case 'LIQUIDATE': return 'orange';
      default: return 'gray';
    }
  };

  return (
    <div className="mt-8 mb-8 flex flex-col gap-8 h-[calc(100vh-140px)]">
      <Card className="h-full flex flex-col bg-white overflow-hidden">
        <CardBody className="overflow-auto px-0 pt-0 pb-2 h-full flex flex-col">
          {loading ? (
            <div className="flex justify-center items-center h-full text-gray-500">Đang tải lịch sử...</div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-full text-gray-500">
              <Typography variant="h6">Chưa có thao tác nào được ghi nhận</Typography>
            </div>
          ) : (
            <table className="w-full min-w-[400px] table-auto">
              <thead className="sticky top-0 bg-blue-gray-50/50 backdrop-blur-md z-10 border-b border-blue-gray-100">
                <tr>
                  <th className="py-3 px-5 text-left"><Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">Thời gian</Typography></th>
                  <th className="py-3 px-3 sm:px-5 text-left hidden sm:table-cell"><Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">Người dùng</Typography></th>
                  <th className="py-3 px-5 text-left"><Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">Thao tác</Typography></th>
                  <th className="py-3 px-5 text-left"><Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">Đối tượng</Typography></th>
                  <th className="py-3 px-3 sm:px-5 text-left hidden sm:table-cell"><Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">Chi tiết</Typography></th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-blue-gray-50 hover:bg-blue-gray-50/50 transition-colors">
                    <td className="py-3 px-5">
                      <Typography className="text-xs font-medium text-blue-gray-600">
                        {formatDate(log.timestamp)}
                      </Typography>
                    </td>
                    <td className="py-3 px-3 sm:px-5 hidden sm:table-cell">
                      <Typography className="text-sm font-semibold text-blue-gray-900">
                        {log.username}
                      </Typography>
                    </td>
                    <td className="py-3 px-5">
                      <Chip 
                        size="sm" 
                        variant="ghost" 
                        value={log.action} 
                        color={getActionColor(log.action)} 
                        className="w-max" 
                      />
                    </td>
                    <td className="py-3 px-5">
                      <Typography className="text-sm font-semibold text-blue-gray-900">
                        {log.entityName} {log.entityId ? `#${log.entityId}` : ''}
                      </Typography>
                    </td>
                    <td className="py-3 px-3 sm:px-5 hidden sm:table-cell">
                      <Typography className="text-xs font-normal text-blue-gray-500">
                        {log.details}
                      </Typography>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default AuditLogs;
