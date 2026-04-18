import { emailService } from "../email.service.js";
import { buildPasswordResetEmail } from "../templates/password-reset.template.js";
import type { PasswordResetEmailData } from "../email.types.js";

export const sendPasswordResetEmail = async (data: PasswordResetEmailData): Promise<void> => {
    const html = buildPasswordResetEmail(data);
    await emailService.send({
        to: data.userEmail,
        subject: "Restablece tu contraseña — JP DK",
        html,
    });
};
