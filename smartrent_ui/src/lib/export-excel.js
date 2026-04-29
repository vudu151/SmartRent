import * as XLSX from "xlsx";

/**
 * Xuất dữ liệu ra file Excel (.xlsx)
 * @param {Array<Object>} data - Mảng object dữ liệu
 * @param {Array<{header: string, key: string, width?: number}>} columns - Cột hiển thị
 * @param {string} fileName - Tên file (không cần .xlsx)
 * @param {string} sheetName - Tên sheet
 */
export function exportToExcel(data, columns, fileName = "export", sheetName = "Sheet1") {
  // Map data theo columns
  const rows = data.map((item) => {
    const row = {};
    columns.forEach((col) => {
      row[col.header] = col.formatter ? col.formatter(item[col.key], item) : item[col.key];
    });
    return row;
  });

  const ws = XLSX.utils.json_to_sheet(rows);

  // Set column widths
  ws["!cols"] = columns.map((col) => ({ wch: col.width || 16 }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${fileName}.xlsx`);
}
