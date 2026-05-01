package com.smartrent.service;

import com.smartrent.domain.Bill;
import com.smartrent.domain.Room;
import com.smartrent.domain.Tenant;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;

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

    /**
     * Generate a COMBINED invoice Excel for multiple bills of the same room.
     * Groups all bill types (Rent, Electricity, Water, Service, Parking, Internet) into one sheet.
     */
    public byte[] generateCombinedInvoice(List<Bill> bills, String residentName) {
        if (bills == null || bills.isEmpty()) {
            throw new IllegalArgumentException("Danh sách hóa đơn trống");
        }

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Hoa_Don_Tong_Hop");

            // Styles
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

            CellStyle totalStyle = workbook.createCellStyle();
            Font totalFont = workbook.createFont();
            totalFont.setBold(true);
            totalFont.setFontHeightInPoints((short) 12);
            totalStyle.setFont(totalFont);

            // Use first bill for room/tenant info
            Bill firstBill = bills.get(0);
            Room room = firstBill.getRoom();
            Tenant tenant = firstBill.getTenant();

            // Title
            Row titleRow = sheet.createRow(0);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("HÓA ĐƠN TỔNG HỢP");
            titleCell.setCellStyle(headerStyle);
            sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(0, 0, 0, 3));

            // Info
            int rowIdx = 2;
            createRow(sheet, rowIdx++, "Phòng:", room != null ? room.getRoomNumber() : "Khác", boldStyle);
            if (residentName != null && !residentName.isBlank()) {
                createRow(sheet, rowIdx++, "Khách thuê:", residentName, boldStyle);
            }
            
            String dueDate = firstBill.getDueDate() != null 
                ? firstBill.getDueDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "N/A";
            createRow(sheet, rowIdx++, "Kỳ thanh toán:", dueDate, boldStyle);
            createRow(sheet, rowIdx++, "Chủ trọ:", tenant.getName(), boldStyle);
            createRow(sheet, rowIdx++, "SĐT Chủ trọ:", tenant.getPhone(), boldStyle);

            // Banking details
            rowIdx++;
            createRow(sheet, rowIdx++, "THÔNG TIN THANH TOÁN", "", boldStyle);
            createRow(sheet, rowIdx++, "Ngân hàng:", tenant.getBankName() != null ? tenant.getBankName() : "N/A", null);
            createRow(sheet, rowIdx++, "Số tài khoản:", tenant.getBankAccount() != null ? tenant.getBankAccount() : "N/A", null);
            createRow(sheet, rowIdx++, "Chủ tài khoản:", tenant.getBankOwner() != null ? tenant.getBankOwner() : "N/A", null);

            // Table header
            rowIdx++;
            Row tableHeader = sheet.createRow(rowIdx++);
            String[] headers = {"STT", "Loại chi phí", "Mô tả", "Thành tiền (VNĐ)"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = tableHeader.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(boldStyle);
            }

            // Bill detail rows
            BigDecimal grandTotal = BigDecimal.ZERO;
            int stt = 1;
            for (Bill bill : bills) {
                Row dataRow = sheet.createRow(rowIdx++);
                dataRow.createCell(0).setCellValue(stt++);
                dataRow.createCell(1).setCellValue(getBillTypeLabel(bill.getBillType()));
                dataRow.createCell(2).setCellValue(bill.getDescription() != null ? bill.getDescription() : "");
                dataRow.createCell(3).setCellValue(String.format("%,.0f", bill.getAmount()));
                grandTotal = grandTotal.add(bill.getAmount());
            }

            // Grand total
            rowIdx++;
            Row totalRow = sheet.createRow(rowIdx++);
            totalRow.createCell(0).setCellValue("");
            totalRow.createCell(1).setCellValue("");
            Cell totalLabelCell = totalRow.createCell(2);
            totalLabelCell.setCellValue("TỔNG CỘNG:");
            totalLabelCell.setCellStyle(totalStyle);
            Cell totalValueCell = totalRow.createCell(3);
            totalValueCell.setCellValue(String.format("%,.0f VNĐ", grandTotal));
            totalValueCell.setCellStyle(totalStyle);

            // Auto-size
            for (int i = 0; i < 4; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            log.error("Error generating combined Excel invoice", e);
            throw new RuntimeException("Không thể tạo hóa đơn tổng hợp", e);
        }
    }

    private String getBillTypeLabel(Bill.BillType type) {
        if (type == null) return "Khác";
        return switch (type) {
            case RENT -> "Tiền thuê phòng";
            case ELECTRICITY -> "Tiền điện";
            case WATER -> "Tiền nước";
            case SERVICE -> "Phí dịch vụ";
            case PARKING -> "Phí giữ xe";
            case INTERNET -> "Phí internet";
            default -> "Chi phí khác";
        };
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
