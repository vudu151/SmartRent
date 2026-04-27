import React from "react";
import {
  Card,
  CardBody,
  Typography,
  Button,
  Input,
  IconButton,
  Chip,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Select,
  Option,
} from "@material-tailwind/react";
import { MagnifyingGlassIcon, CheckCircleIcon, NoSymbolIcon, TrashIcon, UserPlusIcon } from "@heroicons/react/24/solid";
import { useNavbarHeader } from "@/context/navbar-header";
import { getUsers, activateUser, deactivateUser, deleteUser, createUser } from "@/api/user";
import { useAuth } from "@/smartrent/auth";
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

  const { user } = useAuth();
  const [openModal, setOpenModal] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [formData, setFormData] = React.useState({ username: "", email: "", fullName: "", phone: "", password: "", role: "" });

  const getSelectedBuildingId = () => localStorage.getItem("selectedBuildingId");
  const [buildingId, setBuildingId] = React.useState(getSelectedBuildingId);

  React.useEffect(() => {
    const handleStorageChange = () => setBuildingId(getSelectedBuildingId());
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleOpenModal = () => setOpenModal(!openModal);

  const loadUsers = React.useCallback(async () => {
    if (!buildingId || searchTerm.trim().length === 1) return; // Wait until a building is selected and search term is not 1 char
    try {
      setLoading(true);
      const response = await getUsers({ page, size, search: searchTerm, buildingId });
      setUsersList(response.content || []);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (err) {
      showToast(err.message || "Không thể tải danh sách tài khoản.", "error");
    } finally { setLoading(false); }
  }, [page, size, searchTerm, buildingId]);

  React.useEffect(() => { loadUsers(); }, [loadUsers]);

  React.useEffect(() => {
    setNavbarHeader(
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 w-full">
        <div className="min-w-0">
          <Typography variant="h6" color="blue-gray" className="font-bold truncate">Quản lý Tài khoản</Typography>
          <Typography color="gray" className="font-normal text-xs">Danh sách người dùng và nhân viên hệ thống</Typography>
        </div>
        <div className="flex shrink-0 gap-2 items-center">
          <input
            type="text"
            placeholder="Tìm tên hoặc email (>=2 ký tự)..."
            className="text-sm border border-blue-gray-200 rounded-lg px-3 py-1.5 w-64 bg-white text-blue-gray-700 focus:outline-none focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
          />
          <Button variant="gradient" color="indigo" size="sm" className="flex items-center gap-2 h-10 px-4 whitespace-nowrap" onClick={() => setOpenModal(true)}>
            <UserPlusIcon className="h-4 w-4" /> Thêm Tài Khoản
          </Button>
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

  const handleCreateUser = async () => {
    try {
      setSaving(true);
      await createUser({ ...formData, buildingId });
      showToast("Tạo tài khoản thành công!", "success");
      setOpenModal(false);
      setFormData({ username: "", email: "", fullName: "", phone: "", password: "", role: "" });
      loadUsers();
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
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
                          <td className={className}><Typography variant="small" color="blue-gray" className="font-bold">
                            {usr.role === "SUPER_ADMIN" ? "Quản trị viên" : 
                             usr.role === "TENANT_MANAGER" ? "Chủ trọ" : 
                             usr.role === "GUARD" ? "Bảo vệ" : 
                             usr.role === "TENANT" ? "Cư dân" : usr.role}
                          </Typography></td>
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
                <Typography variant="small" color="blue-gray" className="font-normal opacity-70">Hiển thị {usersList.length} / {totalElements} người dùng</Typography>
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
      <Dialog open={openModal} handler={handleOpenModal} size="sm">
        <DialogHeader><Typography variant="h5" color="blue-gray">Thêm Tài Khoản Mới</Typography></DialogHeader>
        <DialogBody divider className="flex flex-col gap-4">
          <Input label="Tên đăng nhập *" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
          <Input label="Mật khẩu *" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
          <Input label="Email *" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          <Input label="Họ và tên" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
          <Input label="Số điện thoại" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
          
          <Select label="Vai trò *" value={formData.role} onChange={(val) => setFormData({ ...formData, role: val })}>
            {[
              user?.role === "SUPER_ADMIN" ? <Option key="tenant_mgr" value="TENANT_MANAGER">Chủ Trọ</Option> : null,
              <Option key="guard" value="GUARD">Bảo vệ</Option>,
              <Option key="resident" value="TENANT">Cư dân</Option>
            ].filter(Boolean)}
          </Select>
        </DialogBody>
        <DialogFooter>
          <Button variant="text" color="red" onClick={handleOpenModal} className="mr-1">Hủy</Button>
          <Button variant="gradient" color="gray" onClick={handleCreateUser} disabled={saving || !formData.username || !formData.password || !formData.email || !formData.role}>
            {saving ? "Đang lưu..." : "Xác nhận"}
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}

export default Users;
