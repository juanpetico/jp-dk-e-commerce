import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Order } from '../types';

interface ReportData {
    analytics: {
        totalSales: number;
        activeOrders: number;
        aov: number;
        lowStockCount: number;
    };
    categoryData: { name: string; value: number }[];
    dateRange: { from?: Date; to?: Date };
}

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);
};

const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' });
};

export const generateDashboardReport = async (data: ReportData): Promise<Blob> => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;

    // --- BRANDING & HEADER ---
    // Load logo
    try {
        const logoUrl = '/logo.png'; // Assuming logo is in public folder
        const img = new Image();
        img.src = logoUrl;
        await new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve; // Continue even if logo fails
        });

        // Add Logo (Top Left)
        doc.addImage(img, 'PNG', margin, 15, 30, 10); // Adjust size/aspect ratio as needed
    } catch (e) {
        console.warn("Could not load logo for report", e);
    }

    // Title & Date (Top Right/Center)
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('REPORTE DE VENTAS', pageWidth - margin, 25, { align: 'right' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const rangeText = `Período: ${data.dateRange.from ? formatDate(data.dateRange.from) : 'Inicio'} - ${data.dateRange.to ? formatDate(data.dateRange.to) : 'Hoy'}`;
    doc.text(rangeText, pageWidth - margin, 32, { align: 'right' });

    doc.line(margin, 40, pageWidth - margin, 40); // Divider

    // --- KPI SUMMARY SECTION ---
    let yPos = 55;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumen Ejecutivo', margin, yPos);

    yPos += 10;
    const kpiData = [
        ['Ventas Totales', formatPrice(data.analytics.totalSales)],
        ['Órdenes Activas', data.analytics.activeOrders.toString()],
        ['Ticket Promedio', formatPrice(data.analytics.aov)],
        ['Alerta Stock', data.analytics.lowStockCount.toString() + ' productos']
    ];

    autoTable(doc, {
        startY: yPos,
        head: [['Métrica', 'Valor']],
        body: kpiData,
        theme: 'grid',
        headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontStyle: 'bold' }, // Black headers matching site theme
        styles: { fontSize: 11, cellPadding: 4 },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 80 },
            1: { halign: 'right' }
        },
        margin: { left: margin, right: margin }
    });

    // @ts-ignore
    yPos = doc.lastAutoTable.finalY + 20;

    // --- CATEGORY SALES SECTION ---
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Desempeño por Categoría', margin, yPos);

    yPos += 10;
    const categoryRows = data.categoryData.map(d => [
        d.name,
        d.value.toString(),
        `${((d.value / data.categoryData.reduce((acc, c) => acc + c.value, 0)) * 100).toFixed(1)}%`
    ]);

    autoTable(doc, {
        startY: yPos,
        head: [['Categoría', 'Unidades Vendidas', 'Participación']],
        body: categoryRows,
        theme: 'striped',
        headStyles: { fillColor: [60, 60, 60], textColor: [255, 255, 255] }, // Dark grey for secondary header
        styles: { fontSize: 10, cellPadding: 3 },
        columnStyles: {
            1: { halign: 'right' },
            2: { halign: 'right' }
        },
        margin: { left: margin, right: margin }
    });

    // --- FOOTER ---
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Generado el ${new Date().toLocaleDateString('es-CL')} | JP DK Admin Dashboard`, margin, doc.internal.pageSize.height - 10);
        doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin, doc.internal.pageSize.height - 10, { align: 'right' });
    }

    return doc.output('blob');
};
