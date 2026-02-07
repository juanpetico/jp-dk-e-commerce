import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Order } from '../types';

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);
};

const formatDate = (dateStr: string) => {
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
        return dateStr;
    }
};

export const generateOrderPDF = async (order: Order) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;

    // --- BRANDING & HEADER ---
    try {
        const img = new Image();
        img.src = '/logo.png';
        await new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
        });
        doc.addImage(img, 'PNG', margin, 15, 30, 10);
    } catch (e) {
        console.warn("Could not load logo", e);
    }

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('BOLETA DE VENTA', pageWidth - margin, 25, { align: 'right' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Pedido #${order.id}`, pageWidth - margin, 32, { align: 'right' });
    doc.text(`Fecha: ${formatDate(order.createdAt || order.date)}`, pageWidth - margin, 37, { align: 'right' });

    doc.line(margin, 45, pageWidth - margin, 45);

    // --- CUSTOMER & SHIPPING INFO ---
    let yPos = 55;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Información del Cliente', margin, yPos);
    doc.text('Envío', pageWidth / 2, yPos);

    yPos += 7;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    // Billing Info (Customer)
    const billing = order.billingAddress;
    let billingY = yPos;

    doc.text(`${billing.name}`, margin, billingY);
    billingY += 5;

    if (order.billingCompany || billing.company) {
        doc.text(`${order.billingCompany || billing.company}`, margin, billingY);
        billingY += 5;
    }

    doc.text(`RUT: ${billing.rut || 'N/A'}`, margin, billingY);
    billingY += 5;
    doc.text(`${billing.street}`, margin, billingY);
    billingY += 5;
    doc.text(`${billing.comuna}, ${billing.region}`, margin, billingY);
    billingY += 5;
    doc.text(`Tel: ${billing.phone}`, margin, billingY);

    // Shipping Info
    const shipping = order.shippingAddress;
    doc.text(`${shipping.name}`, pageWidth / 2, yPos);
    doc.text(`${shipping.street}`, pageWidth / 2, yPos + 5);
    doc.text(`${shipping.comuna}, ${shipping.region}`, pageWidth / 2, yPos + 10);
    doc.text(`Tel: ${shipping.phone}`, pageWidth / 2, yPos + 15);

    yPos += 30;
    doc.line(margin, yPos, pageWidth - margin, yPos);

    // --- ITEMS TABLE ---
    yPos += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Detalle de Productos', margin, yPos);

    yPos += 5;
    const tableData = order.items.map(item => [
        item.product.name,
        item.size,
        item.quantity.toString(),
        formatPrice(item.price),
        formatPrice(item.price * item.quantity)
    ]);

    autoTable(doc, {
        startY: yPos,
        head: [['Producto', 'Talla', 'Cant.', 'Precio Unit.', 'Subtotal']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
        styles: { fontSize: 9 },
        columnStyles: {
            2: { halign: 'center' },
            3: { halign: 'right' },
            4: { halign: 'right' }
        },
        margin: { left: margin, right: margin }
    });

    // --- TOTALS ---
    // @ts-ignore
    yPos = doc.lastAutoTable.finalY + 10;

    const totalsX = pageWidth - margin;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    doc.text('Subtotal:', totalsX - 40, yPos);
    doc.text(formatPrice(order.subtotal || (order.total - order.shippingCost)), totalsX, yPos, { align: 'right' });

    yPos += 6;
    doc.text('Envío:', totalsX - 40, yPos);
    doc.text(formatPrice(order.shippingCost), totalsX, yPos, { align: 'right' });

    if (order.taxes > 0) {
        yPos += 6;
        doc.text(`Impuestos (${(order.taxRate * 100).toFixed(0)}%):`, totalsX - 40, yPos);
        doc.text(formatPrice(order.taxes), totalsX, yPos, { align: 'right' });
    }

    yPos += 10;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', totalsX - 40, yPos);
    doc.text(formatPrice(order.total), totalsX, yPos, { align: 'right' });

    // --- FOOTER ---
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Gracias por su compra en JP DK. Este documento es un comprobante de su pedido.`, margin, doc.internal.pageSize.height - 15);
        doc.text(`JP DK - Moda Urbana | www.jpdk.cl`, margin, doc.internal.pageSize.height - 10);
        doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin, doc.internal.pageSize.height - 10, { align: 'right' });
    }

    doc.save(`Pedido-${order.id}.pdf`);
};
