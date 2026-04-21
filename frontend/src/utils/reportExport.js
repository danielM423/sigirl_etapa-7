import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportToExcel = (rows = [], fileName = 'reporte-sigirl.xlsx', sheetName = 'Reporte') => {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(rows);
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
