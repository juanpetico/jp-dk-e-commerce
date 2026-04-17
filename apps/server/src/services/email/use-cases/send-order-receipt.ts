import { emailService } from "../email.service.js";
import { buildOrderReceiptEmail } from "../templates/order-receipt.template.js";
import type { OrderReceiptEmailData } from "../email.types.js";

export const sendOrderReceiptEmail = async (data: OrderReceiptEmailData): Promise<void> => {
    const shortId = data.orderId.slice(-8).toUpperCase();
    const html = buildOrderReceiptEmail(data);
    await emailService.sendSilent({
        to: data.customerEmail,
        subject: `Confirmación de pedido #${shortId} — JP DK`,
        html,
    });
};
