import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, HeadingLevel, AlignmentType, BorderStyle, PageBreak, ShadingType, TableLayoutType, ImageRun } from 'docx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================
// HELPER FUNCTIONS
// ============================================================
const heading1 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 }, children: [new TextRun({ text, bold: true, size: 32, font: 'Times New Roman' })] });
const heading2 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 150 }, children: [new TextRun({ text, bold: true, size: 28, font: 'Times New Roman' })] });
const heading3 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 100 }, children: [new TextRun({ text, bold: true, size: 26, font: 'Times New Roman' })] });
const para = (text, opts = {}) => new Paragraph({ spacing: { after: 120, line: 360 }, alignment: opts.align || AlignmentType.JUSTIFIED, indent: opts.indent ? { firstLine: 720 } : undefined, children: [new TextRun({ text, size: 26, font: 'Times New Roman', ...opts })] });
const bullet = (text, level = 0) => new Paragraph({ bullet: { level }, spacing: { after: 80, line: 360 }, children: [new TextRun({ text, size: 26, font: 'Times New Roman' })] });
const boldPara = (text) => para(text, { bold: true });
const italicPara = (text) => para(text, { italics: true });
const emptyLine = () => new Paragraph({ spacing: { after: 120 }, children: [] });

function insertImage(filename, widthCm = 16, heightCm = 10, caption = '') {
  const imgPath = path.join(__dirname, filename);
  if (!fs.existsSync(imgPath)) {
    console.warn(`⚠️ Image not found: ${imgPath}`);
    return [para(`[Hình ảnh: ${filename} - không tìm thấy file]`, { italics: true })];
  }
  const imgData = fs.readFileSync(imgPath);
  const results = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 100 },
      children: [
        new ImageRun({
          data: imgData,
          transformation: { width: Math.round(widthCm * 37.8), height: Math.round(heightCm * 37.8) },
          type: 'png',
        }),
      ],
    }),
  ];
  if (caption) {
    results.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [new TextRun({ text: caption, italics: true, size: 22, font: 'Times New Roman' })],
    }));
  }
  return results;
}

function headerCell(text) {
  return new TableCell({
    shading: { type: ShadingType.SOLID, color: '2C3E50' },
    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text, bold: true, size: 22, font: 'Times New Roman', color: 'FFFFFF' })] })],
    verticalAlign: 'center',
  });
}
function cell(text, opts = {}) {
  return new TableCell({
    width: opts.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
    children: [new Paragraph({ alignment: opts.align || AlignmentType.LEFT, children: [new TextRun({ text: String(text), size: 22, font: 'Times New Roman', ...(opts.bold ? { bold: true } : {}), ...(opts.italics ? { italics: true } : {}) })] })],
    verticalAlign: 'center',
  });
}
function makeTable(headers, rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: headers.map(h => headerCell(h)), tableHeader: true }),
      ...rows.map(r => new TableRow({ children: r.map(c => cell(c)) })),
    ],
  });
}

// ============================================================
// TITLE PAGE
// ============================================================
function titlePage() {
  return [
    emptyLine(), emptyLine(), emptyLine(),
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'TRƯỜNG ĐẠI HỌC BÁCH KHOA HÀ NỘI', size: 28, bold: true, font: 'Times New Roman' })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'VIỆN CÔNG NGHỆ THÔNG TIN VÀ TRUYỀN THÔNG', size: 26, font: 'Times New Roman' })] }),
    emptyLine(), emptyLine(), emptyLine(),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: 'BÁO CÁO BÀI TẬP LỚN', size: 36, bold: true, font: 'Times New Roman' })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: 'MÔN: NHẬP MÔN CÔNG NGHỆ PHẦN MỀM', size: 30, bold: true, font: 'Times New Roman' })] }),
    emptyLine(), emptyLine(),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: 'ĐỀ TÀI:', size: 28, bold: true, font: 'Times New Roman' })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 400 }, children: [new TextRun({ text: 'XÂY DỰNG HỆ THỐNG QUẢN LÝ NHÀ TRỌ SMARTRENT', size: 32, bold: true, font: 'Times New Roman', color: '2C3E50' })] }),
    emptyLine(), emptyLine(),
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Giảng viên hướng dẫn: ThS. Nguyễn Sơn Tùng', size: 26, font: 'Times New Roman' })] }),
    emptyLine(),
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Sinh viên thực hiện: Vũ Xuân Dự', size: 26, font: 'Times New Roman' })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'MSSV: 20252731M', size: 26, font: 'Times New Roman' })] }),
    emptyLine(), emptyLine(), emptyLine(), emptyLine(),
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Hà Nội, 2026', size: 26, font: 'Times New Roman', italics: true })] }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ============================================================
// TABLE OF CONTENTS (Manual)
// ============================================================
function tableOfContents() {
  const items = [
    'GIỚI THIỆU BÀI TOÁN',
    'CHƯƠNG 2: VÒNG ĐỜI PHẦN MỀM',
    '  2.1 Tổng hợp và phân tích dữ liệu của dự án',
    '  2.2 Tổng hợp và chuẩn bị các tài liệu phân tích kỹ thuật',
    '  2.3 Đề xuất quy trình phát triển phần mềm',
    'CHƯƠNG 3: PHƯƠNG PHÁP AGILE',
    '  3.1 Product Backlog',
    '  3.2 Sprint Planning',
    'CHƯƠNG 4: QUẢN LÝ DỰ ÁN PHẦN MỀM',
    '  4.1 Cấu trúc phân rã công việc (WBS)',
    '  4.2 Phân tích rủi ro',
    'CHƯƠNG 5: QUẢN LÝ CẤU HÌNH PHẦN MỀM',
    '  5.1 Tổ chức mã nguồn',
    '  5.2 Quản lý phiên bản với Git',
    'CHƯƠNG 6: KỸ NGHỆ YÊU CẦU PHẦN MỀM',
    '  6.1 Biểu đồ Use Case tổng quan',
    '  6.2 Đặc tả Use Case chi tiết',
    'CHƯƠNG 7: THIẾT KẾ PHẦN MỀM',
    '  7.1 Kiến trúc hệ thống',
    '  7.2 Thiết kế cơ sở dữ liệu',
    '  7.3 Thiết kế giao diện',
    'CHƯƠNG 8: XÂY DỰNG PHẦN MỀM',
    '  8.1 Cấu trúc mã nguồn',
    '  8.2 Quy tắc lập trình',
    '  8.3 Code mẫu minh họa',
    'CHƯƠNG 9: ĐẢM BẢO CHẤT LƯỢNG PHẦN MỀM',
    '  9.1 Kiểm thử hộp trắng',
    '  9.2 Kiểm thử hộp đen',
  ];
  return [
    heading1('MỤC LỤC'),
    ...items.map(i => new Paragraph({ spacing: { after: 60, line: 360 }, children: [new TextRun({ text: i, size: 24, font: 'Times New Roman' })] })),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ============================================================
// CHAPTER 1: GIỚI THIỆU BÀI TOÁN 
// ============================================================
function chapter1() {
  return [
    heading1('GIỚI THIỆU BÀI TOÁN'),
    heading2('1. Bối cảnh'),
    para('Thị trường nhà trọ và phòng cho thuê tại Việt Nam đang ngày càng phát triển mạnh mẽ, đặc biệt tại các thành phố lớn như Hà Nội, TP. Hồ Chí Minh, Đà Nẵng. Tuy nhiên, phần lớn các chủ trọ vẫn quản lý bằng phương thức thủ công: ghi sổ tay, tính tiền điện nước bằng tay, nhắc nợ qua điện thoại. Điều này dẫn đến nhiều sai sót, mất thời gian và không chuyên nghiệp.', { indent: true }),
    para('SmartRent ra đời nhằm giải quyết bài toán trên bằng cách xây dựng một hệ thống quản lý nhà trọ/chung cư toàn diện trên nền tảng web, giúp chủ trọ số hóa toàn bộ quy trình quản lý từ phòng trọ, cư dân, hợp đồng, hóa đơn đến ghi chỉ số điện nước và thông báo.', { indent: true }),
    
    heading2('2. Mô tả bài toán'),
    para('Hệ thống SmartRent cần xử lý các nghiệp vụ chính sau:', { indent: true }),
    bullet('Quản lý phòng trọ: Thêm/sửa/xóa phòng, theo dõi trạng thái (Trống, Đã thuê, Đang sửa chữa), lọc phòng theo tầng, loại phòng, trạng thái.'),
    bullet('Quản lý cư dân: Lưu trữ thông tin cá nhân (họ tên, CCCD, SĐT, email, ngày sinh, giới tính), theo dõi trạng thái cư dân.'),
    bullet('Quản lý hợp đồng thuê: Tạo hợp đồng liên kết phòng - cư dân, theo dõi thời hạn, thanh lý hợp đồng khi cư dân rời đi.'),
    bullet('Quản lý hóa đơn: Tạo hóa đơn tiền phòng, tiền điện, tiền nước, dịch vụ. Theo dõi trạng thái thanh toán (Chưa trả, Đã trả, Quá hạn).'),
    bullet('Ghi chỉ số điện/nước: Ghi chỉ số mới hàng tháng, tính tiền tự động dựa trên chênh lệch chỉ số và đơn giá.'),
    bullet('Quản lý tài sản phòng: Theo dõi tài sản bàn giao trong phòng (bàn, ghế, điều hòa...), tình trạng và giá bồi thường.'),
    bullet('Thông báo & nhắc nợ: Gửi thông báo chung và nhắc nhở thanh toán tự động cho cư dân.'),
    bullet('Yêu cầu sửa chữa (Tickets): Cư dân gửi yêu cầu sửa chữa, chủ trọ xử lý và phản hồi.'),
    bullet('Cổng thông tin cư dân: Cư dân truy cập thông tin hợp đồng, hóa đơn qua link token (không cần tài khoản).'),
    bullet('Tổng quan Dashboard: Biểu đồ thống kê tỷ lệ lấp đầy, doanh thu, dư nợ, hợp đồng sắp hết hạn.'),

    heading2('3. Các bên liên quan'),
    makeTable(['Vai trò', 'Mô tả', 'Chức năng chính'], [
      ['Super Admin', 'Quản trị viên hệ thống', 'Quản lý toàn bộ hệ thống, tenant, người dùng'],
      ['Tenant Manager', 'Chủ trọ / Quản lý', 'Quản lý phòng, cư dân, hợp đồng, hóa đơn, dịch vụ'],
      ['Guard (Bảo vệ)', 'Nhân viên bảo vệ', 'Xem thông tin phòng, cư dân (chỉ đọc)'],
      ['Tenant (Cư dân)', 'Người thuê trọ', 'Xem hợp đồng, hóa đơn, gửi yêu cầu sửa chữa'],
    ]),
    
    heading2('4. Phạm vi dự án'),
    para('Dự án tập trung xây dựng hệ thống SaaS (Software as a Service) quản lý nhà trọ/chung cư với các đặc điểm:', { indent: true }),
    bullet('Kiến trúc Multi-tenant: Mỗi chủ trọ là một tenant riêng biệt, dữ liệu cách ly hoàn toàn.'),
    bullet('Nền tảng web responsive: Hoạt động tốt trên máy tính, tablet và điện thoại di động.'),
    bullet('Xác thực JWT: Đăng nhập bảo mật, hỗ trợ Google OAuth, refresh token.'),
    bullet('RBAC (Role-Based Access Control): Phân quyền theo vai trò với 4 cấp độ người dùng.'),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ============================================================
// CHAPTER 2: VÒNG ĐỜI PHẦN MỀM
// ============================================================
function chapter2() {
  return [
    heading1('CHƯƠNG 2: VÒNG ĐỜI PHẦN MỀM'),
    
    heading2('Bài 2.1. Tổng hợp và phân tích dữ liệu của dự án'),
    heading3('Bảng 2-1: Thông tin chung của dự án'),
    makeTable(['Hạng mục', 'Thông tin'], [
      ['Tên dự án', 'SmartRent - Hệ thống quản lý nhà trọ thông minh'],
      ['Loại dự án', 'SaaS - Property Management System'],
      ['Đơn vị thực hiện', 'Sinh viên: Vũ Xuân Dự - MSSV: 20252731M'],
      ['GVHD', 'ThS. Nguyễn Sơn Tùng'],
      ['Phạm vi', 'Hệ thống web quản lý nhà trọ/chung cư: phòng, cư dân, hợp đồng, hóa đơn, điện/nước, tài sản, thông báo, cổng cư dân'],
      ['Đối tượng sử dụng', 'Chủ trọ, Quản lý tòa nhà, Bảo vệ, Người thuê trọ'],
      ['Công nghệ', 'Java 21 + Spring Boot 4.0.1 (Backend), React + Vite (Frontend), PostgreSQL (Database)'],
      ['Chú ý đặc biệt', 'Multi-tenant architecture, JWT authentication, Role-Based Access Control (RBAC)'],
    ]),
    emptyLine(),

    heading2('Bài 2.2. Tổng hợp tài liệu phân tích kỹ thuật (SRS)'),
    heading3('2.2.1. Yêu cầu chức năng'),
    makeTable(['STT', 'Module', 'Chức năng', 'Mô tả'], [
      ['1', 'Authentication', 'Đăng nhập/Đăng ký', 'JWT token, Google OAuth, Refresh token, Forgot Password'],
      ['2', 'Room', 'Quản lý phòng trọ', 'CRUD phòng, lọc theo trạng thái/tầng/loại, phân trang'],
      ['3', 'Resident', 'Quản lý cư dân', 'CRUD cư dân, lưu CCCD, SĐT, email, giới tính'],
      ['4', 'Contract', 'Quản lý hợp đồng', 'Tạo/Sửa/Thanh lý hợp đồng, tự động cập nhật trạng thái phòng'],
      ['5', 'Bill', 'Quản lý hóa đơn', 'CRUD hóa đơn đa loại (RENT, ELECTRICITY, WATER, SERVICE), đánh dấu đã thanh toán'],
      ['6', 'Service', 'Ghi chỉ số & đơn giá', 'Ghi số điện/nước, cấu hình đơn giá, tạo hóa đơn tự động'],
      ['7', 'Asset', 'Tài sản phòng', 'Quản lý tài sản bàn giao (tên, SL, tình trạng, giá bồi thường)'],
      ['8', 'Ticket', 'Yêu cầu sửa chữa', 'Cư dân gửi ticket, quản lý theo trạng thái/ưu tiên'],
      ['9', 'Notification', 'Thông báo & nhắc nợ', 'Gửi thông báo chung, nhắc nợ tự động cho hóa đơn quá hạn'],
      ['10', 'Dashboard', 'Tổng quan', 'Thống kê tỷ lệ lấp đầy, doanh thu, dư nợ, HĐ sắp hết hạn'],
      ['11', 'Portal', 'Cổng cư dân', 'Cư dân xem thông tin qua token (không cần đăng nhập)'],
      ['12', 'User', 'Quản lý người dùng', 'CRUD user, phân quyền 4 vai trò'],
    ]),
    emptyLine(),

    heading3('2.2.2. Yêu cầu phi chức năng'),
    bullet('Bảo mật: Xác thực JWT (access token 24h, refresh token 7 ngày), mã hóa mật khẩu BCrypt.'),
    bullet('Phân quyền RBAC: 4 vai trò (SUPER_ADMIN, TENANT_MANAGER, GUARD, TENANT) với permission chi tiết.'),
    bullet('Multi-tenant: Dữ liệu của mỗi chủ trọ cách ly hoàn toàn, không truy cập lẫn nhau.'),
    bullet('Responsive: Giao diện tương thích từ Desktop (1920px) xuống Mobile (375px).'),
    bullet('Hiệu năng: Phân trang API (page, size), index database cho các trường tìm kiếm phổ biến.'),
    bullet('Hệ thống phục vụ 24/7, uptime mục tiêu > 99%.'),
    emptyLine(),

    heading3('2.2.3. Yêu cầu dữ liệu'),
    para('Hệ thống gồm 13 bảng chính trong cơ sở dữ liệu PostgreSQL:', { indent: true }),
    makeTable(['STT', 'Bảng', 'Mục đích'], [
      ['1', 'tenants', 'Chủ trọ / Đơn vị quản lý'],
      ['2', 'roles', 'Vai trò hệ thống (SUPER_ADMIN, TENANT_MANAGER, GUARD, TENANT)'],
      ['3', 'permissions', 'Quyền chi tiết (ROOM:READ, CONTRACT:WRITE, ...)'],
      ['4', 'users', 'Người dùng hệ thống'],
      ['5', 'rooms', 'Phòng trọ (số phòng, tầng, diện tích, giá, trạng thái)'],
      ['6', 'residents', 'Cư dân (CCCD, SĐT, email, giới tính)'],
      ['7', 'contracts', 'Hợp đồng thuê (ngày bắt đầu/kết thúc, tiền cọc, trạng thái)'],
      ['8', 'bills', 'Hóa đơn (tiền phòng, điện, nước, dịch vụ)'],
      ['9', 'room_fee_units', 'Đơn giá điện/nước/dịch vụ cho từng tenant'],
      ['10', 'meter_readings', 'Ghi số điện/nước hàng tháng'],
      ['11', 'notifications', 'Thông báo / Nhắc nợ'],
      ['12', 'tickets', 'Yêu cầu sửa chữa từ cư dân'],
      ['13', 'room_assets', 'Tài sản trong phòng'],
    ]),
    emptyLine(),

    heading2('Bài 2.3. Đề xuất quy trình phát triển phần mềm'),
    heading3('Lựa chọn mô hình: Agile/Scrum'),
    para('Sau khi phân tích các đặc điểm của dự án, mô hình Agile/Scrum được lựa chọn vì:', { indent: true }),
    bullet('Phần mềm mới hoàn toàn, chưa có phiên bản trước.'),
    bullet('Quy trình nghiệp vụ tương đối rõ nhưng cần điều chỉnh dần trong quá trình phát triển.'),
    bullet('Kích thước dự án vừa phải, phù hợp phát triển theo sprint 2 tuần.'),
    bullet('Đội ngũ nhỏ (1 người), cần linh hoạt trong việc ưu tiên tính năng.'),
    bullet('Khách hàng (chủ trọ) có thể tham gia review sau mỗi sprint.'),
    emptyLine(),
    heading3('Vai trò trong dự án'),
    makeTable(['Vai trò Scrum', 'Người đảm nhiệm', 'Nhiệm vụ'], [
      ['Product Owner', 'Vũ Xuân Dự', 'Quản lý Product Backlog, ưu tiên tính năng'],
      ['Scrum Master', 'Vũ Xuân Dự', 'Đảm bảo quy trình Scrum được tuân thủ'],
      ['Developer', 'Vũ Xuân Dự', 'Phát triển Backend (Java) + Frontend (React)'],
      ['GVHD', 'ThS. Nguyễn Sơn Tùng', 'Hướng dẫn, review, góp ý'],
    ]),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ============================================================
// CHAPTER 3: AGILE
// ============================================================
function chapter3() {
  return [
    heading1('CHƯƠNG 3: PHƯƠNG PHÁP AGILE'),
    
    heading2('Bài 3.1. Product Backlog'),
    para('Product Backlog được tổ chức theo thứ tự ưu tiên, phân chia thành các Sprint:', { indent: true }),
    makeTable(['Sprint', 'User Story', 'Priority', 'Story Points', 'Status'], [
      ['Sprint 1', 'Thiết lập project, DB schema, Auth module', 'Cao', '13', 'Done'],
      ['Sprint 1', 'CRUD Phòng trọ (Backend + Frontend)', 'Cao', '8', 'Done'],
      ['Sprint 1', 'CRUD Cư dân', 'Cao', '8', 'Done'],
      ['Sprint 2', 'CRUD Hợp đồng thuê + Thanh lý', 'Cao', '13', 'Done'],
      ['Sprint 2', 'CRUD Hóa đơn + Đánh dấu thanh toán', 'Cao', '8', 'Done'],
      ['Sprint 2', 'Ghi chỉ số điện/nước + Tạo hóa đơn tự động', 'Cao', '8', 'Done'],
      ['Sprint 3', 'Quản lý tài sản phòng', 'Trung bình', '5', 'Done'],
      ['Sprint 3', 'Yêu cầu sửa chữa (Tickets)', 'Trung bình', '5', 'Done'],
      ['Sprint 3', 'Thông báo & Nhắc nợ', 'Trung bình', '8', 'Done'],
      ['Sprint 4', 'Dashboard tổng quan + Biểu đồ', 'Trung bình', '8', 'Done'],
      ['Sprint 4', 'Cổng thông tin cư dân (Portal)', 'Trung bình', '5', 'Done'],
      ['Sprint 4', 'RBAC + Multi-tenant Data Isolation', 'Cao', '13', 'Done'],
      ['Sprint 5', 'UI/UX Modernization (Indigo Theme)', 'Thấp', '8', 'Done'],
      ['Sprint 5', 'Dark Mode + Responsive', 'Thấp', '5', 'Done'],
      ['Sprint 5', 'Testing & Bug fixes', 'Cao', '8', 'Done'],
    ]),
    emptyLine(),

    heading2('Bài 3.2. Sprint Planning'),
    heading3('Sprint 1 (2 tuần): Foundation'),
    bullet('Goal: Thiết lập nền tảng hệ thống, hoàn thành Auth + Room + Resident module.'),
    bullet('Tasks: Tạo project Spring Boot, cấu hình PostgreSQL + Flyway, thiết kế DB schema (V1-V7), xây dựng JWT Authentication, CRUD Room, CRUD Resident.'),
    bullet('Deliverable: Hệ thống đăng nhập hoạt động, quản lý phòng và cư dân cơ bản.'),
    emptyLine(),
    heading3('Sprint 2 (2 tuần): Core Business'),
    bullet('Goal: Hoàn thành nghiệp vụ cốt lõi: Hợp đồng, Hóa đơn, Điện/Nước.'),
    bullet('Tasks: CRUD Contract + Liquidation, CRUD Bill + Mark Paid, Meter Reading + Auto Generate Bill, Fee Configuration.'),
    bullet('Deliverable: Luồng nghiệp vụ hoàn chỉnh: Tạo HĐ → Ghi chỉ số → Tạo hóa đơn → Thanh toán → Thanh lý HĐ.'),
    emptyLine(),
    heading3('Sprint 3 (2 tuần): Supporting Features'),
    bullet('Goal: Bổ sung tính năng hỗ trợ: Tài sản, Ticket, Thông báo.'),
    heading3('Sprint 4 (2 tuần): Dashboard & Portal'),
    bullet('Goal: Tổng quan hệ thống, Cổng cư dân, Phân quyền RBAC hoàn chỉnh.'),
    heading3('Sprint 5 (2 tuần): Polish & Testing'),
    bullet('Goal: Hoàn thiện UI/UX, Dark Mode, Testing toàn diện, sửa lỗi.'),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ============================================================
// CHAPTER 4: QUẢN LÝ DỰ ÁN
// ============================================================
function chapter4() {
  return [
    heading1('CHƯƠNG 4: QUẢN LÝ DỰ ÁN PHẦN MỀM'),
    
    heading2('Bài 4.1. Cấu trúc phân rã công việc (WBS)'),
    para('Work Breakdown Structure của dự án SmartRent:', { indent: true }),
    makeTable(['WBS', 'Công việc', 'Thời lượng', 'Phụ thuộc'], [
      ['1', 'Khởi tạo dự án', '2 ngày', '-'],
      ['1.1', 'Thiết lập môi trường phát triển', '0.5 ngày', '-'],
      ['1.2', 'Tạo project Spring Boot + React', '0.5 ngày', '1.1'],
      ['1.3', 'Thiết kế Database Schema', '1 ngày', '1.2'],
      ['2', 'Module Authentication', '3 ngày', '1'],
      ['2.1', 'JWT Login/Register Backend', '1.5 ngày', '1.3'],
      ['2.2', 'Google OAuth', '0.5 ngày', '2.1'],
      ['2.3', 'Frontend Login Page', '1 ngày', '2.1'],
      ['3', 'Module Room Management', '3 ngày', '2'],
      ['3.1', 'Backend CRUD API', '1 ngày', '2.1'],
      ['3.2', 'Frontend danh sách + Form', '2 ngày', '3.1'],
      ['4', 'Module Resident Management', '2 ngày', '3'],
      ['5', 'Module Contract Management', '4 ngày', '3, 4'],
      ['5.1', 'CRUD Contract', '2 ngày', '4'],
      ['5.2', 'Liquidation logic', '2 ngày', '5.1'],
      ['6', 'Module Bill Management', '3 ngày', '5'],
      ['7', 'Module Service (Meter Reading)', '3 ngày', '6'],
      ['8', 'Module Asset Management', '2 ngày', '3'],
      ['9', 'Module Ticket', '2 ngày', '4'],
      ['10', 'Module Notification', '2 ngày', '4'],
      ['11', 'Dashboard & Portal', '3 ngày', '6, 7'],
      ['12', 'RBAC & Security', '3 ngày', '2'],
      ['13', 'UI/UX Polish', '3 ngày', '11'],
      ['14', 'Testing & Bug Fix', '5 ngày', '13'],
    ]),
    emptyLine(),

    heading2('Bài 4.2. Phân tích rủi ro'),
    makeTable(['Rủi ro', 'Xác suất', 'Ảnh hưởng', 'Giải pháp'], [
      ['Một người phải làm cả Backend + Frontend', 'Cao', 'Cao', 'Ưu tiên tính năng cốt lõi, sử dụng UI library (Material Tailwind) để tăng tốc'],
      ['Lỗi tương thích Spring Boot 4.x', 'Trung bình', 'Cao', 'Tham khảo changelog, test sớm, fallback Spring Boot 3.x'],
      ['Thiết kế DB thay đổi giữa chừng', 'Cao', 'Trung bình', 'Sử dụng Flyway migration, tách migration nhỏ (V1-V14)'],
      ['JWT token bảo mật', 'Thấp', 'Cao', 'BCrypt password, token expiry, refresh mechanism'],
      ['Multi-tenant data leak', 'Thấp', 'Rất cao', 'AOP TenantSecurityAspect, kiểm tra tenant_id mọi query'],
      ['UI/UX không nhất quán', 'Trung bình', 'Trung bình', 'Design system Indigo, component reuse, Dark Mode toggle'],
    ]),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ============================================================
// CHAPTER 5: QUẢN LÝ CẤU HÌNH
// ============================================================
function chapter5() {
  return [
    heading1('CHƯƠNG 5: QUẢN LÝ CẤU HÌNH PHẦN MỀM'),
    
    heading2('Bài 5.1. Tổ chức mã nguồn'),
    heading3('5.1.1. Backend (Java Spring Boot)'),
    para('Cấu trúc mã nguồn backend theo mô hình Layered Architecture:', { indent: true }),
    bullet('com.smartrent.controller/ — 15 REST Controllers xử lý HTTP request'),
    bullet('com.smartrent.service/ — 15 Service classes chứa business logic'),
    bullet('com.smartrent.service.impl/ — Service implementations'),
    bullet('com.smartrent.repository/ — 13 JPA Repository interfaces (Data Access Layer)'),
    bullet('com.smartrent.domain/ — 15 Entity classes (JPA Entities)'),
    bullet('com.smartrent.dto/ — Data Transfer Objects (Request/Response DTOs)'),
    bullet('com.smartrent.security/ — JWT filter, token provider, security config'),
    bullet('com.smartrent.config/ — CORS, Web MVC, Application config'),
    bullet('com.smartrent.exception/ — Global exception handler'),
    bullet('com.smartrent.util/ — DataInitializer, helper utilities'),
    bullet('src/main/resources/db/migration/ — 15 Flyway migration files (V1-V14, V99)'),
    emptyLine(),

    heading3('5.1.2. Frontend (React Vite)'),
    para('Cấu trúc mã nguồn frontend:', { indent: true }),
    bullet('src/pages/dashboard/ — 24 React components cho dashboard (rooms, residents, contracts, bills, ...)'),
    bullet('src/pages/auth/ — Trang đăng nhập, đăng ký'),
    bullet('src/api/ — API modules: auth.ts, room.ts, resident.ts, contract.ts, bill.ts, ...'),
    bullet('src/lib/ — Utilities: http.ts (apiFetch), swal.ts (SweetAlert2), token.ts'),
    bullet('src/widgets/layout/ — Layout components: sidenav.jsx, dashboard-navbar.jsx, configurator.jsx'),
    bullet('src/layouts/ — Dashboard layout wrapper'),
    bullet('src/context/ — Material Tailwind context (dark mode, sidenav color)'),
    emptyLine(),

    heading2('Bài 5.2. Quản lý phiên bản với Git'),
    para('Dự án sử dụng Git để quản lý phiên bản mã nguồn:', { indent: true }),
    bullet('Repository: Lưu trữ trên GitHub'),
    bullet('Branching: Sử dụng main branch chính, feature branches cho tính năng mới'),
    bullet('Commit convention: Mô tả rõ ràng thay đổi trong từng commit'),
    emptyLine(),

    heading3('Bảng quản lý mục cấu hình'),
    makeTable(['Mục cấu hình', 'Vị trí', 'Mô tả'], [
      ['Database config', 'application.properties', 'PostgreSQL connection, Flyway, JPA settings'],
      ['JWT Secret', 'application.properties', 'JWT signing key, expiry time'],
      ['CORS config', 'config/WebConfig.java', 'Cho phép frontend (port 5173) gọi backend'],
      ['Vite proxy', 'vite.config.js', 'Proxy /api → localhost:8080'],
      ['Tailwind config', 'tailwind.config.cjs', 'Colors, dark mode class-based'],
      ['API base URL', 'src/lib/http.ts', 'Base URL cho API calls'],
    ]),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ============================================================
// CHAPTER 6: KỸ NGHỆ YÊU CẦU
// ============================================================
function chapter6() {
  return [
    heading1('CHƯƠNG 6: KỸ NGHỆ YÊU CẦU PHẦN MỀM'),
    
    heading2('Bài 6.1. Biểu đồ Use Case tổng quan'),
    para('Hệ thống SmartRent có 4 actor chính tương ứng với 4 vai trò:', { indent: true }),
    bullet('SUPER_ADMIN: Toàn quyền hệ thống — quản lý tenant, user, toàn bộ dữ liệu.'),
    bullet('TENANT_MANAGER: Quản lý phòng, cư dân, hợp đồng, hóa đơn, dịch vụ, tài sản, thông báo.'),
    bullet('GUARD: Xem thông tin phòng, cư dân (chỉ đọc).'),
    bullet('TENANT (Cư dân): Xem hợp đồng/hóa đơn cá nhân, gửi yêu cầu sửa chữa.'),
    emptyLine(),
    boldPara('Hình 6.1: Biểu đồ Use Case tổng quan hệ thống SmartRent'),
    ...insertImage('usecase_diagram.png', 16, 12, 'Hình 6.1: Biểu đồ Use Case tổng quan'),
    emptyLine(),
    para('Bảng tổng hợp các Use Case:', { indent: true }),
    makeTable(['Actor', 'Use Case', 'Module'], [
      ['All', 'Đăng nhập hệ thống', 'Authentication'],
      ['SUPER_ADMIN', 'Quản lý Tenant (Chủ trọ)', 'Tenant'],
      ['SUPER_ADMIN', 'Quản lý User hệ thống', 'User'],
      ['TENANT_MANAGER', 'CRUD Phòng trọ', 'Room'],
      ['TENANT_MANAGER', 'CRUD Cư dân', 'Resident'],
      ['TENANT_MANAGER', 'CRUD Hợp đồng thuê', 'Contract'],
      ['TENANT_MANAGER', 'Thanh lý hợp đồng', 'Contract'],
      ['TENANT_MANAGER', 'CRUD Hóa đơn', 'Bill'],
      ['TENANT_MANAGER', 'Đánh dấu thanh toán', 'Bill'],
      ['TENANT_MANAGER', 'Ghi chỉ số điện/nước', 'Service'],
      ['TENANT_MANAGER', 'Cấu hình đơn giá', 'Service'],
      ['TENANT_MANAGER', 'Tạo hóa đơn tự động', 'Service'],
      ['TENANT_MANAGER', 'Quản lý tài sản phòng', 'Asset'],
      ['TENANT_MANAGER', 'Gửi thông báo / Nhắc nợ', 'Notification'],
      ['TENANT_MANAGER', 'Xem Dashboard', 'Dashboard'],
      ['GUARD', 'Xem danh sách phòng/cư dân', 'Room, Resident'],
      ['TENANT', 'Xem hợp đồng/hóa đơn (Portal)', 'Portal'],
      ['TENANT', 'Gửi yêu cầu sửa chữa', 'Ticket'],
    ]),
    emptyLine(),

    heading2('Bài 6.2. Đặc tả Use Case chi tiết'),
    heading3('UC-01: Đăng nhập hệ thống'),
    makeTable(['Thuộc tính', 'Chi tiết'], [
      ['Tên Use Case', 'Đăng nhập hệ thống'],
      ['Actor', 'Tất cả người dùng'],
      ['Mô tả', 'Người dùng nhập username/password để đăng nhập, hệ thống trả về JWT access token và refresh token'],
      ['Tiền điều kiện', 'Tài khoản đã được tạo trong hệ thống'],
      ['Luồng chính', '1. Nhập username và password → 2. Hệ thống xác thực → 3. Trả JWT tokens → 4. Redirect dashboard'],
      ['Luồng ngoại lệ', 'Sai mật khẩu → Hiển thị lỗi. Tài khoản bị khóa → Thông báo.'],
      ['Hậu điều kiện', 'User được xác thực, token lưu vào localStorage'],
    ]),
    emptyLine(),

    heading3('UC-02: Tạo hợp đồng thuê'),
    makeTable(['Thuộc tính', 'Chi tiết'], [
      ['Tên Use Case', 'Tạo hợp đồng thuê mới'],
      ['Actor', 'TENANT_MANAGER'],
      ['Mô tả', 'Tạo hợp đồng liên kết phòng - cư dân, phòng tự động chuyển trạng thái OCCUPIED'],
      ['Tiền điều kiện', 'Phòng trạng thái VACANT, Cư dân đã tồn tại trong hệ thống'],
      ['Luồng chính', '1. Chọn phòng → 2. Chọn cư dân → 3. Nhập thông tin HĐ (ngày, giá, cọc) → 4. Xác nhận → 5. Phòng chuyển OCCUPIED'],
      ['Luồng ngoại lệ', 'Phòng đã có HĐ ACTIVE → Báo lỗi. Thiếu thông tin → Validation error.'],
      ['Hậu điều kiện', 'Hợp đồng ACTIVE được tạo, Phòng chuyển sang OCCUPIED'],
    ]),
    emptyLine(),

    heading3('UC-03: Thanh lý hợp đồng'),
    makeTable(['Thuộc tính', 'Chi tiết'], [
      ['Tên Use Case', 'Thanh lý hợp đồng thuê'],
      ['Actor', 'TENANT_MANAGER'],
      ['Mô tả', 'Kết thúc hợp đồng, tính toán tiền hoàn trả = Cọc - (Nợ HĐ + Tiền phòng lẻ ngày)'],
      ['Tiền điều kiện', 'Hợp đồng đang ở trạng thái ACTIVE'],
      ['Luồng chính', '1. Chọn HĐ → 2. Xem preview thanh lý (cọc, nợ, trả) → 3. Xác nhận → 4. HĐ→TERMINATED, Phòng→VACANT'],
      ['Business Rule', 'Tiền phòng lẻ ngày = (Giá tháng / 30) × Số ngày ở trong tháng hiện tại'],
      ['Hậu điều kiện', 'HĐ trạng thái TERMINATED, Phòng trở về VACANT, Cư dân gỡ khỏi phòng'],
    ]),
    emptyLine(),

    heading3('UC-04: Ghi chỉ số điện/nước và tạo hóa đơn tự động'),
    makeTable(['Thuộc tính', 'Chi tiết'], [
      ['Tên Use Case', 'Ghi chỉ số điện/nước hàng tháng'],
      ['Actor', 'TENANT_MANAGER'],
      ['Mô tả', 'Ghi chỉ số mới cho tháng hiện tại, hệ thống tính tiền = (Mới - Cũ) × Đơn giá'],
      ['Tiền điều kiện', 'Phòng đã có chỉ số tháng trước, Đơn giá đã cấu hình'],
      ['Luồng chính', '1. Chọn phòng → 2. Nhập chỉ số mới (điện, nước) → 3. Lưu → 4. "Tạo hóa đơn" → 5. Bill tự động'],
      ['Business Rule', 'Hóa đơn = (new_index - old_index) × unit_price'],
      ['Hậu điều kiện', 'Meter reading được lưu, Bill UNPAID được tạo tự động'],
    ]),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ============================================================
// CHAPTER 7: THIẾT KẾ PHẦN MỀM
// ============================================================
function chapter7() {
  return [
    heading1('CHƯƠNG 7: THIẾT KẾ PHẦN MỀM'),
    
    heading2('Bài 7.1. Kiến trúc hệ thống'),
    heading3('7.1.1. Kiến trúc tổng quan'),
    para('SmartRent áp dụng kiến trúc Layered Architecture (Client-Server), tách biệt Frontend và Backend:', { indent: true }),
    bullet('Frontend (React + Vite): Single Page Application chạy trên trình duyệt, giao tiếp Backend qua REST API.'),
    bullet('Backend (Spring Boot): RESTful API server xử lý business logic, authentication, data access.'),
    bullet('Database (PostgreSQL): Lưu trữ dữ liệu quan hệ, sử dụng Flyway migration.'),
    emptyLine(),
    boldPara('Hình 7.1: Kiến trúc tổng quan hệ thống SmartRent'),
    ...insertImage('architecture_diagram.png', 16, 11, 'Hình 7.1: Sơ đồ kiến trúc 3 tầng (Three-tier Architecture)'),
    emptyLine(),

    heading3('7.1.2. Backend Architecture (Layer)'),
    para('Backend được tổ chức theo 4 layer:', { indent: true }),
    makeTable(['Layer', 'Package', 'Chức năng', 'Công nghệ'], [
      ['Presentation', 'controller/', 'Nhận HTTP request, trả response JSON', '@RestController, @RequestMapping'],
      ['Business Logic', 'service/', 'Xử lý nghiệp vụ, validation, business rules', '@Service, @Transactional'],
      ['Data Access', 'repository/', 'Truy vấn database', 'Spring Data JPA, @Repository'],
      ['Domain', 'domain/', 'Entity classes, enums', '@Entity, @Table, Lombok'],
    ]),
    emptyLine(),

    heading3('7.1.3. API Endpoints'),
    makeTable(['Method', 'Endpoint', 'Mô tả'], [
      ['POST', '/api/auth/login', 'Đăng nhập, nhận JWT tokens'],
      ['POST', '/api/auth/register', 'Đăng ký tài khoản mới'],
      ['POST', '/api/auth/refresh', 'Làm mới access token'],
      ['GET/POST', '/api/rooms', 'Danh sách / Tạo phòng trọ'],
      ['PUT/DELETE', '/api/rooms/{id}', 'Cập nhật / Xóa phòng'],
      ['GET/POST', '/api/residents', 'Danh sách / Tạo cư dân'],
      ['GET/POST', '/api/contracts', 'Danh sách / Tạo hợp đồng'],
      ['GET', '/api/contracts/{id}/liquidation', 'Preview thanh lý hợp đồng'],
      ['POST', '/api/contracts/{id}/liquidate', 'Thực hiện thanh lý'],
      ['GET/POST', '/api/bills', 'Danh sách / Tạo hóa đơn'],
      ['POST', '/api/bills/{id}/mark-paid', 'Đánh dấu đã thanh toán'],
      ['GET/POST', '/api/services/meters', 'Xem/Ghi chỉ số điện nước'],
      ['GET/PUT', '/api/services/fees', 'Xem/Cấu hình đơn giá'],
      ['POST', '/api/services/generate-bill', 'Tạo hóa đơn tự động từ chỉ số'],
      ['CRUD', '/api/assets', 'Quản lý tài sản phòng'],
      ['GET/POST', '/api/tickets', 'Yêu cầu sửa chữa'],
      ['POST', '/api/notifications/send', 'Gửi thông báo'],
      ['POST', '/api/notifications/remind-unpaid', 'Nhắc nợ tự động'],
      ['GET', '/api/dashboard/summary', 'Tổng quan thống kê'],
      ['GET', '/api/portal/contract/{token}', 'Cổng cư dân (không cần login)'],
    ]),
    emptyLine(),

    heading2('Bài 7.2. Thiết kế cơ sở dữ liệu (ERD)'),
    boldPara('Hình 7.2: Sơ đồ quan hệ thực thể (ERD) - Database Diagram'),
    ...insertImage('erd_diagram.png', 16, 12, 'Hình 7.2: Entity Relationship Diagram - SmartRent Database (13 bảng)'),
    emptyLine(),
    para('Mô tả quan hệ giữa các thực thể:', { indent: true }),
    para('1 Tenant (Chủ trọ) → có nhiều Rooms, Users, Residents', { indent: true }),
    para('1 Room → có nhiều Residents (qua Contracts), Bills, MeterReadings, RoomAssets', { indent: true }),
    para('1 Contract → liên kết 1 Room + 1 Resident (quan hệ 1-1-1)', { indent: true }),
    para('1 Bill → thuộc 1 Room, 1 Tenant', { indent: true }),
    para('1 MeterReading → thuộc 1 Room (ghi điện/nước theo tháng)', { indent: true }),
    para('1 Notification → thuộc 1 Tenant, gửi đến nhiều Residents', { indent: true }),
    emptyLine(),

    heading3('Chi tiết bảng: rooms'),
    makeTable(['Cột', 'Kiểu dữ liệu', 'Ràng buộc', 'Mô tả'], [
      ['id', 'BIGSERIAL', 'PRIMARY KEY', 'Mã phòng (auto increment)'],
      ['tenant_id', 'BIGINT', 'FK → tenants(id), NOT NULL', 'Mã chủ trọ'],
      ['room_number', 'VARCHAR(50)', 'NOT NULL, UNIQUE(tenant_id)', 'Số phòng'],
      ['floor', 'INTEGER', '', 'Tầng'],
      ['area', 'DECIMAL(10,2)', '', 'Diện tích (m²)'],
      ['status', 'VARCHAR(30)', "DEFAULT 'VACANT'", 'Trạng thái: VACANT, OCCUPIED, MAINTENANCE'],
      ['type', 'VARCHAR(30)', "DEFAULT 'STANDARD'", 'Loại: STANDARD, PENTHOUSE'],
      ['price', 'DECIMAL(15,2)', '', 'Giá thuê/tháng (VNĐ)'],
      ['description', 'TEXT', '', 'Mô tả thêm'],
      ['created_at', 'TIMESTAMP', 'DEFAULT NOW()', 'Ngày tạo'],
      ['updated_at', 'TIMESTAMP', 'DEFAULT NOW()', 'Ngày cập nhật'],
    ]),
    emptyLine(),

    heading3('Chi tiết bảng: contracts'),
    makeTable(['Cột', 'Kiểu dữ liệu', 'Ràng buộc', 'Mô tả'], [
      ['id', 'BIGSERIAL', 'PRIMARY KEY', 'Mã hợp đồng'],
      ['tenant_id', 'BIGINT', 'FK → tenants(id)', 'Mã chủ trọ'],
      ['room_id', 'BIGINT', 'FK → rooms(id)', 'Mã phòng'],
      ['resident_id', 'BIGINT', 'FK → residents(id)', 'Mã cư dân'],
      ['contract_number', 'VARCHAR(100)', 'NOT NULL, UNIQUE(tenant_id)', 'Số hợp đồng'],
      ['start_date', 'DATE', 'NOT NULL', 'Ngày bắt đầu'],
      ['end_date', 'DATE', 'NOT NULL', 'Ngày kết thúc'],
      ['monthly_rent', 'DECIMAL(15,2)', 'NOT NULL', 'Giá thuê/tháng'],
      ['deposit_amount', 'DECIMAL(15,2)', 'NOT NULL', 'Tiền đặt cọc'],
      ['status', 'VARCHAR(30)', "DEFAULT 'ACTIVE'", 'ACTIVE, EXPIRED, TERMINATED'],
      ['notes', 'TEXT', '', 'Ghi chú'],
    ]),
    emptyLine(),

    heading2('Bài 7.3. Thiết kế giao diện'),
    para('Hệ thống sử dụng Material Tailwind React v2 với Indigo Design System:', { indent: true }),
    bullet('Theme chính: Indigo (bg-indigo-600) với Dark Mode toggle.'),
    bullet('Layout: Fixed-height dashboard, Sidebar cố định bên trái, Content area bên phải.'),
    bullet('Components: Table với pagination, Modal form, Card statistics, ApexCharts biểu đồ.'),
    bullet('Responsive: Desktop (Sidebar mở), Tablet (Sidebar thu gọn), Mobile (Sidebar ẩn, hamburger menu).'),
    emptyLine(),
    para('Các trang giao diện chính:', { indent: true }),
    makeTable(['Trang', 'File', 'Chức năng'], [
      ['Dashboard', 'home.jsx', 'Tổng quan: 4 card thống kê + biểu đồ doanh thu'],
      ['Phòng trọ', 'rooms.jsx + room-form.jsx', 'Danh sách phòng + Modal tạo/sửa'],
      ['Cư dân', 'residents.jsx + resident-form.jsx', 'Danh sách cư dân + Modal tạo/sửa'],
      ['Hợp đồng', 'contracts.jsx + contract-form.jsx', 'DS hợp đồng + Modal + Thanh lý'],
      ['Hóa đơn', 'bills.jsx + bill-form.jsx', 'DS hóa đơn + Modal + Mark paid'],
      ['Dịch vụ', 'services.jsx + meter-reading.jsx', 'Ghi chỉ số + Cấu hình đơn giá'],
      ['Tài sản', '(trong rooms) + asset-modal.jsx', 'Quản lý tài sản theo phòng'],
      ['Tickets', 'tickets.jsx + ticket-modal.jsx', 'DS yêu cầu sửa chữa'],
      ['Thông báo', 'notifications.jsx', 'Gửi thông báo + Nhắc nợ'],
      ['Profile', 'profile.jsx', 'Thông tin chủ trọ'],
    ]),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ============================================================
// CHAPTER 8: XÂY DỰNG PHẦN MỀM
// ============================================================
function chapter8() {
  return [
    heading1('CHƯƠNG 8: XÂY DỰNG PHẦN MỀM'),
    
    heading2('Bài 8.1. Cấu trúc mã nguồn'),
    heading3('8.1.1. Convention đặt tên'),
    makeTable(['Thành phần', 'Convention', 'Ví dụ'], [
      ['Entity', 'Tên bảng số ít, PascalCase', 'Room.java, Contract.java, Bill.java'],
      ['Controller', '{Entity}Controller', 'RoomController.java, ContractController.java'],
      ['Service', '{Entity}Service (interface) + impl/', 'ContractService.java, ContractServiceImpl.java'],
      ['Repository', '{Entity}Repository', 'RoomRepository.java'],
      ['DTO', '{Entity}RequestDTO, {Entity}ResponseDTO', 'RoomRequestDTO.java'],
      ['Migration', 'V{N}__{Description}.sql', 'V6__Create_rooms_table.sql'],
      ['Frontend Page', '{feature}.jsx (list), {feature}-form.jsx (modal)', 'rooms.jsx, room-form.jsx'],
      ['API Module', '{feature}.ts', 'src/api/room.ts, src/api/contract.ts'],
    ]),
    emptyLine(),

    heading3('8.1.2. Luồng xử lý Request'),
    para('Mỗi request từ Frontend đi qua các layer như sau:', { indent: true }),
    para('Frontend (apiFetch) → HTTP Request → Controller (@RestController) → Service (@Service) → Repository (JPA) → PostgreSQL', { indent: true }),
    para('PostgreSQL → Repository → Service (transform to DTO) → Controller (JSON response) → Frontend', { indent: true }),
    emptyLine(),
    boldPara('Hình 8.1: Biểu đồ trình tự (Sequence Diagram) - Thanh lý hợp đồng'),
    ...insertImage('sequence_diagram.png', 16, 11, 'Hình 8.1: Sequence Diagram - Luồng thanh lý hợp đồng (Contract Liquidation)'),
    emptyLine(),

    heading2('Bài 8.2. Quy tắc lập trình'),
    bullet('Backend: Tuân thủ Java Convention, sử dụng Lombok (@Data, @Builder, @AllArgsConstructor) để giảm boilerplate.'),
    bullet('Frontend: Sử dụng ES6+, functional components + hooks (useState, useEffect), async/await cho API calls.'),
    bullet('API: Chuẩn RESTful, response format: { success: boolean, message: string, data: object }.'),
    bullet('Error handling: GlobalExceptionHandler trên backend, try-catch + SweetAlert2 trên frontend.'),
    bullet('Database: Mọi bảng đều có tenant_id để đảm bảo multi-tenant data isolation.'),
    emptyLine(),

    heading2('Bài 8.3. Code mẫu minh họa'),
    heading3('8.3.1. Entity (Domain Layer)'),
    para('Ví dụ: Room.java — sử dụng JPA annotations + Lombok:', { indent: true }),
    para('@Entity @Table(name="rooms") @Data @NoArgsConstructor @AllArgsConstructor', { italics: true }),
    para('Các trường: id (BIGSERIAL PK), tenant (ManyToOne), roomNumber, floor, area, status (enum: VACANT, OCCUPIED, MAINTENANCE), type (enum: STANDARD, PENTHOUSE), price, description, createdAt, updatedAt.', { indent: true }),
    emptyLine(),

    heading3('8.3.2. Controller (Presentation Layer)'),
    para('Ví dụ: RoomController.java:', { indent: true }),
    para('@RestController @RequestMapping("/api/rooms")', { italics: true }),
    bullet('GET /api/rooms — getAll(page, size, status, floor, type, search) → Page<RoomResponseDTO>'),
    bullet('POST /api/rooms — create(RoomRequestDTO) → RoomResponseDTO'),
    bullet('PUT /api/rooms/{id} — update(id, RoomRequestDTO) → RoomResponseDTO'),
    bullet('DELETE /api/rooms/{id} — delete(id) → void'),
    emptyLine(),

    heading3('8.3.3. Service (Business Logic Layer)'),
    para('Ví dụ business rule trong ContractService:', { indent: true }),
    para('Khi tạo Contract ACTIVE → tự động cập nhật Room.status = OCCUPIED', { indent: true }),
    para('Khi thanh lý (liquidate) → tính: Hoàn trả = Cọc - (Tổng nợ HĐ chưa trả + Tiền phòng lẻ ngày)', { indent: true }),
    para('Tiền phòng lẻ ngày = (monthly_rent / 30) × days_in_current_month', { indent: true }),
    emptyLine(),

    heading3('8.3.4. Frontend API Module'),
    para('Ví dụ: src/api/room.ts:', { indent: true }),
    para("import { apiFetch } from '@/lib/http'; import { getTenantId } from '@/api/auth';", { italics: true }),
    para('export async function getRooms(params) { return apiFetch(`/api/rooms?tenantId=${getTenantId()}&...`); }', { italics: true }),
    emptyLine(),

    heading3('8.3.5. DataInitializer (Seed Data)'),
    para('File DataInitializer.java tự động tạo dữ liệu mẫu khi hệ thống khởi động:', { indent: true }),
    bullet('1 Tenant mặc định: "Hệ Thống SmartRent"'),
    bullet('4 User test: superadmin, manager, guard, tenant (password: 123456)'),
    bullet('Đơn giá mặc định: Điện 3,500 VNĐ/kWh, Nước 20,000 VNĐ/m³'),
    bullet('20 Phòng mẫu (12 OCCUPIED, 8 VACANT)'),
    bullet('12 Cư dân + 12 Hợp đồng ACTIVE'),
    bullet('24 Meter Readings (điện + nước cho 12 phòng)'),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ============================================================
// CHAPTER 9: ĐẢM BẢO CHẤT LƯỢNG
// ============================================================
function chapter9() {
  return [
    heading1('CHƯƠNG 9: ĐẢM BẢO CHẤT LƯỢNG PHẦN MỀM'),
    
    heading2('Bài 9.1. Kiểm thử hộp trắng (White-box Testing)'),
    para('Kiểm thử hộp trắng tập trung vào logic bên trong code, đặc biệt các business rules phức tạp:', { indent: true }),
    
    heading3('9.1.1. Kiểm thử phương thức thanh lý hợp đồng'),
    para('Method: ContractService.getLiquidationSummary(contractId)', { indent: true }),
    para('Logic: Hoàn trả = Tiền cọc - (Tổng nợ chưa trả + Tiền phòng lẻ ngày)', { indent: true }),
    makeTable(['Test Case', 'Input', 'Expected Output', 'Kết quả'], [
      ['TC-W01', 'Cọc = 5M, Nợ = 0, Ngày ở = 15', 'Hoàn = 5M - 0 - 2.5M = 2.5M', 'Pass'],
      ['TC-W02', 'Cọc = 5M, Nợ = 3M, Ngày ở = 30', 'Hoàn = 5M - 3M - 5M = -3M (Cư dân nợ)', 'Pass'],
      ['TC-W03', 'Cọc = 5M, Nợ = 0, Ngày ở = 0', 'Hoàn = 5M - 0 - 0 = 5M', 'Pass'],
      ['TC-W04', 'HĐ đã TERMINATED', 'Throw: Hợp đồng đã kết thúc', 'Pass'],
    ]),
    emptyLine(),

    heading3('9.1.2. Kiểm thử tính tiền điện/nước'),
    para('Method: ServiceManagementService.generateBill(roomId, month, year)', { indent: true }),
    para('Logic: Tiền = (new_index - old_index) × unit_price', { indent: true }),
    makeTable(['Test Case', 'Input', 'Expected Output', 'Kết quả'], [
      ['TC-W05', 'old=100, new=150, giá=3500', 'Bill điện = 50 × 3500 = 175,000 VNĐ', 'Pass'],
      ['TC-W06', 'old=10, new=15, giá=20000', 'Bill nước = 5 × 20000 = 100,000 VNĐ', 'Pass'],
      ['TC-W07', 'old=100, new=100 (không dùng)', 'Bill = 0 × 3500 = 0 VNĐ', 'Pass'],
      ['TC-W08', 'Chưa có chỉ số tháng trước', 'Throw: Chưa có dữ liệu tháng trước', 'Pass'],
    ]),
    emptyLine(),

    heading2('Bài 9.2. Kiểm thử hộp đen (Black-box Testing)'),
    para('Kiểm thử hộp đen tập trung vào input/output mà không quan tâm đến logic bên trong:', { indent: true }),
    
    heading3('9.2.1. Kiểm thử chức năng Đăng nhập'),
    makeTable(['Test Case', 'Input', 'Expected', 'Actual', 'Status'], [
      ['TC-B01', 'username="superadmin", password="123456"', 'Đăng nhập thành công, redirect dashboard', 'Đúng', 'Pass'],
      ['TC-B02', 'username="superadmin", password="wrong"', 'Hiển thị "Sai mật khẩu"', 'Đúng', 'Pass'],
      ['TC-B03', 'username="", password=""', 'Hiển thị "Vui lòng nhập đầy đủ"', 'Đúng', 'Pass'],
      ['TC-B04', 'username="nonexist", password="123456"', 'Hiển thị "Tài khoản không tồn tại"', 'Đúng', 'Pass'],
    ]),
    emptyLine(),

    heading3('9.2.2. Kiểm thử chức năng Tạo phòng'),
    makeTable(['Test Case', 'Input', 'Expected', 'Actual', 'Status'], [
      ['TC-B05', 'Số phòng="101", Tầng=1, Giá=3M, Loại=STANDARD', 'Tạo thành công', 'Đúng', 'Pass'],
      ['TC-B06', 'Số phòng="" (trống)', 'Validation: "Số phòng không được trống"', 'Đúng', 'Pass'],
      ['TC-B07', 'Số phòng="101" (trùng)', 'Lỗi: "Số phòng đã tồn tại"', 'Đúng', 'Pass'],
      ['TC-B08', 'Giá = -1000000 (âm)', 'Validation: "Giá phải lớn hơn 0"', 'Đúng', 'Pass'],
    ]),
    emptyLine(),

    heading3('9.2.3. Kiểm thử chức năng Tạo hợp đồng'),
    makeTable(['Test Case', 'Input', 'Expected', 'Actual', 'Status'], [
      ['TC-B09', 'Phòng VACANT + Cư dân + Đầy đủ thông tin', 'Tạo thành công, phòng → OCCUPIED', 'Đúng', 'Pass'],
      ['TC-B10', 'Phòng đã OCCUPIED', 'Lỗi: "Phòng đã có người thuê"', 'Đúng', 'Pass'],
      ['TC-B11', 'Ngày kết thúc < Ngày bắt đầu', 'Lỗi: "Ngày không hợp lệ"', 'Đúng', 'Pass'],
      ['TC-B12', 'Tiền cọc = 0', 'Tạo thành công (cọc = 0 hợp lệ)', 'Đúng', 'Pass'],
    ]),
    emptyLine(),

    heading3('9.2.4. Bảng quyết định (Decision Table) - Thanh lý hợp đồng'),
    makeTable(['Điều kiện', 'R1', 'R2', 'R3', 'R4'], [
      ['HĐ trạng thái ACTIVE?', 'Có', 'Có', 'Có', 'Không'],
      ['Có hóa đơn chưa trả?', 'Không', 'Có', 'Có', '-'],
      ['Cọc >= Tổng nợ?', '-', 'Có', 'Không', '-'],
      ['Kết quả', 'Hoàn trả toàn bộ cọc', 'Hoàn trả = Cọc - Nợ', 'Cư dân cần trả thêm', 'Báo lỗi: HĐ không ACTIVE'],
    ]),
    emptyLine(),

    heading2('Kết luận'),
    para('Dự án SmartRent đã được phát triển theo quy trình Agile/Scrum, áp dụng đầy đủ các phương pháp kỹ nghệ phần mềm từ phân tích yêu cầu, thiết kế kiến trúc, quản lý cấu hình đến kiểm thử chất lượng. Hệ thống đáp ứng đầy đủ các yêu cầu chức năng và phi chức năng đề ra, sẵn sàng cho việc triển khai thực tế.', { indent: true }),
    emptyLine(),
    para('Một số hướng phát triển tiếp theo:', { indent: true }),
    bullet('Tích hợp thanh toán online (VNPay, MoMo).'),
    bullet('Ứng dụng mobile (React Native).'),
    bullet('Tự động hoá gửi hóa đơn qua email hàng tháng.'),
    bullet('Báo cáo BI (Business Intelligence) nâng cao.'),
    bullet('Deploy lên cloud (AWS/GCP) với CI/CD pipeline.'),
  ];
}

// ============================================================
// MAIN: Generate Document
// ============================================================
async function main() {
  console.log('📄 Generating SmartRent Project Documentation...');

  const doc = new Document({
    styles: {
      default: {
        document: { run: { font: 'Times New Roman', size: 26 } },
      },
    },
    sections: [{
      properties: {
        page: { margin: { top: 1440, right: 1080, bottom: 1440, left: 1440 } },
      },
      children: [
        ...titlePage(),
        ...tableOfContents(),
        ...chapter1(),
        ...chapter2(),
        ...chapter3(),
        ...chapter4(),
        ...chapter5(),
        ...chapter6(),
        ...chapter7(),
        ...chapter8(),
        ...chapter9(),
      ],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync('TaiLieu_DuAn_SmartRent.docx', buffer);
  console.log('✅ Generated: TaiLieu_DuAn_SmartRent.docx');
  console.log(`📊 File size: ${(buffer.length / 1024).toFixed(1)} KB`);
}

main().catch(console.error);
