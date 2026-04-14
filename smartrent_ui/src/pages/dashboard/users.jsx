import React from "react";
import {
  Card,
  CardBody,
  Typography,
  Button,
  Input,
  IconButton,
  Chip,
} from "@material-tailwind/react";
import { MagnifyingGlassIcon, CheckCircleIcon, NoSymbolIcon, TrashIcon } from "@heroicons/react/24/solid";
import { useNavbarHeader } from "@/context/navbar-header";
import { getUsers, activateUser, deactivateUser, deleteUser } from "@/api/user";
import { showToast } from "@/lib/swal";
import Swal from "sweetalert2";

export function Users() {
  const { setNavbarHeader } = useNavbarHeader();
  const [usersList, setUsersList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [size, setSize] = React.useState(10);
  const [totalPages, setTotalPages] = React.useState(0);
  const [totalElements, setTotalElements] = React.useState(0);

  const loadUsers = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await getUsers({ page, size, search: searchTerm });
      setUsersList(response.content || []);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (err) {
      showToast(err.message || "Không thể tải danh sách tài khoản.", "error");
    } finally { setLoading(false); }
  }, [page, size, searchTerm]);

  React.useEffect(() => { loadUsers(); }, [loadUsers]);

  React.useEffect(() => {
    setNavbarHeader(
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 w-full">
        <div className="min-w-0">
          <Typography variant="h6" color="blue-gray" className="font-bold truncate">Quản lý Tài khoản</Typography>
          <Typography color="gray" className="font-normal text-xs">Danh sách người dùng và nhân viên hệ thống</Typography>
        </div>
        <div className="flex shrink-0 gap-2 items-center">
          <div className="w-52">
            <Input label="Tìm tên hoặc email..." size="md" icon={<MagnifyingGlassIcon className="h-4 w-4" />} value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }} containerProps={{ className: "!min-w-0" }} />
          </div>
        </div>
      </div>
    );
  }, [searchTerm, setNavbarHeader]);

  const handleActivate = async (id) => { try { await activateUser(id); showToast("Kích hoạt thành công", "success"); loadUsers(); } catch (err) { showToast(err.message, "error"); } };
  const handleDeactivate = async (id) => { try { await deactivateUser(id); showToast("Vô hiệu hóa thành công", "success"); loadUsers(); } catch (err) { showToast(err.message, "error"); } };
  const handleDelete = async (id, username) => {
    const result = await Swal.fire({ title: "Xác nhận xóa", text: `Xóa tài khoản ${username} vĩnh viễn?`, icon: "warning", showCancelButton: true, confirmButtonText: "Xóa", cancelButtonText: "Hủy" });
    if (result.isConfirmed) { try { await deleteUser(id); showToast("Xóa thành công", "success"); loadUsers(); } catch (err) { showToast(err.message, "error"); } }
  };

  return (
    <div className="h-full flex flex-col">
      <Card className="h-full flex flex-col overflow-hidden">
        <CardBody className="overflow-auto p-0 flex-1">
          {loading ? (
            <div className="flex justify-center py-8"><Typography>Đang tải...</Typography></div>
          ) : usersList.length === 0 ? (
            <div className="flex justify-center py-8"><Typography>Không có dữ liệu</Typography></div>
          ) : (
              <table className="w-full min-w-max table-auto text-left">
                <thead><tr>
                  {["Tài khoản", "Họ tên", "Vai trò", "Trạng thái", "Ngày tạo", "Thao tác"].map((h) => (
                    <th key={h} className="border-b border-blue-gray-50 py-3 px-5"><Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">{h}</Typography></th>
                  ))}
                </tr></thead>
                <tbody>
                  {usersList.map((usr, key) => {
                    const isLast = key === usersList.length - 1;
                    const className = `py-3 px-5 ${isLast ? "" : "border-b border-blue-gray-50"}`;
                    return (
                      <tr key={usr.id}>
                        <td className={className}>
                          <Typography variant="small" color="blue-gray" className="font-bold">{usr.username}</Typography>
                          <Typography className="text-xs font-normal text-blue-gray-500">{usr.email}</Typography>
                        </td>
                        <td className={className}><Typography variant="small" color="blue-gray">{usr.fullName || "-"}</Typography></td>
                        <td className={className}><Typography variant="small" color="blue-gray" className="font-bold">{usr.role}</Typography></td>
                        <td className={className}><Chip variant="gradient" size="sm" value={usr.status === "ACTIVE" ? "Hoạt động" : "Bị khóa"} color={usr.status === "ACTIVE" ? "green" : "red"} className="py-0.5 px-2 text-[11px] font-medium w-fit" /></td>
                        <td className={className}><Typography variant="small" color="blue-gray">{new Date(usr.createdAt).toLocaleDateString("vi-VN")}</Typography></td>
                        <td className={className}>
                          <div className="flex gap-2">
                            {usr.status === "ACTIVE" ? (
                              <IconButton variant="text" color="orange" title="Khóa TK" onClick={() => handleDeactivate(usr.id)}><NoSymbolIcon className="h-4 w-4 text-orange-500" /></IconButton>
                            ) : (
                              <IconButton variant="text" color="green" title="Mở khóa" onClick={() => handleActivate(usr.id)}><CheckCircleIcon className="h-4 w-4 text-green-500" /></IconButton>
                            )}
                            <IconButton variant="text" color="red" title="Xóa" onClick={() => handleDelete(usr.id, usr.username)}><TrashIcon className="h-4 w-4 text-red-500" /></IconButton>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
          )}
        </CardBody>
        {!loading && usersList.length > 0 && (
          <div className="shrink-0 px-4 py-2 flex items-center justify-between border-t border-blue-gray-50 bg-blue-gray-50/20">
            <div className="flex items-center gap-4">
              <Typography variant="small" color="blue-gray" className="font-normal opacity-70">Hiển thị {usersList.length} trong {totalElements}</Typography>
              <Typography variant="small" color="blue-gray" className="font-normal opacity-70">Trang {page + 1} / {totalPages || 1}</Typography>
            </div>
            <div className="flex gap-2">
              <Button variant="outlined" color="blue-gray" size="sm" disabled={page === 0 || loading} onClick={() => setPage(p => p - 1)}>Trước</Button>
              <Button variant="outlined" color="blue-gray" size="sm" disabled={page >= totalPages - 1 || loading} onClick={() => setPage(p => p + 1)}>Sau</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export default Users;
