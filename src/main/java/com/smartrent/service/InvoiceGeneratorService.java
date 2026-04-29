package com.smartrent.service;

import com.smartrent.domain.Bill;
import com.smartrent.domain.Room;
import com.smartrent.domain.Tenant;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Slf4j
@Service
public class InvoiceGeneratorService {

    public byte[] generateInvoiceExcel(Bill bill, String residentName) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Hoa_Don");

            // Define styles
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

            // Title
            Row titleRow = sheet.createRow(0);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("CHI TIẾT HÓA ĐƠN");
            titleCell.setCellStyle(headerStyle);
            sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(0, 0, 0, 3));

            // Info rows
            int rowIdx = 2;
            
            Room room = bill.getRoom();
            Tenant tenant = bill.getTenant();
            
            createRow(sheet, rowIdx++, "Phòng:", room != null ? room.getRoomNumber() : "Khác", boldStyle);
            if (residentName != null && !residentName.isBlank()) {
                createRow(sheet, rowIdx++, "Khách thuê:", residentName, boldStyle);
            }
            createRow(sheet, rowIdx++, "Loại hóa đơn:", bill.getBillType().name(), boldStyle);
            
            String dueDate = bill.getDueDate() != null ? bill.getDueDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "N/A";
            createRow(sheet, rowIdx++, "Hạn thanh toán:", dueDate, boldStyle);
            
            createRow(sheet, rowIdx++, "Chủ trọ:", tenant.getName(), boldStyle);
            createRow(sheet, rowIdx++, "SĐT Chủ trọ:", tenant.getPhone(), boldStyle);
            
            // Banking details
            rowIdx++;
            createRow(sheet, rowIdx++, "THÔNG TIN THANH TOÁN", "", boldStyle);
            createRow(sheet, rowIdx++, "Ngân hàng:", tenant.getBankName() != null ? tenant.getBankName() : "N/A", null);
            createRow(sheet, rowIdx++, "Số tài khoản:", tenant.getBankAccount() != null ? tenant.getBankAccount() : "N/A", null);
            createRow(sheet, rowIdx++, "Chủ tài khoản:", tenant.getBankOwner() != null ? tenant.getBankOwner() : "N/A", null);

            // Amount details
            rowIdx++;
            Row amountHeaderRow = sheet.createRow(rowIdx++);
            amountHeaderRow.createCell(0).setCellValue("Mô tả");
            amountHeaderRow.createCell(1).setCellValue("Thành tiền (VNĐ)");
            amountHeaderRow.getCell(0).setCellStyle(boldStyle);
            amountHeaderRow.getCell(1).setCellStyle(boldStyle);

            Row amountDataRow = sheet.createRow(rowIdx++);
            amountDataRow.createCell(0).setCellValue(bill.getDescription() != null ? bill.getDescription() : "Chi phí phòng");
            amountDataRow.createCell(1).setCellValue(String.format("%,.0f", bill.getAmount()));

            Row totalRow = sheet.createRow(rowIdx++);
            totalRow.createCell(0).setCellValue("TỔNG CỘNG:");
            totalRow.createCell(1).setCellValue(String.format("%,.0f", bill.getAmount()));
            totalRow.getCell(0).setCellStyle(boldStyle);
            totalRow.getCell(1).setCellStyle(boldStyle);

            // Auto-size columns
            sheet.autoSizeColumn(0);
            sheet.autoSizeColumn(1);

            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            log.error("Error generating Excel invoice", e);
            throw new RuntimeException("Không thể tạo file hóa đơn", e);
        }
    }

    private void createRow(Sheet sheet, int rowIndex, String label, String value, CellStyle labelStyle) {
        Row row = sheet.createRow(rowIndex);
        Cell cell0 = row.createCell(0);
        cell0.setCellValue(label);
        if (labelStyle != null) {
            cell0.setCellStyle(labelStyle);
        }
        row.createCell(1).setCellValue(value);
    }
}
