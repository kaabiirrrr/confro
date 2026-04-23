import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const loadImage = (url) => {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = url;
  });
};

export const generateCustomPDF = async ({ filename, title, tableColumns, tableRows, summaryRows = [] }) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Timestamps on right side
  const timestamp = new Date().toLocaleString();
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${timestamp}`, pageWidth - 14, 25, { align: 'right' });
  
  // Try to load logo
  try {
    const logoImg = await loadImage('/Logo2.png');
    doc.addImage(logoImg, 'PNG', 14, 15, 35, 12);
  } catch (err) {
    // If it fails, fallback to text
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(14, 165, 233); // Website cyan color
    doc.text("Connect", 14, 25);
  }

  // Billed To Info
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const clientName = user.name || 'Client Name';
  const clientEmail = user.email || 'client@example.com';
  const clientPhone = user.phone || '+1 234 567 8900';

  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  doc.setFont("helvetica", "bold");
  doc.text("Billed To:", 14, 40);
  
  doc.setFont("helvetica", "normal");
  doc.text(clientName, 14, 45);
  doc.text(clientEmail, 14, 50);
  doc.text(clientPhone, 14, 55);

  // Set Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(title, 14, 70);

  // Add Table
  autoTable(doc, {
    head: [tableColumns],
    body: tableRows,
    startY: 75,
    theme: 'plain',
    headStyles: { textColor: [14, 165, 233], fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 4, textColor: [60, 60, 60] },
    willDrawCell: function (data) {
      if (data.section === 'head') {
        doc.setDrawColor(14, 165, 233);
        doc.setLineWidth(0.5);
        doc.line(data.cell.x, data.cell.y + data.cell.height, data.cell.x + data.cell.width, data.cell.y + data.cell.height);
      } else if (data.section === 'body') {
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.1);
        doc.line(data.cell.x, data.cell.y + data.cell.height, data.cell.x + data.cell.width, data.cell.y + data.cell.height);
      }
    }
  });

  let finalY = doc.lastAutoTable.finalY + 10;

  if (summaryRows.length > 0) {
    autoTable(doc, {
      body: summaryRows,
      startY: finalY,
      theme: 'plain',
      styles: { fontSize: 10, fontStyle: 'bold', textColor: [40, 40, 40] }
    });
    finalY = doc.lastAutoTable.finalY + 10;
  }

  // --- FOOTER ---
  const pageHeight = doc.internal.pageSize.height;

  // Dark background bar at the bottom
  doc.setFillColor(35, 35, 35);
  doc.rect(0, pageHeight - 30, pageWidth, 30, 'F');
  
  // Decorative geometric shapes on left (cyan)
  doc.setFillColor(14, 165, 233);
  doc.triangle(0, pageHeight - 30, 60, pageHeight, 0, pageHeight, 'F');
  
  doc.setFillColor(2, 132, 199);
  doc.triangle(0, pageHeight - 15, 30, pageHeight, 0, pageHeight, 'F');

  // Contact Info
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  
  const textY = pageHeight - 16;
  
  // Contact Info Column 1
  doc.text("Contact Info", 70, textY - 4);
  doc.text("admin@connectfreelance.in", 70, textY + 6);
  
  // Column 2
  doc.text("+91 XXXXXXXX58", 120, textY + 6);
  
  // Column 3
  doc.text("Nashik, Maharashtra", 160, textY - 4);
  doc.text("connectfreelance.in", 160, textY + 6);

  doc.save(filename);
};
