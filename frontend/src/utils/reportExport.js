import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportToExcel = (rows = [], fileName = 'reporte-sigirl.xlsx', sheetName = 'Reporte') => {
  const workbook = XLSX.utils.book_new();
  const safeRows = rows.map((row) => Object.fromEntries(
    Object.entries(row).map(([key, value]) => [key, value == null ? '' : typeof value === 'object' ? JSON.stringify(value) : value])
  ));
  const worksheet = XLSX.utils.json_to_sheet(safeRows);
  const columns = Object.keys(safeRows[0] || {});
  worksheet['!cols'] = columns.map((column) => ({
    wch: Math.min(42, Math.max(column.length + 2, ...safeRows.map((row) => String(row[column] ?? '').length + 2))),
  }));
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, fileName);
};

export const exportToPdf = ({ title = 'Reporte SIGIRL', headers = [], rows = [], fileName = 'reporte-sigirl.pdf' }) => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(title, 14, 16);

  autoTable(doc, {
    startY: 24,
    head: [headers],
    body: rows,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [16, 185, 129] },
  });

  doc.save(fileName);
};
