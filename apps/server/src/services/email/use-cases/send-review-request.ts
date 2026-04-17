import { emailService } from "../email.service.js";
import { buildReviewRequestEmail } from "../templates/review-request.template.js";
import type { ReviewRequestEmailData } from "../email.types.js";

export const sendReviewRequestEmail = async (data: ReviewRequestEmailData): Promise<void> => {
    const html = buildReviewRequestEmail(data);
    await emailService.send({
        to: data.userEmail,
        subject: "¿Qué te pareció tu compra en JP DK?",
        html,
    });
};
