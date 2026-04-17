const PptxGenJS = require('pptxgenjs');
const path = require('path');

const pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_16x9';

// Modern SaaS Color Palette
const colors = {
    darkSlate: '0F172A',
    primaryBlue: '2563EB',
    accentAmber: 'F59E0B',
    bgLight: 'F8FAFC',
    textMain: '334155',
    textMuted: '64748B',
    white: 'FFFFFF',
};

// ============================================
// DEFINE MASTERS
// ============================================

// Standard Content Master Slide
pptx.defineSlideMaster({
    title: 'MODERN_MASTER',
    background: { color: colors.bgLight },
    objects: [
        // Top Header Base
        { rect: { x: 0, y: 0, w: '100%', h: 0.9, fill: { color: colors.darkSlate } } },
        // Top Header Accent Line
        { rect: { x: 0, y: 0.9, w: '100%', h: 0.05, fill: { color: colors.primaryBlue } } },
        // Logo / Title Text in Header
        { text: { text: 'SMARTRENT', options: { x: 0.4, y: 0.2, w: 3, h: 0.5, color: colors.accentAmber, fontSize: 22, bold: true, fontFace: 'Arial' } } },
        { text: { text: 'Phần mềm Quản lý Nhà trọ & Chung cư', options: { x: 2.8, y: 0.25, w: 5, h: 0.4, color: '94A3B8', fontSize: 13, italic: true, fontFace: 'Arial' } } },
        // Decorative Sidebar Graphic (Left edge)
        { rect: { x: 0, y: 0.95, w: 0.1, h: '100%', fill: { color: colors.primaryBlue } } },
        // Footer Graphic
        { rect: { x: 0, y: 8.7, w: '100%', h: 0.3, fill: { color: 'E2E8F0' } } },
        { text: { text: 'Báo cáo môn học: Nhập môn Công nghệ Phần mềm', options: { x: 0.4, y: 8.7, w: 5, h: 0.3, color: '94A3B8', fontSize: 10, fontFace: 'Arial' } } }
    ],
    slideNumber: { x: '95%', y: 8.7, w: 0.5, h: 0.3, color: '64748B', fontSize: 10, align: 'right' }
});

// Title Page Master Slide
pptx.defineSlideMaster({
    title: 'TITLE_MASTER',
    background: { color: colors.darkSlate },
    objects: [
        // Accent Bar top and bottom
        { rect: { x: 0, y: 0, w: '100%', h: 0.2, fill: { color: colors.primaryBlue } } },
        { rect: { x: 0, y: 8.8, w: '100%', h: 0.2, fill: { color: colors.accentAmber } } },
        // Decorative Background blocks
        { rect: { x: '75%', y: '15%', w: 6, h: 6, fill: { color: '1E293B' }, rotate: 45 } },
        { rect: { x: '80%', y: '20%', w: 6, h: 6, fill: { color: '0F172A' }, rotate: 45 } },
    ]
});

// ============================================
// HELPER FUNCTIONS
// ============================================

const addSlideTitle = (slide, text) => {
    slide.addText(text, { 
        x: 0.5, y: 1.3, w: '90%', h: 0.8, 
        fontSize: 34, bold: true, color: colors.darkSlate, fontFace: 'Arial' 
    });
};

const addSlideContent = (slide, bullets, yOffset = 2.4) => {
    slide.addText(bullets.map(b => ({ 
        text: b.text, 
        options: { 
            bullet: { type: b.number ? 'number' : undefined, characterCode: b.number ? undefined : '2022' }, 
            indentLevel: b.level || 0,
            color: b.highlight ? colors.primaryBlue : colors.textMain,
            bold: b.bold || false
        } 
    })), 
    { x: 0.6, y: yOffset, w: '88%', h: 5.5, fontSize: 22, lineSpacing: 38, fontFace: 'Arial', valign: 'top' });
};

const addScreenshotSlide = (slide, filename, title, subtitle) => {
    slide.addText(title, { x: 0.5, y: 1.3, w: '90%', h: 0.6, fontSize: 30, bold: true, color: colors.darkSlate, fontFace: 'Arial' });
    if(subtitle) {
        slide.addText(subtitle, { x: 0.5, y: 1.9, w: '90%', h: 0.4, fontSize: 16, color: colors.textMuted, fontFace: 'Arial', italic: true });
    }
    
    try {
        slide.addImage({ 
            path: path.join(__dirname, filename), 
            x: 0.8, y: 2.5, w: 8.4, h: 5.2,
            sizing: { type: 'contain', w: 8.4, h: 5.2 }
        });
        
        // Add decorative styling border to the right and bottom for some depth
        slide.addShape(pptx.ShapeType.rect, { 
            x: 0.8, y: 2.5, w: 8.4, h: 5.2, fill: {type: 'none'}, line: {color: 'CBD5E1', width: 2, dashType: 'solid'} 
        });
    } catch (e) {
        slide.addText(`(Không tìm thấy ảnh: ${filename})`, { x: 1, y: 3, w: 8, h: 4, fill: { color: 'E2E8F0' }, align: 'center', color: '9CA3AF' });
    }
};

// ============================================
// CONTENT GENERATION
// ============================================

// Slide 1: Welcome
let slide = pptx.addSlide({ masterName: 'TITLE_MASTER' });
slide.addText('HỆ THỐNG QUẢN LÝ NHÀ TRỌ & CHUNG CƯ', { x: 0.5, y: 2.5, w: '60%', h: 1, fontSize: 28, color: '94A3B8', bold: true, fontFace: 'Arial' });
slide.addText('SMARTRENT', { x: 0.5, y: 3.2, w: '70%', h: 1.5, fontSize: 62, bold: true, color: colors.accentAmber, fontFace: 'Arial black' });
slide.addShape(pptx.ShapeType.rect, { x: 0.5, y: 4.8, w: 2, h: 0.05, fill: { color: colors.primaryBlue } });
slide.addText('Trình bày: Vũ Xuân Dự', { x: 0.5, y: 5.2, w: '80%', h: 0.5, fontSize: 22, color: colors.white, fontFace: 'Arial' });
slide.addText('Đề tài: Báo cáo Nhập môn CNPM', { x: 0.5, y: 5.8, w: '80%', h: 0.5, fontSize: 18, color: 'CBD5E1', italic: true, fontFace: 'Arial' });

// Slide 2: Vấn đề
slide = pptx.addSlide({ masterName: 'MODERN_MASTER' });
addSlideTitle(slide, '1. Đặt vấn đề & Mục tiêu');
addSlideContent(slide, [
    { text: 'Thực trạng quản lý thủ công:', bold: true },
    { text: 'Chủ yếu dùng sổ sách hoặc Excel, dẫn đến dễ mất dữ liệu và sai sót khi tính toán dư nợ, điện nước.', level: 1 },
    { text: 'Khó khăn trong vận hành:', bold: true },
    { text: 'Thiếu kênh tương tác liên tục giữa Ban quản lý và Cư dân (ví dụ: báo cáo sự cố, nhắc nợ).', level: 1 },
    { text: 'Mục tiêu giải pháp (SmartRent):', bold: true, highlight: true },
    { text: 'Xây dựng một nền tảng SaaS (Software as a Service) số hóa hoàn toàn vòng đời quản lý bất động sản cho thuê.', level: 1 }
]);

// Slide 3: Tính năng
slide = pptx.addSlide({ masterName: 'MODERN_MASTER' });
addSlideTitle(slide, '2. Phạm vi & Tính năng cốt lõi');
addSlideContent(slide, [
    { text: 'Quản lý Không gian: Thiết lập Tòa nhà, Lầu/Tầng, Phòng trọ, trạng thái phòng.', number: true },
    { text: 'Quản lý Cư trú: Hồ sơ khách thuê, hợp đồng ràng buộc giữa phòng và người thuê.', number: true },
    { text: 'Quản lý Tài chính: Ghi chỉ số Điện/Nước tự động, in Hóa đơn, theo dõi Công nợ.', number: true },
    { text: 'Tương tác Hệ thống: Cơ chế nhắc nợ, cư dân gửi Ticket sửa chữa.', number: true },
    { text: 'Báo cáo & Phân tích: Dashboard trực quan về Tỷ lệ lấp đầy phòng, biểu đồ theo dõi doanh thu (doanh số thực nhận vs dư nợ).', number: true },
]);

// Slide 4: Agile
slide = pptx.addSlide({ masterName: 'MODERN_MASTER' });
addSlideTitle(slide, '3. Mô hình & Quy trình Phát triển Agile / Scrum');
addSlideContent(slide, [
    { text: 'Ứng dụng mô hình Agile:', bold: true },
    { text: 'Phát triển linh hoạt qua 5 Sprints, mỗi Sprint tập trung phân phối một tính năng khép kín.', level: 1 },
    { text: 'Thích ứng yêu cầu:', bold: true },
    { text: 'Xây dựng hệ thống lõi (Core Business) trong các Sprint đầu tiền để nhanh chóng lấy phản hồi từ Chủ trọ thực tế.', level: 1 },
    { text: 'Tối ưu nguồn lực:', bold: true },
    { text: 'Phân tích rủi ro trong từng pha thiết kế DB và UI/UX để hạn chế phải đập đi xây lại khi mở rộng module mới.', level: 1 }
]);

// Slide 5: Tech
slide = pptx.addSlide({ masterName: 'MODERN_MASTER' });
addSlideTitle(slide, '4. Kiến trúc & Công nghệ');
addSlideContent(slide, [
    { text: 'Kiến trúc Client-Server RESTful API:', bold: true, highlight: true },
    { text: 'Hệ thống Backend độc lập, cho phép linh hoạt ghép nối với ứng dụng Web và Mobile sau này.', level: 1 },
    { text: 'Hệ sinh thái Công nghệ:', bold: true },
    { text: 'Backend: Java 21, Spring Boot framework, Spring Security (đảm bảo bảo mật bằng JWT).', level: 1 },
    { text: 'Database: PostgreSQL (sử dụng Flyway Migration quản lý phiên bản thay đổi dữ liệu).', level: 1 },
    { text: 'Frontend: ReactJS, Vite build tool, Material Tailwind React.', level: 1 },
]);

// Slide 6: ERD
slide = pptx.addSlide({ masterName: 'MODERN_MASTER' });
addSlideTitle(slide, '5. Thiết kế Cơ sở Dữ liệu & ERD');
addSlideContent(slide, [
    { text: 'Luồng dữ liệu chặt chẽ qua 13 bảng:', bold: true },
    { text: 'Quản lý Tenant (Chủ trọ) phân cấp: 1 Tenant -> N Phòng -> N Cư dân.', level: 1 },
    { text: 'Tính ràng buộc cao: Hóa đơn được phát sinh chuẩn hóa dựa trên Chỉ số điện/nước và Hợp đồng.', level: 1 },
]);
try { slide.addImage({ path: path.join(__dirname, 'erd_diagram.png'), x: 5.5, y: 3.5, w: 4, h: 3.5, sizing: {type: 'contain'} }); } catch (e) {}

// Screenshot Slides
addScreenshotSlide(pptx.addSlide({ masterName: 'MODERN_MASTER' }), 'dashboard.png', 
    '6.1. Trang Tổng quan (Dashboard)', 
    'Theo dõi tỷ lệ lấp đầy phòng, doanh thu, lợi nhuận qua biểu đồ ApexCharts.');

addScreenshotSlide(pptx.addSlide({ masterName: 'MODERN_MASTER' }), 'rooms.png', 
    '6.2. Quản lý Phòng trọ', 
    'Danh sách phòng hỗ trợ lọc nhanh, cập nhật trạng thái phòng thực tế.');

addScreenshotSlide(pptx.addSlide({ masterName: 'MODERN_MASTER' }), 'residents.png', 
    '6.3. Quản lý Hồ sơ Cư dân', 
    'Lưu trữ hồ sơ cư trú, định danh, liên kết thông tin hợp đồng hiện hành.');

addScreenshotSlide(pptx.addSlide({ masterName: 'MODERN_MASTER' }), 'contracts.png', 
    '6.4. Quản lý Hợp đồng Thuê', 
    'Quản lý hợp đồng giữa các bên: cọc, tiền thuê, công cụ thanh lý hợp đồng.');

addScreenshotSlide(pptx.addSlide({ masterName: 'MODERN_MASTER' }), 'bills.png', 
    '6.5. Quản lý Hóa đơn & Thu chi', 
    'Tổng hợp và hạch toán tự động từng khoản phí: Điền, nước, mặt bằng.');

addScreenshotSlide(pptx.addSlide({ masterName: 'MODERN_MASTER' }), 'tickets.png', 
    '6.6. Báo cáo & Hỗ trợ kỹ thuật (Tickets)', 
    'Nơi cư dân gửi yêu cầu sửa chữa cơ sở vật chất (bóng đèn, vòi nước).');

addScreenshotSlide(pptx.addSlide({ masterName: 'MODERN_MASTER' }), 'residents-guard.png', 
    '6.7. Quản lý Cư dân (Góc nhìn của Bảo vệ)', 
    'Giao diện được phân quyền Role-Based (RBAC), bảo vệ chỉ được xem (Read-only), không được chỉnh sửa.');

addScreenshotSlide(pptx.addSlide({ masterName: 'MODERN_MASTER' }), 'portal.png', 
    '6.8. SmartRent Portal (Cổng cư dân)', 
    'Trang web hóa đơn độc lập dành cho Người Thuê xem qua Token link (không cần tạo tài khoản mật khẩu).');

// Slide 14: Testing
slide = pptx.addSlide({ masterName: 'MODERN_MASTER' });
addSlideTitle(slide, '7. Đảm bảo Chất lượng Phần mềm (Testing)');
addSlideContent(slide, [
    { text: 'Kiểm thử Hộp Trắng (White-box Testing):', bold: true },
    { text: 'Kiểm thử chi tiết hàm tính toán Thanh lý (Liquidation summary): Công thức cấn trừ nợ phức tạp.', level: 1 },
    { text: 'Xác minh thuật toán sinh hóa đơn điện nước hoàn hảo kể cả phòng trống.', level: 1 },
    { text: 'Kiểm thử Hộp Đen (Black-box Testing):', bold: true },
    { text: 'Kiểm thử hộp đen các validations khi Thêm phòng, Hợp đồng.', level: 1 },
    { text: 'Bảng quyết định (Decision Table):', highlight: true, bold: true },
    { text: 'Sử dụng Decision Table kết hợp Rule-based engine để chặn Cư dân chưa trả nợ mà dọn đi.', level: 1 }
]);

// Slide 15: Conclusion
slide = pptx.addSlide({ masterName: 'MODERN_MASTER' });
addSlideTitle(slide, '8. Kết luận & Hướng phát triển');
addSlideContent(slide, [
    { text: 'Kết quả đạt được:', bold: true },
    { text: 'Phần mềm cung cấp đúng, đủ UI đẹp mắt như một sản phẩm thương mại thực tế.', level: 1 },
    { text: 'Kiến trúc bảo mật, Multi-Tenant mạnh mẽ đáp ứng được đa Chủ trọ.', level: 1 },
    { text: 'Hướng phát triển tương lai:', bold: true, highlight: true },
    { text: 'Tích hợp thanh toán online hoàn chỉnh (VNPay, MoMo, ZaloPay).', number: true },
    { text: 'Phát hành App Mobile React Native dành cho các chủ trọ đi xa.', number: true },
    { text: 'AI OCR để chụp đồng hồ điện nước sẽ tự động điền số vào hệ thống.', number: true },
]);

// Slide 16: Ending 
slide = pptx.addSlide({ masterName: 'TITLE_MASTER' });
slide.addText('TRÂN TRỌNG CẢM ƠN', { x: 0.5, y: 3.5, w: '90%', h: 1, fontSize: 50, bold: true, color: colors.white, align: 'center', fontFace: 'Arial black' });
slide.addText('Sự tham gia lắng nghe của Thầy và các bạn lớp!', { x: 0.5, y: 4.8, w: '90%', h: 1, fontSize: 24, color: '94A3B8', align: 'center', fontFace: 'Arial' });

pptx.writeFile({ fileName: 'SmartRent_ThuyetTrinh_Premium.pptx' })
    .then(fileName => {
        console.log(`✅ Premium PPTX created: ${fileName}`);
    })
    .catch(err => {
        console.error('Error:', err);
    });
