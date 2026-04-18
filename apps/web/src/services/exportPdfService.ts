import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type PdfValue = string | number | boolean | null | undefined;

export type PdfRow = Record<string, PdfValue>;

const buildFileName = (baseName: string) => {
    const date = new Date().toISOString().split('T')[0];
    return `${baseName}_${date}.pdf`;
};

const normalizeCell = (value: PdfValue) => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? 'Si' : 'No';
    return String(value);
};

export const exportRowsToPdf = (
    rows: PdfRow[],
    options: {
        fileNameBase: string;
        title: string;
        columns?: string[];
    }
) => {
    const doc = new jsPDF({ orientation: 'landscape' });
    const margin = 14;
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(options.title, margin, 16);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generado: ${new Date().toLocaleString('es-CL')}`, margin, 22);
    doc.text(`Registros: ${rows.length}`, pageWidth - margin, 22, { align: 'right' });

    const columns = options.columns || (rows[0] ? Object.keys(rows[0]) : []);
    const body = rows.map((row) => columns.map((column) => normalizeCell(row[column])));

    autoTable(doc, {
        startY: 28,
        head: [columns],
        body,
        styles: {
            fontSize: 8,
            cellPadding: 2,
            overflow: 'linebreak',
        },
        headStyles: {
            fillColor: [20, 20, 20],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
        },
        margin: { left: margin, right: margin },
    });

    doc.save(buildFileName(options.fileNameBase));
};
