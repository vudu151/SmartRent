import PptxGenJS from 'pptxgenjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_16x9';

// CSS Colors
const colors = {
    primary: '4F46E5', // Indigo 600
    text: '1F2937',    // Gray 800
    white: 'FFFFFF',
};

// Define Master Slide
pptx.defineSlideMaster({
    title: 'MASTER_SLIDE',
    background: { color: 'F3F4F6' },
    objects: [
        { rect: { x: 0, y: 0, w: '100%', h: 0.8, fill: { color: colors.primary } } },
        { text: { text: 'SmartRent - Quản lý trọ', options: { x: 0.2, y: 0.1, w: 5, h: 0.5, color: 'FFFFFF', fontSize: 18, bold: true } } },
        { text: { text: '', options: { x: '90%', y: 0.1, w: 1, h: 0.5, color: 'FFFFFF', fontSize: 14 } } }
    ],
    slideNumber: { x: '95%', y: '95%', color: '6B7280', fontSize: 12 }
});

// Helper
const addTitle = (slide, text) => {
    slide.addText(text, { x: 0.5, y: 1.2, w: '90%', h: 0.8, fontSize: 32, bold: true, color: '111827' });
};
const addBullets = (slide, bullets, yOffset = 2.2) => {
    slide.addText(bullets.map(b => ({ text: b.text, options: { bullet: b.level ? { type: 'number' } : true, indentLevel: b.level || 0 } })), 
    { x: 0.5, y: yOffset, w: '90%', h: 4, fontSize: 24, color: '4B5563', lineSpacing: 32 });
};
const addScreenshot = (slide, filename, title) => {
    slide.addText(title, { x: 0.5, y: 1.2, w: '90%', h: 0.8, fontSize: 32, bold: true, color: '111827' });
    try {
        slide.addImage({ path: path.join(__dirname, filename), x: 1, y: 2.2, w: 8, h: 4.5 });
    } catch {
        slide.addText('(Ảnh: ' + filename + ')', { x: 2, y: 3, w: 6, h: 2, fill: 'E5E7EB', align: 'center', color: '9CA3AF' });
    }
}

// Slide 1
let slide = pptx.addSlide();
slide.background = { color: colors.primary };
slide.addText('HỆ THỐNG QUẢN LÝ NHÀ TRỌ', { x: 1, y: 2.5, w: '80%', h: 1, fontSize: 36, bold: true, color: 'FFFFFF', align: 'center' });
slide.addText('SMARTRENT', { x: 1, y: 3.5, w: '80%', h: 1, fontSize: 54, bold: true, color: 'FBBF24', align: 'center' });
slide.addText('Sinh viên: Vũ Xuân Dự', { x: 1, y: 5.5, w: '80%', h: 0.5, fontSize: 24, color: 'FFFFFF', align: 'center' });

// Slide 2
slide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
addTitle(slide, 'Đặt vấn đề & Mục tiêu');
addBullets(slide, [
    { text: 'Thực trạng quản lý thủ công (ghi sổ, excel) dễ sai sót' },
    { text: 'Thiếu kênh tương tác liên tục giữa chủ trọ và người thuê' },
    { text: 'Tính toán dư nợ, điện nước phức tạp, mất thời gian' },
    { text: 'Mục tiêu: Số hóa quy trình quản lý bằng ứng dụng Web' },
    { text: 'Giải pháp: SmartRent Multi-tenant PMS (Property Mgt System)' }
]);

// Slide 3
slide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
addTitle(slide, 'Phạm vi & Tính năng Hệ thống');
addBullets(slide, [
    { text: 'Quản lý Không gian: Tòa nhà, Căn hộ, Tầng, Loại phòng' },
    { text: 'Quản lý Cư dân: Hồ sơ, Định danh, Tình trạng cư trú' },
    { text: 'Dịch vụ & Tài chính: Hợp đồng, Hóa đơn (Tiền phòng, điện, nước)' },
    { text: 'Vận hành: Yêu cầu sửa chữa (Tickets), Gửi thông báo' },
    { text: 'Hệ thống báo cáo: Dashboard doanh thu, Tỷ lệ lấp đầy phòng' }
]);

// Slide 4
slide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
addTitle(slide, 'Mô hình & Quy trình Phát triển');
addBullets(slide, [
    { text: 'Ứng dụng mô hình linh hoạt Agile / Scrum' },
    { text: 'Chia nhỏ quá trình phát triển thành 5 Sprints' },
    { text: 'Tập trung tính năng cốt lõi (Core Business) trong các Sprint đầu' },
    { text: 'Áp dụng Continuous Delivery, demo và review liên tục' },
    { text: 'Phân tích rủi ro & giải pháp từ sớm để tránh gián đoạn' }
]);

// Slide 5
slide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
addTitle(slide, 'Kiến trúc & Công nghệ');
addBullets(slide, [
    { text: 'Mô hình: Client-Server API (Three-tier Architecture)' },
    { text: 'Backend: Java 21, Spring Boot, Spring Security (JWT)' },
    { text: 'Khung CSDL: JPA/Hibernate, Flyway Migration' },
    { text: 'Frontend: ReactJS, Vite, Material Tailwind (React)' },
    { text: 'Database: PostgreSQL (quan hệ đa bảng, rành mạch tenant_id)' }
]);

// Slide 6
slide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
addTitle(slide, 'Cơ sở Dữ liệu & ERD');
addBullets(slide, [
    { text: '13 bảng phục vụ đầy đủ vòng đời: users, rooms, contracts, bills...' },
    { text: 'Luồng 1-N: 1 Phòng chứa nhiều Cư dân, 1 Hợp đồng có nhiều Cư dân' },
    { text: 'Luồng Hóa đơn: Liên kết trực tiếp Hợp đồng và Phòng' },
    { text: 'Toàn vẹn dữ liệu: Sử dụng khóa ngoại (Foreign Keys) nghiêm ngặt' }
]);
try { slide.addImage({ path: path.join(__dirname, 'erd_diagram.png'), x: 6, y: 2.2, w: 3.5, h: 3.5 }); } catch {}

// Slide 7
slide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
addScreenshot(slide, 'dashboard.png', 'Giao diện - Tổng quan (Dashboard)');

// Slide 8
slide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
addScreenshot(slide, 'rooms.png', 'Giao diện - Quản lý Phòng trọ');

// Slide 9
slide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
addScreenshot(slide, 'residents.png', 'Giao diện - Quản lý Cư dân');

// Slide 10
slide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
addScreenshot(slide, 'contracts.png', 'Giao diện - Quản lý Hợp đồng');

// Slide 11
slide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
addScreenshot(slide, 'bills.png', 'Giao diện - Quản lý Hóa đơn (Phiếu thu)');

// Slide 12
slide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
addTitle(slide, 'Bảo mật & Trải nghiệm (UI/UX)');
addBullets(slide, [
    { text: 'Multi-tenant: Cách ly dữ liệu hoàn toàn giữa các Quản lý (Chủ trọ)' },
    { text: 'Phân quyền (RBAC): SuperAdmin, Manager, Guard, Tenant' },
    { text: 'Tính bảo mật: Mã hóa Password (BCrypt), Xác thực API (JWT)' },
    { text: 'Responsive Design: Tối ưu trên Desktop, Tablet & Điện thoại' },
    { text: 'Chế độ hiển thị: Hỗ trợ Light / Dark Mode' }
]);

// Slide 13
slide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
addTitle(slide, 'Kiểm thử Phần mềm (Testing)');
addBullets(slide, [
    { text: 'White-box Testing: Kiểm thử logic xử lý thanh lý hợp đồng' },
    { text: 'White-box Testing: Kiểm thử công thức cộng dồn hóa đơn điện nước' },
    { text: 'Black-box Testing: Ràng buộc form Đăng nhập, Thêm phòng, Hợp đồng' },
    { text: 'Sử dụng Decision Table để kiểm duyệt điều kiện thanh toán' }
]);

// Slide 14
slide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
addTitle(slide, 'Kết luận & Hướng phát triển');
addBullets(slide, [
    { text: 'Dự án đã đáp ứng đầy đủ yêu cầu quản lý nhà trọ hiện đại' },
    { text: 'Giao diện dễ sử dụng, logic nghiệp vụ thực tế, có thể áp dụng rộng' },
    { text: 'Hướng phát triển tương lai:' },
    { text: '  - Tích hợp cổng thanh toán trực tuyến (VNPay/MoMo)' },
    { text: '  - Phát hành phiên bản Mobile App cho Cư dân' }
]);

// Slide 15
slide = pptx.addSlide();
slide.background = { color: colors.primary };
slide.addText('CẢM ƠN THẦY VÀ CÁC BẠN ĐÃ LẮNG NGHE!', { x: 1, y: 3, w: '80%', h: 1, fontSize: 40, bold: true, color: 'FFFFFF', align: 'center' });
slide.addText('Hệ thống Quản lý Nhà trọ SmartRent', { x: 1, y: 4, w: '80%', h: 1, fontSize: 24, color: 'E5E7EB', align: 'center' });

pptx.writeFile({ fileName: 'SmartRent_ThuyetTrinh.pptx' })
    .then(fileName => {
        console.log(`✅ PPTX created: ${fileName}`);
    })
    .catch(err => {
        console.error('Error:', err);
    });
