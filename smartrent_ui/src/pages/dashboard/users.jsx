import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Input,
  IconButton,
  Chip,
} from "@material-tailwind/react";
import { MagnifyingGlassIcon, CheckCircleIcon, NoSymbolIcon, TrashIcon } from "@heroicons/react/24/solid";
import { getUsers, activateUser, deactivateUser, deleteUser } from "@/api/user";
import { showToast } from "@/lib/swal";
import Swal from "sweetalert2";

export function Users() {
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
      const response = await getUsers({
        page,
        size,
        search: searchTerm,
      });
      setUsersList(response.content || []);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (err) {
      console.error("Error loading users:", err);
      showToast(err.message || "Không thể tải danh sách tài khoản.", "error");
    } finally {
      setLoading(false);
    }
  }, [page, size, searchTerm]);

  React.useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleActivate = async (id) => {
    try {
      await activateUser(id);
      showToast("Kích hoạt tài khoản thành công", "success");
      loadUsers();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleDeactivate = async (id) => {
    try {
      await deactivateUser(id);
      showToast("Vô hiệu hóa tài khoản thành công", "success");
      loadUsers();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleDelete = async (id, username) => {
    const result = await Swal.fire({
      title: "Xác nhận xóa",
      text: `Bạn có chắc muốn xóa tài khoản ${username} vĩnh viễn?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        await deleteUser(id);
        showToast("Xóa tài khoản thành công", "success");
        loadUsers();
      } catch (err) {
        showToast(err.message, "error");
      }
    }
  };

  return (
    <div className="h-full flex flex-col">
      <Card className="h-full flex flex-col overflow-hidden">
        <CardHeader floated={false} shadow={false} className="rounded-none border-b border-blue-gray-100 shrink-0 px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <Typography variant="h5" color="blue-gray" className="font-bold">Quản lý Tài khoản</Typography>
              <Typography color="gray" className="mt-0.5 font-normal text-sm">
                Danh sách người dùng và nhân viên hệ thống
              </Typography>
            </div>
            <div className="w-full sm:w-64">
              <Input
                label="Tìm tên hoặc email..."
                icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(0);
                }}
              />
            </div>
          </div>
        </CardHeader>
        <CardBody className="overflow-auto p-0 flex-1">
          {loading ? (
            <div className="flex justify-center py-8"><Typography>Đang tải...</Typography></div>
          ) : usersList.length === 0 ? (
            <div className="flex justify-center py-8"><Typography>Không có dữ liệu</Typography></div>
          ) : (
            <>
              <table className="mt-4 w-full min-w-max table-auto text-left">
                <thead className="sticky top-0 z-20 bg-blue-gray-50 shadow-sm">
                  <tr>
                    {["Tài khoản", "Họ tên", "Vai trò", "Trạng thái", "Ngày tạo", "Thao tác"].map((head) => (
                      <th key={head} className="border-b border-blue-gray-100 bg-blue-gray-50 py-0.5 px-4">
                        <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                          {head}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((usr) => (
                    <tr key={usr.id} className="even:bg-blue-gray-50/50">
                      <td className="py-0.5 px-4">
                        <Typography variant="small" color="blue-gray" className="font-bold">
                          {usr.username}
                        </Typography>
                        <Typography variant="small" color="gray" className="font-normal">
                          {usr.email}
                        </Typography>
                      </td>
                      <td className="py-0.5 px-4"><Typography variant="small" color="blue-gray">{usr.fullName || "-"}</Typography></td>
                      <td className="py-0.5 px-4"><Typography variant="small" color="blue-gray" className="font-bold">{usr.role}</Typography></td>
                      <td className="py-0.5 px-4">
                        <Chip size="sm" variant="ghost" value={usr.status === "ACTIVE" ? "Hoạt động" : "Bị khóa"} color={usr.status === "ACTIVE" ? "green" : "red"} />
                      </td>
                      <td className="py-0.5 px-4"><Typography variant="small" color="gray">{new Date(usr.createdAt).toLocaleDateString("vi-VN")}</Typography></td>
                      <td className="py-0.5 px-4">
                        <div className="flex gap-2">
                          {usr.status === "ACTIVE" ? (
                            <IconButton variant="text" color="orange" title="Khóa TK" onClick={() => handleDeactivate(usr.id)}>
                              <NoSymbolIcon className="h-4 w-4" />
                            </IconButton>
                          ) : (
                            <IconButton variant="text" color="green" title="Mở khóa TK" onClick={() => handleActivate(usr.id)}>
                              <CheckCircleIcon className="h-4 w-4" />
                            </IconButton>
                          )}
                          <IconButton variant="text" color="red" title="Xóa" onClick={() => handleDelete(usr.id, usr.username)}>
                            <TrashIcon className="h-4 w-4" />
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-2 px-4 py-2 flex items-center justify-between border-t border-blue-gray-50 bg-blue-gray-50/20">
                <div className="flex items-center gap-4">
                  <Typography variant="small" color="blue-gray" className="font-normal opacity-70">
                    Hiển thị {usersList.length} trong {totalElements} kết quả
                  </Typography>
                  <Typography variant="small" color="blue-gray" className="font-normal opacity-70">
                    Trang {page + 1} / {totalPages || 1}
                  </Typography>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outlined"
                    color="blue-gray"
                    size="sm"
                    disabled={page === 0 || loading}
                    onClick={() => setPage(p => p - 1)}
                  >
                    Trước
                  </Button>
                  <Button
                    variant="outlined"
                    color="blue-gray"
                    size="sm"
                    disabled={page >= totalPages - 1 || loading}
                    onClick={() => setPage(p => p + 1)}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default Users;
