import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  CardBody,
  Typography,
  Button,
  Alert,
  Chip,
  Dialog, DialogHeader, DialogBody, DialogFooter, Input, Textarea, Select, Option
} from "@material-tailwind/react";
import { getPortalContractInfo, notifyPortalPayment, getPortalTickets, createPortalTicket, getPortalAssets } from "@/api/portal";
import { WrenchScrewdriverIcon, ShieldExclamationIcon, ArchiveBoxIcon } from "@heroicons/react/24/solid";
import { showToast } from "@/lib/swal";


export default function PortalPage() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notified, setNotified] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [assets, setAssets] = useState([]);
  const [openTicketModal, setOpenTicketModal] = useState(false);
  const [ticketForm, setTicketForm] = useState({ title: "", description: "", priority: "MEDIUM" });

  useEffect(() => {
    loadData();
    loadTickets();
    loadAssets();
  }, [token]);

  const loadAssets = async () => {
    try {
        const res = await getPortalAssets(token);
        setAssets(res || []);
    } catch(e) {
        console.error(e);
    }
  }

  const loadTickets = async () => {
    try {
      const res = await getPortalTickets(token);
      setTickets(res || []);
    } catch (e) {
      console.error(e);
    }
  }

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getPortalContractInfo(token);
      setData(res);
    } catch (err) {
      setError(err.message || "Đường dẫn không hợp lệ hoặc đã nạp lại. Vui lòng liên hệ Chủ trọ.");
    } finally {
      setLoading(false);
    }
  };

  const handleNotifyPayment = async () => {
    try {
      await notifyPortalPayment(token);
      setNotified(true);
    } catch (err) {
      showToast(err.message || "Không thể gửi thông báo", "error");
    }
  };

  const handleTicketSubmit = async () => {
    if(!ticketForm.title) {
        showToast("Vui lòng nhập tóm tắt sự cố", "warning");
        return;
    }
    try {
      await createPortalTicket(token, ticketForm);
      setOpenTicketModal(false);
      setTicketForm({ title: "", description: "", priority: "MEDIUM" });
      loadTickets(); // Refresh
      showToast("Đã gửi yêu cầu hỗ trợ thành công. Chủ trọ sẽ sớm liên hệ!", "success");
    } catch(err) {
      showToast(err.message || "Có lỗi xảy ra", "error");
    }
  }

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-gray-50 text-blue-gray-500 font-medium">Đang tải biểu giá...</div>;
  if (error) return <div className="p-6 h-screen bg-gray-50"><Alert color="red" className="font-medium text-center">{error}</Alert></div>;

  const { roomNumber, resident, contract, bankInfo, unpaidBills, totalUnpaidAmount } = data;

  // Generate VietQR URL if Bank Info is fully setup
  // Format: https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-<TEMPLATE>.png?amount=<AMOUNT>&addInfo=<DESCRIPTION>&accountName=<ACCOUNT_NAME>
  const hasBankConfig = bankInfo.bankName && bankInfo.bankAccount;
  const qrUrl = hasBankConfig ? 
      `https://img.vietqr.io/image/${bankInfo.bankName.trim()}-${bankInfo.bankAccount.trim()}-print.png?amount=${totalUnpaidAmount}&addInfo=Thanh toan phong ${roomNumber}&accountName=${encodeURIComponent(bankInfo.bankOwner || "CHỦ TRỌ")}` 
      : null;

  return (
    <div className="min-h-screen bg-blue-gray-50 p-4 font-sans text-blue-gray-900 pb-12">
      {/* HEADER */}
      <div className="text-center mb-6 pt-4">
        <Typography variant="h3" color="blue" className="font-bold">SmartRent Portal</Typography>
        <Typography variant="small" className="text-gray-500 mt-1">Cổng thanh toán tự động</Typography>
      </div>

      <div className="max-w-md mx-auto flex flex-col gap-4">
        {/* ROOM & RESIDENT INFO */}
        <Card className="shadow-sm">
          <CardBody className="p-4 flex flex-col gap-2">
            <div className="flex justify-between items-center border-b pb-2 mb-2 border-gray-100">
              <Typography variant="small" className="text-gray-500 font-medium">Tên Phòng</Typography>
              <Typography variant="large" color="blue" className="font-bold text-xl">{roomNumber}</Typography>
            </div>
            <div className="flex justify-between">
              <Typography variant="small" className="text-gray-500">Khách thuê đại diện</Typography>
              <Typography variant="small" className="font-bold">{resident.fullName}</Typography>
            </div>
            <div className="flex justify-between">
              <Typography variant="small" className="text-gray-500">Tiền phòng cơ sở</Typography>
              <Typography variant="small" className="font-bold">{contract.monthlyRent?.toLocaleString()} đ</Typography>
            </div>
          </CardBody>
        </Card>

        {/* UNPAID BILLS LIST */}
        <Card className="shadow-sm">
          <CardBody className="p-4 flex flex-col gap-3">
            <Typography variant="h6" className="font-bold text-gray-800 border-b pb-2">Hóa Đơn Còn Nợ</Typography>
            {unpaidBills.length === 0 ? (
              <Alert color="green">Mọi hóa đơn của bạn đều đã được thanh toán.</Alert>
            ) : (
              <div className="flex flex-col gap-4">
                {unpaidBills.map((bill) => (
                  <div key={bill.billId} className="flex flex-col gap-1 rounded bg-gray-50 p-3">
                    <div className="flex justify-between items-start">
                      <Typography variant="small" className="font-bold text-gray-800">{bill.title}</Typography>
                      <Typography variant="small" color="red" className="font-bold">{(bill.amount || 0).toLocaleString()} đ</Typography>
                    </div>
                    {bill.description && (
                      <div className="text-xs text-gray-600 whitespace-pre-wrap mt-1">
                        {bill.description}
                      </div>
                    )}
                    <div className="flex justify-between mt-2 items-center">
                      <Typography variant="small" className="text-xs text-gray-500">Hạn: {new Date(bill.dueDate).toLocaleDateString()}</Typography>
                      <Chip value="CHƯA ĐÓNG" size="sm" color="red" variant="ghost" />
                    </div>
                  </div>
                ))}
                
                <div className="flex justify-between items-center bg-blue-50 p-3 rounded mt-2 border border-blue-100">
                  <Typography variant="small" className="font-bold text-blue-900">TỔNG CẦN ĐÓNG:</Typography>
                  <Typography variant="large" className="font-bold text-red-600 text-xl">{totalUnpaidAmount?.toLocaleString()} ₫</Typography>
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* PAYMENT SECTION - QR CODE */}
        {totalUnpaidAmount > 0 && (
          <Card className="shadow-sm">
            <CardBody className="p-4 flex flex-col items-center gap-4 text-center">
              <Typography variant="h6" className="font-bold text-gray-800">Thanh Toán Bằng QR Code</Typography>
              
              {!hasBankConfig ? (
                <Alert color="orange">Chủ trọ chưa cấu hình Ngân hàng để hiển thị mã QR. Vui lòng liên hệ trực tiếp.</Alert>
              ) : (
                <>
                  <Typography variant="small" className="text-gray-600 max-w-[250px]">
                    Mở ứng dụng Ngân hàng trên điện thoại (Momo, VCB, MB...) và quét mã sau:
                  </Typography>
                  
                  <div className="border-[3px] border-blue-500 rounded-xl p-2 w-64 h-auto shadow-md">
                    <img src={qrUrl} alt="VietQR" className="w-full h-auto rounded-lg" />
                  </div>

                  <div className="bg-gray-50 w-full p-3 rounded text-left border">
                    <div className="flex justify-between mb-1"><span className="text-xs text-gray-500">Ngân hàng:</span><span className="text-sm font-bold">{bankInfo.bankName}</span></div>
                    <div className="flex justify-between mb-1"><span className="text-xs text-gray-500">Chủ thẻ:</span><span className="text-sm font-bold">{bankInfo.bankOwner}</span></div>
                    <div className="flex justify-between"><span className="text-xs text-gray-500">Số TK:</span><span className="text-sm font-bold tracking-widest text-blue-600">{bankInfo.bankAccount}</span></div>
                  </div>
                  
                  {notified ? (
                    <Alert color="green" className="w-full mt-2">Cảm ơn bạn! Hệ thống đã ghi nhận phản hồi và gửi thông báo cho Chủ trọ.</Alert>
                  ) : (
                    <Button variant="gradient" color="blue" fullWidth className="mt-2 text-sm h-12" onClick={handleNotifyPayment}>
                      ✔ Tôi Đã Thanh Toán
                    </Button>
                  )}
                </>
              )}
            </CardBody>
          </Card>
        )}

        {/* ROOM ASSETS SECTION */}
        <Card className="shadow-sm border-t-4 border-blue-400">
           <CardBody className="p-4 flex flex-col gap-3">
            <Typography variant="h6" className="font-bold text-gray-800 flex items-center gap-2 border-b pb-2">
               <ArchiveBoxIcon className="w-5 h-5 text-blue-500" /> Tài Sản Bàn Giao
            </Typography>
            
            {assets.length === 0 ? (
               <Typography variant="small" className="text-gray-500 text-sm mt-1">
                 Chưa có thông tin trang thiết bị trong phòng.
               </Typography>
            ) : (
                <div className="flex flex-col gap-2 mt-1">
                  {assets.map(a => (
                    <div key={a.id} className="flex justify-between items-center bg-white p-2 border-b border-gray-100 last:border-0">
                      <div>
                        <Typography variant="small" className="font-bold">{a.name}</Typography>
                        <Typography variant="small" className="text-xs text-gray-500 italic">Tình trạng: {a.condition || "Tốt"}</Typography>
                      </div>
                      <Typography variant="small" className="font-bold px-2 py-0.5 bg-gray-100 rounded">x{a.quantity}</Typography>
                    </div>
                  ))}
                  <Typography variant="small" className="text-[10px] text-gray-400 mt-2 text-center">
                    * Vui lòng bảo quản tài sản. Nếu có hư hại sẽ tính chi phí theo biểu giá quy định.
                  </Typography>
                </div>
            )}
           </CardBody>
        </Card>

        {/* TICKETING SECTION */}
        <Card className="shadow-sm mt-4 border-t-4 border-orange-500">
          <CardBody className="p-4 flex flex-col gap-3">
            <div className="flex justify-between items-center border-b pb-2">
              <Typography variant="h6" className="font-bold text-gray-800 flex items-center gap-2">
                <WrenchScrewdriverIcon className="w-5 h-5 text-orange-500" /> Hỗ Trợ Kỹ Thuật
              </Typography>
              <Button size="sm" color="orange" variant="outlined" onClick={() => setOpenTicketModal(true)}>
                + Báo Lỗi
              </Button>
            </div>
            
            {tickets.length === 0 ? (
               <Typography variant="small" className="text-gray-500 text-sm mt-2 text-center">
                 Chưa có yêu cầu hỗ trợ nào gần đây.
               </Typography>
            ) : (
                <div className="flex flex-col gap-3 mt-2">
                  {tickets.map(t => (
                    <div key={t.id} className="bg-white border rounded p-3 text-sm flex justify-between items-start">
                      <div>
                        <div className="font-bold">{t.title}</div>
                        <div className="text-xs text-gray-500 mt-1">{new Date(t.createdAt).toLocaleDateString()}</div>
                      </div>
                      <Chip 
                         size="sm" 
                         variant="ghost" 
                         color={t.status === "PENDING" ? "orange" : t.status === "IN_PROGRESS" ? "blue" : "green"} 
                         value={t.status === "PENDING" ? "CHỜ XỬ LÝ" : t.status === "IN_PROGRESS" ? "ĐANG SỬA" : "ĐÃ XONG"} 
                      />
                    </div>
                  ))}
                </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* TICKET SUBMISSION MODAL */}
      <Dialog open={openTicketModal} handler={() => setOpenTicketModal(false)} className="mx-2 max-w-sm w-full">
        <DialogHeader className="text-xl text-orange-600 flex gap-2"><ShieldExclamationIcon className="w-6 h-6"/> Báo Cáo Sự Cố</DialogHeader>
        <DialogBody divider className="flex flex-col gap-4">
          <Typography variant="small" className="text-gray-600">
            Hệ thống ống nước, bóng đèn hay thiết bị trong phòng gặp vấn đề? Hãy báo ngay để chúng tôi khắc phục nhé!
          </Typography>
          <Input 
            label="Tóm tắt sự cố (VD: Bóng đèn nhà Vệ sinh hỏng)" 
            value={ticketForm.title}
            onChange={(e) => setTicketForm({...ticketForm, title: e.target.value})}
          />
          <Textarea 
            label="Mô tả chi tiết hơn (Tuỳ chọn)" 
            value={ticketForm.description}
            onChange={(e) => setTicketForm({...ticketForm, description: e.target.value})}
          />
        </DialogBody>
        <DialogFooter>
          <Button variant="text" color="gray" onClick={() => setOpenTicketModal(false)} className="mr-2">Hủy</Button>
          <Button variant="gradient" color="orange" onClick={handleTicketSubmit}>Gửi Yêu Cầu</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
