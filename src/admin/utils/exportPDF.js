import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * exportTableToPDF
 *
 * @param {object} options
 * @param {string}   options.title        - Page title (e.g. "Admin Activity Logs")
 * @param {string}   options.subtitle     - Optional subtitle / filter summary
 * @param {string[]} options.columns      - Column header labels
 * @param {Array[]}  options.rows         - 2-D array of cell values (strings)
 * @param {string}   options.filename     - Output filename without extension
 * @param {object}   [options.filters]    - Key/value pairs shown in the filter summary block
 */
export function exportTableToPDF({ title, subtitle, columns, rows, filename, filters }) {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

    const pageW = doc.internal.pageSize.getWidth();
    const now = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

    // ── Header bar ────────────────────────────────────────────
    doc.setFillColor(30, 41, 59); // slate-800
    doc.rect(0, 0, pageW, 52, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 32, 32);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(180, 190, 210);
    doc.text(`Generated: ${now}`, pageW - 32, 32, { align: 'right' });

    // ── Filter summary ────────────────────────────────────────
    let yOffset = 68;

    if (filters && Object.keys(filters).length > 0) {
        const filterText = Object.entries(filters)
            .filter(([, v]) => v && v !== '')
            .map(([k, v]) => `${k}: ${v}`)
            .join('   |   ');

        if (filterText) {
            doc.setFillColor(241, 245, 249); // slate-100
            doc.roundedRect(32, yOffset - 12, pageW - 64, 22, 4, 4, 'F');
            doc.setTextColor(71, 85, 105); // slate-600
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.text(`Filters applied — ${filterText}`, 40, yOffset + 2);
            yOffset += 30;
        }
    }

    if (subtitle) {
        doc.setTextColor(100, 116, 139);
        doc.setFontSize(9);
        doc.text(subtitle, 32, yOffset);
        yOffset += 16;
    }

    // ── Table ─────────────────────────────────────────────────
    autoTable(doc, {
        startY: yOffset,
        head: [columns],
        body: rows,
        margin: { left: 32, right: 32 },
        styles: {
            fontSize: 8,
            cellPadding: 6,
            textColor: [30, 41, 59],
            lineColor: [226, 232, 240],
            lineWidth: 0.5,
        },
        headStyles: {
            fillColor: [30, 41, 59],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 8,
        },
        alternateRowStyles: {
            fillColor: [248, 250, 252],
        },
        rowStyles: {
            fillColor: [255, 255, 255],
        },
        didDrawPage: (data) => {
            // Footer on every page
            const pageCount = doc.internal.getNumberOfPages();
            doc.setFontSize(7);
            doc.setTextColor(148, 163, 184);
            doc.text(
                `Page ${data.pageNumber} of ${pageCount}  ·  Connect Admin Panel`,
                pageW / 2,
                doc.internal.pageSize.getHeight() - 16,
                { align: 'center' }
            );
        },
    });

    doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
}
