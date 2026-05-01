package com.smartrent.service;

import com.smartrent.domain.Bill;
import com.smartrent.dto.ApiResponse;
import com.smartrent.dto.dashboard.ReportDTO;
import com.smartrent.repository.BillRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReportService {

    private final BillRepository billRepository;

    @Transactional(readOnly = true)
    public ApiResponse<ReportDTO> getRevenueReport(Long tenantId, Integer month, Integer year) {
        LocalDateTime startDate;
        LocalDateTime endDate;

        if (month != null && year != null) {
            YearMonth ym = YearMonth.of(year, month);
            startDate = ym.atDay(1).atStartOfDay();
            endDate = ym.atEndOfMonth().atTime(23, 59, 59);
        } else if (year != null) {
            startDate = LocalDateTime.of(year, 1, 1, 0, 0, 0);
            endDate = LocalDateTime.of(year, 12, 31, 23, 59, 59);
        } else {
            // Default to current month
            YearMonth ym = YearMonth.now();
            startDate = ym.atDay(1).atStartOfDay();
            endDate = ym.atEndOfMonth().atTime(23, 59, 59);
        }

        // Fetch aggregated data
        List<Object[]> typeData = billRepository.sumRevenueByType(tenantId, startDate, endDate);
        List<Object[]> roomData = billRepository.sumRevenueByRoom(tenantId, startDate, endDate);

        BigDecimal totalRevenue = BigDecimal.ZERO;
        List<ReportDTO.RevenueByType> revenueByType = new ArrayList<>();
        List<ReportDTO.RevenueByRoom> revenueByRoom = new ArrayList<>();

        for (Object[] row : typeData) {
            String typeStr = row[0] instanceof Bill.BillType ? ((Bill.BillType) row[0]).name() : String.valueOf(row[0]);
            BigDecimal amount = getBigDecimal(row[1]);
            
            revenueByType.add(ReportDTO.RevenueByType.builder()
                    .type(typeStr)
                    .amount(amount)
                    .build());
            totalRevenue = totalRevenue.add(amount);
        }

        for (Object[] row : roomData) {
            String roomNumber = row[0] != null ? String.valueOf(row[0]) : "Khác";
            BigDecimal amount = getBigDecimal(row[1]);
            
            revenueByRoom.add(ReportDTO.RevenueByRoom.builder()
                    .roomNumber(roomNumber)
                    .amount(amount)
                    .build());
        }

        ReportDTO report = ReportDTO.builder()
                .totalRevenue(totalRevenue)
                .revenueByType(revenueByType)
                .revenueByRoom(revenueByRoom)
                .build();

        return ApiResponse.success(report, "Fetched report data successfully");
    }

    public byte[] exportRevenueReportToExcel(Long tenantId, Integer month, Integer year) {
        ApiResponse<ReportDTO> response = getRevenueReport(tenantId, month, year);
        ReportDTO report = response.getData();

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Doanh_Thu");

            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setFontHeightInPoints((short) 14);
            headerStyle.setFont(headerFont);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);

            CellStyle boldStyle = workbook.createCellStyle();
            Font boldFont = workbook.createFont();
            boldFont.setBold(true);
            boldStyle.setFont(boldFont);

            Row titleRow = sheet.createRow(0);
            Cell titleCell = titleRow.createCell(0);
            String title = "BÁO CÁO DOANH THU" + (month != null ? " THÁNG " + month : "") + (year != null ? " NĂM " + year : "");
            titleCell.setCellValue(title);
            titleCell.setCellStyle(headerStyle);
            sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(0, 0, 0, 1));

            int rowIdx = 2;
            Row totalRow = sheet.createRow(rowIdx++);
            totalRow.createCell(0).setCellValue("Tổng Doanh Thu:");
            totalRow.getCell(0).setCellStyle(boldStyle);
            totalRow.createCell(1).setCellValue(String.format("%,.0f VNĐ", report.getTotalRevenue()));
            totalRow.getCell(1).setCellStyle(boldStyle);

            rowIdx++;
            Row typeTitle = sheet.createRow(rowIdx++);
            typeTitle.createCell(0).setCellValue("1. CHI TIẾT THEO LOẠI");
            typeTitle.getCell(0).setCellStyle(boldStyle);

            Row typeHeader = sheet.createRow(rowIdx++);
            typeHeader.createCell(0).setCellValue("Loại Phí");
            typeHeader.getCell(0).setCellStyle(boldStyle);
            typeHeader.createCell(1).setCellValue("Doanh Thu (VNĐ)");
            typeHeader.getCell(1).setCellStyle(boldStyle);

            for (ReportDTO.RevenueByType item : report.getRevenueByType()) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(getBillTypeLabel(item.getType()));
                row.createCell(1).setCellValue(String.format("%,.0f", item.getAmount()));
            }

            rowIdx++;
            Row roomTitle = sheet.createRow(rowIdx++);
            roomTitle.createCell(0).setCellValue("2. CHI TIẾT THEO PHÒNG");
            roomTitle.getCell(0).setCellStyle(boldStyle);

            Row roomHeader = sheet.createRow(rowIdx++);
            roomHeader.createCell(0).setCellValue("Phòng");
            roomHeader.getCell(0).setCellStyle(boldStyle);
            roomHeader.createCell(1).setCellValue("Doanh Thu (VNĐ)");
            roomHeader.getCell(1).setCellStyle(boldStyle);

            for (ReportDTO.RevenueByRoom item : report.getRevenueByRoom()) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(item.getRoomNumber());
                row.createCell(1).setCellValue(String.format("%,.0f", item.getAmount()));
            }

            sheet.autoSizeColumn(0);
            sheet.autoSizeColumn(1);

            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            log.error("Error generating Excel report", e);
            throw new RuntimeException("Không thể tạo file báo cáo Excel", e);
        }
    }

    private String getBillTypeLabel(String type) {
        if (type == null) return "Khác";
        return switch (type) {
            case "RENT" -> "Tiền thuê phòng";
            case "ELECTRICITY" -> "Tiền điện";
            case "WATER" -> "Tiền nước";
            case "SERVICE" -> "Phí dịch vụ";
            case "PARKING" -> "Phí giữ xe";
            case "INTERNET" -> "Phí internet";
            default -> "Chi phí khác";
        };
    }

    private BigDecimal getBigDecimal(Object value) {
        if (value == null) return BigDecimal.ZERO;
        if (value instanceof BigDecimal) return (BigDecimal) value;
        if (value instanceof Number) return BigDecimal.valueOf(((Number) value).doubleValue());
        return new BigDecimal(value.toString());
    }
}
