import { emailService } from "../email.service.js";
import { buildVipRewardEmail } from "../templates/vip-reward.template.js";
import type { VipRewardEmailData } from "../email.types.js";

export const sendVipRewardEmail = async (data: VipRewardEmailData): Promise<void> => {
    const html = buildVipRewardEmail(data);
    await emailService.send({
        to: data.userEmail,
        subject: "¡Eres VIP en JP DK! 🌟",
        html,
    });
};
