import { emailService } from "../email.service.js";
import { buildAbandonedCartEmail } from "../templates/abandoned-cart.template.js";
import type { AbandonedCartEmailData } from "../email.types.js";

export const sendAbandonedCartEmail = async (data: AbandonedCartEmailData): Promise<void> => {
    const html = buildAbandonedCartEmail(data);
    await emailService.send({
        to: data.userEmail,
        subject: "Tu carrito te espera en JP DK 🛒",
        html,
    });
};
